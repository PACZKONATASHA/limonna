let alertaMostrada = false;
let intervaloRecordatorio;

async function obtenerTurnoActual() {
  try {
    const res = await fetch('/api/turno/actual');
    return await res.json();
  } catch (err) {
    console.error('Error al obtener turno:', err);
    return null;
  }
}

function mostrarAlerta(turno) {
  if (alertaMostrada) return;
  alertaMostrada = true;

  const accion = confirm(`⏳ Tu turno "${turno.nombreTurno}" termina pronto.\n¿Querés extender el turno? Si no respondés, se cerrará automáticamente a las ${turno.horaCierre}.`);

  if (accion) {
    extenderTurno(turno);
  } else {
    console.log("Se esperará al cierre automático.");
  }

  // Repetir recordatorio cada 5 minutos si no se respondió
  intervaloRecordatorio = setInterval(() => {
    const nuevaAccion = confirm(`⏰ Recordatorio: Tu turno está por cerrar.\n¿Extender ahora?`);
    if (nuevaAccion) {
      extenderTurno(turno);
      clearInterval(intervaloRecordatorio);
    }
  }, 5 * 60 * 1000);
}

function extenderTurno(turno) {
  fetch('/api/turno/extender', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      DNI: turno.DNI,
      siguienteHorario: turno.siguienteHorario,
      cajaChica: turno.cajaChica,
      dia: turno.dia,
      mes: turno.mes,
      anio: turno.anio
    })
  }).then(() => {
    alert("✅ Turno extendido correctamente.");
    clearInterval(intervaloRecordatorio);
  }).catch(err => {
    console.error("Error al extender turno:", err);
  });
}

function cerrarTurnoAutomaticamente(ID_Turno) {
  fetch('/api/turno/cerrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ID_Turno })
  }).then(() => {
    alert("🔒 Turno cerrado automáticamente. Cerrando sesión...");
    window.location.href = "/logout";
  });
}

function verificarHoraCierre(turno) {
  const ahora = new Date();
  const horaCierre = new Date();
  const [h, m] = turno.horaCierre.split(":");
  horaCierre.setHours(+h, +m, 0);

  const tiempoRestante = (horaCierre - ahora) / (60 * 1000); // en minutos

  if (tiempoRestante <= 20 && tiempoRestante > 0) {
    mostrarAlerta(turno);
  }

  if (tiempoRestante <= 0) {
    cerrarTurnoAutomaticamente(turno.ID_Turno);
  }
}

setInterval(async () => {
  const turno = await obtenerTurnoActual();
  if (turno && turno.ID_Turno) {
    verificarHoraCierre(turno);
  }
}, 60 * 1000); // Cada 1 minuto
