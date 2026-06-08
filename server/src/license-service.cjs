const crypto = require('crypto');
const { sign, verify } = require('../../src/shared/license-crypto.cjs');

function nowIso() {
  return new Date().toISOString();
}

function id(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

function chunk(input, size) {
  return input.match(new RegExp(`.{1,${size}}`, 'g')).join('-');
}

function createLicenseKey() {
  const raw = crypto.randomBytes(12).toString('hex').toUpperCase();
  return `MASTIL-${chunk(raw, 4)}`;
}

function createLicenseService(db, config) {
  function createLicense({ email, source = 'admin', stripeSessionId = null }) {
    const license = {
      id: id('lic'),
      licenseKey: createLicenseKey(),
      email: String(email || '').trim().toLowerCase(),
      status: 'active',
      source,
      stripeSessionId,
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    if (!license.email) throw new Error('E-Mail fehlt.');
    db.run(
      `INSERT INTO licenses (id, licenseKey, email, status, source, stripeSessionId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [license.id, license.licenseKey, license.email, license.status, license.source, license.stripeSessionId, license.createdAt, license.updatedAt]
    );
    return license;
  }

  function activate({ email, licenseKey, deviceId }) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedKey = String(licenseKey || '').trim().toUpperCase();
    if (!normalizedEmail || !normalizedKey || !deviceId) throw new Error('E-Mail, Lizenzcode und Gerät sind erforderlich.');

    const license = db.get(
      'SELECT * FROM licenses WHERE licenseKey = ? AND lower(email) = ?',
      [normalizedKey, normalizedEmail]
    );
    if (!license) throw new Error('Lizenz wurde nicht gefunden.');
    if (license.status !== 'active') throw new Error('Lizenz ist gesperrt oder nicht aktiv.');

    const activation = db.get(
      'SELECT * FROM activations WHERE licenseId = ? AND deviceId = ?',
      [license.id, deviceId]
    );
    const stamp = nowIso();
    if (activation) {
      db.run('UPDATE activations SET lastSeenAt = ? WHERE id = ?', [stamp, activation.id]);
    } else {
      db.run(
        'INSERT INTO activations (id, licenseId, deviceId, email, createdAt, lastSeenAt) VALUES (?, ?, ?, ?, ?, ?)',
        [id('act'), license.id, deviceId, normalizedEmail, stamp, stamp]
      );
    }

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
    const token = sign({
      sub: license.id,
      email: normalizedEmail,
      deviceId,
      licensed: true,
      exp
    }, config.licenseSecret);

    return {
      token,
      email: normalizedEmail,
      licenseKey: license.licenseKey,
      expiresAt: new Date(exp * 1000).toISOString()
    };
  }

  function statusFromToken(token) {
    const payload = verify(token, config.licenseSecret);
    if (!payload) return { active: false };
    const license = db.get('SELECT * FROM licenses WHERE id = ?', [payload.sub]);
    if (!license || license.status !== 'active') return { active: false };
    return { active: true, payload };
  }

  function listLicenses(query = '') {
    const like = `%${String(query || '').trim().toLowerCase()}%`;
    return db.all(
      `SELECT l.*, COUNT(a.id) AS activationCount
       FROM licenses l
       LEFT JOIN activations a ON a.licenseId = l.id
       WHERE lower(l.email) LIKE ? OR lower(l.licenseKey) LIKE ?
       GROUP BY l.id
       ORDER BY l.createdAt DESC
       LIMIT 100`,
      [like, like]
    );
  }

  function revoke(idValue) {
    db.run('UPDATE licenses SET status = ?, updatedAt = ? WHERE id = ?', ['revoked', nowIso(), idValue]);
    return true;
  }

  return {
    createLicense,
    activate,
    statusFromToken,
    listLicenses,
    revoke
  };
}

module.exports = { createLicenseService };
