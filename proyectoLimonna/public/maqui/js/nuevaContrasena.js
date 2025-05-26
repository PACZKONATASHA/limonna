// Bootstrap

// Asegurate de enlazar Bootstrap en el HTML tal como en registrarse.html
// y luego este script


document.body.classList.add("d-flex", "row", "align-items-center");


const formNueva = document.getElementById("formNuevaContrasena");


formNueva.classList.add("container", "border", "p-3", "d-flex", "flex-column", "align-items-center");


const row = document.createElement("div");
row.classList.add("row", "text-center");
formNueva.appendChild(row);

const campos = [
  { id: "nuevaContrasena", label: "Nueva contraseña:" },
  { id: "confirmarContrasena", label: "Confirmar contraseña:" }
];

campos.forEach(({ id, label }) => {
  
  const labelElem = document.querySelector(`label[for="${id}"]`);
  labelElem.classList.add("w-100", "mt-2");

 
  const inputElem = document.getElementById(id);
  inputElem.classList.add("col-sm-6", "offset-sm-3", "w-50", "mx-auto");
});


const boton = document.getElementById("btnGuardar");
boton.classList.add("col-sm-6", "offset-sm-3", "w-40", "mx-auto");
