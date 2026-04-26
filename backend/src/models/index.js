const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

// ── Tenant ────────────────────────────────────────────────────
const Tenant = sequelize.define('Tenant', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:     { type: DataTypes.STRING, allowNull: false },
  slug:     { type: DataTypes.STRING, allowNull: false, unique: true },
  email:    { type: DataTypes.STRING, allowNull: false },
  settings: { type: DataTypes.JSONB, defaultValue: {} },
  is_active:{ type: DataTypes.BOOLEAN, defaultValue: true },
});

// ── Plan ──────────────────────────────────────────────────────
const Plan = sequelize.define('Plan', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:        { type: DataTypes.STRING, allowNull: false },
  price:       { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  max_users:   { type: DataTypes.INTEGER, defaultValue: 5 },
  features:    { type: DataTypes.JSONB, defaultValue: [] },
  is_active:   { type: DataTypes.BOOLEAN, defaultValue: true },
});

// ── Subscription ──────────────────────────────────────────────
const Subscription = sequelize.define('Subscription', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  status:     {
    type: DataTypes.ENUM('trial', 'active', 'expired', 'cancelled'),
    defaultValue: 'trial',
  },
  trial_ends_at:  { type: DataTypes.DATE },
  current_period_start: { type: DataTypes.DATE },
  current_period_end:   { type: DataTypes.DATE },
  cancelled_at:  { type: DataTypes.DATE },
});

// ── User ──────────────────────────────────────────────────────
const User = sequelize.define('User', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:          { type: DataTypes.STRING, allowNull: false },
  email:         { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role:          {
    type: DataTypes.ENUM('superadmin', 'admin', 'user'),
    defaultValue: 'user',
  },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  refresh_token: { type: DataTypes.TEXT },
});

// ── AuditLog ──────────────────────────────────────────────────
const AuditLog = sequelize.define('AuditLog', {
  id:      { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  action:  { type: DataTypes.STRING, allowNull: false },
  entity:  { type: DataTypes.STRING },
  payload: { type: DataTypes.JSONB, defaultValue: {} },
  ip:      { type: DataTypes.STRING },
});

// ── Associations ──────────────────────────────────────────────
Tenant.hasMany(User,         { foreignKey: 'tenant_id', as: 'users' });
User.belongsTo(Tenant,       { foreignKey: 'tenant_id', as: 'tenant' });

Tenant.hasOne(Subscription,  { foreignKey: 'tenant_id', as: 'subscription' });
Subscription.belongsTo(Tenant, { foreignKey: 'tenant_id' });

Plan.hasMany(Subscription,   { foreignKey: 'plan_id' });
Subscription.belongsTo(Plan, { foreignKey: 'plan_id', as: 'plan' });

Tenant.hasMany(AuditLog,     { foreignKey: 'tenant_id' });
User.hasMany(AuditLog,       { foreignKey: 'user_id' });

module.exports = { sequelize, Tenant, Plan, Subscription, User, AuditLog };
