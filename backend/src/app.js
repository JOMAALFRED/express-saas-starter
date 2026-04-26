require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const { sequelize } = require('./models');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/tenant',     require('./routes/tenant'));
app.use('/api/billing',    require('./routes/billing'));
app.use('/api/superadmin', require('./routes/superadmin'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

// Sync DB + démarrage
async function start() {
  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  console.log('[DB] Sync OK');

  // Seed des plans par défaut si absents
  const { Plan } = require('./models');
  const count = await Plan.count();
  if (count === 0) {
    await Plan.bulkCreate([
      { name: 'Free',       price: 0,    max_users: 2,  features: ['basic'] },
      { name: 'Starter',    price: 9.99, max_users: 5,  features: ['basic', 'reports'] },
      { name: 'Pro',        price: 29.99,max_users: 20, features: ['basic', 'reports', 'api', 'support'] },
    ]);
    console.log('[DB] Plans créés');
  }

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`[APP] http://localhost:${PORT}`));
}

start().catch((e) => { console.error(e); process.exit(1); });
