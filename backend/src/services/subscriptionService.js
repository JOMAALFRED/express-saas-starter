const { Subscription, Plan } = require('../models');

const TRIAL_DAYS = parseInt(process.env.TRIAL_DAYS || '14');

async function createTrialSubscription(tenantId) {
  const freePlan = await Plan.findOne({ where: { name: 'Free' } });
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DAYS);

  return Subscription.create({
    tenant_id:     tenantId,
    plan_id:       freePlan?.id,
    status:        'trial',
    trial_ends_at: trialEnd,
    current_period_start: new Date(),
    current_period_end:   trialEnd,
  });
}

async function getSubscriptionStatus(tenantId) {
  const sub = await Subscription.findOne({
    where: { tenant_id: tenantId },
    include: [{ model: Plan, as: 'plan' }],
  });
  if (!sub) return null;

  // Auto-expiration trial
  if (sub.status === 'trial' && new Date() > new Date(sub.trial_ends_at)) {
    await sub.update({ status: 'expired' });
    sub.status = 'expired';
  }

  return sub;
}

async function activateSubscription(tenantId, planId) {
  const sub  = await Subscription.findOne({ where: { tenant_id: tenantId } });
  const now  = new Date();
  const end  = new Date();
  end.setMonth(end.getMonth() + 1);

  return (sub || Subscription.build({ tenant_id: tenantId })).update({
    plan_id:              planId,
    status:               'active',
    current_period_start: now,
    current_period_end:   end,
  });
}

module.exports = { createTrialSubscription, getSubscriptionStatus, activateSubscription };
