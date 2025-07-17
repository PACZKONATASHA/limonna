// controllers/natasha/verVentasController.js
const { pool } = require('../../db/db');

// Helper para filtrar por fecha, igual que antes
function buildFechaCondition(fecha, params) {
  params.push(fecha);
  return "DATE(CONCAT(v.Año,'-',LPAD(v.Mes,2,'0'),'-',LPAD(v.Dia,2,'0'))) = ?";
}

// GET /ver-ventas/usuarios
async function listarUsuarios(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT DNI, Nombre, Apellido
      FROM Usuario
      WHERE Activo = TRUE
      ORDER BY Apellido, Nombre
    `);
    // Devolvemos un arreglo de objetos: { DNI, Nombre, Apellido }
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error al listar usuarios:', err.message);
    res.status(500).json({ mensaje: 'Error del servidor', error: err.message });
  }
}

// GET /ver-ventas/listar?fecha=YYYY-MM-DD&dni=10000001
async function listarVentas(req, res) {
  try {
    const { fecha, dni } = req.query;
    const whereClauses = [];
    const params = [];

    if (fecha) {
      whereClauses.push(buildFechaCondition(fecha, params));
    }
    if (dni) {
      whereClauses.push("v.DNI = ?");
      params.push(dni);
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `
      SELECT
        v.ID_Venta,
        CONCAT(LPAD(v.Dia,2,'0'), '/', LPAD(v.Mes,2,'0'), '/', v.Año) AS fecha,
        TIME_FORMAT(v.Hora, '%H:%i')                                         AS hora,
        p.Nombre                                                              AS producto,
        p.PrecioUnitario                                                      AS precio,
        CONCAT(u.Nombre, ' ', u.Apellido)                                      AS cliente,
        tt.nombre                                                              AS tipoTurno,
        tp.nombre                                                              AS tipoPago
      FROM Venta v
      JOIN Producto   p  ON p.ID_Producto   = v.ID_Producto
      JOIN Usuario    u  ON u.DNI          = v.DNI
      JOIN TipoTurno  tt ON tt.ID_TipoTurno= v.ID_TipoTurno
      JOIN TipoPago   tp ON tp.ID_TipoPago = v.ID_TipoPago
      ${whereSQL}
      ORDER BY v.ID_Venta DESC
      `,
      params
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error('Error al listar ventas:', err.message);
    res.status(500).json({ mensaje: 'Error del servidor', error: err.message });
  }
}

// GET /ver-ventas/indicadores?fecha=YYYY-MM-DD&dni=10000001
async function indicadoresPorFecha(req, res) {
  try {
    const { fecha, dni } = req.query;
    const whereClauses = [];
    const params = [];

    if (fecha) {
      whereClauses.push(buildFechaCondition(fecha, params));
    }
    if (dni) {
      whereClauses.push("v.DNI = ?");
      params.push(dni);
    }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [results] = await pool.query(
      `
      SELECT
        v.ID_TipoTurno,
        tt.nombre   AS tipoTurno,
        tp.nombre   AS tipoPago,
        SUM(p.PrecioUnitario) AS total
      FROM Venta v
      JOIN Producto   p  ON p.ID_Producto   = v.ID_Producto
      JOIN TipoPago   tp ON tp.ID_TipoPago  = v.ID_TipoPago
      JOIN TipoTurno  tt ON tt.ID_TipoTurno = v.ID_TipoTurno
      ${whereSQL}
      GROUP BY v.ID_TipoTurno, v.ID_TipoPago
      ORDER BY v.ID_TipoTurno, v.ID_TipoPago
      `,
      params
    );

    const indicadoresMap = {};

    results.forEach(row => {
      const idTurno = row.ID_TipoTurno;
      const nombreTurno = row.tipoTurno;
      const pago = row.tipoPago;      // 'ferro', 'efectivo' o 'transferencia'
      const suma = parseFloat(row.total);

      if (!indicadoresMap[idTurno]) {
        indicadoresMap[idTurno] = {
          tipoTurno: nombreTurno,
          pagos: {
            ferro: 0,
            efectivo: 0,
            transferencia: 0,
            total: 0
          }
        };
      }

      indicadoresMap[idTurno].pagos[pago] = suma;
      indicadoresMap[idTurno].pagos.total += suma;
    });

    const indicadoresArray = Object.keys(indicadoresMap)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(key => indicadoresMap[key]);

    res.status(200).json(indicadoresArray);
  } catch (err) {
    console.error('Error al calcular indicadores:', err.message);
    res.status(500).json({ mensaje: 'Error del servidor', error: err.message });
  }
}

module.exports = {
  listarUsuarios,
  listarVentas,
  indicadoresPorFecha
};
