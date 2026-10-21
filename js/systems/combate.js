// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.14 · LÓGICA DE COMBATE (v2.7-alpha · F28.2)
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
  victoria: false,            // true mientras se muestra el resumen de victoria
  timeoutPendiente: null,     // ID del setTimeout entre turnos (para poder cancelarlo)
  ultimoAtaque: null,         // ID del último ataque del mob (para no repetirlo)
  ataqueActual: null,         // ataque del turno mob en curso (se reutiliza si se cancela Huir)
  perfectosSeguidos: 0,       // perfectos consecutivos del jugador (0..3)
};

const COMBATE = {
  DURACION_TIMING_MS: 1500,
  DELAY_ENTRE_TURNOS_MS: 800,
  DELAY_MENSAJE_MS: 600,
  DELAY_MUERTE_MOB_MS: 900,
  DELAY_AVISO_MS: 1800,
  DELAY_TELEGRAFO_MS: 900,
  PERFECTOS_PARA_COMBO: 3,
  MULTIPLICADOR_COMBO: 1.5,
};

// ─── Catálogo de ataques de mob ───
//  Cada mob declara sus ataques en el tema con IDs ATAQUE_N.
//  Los perfiles cambian la velocidad y el ancho de la barra de defensa.
//  mitigacionMaxima (0-1) = fracción máxima del daño que puede bloquear la barra.
//    Ej: 0.5 → incluso con precisión 1, entra la mitad del daño.
//  categoria = "normal" | "boss" (los bosses usan ATAQUE_BOSS_N).
const ATAQUES_MOB = {
  ATAQUE_1: {
    id: "ATAQUE_1",
    nombre: "Zarpazo",
    emoji: "🐾",
    descripcion: "Rápido y angosto",
    duracionMs: 1100,
    zonaPerfecta: 12,
    zonaAceptable: 14,
  },
  ATAQUE_2: {
    id: "ATAQUE_2",
    nombre: "Embestida",
    emoji: "💥",
    descripcion: "Lento y amplio",
    duracionMs: 1700,
    zonaPerfecta: 32,
    zonaAceptable: 18,
  },
  ATAQUE_3: {
    id: "ATAQUE_3",
    nombre: "Mordida",
    emoji: "🦷",
    descripcion: "Precisión normal",
    duracionMs: 1400,
    zonaPerfecta: 20,
    zonaAceptable: 15,
  },
  ATAQUE_4: {
    id: "ATAQUE_4",
    nombre: "Disparo",
    emoji: "🎯",
    descripcion: "Muy rápido y angosto",
    duracionMs: 950,
    zonaPerfecta: 8,
    zonaAceptable: 10,
  },
  ATAQUE_5: {
    id: "ATAQUE_5",
    nombre: "Golpe contundente",
    emoji: "💢",
    descripcion: "Muy rápido y barras finas",
    duracionMs: 800,
    zonaPerfecta: 6,
    zonaAceptable: 8,
  },
  ATAQUE_6: {
    id: "ATAQUE_6",
    nombre: "Picotazo",
    emoji: "🐔",
    descripcion: "Rápido y preciso",
    duracionMs: 1000,
    zonaPerfecta: 16,
    zonaAceptable: 16,
  },
  ATAQUE_7: {
    id: "ATAQUE_7",
    nombre: "Tentáculo",
    emoji: "🐙",
    descripcion: "Amplio y envolvente",
    duracionMs: 1600,
    zonaPerfecta: 28,
    zonaAceptable: 18,
  },
  ATAQUE_8: {
    id: "ATAQUE_8",
    nombre: "Golpe",
    emoji: "👊",
    descripcion: "50% del daño es imbloqueable",
    duracionMs: 1200,
    zonaPerfecta: 16,
    zonaAceptable: 14,
    mitigacionMaxima: 0.5,
  },
  ATAQUE_BOSS_1: {
    id: "ATAQUE_BOSS_1",
    nombre: "Ataque especial",
    emoji: "☠️",
    descripcion: "Ataque de boss (placeholder)",
    categoria: "boss",
    duracionMs: 1000,
    zonaPerfecta: 10,
    zonaAceptable: 10,
  },
};

// Elige un ataque del mob, evitando repetir el anterior cuando sea posible.
function elegirAtaqueMob(mob) {
  const datosMob = mob && typeof MOBS !== "undefined" ? MOBS[mob.tipo] : null;
  const ids = mob && Array.isArray(mob.ataques) && mob.ataques.length
    ? mob.ataques
    : datosMob && Array.isArray(datosMob.ataques) && datosMob.ataques.length
      ? datosMob.ataques
      : ["ATAQUE_1"];

  let candidatos = ids;
  if (ids.length > 1) {
    const sinRepetir = ids.filter((id) => id !== estadoCombate.ultimoAtaque);
    if (sinRepetir.length > 0) candidatos = sinRepetir;
  }

  const id = candidatos[Math.floor(Math.random() * candidatos.length)];
  estadoCombate.ultimoAtaque = id;
  return ATAQUES_MOB[id] || ATAQUES_MOB.ATAQUE_1;
}

// Resuelve el combo de perfectos del jugador.
//   - 3 perfectos seguidos cargan el combo.
//   - El siguiente ataque (4.º) pega ×1.5 y consume la carga.
//   - Un ataque no perfecto reinicia la cadena.
function resolverComboPerfecto(precision) {
  const comboActivo = estadoCombate.perfectosSeguidos >= COMBATE.PERFECTOS_PARA_COMBO;
  let multiplicador = precision * 2;

  if (comboActivo) {
    multiplicador *= COMBATE.MULTIPLICADOR_COMBO;
    estadoCombate.perfectosSeguidos = 0;
  }

  if (precision >= 0.8) {
    estadoCombate.perfectosSeguidos = Math.min(
      COMBATE.PERFECTOS_PARA_COMBO,
      estadoCombate.perfectosSeguidos + 1
    );
  } else if (!comboActivo) {
    estadoCombate.perfectosSeguidos = 0;
  }

  return { multiplicador, comboActivo };
}
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

// Formato compacto para el historial y los indicadores de daño.
function formatearDanio(valor) {
  const abs = Math.abs(valor);
  return Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
}

// Snap de HP a medios puntos hacia arriba. Evita artefactos como 14.899999.
function redondearHP(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.ceil(n * 2 - 1e-9) / 2;
}

// ═══════════════════════════════════════════════════════════════
//  INICIAR COMBATE
// ═══════════════════════════════════════════════════════════════
function iniciarCombate(mob) {
  if (estadoCombate.activo) return;
  if (estadoCombate.derrota) return;
  if (estadoCombate.victoria) return;
  if (estado.ganado) return;
  if (estado.jugador.hp <= 0) return;
  if (!mob) return;

  // Copiar HP del mob si no existe (hpActual)
  if (mob.hpActual === undefined) mob.hpActual = mob.hp;
  if (mob.hpMax === undefined) mob.hpMax = mob.hp;

  estadoCombate.activo = true;
  estadoCombate.mob = mob;
  estadoCombate.ultimoAtaque = null;
  estadoCombate.ataqueActual = null;
  estadoCombate.perfectosSeguidos = 0;

  // Abrir overlay (también pausa el juego)
  CombateUI.abrir(estado.jugador, mob);

  // ─── Aviso inicial: dar tiempo a entender quién ataca ───
  const datosMob = typeof MOBS !== "undefined" ? MOBS[mob.tipo] : null;
  const nombreMob = datosMob && datosMob.nombre ? datosMob.nombre : "El enemigo";
  const emojiMob = datosMob && datosMob.emoji ? datosMob.emoji : "⚠️";

  CombateUI.mostrarAvisoInicial(nombreMob, emojiMob);
  if (typeof CombateUI.agregarHistorial === "function") {
    CombateUI.agregarHistorial("sistema", `Comienza el combate contra ${nombreMob} (${mob.hpActual} HP).`);
  }
  estadoCombate.turnoActual = "aviso";
  estadoCombate.timeoutPendiente = setTimeout(() => {
    estadoCombate.timeoutPendiente = null;
    if (!estadoCombate.activo || estadoCombate.derrota) return;
    if (estadoCombate.pausado) return;
    CombateUI.ocultarAvisoInicial();
    turnoJugador();
  }, COMBATE.DELAY_AVISO_MS);

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
        CombateUI.ocultarAvisoInicial();
        if (estadoCombate.turnoActual === "jugador") turnoJugador();
        else if (estadoCombate.turnoActual === "mob") turnoMob();
        else turnoJugador();
      }
    });
  });
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
  CombateUI.ocultarAvisoInicial();
  CombateUI.mostrarMensaje("Tu turno: ¡Atacá!");

  BarraTiming.iniciar({
    duracionMs: COMBATE.DURACION_TIMING_MS,
    modo: "ataque",
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
      const nombreMob = datosMob.nombre || "el mob";
      const precisionPct = Math.round(precision * 100);
      const combo = resolverComboPerfecto(precision);
      const daño = Math.max(1, ataque - defensa) * combo.multiplicador;

      if (typeof CombateUI.actualizarCombo === "function") {
        CombateUI.actualizarCombo(estadoCombate.perfectosSeguidos);
      }

      if (daño <= 0.1) {
        if (typeof CombateUI.actualizarUltimoGolpe === "function") {
          CombateUI.actualizarUltimoGolpe("mob", 0, "fallo");
        }
        if (typeof CombateUI.agregarHistorial === "function") {
          CombateUI.agregarHistorial("alerta", `Atacaste y fallaste (${precisionPct}% de precisión).`);
        }
        CombateUI.mostrarMensaje("¡Fallaste! (sin daño)");
      } else {
        aplicarDañoAlMob(daño);
        let etiqueta = etiquetaPrecision(precision);
        if (precision >= 0.8) {
          etiqueta += ` (${estadoCombate.perfectosSeguidos}/${COMBATE.PERFECTOS_PARA_COMBO})`;
        }
        if (combo.comboActivo) {
          etiqueta = `⚡ COMBO ×${COMBATE.MULTIPLICADOR_COMBO} · ${etiqueta}`;
        }
        CombateUI.mostrarMensaje(`${etiqueta} Daño: ${daño.toFixed(1)}`);

        if (typeof CombateUI.actualizarUltimoGolpe === "function") {
          CombateUI.actualizarUltimoGolpe("mob", -daño, "dano");
        }
        if (typeof CombateUI.agregarHistorial === "function") {
          const comboTexto = combo.comboActivo ? " ¡COMBO ×1.5!" : "";
          const listoTexto = estadoCombate.perfectosSeguidos >= COMBATE.PERFECTOS_PARA_COMBO
            ? " ¡Combo listo!"
            : "";
          CombateUI.agregarHistorial(
            "positivo",
            `Atacaste con ${etiquetaPrecision(precision)} (${precisionPct}% · ×${combo.multiplicador.toFixed(2)}) = -${formatearDanio(daño)} HP a ${nombreMob}.${comboTexto}${listoTexto}`
          );
        }
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
  if (estadoCombate.pausado) return;
  if (estadoCombate.derrota) return;
  if (estado.jugador.hp <= 0) {
    cerrarCombate("muerte_jugador");
    return;
  }

  estadoCombate.turnoActual = "mob";
  CombateUI.ocultarAvisoInicial();

  const datosMob = MOBS[estadoCombate.mob.tipo];
  const nombreMob = datosMob && datosMob.nombre ? datosMob.nombre : "El mob";
  const ataqueMob = estadoCombate.ataqueActual || elegirAtaqueMob(estadoCombate.mob);
  estadoCombate.ataqueActual = ataqueMob;

  // ─── Telegráfico: anunciar el ataque antes de abrir la barra ───
  CombateUI.mostrarTelegrafo(nombreMob, ataqueMob);

  estadoCombate.timeoutPendiente = setTimeout(() => {
    estadoCombate.timeoutPendiente = null;
    if (!estadoCombate.activo) return;
    if (estadoCombate.pausado) return;
    if (estadoCombate.derrota) return;
    if (estado.jugador.hp <= 0) {
      cerrarCombate("muerte_jugador");
      return;
    }
    iniciarDefensaMob(ataqueMob);
  }, COMBATE.DELAY_TELEGRAFO_MS);
}

function iniciarDefensaMob(ataqueMob) {
  if (!estadoCombate.activo) return;
  if (estadoCombate.pausado) return;
  if (estadoCombate.derrota) return;

  CombateUI.mostrarMensaje(`¡${ataqueMob.nombre}! ¡Defendete!`);

  BarraTiming.iniciar({
    duracionMs: ataqueMob.duracionMs,
    modo: "defensa",
    titulo: `${ataqueMob.emoji} ${ataqueMob.nombre}`,
    pista: `${ataqueMob.descripcion} · Espacio para bloquear`,
    zonaPerfecta: ataqueMob.zonaPerfecta,
    zonaAceptable: ataqueMob.zonaAceptable,
    onResultado: (precision) => {
      if (!estadoCombate.activo) return;
      if (estadoCombate.pausado) return;
      if (estadoCombate.derrota) return;

      estadoCombate.ataqueActual = null;

      const datosMob = MOBS[estadoCombate.mob.tipo];
      const ataque = datosMob.ataque;
      const defensa = estado.jugador.defensa;
      const mitigacionMaxima = ataqueMob.mitigacionMaxima !== undefined
        ? Math.max(0, Math.min(1, ataqueMob.mitigacionMaxima))
        : 1;
      const reduccion = precision * mitigacionMaxima;
      const daño = Math.max(1, ataque - defensa) * (1 - reduccion);
      const precisionPct = Math.round(precision * 100);
      const mitigacionPct = Math.round(mitigacionMaxima * 100);
      const imbloqueablePct = 100 - mitigacionPct;
      const nombreAtaque = `${ataqueMob.emoji || "⚠️"} ${ataqueMob.nombre || "Ataque"}`;

      if (daño <= 0.1) {
        if (typeof CombateUI.actualizarUltimoGolpe === "function") {
          CombateUI.actualizarUltimoGolpe("jugador", 0, "bloqueo");
        }
        if (typeof CombateUI.agregarHistorial === "function") {
          CombateUI.agregarHistorial(
            "positivo",
            `Bloqueaste ${nombreAtaque} (${precisionPct}% · mitigación ${mitigacionPct}%) = 0 HP.`
          );
        }
        CombateUI.mostrarMensaje("🛡️ ¡Bloqueo perfecto! Sin daño.");
      } else {
        aplicarDañoAlJugador(daño);
        const bloqueo = (precision >= 0.8 && mitigacionMaxima < 1)
                        ? "🛡️ Bloqueaste lo posible; parte del daño es imbloqueable."
                        : precision >= 0.8 ? "🛡️ ¡Gran bloqueo!" :
                          precision >= 0.4 ? "🛡️ Bloqueaste parte del daño." :
                          "💥 ¡Te golpearon fuerte!";
        CombateUI.mostrarMensaje(`${bloqueo} -${daño.toFixed(1)} HP`);

        if (typeof CombateUI.actualizarUltimoGolpe === "function") {
          CombateUI.actualizarUltimoGolpe("jugador", -daño, "dano");
        }
        if (typeof CombateUI.agregarHistorial === "function") {
          const extra = mitigacionMaxima < 1 ? ` · imbloqueable ${imbloqueablePct}%` : "";
          CombateUI.agregarHistorial(
            "negativo",
            `Recibiste ${nombreAtaque} (${precisionPct}% · mitigación ${mitigacionPct}%${extra}) = -${formatearDanio(daño)} HP.`
          );
        }
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
        if (estadoCombate.pausado) return;
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
    if (typeof CombateUI.agregarHistorial === "function") {
      CombateUI.agregarHistorial("negativo", "Fallaste al huir; el mob ataca.");
    }
    CombateUI.mostrarMensaje("¡Fallaste al huir! El mob ataca.");
    estadoCombate.timeoutPendiente = setTimeout(() => {
      estadoCombate.timeoutPendiente = null;
      if (!estadoCombate.activo) return;
      estadoCombate.pausado = false;
      estadoCombate.ataqueActual = null;
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

  if (typeof CombateUI.actualizarUltimoGolpe === "function") {
    CombateUI.actualizarUltimoGolpe("jugador", -hpPerdido, "dano");
  }
  if (typeof CombateUI.agregarHistorial === "function") {
    CombateUI.agregarHistorial(
      "negativo",
      `Huiste con éxito, pero la penalización te quitó ${hpPerdido} HP (${penPct}%).`
    );
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
  const victoria = motivo === "muerte_mob";

  const mob = estadoCombate.mob;

  // Al cerrar la pelea, normalizar HP a medios puntos para evitar
  // que fracciones acumuladas rompan curaciones o daños futuros.
  estado.jugador.hp = Math.min(
    estado.jugador.hpMax,
    redondearHP(estado.jugador.hp)
  );
  if (mob && mob.hpActual > 0) {
    const hpMaxMob = Number.isFinite(mob.hpMax) ? mob.hpMax : mob.hpActual;
    mob.hpActual = Math.min(hpMaxMob, redondearHP(mob.hpActual));
  }
  if (typeof actualizarHUD === "function") actualizarHUD();

  estadoCombate.activo = false;
  estadoCombate.mob = null;
  estadoCombate.turnoActual = null;
  estadoCombate.pausado = false;
  estadoCombate.ultimoAtaque = null;
  estadoCombate.ataqueActual = null;
  estadoCombate.perfectosSeguidos = 0;
  if (muerteJugador) estadoCombate.derrota = true;
  if (victoria) estadoCombate.victoria = true;

  // Cancelar timeout pendiente (si lo hay)
  if (estadoCombate.timeoutPendiente) {
    clearTimeout(estadoCombate.timeoutPendiente);
    estadoCombate.timeoutPendiente = null;
  }

  // Cancelar barra de timing (por si quedó activa)
  if (typeof BarraTiming !== "undefined") BarraTiming.cancelar();

  CombateUI.cerrar(muerteJugador || victoria);

  // Derrota y victoria bloquean el juego hasta que el jugador continúe.
  if (muerteJugador || victoria) {
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

    mostrarPantallaVictoria(mob);

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

// ─── Recompensas de prueba (el loot real llega con F13) ───
function calcularRecompensasVictoria(mob) {
  const datosMob = mob && typeof MOBS !== "undefined" ? MOBS[mob.tipo] : null;
  const nombreMob = datosMob && datosMob.nombre ? datosMob.nombre : "El enemigo";
  const nivelMob = mob ? calcularNivelMob(mob) : 1;
  const xp = 5 + nivelMob * 3;

  return {
    nombreMob,
    xp,
    items: [
      { icono: "💰", nombre: "Moneda antigua", cantidad: 2 },
      { icono: "🦴", nombre: `Resto de ${nombreMob}`, cantidad: 1 },
    ],
  };
}

function mostrarPantallaVictoria(mobDerrotado) {
  const recompensas = calcularRecompensasVictoria(mobDerrotado);

  if (typeof CombateUI === "undefined" || typeof CombateUI.mostrarVictoria !== "function") {
    // Fallback: si la UI nueva no está disponible, no bloquear el juego.
    estadoCombate.victoria = false;
    estado.pausado = false;
    if (typeof reanudarTicks === "function") reanudarTicks();
    return;
  }

  CombateUI.mostrarVictoria({
    ...recompensas,
    onContinuar: () => {
      estadoCombate.victoria = false;
      estado.pausado = false;
      if (typeof reanudarTicks === "function") reanudarTicks();
      if (typeof actualizarHUD === "function") actualizarHUD();
    },
  });
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
  estadoCombate.victoria = false;
  estadoCombate.pausado = false;
  estadoCombate.turnoActual = null;
  estadoCombate.ultimoAtaque = null;
  estadoCombate.ataqueActual = null;
  estadoCombate.perfectosSeguidos = 0;

  if (estadoCombate.timeoutPendiente) {
    clearTimeout(estadoCombate.timeoutPendiente);
    estadoCombate.timeoutPendiente = null;
  }

  if (typeof CombateUI !== "undefined" && typeof CombateUI.ocultarDerrota === "function") {
    CombateUI.ocultarDerrota();
  }
  if (typeof CombateUI !== "undefined" && typeof CombateUI.ocultarVictoria === "function") {
    CombateUI.ocultarVictoria();
  }

  if (typeof BarraTiming !== "undefined") BarraTiming.cancelar();
  if (typeof estado !== "undefined") estado.pausado = false;
  if (typeof reanudarTicks === "function") reanudarTicks();
}
