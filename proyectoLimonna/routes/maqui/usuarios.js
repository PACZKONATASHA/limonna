// routes/usuarios.js
const express = require('express');
const router = express.Router();
const { crearUsuario } = require('../../controllers/maqui/usuariosController');

router.post('/', crearUsuario);

module.exports = router;
