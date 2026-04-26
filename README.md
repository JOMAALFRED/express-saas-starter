# express-saas-starter

> Production-ready SaaS boilerplate — Multi-tenancy · JWT dual-token · RBAC 3 niveaux · Trial subscriptions

[![Node](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![Sequelize](https://img.shields.io/badge/Sequelize-6-52B0E7?logo=sequelize)](https://sequelize.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Features

| Feature | Détail |
|---|---|
| **Multi-tenancy** | Chaque tenant a son propre espace isolé |
| **JWT dual-token** | access (15min) + refresh (7j) avec rotation |
| **RBAC 3 niveaux** | `superadmin` · `admin` · `user` |
| **Trial auto** | 14 jours d'essai à l'inscription |
| **Subscriptions** | Plans Free / Starter / Pro — extensible Stripe |
| **Email** | Nodemailer (welcome, trial expiring) |
| **SuperAdmin** | Dashboard global : tenants, plans, stats |
| **Sequelize** | ORM + sync auto en dev |

## Démarrage rapide

```bash
git clone https://github.com/JOMAALFRED/express-saas-starter.git
cd express-saas-starter
docker compose up -d
```

- Frontend : http://localhost:5173
- Backend  : http://localhost:3000
- API docs : http://localhost:3000/api/health

## Sans Docker

```bash
# Backend
cd backend
cp .env.example .env   # adapter DATABASE_URL
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev
```

## Flow principal

```
1. POST /api/tenant/register  → crée tenant + admin + trial 14j
2. POST /api/auth/login       → accessToken (15min) + refreshToken (7j)
3. POST /api/auth/refresh     → rotation automatique du token
4. GET  /api/billing/subscription → statut trial/active/expired
5. POST /api/billing/activate → passer sur un plan payant
```

## RBAC

| Route | user | admin | superadmin |
|---|---|---|---|
| GET /api/auth/me | ✅ | ✅ | ✅ |
| GET /api/tenant/users | ❌ | ✅ | ✅ |
| POST /api/tenant/users | ❌ | ✅ | ✅ |
| GET /api/superadmin/tenants | ❌ | ❌ | ✅ |
| POST /api/superadmin/plans | ❌ | ❌ | ✅ |

## Créer un SuperAdmin

```bash
# Via psql
docker compose exec postgres psql -U saas saas_db \
  -c "UPDATE users SET role = 'superadmin' WHERE email = 'ton@email.com';"
```

## Structure

```
express-saas-starter/
├── backend/
│   └── src/
│       ├── config/       database, jwt
│       ├── models/       Tenant, User, Plan, Subscription, AuditLog
│       ├── middleware/   auth (JWT), requireRole, requireActiveSubscription
│       ├── routes/       auth, tenant, billing, superadmin
│       └── services/     tokenService, emailService, subscriptionService
├── frontend/
│   └── src/
│       ├── api/          axios (dual-token refresh auto)
│       ├── store/        Zustand (authStore)
│       ├── pages/        Login, Register, Dashboard
│       └── pages/superadmin/  TenantsPage
└── docker-compose.yml
```

## Roadmap

- [ ] Webhook Stripe / PayDunya
- [ ] 2FA TOTP
- [ ] API rate limiting (express-rate-limit)
- [ ] Audit log UI
- [ ] Mobile app React Native (Expo)

## Licence

MIT — Joma Alfred Moustaki
