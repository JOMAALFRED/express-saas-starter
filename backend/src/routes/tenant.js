const router  = require('express').Router();
const bcrypt  = require('bcrypt');
const { Tenant, User, Subscription, Plan } = require('../models');
const { authenticate, requireRole }        = require('../middleware/auth');
const { createTrialSubscription }          = require('../services/subscriptionService');
const { sendWelcome }                      = require('../services/emailService');

// POST /api/tenant/register — inscription d'un nouveau tenant
router.post('/register', async (req, res) => {
  const { tenantName, adminName, email, password } = req.body;
  if (!tenantName || !adminName || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  // Générer un slug unique depuis le nom
  const slug = tenantName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

  const t = await require('../config/database').transaction();
  try {
    const tenant = await Tenant.create({ name: tenantName, slug, email }, { transaction: t });
    const hash   = await bcrypt.hash(password, 12);
    await User.create({
      name: adminName, email: email.toLowerCase(),
      password_hash: hash, role: 'admin', tenant_id: tenant.id,
    }, { transaction: t });

    await createTrialSubscription(tenant.id);
    await t.commit();

    sendWelcome(tenant).catch(console.error);
    res.status(201).json({ ok: true, slug: tenant.slug });
  } catch (err) {
    await t.rollback();
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Nom de tenant ou email déjà utilisé' });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tenant/me
router.get('/me', authenticate, async (req, res) => {
  const tenant = await Tenant.findByPk(req.user.tenant_id, {
    include: [{ model: Subscription, as: 'subscription', include: [{ model: Plan, as: 'plan' }] }],
  });
  res.json(tenant);
});

// PATCH /api/tenant/settings
router.patch('/settings', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  const { name, settings } = req.body;
  const tenant = await Tenant.findByPk(req.user.tenant_id);
  await tenant.update({ name: name || tenant.name, settings: settings || tenant.settings });
  res.json(tenant);
});

// GET /api/tenant/users
router.get('/users', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  const users = await User.findAll({
    where:      { tenant_id: req.user.tenant_id },
    attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at'],
  });
  res.json(users);
});

// POST /api/tenant/users — inviter un utilisateur
router.post('/users', authenticate, requireRole('admin', 'superadmin'), async (req, res) => {
  const { name, email, role, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Champs requis manquants' });

  try {
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name, email: email.toLowerCase(), password_hash: hash,
      role: role || 'user', tenant_id: req.user.tenant_id,
    });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
