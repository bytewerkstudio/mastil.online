const nodemailer = require('nodemailer');

function createMailer(config) {
  const enabled = Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);
  const transporter = enabled
    ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
      }
    })
    : null;

  async function sendLicenseEmail(license) {
    if (!enabled) {
      console.log(`[MAIL disabled] License for ${license.email}: ${license.licenseKey}`);
      return { sent: false, reason: 'smtp-not-configured' };
    }

    await transporter.sendMail({
      from: config.smtp.from,
      to: license.email,
      subject: 'Deine MASTIL Lizenz',
      text: [
        'Danke fuer den Kauf von MASTIL.',
        '',
        `Lizenzcode: ${license.licenseKey}`,
        '',
        'Oeffne MASTIL, waehle "Lizenz aktivieren" und trage diese E-Mail sowie den Lizenzcode ein.'
      ].join('\n')
    });
    return { sent: true };
  }

  return { sendLicenseEmail };
}

module.exports = { createMailer };
