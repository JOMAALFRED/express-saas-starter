module.exports = {
  secret:          process.env.JWT_SECRET || 'dev_secret',
  accessExpiry:    process.env.JWT_ACCESS_EXPIRY  || '15m',
  refreshExpiry:   process.env.JWT_REFRESH_EXPIRY || '7d',
};
