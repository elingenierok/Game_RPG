// ═══════════════════════════════════════════════════════════════
//  BLOQUE 13 · VICTORIA
// ═══════════════════════════════════════════════════════════════
function ganar() {
  estado.ganado = true;
  const overlay = document.getElementById("overlay");
  document.getElementById("ovTitulo").textContent = "🔑 ¡Ganaste!";
  document.getElementById("ovSubtitulo").textContent =
    `Encontraste la llave en la zona ${estado.llave.zona}. Refrescá (F5) para jugar de nuevo.`;
  overlay.classList.add("visible");
}