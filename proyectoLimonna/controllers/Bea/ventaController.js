const { pool } = require("../../db/db");
const { comprobarTurnoActivo } = require('./turnoController'); 

const obtenerNombreUsuarioPorDNI = async (dni) => {
  const [rows] = await pool.query(
    'SELECT NombreUsuario FROM Usuario WHERE DNI = ?',
    [dni]
  );
  if (rows.length > 0) return rows[0].NombreUsuario;
  return null;
};

const registrarVenta = async (req, res) => {
  console.log("📥 Llegó la solicitud con:", req.body);
  const { ID_TipoPago, Dia, Mes, Año, Hora, montoTotal } = req.body;
  const DNI = req.session.usuario?.DNI;

 
if (!DNI) return res.redirect('/login');

// Continuar con la lógica sabiendo que DNI está definido


  const hayTurno = await comprobarTurnoActivo(DNI);
  if (!hayTurno) {
    return res.status(403).json({ mensaje: 'Debés tener un turno activo con caja chica para registrar una venta' });
  }

  let horaFinal = Hora;
  if (!Hora) {
    const now = new Date();
    horaFinal = now.toTimeString().slice(0, 5);
  }

  try {
    const [resultado] = await pool.query(
      `INSERT INTO Venta (DNI, ID_TipoPago, Dia, Mes, Año, Hora, montoTotal)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [DNI, ID_TipoPago, Dia, Mes, Año, horaFinal, montoTotal]
    );

    res.status(201).json({ mensaje: 'Venta registrada correctamente' });
  } catch (error) {
    console.error('Error al registrar venta:', error.message);
    res.status(500).json({ mensaje: 'Error al registrar la venta', error: error.message });
  }
};



module.exports = {
  registrarVenta
};
