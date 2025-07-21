// app.js
const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');

app.use(session({
  secret: 'un-secretito-para-firmar-la-sesion', 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true si usás HTTPS, para desarrollo false
}));
// Middleware
app.use(express.json()); // para procesar JSON en POST

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));


const usuariosRoutes = require('./routes/maqui/usuarios');
const menuPrincipalRoutes = require('./routes/Bea/menuPrincipal');
const ventasRoutes= require('./routes/Bea/registrarVenta');

const verVentasRoutes  = require('./routes/natasha/vistaVerventas');   // ← NUEVO
//const eliminarVentaRoutes = require('./routes/natasha/vistaEliminarventa');***************************************************
const turnosRouter = require('./routes/Bea/turnos');


// Ruta para servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



// Rutas
app.use('/usuarios', usuariosRoutes);
app.use('/',menuPrincipalRoutes);
app.use('/ventas', ventasRoutes);

app.use('/ver-ventas', verVentasRoutes);

///////ACÁ PARA TURNO/////
app.use('/turnos', turnosRouter);  // 👈 POST para guardar turnos desde JS

///ACÁ TODO SOBRE VENTAS///
app.get('/ventas', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'vistaPrincipalventa.html'));
});

app.get('/ver-ventas', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'vistaVerVentas.html'))
);

const eliminarVentaRoutes = require('./routes/natasha/ventaEliminar');
app.use('/ventas', eliminarVentaRoutes);

app.get('/registrarVenta',(req,res) => {
    res.sendFile(path.join(__dirname, 'public', 'registrarVenta.html'))
});

app.get('/eliminar-venta', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'vistaEliminarVenta.html'))
);

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).json({ mensaje: 'Error al cerrar sesión' });
    }

    res.clearCookie('connect.sid'); // Limpia la cookie de sesión si usás express-session
    res.status(200).json({ mensaje: 'Sesión cerrada correctamente' });
  });
});



module.exports = app;



//MIDDLEWARE GLOBAL PARA CERRAR TURNO VENCIDO
/*const turnoController = require('./controllers/Bea/turnoController');

app.use(async (req, res, next) => {
  if (!req.session?.usuario?.DNI) {
    return next();
  }
  if (req.path.startsWith('/turnos')) {
  return next();
}
  if (req.path === '/turnos/registrar' && req.method === 'POST') {
    return next();
  }
  const DNI = req.session.usuario.DNI;
  const now = new Date();
  const Dia = now.getDate();
  const Mes = now.getMonth() + 1;
  const Año = now.getFullYear();


  // Comprobar si queda turno activo para este usuario hoy
  const turnoActivo = await turnoController.comprobarTurnoActivo(DNI);

  
  // Ejecutar cierre automático de turnos vencidos
  await turnoController.cerrarTurnosFueraDeHorario(DNI, Dia, Mes, Año);

  if (!turnoActivo) {
    // No hay turno activo → destruimos sesión y redirigimos a login
    req.session.destroy(err => {
      if (err) {
        console.error('Error al destruir sesión tras cierre de turno:', err);
        return next(err);
      }
      res.clearCookie('connect.sid');
      // Para peticiones AJAX, podés mandar un JSON con estado
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ mensaje: 'Sesión cerrada por fin de turno' });
      }
      // Para peticiones normales, redirigir a login
      return res.redirect('/login');
    });
  } else {
    next();
  }
});
*/