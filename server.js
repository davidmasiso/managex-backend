const express = require('express');
const cors    = require('cors');
require('dotenv').config();

require('./config/database');

const app = express();
app.use(cors({
  origin: 'https://managex-system.vercel.app',
  credentials: true
}));
app.use(express.json());

const authRouter      = require('./routes/auth');
const clientesRouter  = require('./routes/clientes');
const citasRouter     = require('./routes/citas');
const ventasRouter    = require('./routes/ventas');
const inventarioRouter = require('./routes/inventario');
const emailRouter = require('./routes/email');

app.use('/api/auth',       authRouter);
app.use('/api/clientes',   clientesRouter);
app.use('/api/citas',      citasRouter);
app.use('/api/ventas',     ventasRouter);
app.use('/api/inventario', inventarioRouter);
app.use('/api/email', emailRouter);

app.get('/', (req, res) => {
  res.json({
    app:    'ManageX API',
    status: '🚀 online'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ManageX corriendo en http://localhost:${PORT}`);

});
