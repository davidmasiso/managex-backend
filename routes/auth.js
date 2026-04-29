const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const db      = require('../config/database');
const router  = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await db.query(
      'SELECT * FROM usuarios WHERE email = ? AND activo = 1',
      [email]
    );
    if (users.length === 0)
      return res.status(401).json({ error: 'Credenciales incorrectas' });

    const usuario = users[0];
    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok)
      return res.status(401).json({ error: 'Credenciales incorrectas' });

    const token = jwt.sign(
      { id: usuario.id, negocio_id: usuario.negocio_id,
        rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({
      token,
      usuario: {
        nombre: usuario.nombre,
        email:  usuario.email,
        rol:    usuario.rol
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/registro
router.post('/registro', async (req, res) => {
  try {
    const { nombre_negocio, nombre, email, password } = req.body;

    if (!nombre_negocio || !nombre || !email || !password)
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });

    const [existe] = await db.query(
      'SELECT id FROM usuarios WHERE email = ?', [email]
    );
    if (existe.length > 0)
      return res.status(400).json({ error: 'Este email ya está registrado' });

    const [negocio] = await db.query(
      'INSERT INTO negocios (nombre, email, plan) VALUES (?, ?, ?)',
      [nombre_negocio, email, 'free']
    );

    const hash = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO usuarios (negocio_id, nombre, email, password, rol, activo)
       VALUES (?, ?, ?, ?, 'admin', 1)`,
      [negocio.insertId, nombre, email, hash]
    );

    res.status(201).json({
      success: true,
      mensaje: '¡Cuenta creada exitosamente! Ya puedes iniciar sesión.'
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;