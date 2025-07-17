// routes/natasha/ventaEliminar.js
const express = require('express');
const router = express.Router();
const { eliminarVenta, buscarVentasPorFecha } = require('../../controllers/natasha/ventaEliminarController');

router.get('/buscar', buscarVentasPorFecha);         // /ventas/buscar?fecha=YYYY-MM-DD
router.delete('/eliminar/:id', eliminarVenta);       // /ventas/eliminar/:id

module.exports = router;
