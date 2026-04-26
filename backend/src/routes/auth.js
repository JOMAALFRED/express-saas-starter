const router  = require('express').Router();
const bcrypt  = require('bcrypt');
const { User }         = require('../models');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../services/tokenService');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email et password requis' });

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user || !user.is_active) return res.status(401).json({ error: 'Identifiants incorrects' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Identifiants incorrects' });

  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  await user.update({ refresh_token: refreshToken });

  res.json({ accessToken, refreshToken, role: user.role, name: user.name });
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken requis' });

  try {
    const payload = verifyToken(refreshToken);
    const user    = await User.findByPk(payload.user_id);
    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({ error: 'Refresh token invalide' });
    }
    const newAccess  = generateAccessToken(user);
    const newRefresh = generateRefreshToken(user);
    await user.update({ refresh_token: newRefresh });
    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch {
    res.status(401).json({ error: 'Refresh token expiré' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  await req.user.update({ refresh_token: null });
  res.json({ ok: true });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const { id, name, email, role, tenant_id } = req.user;
  res.json({ id, name, email, role, tenant_id });
});

module.exports = router;
