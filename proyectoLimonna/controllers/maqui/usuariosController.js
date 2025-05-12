
// controllers/usuariosController.js
const { pool } = require('../../db/db');

//Crear usuario

async function crearUsuario(req, res) {
  const {
    DNI,
    Nombre,
    Apellido,
    CodigoMaster,
    NombreUsuario,
    Email,
    esDueña = false,
    esEmpleada = false,
    contrasena
  } = req.body;

  if (!DNI || !Nombre || !Apellido || !NombreUsuario || !contrasena) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
  }

  try {
    const [resultado] = await pool.query(
      `INSERT INTO Usuario (DNI, Nombre, Apellido, CodigoMaster, NombreUsuario, Email, esDueña, esEmpleada, contrasena)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [DNI, Nombre, Apellido, CodigoMaster || null, NombreUsuario, Email || null, esDueña, esEmpleada, contrasena]
    );
    res.status(201).json({ mensaje: 'Usuario creado con éxito' });
  } catch (error) {
    console.error('Error al crear usuario:', error.message);
    res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
  }
}

module.exports = { crearUsuario };
