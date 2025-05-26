

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
formIngreso.classList.add("container", "w-90"); /* Tamaño del formulario */


// Hacer que el formulario se organice en una columna vertical
formIngreso.classList.add("d-flex");
formIngreso.classList.add("flex-column");
formIngreso.classList.add("align-items-center"); // Centrar los elementos dentro del formulario

/*-----------------Imagen--------------- */
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

/*---------------Nombre completo --------------- */

let labelNombre = document.createElement("label");
labelNombre.textContent = "Nombre: ";
row.appendChild(labelNombre);

let inputNombre = document.createElement("input");
inputNombre.setAttribute("type", "text");
inputNombre.classList.add("col-sm-6");
inputNombre.classList.add("offset-sm-3"); // desplazamiento de columnas ->
inputNombre.classList.add("w-50","mx-auto");
inputNombre.setAttribute("id", "inputNombre");
inputNombre.setAttribute("name", "inputNombre");

row.appendChild(inputNombre);


/*---------------Usuario--------------- */

let labelUsuario = document.createElement("label");
labelUsuario.setAttribute("id", "labelUsuario");
labelUsuario.textContent = "Apellido: ";

let inputUsuario = document.createElement("input");
inputUsuario.setAttribute("type", "text");
inputUsuario.classList.add("col-sm-6");
inputUsuario.classList.add("offset-sm-3"); // desplazamiento de columnas ->
inputUsuario.classList.add("w-50","mx-auto");
inputUsuario.setAttribute("id", "inputUsuario");
inputUsuario.setAttribute("name", "inputUsuario");

row.appendChild(labelUsuario);
row.appendChild(inputUsuario);


/*---------------DNI--------------- */

let labelDni = document.createElement("label");
labelDni.setAttribute("id", "dni");
labelDni.textContent = "DNI: ";

let inputDni = document.createElement("input");
inputDni.setAttribute("type", "text");
inputDni.classList.add("col-sm-6");
inputDni.classList.add("offset-sm-3"); // desplazamiento de columnas ->
inputDni.classList.add("w-50","mx-auto");
inputDni.setAttribute("id", "inputDni");
inputDni.setAttribute("name", "inputDni");

row.appendChild(labelDni);
row.appendChild(inputDni);


/*------------------contraseña--------------- */
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

/*-----------------Confirmar contraseña--------------- */
// Contraseña
let labelPass2 = document.createElement("label");
labelPass2.textContent = "Confirmar contraseña: ";
row.appendChild(labelPass2);

let divInputPass2 = document.createElement("div");
row.appendChild(divInputPass2);

let inputPass2 = document.createElement("input");
inputPass2.setAttribute("type", "text");
inputPass2.classList.add("col-sm-6");
inputPass2.classList.add("offset-sm-3");
inputPass2.classList.add("w-50","mx-auto");
inputPass2.setAttribute("id", "inputPass2");
inputPass2.setAttribute("name", "inputPass2");

row.appendChild(inputPass2);

/*------------------Mail--------------- */
let labelMail = document.createElement("label");
labelMail.textContent = "Mail: ";
row.appendChild(labelMail);

let inputMail = document.createElement("input");
inputMail.setAttribute("type","text");
inputMail.classList.add("col-sm-6","offset-sm-3");
inputMail.classList.add("w-50","mx-auto");
inputMail.setAttribute("id","inputMail");
inputMail.setAttribute("name","inputMail");
row.appendChild(inputMail);

/*------------------Código--------------- */
let labelCodigo = document.createElement("label");
labelCodigo.textContent = "Código de activación: ";
row.appendChild(labelCodigo);

let inputCodigo = document.createElement("input");
inputCodigo.setAttribute("type","text");
inputCodigo.classList.add("col-sm-6","offset-sm-3");
inputCodigo.classList.add("w-50","mx-auto");
inputCodigo.setAttribute("id","inputCodigo");
inputCodigo.setAttribute("name","inputCodigo");
row.appendChild(inputCodigo);

//Botón registrarse

let div = document.createElement("div");
div.setAttribute("id","divBtn")
row.appendChild(div);

let botonIngresar = document.createElement("button");
botonIngresar.setAttribute("id","botonIngresar");
botonIngresar.textContent = "Registrarse ";
botonIngresar.setAttribute("type","submit");
botonIngresar.classList.add("col-sm-6");
botonIngresar.classList.add("offset-sm-3");
botonIngresar.classList.add("w-40","mx-auto");
div.appendChild(botonIngresar);

/* ----------- Validaciones para enviar el formulario ------------ */

formIngreso.addEventListener("submit", async (e) => {
  e.preventDefault();

  const DNI = inputDni.value.trim();
  const Nombre = inputNombre.value.trim();
  const Apellido = inputUsuario.value.trim(); // este campo es el apellido
  const Email = inputMail.value.trim();
  const CodigoMaster = inputCodigo.value.trim();
  const contrasena1 = inputPass.value;
  const contrasena2 = inputPass2.value;

  // Validaciones simples
  if (!DNI || !Nombre || !Apellido || !contrasena1 || !contrasena2) {
    alert("Todos los campos obligatorios deben estar completos.");
    return;
  }

  if (contrasena1 !== contrasena2) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  if (CodigoMaster !== "laVidaEsBella@outlook.com.ar") {
    alert("Código master inválido.");
    return;
  }

  const NombreUsuario = `${DNI}_${Nombre}`;
  
  try {
    const respuesta = await fetch("/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        DNI,
        Nombre,
        Apellido,
        CodigoMaster,
        NombreUsuario,
        Email,
        contrasena: contrasena1,
        esDueña: false,
        esEmpleada: true
      })
    });

    const resultado = await respuesta.json();
    if (respuesta.ok) {
      alert(`Usuario registrado con éxito.\nEste es su usuario: ${NombreUsuario}`)
      formIngreso.reset();
      // Usamos setTimeout para que el redireccionamiento ocurra después del alert
    setTimeout(() => {
        window.location.href = "/index.html";
    }, 100); // 100 milisegundos (0.1 segundos) es suficiente
    } else {
      alert("Error: " + resultado.mensaje);
    }
  } catch (error) {
    console.error("Error al enviar datos:", error);
    alert("Error de conexión con el servidor.");
  }
});
