document
  .getElementById('formularioVenta')
  .addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita recargar la página

    // (1) DNI desde localStorage (backend valida sesión de todos modos)
    const DNI = localStorage.getItem('dniUsuario');
    console.log('DNI tomado desde localStorage:', DNI);

    // (2) Campo y validación de ID_Producto
    const idProductoStr = document.getElementById('ID_Producto').value.trim();
    const ID_Producto = parseInt(idProductoStr, 10);
    if (Number.isNaN(ID_Producto) || ID_Producto <= 0) {
      alert('Ingresá un ID de producto válido');
      return;
    }

    // (3) Campo y validación de ID_TipoTurno
    const tipoTurnoInput = document.querySelector(
      'input[name="tipo_turno"]:checked',
    );
    if (!tipoTurnoInput) {
      alert('Seleccioná un tipo de turno');
      return;
    }
    const ID_TipoTurno = parseInt(tipoTurnoInput.value, 10);

    // (4) Hora (puede ser vacía)
    const hora =
      document.getElementById('hora').value ||
      (() => {
        const now = new Date();
        return now.toTimeString().slice(0, 5);
      })();

    // (5) Medio de pago a ID_TipoPago
    const medioPago = document.querySelector(
      'input[name="medio_pago"]:checked',
    )?.value;
    if (!medioPago) {
      alert('Seleccioná un medio de pago');
      return;
    }
    let ID_TipoPago = 1; // Transferencia por defecto
    if (medioPago === 'ferro') ID_TipoPago = 2;
    else if (medioPago === 'efectivo') ID_TipoPago = 3;

    // (6) Fecha actual
    const now = new Date();
    const Dia = now.getDate();
    const Mes = now.getMonth() + 1;
    const Año = now.getFullYear();

    // (7) Monto
    let monto = document.getElementById('montoTotal').value;
    monto = parseFloat(monto.replace(',', '.'));
    if (Number.isNaN(monto) || monto <= 0) {
      alert('Ingresá un monto válido');
      return;
    }

    // (8) Objeto venta
    const venta = {
      ID_Producto,
      DNI,
      ID_TipoTurno,
      ID_TipoPago,
      Dia,
      Mes,
      Año,
      Hora: hora,
      montoTotal: monto,
    };

    try {
      const response = await fetch('/ventas/registrarVenta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venta),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ ' + data.mensaje);
        // Limpieza rápida del form
        document.getElementById('formularioVenta').reset();
      } else {
        alert('⚠️ Error: ' + data.mensaje);
        console.error(data.error);
      }
    } catch (error) {
      alert('❌ Error de conexión');
      console.error(error);
    }
  });

// Navegación (mantiene tu función existente)
function irARegistrarVenta() {
  window.location.href = '/registrarVenta';
}