document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('turnos-form');
 if (!form) {
    console.error('No se encontró el formulario con ID "turnos-form"');
    return;
  }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
     console.log("Formulario enviado");
    const formData = new FormData(form);
    const turno = formData.get('turno');

    if (!turno) {
      alert('Por favor seleccioná un turno.');
      return;
    }

    let cajaChica = 0;

    // Verificar si el turno requiere caja chica
    const requiereCaja = ['mañana', '1er turno media mañana'].includes(turno);



    if (requiereCaja) {
      let monto = prompt('Ingresá el monto de caja chica para iniciar el turno:');

      if (monto === null) {
        alert('Cancelaste la operación.');
        return;
      }

      monto = monto.replace(',', '.');
      cajaChica = parseFloat(monto);

      if (isNaN(cajaChica) || cajaChica < 0) {
        alert('El monto ingresado no es válido.');
        return;
      }
    }

    try {
  const response = await fetch('/turnos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tipoTurno: turno,
      cajaChica: cajaChica
    }),
    credentials: 'include'  // <- Esto asegura que se envíen las cookies de sesión
  });


      const data = await response.json();

      if (response.ok) {
        alert('Turno registrado correctamente.');
        window.location.href = '/menuPrincipal'; // o a donde corresponda después del turno
      } else {
        alert(data.message || 'No se pudo registrar el turno.');
      }
    } catch (error) {
      console.error('Error al registrar turno:', error);
      alert('Error de conexión con el servidor.');
    }
  });
});


/*
Mostrarvista()

MostrarVistaVentas()

MostrarMensajeTurnoExitoso()

guardar(turnoActual)

actualizarTurno(cajaChica) */