// ═══════════════════════════════════════════════════════════════
//  BLOQUE 1 · CONFIGURACIÓN GLOBAL
// ─────────────────────────────────────────────────────────────────
//  ⚙️  PANEL DE AJUSTES · Cambiá TODO desde acá
//
//  ANCHO_PANTALLA / ALTO_PANTALLA
//    → tamaño de la grilla (en celdas)
//    → al cambiarlo, el resto se recalcula solo:
//        · tamaño de cada celda
//        · tamaño de los emojis
//        · grilla del CSS
//
//  FÓRMULA DE TAMAÑO DE CELDA:
//    grilla grande (>=40) → celdas chicas (16px)
//    grilla chica  (<40)  → celdas grandes (30px)
//  Ajustable en la constante TAMANO_CELDA.
// ═══════════════════════════════════════════════════════════════

// ─── Tamaño de la grilla ───
const ANCHO_PANTALLA  = 25;
const ALTO_PANTALLA   = 17;

// ─── Tamaño visual (DERIVADO del ancho) ───
// Si cambiás ANCHO_PANTALLA, esto se ajusta solo.
const TAMANO_CELDA = ANCHO_PANTALLA >= 40 ? 16 : 30;
const FONT_EMOJI   = TAMANO_CELDA - 2;

// ─── Zonas y mundo ───
const ZONAS_VISIBLES  = 5;
const ZONA_LLAVE      = 2;

// ─── Tick de IA (mobs en tiempo real) ───
const TICK_MS = 400;              // intervalo base del tick (ms)
const TICK_DEAMBULAR_CADA = 2;    // cada cuántos ticks deambula un mob

// ─── Semilla y límites ───
// SEMILLA = mundo (terreno, biomas, estructuras). Editable por el jugador.
let SEMILLA = "test_mundo_01";

// SEMILLA_MOBS = distribución de mobs. Independiente del mundo.
// Por defecto: cambia en cada carga de página.
// Los mobs son distintos aunque el mundo sea el mismo.
let SEMILLA_MOBS = Date.now();

// SEMILLA_OBJETOS = distribución de ítems. Por ahora ligada al mundo.
// Preparada para separar en el futuro (cambiar a Date.now() si se desea).
let SEMILLA_OBJETOS = SEMILLA;

let LIMITE_CHUNKS = 5;