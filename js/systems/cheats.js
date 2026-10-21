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

// Prueba rápida de combate desde consola:
//   debugCombate("cerdo", "ATAQUE_8")
// Usa 100 HP para poder probar el combo sin matar al mob en 2 golpes.
function debugCombate(tipo = "cerdo", ataque = "ATAQUE_8") {
  if (typeof iniciarCombate !== "function" || typeof MOBS === "undefined" || !MOBS[tipo]) {
    return "No se pudo iniciar: mob o combate no disponible.";
  }

  const hp = 100;
  iniciarCombate({
    ...MOBS[tipo],
    tipo,
    hp,
    hpActual: hp,
    hpMax: hp,
    ataques: [ataque],
  });

  return `Combate de prueba: ${MOBS[tipo].nombre} con ${ataque} (${hp} HP)`;
}

window.debugCombate = debugCombate;

// Prueba rápida de progresión desde consola:
//   debugXP(500)
function debugXP(cantidad = 100) {
  if (typeof Progresion === "undefined") return "Progresión no disponible.";
  const otorgada = Progresion.otorgarXP(cantidad);
  return `+${otorgada} XP · total disponible: ${Progresion.obtenerResumen().xp}`;
}

window.debugXP = debugXP;

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