// routes/natasha/vistaVerVentas.js
const express = require('express');
const router  = express.Router();

const {
  listarUsuarios,
  listarVentas,
  indicadoresPorFecha
} = require('../../controllers/natasha/verVentasController');

// Devuelve todos los usuarios activos: /ver-ventas/usuarios
router.get('/usuarios', listarUsuarios);

// Listado de ventas filtrado: /ver-ventas/listar?fecha=YYYY-MM-DD&dni=10000001
router.get('/listar', listarVentas);

// Indicadores por fecha/usuario: /ver-ventas/indicadores?fecha=YYYY-MM-DD&dni=10000001
router.get('/indicadores', indicadoresPorFecha);

module.exports = router;
