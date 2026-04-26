const router = require('express').Router();
const { Tenant, User, Subscription, Plan, AuditLog } = require('../models');
const { authenticate, requireRole } = require('../middleware/auth');

const guard = [authenticate, requireRole('superadmin')];

// GET /api/superadmin/stats
router.get('/stats', ...guard, async (req, res) => {
  const [tenants, users, subs] = await Promise.all([
    Tenant.count(),
    User.count(),
    Subscription.findAll({ attributes: ['status',
      [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']],
      group: ['status'] }),
  ]);
  res.json({ tenants, users, subscriptions: subs });
});

// GET /api/superadmin/tenants
router.get('/tenants', ...guard, async (req, res) => {
  const tenants = await Tenant.findAll({
    include: [
      { model: Subscription, as: 'subscription', include: [{ model: Plan, as: 'plan' }] },
    ],
    order: [['created_at', 'DESC']],
  });
  res.json(tenants);
});

// PATCH /api/superadmin/tenants/:id/toggle
router.patch('/tenants/:id/toggle', ...guard, async (req, res) => {
  const tenant = await Tenant.findByPk(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant introuvable' });
  await tenant.update({ is_active: !tenant.is_active });
  res.json({ ok: true, is_active: tenant.is_active });
});

// GET /api/superadmin/plans
router.get('/plans', ...guard, async (req, res) => {
  res.json(await Plan.findAll({ order: [['price', 'ASC']] }));
});

// POST /api/superadmin/plans
router.post('/plans', ...guard, async (req, res) => {
  const { name, price, max_users, features } = req.body;
  const plan = await Plan.create({ name, price, max_users, features });
  res.status(201).json(plan);
});

// PATCH /api/superadmin/plans/:id
router.patch('/plans/:id', ...guard, async (req, res) => {
  const plan = await Plan.findByPk(req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan introuvable' });
  await plan.update(req.body);
  res.json(plan);
});

module.exports = router;
