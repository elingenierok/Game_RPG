// ═══════════════════════════════════════════════════════════════
//  BLOQUE 13.7 · UI DE COMBATE (v2.5-alpha · F28 fase 4)
// ─────────────────────────────────────────────────────────────────
//  Overlay de combate. SOLO UI, sin lógica de turnos.
//  La lógica la maneja combate.js (F28 fase 5).
//
//  Funciones públicas:
//    CombateUI.abrir(jugador, mob)       → muestra el overlay
//    CombateUI.cerrar()                   → oculta el overlay
//    CombateUI.actualizarHPJugador(hp, hpMax)
//    CombateUI.actualizarHPMob(hp, hpMax)
//    CombateUI.mostrarMensaje(texto)
//    CombateUI.onHuir(callback)           → registra callback del botón Huir
//    CombateUI.estaAbierto()
// ═══════════════════════════════════════════════════════════════

window.CombateUI = (() => {
  let abierto = false;
  let contenedor = null;
  let callbacks = { huir: null };

  // ─── Abrir el overlay ───
  function abrir(jugador, mob) {
  if (abierto) return;
  abierto = true;

  // ─── Pausar el juego (bloquea movimiento, IA, rotura, barco) ───
  if (typeof estado !== "undefined") {
    estado.pausado = true;
  }

    const emojiJugador = _temaActivo && _temaActivo.jugador
      ? _temaActivo.jugador.quieto
      : "🧍‍♂️";

    const datosMob = typeof MOBS !== "undefined" ? MOBS[mob.tipo] : null;
    const emojiMob = datosMob ? datosMob.emoji : "?";
    const nombreMob = datosMob ? datosMob.nombre : "Mob";

    contenedor = document.createElement("div");
    contenedor.id = "combate-overlay";
    contenedor.innerHTML = `
      <div id="combate-panel">
        <!-- Header: título + botón huir -->
        <div id="combate-header">
          <div id="combate-titulo">⚔️ COMBATE</div>
          <button id="combate-btn-huir" title="Huir del combate">🏃 Huir</button>
        </div>

        <!-- Paneles de jugador vs mob -->
        <div id="combate-paneles">
          <!-- Jugador -->
          <div class="combate-panel-lado" id="combate-jugador">
            <div class="combate-emoji" id="combate-jugador-emoji">${emojiJugador}</div>
            <div class="combate-nombre">Jugador</div>
            <div class="combate-barra-hp">
              <div class="combate-barra-hp-relleno" id="combate-jugador-hp-relleno"></div>
            </div>
            <div class="combate-hp-texto" id="combate-jugador-hp-texto">20 / 20</div>
          </div>

          <!-- VS -->
          <div id="combate-vs">VS</div>

          <!-- Mob -->
          <div class="combate-panel-lado" id="combate-mob">
            <div class="combate-emoji" id="combate-mob-emoji">${emojiMob}</div>
            <div class="combate-nombre" id="combate-mob-nombre">${nombreMob}</div>
            <div class="combate-barra-hp">
              <div class="combate-barra-hp-relleno" id="combate-mob-hp-relleno"></div>
            </div>
            <div class="combate-hp-texto" id="combate-mob-hp-texto">— / —</div>
          </div>
        </div>

        <!-- Mensaje / turno actual -->
        <div id="combate-mensaje">Iniciando combate...</div>

        <!-- Espacio para la barra de timing (F28 fase 5) -->
        <div id="combate-timing-container"></div>
      </div>
    `;
    document.body.appendChild(contenedor);

    // Evento: botón huir
    document.getElementById("combate-btn-huir").addEventListener("click", () => {
      if (callbacks.huir) callbacks.huir();
    });

    // Inicializar barras de HP
    if (typeof estado !== "undefined" && estado.jugador) {
      actualizarHPJugador(estado.jugador.hp, estado.jugador.hpMax);
    }
    if (mob && mob.hpActual !== undefined) {
      actualizarHPMob(mob.hpActual, mob.hpMax);
    }
  }

  // ─── Cerrar el overlay ───
  function cerrar() {
  if (!abierto) return;
  abierto = false;

  // ─── Reanudar el juego ───
  if (typeof estado !== "undefined") {
    estado.pausado = false;
  }

  if (contenedor && contenedor.parentNode) {
    contenedor.parentNode.removeChild(contenedor);
  }
  contenedor = null;
  callbacks.huir = null;
}

  // ─── Actualizar HP del jugador ───
  function actualizarHPJugador(hp, hpMax) {
    if (!abierto) return;
    const relleno = document.getElementById("combate-jugador-hp-relleno");
    const texto = document.getElementById("combate-jugador-hp-texto");
    if (!relleno || !texto) return;

    const pct = Math.max(0, Math.min(100, (hp / hpMax) * 100));
    relleno.style.width = pct + "%";
    texto.textContent = `${Math.ceil(hp)} / ${hpMax}`;
  }

  // ─── Actualizar HP del mob ───
  function actualizarHPMob(hp, hpMax) {
    if (!abierto) return;
    const relleno = document.getElementById("combate-mob-hp-relleno");
    const texto = document.getElementById("combate-mob-hp-texto");
    if (!relleno || !texto) return;

    const pct = Math.max(0, Math.min(100, (hp / hpMax) * 100));
    relleno.style.width = pct + "%";
    texto.textContent = `${Math.ceil(hp)} / ${hpMax}`;
  }

  // ─── Mostrar mensaje de estado ───
  function mostrarMensaje(texto) {
    if (!abierto) return;
    const el = document.getElementById("combate-mensaje");
    if (el) el.textContent = texto;
  }

  // ─── Registrar callback de huir ───
  function onHuir(callback) {
    callbacks.huir = callback;
  }

  // ─── ¿Está abierto? ───
  function estaAbierto() {
    return abierto;
  }

  // ─── Pedir confirmación antes de huir ───
  //  callback(true)  → confirma huida
  //  callback(false) → cancela
    function confirmarHuida(probabilidad, callback) {
    if (!abierto) return;
    const cont = document.getElementById("combate-mensaje");
    if (!cont) return;

    const mensajeAnterior = cont.textContent;
    const probPct = Math.round(probabilidad * 100);

    cont.innerHTML = `
      <div id="combate-confirmar-huida">
        <span>¿De verdad querés huir?</span>
        <button id="combate-confirmar-si" class="btn-combate-si">SÍ, huir (${probPct}%)</button>
        <button id="combate-confirmar-no" class="btn-combate-no">NO, seguir</button>
      </div>
    `;

    document.getElementById("combate-confirmar-si").addEventListener("click", () => {
      callback(true);
    });

    document.getElementById("combate-confirmar-no").addEventListener("click", () => {
      cont.textContent = mensajeAnterior;
      callback(false);
    });
  }

  return {
    abrir,
    cerrar,
    actualizarHPJugador,
    actualizarHPMob,
    mostrarMensaje,
    onHuir,
    estaAbierto,
    confirmarHuida,
  };
})();