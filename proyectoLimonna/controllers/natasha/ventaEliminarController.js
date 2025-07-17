// controllers/natasha/ventaEliminarController.js
const { pool } = require('../../db/db');

// DELETE /ventas/eliminar/:id
async function eliminarVenta(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ mensaje: 'Falta el ID de la venta' });

    const [result] = await pool.query('DELETE FROM Venta WHERE ID_Venta = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }

    res.status(200).json({ mensaje: 'Venta eliminada exitosamente' });
  } catch (err) {
    console.error('Error al eliminar venta:', err.message);
    res.status(500).json({ mensaje: 'Error del servidor', error: err.message });
  }
}

// GET /ventas/buscar?fecha=YYYY-MM-DD
async function buscarVentasPorFecha(req, res) {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ mensaje: 'Falta el parámetro fecha' });

    const [rows] = await pool.query(`
      SELECT v.ID_Venta, p.Nombre AS producto, CONCAT(u.Nombre, ' ', u.Apellido) AS cliente,
             CONCAT(LPAD(v.Dia,2,'0'), '/', LPAD(v.Mes,2,'0'), '/', v.Año) AS fecha,
             TIME_FORMAT(v.Hora, '%H:%i') AS hora
      FROM Venta v
      JOIN Producto p ON p.ID_Producto = v.ID_Producto
      JOIN Usuario  u ON u.DNI = v.DNI
      WHERE DATE(CONCAT_WS('-', v.Año, LPAD(v.Mes,2,'0'), LPAD(v.Dia,2,'0'))) = ?
      ORDER BY v.ID_Venta DESC
    `, [fecha]);

    res.status(200).json(rows);
  } catch (err) {
    console.error('Error al buscar ventas:', err.message);
    res.status(500).json({ mensaje: 'Error del servidor', error: err.message });
  }
}

module.exports = { eliminarVenta, buscarVentasPorFecha };
