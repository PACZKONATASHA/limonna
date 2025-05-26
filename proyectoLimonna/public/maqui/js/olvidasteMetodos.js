

let intentosFallidos = 0;

document.getElementById("botonIngresar").addEventListener("click", async (e) => {
  e.preventDefault();

  const email = document.getElementById("inputUsuario").value;
  const codigo = document.getElementById("inputPass").value;

  const response = await fetch('/usuarios/validar-identidad', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, codigoMaster: codigo })
  });

  const data = await response.json();

  if (data.validacionExitosa) {
    alert("Validación correcta. Redirigiendo...");
    window.location.href = `/nuevaContrasena.html?dni=${data.dni}`;
  } else {
    intentosFallidos++;
    alert(`Datos incorrectos. Intento ${intentosFallidos} de 3.`);

    if (intentosFallidos >= 3) {
      alert("Demasiados intentos fallidos. Serás redirigido.");
      window.location.href = "https://github.com/404"; // Podés poner otra URL si preferís
    }
  }
});

