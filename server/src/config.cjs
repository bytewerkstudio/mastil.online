const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  port: Number(process.env.PORT || 3787),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:3787',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3787',
  licenseSecret: process.env.LICENSE_SECRET || (isProduction ? '' : 'dev-license-secret-change-me'),
  adminToken: process.env.ADMIN_TOKEN || (isProduction ? '' : 'dev-admin-token'),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  stripePriceEurCents: Number(process.env.STRIPE_PRICE_EUR_CENTS || 1099),
  stripeCurrency: process.env.STRIPE_CURRENCY || 'eur',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'MASTIL <licenses@mastil.local>'
  },
  dbPath: process.env.DB_PATH || path.join(__dirname, '../data/mastil.sqlite')
};
