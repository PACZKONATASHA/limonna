// index.js
const app = require('./app');
const { inicializeDatabase } = require('./db/db');

const PORT = 3000;

async function main() {
  try {
    await inicializeDatabase();

    app.listen(PORT, () => {
      console.log(`Servidor activo en el puerto ${PORT}`);
    });
  } catch (err) {
    console.error('Error al iniciar la aplicación:', err.message);
  }
}

main();
