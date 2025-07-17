// public/natasha/js/verVentas.js
document.addEventListener('DOMContentLoaded', () => {
  cargarUsuarios();
  document.getElementById('btnBuscar').addEventListener('click', cargarDatos);
});

// Carga la lista de usuarios para el filtro desde /ver-ventas/usuarios
async function cargarUsuarios() {
  try {
    const res = await fetch('/ver-ventas/usuarios');
    if (!res.ok) throw new Error('Error al obtener usuarios');
    const usuarios = await res.json();
    const select = document.getElementById('usuarioFiltro');

    select.innerHTML = '<option value="">Todos</option>';
    usuarios.forEach(u => {
      const option = document.createElement('option');
      option.value = u.DNI;
      option.textContent = `${u.Nombre} ${u.Apellido}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Error cargando usuarios:', err);
  }
}

// Al hacer clic en “Buscar”, disparar listados e indicadores
function cargarDatos() {
  const fecha = document.getElementById('fechaFiltro').value;
  const dni   = document.getElementById('usuarioFiltro').value;
  const params = [];

  if (fecha) params.push(`fecha=${fecha}`);
  if (dni)   params.push(`dni=${dni}`);
  const queryString = params.length ? `?${params.join('&')}` : '';

  cargarVentas(queryString);
  cargarIndicadores(queryString);
}

// Listado de ventas desde /ver-ventas/listar
async function cargarVentas(queryString) {
  try {
    const res = await fetch(`/ver-ventas/listar${queryString}`);
    if (!res.ok) throw new Error('No se pudieron recuperar las ventas');
    const data = await res.json();

    const tbody = document.querySelector('#tablaVentas tbody');
    tbody.innerHTML = '';

    data.forEach(v => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${v.ID_Venta}</td>
        <td>${v.fecha}</td>
        <td>${v.hora}</td>
        <td>${v.producto}</td>
        <td>${parseFloat(v.precio).toFixed(2)}</td>
        <td>${v.cliente}</td>
        <td>${v.tipoTurno}</td>
        <td>${v.tipoPago}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error cargando ventas:', err);
  }
}

// Indicadores desde /ver-ventas/indicadores
async function cargarIndicadores(queryString) {
  try {
    const res = await fetch(`/ver-ventas/indicadores${queryString}`);
    if (!res.ok) throw new Error('No se pudieron recuperar los indicadores');
    const indicadores = await res.json();

    const container = document.getElementById('indicadores');
    container.innerHTML = '';

    indicadores.forEach(item => {
      const div = document.createElement('div');
      div.className = 'indicador';
      div.innerHTML = `
        <h3>${item.tipoTurno}</h3>
        <p>Ferro: $${item.pagos.ferro.toFixed(2)}</p>
        <p>Efectivo: $${item.pagos.efectivo.toFixed(2)}</p>
        <p>Transferencia: $${item.pagos.transferencia.toFixed(2)}</p>
        <hr />
        <p><strong>Total: $${item.pagos.total.toFixed(2)}</strong></p>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error('Error cargando indicadores:', err);
  }
}
