const niveles = {
  1: { completado: false },
  2: { completado: false },
  3: { completado: false },
  4: { completado: false },
  5: { completado: false }
};

let nivelActual = 1;

function mostrarNivel(numero) {
  document.querySelectorAll(".nivel").forEach(function(div) {
    div.classList.remove("activo");
    div.classList.add("oculto");
  });

  document.getElementById("nivel-" + numero).classList.remove("oculto");
  document.getElementById("nivel-" + numero).classList.add("activo");

  actualizarProgreso(numero);
}

function actualizarProgreso(numero) {
  let porcentaje = (numero / 5) * 100;
  let barra = document.getElementById("barra-progreso");
  barra.style.width = porcentaje + "%";
  barra.textContent = "Nivel " + numero + "/5";
}

function avanzarNivel() {
  if (niveles[nivelActual].completado) {
    nivelActual++;
    mostrarNivel(nivelActual);
  } else {
    alert("Debes completar este nivel antes de continuar.");
  }
}

mostrarNivel(1);