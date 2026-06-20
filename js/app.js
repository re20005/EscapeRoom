const niveles = {
  1: { completado: false },
  2: { completado: false },
  3: { completado: false },
  4: { completado: false },
  5: { completado: false }
};

// Cargar progreso guardado
let reached = localStorage.getItem('escapeRoom_levelReached');
if (!reached) {
  reached = '1';
  localStorage.setItem('escapeRoom_levelReached', '1');
}

let nivelActual = parseInt(reached, 10);
if (isNaN(nivelActual) || nivelActual < 1 || nivelActual > 5) {
  nivelActual = 1;
}

// Redireccionar si ya se está en nivel 4 o superior
if (nivelActual === 4) {
  window.location.href = 'nivel4.html';
} else if (nivelActual >= 5) {
  window.location.href = 'nivel5.html';
}

// Inicializar niveles anteriores como completados
for (let i = 1; i < nivelActual; i++) {
  if (niveles[i]) {
    niveles[i].completado = true;
  }
}

function mostrarNivel(numero) {
  document.querySelectorAll(".nivel").forEach(function(div) {
    div.classList.remove("activo");
    div.classList.add("oculto");
  });

  const el = document.getElementById("nivel-" + numero);
  if (el) {
    el.classList.remove("oculto");
    el.classList.add("activo");
  }

  actualizarProgreso(numero);
}

function actualizarProgreso(numero) {
  let porcentaje = (numero / 5) * 100;
  let barra = document.getElementById("barra-progreso");
  if (barra) {
    barra.style.width = porcentaje + "%";
    barra.textContent = "Nivel " + numero + "/5";
  }
}

function avanzarNivel() {
  if (niveles[nivelActual].completado) {
    nivelActual++;
    localStorage.setItem('escapeRoom_levelReached', String(nivelActual));
    
    if (nivelActual === 4) {
      window.location.href = 'nivel4.html';
    } else {
      mostrarNivel(nivelActual);
    }
  } else {
    alert("Debes completar este nivel antes de continuar.");
  }
}

// Mostrar el nivel actual cargado
mostrarNivel(nivelActual);