const { jwtVerify } = require('jose');

module.exports = async function handler(req, res) {
  const cookieHeader = req.headers.cookie || '';
  const token = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/)?.[1];

  if (!token) return res.status(401).json({ ok: false });

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    res.json({ ok: true });
  } catch {
    res.status(401).json({ ok: false });
  }
};
