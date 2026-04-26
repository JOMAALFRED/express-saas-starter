const router = require('express').Router();
const { Plan } = require('../models');
const { authenticate }           = require('../middleware/auth');
const { getSubscriptionStatus, activateSubscription } = require('../services/subscriptionService');

// GET /api/billing/subscription
router.get('/subscription', authenticate, async (req, res) => {
  const sub = await getSubscriptionStatus(req.user.tenant_id);
  res.json(sub);
});

// GET /api/billing/plans
router.get('/plans', async (req, res) => {
  const plans = await Plan.findAll({ where: { is_active: true }, order: [['price', 'ASC']] });
  res.json(plans);
});

// POST /api/billing/activate — simuler l'activation d'un plan
// (Remplacer par un vrai webhook Stripe/PayDunya en production)
router.post('/activate', authenticate, async (req, res) => {
  const { plan_id } = req.body;
  if (!plan_id) return res.status(400).json({ error: 'plan_id requis' });

  const plan = await Plan.findByPk(plan_id);
  if (!plan) return res.status(404).json({ error: 'Plan introuvable' });

  const sub = await activateSubscription(req.user.tenant_id, plan_id);
  res.json({ ok: true, status: sub.status, plan: plan.name });
});

module.exports = router;
