
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


//Login usuarios

const loginUsuario = async (req, res) => {
  const { usuario, pass } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM Usuario WHERE NombreUsuario = ? AND contrasena = ?',
      [usuario, pass]
    );

    if (rows.length > 0) {
      res.status(200).json({ accesoPermitido: true });
    } else {
      res.status(401).json({ accesoPermitido: false });
    }
  } catch (error) {
    console.error('Error en login:', error.message);
    res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
  }
};


// Validar identidad (Código máster + email)

const validarIdentidad = async (req, res) => {
  const { email, codigoMaster } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM Usuario WHERE Email = ? AND CodigoMaster = ?',
      [email, codigoMaster]
    );

    if (rows.length > 0) {
      res.status(200).json({ validacionExitosa: true, dni: rows[0].DNI });
    } else {
      res.status(401).json({ validacionExitosa: false });
    }
  } catch (error) {
    console.error('Error en la validación:', error.message);
    res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
  }
};

// Cambiar contraseña

/*const cambiarContrasena = async (req, res) => {
  const { dni, nuevaContrasena } = req.body;

  try {
    const [resultado] = await pool.query(
      'UPDATE Usuario SET contrasena = ? WHERE DNI = ?',
      [nuevaContrasena, dni]
    );

    res.status(200).json({ exito: true });
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error.message);
    res.status(500).json({ exito: false });
  }
};*/

const cambiarContrasena = async (req, res) => {
  const { dni, nuevaContrasena } = req.body;

  console.log("Recibido en backend - DNI:", dni, "Nueva contraseña:", nuevaContrasena);

  try {
    const [resultado] = await pool.query(
      'UPDATE Usuario SET contrasena = ? WHERE DNI = ?',
      [nuevaContrasena, dni]
    );

    if (resultado.affectedRows === 0) {
      console.log('No se encontró ningún usuario con ese DNI o la contraseña es igual a la anterior.');
      return res.status(404).json({ exito: false, mensaje: 'DNI inválido o sin cambios' });
    }

    console.log('Contraseña actualizada correctamente.');
    res.status(200).json({ exito: true });
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error.message);
    res.status(500).json({ exito: false, mensaje: error.message });
  }
};





module.exports = {
    crearUsuario,
    loginUsuario,
    validarIdentidad,
    cambiarContrasena
};










