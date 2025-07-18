const { pool } = require('../../db/db');

/* ------------ Helpers de fechas ------------ */
function buildFechaCondition(fecha, params) {
  params.push(fecha);
  return "DATE(CONCAT(v.Año,'-',LPAD(v.Mes,2,'0'),'-',LPAD(v.Dia,2,'0'))) = ?";
}

function buildSemanaCondition(semanaISO, params) {
  const [year, wk] = semanaISO.split('-W');
  const yearWeek   = parseInt(`${year}${wk.padStart(2, '0')}`, 10);
  params.push(yearWeek);
  return "YEARWEEK(DATE(CONCAT(v.Año,'-',LPAD(v.Mes,2,'0'),'-',LPAD(v.Dia,2,'0'))), 3) = ?";
}

function buildMesCondition(mesISO, params) { // mesISO = "YYYY-MM"
  params.push(mesISO);
  return "CONCAT(v.Año,'-',LPAD(v.Mes,2,'0')) = ?";
}

/* ------------ Endpoints ------------ */
// GET /ver-ventas/usuarios
async function listarUsuarios(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT DNI, Nombre, Apellido
      FROM Usuario
      WHERE Activo = TRUE
      ORDER BY Apellido, Nombre
    `);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error al listar usuarios:', err.message);
    res.status(500).json({ mensaje: 'Error del servidor', error: err.message });
  }
}

// GET /ver-ventas/listar
async function listarVentas(req, res) {
  try {
    const { fecha, semana, mes, dni } = req.query;
    const whereClauses = [];
    const params       = [];

    if (fecha)  whereClauses.push(buildFechaCondition(fecha, params));
    if (semana) whereClauses.push(buildSemanaCondition(semana, params));
    if (mes)    whereClauses.push(buildMesCondition(mes, params));
    if (dni)   { whereClauses.push("v.DNI = ?"); params.push(dni); }

    const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    /* ----------  MODO SEMANAL ---------- */
    if (semana) {
      const [rows] = await pool.query(
        `
        SELECT
          CONCAT(
            YEAR(DATE(CONCAT(v.Año,'-',LPAD(v.Mes,2,'0'),'-',LPAD(v.Dia,2,'0')))),
            '-W',
            LPAD(WEEK(DATE(CONCAT(v.Año,'-',LPAD(v.Mes,2,'0'),'-',LPAD(v.Dia,2,'0'))), 3), 2, '0')
          ) AS semana,
          COUNT(*)              AS cantidadVentas,
          SUM(p.PrecioUnitario) AS totalVentas
        FROM Venta v
        JOIN Producto p ON p.ID_Producto = v.ID_Producto
        ${whereSQL}
        GROUP BY semana
        ORDER BY semana DESC
        `,
        params
      );
      return res.status(200).json(rows);
    }

    /* ----------  MODO MENSUAL ---------- */
    if (mes) {
      const [rows] = await pool.query(
        `
        SELECT
          CONCAT(v.Año,'-',LPAD(v.Mes,2,'0')) AS mes,
          COUNT(*)              AS cantidadVentas,
          SUM(p.PrecioUnitario) AS totalVentas
        FROM Venta v
        JOIN Producto p ON p.ID_Producto = v.ID_Producto
        ${whereSQL}
        GROUP BY mes
        ORDER BY mes DESC
        `,
        params
      );
      return res.status(200).json(rows);
    }

    /* ----------  MODO DIARIO (por defecto) ---------- */
    const [rows] = await pool.query(
      `
      SELECT
        v.ID_Venta,
        CONCAT(LPAD(v.Dia,2,'0'), '/', LPAD(v.Mes,2,'0'), '/', v.Año) AS fecha,
        TIME_FORMAT(v.Hora, '%H:%i')                                  AS hora,
        p.Nombre                                                      AS producto,
        p.PrecioUnitario                                              AS precio,
        CONCAT(u.Nombre, ' ', u.Apellido)                             AS cliente,
        tt.nombre                                                     AS tipoTurno,
        tp.nombre                                                     AS tipoPago
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

// GET /ver-ventas/indicadores
async function indicadoresPorFecha(req, res) {
  try {
    const { fecha, semana, mes, dni } = req.query;
    const whereClauses = [];
    const params       = [];

    if (fecha)  whereClauses.push(buildFechaCondition(fecha, params));
    if (semana) whereClauses.push(buildSemanaCondition(semana, params));
    if (mes)    whereClauses.push(buildMesCondition(mes, params));
    if (dni)   { whereClauses.push("v.DNI = ?"); params.push(dni); }

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
      if (!indicadoresMap[idTurno]) {
        indicadoresMap[idTurno] = {
          tipoTurno: row.tipoTurno,
          pagos: { ferro: 0, efectivo: 0, transferencia: 0, total: 0 }
        };
      }
      indicadoresMap[idTurno].pagos[row.tipoPago] = parseFloat(row.total);
      indicadoresMap[idTurno].pagos.total        += parseFloat(row.total);
    });

    const indicadores = Object.values(indicadoresMap).sort(
      (a, b) => a.tipoTurno.localeCompare(b.tipoTurno)
    );
    res.status(200).json(indicadores);
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
