const express = require('express');
const bcrypt  = require('bcrypt');
const crypto  = require('crypto');
const { Resend } = require('resend');
const db      = require('../config/database');
const router  = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const FROM_EMAIL = 'onboarding@resend.dev';

// ══════════════════════════════════════
// EMAIL TEMPLATES
// ══════════════════════════════════════
const templateVerificacion = (nombre, link) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#161b27;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
    <div style="background:linear-gradient(135deg,#F5A623,#FF6B35);padding:32px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#0f1117;letter-spacing:-1px;">ManageX</div>
      <div style="font-size:13px;color:rgba(0,0,0,0.6);margin-top:4px;">Sistema de Gestión para Negocios</div>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#F0F4FF;font-size:20px;font-weight:700;margin:0 0 8px;">Hola, ${nombre} 👋</h2>
      <p style="color:#8892AA;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Gracias por registrarte en ManageX. Para activar tu cuenta y comenzar a gestionar tu negocio, 
        confirma tu dirección de correo electrónico.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${link}" style="background:linear-gradient(135deg,#F5A623,#FF6B35);color:#0f1117;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;display:inline-block;">
          ✓ Verificar mi correo
        </a>
      </div>
      <p style="color:#4A5568;font-size:12px;text-align:center;margin:0;">
        Este enlace expira en 24 horas. Si no creaste una cuenta, ignora este email.
      </p>
    </div>
    <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
      <p style="color:#4A5568;font-size:11px;margin:0;">© 2025 ManageX · Sistema de Gestión Profesional</p>
    </div>
  </div>
</body>
</html>
`;

const templateResetPassword = (nombre, link) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#161b27;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
    <div style="background:linear-gradient(135deg,#F5A623,#FF6B35);padding:32px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#0f1117;letter-spacing:-1px;">ManageX</div>
      <div style="font-size:13px;color:rgba(0,0,0,0.6);margin-top:4px;">Sistema de Gestión para Negocios</div>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#F0F4FF;font-size:20px;font-weight:700;margin:0 0 8px;">Hola, ${nombre} 🔐</h2>
      <p style="color:#8892AA;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta ManageX. 
        Si no fuiste tú, puedes ignorar este email con seguridad.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${link}" style="background:linear-gradient(135deg,#F5A623,#FF6B35);color:#0f1117;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;display:inline-block;">
          🔑 Restablecer contraseña
        </a>
      </div>
      <p style="color:#4A5568;font-size:12px;text-align:center;margin:0;">
        Este enlace expira en 1 hora por seguridad.
      </p>
    </div>
    <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
      <p style="color:#4A5568;font-size:11px;margin:0;">© 2025 ManageX · Sistema de Gestión Profesional</p>
    </div>
  </div>
</body>
</html>
`;

// POST /api/email/verificar-email
router.post('/verificar-email', async (req, res) => {
  try {
    const { email } = req.body;
    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ error: 'Email no encontrado' });

    const usuario = users[0];
    if (usuario.email_verificado) return res.status(400).json({ error: 'El email ya está verificado' });

    const token = crypto.randomBytes(32).toString('hex');
    await db.query('UPDATE usuarios SET token_verificacion = ? WHERE email = ?', [token, email]);

    const link = `${FRONTEND_URL}/verificar?token=${token}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '✅ Verifica tu cuenta en ManageX',
      html: templateVerificacion(usuario.nombre, link),
    });

    res.json({ success: true, mensaje: 'Email de verificación enviado' });
  } catch (err) {
    console.error('Error verificar email:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/email/confirmar/:token
router.get('/confirmar/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const [users] = await db.query('SELECT * FROM usuarios WHERE token_verificacion = ?', [token]);
    if (users.length === 0) return res.status(400).json({ error: 'Token inválido o expirado' });

    await db.query(
      'UPDATE usuarios SET email_verificado = 1, token_verificacion = NULL WHERE token_verificacion = ?',
      [token]
    );

    res.json({ success: true, mensaje: '¡Email verificado exitosamente!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/email/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.json({ success: true, mensaje: 'Si el email existe, recibirás instrucciones.' });
    }

    const usuario = users[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 3600000);

    await db.query(
      'UPDATE usuarios SET token_reset = ?, token_reset_expira = ? WHERE email = ?',
      [token, expira, email]
    );

    const link = `${FRONTEND_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '🔐 Restablece tu contraseña de ManageX',
      html: templateResetPassword(usuario.nombre, link),
    });

    res.json({ success: true, mensaje: 'Si el email existe, recibirás instrucciones.' });
  } catch (err) {
    console.error('Error forgot password:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/email/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) return res.status(400).json({ error: 'Token y contraseña son requeridos' });
    if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener mínimo 6 caracteres' });

    const [users] = await db.query(
      'SELECT * FROM usuarios WHERE token_reset = ? AND token_reset_expira > NOW()',
      [token]
    );

    if (users.length === 0) return res.status(400).json({ error: 'Token inválido o expirado' });

    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'UPDATE usuarios SET password = ?, token_reset = NULL, token_reset_expira = NULL WHERE token_reset = ?',
      [hash, token]
    );

    res.json({ success: true, mensaje: '¡Contraseña actualizada exitosamente!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
