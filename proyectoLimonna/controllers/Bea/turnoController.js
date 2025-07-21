const { pool } = require("../../db/db");

// Mapa nombre turno a ID
const mapaTurnos = {
  'mañana': 1,
  'tarde': 2,
  '1er turno media mañana': 3,
  '2do turno media mañana': 4,
  '1er turno media tarde': 5,
  '2do turno media tarde': 6
};

// Horarios límite en minutos desde medianoche
const horaToMinutos = (h, m = 0) => h * 60 + m;

const limites = {
  'mañana': horaToMinutos(14, 0),
  'tarde': horaToMinutos(20, 0),
  '1er turno media mañana': horaToMinutos(11, 0),
  '2do turno media mañana': horaToMinutos(14, 0),
  '1er turno media tarde': horaToMinutos(17, 0),
  '2do turno media tarde': horaToMinutos(20, 0)
};

// 1. Registrar turno
async function registrarTurno(req, res) {
  


  try {
    const { tipoTurno, cajaChica } = req.body;
    const DNI = req.session.usuario.DNI;
    console.log("DNI desde sesión:", DNI);
  console.log('Body recibido:', req.body);
   
console.log("DNI desde sesión:", DNI);

    if (!tipoTurno || !DNI) return res.status(400).json({ message: "Faltan datos obligatorios" });

    const ID_TipoTurno = mapaTurnos[tipoTurno];
    if (!ID_TipoTurno) return res.status(400).json({ message: "Tipo de turno no válido" });

    const now = new Date();
    const Dia = now.getDate();
    const Mes = now.getMonth() + 1;
    const Año = now.getFullYear();
    const Horario = now.toTimeString().split(' ')[0];

    // Cerrar turnos vencidos antes de seguir
    await cerrarTurnosFueraDeHorario(DNI, Dia, Mes, Año);

     // Verificar si el turno requiere caja chica
const requiereCajaChica = ['mañana', '1er turno media mañana'].includes(tipoTurno);

if (requiereCajaChica && (cajaChica === undefined || cajaChica === null || cajaChica === '')) {
  return res.status(400).json({ message: "Debe ingresar un valor de caja chica para este turno" });
}

let cajaFinal = parseFloat(cajaChica);

// Solo si requiere caja chica y viene 0, heredar
if (requiereCajaChica && cajaFinal === 0) {
  const [result] = await pool.query(
    `SELECT cajaChica FROM Turno WHERE Dia = ? AND Mes = ? AND Año = ? AND cajaChica > 0 ORDER BY ID_Turno ASC LIMIT 1`,
    [Dia, Mes, Año]
  );

  if (result.length > 0) {
    cajaFinal = result[0].cajaChica;
  } else {
    return res.status(400).json({ message: "No se ingresó caja chica y no hay valor anterior para heredar." });
  }
}

    // Verificar cuántos turnos activos tiene hoy el usuario
    const [turnosHoy] = await pool.query(
      `SELECT TT.nombre, T.estado FROM Turno T JOIN TipoTurno TT ON T.ID_TipoTurno = TT.ID_TipoTurno WHERE T.DNI = ? AND T.Dia = ? AND T.Mes = ? AND T.Año = ?`,
      [DNI, Dia, Mes, Año]
    );

    const turnosActivosHoy = turnosHoy.filter(t => t.estado === 'activo');

    if (turnosActivosHoy.length >= 2) return res.status(400).json({ message: "Ya registraste dos turnos activos hoy." });

    // Verificar que no registre el mismo turno activo hoy
    const yaHizoEsteTurno = turnosActivosHoy.some(t => t.nombre === tipoTurno);
    if (yaHizoEsteTurno) return res.status(400).json({ message: `Ya registraste el turno "${tipoTurno}" hoy.` });

    // Insertar el turno
    await pool.query(
      `INSERT INTO Turno (DNI, ID_TipoTurno, cajaChica, Dia, Mes, Año, Horario, estado) VALUES (?, ?, ?, ?, ?, ?, ?, 'activo')`,
      [DNI, ID_TipoTurno, cajaFinal, Dia, Mes, Año, Horario]
    );
    
    res.status(200).json({ message: "Turno registrado con éxito", cajaChicaUsada: cajaFinal });

  } catch (error) {
    console.error("Error registrarTurno:", error);
    res.status(500).json({ message: "Error en el servidor al registrar turno" });
  }
}

// 2. Cerrar turnos fuera de horario (función interna)
async function cerrarTurnosFueraDeHorario(DNI, Dia, Mes, Año) {
  try {
  console.log("Datos recibidos para registrar turno:", {
    DNI, ID_TipoTurno, cajaFinal, Dia, Mes, Año, Horario
  });

  await pool.query(
    `INSERT INTO Turno (DNI, ID_TipoTurno, cajaChica, Dia, Mes, Año, Horario, estado) VALUES (?, ?, ?, ?, ?, ?, ?, 'activo')`,
    [DNI, ID_TipoTurno, cajaFinal, Dia, Mes, Año, Horario]
  );

  console.log("Turno registrado correctamente");
  res.status(200).json({ mensaje: 'Turno registrado con éxito' });

} catch (error) {
  console.error("Error al registrar turno:", error);
  res.status(500).json({ mensaje: 'Error al registrar turno', error });
}
}

// 3. Obtener turno actual
async function obtenerTurnoActual(req, res) {
  try {
    const DNI = req.session?.usuario?.DNI;
    if (!DNI) return res.status(401).json({ message: "No autenticado" });

    const [result] = await pool.query(
      `SELECT T.*, TT.nombre FROM Turno T JOIN TipoTurno TT ON T.ID_TipoTurno = TT.ID_TipoTurno WHERE T.DNI = ? AND T.estado = 'activo' ORDER BY T.ID_Turno DESC LIMIT 1`,
      [DNI]
    );

    if (result.length === 0) return res.json(null);

    const turno = result[0];

    // Calcular hora de cierre según el turno
    let horaCierreMinutos = limites[turno.nombre];
    let horaCierreString = `${Math.floor(horaCierreMinutos / 60)}:${(horaCierreMinutos % 60).toString().padStart(2, "0")}`;

    // Obtener siguiente turno para extender
    const ids = Object.values(mapaTurnos);
    const indexActual = ids.indexOf(turno.ID_TipoTurno);
    const siguienteID = (indexActual + 1 < ids.length) ? ids[indexActual + 1] : null;

    res.json({
      turno,
      horaCierre: horaCierreString,
      siguienteID
    });

  } catch (error) {
    console.error("Error obtenerTurnoActual:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

// 4. Cerrar turno por horario límite (ruta /cerrar)
async function cerrarTurnosFueraDeHorario(DNI, Dia, Mes, Año) {
  try {
    // Buscar todos los turnos activos de hoy para ese usuario
    const [turnosActivos] = await pool.query(
      `SELECT T.ID_Turno, T.Horario, TT.nombre 
       FROM Turno T 
       JOIN TipoTurno TT ON T.ID_TipoTurno = TT.ID_TipoTurno 
       WHERE T.DNI = ? AND T.Dia = ? AND T.Mes = ? AND T.Año = ? AND T.estado = 'activo'`,
      [DNI, Dia, Mes, Año]
    );

    const ahora = new Date();
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

    for (const turno of turnosActivos) {
      const limite = limites[turno.nombre];

      // Solo cerrar si hay un límite definido para ese tipo de turno
      if (limite !== undefined && minutosAhora > limite) {
        console.log(`⏱ Cerrando turno vencido: ${turno.nombre} (ID: ${turno.ID_Turno})`);
        await pool.query(
          `UPDATE Turno SET estado = 'cerrado' WHERE ID_Turno = ?`,
          [turno.ID_Turno]
        );
      }
    }

  } catch (error) {
    console.error("❌ Error al cerrar turnos fuera de horario:", error);
    // No hacemos throw para que no frene el flujo de registrarTurno
  }
}





// 5. Extender turno (ruta /extender)
async function extenderTurno(req, res) {
  try {
    const DNI = req.session?.usuario?.DNI;
    if (!DNI) return res.status(401).json({ message: "No autenticado" });

    const { turnoActualID, nuevoIDTipoTurno } = req.body;

    if (!turnoActualID || !nuevoIDTipoTurno) {
      return res.status(400).json({ message: "Faltan datos para extender turno" });
    }

    // Cerrar turno actual
    await pool.query(`UPDATE Turno SET estado = 'cerrado' WHERE ID_Turno = ?`, [turnoActualID]);

    // Obtener datos para nuevo turno (caja chica, fecha)
    const now = new Date();
    const Dia = now.getDate();
    const Mes = now.getMonth() + 1;
    const Año = now.getFullYear();

    // Heredar caja chica del turno anterior (para simplificar, lo buscamos en DB)
    const [resultado] = await pool.query(`SELECT cajaChica FROM Turno WHERE ID_Turno = ?`, [turnoActualID]);
    if (resultado.length === 0) return res.status(400).json({ message: "Turno actual no encontrado" });

    const cajaChica = resultado[0].cajaChica;

    // Insertar nuevo turno extendido
    await pool.query(
      `INSERT INTO Turno (DNI, ID_TipoTurno, cajaChica, Dia, Mes, Año, Horario, estado) VALUES (?, ?, ?, ?, ?, ?, ?, 'activo')`,
      [DNI, nuevoIDTipoTurno, cajaChica, Dia, Mes, Año, new Date().toTimeString().split(' ')[0]]
    );

    res.json({ message: "Turno extendido con éxito" });

  } catch (error) {
    console.error("Error extenderTurno:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

// 🔐 5. VALIDAR ACCESO AL MENÚ DE VENTAS (requiere turno iniciado y caja chica ingresada)
async function validarAccesoMenuVentas(req, res) {
  const DNI = req.session?.usuario?.DNI;
  if (!DNI) {
    return res.status(401).json({ acceso: false, message: 'No autenticado' });
  }

  const today = new Date();
  const Dia = today.getDate();
  const Mes = today.getMonth() + 1;
  const Año = today.getFullYear();

  try {
    const [result] = await pool.query(
      `SELECT * FROM Turno 
       WHERE DNI = ? AND Dia = ? AND Mes = ? AND Año = ? AND estado = 'activo' 
       ORDER BY ID_Turno DESC LIMIT 1`,
      [DNI, Dia, Mes, Año]
    );

    const turno = result[0];

    console.log("Turno encontrado para validar acceso:", turno);

    if (turno && turno.cajaChica > 0) {
      return res.status(200).json({ acceso: true });
    } else {
      return res.status(403).json({ acceso: false, message: 'No tiene turno activo con caja chica' });
    }

  } catch (error) {
    console.error('Error al validar acceso:', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
}

//6. COMPROBAR TURNO ACTIVO

async function comprobarTurnoActivo(DNI) {
  const today = new Date();
  const Dia = today.getDate();
  const Mes = today.getMonth() + 1;
  const Año = today.getFullYear();

  console.log("Buscando turno para:", DNI, Dia, Mes, Año);

  try {
    const [rows] = await pool.query(
      `SELECT * FROM Turno 
       WHERE DNI = ? AND Dia = ? AND Mes = ? AND Año = ? 
       ORDER BY ID_Turno DESC LIMIT 1`,
      [DNI, Dia, Mes, Año]
    );

    console.log("Turnos encontrados:", rows);

    if (rows.length === 0) return false;

    const turno = rows[0];
    console.log("Turno encontrado:", turno);

    return turno.cajaChica > 0;
  } catch (error) {
    console.error('Error en comprobarTurnoActivo:', error.message);
    return false;
  }
}

// 🚪 9. CERRAR SESIÓN (por finalizar turno)
async function cerrarSesion(req, res) {
  try {
    const DNI = req.session.usuario?.DNI;
    const ahora = new Date();
    const dia = ahora.getDate();
    const mes = ahora.getMonth() + 1;
    const anio = ahora.getFullYear();

    // 1. Cerrar el turno activo del usuario si hay alguno hoy
    const [resultado] = await pool.query(
      `UPDATE Turno SET estado = 'cerrado' 
       WHERE DNI = ? AND Dia = ? AND Mes = ? AND Año = ? AND estado = 'activo'`,
      [DNI, dia, mes, anio]
    );
    
    if (resultado.affectedRows > 0) {
      console.log(`✅ Turno del usuario ${DNI} cerrado con éxito el ${dia}/${mes}/${anio}`);
    } else {
      console.log(`⚠️ No se encontró turno activo para cerrar de ${DNI} el ${dia}/${mes}/${anio}`);
    }

    // 2. Cerrar sesión
    req.session.destroy(err => {
      if (err) {
        console.error('Error al cerrar sesión:', err);
        return res.status(500).json({ message: 'Error al cerrar sesión' });
      }
      res.clearCookie('connect.sid');
      res.status(200).json({ message: 'Sesión cerrada correctamente y turno actualizado' });
    });
  } catch (error) {
    console.error('❌ Error al cerrar sesión y actualizar turno:', error);
    res.status(500).json({ message: 'Error al cerrar sesión y cerrar turno' });
  }
}


module.exports = {
  registrarTurno,
  comprobarTurnoActivo,
  cerrarTurnosFueraDeHorario,
  validarAccesoMenuVentas,
  obtenerTurnoActual,
  extenderTurno,
  cerrarSesion
};
/*const { pool } = require("../../db/db");

// Diccionario para convertir nombre del turno en ID_TipoTurno
const mapaTurnos = {
  'mañana': 1,
  'tarde': 2,
  '1er turno media mañana': 3,
  '2do turno media mañana': 4,
  '1er turno media tarde': 5,
  '2do turno media tarde': 6
};

async function cerrarTurnosFueraDeHorario(DNI, Dia, Mes, Año) {
  const [turnosActivos] = await pool.query(`
    SELECT T.ID_Turno, TT.nombre 
    FROM Turno T
    JOIN TipoTurno TT ON T.ID_TipoTurno = TT.ID_TipoTurno
    WHERE T.DNI = ? AND T.Dia = ? AND T.Mes = ? AND T.Año = ? AND T.estado = 'activo'
  `, [DNI, Dia, Mes, Año]);

  const ahora = new Date();
  const horaActual = ahora.getHours();
  const minutosActual = ahora.getMinutes();

  const horaToMinutos = (h, m = 0) => h * 60 + m;
  const ahoraEnMinutos = horaToMinutos(horaActual, minutosActual);

  const limites = {
    'mañana': horaToMinutos(14, 0),
    'tarde': horaToMinutos(20, 0),
    '1er turno media mañana': horaToMinutos(11, 0),
    '2do turno media mañana': horaToMinutos(14, 0),
    '1er turno media tarde': horaToMinutos(17, 0),
    '2do turno media tarde': horaToMinutos(20, 0)
  };

  const idsACerrar = turnosActivos
    .filter(t => {
      const limite = limites[t.nombre] ?? Infinity;
      const cerrarAutomaticamente = (
        (t.nombre.includes('media') &&
          ((t.nombre.includes('mañana') && ahoraEnMinutos >= horaToMinutos(11, 10)) ||
           (t.nombre.includes('tarde') && ahoraEnMinutos >= horaToMinutos(19, 40)))) ||
        ahoraEnMinutos > limite
      );
      return cerrarAutomaticamente;
    })
    .map(t => t.ID_Turno);

  if (idsACerrar.length > 0) {
    await pool.query(`
      UPDATE Turno SET estado = 'cerrado'
      WHERE ID_Turno IN (?)
    `, [idsACerrar]);
    console.log(`Turnos cerrados automáticamente: ${idsACerrar.join(', ')}`);
  }
}


async function registrarTurno(req, res) {
  console.log('Body recibido:', req.body);
  const { tipoTurno, cajaChica } = req.body;
  const DNI = req.session && req.session.usuario ? req.session.usuario.DNI : null;
  console.log("DNI desde sesión:", DNI);
  if (!tipoTurno || !DNI) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  const ID_TipoTurno = mapaTurnos[tipoTurno];
  if (!ID_TipoTurno) {
    return res.status(400).json({ message: 'Tipo de turno no válido' });
  }

  const now = new Date();
  const Dia = now.getDate();
  const Mes = now.getMonth() + 1;
  const Año = now.getFullYear();
  const Horario = now.toTimeString().split(' ')[0];

  let cajaFinal = parseFloat(cajaChica);

  try {
  // 1. Cerrar turnos vencidos automáticamente antes de validar
  await cerrarTurnosFueraDeHorario(DNI, Dia, Mes, Año);

  

    // Si cajaChica es 0, buscar otro turno del mismo día con caja chica > 0 (de cualquier usuario)
    if (cajaFinal === 0) {
      const [result] = await pool.query(
        `SELECT cajaChica FROM Turno 
         WHERE Dia = ? AND Mes = ? AND Año = ? AND cajaChica > 0
         ORDER BY ID_Turno ASC LIMIT 1`,
        [Dia, Mes, Año]
      );

      if (result.length > 0) {
        cajaFinal = result[0].cajaChica; // heredar caja chica del primer turno válido del día
        console.log("Caja chica heredada de otro usuario:", cajaFinal);
      } else {
        return res.status(400).json({ message: 'No se ingresó caja chica y no hay valor anterior para heredar.' });
      }
    }

   
    const [turnosHoy] = await pool.query(`
      SELECT TT.nombre, T.estado 
      FROM Turno T
      JOIN TipoTurno TT ON T.ID_TipoTurno = TT.ID_TipoTurno
      WHERE T.DNI = ? AND T.Dia = ? AND T.Mes = ? AND T.Año = ?
      `, [DNI, Dia, Mes, Año]);

const turnosActivosHoy = turnosHoy.filter(t => t.estado === 'activo');

// Si ya tiene 2 turnos activos hoy → bloquear
if (turnosActivosHoy.length >= 2) {
  return res.status(400).json({ message: 'Ya registraste dos turnos activos hoy.' });
}

// Verificar si ya hizo este mismo turno
const [tipoTurnoActual] = await pool.query('SELECT nombre FROM TipoTurno WHERE ID_TipoTurno = ?', [ID_TipoTurno]);
const nombreTurnoActual = tipoTurnoActual[0]?.nombre;

const yaHizoEsteTurno = turnosActivosHoy.some(t => t.nombre === nombreTurnoActual);
if (yaHizoEsteTurno) {
  return res.status(400).json({ message: `Ya registraste el turno "${nombreTurnoActual}" hoy.` });
}


    // Insertar el turno con cajaFinal
    const sql = `
      INSERT INTO Turno (DNI, ID_TipoTurno, cajaChica, Dia, Mes, Año, Horario, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'activo')
    `;
    await pool.query(sql, [DNI, ID_TipoTurno, cajaFinal, Dia, Mes, Año, Horario]);

    res.status(200).json({ message: 'Turno registrado con éxito', cajaChicaUsada: cajaFinal });

  } catch (error) {
    console.error('Error al registrar el turno:', error);
    res.status(500).json({ message: 'Error en el servidor al registrar el turno' });
  }
}


// 🟡 2. COMPROBAR SI YA HAY TURNO ACTUAL
async function comprobarTurno(req, res) {
  const DNI = req.session?.usuario?.DNI;
  const today = new Date();
  const Dia = today.getDate();
  const Mes = today.getMonth() + 1;
  const Año = today.getFullYear();

  try {
    const [turnos] = await pool.query(
      `SELECT * FROM Turno WHERE DNI = ? AND Dia = ? AND Mes = ? AND Año = ? ORDER BY ID_Turno DESC LIMIT 1`,
      [DNI, Dia, Mes, Año]
    );

    if (turnos.length > 0) {
      res.status(200).json({ turno: turnos[0] });
    } else {
      res.status(200).json({ turno: null });
    }
  } catch (error) {
    console.error('Error al comprobar turno:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}


// 🟡 3. COMPROBAR SI SE INGRESÓ CAJA CHICA AL INICIO
async function comprobarCajaChica(req, res) {
  const DNI = req.session?.usuario?.DNI;
  const today = new Date();
  const Dia = today.getDate();
  const Mes = today.getMonth() + 1;
  const Año = today.getFullYear();

  try {
    // 1. Buscar si el turno actual ya tiene caja chica
    const [turnoActual] = await pool.query(
      `SELECT cajaChica FROM Turno 
       WHERE DNI = ? AND Dia = ? AND Mes = ? AND Año = ?
       ORDER BY ID_Turno DESC LIMIT 1`,
      [DNI, Dia, Mes, Año]
    );

    if (turnoActual.length > 0 && turnoActual[0].cajaChica > 0) {
      // Tiene caja chica asignada: ✅
      return res.status(200).json({ tieneCaja: true, cajaChica: turnoActual[0].cajaChica });
    }

    // 2. Si no tiene cajaChica, buscar si hay otra registrada ese día para heredar
    const [cajaAnterior] = await pool.query(
      `SELECT cajaChica FROM Turno 
       WHERE DNI = ? AND Dia = ? AND Mes = ? AND Año = ? AND cajaChica > 0
       ORDER BY ID_Turno ASC LIMIT 1`,
      [DNI, Dia, Mes, Año]
    );

    if (cajaAnterior.length > 0) {
      // Hereda valor de caja chica del primer turno con valor asignado
      return res.status(200).json({ tieneCaja: true, cajaChica: cajaAnterior[0].cajaChica });
    } else {
      // No se encontró caja chica registrada
      return res.status(200).json({ tieneCaja: false });
    }
  } catch (error) {
    console.error('Error al comprobar caja chica:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
}


// 🔁 4. REDIRIGIR SI NO HAY CAJA CHICA 
function redirigirCajaChica(req, res) {
  
  res.redirect('/turnos'); 
}

// 🔐 5. VALIDAR ACCESO AL MENÚ DE VENTAS (requiere turno iniciado y caja chica ingresada)
async function validarAccesoMenuVentas(req, res) {
  const DNI = req.session?.usuario?.DNI;
  const today = new Date();
  const Dia = today.getDate();
  const Mes = today.getMonth() + 1;
  const Año = today.getFullYear();

  try {
    const [result] = await pool.query(
      `SELECT * FROM Turno WHERE DNI = ? AND Dia = ? AND Mes = ? AND Año = ? ORDER BY ID_Turno DESC LIMIT 1`,
      [DNI, Dia, Mes, Año]
    );

    const turno = result[0];

    if (turno && turno.cajaChica > 0) {
      res.status(200).json({ acceso: true });
    } else {
      res.status(403).json({ acceso: false });
    }

  } catch (error) {
    console.error('Error al validar acceso:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

// ⏳ 6. VERIFICAR SI HAY SEGUNDO MEDIO TURNO POSIBLE
async function verificarInicioSegundoMedioTurno(req, res) {
  // Aquí podés hacer lógica para verificar si ya se hizo el 1er turno
  res.status(200).json({ habilitado: true }); // por ahora simula que sí se puede
}

// 🔚 7. FINALIZAR UN MEDIO TURNO
async function finalizarMedioTurno(req, res) {
  const { turnoActual } = req.body;

  try {
    // lógica para marcar un turno como cerrado, si tenés un campo "finalizado" lo actualizás
    // o bien insertás uno nuevo y usás ese como cierre
    res.status(200).json({ message: `Turno ${turnoActual} finalizado correctamente` });
  } catch (error) {
    console.error('Error al finalizar medio turno:', error);
    res.status(500).json({ message: 'Error al finalizar turno' });
  }
}

// 📌 8. FLAG PARA CONTROLAR SI YA MOSTRASTE UN AVISO DE MEDIO TURNO
let flagMedioTurnoMostrado = false;
function setFlagMedioTurnoMostrado(valor) {
  flagMedioTurnoMostrado = valor;
}

// 🚪 9. CERRAR SESIÓN (por finalizar turno)
function cerrarSesion(req, res) {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).json({ message: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  });
}


 * Verifica si hay un turno activo hoy para el DNI dado, con cajaChica > 0.
 * Retorna true o false.
 




module.exports = {
  registrarTurno,
  comprobarTurno,
  comprobarCajaChica,
  redirigirCajaChica,
  validarAccesoMenuVentas,
  verificarInicioSegundoMedioTurno,
  finalizarMedioTurno,
  setFlagMedioTurnoMostrado,
  cerrarSesion,
  comprobarTurnoActivo 
}; 





/*ComprobarTurno()



ComprobarCajaChica()

RedirigirCajaChica()

ValidarAccesoMenuVentas()

//Aquí van los métodos para el caso de uso "Registrar segundo medio turno"



verificarInicioSegundoMedioTurno()

finalizarMedioTurno() //se le pasa como párametro "turnoActual" dentro de la función

setFlagMedioTurnoMostrado(true)

cerrarSesion() //Método que fuerza el cierre del usuario al finalizar el turno, consultar con Maca */ 