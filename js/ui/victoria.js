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
// ═══════════════════════════════════════════════════════════════
//  BLOQUE 13.5 · BATALLA · Simulación simple
// ─────────────────────────────────────────────────────────────────
//  Muestra un cartel que simula el módulo de combate.
//  Al cerrarse, elimina el mob.
// ═══════════════════════════════════════════════════════════════
let batallaActiva = null;   // { zona, x, y, mob }

function iniciarBatalla(mob) {
  batallaActiva = {
    zona: estado.zona,
    x: mob.x,
    y: mob.y,
    tipo: mob.tipo,
  };

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

  // El botón elimina al mob y cierra el overlay
  setTimeout(() => {
    const btn = document.getElementById("btn-continuar-batalla");
    if (btn) {
            btn.addEventListener("click", () => {
        derrotarMobEn(batallaActiva.zona, batallaActiva.x, batallaActiva.y);
        overlay.classList.remove("visible");
        batallaActiva = null;
        reanudarTicks();
        render();
      });
    }
  }, 10);
}