
const { pool } = require('../../db/db');
const { comprobarTurnoActivo } = require('./turnoController');

/**
 * Devuelve el nombre de usuario a partir del DNI.
 */
const obtenerNombreUsuarioPorDNI = async (dni) => {
  const [rows] = await pool.query(
    'SELECT NombreUsuario FROM Usuario WHERE DNI = ?',
    [dni],
  );
  return rows.length > 0 ? rows[0].NombreUsuario : null;
};

/**
 * Registra una venta.
 * Espera en req.body:
 *  ID_Producto, ID_TipoTurno, ID_TipoPago, Dia, Mes, Año, Hora?, montoTotal
 * El DNI se toma de la sesión.
 */
const registrarVenta = async (req, res) => {
  console.log('📥 Llegó la solicitud con:', req.body);

  const {
    ID_Producto,
    ID_TipoTurno,
    ID_TipoPago,
    Dia,
    Mes,
    Año,
    Hora,
    montoTotal,
  } = req.body;

  const DNI = req.session.usuario?.DNI;
  if (!DNI) return res.redirect('/login');

  // Verifica turno activo con caja chica
  const hayTurno = await comprobarTurnoActivo(DNI);
  if (!hayTurno) {
    return res
      .status(403)
      .json({
        mensaje:
          'Debés tener un turno activo con caja chica para registrar una venta',
      });
  }

  // Si no llega hora la fijamos con la hora actual (HH:MM)
  const horaFinal =
    Hora ||
    (() => {
      const now = new Date();
      return now.toTimeString().slice(0, 5);
    })();

  try {
    await pool.query(
      `INSERT INTO Venta
        (ID_Producto, DNI, ID_TipoPago, ID_TipoTurno, Dia, Mes, Año, Hora, montoTotal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ID_Producto,
        DNI,
        ID_TipoPago,
        ID_TipoTurno,
        Dia,
        Mes,
        Año,
        horaFinal,
        montoTotal,
      ],
    );

    res.status(201).json({ mensaje: 'Venta registrada correctamente' });
  } catch (error) {
    console.error('Error al registrar venta:', error.message);
    res
      .status(500)
      .json({ mensaje: 'Error al registrar la venta', error: error.message });
  }
};

module.exports = { registrarVenta };