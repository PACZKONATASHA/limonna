// app.js
const express = require('express');
const path = require('path');
const app = express();
const usuariosRoutes = require('./routes/maqui/usuarios');

// Middleware
app.use(express.json()); // para procesar JSON en POST

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas
app.use('/usuarios', usuariosRoutes);

module.exports = app;
