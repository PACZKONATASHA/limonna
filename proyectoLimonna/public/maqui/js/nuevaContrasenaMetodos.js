

    const params = new URLSearchParams(window.location.search);
    const dni = params.get("dni");

    document.getElementById("btnGuardar").addEventListener("click", async (e) => {
      e.preventDefault();
      const nueva = document.getElementById("nuevaContrasena").value;
      const confirmar = document.getElementById("confirmarContrasena").value;

      if (nueva !== confirmar) {
        alert("Las contraseñas no coinciden.");
        return;
      }

      const response = await fetch('/usuarios/cambiar-contrasena', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni, nuevaContrasena: nueva })
      });

      const data = await response.json();
      if (data.exito) {
        alert("Contraseña actualizada con éxito.");
        window.location.href = "/index.html";
      } else {
        alert("Error al cambiar la contraseña.");
      }
    });