/* eslint-disable no-undef */
(function initLicenseCrypto(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('crypto'));
  } else {
    root.MastilLicenseCrypto = factory(null);
  }
})(typeof globalThis !== 'undefined' ? globalThis : window, function factory(cryptoModule) {
  function base64Url(input) {
    const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
    return buffer.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  function fromBase64Url(input) {
    const padded = input + '='.repeat((4 - (input.length % 4)) % 4);
    return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  }

  function sign(payload, secret) {
    if (!secret) throw new Error('Missing license secret.');
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = base64Url(JSON.stringify(header));
    const encodedPayload = base64Url(JSON.stringify(payload));
    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = cryptoModule.createHmac('sha256', secret).update(data).digest();
    return `${data}.${base64Url(signature)}`;
  }

  function verify(token, secret) {
    if (!secret) throw new Error('Missing license secret.');
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;
    const expected = base64Url(cryptoModule.createHmac('sha256', secret).update(data).digest());

    const left = Buffer.from(encodedSignature);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !cryptoModule.timingSafeEqual(left, right)) return null;

    const payload = JSON.parse(fromBase64Url(encodedPayload).toString('utf8'));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  }

  return { sign, verify };
});
