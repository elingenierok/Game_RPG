// ═══════════════════════════════════════════════════════════════
//  BLOQUE 99 · CHEATS (TEMPORAL · BORRAR ANTES DE PRODUCCIÓN)
// ─────────────────────────────────────────────────────────────────
//  Para test rápido. Se borra cuando el juego esté estable.
//
//  Para eliminar:
//    1. Borrar este archivo.
//    2. Borrar <script src="js/systems/cheats.js"> del index.html.
//    3. Borrar <button id="btn-cheat">...</button> del index.html.
//    4. Borrar el bloque CSS #btn-cheat del estilo.css.
// ═══════════════════════════════════════════════════════════════

function initCheats() {
  const btn = document.getElementById("btn-cheat");
  if (!btn) return;
  btn.addEventListener("click", toggleCheatEquipables);
}

function toggleCheatEquipables() {
  const tieneTodo =
    (estado.inventario.HACHA    || 0) > 0 &&
    (estado.inventario.PICO     || 0) > 0 &&
    (estado.inventario.LINTERNA || 0) > 0 &&
    (estado.inventario.BARCO    || 0) > 0;

  if (tieneTodo) {
    estado.inventario.HACHA    = 0;
    estado.inventario.PICO     = 0;
    estado.inventario.LINTERNA = 0;
    estado.inventario.BARCO    = 0;
    mostrarCartelRapido("🧹 Inventario limpiado");
  } else {
    estado.inventario.HACHA    = (estado.inventario.HACHA    || 0) + 1;
    estado.inventario.PICO     = (estado.inventario.PICO     || 0) + 1;
    estado.inventario.LINTERNA = (estado.inventario.LINTERNA || 0) + 1;
    estado.inventario.BARCO    = (estado.inventario.BARCO    || 0) + 1;
    mostrarCartelRapido("🎁 Equipables cargados");
  }

  if (typeof actualizarHUD === "function") actualizarHUD();
}

document.addEventListener("DOMContentLoaded", initCheats);