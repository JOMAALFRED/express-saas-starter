const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function send({ to, subject, html }) {
  if (!process.env.SMTP_USER) {
    console.log(`[EMAIL stub] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'noreply@saas.local',
    to, subject, html,
  });
}

module.exports = {
  sendWelcome: (tenant) => send({
    to: tenant.email,
    subject: 'Bienvenue sur la plateforme !',
    html: `<h2>Bonjour ${tenant.name},</h2>
           <p>Votre espace est prêt. Votre essai gratuit de ${process.env.TRIAL_DAYS || 14} jours commence maintenant.</p>`,
  }),

  sendTrialExpiring: (tenant, daysLeft) => send({
    to: tenant.email,
    subject: `Votre essai expire dans ${daysLeft} jour(s)`,
    html: `<p>Bonjour ${tenant.name}, votre période d'essai se termine dans <strong>${daysLeft} jour(s)</strong>.</p>`,
  }),

  sendTrialExpired: (tenant) => send({
    to: tenant.email,
    subject: 'Votre essai a expiré',
    html: `<p>Bonjour ${tenant.name}, votre période d'essai est terminée. Abonnez-vous pour continuer.</p>`,
  }),
};
