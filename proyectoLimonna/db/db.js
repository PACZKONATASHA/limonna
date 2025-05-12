// db/bd.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'limonna',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function inicializeDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('Base de datos conectada (pool)');
    connection.release(); // liberamos la conexión al pool
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
    throw error;
  }
}

module.exports = { inicializeDatabase, pool };
