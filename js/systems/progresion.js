// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.16 · PROGRESIÓN DEL JUGADOR (F30)
// ─────────────────────────────────────────────────────────────────
//  La XP es moneda. Cada rango comprado sube 1 nivel.
//  Los stats se recalculan desde una base fija + habilidades.
// ═══════════════════════════════════════════════════════════════

const HABILIDADES = {
  vitalidad: {
    id: "vitalidad",
    nombre: "Vitalidad",
    icono: "❤️",
    max: 5,
    costoBase: 40,
    costoIncremento: 25,
    descripcion: "+1 corazón (2 HP máximos) por rango.",
  },
  fuerza: {
    id: "fuerza",
    nombre: "Fuerza",
    icono: "⚔️",
    max: 5,
    costoBase: 45,
    costoIncremento: 30,
    descripcion: "+1 ataque por rango.",
  },
  defensa: {
    id: "defensa",
    nombre: "Defensa",
    icono: "🛡️",
    max: 5,
    costoBase: 45,
    costoIncremento: 30,
    descripcion: "+1 defensa por rango.",
  },
  movilidad: {
    id: "movilidad",
    nombre: "Movilidad",
    icono: "👟",
    max: 5,
    costoBase: 35,
    costoIncremento: 20,
    descripcion: "+10% de velocidad de caminata por rango.",
  },
  herramientas: {
    id: "herramientas",
    nombre: "Herramientas",
    icono: "⛏️",
    max: 5,
    costoBase: 35,
    costoIncremento: 20,
    descripcion: "+5% de velocidad de rotura con hacha y pico por rango.",
  },
};

const ORDEN_HABILIDADES = ["vitalidad", "fuerza", "defensa", "movilidad", "herramientas"];
const STATS_BASE_INICIALES = { hpMax: 20, ataque: 3, defensa: 1, velocidad: 1 };

function asegurarProgresion() {
  const jugador = estado.jugador;

  if (!jugador.progresion) {
    jugador.progresion = {
      xp: 0,
      xpTotal: 0,
      habilidades: {},
      statsBase: {
        hpMax: Number.isFinite(jugador.hpMax) ? jugador.hpMax : STATS_BASE_INICIALES.hpMax,
        ataque: Number.isFinite(jugador.ataque) ? jugador.ataque : STATS_BASE_INICIALES.ataque,
        defensa: Number.isFinite(jugador.defensa) ? jugador.defensa : STATS_BASE_INICIALES.defensa,
        velocidad: Number.isFinite(jugador.velocidad) ? jugador.velocidad : STATS_BASE_INICIALES.velocidad,
      },
    };
  }

  const p = jugador.progresion;
  p.xp = Math.max(0, Number.isFinite(p.xp) ? p.xp : 0);
  p.xpTotal = Math.max(0, Number.isFinite(p.xpTotal) ? p.xpTotal : 0);
  if (!p.habilidades || typeof p.habilidades !== "object") p.habilidades = {};

  for (const id of ORDEN_HABILIDADES) {
    const valor = Number.isFinite(p.habilidades[id]) ? p.habilidades[id] : 0;
    p.habilidades[id] = Math.max(0, Math.min(HABILIDADES[id].max, valor));
  }

  if (!Number.isFinite(jugador.nivel) || jugador.nivel < 1) jugador.nivel = 1;
  return p;
}

function totalRangosComprados() {
  const p = asegurarProgresion();
  return ORDEN_HABILIDADES.reduce((total, id) => total + (p.habilidades[id] || 0), 0);
}

function recalcularStatsJugador(curarDiferencia) {
  const jugador = estado.jugador;
  const p = asegurarProgresion();
  const hpMaxAnterior = Number.isFinite(jugador.hpMax) ? jugador.hpMax : p.statsBase.hpMax;
  if (!Number.isFinite(jugador.hp)) jugador.hp = hpMaxAnterior;

  const bonos = typeof Equipamiento !== "undefined" ? Equipamiento.obtenerBonos() : {};
  const velocidadBase = p.statsBase.velocidad * (1 + p.habilidades.movilidad * 0.1);

  jugador.hpMax = p.statsBase.hpMax + p.habilidades.vitalidad * 2 + (bonos.hpMax || 0);
  jugador.ataque = p.statsBase.ataque + p.habilidades.fuerza + (bonos.ataque || 0);
  jugador.defensa = p.statsBase.defensa + p.habilidades.defensa + (bonos.defensa || 0);
  jugador.velocidad = Number((velocidadBase * (1 + (bonos.velocidad || 0))).toFixed(2));
  jugador.nivel = 1 + totalRangosComprados();

  if (curarDiferencia === true && jugador.hpMax > hpMaxAnterior) {
    jugador.hp += jugador.hpMax - hpMaxAnterior;
  }

  jugador.hp = Math.min(jugador.hp, jugador.hpMax);
  return jugador;
}

function costoHabilidad(id) {
  const def = HABILIDADES[id];
  if (!def) return Infinity;
  const p = asegurarProgresion();
  return def.costoBase + def.costoIncremento * (p.habilidades[id] || 0);
}

function obtenerHabilidades() {
  const p = asegurarProgresion();
  return ORDEN_HABILIDADES.map((id) => {
    const def = HABILIDADES[id];
    const rango = p.habilidades[id] || 0;
    const max = rango >= def.max;
    const costo = max ? null : costoHabilidad(id);
    return {
      ...def,
      rango,
      costo,
      max,
      puedeComprar: !max && p.xp >= costo,
    };
  });
}

function comprarHabilidad(id) {
  const def = HABILIDADES[id];
  if (!def) return { ok: false, motivo: "inexistente" };

  const p = asegurarProgresion();
  const rango = p.habilidades[id] || 0;
  if (rango >= def.max) return { ok: false, motivo: "maximo" };

  const costo = costoHabilidad(id);
  if (p.xp < costo) return { ok: false, motivo: "xp", faltante: costo - p.xp };

  p.xp -= costo;
  p.habilidades[id] = rango + 1;
  recalcularStatsJugador(id === "vitalidad");

  if (typeof actualizarHUD === "function") actualizarHUD();
  if (typeof MenuJugador !== "undefined" && typeof MenuJugador.actualizar === "function") {
    MenuJugador.actualizar();
  }

  return { ok: true, costo, rango: p.habilidades[id], nivel: estado.jugador.nivel };
}

function otorgarXP(cantidad) {
  const n = Number(cantidad);
  if (!Number.isFinite(n) || n <= 0) return 0;

  const p = asegurarProgresion();
  p.xp += n;
  p.xpTotal += n;

  if (typeof actualizarHUD === "function") actualizarHUD();
  if (typeof MenuJugador !== "undefined" && typeof MenuJugador.actualizar === "function") {
    MenuJugador.actualizar();
  }

  return n;
}

function obtenerDuracionMovimiento() {
  const jugador = recalcularStatsJugador(false);
  const factor = Math.max(0.1, jugador.velocidad || 1);
  return DURACION_MOVIMIENTO_MS / factor;
}

function obtenerMultiplicadorRotura(tipoHerramienta) {
  const p = asegurarProgresion();
  const habilidad = 1 + (p.habilidades.herramientas || 0) * 0.05;

  let herramienta = 1;
  let roturaEquipo = 0;
  if (typeof Equipamiento !== "undefined") {
    if (tipoHerramienta) {
      herramienta = Equipamiento.obtenerVelocidadHerramienta(tipoHerramienta);
    } else {
      herramienta = Math.max(
        Equipamiento.obtenerVelocidadHerramienta("HACHA"),
        Equipamiento.obtenerVelocidadHerramienta("PICO")
      );
    }
    roturaEquipo = Equipamiento.obtenerBonos().rotura || 0;
  }

  return Number((habilidad * herramienta * (1 + roturaEquipo)).toFixed(3));
}

function obtenerResumenProgresion() {
  const p = asegurarProgresion();
  const jugador = recalcularStatsJugador(false);
  const bonosEquipo = typeof Equipamiento !== "undefined" ? Equipamiento.obtenerBonos() : {};
  return {
    xp: p.xp,
    xpTotal: p.xpTotal,
    nivel: jugador.nivel,
    hp: jugador.hp,
    hpMax: jugador.hpMax,
    ataque: jugador.ataque,
    defensa: jugador.defensa,
    velocidad: jugador.velocidad,
    multiplicadorRotura: obtenerMultiplicadorRotura(),
    roturaHacha: obtenerMultiplicadorRotura("HACHA"),
    roturaPico: obtenerMultiplicadorRotura("PICO"),
    vision: bonosEquipo.vision || 0,
    bonosEquipo,
    habilidades: { ...p.habilidades },
    rangos: totalRangosComprados(),
  };
}

function reiniciarProgresion() {
  const p = asegurarProgresion();
  p.xp = 0;
  p.xpTotal = 0;
  for (const id of ORDEN_HABILIDADES) p.habilidades[id] = 0;
  recalcularStatsJugador(false);
}

const Progresion = {
  HABILIDADES,
  asegurarProgresion,
  recalcularStatsJugador,
  costoHabilidad,
  obtenerHabilidades,
  comprarHabilidad,
  otorgarXP,
  obtenerDuracionMovimiento,
  obtenerMultiplicadorRotura,
  obtenerResumen: obtenerResumenProgresion,
  reiniciarProgresion,
};

asegurarProgresion();
recalcularStatsJugador(false);
