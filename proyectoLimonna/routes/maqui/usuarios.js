// routes/usuarios.js
const express = require('express');
const router = express.Router();
const { crearUsuario, loginUsuario, validarIdentidad, cambiarContrasena } = require('../../controllers/maqui/usuariosController');

router.post('/', crearUsuario); //Crear cuenta

router.post('/login', loginUsuario); //Iniciar sesión

router.post('/validar-identidad', validarIdentidad); // Validar para recuperar contraseña

router.post('/cambiar-contrasena', cambiarContrasena);

module.exports = router;
