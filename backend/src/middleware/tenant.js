const { Tenant } = require('../models');

// Injecte req.tenant depuis le header X-Tenant-Slug ou le JWT
async function injectTenant(req, res, next) {
  const slug = req.headers['x-tenant-slug'] || req.user?.tenant?.slug;
  if (!slug) return res.status(400).json({ error: 'Tenant non identifié' });

  const tenant = await Tenant.findOne({ where: { slug, is_active: true } });
  if (!tenant) return res.status(404).json({ error: 'Tenant introuvable' });

  req.tenant = tenant;
  next();
}

module.exports = { injectTenant };
