console.log("menuPrincipal.js cargado");

document.addEventListener('DOMContentLoaded', () => {
  const btnTurnos = document.getElementById('btn-registrarturno');
  const btnCaja = document.getElementById('btn-caja');
  const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

  if (btnTurnos) {
    btnTurnos.addEventListener('click', () => {
      console.log("Botón Turnos clickeado");
      window.location.href = '/turnos';
    });
  }

  if (btnCaja) {
    btnCaja.addEventListener('click', async () => {
      try {
        const response = await fetch('/turnos/validar-acceso-menu-ventas', {
          method: 'GET'
        });

        const data = await response.json();

        if (response.ok && data.acceso) {
          window.location.href = '/ventas';
        } else {
          alert('Debés iniciar un turno con caja chica para acceder a ventas.');
        }
      } catch (error) {
        console.error('Error al validar acceso:', error);
        alert('Hubo un error al intentar verificar el acceso.');
      }
    });
  }

  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', async () => {
      const confirmar = confirm("¿Seguro/a que deseas cerrar sesión?");
      if (!confirmar) return;

      try {
      const res = await fetch('/turnos/cerrar-sesion', {
       method: 'POST',
      credentials: 'include' // para enviar la cookie de sesión
});


        const data = await res.json();
        console.log(data.message);

        localStorage.clear();
        window.location.href = '/';
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Ocurrió un error al cerrar sesión.');
      }
    });
  }
});
