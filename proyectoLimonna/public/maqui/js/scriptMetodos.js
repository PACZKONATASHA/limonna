// Métodos del lado del servidor

// scriptMetodos.js

let intentosFallidos = 0;

document.getElementById("botonIngresar").addEventListener("click", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("inputUsuario").value;
    const pass = document.getElementById("inputPass").value;

    const response = await fetch("/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, pass })
    });

    const data = await response.json();

    if (data.accesoPermitido) {
        alert("¡Bienvenido/a!");
        window.location.href = "/menuPrincipal.html";
    } else {
        intentosFallidos++;
        alert(`Usuario o contraseña incorrectos. Intento ${intentosFallidos} de 3`);

        if (intentosFallidos >= 3) {
            alert("Demasiados intentos fallidos. Serás redirigido.");
            window.location.href = "https://github.com/404"; 
        }
    }
});



