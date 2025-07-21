

document.getElementById('formularioVenta').addEventListener('submit', async function (e) {
  e.preventDefault(); // Evita recargar la página

   const DNI = localStorage.getItem('dniUsuario');
  console.log("DNI tomado desde localStorage:", DNI);
  if (!DNI) {
    alert('No se encontró DNI de usuario. Por favor, inicia sesión.');
    return;
  }


  const hora = document.getElementById('hora').value || (() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  })();

  const medioPago = document.querySelector('input[name="medio_pago"]:checked')?.value;

  // Validación mínima
  if (!medioPago) {
    alert('Por favor, seleccioná un medio de pago');
    return;
  }

  // Mapear medioPago a ID_TipoPago
  let ID_TipoPago = 1;
  if (medioPago === 'ferro') ID_TipoPago = 2;
  else if (medioPago === 'efectivo') ID_TipoPago = 3;

  // Fecha actual
  const now = new Date();
  const Dia = now.getDate();
  const Mes = now.getMonth() + 1;
  const Año = now.getFullYear();

  // Agregamos estas dos líneas ANTES de crear el objeto venta
  const ID_Producto = 1; // Valor de prueba o fijo
  let monto = document.getElementById('montoTotal').value;
  monto = monto.replace(',', '.'); // reemplaza coma por punto
  monto = parseFloat(monto);
    if (isNaN(monto)) {
      alert("Por favor, ingresá un monto válido.");
    return;
    }
    const montoTotal = monto; 
  // Armar objeto a enviar
  const venta = { ID_Producto, DNI, ID_TipoPago, Dia, Mes, Año, Hora: hora, montoTotal:monto };

  try {
    const response = await fetch('/ventas/registrarVenta', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(venta),
      credentials: 'include' 
    });

    const data = await response.json();

    if (response.ok) {
      alert('✅ ' + data.mensaje);
    } else {
      alert('⚠️ Error: ' + data.mensaje);
      console.error(data.error);
    }
  } catch (error) {
    alert('❌ Error de conexión');
    console.error(error);
  }
});


   // MostrarConfirmNuevoTurno()

    //DenegarNuevoComienzoTurno()

    //iniciarSegundoMedioTurno() //Método que finaliza la sesión del usuario actual para hacer el cambio de turno con el nuevo, redirige al login

    //REVISAR ESTE METODO 

   function irARegistrarVenta() {
  window.location.href = '/registrarVenta';
}
