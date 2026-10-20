// ═══════════════════════════════════════════════════════════════
//  BLOQUE 13.5 · BATALLA · Delegación a combate.js
// ─────────────────────────────────────────────────────────────────
//  El combate real vive en js/systems/combate.js.
//  Esta función solo redirige. Se mantiene por compatibilidad con
//  los llamados existentes desde jugador.js e ia.js.
// ═══════════════════════════════════════════════════════════════
function iniciarBatalla(mob) {
  if (typeof iniciarCombate === "function") {
    iniciarCombate(mob);
  } else {
    console.warn("combate.js no cargado. No se puede iniciar batalla.");
  }
}