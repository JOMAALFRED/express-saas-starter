const { verifyToken }  = require('../services/tokenService');
const { User, Tenant } = require('../models');

// Vérifie le JWT et injecte req.user
async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  try {
    const payload = verifyToken(token);
    const user    = await User.findByPk(payload.user_id, {
      include: [{ model: Tenant, as: 'tenant' }],
    });
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Utilisateur inactif ou introuvable' });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

// Vérifie le rôle minimum requis
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: `Rôle requis : ${roles.join(' ou ')}` });
    }
    next();
  };
}

// Vérifie que l'abonnement n'est pas expiré
async function requireActiveSubscription(req, res, next) {
  const { getSubscriptionStatus } = require('../services/subscriptionService');
  const sub = await getSubscriptionStatus(req.user.tenant_id);
  if (!sub || sub.status === 'expired' || sub.status === 'cancelled') {
    return res.status(402).json({ error: 'Abonnement expiré ou inactif' });
  }
  req.subscription = sub;
  next();
}

module.exports = { authenticate, requireRole, requireActiveSubscription };
