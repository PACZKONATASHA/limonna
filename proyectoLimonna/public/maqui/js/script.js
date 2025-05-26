

/*-------Formulario de ingreso ---------- */
let body = document.body;
body.classList.add("d-flex");
body.classList.add("row");
body.classList.add("align-items-center");/*-----perpend al eje pr--------- */

// nombre de usuario
let formIngreso = document.getElementById("ingreso");
formIngreso.setAttribute("class", "container");

//Estilos de bootstrap para el formulario:
formIngreso.classList.add("border");
formIngreso.classList.add("p-3");
formIngreso.classList.add("container", "w-90");


// Hacer que el formulario se organice en una columna vertical
formIngreso.classList.add("d-flex");
formIngreso.classList.add("flex-column");
formIngreso.classList.add("align-items-center"); // Centrar los elementos dentro del formulario

// Añadir la imagen dentro del formulario, arriba de los campos
let imagen = document.createElement("img");
imagen.setAttribute("src", "/maqui/src/limonna.jpg");
imagen.setAttribute("width", "250"); // en píxeles
imagen.setAttribute("height", "200"); // en píxeles
imagen.classList.add("mb-3"); // Añadir margen inferior para separación entre la imagen y los campos
formIngreso.appendChild(imagen);

// Crear row para aplicar bootstrap
let row = document.createElement("div");
row.classList.add("row");
row.classList.add("text-center");
formIngreso.appendChild(row);

let labelUsuario = document.createElement("label");
labelUsuario.setAttribute("id", "labelUsuario");
labelUsuario.textContent = "Nombre de usuario: ";

let inputUsuario = document.createElement("input");
inputUsuario.setAttribute("type", "text");
inputUsuario.classList.add("col-sm-6");
inputUsuario.classList.add("offset-sm-3"); // desplazamiento de columnas ->
inputUsuario.classList.add("w-50","mx-auto");
inputUsuario.setAttribute("id", "inputUsuario");
inputUsuario.setAttribute("name", "inputUsuario");

row.appendChild(labelUsuario);
row.appendChild(inputUsuario);

// Contraseña
let labelPass = document.createElement("label");
labelPass.textContent = "Contraseña: ";
row.appendChild(labelPass);

let divInputPass = document.createElement("div");
row.appendChild(divInputPass);

let inputPass = document.createElement("input");
inputPass.setAttribute("type", "text");
inputPass.classList.add("col-sm-6");
inputPass.classList.add("offset-sm-3");
inputPass.classList.add("w-50","mx-auto");
inputPass.setAttribute("id", "inputPass");
inputPass.setAttribute("name", "inputPass");

row.appendChild(inputPass);

//Botón ingresar

let div = document.createElement("div");
row.appendChild(div);

let botonIngresar = document.createElement("button");
botonIngresar.setAttribute("id","botonIngresar");
botonIngresar.textContent = "ingresar";
botonIngresar.setAttribute("type","submit");
botonIngresar.classList.add("col-sm-6");
botonIngresar.classList.add("offset-sm-3");
botonIngresar.classList.add("w-40","mx-auto");
div.appendChild(botonIngresar);

// Registrarse
let rowRegistrarse = document.createElement("div");
rowRegistrarse.classList.add("row");
formIngreso.appendChild(rowRegistrarse);

let labelRegistrarse = document.createElement("label");
labelRegistrarse.classList.add("text-center");

// Crear un enlace dentro del label
let enlaceRegistrarse = document.createElement("a");
enlaceRegistrarse.href = "/registrarse.html"; //? Ruta del archivo
enlaceRegistrarse.textContent = "Registrarse";
enlaceRegistrarse.style.color = "#27827B"; // Color opcional

// Agregar el enlace dentro del label
labelRegistrarse.appendChild(enlaceRegistrarse);
rowRegistrarse.appendChild(labelRegistrarse);


// ¿Olvidaste tu contraseña?
let labelOlvidaste = document.createElement("label");
labelOlvidaste.classList.add("text-center");

// Enlace para olvidaste tu contraseña
let enlaceOlvidaste = document.createElement("a");
enlaceOlvidaste.href = "/olvidaste.html"; // ?Ruta del archivo
enlaceOlvidaste.textContent = "¿Olvidaste tu contraseña?";
enlaceOlvidaste.style.color = "#27827B"; // Color opcional

// Agregar el enlace dentro del label
labelOlvidaste.appendChild(enlaceOlvidaste);
rowRegistrarse.appendChild(labelOlvidaste);





