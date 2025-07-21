const express = require('express');
const path = require('path');
const router = express.Router();
const turnoController = require("../../controllers/Bea/turnoController");

function validarSesionConDNI(req, res, next) {
  if (!req.session?.usuario?.DNI) {
    return res.status(401).json({ mensaje: 'No autorizado, debe iniciar sesión' });
  }
  next();
}

// Página turnos (pública o protegida, según quieras)
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/turnos.html'));
});

// Rutas protegidas con middleware
router.post('/', validarSesionConDNI, turnoController.registrarTurno);
router.get('/validar-acceso-menu-ventas', validarSesionConDNI, turnoController.validarAccesoMenuVentas);
router.post('/cerrar', validarSesionConDNI, turnoController.cerrarTurnosFueraDeHorario);
router.post('/extender', validarSesionConDNI, turnoController.extenderTurno);
router.get('/actual', validarSesionConDNI, turnoController.obtenerTurnoActual);

const { cerrarSesion } = require('../../controllers/Bea/turnoController');

router.post('/cerrar-sesion', cerrarSesion);
module.exports = router;
