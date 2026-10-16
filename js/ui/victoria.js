// ═══════════════════════════════════════════════════════════════
//  BLOQUE 13 · VICTORIA (chunks 2D)
// ═══════════════════════════════════════════════════════════════
function ganar() {
  estado.ganado = true;
  const overlay = document.getElementById("overlay");
  document.getElementById("ovTitulo").textContent = "🔑 ¡Ganaste!";
  document.getElementById("ovSubtitulo").textContent =
    `Encontraste la llave en ${Math.floor(estado.llave.wx)},${Math.floor(estado.llave.wy)}. Refrescá (F5) para jugar de nuevo.`;
  overlay.classList.add("visible");
}

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 13.5 · BATALLA · Simulación simple
// ─────────────────────────────────────────────────────────────────
//  Muestra un cartel que simula el módulo de combate.
//  Al cerrarse, elimina el mob.
// ═══════════════════════════════════════════════════════════════
let batallaActiva = null;   // { wx, wy, tipo }

function iniciarBatalla(mob) {
  batallaActiva = {
    wx: mob.wx,
    wy: mob.wy,
    tipo: mob.tipo,
  };
  estado.pausado = true;
  if (typeof pausarTicks === "function") pausarTicks();
  if (typeof cancelarRotura === "function" && rotura.activa) cancelarRotura();
  if (typeof cancelarColocacionBarco === "function" && barco.colocando) cancelarColocacionBarco();
  if (typeof cancelarDesembarco === "function" && desembarco.activo) cancelarDesembarco();

  const datos = MOBS[mob.tipo];

  const overlay = document.getElementById("overlay");
  document.getElementById("ovTitulo").textContent = `⚔️ ¡Batalla contra ${datos.emoji} ${datos.nombre}!`;
  document.getElementById("ovSubtitulo").innerHTML =
    `HP: ${datos.hp} · Ataque: ${datos.ataque} · Defensa: ${datos.defensa}<br><br>` +
    `<button id="btn-continuar-batalla" style="
      background: #222; color: #ddd; border: 1px solid #6cf;
      border-radius: 6px; padding: 10px 20px; font-family: monospace;
      font-size: 16px; cursor: pointer; box-shadow: 0 0 8px rgba(100,200,255,0.4);
    ">Continuar</button>`;
  overlay.classList.add("visible");

  setTimeout(() => {
    const btn = document.getElementById("btn-continuar-batalla");
    if (btn) {
      btn.addEventListener("click", () => {
        derrotarMobEn(batallaActiva.wx, batallaActiva.wy);
        overlay.classList.remove("visible");
        batallaActiva = null;
        estado.pausado = false;   // ← NUEVO
        if (typeof reanudarTicks === "function") reanudarTicks();
        render();
      });
    }
  }, 10);
}