/* global fetch, document */
document.addEventListener('DOMContentLoaded', () => {
  cargarUsuarios();

  document.getElementById('btnBuscar').addEventListener('click', cargarDatos);
  document.getElementById('modoVista').addEventListener('change', toggleModo);

  toggleModo(); // ajuste inicial
});

/* ------------  UI helpers  ------------ */
function toggleModo() {
  const modo   = document.getElementById('modoVista').value;

  const lblDia = document.querySelector('label[for="fechaFiltro"]');
  const inpDia = document.getElementById('fechaFiltro');
  const lblSem = document.querySelector('label[for="semanaFiltro"]');
  const inpSem = document.getElementById('semanaFiltro');
  const lblMes = document.querySelector('label[for="mesFiltro"]');
  const inpMes = document.getElementById('mesFiltro');

  // Ocultar todo primero
  [lblDia, inpDia, lblSem, inpSem, lblMes, inpMes].forEach(el => el.style.display = 'none');

  if (modo === 'dia') {
    lblDia.style.display = inpDia.style.display = 'inline-block';
  } else if (modo === 'semana') {
    lblSem.style.display = inpSem.style.display = 'inline-block';
  } else { // mes
    lblMes.style.display = inpMes.style.display = 'inline-block';
  }
}

/* ------------  Filtros  ------------ */
async function cargarUsuarios() {
  try {
    const res = await fetch('/ver-ventas/usuarios');
    if (!res.ok) throw new Error('Error al obtener usuarios');

    const usuarios = await res.json();
    const sel      = document.getElementById('usuarioFiltro');

    sel.innerHTML = '<option value="">Todos</option>';
    usuarios.forEach(u => {
      sel.insertAdjacentHTML(
        'beforeend',
        `<option value="${u.DNI}">${u.Nombre} ${u.Apellido}</option>`
      );
    });
  } catch (err) {
    console.error('Error cargando usuarios:', err);
  }
}

function cargarDatos() {
  const modo = document.getElementById('modoVista').value;
  const dni  = document.getElementById('usuarioFiltro').value;

  const qs = new URLSearchParams({ modo });
  if (dni) qs.append('dni', dni);

  if (modo === 'dia') {
    const fecha = document.getElementById('fechaFiltro').value;
    if (fecha) qs.append('fecha', fecha);
  } else if (modo === 'semana') {
    const semana = document.getElementById('semanaFiltro').value;
    if (semana) qs.append('semana', semana);
  } else { // mes
    const mes = document.getElementById('mesFiltro').value;
    if (mes) qs.append('mes', mes);
  }

  const query = `?${qs.toString()}`;

  cargarVentas(query, modo);
  cargarIndicadores(query, modo);
}

/* ------------  Listado de ventas  ------------ */
async function cargarVentas(queryString, modo) {
  try {
    const res = await fetch(`/ver-ventas/listar${queryString}`);
    if (!res.ok) throw new Error('No se pudieron recuperar las ventas');

    const data  = await res.json();
    const thead = document.querySelector('#tablaVentas thead');
    const tbody = document.querySelector('#tablaVentas tbody');

    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (modo === 'dia') {
      thead.innerHTML = `
        <tr>
          <th>ID</th><th>Fecha</th><th>Hora</th><th>Producto</th>
          <th>Precio (ARS)</th><th>Usuario</th><th>Tipo Turno</th><th>Tipo Pago</th>
        </tr>`;
      data.forEach(v => {
        tbody.insertAdjacentHTML(
          'beforeend',
          `<tr>
             <td>${v.ID_Venta ?? '-'}</td>
             <td>${v.fecha           }</td>
             <td>${v.hora            }</td>
             <td>${v.producto        }</td>
             <td>${parseFloat(v.precio).toFixed(2)}</td>
             <td>${v.cliente         }</td>
             <td>${v.tipoTurno       }</td>
             <td>${v.tipoPago        }</td>
           </tr>`
        );
      });
    } else if (modo === 'semana') {
      thead.innerHTML = `
        <tr>
          <th>Semana (ISO)</th><th>Cantidad de Ventas</th><th>Total (ARS)</th>
        </tr>`;
      data.forEach(v => {
        tbody.insertAdjacentHTML(
          'beforeend',
          `<tr>
             <td>${v.semana              }</td>
             <td>${v.cantidadVentas      }</td>
             <td>${parseFloat(v.totalVentas).toFixed(2)}</td>
           </tr>`
        );
      });
    } else { // mes
      thead.innerHTML = `
        <tr>
          <th>Mes</th><th>Cantidad de Ventas</th><th>Total (ARS)</th>
        </tr>`;
      data.forEach(v => {
        tbody.insertAdjacentHTML(
          'beforeend',
          `<tr>
             <td>${v.mes                 }</td>
             <td>${v.cantidadVentas      }</td>
             <td>${parseFloat(v.totalVentas).toFixed(2)}</td>
           </tr>`
        );
      });
    }
  } catch (err) {
    console.error('Error cargando ventas:', err);
  }
}

/* ------------  Indicadores  ------------ */
async function cargarIndicadores(queryString, modo) {
  try {
    const res = await fetch(`/ver-ventas/indicadores${queryString}`);
    if (!res.ok) throw new Error('No se pudieron recuperar los indicadores');

    const indicadores = await res.json();
    const cont        = document.getElementById('indicadores');

    const total = indicadores.reduce((acc, it) => acc + it.pagos.total, 0);
    const supera = total > 1000000;

    const labelTotal =
      modo === 'dia'    ? 'Total del Día'    :
      modo === 'semana' ? 'Total de la Semana' :
                          'Total del Mes';

    const totalHtml = `
      <div class="indicador-total">
        <div>
          <h3>${labelTotal}</h3>
          <p><strong>$${total.toFixed(2)}</strong></p>
          <p class="${supera ? 'comisiona' : 'nocomisiona'}">
            ${supera ? 'COMISIONA' : 'NO COMISIONA'}
          </p>
        </div>
      </div>`;

    const detalleHtml = indicadores.map(it => `
      <div class="indicador">
        <h3>${it.tipoTurno}</h3>
        <p>Ferro: $${it.pagos.ferro.toFixed(2)}</p>
        <p>Efectivo: $${it.pagos.efectivo.toFixed(2)}</p>
        <p>Transferencia: $${it.pagos.transferencia.toFixed(2)}</p>
        <hr>
        <p><strong>Total: $${it.pagos.total.toFixed(2)}</strong></p>
      </div>
    `).join('');

    cont.innerHTML = totalHtml + detalleHtml;
  } catch (err) {
    console.error('Error cargando indicadores:', err);
  }
}