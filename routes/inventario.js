const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');
const router  = express.Router();

router.use(auth);

// GET — listar todos
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM productos 
       WHERE negocio_id=? AND activo=1 
       ORDER BY nombre ASC`,
      [req.user.negocio_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — obtener uno
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM productos WHERE id=? AND negocio_id=?',
      [req.params.id, req.user.negocio_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — productos con stock bajo
router.get('/alertas/stock-bajo', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM productos 
       WHERE negocio_id=? AND activo=1 
       AND stock_actual <= stock_minimo
       ORDER BY stock_actual ASC`,
      [req.user.negocio_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST — crear producto
router.post('/', async (req, res) => {
  try {
    const { nombre, sku, categoria, tipo, precio_venta,
            precio_costo, stock_actual, stock_minimo } = req.body;
    const [r] = await db.query(
      `INSERT INTO productos 
       (negocio_id,nombre,sku,categoria,tipo,
       precio_venta,precio_costo,stock_actual,stock_minimo)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [req.user.negocio_id, nombre, sku, categoria,
       tipo||'producto', precio_venta, precio_costo||0,
       stock_actual||0, stock_minimo||10]
    );
    res.status(201).json({ success: true, id: r.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT — actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const { nombre, categoria, precio_venta,
            precio_costo, stock_actual, stock_minimo } = req.body;
    await db.query(
      `UPDATE productos SET nombre=?,categoria=?,precio_venta=?,
       precio_costo=?,stock_actual=?,stock_minimo=?
       WHERE id=? AND negocio_id=?`,
      [nombre, categoria, precio_venta, precio_costo,
       stock_actual, stock_minimo,
       req.params.id, req.user.negocio_id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE — borrado lógico
router.delete('/:id', async (req, res) => {
  try {
    await db.query(
      'UPDATE productos SET activo=0 WHERE id=? AND negocio_id=?',
      [req.params.id, req.user.negocio_id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;