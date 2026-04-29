const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');
const router  = express.Router();

router.use(auth);

// GET — listar todos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM clientes WHERE negocio_id=? AND activo=1 ORDER BY creado_en DESC',
      [req.user.negocio_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — obtener uno
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM clientes WHERE id=? AND negocio_id=?',
      [req.params.id, req.user.negocio_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST — crear
router.post('/', async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, ciudad, etiqueta, notas } = req.body;
    const [r] = await db.query(
      `INSERT INTO clientes (negocio_id,nombre,apellido,email,
       telefono,ciudad,etiqueta,notas)
       VALUES (?,?,?,?,?,?,?,?)`,
      [req.user.negocio_id, nombre, apellido, email,
       telefono, ciudad, etiqueta||'nuevo', notas]
    );
    res.status(201).json({ success: true, id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT — actualizar
router.put('/:id', async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, ciudad, etiqueta, notas } = req.body;
    await db.query(
      `UPDATE clientes SET nombre=?,apellido=?,email=?,
       telefono=?,ciudad=?,etiqueta=?,notas=?
       WHERE id=? AND negocio_id=?`,
      [nombre, apellido, email, telefono, ciudad,
       etiqueta, notas, req.params.id, req.user.negocio_id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE — borrado lógico
router.delete('/:id', async (req, res) => {
  try {
    await db.query(
      'UPDATE clientes SET activo=0 WHERE id=? AND negocio_id=?',
      [req.params.id, req.user.negocio_id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;