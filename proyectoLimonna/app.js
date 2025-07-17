// app.js
const express = require('express');
const path = require('path');
const app = express();
const usuariosRoutes = require('./routes/maqui/usuarios');

const verVentasRoutes  = require('./routes/natasha/vistaVerVentas');   // ← NUEVO

// Middleware
app.use(express.json()); // para procesar JSON en POST

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/natasha')));

// Ruta para servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas
app.use('/usuarios', usuariosRoutes);

// **Aquí mantenemos exactamente la ruta que ya tenías para /ventas**
// (No la tocamos ni la reemplazamos)
app.use('/ver-ventas', verVentasRoutes);

app.get('/ventas', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'vistaPrincipalventa.html'))
);

// NUEVA vista “Ver ventas” (HTML estático)
app.get('/ver-ventas', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'vistaVerVentas.html'))
);

const eliminarVentaRoutes = require('./routes/natasha/ventaEliminar');
app.use('/ventas', eliminarVentaRoutes);

app.get('/eliminar-venta', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'vistaEliminarVenta.html'))
);

module.exports = app;
