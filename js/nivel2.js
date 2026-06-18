document.getElementById("btn-dibujar-mapa").addEventListener("click", function() {

  const canvas = document.getElementById("miCanvas");
  const ctx = canvas.getContext("2d");

  // Recuperar coordenadas del nivel 1
  const lat = document.getElementById("latitud").textContent;
  const lon = document.getElementById("longitud").textContent;


  // 1. FONDO DEL MAPA
  ctx.fillStyle = "#e8f4e8"; // color ciudad
  ctx.fillRect(0, 0, 600, 400);

  // 2. MANZANAS (rectángulos)
  ctx.fillStyle = "#c8b99a"; // color edificios
  ctx.fillRect(50,  50,  120, 80);
  ctx.fillRect(200, 50,  120, 80);
  ctx.fillRect(350, 50,  120, 80);
  ctx.fillRect(50,  200, 120, 80);
  ctx.fillRect(350, 200, 120, 80);


  // 3. PARQUE (rectángulo verde)
  ctx.fillStyle = "#4caf50";
  ctx.fillRect(200, 200, 120, 80);


  // 4. CALLES (líneas)
  ctx.strokeStyle = "#888888";
  ctx.lineWidth = 6;

  // Calles horizontales
  ctx.beginPath(); ctx.moveTo(0, 160); ctx.lineTo(600, 160); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 320); ctx.lineTo(600, 320); ctx.stroke();

  // Calles verticales
  ctx.beginPath(); ctx.moveTo(180, 0); ctx.lineTo(180, 400); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(340, 0); ctx.lineTo(340, 400); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(500, 0); ctx.lineTo(500, 400); ctx.stroke();


  // 5. MARCADOR DE POSICIÓN (círculo)
  const markerX = 260;
  const markerY = 240;

  // Círculo exterior
  ctx.beginPath();
  ctx.arc(markerX, markerY, 18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
  ctx.fill();

  // Círculo interior
  ctx.beginPath();
  ctx.arc(markerX, markerY, 8, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();


  // 6. ETIQUETAS DE TEXTO
  ctx.fillStyle = "#333";
  ctx.font = "12px Arial";
  ctx.fillText("📍 Tu posición", markerX + 12, markerY - 12);
  ctx.fillText("🌳 Parque Central", 205, 245);


  // 7. Mostrar coordenadas usadas
  document.getElementById("lat-mapa").textContent = lat;
  document.getElementById("lon-mapa").textContent = lon;
  document.getElementById("info-mapa").classList.remove("d-none");


  // 8. Marcar nivel completado
  niveles[2].completado = true;
  document.getElementById("btn-siguiente-n2").disabled = false;

});