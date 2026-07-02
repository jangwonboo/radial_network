const { SignJWT } = require('jose');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email required' });

  const invited = (process.env.INVITED_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  if (!invited.includes(email.trim().toLowerCase())) {
    return res.status(200).json({ ok: true });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const otpToken = await new SignJWT({ email: email.trim().toLowerCase(), otp })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('10m')
    .sign(secret);

  const fromEmail = process.env.OTP_FROM_EMAIL || 'onboarding@resend.dev';

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: email.trim(),
      subject: 'Strategy House — 로그인 코드',
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px">
          <h2 style="color:#051C2C;margin-bottom:8px">로그인 코드</h2>
          <p style="color:#6b7d8a;margin-bottom:24px">아래 6자리 코드를 입력하세요. 10분간 유효합니다.</p>
          <div style="background:#f0f7fd;border-radius:8px;padding:20px;text-align:center">
            <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#051C2C">${otp}</span>
          </div>
          <p style="color:#6b7d8a;font-size:12px;margin-top:24px">본인이 요청하지 않은 경우 이 이메일을 무시하세요.</p>
        </div>
      `,
    }),
  });

  const resendBody = await resendRes.json();

  if (!resendRes.ok) {
    console.error('Resend error:', JSON.stringify(resendBody));
    return res.status(500).json({
      error: `이메일 발송 실패: ${resendBody.message || resendBody.name || JSON.stringify(resendBody)}`,
    });
  }

  res.json({ ok: true, otpToken });
};
