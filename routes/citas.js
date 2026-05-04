const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');
const router  = express.Router();

router.use(auth);

// GET — listar todas
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, cl.nombre AS cliente_nombre, cl.telefono AS cliente_tel
       FROM citas c
       LEFT JOIN clientes cl ON c.cliente_id = cl.id
       WHERE c.negocio_id=? ORDER BY c.fecha DESC, c.hora_inicio ASC`,
      [req.user.negocio_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — obtener una
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM citas WHERE id=? AND negocio_id=?',
      [req.params.id, req.user.negocio_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST — crear
router.post('/', async (req, res) => {
  try {
    const { cliente_id, servicio, fecha,
            hora_inicio, duracion_min, notas } = req.body;
    const [r] = await db.query(
      `INSERT INTO citas (negocio_id,cliente_id,usuario_id,
       servicio,fecha,hora_inicio,duracion_min,notas)
       VALUES (?,?,?,?,?,?,?,?)`,
      [req.user.negocio_id, cliente_id, req.user.id,
       servicio, fecha, hora_inicio, duracion_min||60, notas]
    );
    res.status(201).json({ success: true, id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT — actualizar
router.put('/:id', async (req, res) => {
  try {
    const campos = [];
    const valores = [];

    if (req.body.estado !== undefined)      { campos.push('estado=?');      valores.push(req.body.estado); }
    if (req.body.notas !== undefined)       { campos.push('notas=?');       valores.push(req.body.notas); }
    if (req.body.fecha !== undefined)       { campos.push('fecha=?');       valores.push(req.body.fecha); }
    if (req.body.hora_inicio !== undefined) { campos.push('hora_inicio=?'); valores.push(req.body.hora_inicio); }

    if (campos.length === 0) return res.status(400).json({ error: 'Nada que actualizar' });

    valores.push(req.params.id, req.user.negocio_id);

    await db.query(
      `UPDATE citas SET ${campos.join(',')} WHERE id=? AND negocio_id=?`,
      valores
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE — eliminar
router.delete('/:id', async (req, res) => {
  try {
    await db.query(
      'DELETE FROM citas WHERE id=? AND negocio_id=?',
      [req.params.id, req.user.negocio_id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;