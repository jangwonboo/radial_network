const { jwtVerify, SignJWT } = require('jose');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { otp, otpToken } = req.body || {};
  if (!otp || !otpToken) return res.status(400).json({ error: 'Missing fields' });

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  let payload;
  try {
    ({ payload } = await jwtVerify(otpToken, secret));
  } catch {
    return res.status(401).json({ error: '코드가 만료됐습니다. 다시 시도해 주세요.' });
  }

  if (payload.otp !== otp.trim()) {
    return res.status(401).json({ error: '코드가 일치하지 않습니다.' });
  }

  const session = await new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret);

  res.setHeader(
    'Set-Cookie',
    `session=${session}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
  );
  res.json({ ok: true });
};
