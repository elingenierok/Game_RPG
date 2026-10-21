// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.20 · CICLO DÍA-NOCHE Y LUZ (F1)
// ─────────────────────────────────────────────────────────────────
//  Fases: día → atardecer → noche → amanecer → día …
//
//  Luz global (0 = noche cerrada, 1 = día pleno):
//    día       → 1
//    atardecer → 1 - smoothstep(t)
//    noche     → 0
//    amanecer  → smoothstep(t)
//
//  Cada celda recibe la MAYOR luz disponible (nunca se suman):
//    luz = max(global, jugador, hogueras/faroles…)
//    oscuridad = 1 - luz   → opacidad del velo negro del render.
//
//  La luz del jugador lo sigue y crece con la linterna equipada.
//  Las fuentes fijas (hoguera, farol) están siempre encendidas.
// ═══════════════════════════════════════════════════════════════

// Duraciones (ms). Cambiables a futuro sin tocar el resto del motor.
const CICLO_CONFIG = {
  DURACION_DIA_MS: 60000,
  DURACION_TRANSICION_MS: 8000,
  DURACION_NOCHE_MS: 30000,
  RADIO_BASE_JUGADOR: 1,     // sin linterna: ve 1 celda alrededor (3×3)
  POTENCIA_JUGADOR: 1,
};

// Tiles que emiten luz mientras existan en el mundo.
// radio: celdas de alcance · potencia: brillo en el centro (0..1)
const LUCES_POR_TILE = {
  [HOGUERA]: { radio: 4, potencia: 1 },
};

const FASES_CICLO = ["dia", "atardecer", "noche", "amanecer"];

let _fase = "dia";
let _tiempoFase = 0;
let _luzGlobal = 1;

// ─── Reinicio ───
function iniciarCiclo() {
  _fase = "dia";
  _tiempoFase = 0;
  _luzGlobal = 1;
}

function reiniciarCiclo() {
  iniciarCiclo();
}

// ─── Consultas básicas ───
function faseCiclo() {
  return _fase;
}

function tiempoFaseCiclo() {
  return _tiempoFase;
}

function luzGlobalCiclo() {
  return _luzGlobal;
}

function duracionFaseCiclo(fase) {
  switch (fase) {
    case "dia":       return CICLO_CONFIG.DURACION_DIA_MS;
    case "atardecer": return CICLO_CONFIG.DURACION_TRANSICION_MS;
    case "noche":     return CICLO_CONFIG.DURACION_NOCHE_MS;
    case "amanecer":  return CICLO_CONFIG.DURACION_TRANSICION_MS;
    default:          return CICLO_CONFIG.DURACION_DIA_MS;
  }
}

function faseSiguienteCiclo(fase) {
  const i = FASES_CICLO.indexOf(fase);
  return FASES_CICLO[(i + 1) % FASES_CICLO.length];
}

// ─── Curva de transición ───
function smoothstepCiclo(x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x * x * (3 - 2 * x);
}

function calcularLuzGlobal() {
  const dur = duracionFaseCiclo(_fase);
  const t = dur > 0 ? _tiempoFase / dur : 0;

  switch (_fase) {
    case "dia":       return 1;
    case "noche":     return 0;
    case "atardecer": return 1 - smoothstepCiclo(t);
    case "amanecer":  return smoothstepCiclo(t);
    default:          return 1;
  }
}

// ─── Avance del tiempo ───
function actualizarCiclo(dtMs) {
  if (!Number.isFinite(dtMs) || dtMs <= 0) return;
  if (estado.pausado) return;

  _tiempoFase += dtMs;

  let dur = duracionFaseCiclo(_fase);
  let guard = 0;
  while (_tiempoFase >= dur && guard < 8) {
    _tiempoFase -= dur;
    _fase = faseSiguienteCiclo(_fase);
    dur = duracionFaseCiclo(_fase);
    guard++;
  }

  _luzGlobal = calcularLuzGlobal();
}

// ─── Fuerza una fase (cheats / tests) ───
function saltarAFaseCiclo(fase, progreso) {
  if (FASES_CICLO.indexOf(fase) === -1) return;
  _fase = fase;
  const dur = duracionFaseCiclo(fase);
  const p = Number.isFinite(progreso) ? Math.max(0, Math.min(1, progreso)) : 0;
  _tiempoFase = dur * p;
  _luzGlobal = calcularLuzGlobal();
}

// ─── Radio de luz del jugador ───
function visionJugadorCiclo() {
  if (typeof Equipamiento !== "undefined" && typeof Equipamiento.obtenerVision === "function") {
    return Equipamiento.obtenerVision() || 0;
  }
  return 0;
}

function radioJugadorCiclo() {
  return CICLO_CONFIG.RADIO_BASE_JUGADOR + visionJugadorCiclo();
}

// ─── Aporte de una fuente a una celda ───
//  d = distancia euclídea. d = 0 → potencia. d ≥ radio → 0.
function aporteLuzCiclo(wx, wy, fuente) {
  const dx = wx - fuente.x;
  const dy = wy - fuente.y;
  const d2 = dx * dx + dy * dy;
  const r2 = fuente.radio * fuente.radio;
  if (d2 >= r2) return 0;
  const factor = 1 - Math.sqrt(d2) / fuente.radio;
  return fuente.potencia * factor * factor;
}

// ─── Tile del mundo en coordenadas globales ───
function tileEnMundoCiclo(wx, wy) {
  if (typeof coordsMundoATile !== "function" || typeof obtenerChunk !== "function") {
    return undefined;
  }
  const info = coordsMundoATile(wx, wy);
  const chunk = obtenerChunk(info.cx, info.cy);
  if (!chunk || !chunk.mapa || !chunk.mapa[info.ly]) return undefined;
  const fila = chunk.mapa[info.ly];
  return fila ? fila[info.lx] : undefined;
}

// ─── Campo de luz de un rectángulo visible ───
//  Devuelve Float32Array (ancho × alto) con el brillo 0..1 de cada celda.
function calcularCampoLuzCiclo(esqX, esqY, ancho, alto) {
  const campo = new Float32Array(ancho * alto);
  const base = _luzGlobal;

  // Recolectar fuentes: jugador + luces fijas visibles.
  const fuentes = [{
    x: estado.jugador.wx,
    y: estado.jugador.wy,
    radio: radioJugadorCiclo(),
    potencia: CICLO_CONFIG.POTENCIA_JUGADOR,
  }];

  for (let j = 0; j < alto; j++) {
    for (let i = 0; i < ancho; i++) {
      const tile = tileEnMundoCiclo(esqX + i, esqY + j);
      const cfg = (tile !== undefined && tile !== null) ? LUCES_POR_TILE[tile] : null;
      if (cfg) {
        fuentes.push({ x: esqX + i, y: esqY + j, radio: cfg.radio, potencia: cfg.potencia });
      }
    }
  }

  // Combinar con MAX (las luces no se suman).
  for (let j = 0; j < alto; j++) {
    for (let i = 0; i < ancho; i++) {
      let luz = base;
      for (let f = 0; f < fuentes.length; f++) {
        const aporte = aporteLuzCiclo(esqX + i, esqY + j, fuentes[f]);
        if (aporte > luz) luz = aporte;
      }
      campo[j * ancho + i] = luz;
    }
  }

  return campo;
}

const Ciclo = {
  CONFIG: CICLO_CONFIG,
  FASES: FASES_CICLO,
  LUCES_POR_TILE,

  iniciar: iniciarCiclo,
  reiniciar: reiniciarCiclo,
  actualizar: actualizarCiclo,

  fase: faseCiclo,
  tiempoFase: tiempoFaseCiclo,
  luzGlobal: luzGlobalCiclo,
  duracionFase: duracionFaseCiclo,
  faseSiguiente: faseSiguienteCiclo,
  saltarA: saltarAFaseCiclo,

  visionJugador: visionJugadorCiclo,
  radioJugador: radioJugadorCiclo,
  aporte: aporteLuzCiclo,
  calcularCampoLuz: calcularCampoLuzCiclo,
  tileEn: tileEnMundoCiclo,
};

window.Ciclo = Ciclo;
