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
//    CombateUI.actualizarCombo(perfectos)
//    CombateUI.actualizarUltimoGolpe(objetivo, cantidad, tipo)
//    CombateUI.agregarHistorial(tipo, texto)
//    CombateUI.registrarCuracion(cantidad, fuente)
//    CombateUI.mostrarMensaje(texto)
//    CombateUI.onHuir(callback)           → registra callback del botón Huir
//    CombateUI.estaAbierto()
// ═══════════════════════════════════════════════════════════════

window.CombateUI = (() => {
  let abierto = false;
  let contenedor = null;
  let derrotaContenedor = null;
  let victoriaContenedor = null;
  let avisoContenedor = null;
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
    const totalCombo = typeof COMBATE !== "undefined" ? COMBATE.PERFECTOS_PARA_COMBO : 3;
    const slotsCombo = Array.from(
      { length: totalCombo },
      () => `<span class="combate-combo-slot"></span>`
    ).join("");

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
            <div class="combate-ultimo-golpe" id="combate-jugador-ultimo-golpe"></div>
            <div id="combate-combo" aria-label="Perfectos consecutivos">
              <span class="combate-combo-label">PERFECTOS</span>
              <span id="combate-combo-slots">${slotsCombo}</span>
              <span id="combate-combo-texto">0 / ${totalCombo}</span>
            </div>
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
            <div class="combate-ultimo-golpe" id="combate-mob-ultimo-golpe"></div>
          </div>
        </div>

        <!-- Mensaje / turno actual -->
        <div id="combate-mensaje">Iniciando combate...</div>

        <!-- Historial de la batalla -->
        <div id="combate-historial" role="log" aria-live="polite">
          <div id="combate-historial-titulo">HISTORIAL DE COMBATE</div>
          <div id="combate-historial-lista"></div>
        </div>

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
    actualizarCombo(0);
  }

  // ─── Aviso inicial antes del primer timing ───
  function mostrarAvisoInicial(nombreMob, emojiMob) {
    if (!abierto || !contenedor || avisoContenedor) return;

    const aviso = document.createElement("div");
    aviso.id = "combate-aviso";
    aviso.setAttribute("role", "alert");
    aviso.innerHTML = `
      <div id="combate-aviso-emoji">${emojiMob || "⚠️"}</div>
      <div id="combate-aviso-texto">¡Atención! <strong>${nombreMob}</strong> te va a atacar.</div>
      <div id="combate-aviso-prep">¡PREPÁRATE!</div>
      <div id="combate-aviso-hint">La barra de ataque aparecerá en un instante...</div>
    `;
    contenedor.appendChild(aviso);
    avisoContenedor = aviso;

    // Durante el aviso no se puede huir: primero hay que prepararse.
    const btnHuir = document.getElementById("combate-btn-huir");
    if (btnHuir) btnHuir.disabled = true;
  }

  function ocultarAvisoInicial() {
    if (!avisoContenedor) return;

    if (avisoContenedor.parentNode) {
      avisoContenedor.parentNode.removeChild(avisoContenedor);
    }
    avisoContenedor = null;

    const btnHuir = document.getElementById("combate-btn-huir");
    if (btnHuir) btnHuir.disabled = false;
  }

  // ─── Cerrar el overlay ───
  //  mantenerPausa: true → no reanudar (pantalla de derrota).
  function cerrar(mantenerPausa = false) {
  if (!abierto) return;
  abierto = false;

  // ─── Reanudar el juego (salvo que se mantenga la pausa) ───
  if (!mantenerPausa && typeof estado !== "undefined") {
    estado.pausado = false;
  }

  if (contenedor && contenedor.parentNode) {
    contenedor.parentNode.removeChild(contenedor);
  }
  contenedor = null;
  avisoContenedor = null;
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

  // ─── Actualizar combo de perfectos ───
  function actualizarCombo(perfectos) {
    if (!abierto) return;
    const total = typeof COMBATE !== "undefined" ? COMBATE.PERFECTOS_PARA_COMBO : 3;
    const multiplicador = typeof COMBATE !== "undefined" ? COMBATE.MULTIPLICADOR_COMBO : 1.5;
    const valor = Math.max(0, Math.min(total, perfectos || 0));
    const combo = document.getElementById("combate-combo");
    const texto = document.getElementById("combate-combo-texto");
    const slots = document.querySelectorAll("#combate-combo-slots .combate-combo-slot");

    slots.forEach((slot, i) => {
      slot.classList.toggle("activo", i < valor);
    });

    if (combo) combo.classList.toggle("combo-listo", valor >= total);
    if (texto) {
      texto.textContent = valor >= total
        ? `¡LISTO! ×${multiplicador}`
        : `${valor} / ${total}`;
    }
  }

  // ─── Último golpe recibido por jugador o mob ───
  function actualizarUltimoGolpe(objetivo, cantidad, tipo = "dano") {
    if (!abierto) return;
    const el = document.getElementById(`combate-${objetivo}-ultimo-golpe`);
    if (!el) return;

    const valor = Math.abs(Number(cantidad) || 0);
    const numero = Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
    el.classList.remove("negativo", "positivo", "alerta", "visible");

    if (tipo === "bloqueo") {
      el.textContent = "BLOQUEO";
      el.classList.add("positivo");
    } else if (tipo === "fallo") {
      el.textContent = "SIN DAÑO";
      el.classList.add("alerta");
    } else if (tipo === "curacion") {
      el.textContent = `+${numero} HP`;
      el.classList.add("positivo");
    } else {
      el.textContent = `−${numero} HP`;
      el.classList.add("negativo");
    }

    el.classList.add("visible");
  }

  // ─── Historial de la batalla ───
  function agregarHistorial(tipo, texto) {
    if (!abierto || !texto) return;
    const lista = document.getElementById("combate-historial-lista");
    if (!lista) return;

    const entrada = document.createElement("div");
    entrada.className = `historial-entrada ${tipo || "sistema"}`;
    entrada.textContent = texto;
    lista.appendChild(entrada);

    while (lista.children.length > 24) {
      lista.removeChild(lista.firstChild);
    }

    const panel = document.getElementById("combate-historial");
    if (panel) panel.scrollTop = panel.scrollHeight;
  }

  // ─── Curación (para ítems/efectos futuros) ───
  function registrarCuracion(cantidad, fuente = "Curación") {
    const valor = Math.abs(Number(cantidad) || 0);
    if (valor <= 0) return;
    actualizarUltimoGolpe("jugador", valor, "curacion");
    const numero = Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
    agregarHistorial("positivo", `${fuente} = +${numero} HP.`);
  }

  // ─── Mostrar mensaje de estado ───
  function mostrarMensaje(texto) {
    if (!abierto) return;
    const el = document.getElementById("combate-mensaje");
    if (el) el.textContent = texto;
  }

  // ─── Telegráfico: anuncia el ataque que va a usar el mob ───
  function mostrarTelegrafo(nombreMob, ataque) {
    if (!abierto || !ataque) return;
    const el = document.getElementById("combate-mensaje");
    if (!el) return;

    el.innerHTML = `
      <div id="combate-telegrafo">
        <span id="combate-telegrafo-emoji">${ataque.emoji || "⚠️"}</span>
        <span id="combate-telegrafo-texto"><strong>${nombreMob}</strong> prepara <strong>${ataque.nombre}</strong></span>
        <span id="combate-telegrafo-hint">¡Preparate para defenderte!</span>
      </div>
    `;
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

  // ─── Marcar al mob como derrotado (animación + fade) ───
  function marcarMuerteMob() {
    if (!abierto) return;
    const panel = document.getElementById("combate-mob");
    if (panel) panel.classList.add("combate-mob-muerto");

    const btnHuir = document.getElementById("combate-btn-huir");
    if (btnHuir) {
      btnHuir.disabled = true;
      btnHuir.textContent = "💀 Derrotado";
    }
  }

  // ─── Pantalla de derrota con botón de reinicio ───
  function mostrarDerrota(datos) {
    if (derrotaContenedor) return;

    const {
      nombreMob = "El enemigo",
      hp = 0,
      hpMax = 20,
      onReiniciar = null,
    } = datos || {};

    const cont = document.createElement("div");
    cont.id = "derrota-overlay";
    cont.innerHTML = `
      <div id="derrota-panel">
        <div id="derrota-icono">💀</div>
        <div id="derrota-titulo">DERROTA</div>
        <div id="derrota-mensaje"></div>
        <div id="derrota-hp"></div>
        <button id="derrota-btn-reiniciar">🔄 Reiniciar mundo</button>
        <div id="derrota-hint">Se reinicia con la misma semilla.</div>
      </div>
    `;
    document.body.appendChild(cont);
    derrotaContenedor = cont;

    const mensaje = document.getElementById("derrota-mensaje");
    const hpTexto = document.getElementById("derrota-hp");
    if (mensaje) mensaje.textContent = `${nombreMob} te derrotó.`;
    if (hpTexto) hpTexto.textContent = `HP final: ${Math.ceil(hp)} / ${hpMax}`;

    const btn = document.getElementById("derrota-btn-reiniciar");
    if (btn) {
      btn.addEventListener("click", () => {
        if (typeof onReiniciar === "function") onReiniciar();
      });
      setTimeout(() => btn.focus(), 60);
    }

    requestAnimationFrame(() => cont.classList.add("visible"));
  }

  // ─── Quitar la pantalla de derrota ───
  function ocultarDerrota() {
    if (derrotaContenedor && derrotaContenedor.parentNode) {
      derrotaContenedor.parentNode.removeChild(derrotaContenedor);
    }
    derrotaContenedor = null;
  }

  // ─── Resumen de victoria ───
  function mostrarVictoria(datos) {
    if (victoriaContenedor) return;

    const {
      nombreMob = "El enemigo",
      xp = 0,
      items = [],
      onContinuar = null,
    } = datos || {};

    const totalObjetos = items.reduce(
      (total, item) => total + (Number(item.cantidad) || 0),
      0
    );
    const textoObjetos = totalObjetos === 0
      ? "ningún objeto"
      : (totalObjetos === 1 ? "1 objeto" : `${totalObjetos} objetos`);
    const itemsHTML = items.length > 0
      ? items.map((item) => `
        <li>
          <span class="victoria-item-icono">${item.icono}</span>
          <span class="victoria-item-nombre">${item.nombre}</span>
          <span class="victoria-item-cantidad">x${item.cantidad}</span>
        </li>
      `).join("")
      : `<li><span class="victoria-item-icono">—</span><span class="victoria-item-nombre">Sin drops esta vez</span><span class="victoria-item-cantidad">—</span></li>`;

    const cont = document.createElement("div");
    cont.id = "victoria-overlay";
    cont.innerHTML = `
      <div id="victoria-panel">
        <div id="victoria-icono">🏆</div>
        <div id="victoria-titulo">¡HAS GANADO!</div>
        <div id="victoria-mensaje">Derrotaste a <strong>${nombreMob}</strong>.</div>
        <div id="victoria-resumen">
          Adquiriste <strong>${xp} experiencia</strong>.<br>
          Recibiste <strong>${textoObjetos}</strong>.
        </div>
        <div id="victoria-desglose">
          <div id="victoria-desglose-titulo">Desglose de recompensas</div>
          <ul id="victoria-lista">
            <li>
              <span class="victoria-item-icono">✨</span>
              <span class="victoria-item-nombre">Experiencia</span>
              <span class="victoria-item-cantidad">+${xp} XP</span>
            </li>
            ${itemsHTML}
          </ul>
        </div>
        <button id="victoria-btn-continuar">Continuar</button>
        <div id="victoria-hint">XP y drops reales (F13) · presioná I para abrir el menú del jugador.</div>
      </div>
    `;
    document.body.appendChild(cont);
    victoriaContenedor = cont;

    const btn = document.getElementById("victoria-btn-continuar");
    if (btn) {
      btn.addEventListener("click", () => {
        ocultarVictoria();
        if (typeof onContinuar === "function") onContinuar();
      });
      setTimeout(() => btn.focus(), 60);
    }

    requestAnimationFrame(() => cont.classList.add("visible"));
  }

  function ocultarVictoria() {
    if (victoriaContenedor && victoriaContenedor.parentNode) {
      victoriaContenedor.parentNode.removeChild(victoriaContenedor);
    }
    victoriaContenedor = null;
  }

  return {
    abrir,
    cerrar,
    actualizarHPJugador,
    actualizarHPMob,
    actualizarCombo,
    actualizarUltimoGolpe,
    agregarHistorial,
    registrarCuracion,
    mostrarMensaje,
    mostrarTelegrafo,
    onHuir,
    estaAbierto,
    confirmarHuida,
    mostrarAvisoInicial,
    ocultarAvisoInicial,
    marcarMuerteMob,
    mostrarDerrota,
    ocultarDerrota,
    mostrarVictoria,
    ocultarVictoria,
  };
})();