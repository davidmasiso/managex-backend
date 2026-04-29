const express = require('express');
const db      = require('../config/database');
const auth    = require('../middleware/auth');
const router  = express.Router();

router.use(auth);

// GET — listar todas
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT v.*, c.nombre AS cliente_nombre
       FROM ventas v
       LEFT JOIN clientes c ON v.cliente_id = c.id
       WHERE v.negocio_id=? ORDER BY v.creado_en DESC`,
      [req.user.negocio_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET — obtener una
router.get('/:id', async (req, res) => {
  try {
    const [venta] = await db.query(
      'SELECT * FROM ventas WHERE id=? AND negocio_id=?',
      [req.params.id, req.user.negocio_id]
    );
    if (!venta.length) return res.status(404).json({ error: 'No encontrado' });

    const [items] = await db.query(
      `SELECT vi.*, p.nombre AS producto_nombre
       FROM venta_items vi
       LEFT JOIN productos p ON vi.producto_id = p.id
       WHERE vi.venta_id=?`,
      [req.params.id]
    );
    res.json({ success: true, data: { ...venta[0], items } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST — crear venta completa
router.post('/', async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { cliente_id, items, descuento_pct,
            impuesto_pct, metodo_pago, notas } = req.body;

    // Calcular totales
    const subtotal = items.reduce(
      (s, i) => s + i.cantidad * i.precio_unit, 0
    );
    const desc  = subtotal * ((descuento_pct || 0) / 100);
    const imp   = (subtotal - desc) * ((impuesto_pct || 15) / 100);
    const total = subtotal - desc + imp;

    // Insertar venta
    const [r] = await conn.query(
      `INSERT INTO ventas (negocio_id,cliente_id,subtotal,
       descuento_pct,impuesto_pct,total,metodo_pago,notas)
       VALUES (?,?,?,?,?,?,?,?)`,
      [req.user.negocio_id, cliente_id||null, subtotal,
       descuento_pct||0, impuesto_pct||15, total, metodo_pago, notas]
    );

    // Insertar items y descontar stock
    for (const item of items) {
      await conn.query(
        `INSERT INTO venta_items
         (venta_id,producto_id,cantidad,precio_unit,subtotal)
         VALUES (?,?,?,?,?)`,
        [r.insertId, item.producto_id, item.cantidad,
         item.precio_unit, item.cantidad * item.precio_unit]
      );
      await conn.query(
        'UPDATE productos SET stock_actual = stock_actual - ? WHERE id=?',
        [item.cantidad, item.producto_id]
      );
    }

    await conn.commit();
    res.status(201).json({ success: true, id: r.insertId, total });

  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// PUT — actualizar estado
router.put('/:id', async (req, res) => {
  try {
    const { estado } = req.body;
    await db.query(
      'UPDATE ventas SET estado=? WHERE id=? AND negocio_id=?',
      [estado, req.params.id, req.user.negocio_id]
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;