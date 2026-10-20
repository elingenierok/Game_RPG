// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.14 · LÓGICA DE COMBATE (v2.5-alpha · F28 fase 5)
// ─────────────────────────────────────────────────────────────────
//  Combate por turnos con minijuego de timing.
//
//  Flujo:
//    1. iniciarCombate(mob) → abre overlay, pausa
//    2. turnoJugador() → barra de timing (ataque)
//    3. Aplica daño al mob + efecto
//    4. Si el mob muere → cerrarCombate("muerte_mob")
//    5. turnoMob() → barra de timing (defensa)
//    6. Aplica daño al jugador + efecto
//    7. Si el jugador muere → cerrarCombate("muerte_jugador")
//    8. Vuelve a turnoJugador()
//
//  Huir: cierra el overlay, mantiene el HP del mob.
// ═══════════════════════════════════════════════════════════════

const estadoCombate = {
  activo: false,
  mob: null,
  turnoActual: null,
  pausado: false,             // true mientras hay confirmación de huida abierta
  derrota: false,             // true mientras se muestra la pantalla de derrota
  timeoutPendiente: null,     // ID del setTimeout entre turnos (para poder cancelarlo)
};

const COMBATE = {
  DURACION_TIMING_MS: 1500,
  DELAY_ENTRE_TURNOS_MS: 800,
  DELAY_MENSAJE_MS: 600,
  DELAY_MUERTE_MOB_MS: 900,
};
// ═══════════════════════════════════════════════════════════════
//  FÓRMULAS DE HUIDA (placeholder · F30 futuro)
// ─────────────────────────────────────────────────────────────────
//  Por ahora el "nivel" del mob se calcula de sus stats.
//  El "nivel" del jugador es 1 (placeholder).
//  Cuando exista el sistema de niveles real (F30), se reemplaza.
// ═══════════════════════════════════════════════════════════════

// Nivel del mob (calculado de sus stats: hp + ataque + defensa)
function calcularNivelMob(mob) {
  const datos = MOBS[mob.tipo];
  if (!datos) return 1;
  return Math.max(1, Math.floor((datos.hp + datos.ataque + datos.defensa) / 4));
}

// Probabilidad de huida (0.1 a 0.9)
//   +5% por cada nivel de diferencia a favor del jugador
//   -5% por cada nivel de diferencia en contra
function calcularProbHuida(nivelJug, nivelMob) {
  const prob = 0.5 + (nivelJug - nivelMob) * 0.05;
  return Math.max(0.1, Math.min(0.9, prob));
}

// Penalización de huida (% del hpMax, de 2% a 40%)
//   Base 5% + 1% por cada nivel del mob por encima del jugador
//   Mínimo 2% (nunca es gratis huir)
//   Máximo 40% (huir de algo mucho más fuerte duele)
function calcularPenalizacionHuida(nivelJug, nivelMob) {
  return Math.max(2, Math.min(40, 5 + (nivelMob - nivelJug)));
}

// Etiqueta de calidad para el feedback de precisión.
function etiquetaPrecision(precision) {
  if (precision >= 0.8) return "✨ ¡PERFECTO!";
  if (precision >= 0.4) return "👍 Bien.";
  return "😕 Débil.";
}

// ═══════════════════════════════════════════════════════════════
//  INICIAR COMBATE
// ═══════════════════════════════════════════════════════════════
function iniciarCombate(mob) {
  if (estadoCombate.activo) return;
  if (estadoCombate.derrota) return;
  if (estado.ganado) return;
  if (estado.jugador.hp <= 0) return;
  if (!mob) return;

  // Copiar HP del mob si no existe (hpActual)
  if (mob.hpActual === undefined) mob.hpActual = mob.hp;
  if (mob.hpMax === undefined) mob.hpMax = mob.hp;

  estadoCombate.activo = true;
  estadoCombate.mob = mob;

  // Abrir overlay (también pausa el juego)
  CombateUI.abrir(estado.jugador, mob);

  // ─── Huir con probabilidad + penalización (F28 fix 3) ───
  CombateUI.onHuir(() => {
    if (estadoCombate.pausado) return;
    if (estado.jugador.hp <= 0) return;
    if (estadoCombate.mob && estadoCombate.mob.hpActual <= 0) return;
    estadoCombate.pausado = true;
    if (estadoCombate.timeoutPendiente) {
      clearTimeout(estadoCombate.timeoutPendiente);
      estadoCombate.timeoutPendiente = null;
    }
    if (typeof BarraTiming !== "undefined") BarraTiming.cancelar();

    const nivelMob = calcularNivelMob(estadoCombate.mob);
    const nivelJug = estado.jugador.nivel || 1;
    const prob = calcularProbHuida(nivelJug, nivelMob);

    CombateUI.confirmarHuida(prob, (confirmar) => {
      if (confirmar) {
        intentarHuir(nivelJug, nivelMob, prob);
      } else {
        estadoCombate.pausado = false;
        if (estadoCombate.turnoActual === "jugador") turnoJugador();
        else if (estadoCombate.turnoActual === "mob") turnoMob();
        else turnoJugador();
      }
    });
  });

  CombateUI.mostrarMensaje("¡Combate iniciado!");

  // Primer turno después de un momento
  setTimeout(() => turnoJugador(), COMBATE.DELAY_MENSAJE_MS);
}

// ═══════════════════════════════════════════════════════════════
//  TURNO DEL JUGADOR (ataque)
// ═══════════════════════════════════════════════════════════════
function turnoJugador() {
  if (!estadoCombate.activo) return;
  if (estadoCombate.pausado) return;   // ← nuevo
  if (estadoCombate.derrota) return;
  if (estado.jugador.hp <= 0) {
    cerrarCombate("muerte_jugador");
    return;
  }

  estadoCombate.turnoActual = "jugador";
  CombateUI.mostrarMensaje("Tu turno: ¡Atacá!");

  BarraTiming.iniciar({
    duracionMs: COMBATE.DURACION_TIMING_MS,
    titulo: "¡Atacá!",
    onResultado: (precision) => {
      if (!estadoCombate.activo) return;
      if (estadoCombate.pausado) return;   // ← nuevo
      if (estadoCombate.derrota) return;
      if (estado.jugador.hp <= 0) {
        cerrarCombate("muerte_jugador");
        return;
      }

      const datosMob = MOBS[estadoCombate.mob.tipo];
      const ataque = estado.jugador.ataque;
      const defensa = datosMob.defensa;
      const multiplicador = precision * 2;
      const daño = Math.max(1, ataque - defensa) * multiplicador;

      if (daño <= 0.1) {
        CombateUI.mostrarMensaje("¡Fallaste! (sin daño)");
      } else {
        aplicarDañoAlMob(daño);
        CombateUI.mostrarMensaje(`${etiquetaPrecision(precision)} Daño: ${daño.toFixed(1)}`);
      }

      // ─── Muerte del mob: mostrar feedback y cerrar con delay ───
      if (estadoCombate.mob.hpActual <= 0) {
        const nombreMob = datosMob.nombre || "Mob";
        CombateUI.mostrarMensaje(`💀 ¡Derrotaste al ${nombreMob}!`);
        if (typeof CombateUI.marcarMuerteMob === "function") {
          CombateUI.marcarMuerteMob();
        }

        estadoCombate.timeoutPendiente = setTimeout(() => {
          estadoCombate.timeoutPendiente = null;
          if (!estadoCombate.activo) return;
          cerrarCombate("muerte_mob");
        }, COMBATE.DELAY_MUERTE_MOB_MS);
        return;
      }

      estadoCombate.timeoutPendiente = setTimeout(() => {
        estadoCombate.timeoutPendiente = null;
        if (!estadoCombate.activo) return;
        if (estadoCombate.pausado) return;   // ← nuevo
        if (estadoCombate.derrota) return;
        if (estado.jugador.hp <= 0) {
          cerrarCombate("muerte_jugador");
          return;
        }
        turnoMob();
      }, COMBATE.DELAY_ENTRE_TURNOS_MS);
    }
  });
}

// ═══════════════════════════════════════════════════════════════
//  TURNO DEL MOB (defensa del jugador)
// ═══════════════════════════════════════════════════════════════
function turnoMob() {
  if (!estadoCombate.activo) return;
  if (estadoCombate.pausado) return;   // ← nuevo
  if (estadoCombate.derrota) return;
  if (estado.jugador.hp <= 0) {
    cerrarCombate("muerte_jugador");
    return;
  }

  estadoCombate.turnoActual = "mob";
  CombateUI.mostrarMensaje("El mob contraataca. ¡Defendete!");

  BarraTiming.iniciar({
    duracionMs: COMBATE.DURACION_TIMING_MS,
    titulo: "¡Defendete!",
    onResultado: (precision) => {
      if (!estadoCombate.activo) return;
      if (estadoCombate.pausado) return;   // ← nuevo
      if (estadoCombate.derrota) return;

      const datosMob = MOBS[estadoCombate.mob.tipo];
      const ataque = datosMob.ataque;
      const defensa = estado.jugador.defensa;
      const reduccion = precision;
      const daño = Math.max(1, ataque - defensa) * (1 - reduccion);

      if (daño <= 0.1) {
        CombateUI.mostrarMensaje("🛡️ ¡Bloqueo perfecto! Sin daño.");
      } else {
        aplicarDañoAlJugador(daño);
        const bloqueo = precision >= 0.8 ? "🛡️ ¡Gran bloqueo!" :
                        precision >= 0.4 ? "🛡️ Bloqueaste parte del daño." :
                        "💥 ¡Te golpearon fuerte!";
        CombateUI.mostrarMensaje(`${bloqueo} -${daño.toFixed(1)} HP`);
      }

      // Si el golpe mató al jugador, cerrar apenas se vea el mensaje.
      if (estado.jugador.hp <= 0) {
        estadoCombate.timeoutPendiente = setTimeout(() => {
          estadoCombate.timeoutPendiente = null;
          if (!estadoCombate.activo) return;
          cerrarCombate("muerte_jugador");
        }, COMBATE.DELAY_MENSAJE_MS);
        return;
      }

      estadoCombate.timeoutPendiente = setTimeout(() => {
        estadoCombate.timeoutPendiente = null;
        if (!estadoCombate.activo) return;
        if (estadoCombate.pausado) return;   // ← nuevo
        if (estadoCombate.derrota) return;
        if (estado.jugador.hp <= 0) {
          cerrarCombate("muerte_jugador");
          return;
        }
        turnoJugador();
      }, COMBATE.DELAY_ENTRE_TURNOS_MS);
    }
  });
}

// ═══════════════════════════════════════════════════════════════
//  APLICAR DAÑO
// ═══════════════════════════════════════════════════════════════
function aplicarDañoAlMob(daño) {
  const mob = estadoCombate.mob;
  mob.hpActual = Math.max(0, mob.hpActual - daño);
  CombateUI.actualizarHPMob(mob.hpActual, mob.hpMax);

  // Efecto visual en el mob
  if (typeof aplicarEfecto === "function") {
    aplicarEfecto(mob.wx, mob.wy, "efecto-ataque", 500);
  }
}

function aplicarDañoAlJugador(daño) {
  estado.jugador.hp = Math.max(0, estado.jugador.hp - daño);
  CombateUI.actualizarHPJugador(estado.jugador.hp, estado.jugador.hpMax);

  // Efecto visual en el jugador
  if (typeof aplicarEfecto === "function") {
    aplicarEfecto(estado.jugador.wx, estado.jugador.wy, "efecto-danio", 500);
  }

  // Actualizar HUD principal
  if (typeof actualizarHUD === "function") actualizarHUD();
}
// ═══════════════════════════════════════════════════════════════
//  INTENTAR HUIR (roll de probabilidad + penalización)
// ═══════════════════════════════════════════════════════════════
function intentarHuir(nivelJug, nivelMob, prob) {
  const exito = Math.random() < prob;
  console.log(`🎲 Huida: ${(prob * 100).toFixed(0)}% → ${exito ? "ÉXITO" : "FALLO"}`);

  // ─── Fallo: el mob ataca (turno del mob) ───
  if (!exito) {
    CombateUI.mostrarMensaje("¡Fallaste al huir! El mob ataca.");
    estadoCombate.timeoutPendiente = setTimeout(() => {
      estadoCombate.timeoutPendiente = null;
      if (!estadoCombate.activo) return;
      estadoCombate.pausado = false;
      turnoMob();
    }, COMBATE.DELAY_ENTRE_TURNOS_MS);
    return;
  }

  // ─── Éxito: penalización + mob desaparece ───
  const penPct = calcularPenalizacionHuida(nivelJug, nivelMob);
  const hpPerdido = Math.max(1, Math.ceil((estado.jugador.hpMax * penPct) / 100));

  estado.jugador.hp = Math.max(0, estado.jugador.hp - hpPerdido);
  if (typeof actualizarHUD === "function") actualizarHUD();
  if (typeof aplicarEfecto === "function") {
    aplicarEfecto(estado.jugador.wx, estado.jugador.wy, "efecto-danio", 500);
  }

  // Verificar si la penalización mató al jugador
  if (estado.jugador.hp <= 0) {
    CombateUI.mostrarMensaje(`¡Huiste pero moriste! (-${hpPerdido} HP)`);
    estadoCombate.timeoutPendiente = setTimeout(() => {
      estadoCombate.timeoutPendiente = null;
      if (!estadoCombate.activo) return;
      cerrarCombate("muerte_jugador");
    }, COMBATE.DELAY_MENSAJE_MS);
    return;
  }

  // Remover el mob del chunk (desaparece)
  const mob = estadoCombate.mob;
  if (typeof removerMobEn === "function" && mob) {
    removerMobEn(mob.wx, mob.wy);
  }

  CombateUI.mostrarMensaje(`¡Huiste! -${hpPerdido} HP (${penPct}%)`);

  estadoCombate.timeoutPendiente = setTimeout(() => {
    estadoCombate.timeoutPendiente = null;
    if (!estadoCombate.activo) return;
    cerrarCombate("huida");
    if (typeof mostrarCartelRapido === "function") {
      mostrarCartelRapido(`🏃 Huiste (-${hpPerdido} HP)`);
    }
  }, COMBATE.DELAY_MENSAJE_MS);
}

// ═══════════════════════════════════════════════════════════════
//  CERRAR COMBATE
// ═══════════════════════════════════════════════════════════════
function cerrarCombate(motivo) {
  if (!estadoCombate.activo) return;

  // La muerte del jugador tiene prioridad sobre la victoria contra el mob.
  if (motivo === "muerte_mob" && estado.jugador.hp <= 0) {
    motivo = "muerte_jugador";
  }
  const muerteJugador = motivo === "muerte_jugador";

  const mob = estadoCombate.mob;
  estadoCombate.activo = false;
  estadoCombate.mob = null;
  estadoCombate.turnoActual = null;
  estadoCombate.pausado = false;
  if (muerteJugador) estadoCombate.derrota = true;

  // Cancelar timeout pendiente (si lo hay)
  if (estadoCombate.timeoutPendiente) {
    clearTimeout(estadoCombate.timeoutPendiente);
    estadoCombate.timeoutPendiente = null;
  }

  // Cancelar barra de timing (por si quedó activa)
  if (typeof BarraTiming !== "undefined") BarraTiming.cancelar();

  CombateUI.cerrar(muerteJugador);

  // En derrota el juego queda bloqueado hasta reiniciar el mundo.
  if (muerteJugador) {
    estado.pausado = true;
    if (typeof pausarTicks === "function") pausarTicks();
  } else {
    if (typeof reanudarTicks === "function") reanudarTicks();
  }

  // ─── Según el motivo ───
  if (motivo === "muerte_mob") {
    if (typeof derrotarMobEn === "function" && mob) {
      derrotarMobEn(mob.wx, mob.wy);
    }
    if (typeof mostrarCartelRapido === "function") {
      const datosMob = mob && typeof MOBS !== "undefined" ? MOBS[mob.tipo] : null;
      const nombreMob = datosMob && datosMob.nombre ? datosMob.nombre : "Mob";
      mostrarCartelRapido(`💀 ${nombreMob} derrotado`);
    }
    if (typeof forzarRedibujadoGrid === "function") forzarRedibujadoGrid();
    if (typeof render === "function") render();

    } else if (motivo === "huida") {
    // El cartel ya se mostró en intentarHuir (con el -HP)

  } else if (motivo === "muerte_jugador") {
    mostrarPantallaDerrota(mob);

  } else if (motivo === "cancelado") {
    // Sin mensaje (reinicio)
  }
}

// ═══════════════════════════════════════════════════════════════
//  PANTALLA DE DERROTA
// ═══════════════════════════════════════════════════════════════
// ─── Guardia global de muerte ───
//  Si el HP llega a 0 en cualquier momento (incluso en medio de una barra),
//  cierra el combate y muestra la derrota sin permitir otro ataque.
function verificarMuerteJugador() {
  if (estado.jugador.hp > 0) return;
  if (estado.ganado) return;
  if (estadoCombate.derrota) return;

  if (estadoCombate.activo) {
    cerrarCombate("muerte_jugador");
  } else {
    mostrarPantallaDerrota();
  }
}

function mostrarPantallaDerrota(mobDerrotante) {
  // Bloquear combate, IA y movimiento durante la pantalla de derrota.
  estadoCombate.derrota = true;
  estado.pausado = true;
  if (typeof pausarTicks === "function") pausarTicks();

  const datosMob = mobDerrotante && typeof MOBS !== "undefined"
    ? MOBS[mobDerrotante.tipo]
    : null;
  const nombreMob = datosMob && datosMob.nombre ? datosMob.nombre : "El enemigo";

  if (typeof CombateUI !== "undefined" && typeof CombateUI.mostrarDerrota === "function") {
    CombateUI.mostrarDerrota({
      nombreMob,
      hp: estado.jugador.hp,
      hpMax: estado.jugador.hpMax,
      onReiniciar: () => {
        if (typeof reiniciarMundo === "function") reiniciarMundo(SEMILLA);
      },
    });
    return;
  }

  // Fallback mínimo si la UI de derrota no está disponible.
  const overlay = document.getElementById("overlay");
  const titulo = document.getElementById("ovTitulo");
  const subtitulo = document.getElementById("ovSubtitulo");
  if (overlay && titulo && subtitulo) {
    titulo.textContent = "💀 DERROTA";
    subtitulo.textContent = `HP: ${Math.ceil(estado.jugador.hp)} / ${estado.jugador.hpMax} · recargá la página`;
    overlay.classList.add("visible");
  }
}

// ═══════════════════════════════════════════════════════════════
//  CANCELAR COMBATE (al reiniciar mundo)
// ═══════════════════════════════════════════════════════════════
function cancelarCombateSiActivo() {
  if (estadoCombate.activo) cerrarCombate("cancelado");
  reiniciarEstadoCombate();
}

// ─── Reset completo del estado de combate (al reiniciar el mundo) ───
function reiniciarEstadoCombate() {
  estadoCombate.derrota = false;
  estadoCombate.pausado = false;
  estadoCombate.turnoActual = null;

  if (estadoCombate.timeoutPendiente) {
    clearTimeout(estadoCombate.timeoutPendiente);
    estadoCombate.timeoutPendiente = null;
  }

  if (typeof CombateUI !== "undefined" && typeof CombateUI.ocultarDerrota === "function") {
    CombateUI.ocultarDerrota();
  }

  if (typeof BarraTiming !== "undefined") BarraTiming.cancelar();
  if (typeof estado !== "undefined") estado.pausado = false;
  if (typeof reanudarTicks === "function") reanudarTicks();
}
