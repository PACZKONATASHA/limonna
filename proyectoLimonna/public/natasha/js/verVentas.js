/* global fetch, document */
document.addEventListener('DOMContentLoaded', () => {
  cargarUsuarios();

  document.getElementById('btnBuscar').addEventListener('click', cargarDatos);
  document.getElementById('modoVista').addEventListener('change', toggleModo);

  // Ajuste inicial de los filtros (muestra/oculta fecha/semana)
  toggleModo();
});

/* ------------------  UI helpers  ------------------ */
function toggleModo() {
  const modo   = document.getElementById('modoVista').value;
  const lblDia = document.querySelector('label[for="fechaFiltro"]');
  const inpDia = document.getElementById('fechaFiltro');
  const lblSem = document.querySelector('label[for="semanaFiltro"]');
  const inpSem = document.getElementById('semanaFiltro');

  if (modo === 'dia') {
    lblDia.style.display = 'inline-block';
    inpDia.style.display = 'inline-block';
    lblSem.style.display = 'none';
    inpSem.style.display = 'none';
  } else {
    lblDia.style.display = 'none';
    inpDia.style.display = 'none';
    lblSem.style.display = 'inline-block';
    inpSem.style.display = 'inline-block';
  }
}

/* ------------------  Filtros ------------------ */
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
  } else {
    const semana = document.getElementById('semanaFiltro').value;
    if (semana) qs.append('semana', semana);
  }

  const query = `?${qs.toString()}`;

  cargarVentas(query, modo);
  cargarIndicadores(query);
}

/* ------------------  Listado de ventas ------------------ */
async function cargarVentas(queryString, modo) {
  try {
    const res = await fetch(`/ver-ventas/listar${queryString}`);
    if (!res.ok) throw new Error('No se pudieron recuperar las ventas');

    const data  = await res.json();
    const thead = document.querySelector('#tablaVentas thead');
    const tbody = document.querySelector('#tablaVentas tbody');

    // Limpiar tabla
    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (modo === 'dia') {
      // Encabezado modo diario
      thead.insertAdjacentHTML(
        'beforeend',
        `<tr>
           <th>ID</th><th>Fecha</th><th>Hora</th><th>Producto</th>
           <th>Precio (ARS)</th><th>Usuario</th><th>Tipo Turno</th><th>Tipo Pago</th>
         </tr>`
      );

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
    } else {
      // Encabezado modo semanal
      thead.insertAdjacentHTML(
        'beforeend',
        `<tr>
           <th>Semana (ISO)</th><th>Cantidad de Ventas</th><th>Total (ARS)</th>
         </tr>`
      );

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
    }
  } catch (err) {
    console.error('Error cargando ventas:', err);
  }
}

/* ------------------  Indicadores ------------------ */
async function cargarIndicadores(queryString) {
  try {
    const res = await fetch(`/ver-ventas/indicadores${queryString}`);
    if (!res.ok) throw new Error('No se pudieron recuperar los indicadores');

    const indicadores = await res.json();
    const cont        = document.getElementById('indicadores');

    /* ---------- Total del Día ---------- */
    const totalDia = indicadores.reduce((acc, it) => acc + it.pagos.total, 0);
    const supera   = totalDia > 1000;
    const totalHtml = `
      <div class="indicador-total">
        <div>
          <h3>Total del Día</h3>
          <p><strong>$${totalDia.toFixed(2)}</strong></p>
          <p class="${supera ? 'comisiona' : 'nocomisiona'}">
            ${supera ? 'COMISIONA' : 'NO COMISIONA'}
          </p>
        </div>
      </div>`;

    /* ---------- Indicadores individuales por turno ---------- */
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

    // Renderizar
    cont.innerHTML = totalHtml + detalleHtml;
  } catch (err) {
    console.error('Error cargando indicadores:', err);
  }
}
