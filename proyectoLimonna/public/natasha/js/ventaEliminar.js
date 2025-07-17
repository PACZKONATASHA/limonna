const btnBuscar = document.getElementById('btnBuscar');
const fechaInput = document.getElementById('fechaBusqueda');
const tbody = document.querySelector('#tablaVentas tbody');

btnBuscar.addEventListener('click', async () => {
  const fecha = fechaInput.value;
  if (!fecha) return alert('Seleccioná una fecha');

  try {
    const res = await fetch(`/ventas/buscar?fecha=${fecha}`);
    const ventas = await res.json();

    tbody.innerHTML = '';

    if (ventas.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 6;
      td.textContent = 'No hay ventas registradas con esa fecha';
      td.classList.add('mensaje-vacio');
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    ventas.forEach(v => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${v.ID_Venta}</td>
        <td>${v.producto}</td>
        <td>${v.cliente}</td>
        <td>${v.fecha}</td>
        <td>${v.hora}</td>
        <td><button class="eliminar-btn" data-id="${v.ID_Venta}">ELIMINAR</button></td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll('.eliminar-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const confirmacion = confirm('¿Está seguro que desea eliminar la venta?');
        if (!confirmacion) return window.location.href = '/ventas';

        const r = await fetch(`/ventas/eliminar/${id}`, { method: 'DELETE' });
        const data = await r.json();
        alert(data.mensaje);
        btnBuscar.click();  // recargar lista
      });
    });
  } catch (err) {
    console.error(err);
    alert('Ocurrió un error al buscar las ventas');
  }
});
