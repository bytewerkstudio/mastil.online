const http = require('http');
const express = require('express');
const Stripe = require('stripe');
const { Server } = require('socket.io');
const config = require('./config.cjs');
const { createDb } = require('./db.cjs');
const { createLicenseService } = require('./license-service.cjs');
const { createOnlineRoomService } = require('./online-room-service.cjs');
const { createMailer } = require('./mailer.cjs');

function requireAdmin(req, res, next) {
  if (!config.adminToken) {
    res.status(503).json({ error: 'Admin token is not configured.' });
    return;
  }
  if (req.get('x-admin-token') !== config.adminToken) {
    res.status(401).json({ error: 'Admin token invalid.' });
    return;
  }
  next();
}

async function main() {
  if (!config.licenseSecret) {
    throw new Error('LICENSE_SECRET is required.');
  }

  const db = await createDb(config.dbPath);
  const licenses = createLicenseService(db, config);
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*'
    }
  });
  const rooms = createOnlineRoomService(io);
  const mailer = createMailer(config);
  const stripe = config.stripeSecretKey ? new Stripe(config.stripeSecretKey) : null;

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-admin-token,stripe-signature');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    if (!stripe || !config.stripeWebhookSecret) {
      res.status(503).json({ error: 'Stripe webhook is not configured.' });
      return;
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, req.get('stripe-signature'), config.stripeWebhookSecret);
    } catch (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const email = session.customer_details?.email || session.customer_email || session.metadata?.email;
      if (email) {
        try {
          const license = licenses.createLicense({
            email,
            source: 'stripe',
            stripeSessionId: session.id
          });
          mailer.sendLicenseEmail(license).catch((error) => {
            console.error('License email failed:', error);
          });
        } catch (error) {
          console.error('License creation after Stripe checkout failed:', error);
        }
      }
    }
    res.json({ received: true });
  });

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true, app: 'MASTIL Server' });
  });

  app.post('/api/checkout', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) {
      res.status(400).json({ error: 'E-Mail fehlt.' });
      return;
    }

    if (!stripe) {
      res.status(503).json({
        error: 'Stripe ist lokal noch nicht konfiguriert. Erzeuge Testlizenzen über die Admin-EXE.'
      });
      return;
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: config.stripeCurrency,
              product_data: { name: 'MASTIL Lizenz' },
              unit_amount: config.stripePriceEurCents
            },
            quantity: 1
          }
        ],
        metadata: { email },
        success_url: `${config.appBaseUrl}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.appBaseUrl}/purchase-cancelled`
      });
      res.json({ url: session.url });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/activate', (req, res) => {
    try {
      res.json(licenses.activate(req.body));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/license/status', (req, res) => {
    const token = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
    res.json(licenses.statusFromToken(token));
  });

  app.post('/api/admin/licenses', requireAdmin, (req, res) => {
    try {
      const license = licenses.createLicense(req.body);
      if (req.body.sendEmail === true) {
        mailer.sendLicenseEmail(license).catch((error) => {
          console.error('Manual license email failed:', error);
        });
      }
      res.json(license);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/admin/licenses', requireAdmin, (req, res) => {
    res.json({ licenses: licenses.listLicenses(req.query.query || '') });
  });

  app.post('/api/admin/licenses/:id/revoke', requireAdmin, (req, res) => {
    licenses.revoke(req.params.id);
    res.json({ ok: true });
  });

  io.on('connection', (socket) => rooms.register(socket));

  server.listen(config.port, () => {
    console.log(`MASTIL server listening at http://localhost:${config.port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
