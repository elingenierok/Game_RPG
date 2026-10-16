// ═══════════════════════════════════════════════════════════════
//  BLOQUE 1 · CONFIGURACIÓN GLOBAL
// ─────────────────────────────────────────────────────────────────
//  ⚙️  PANEL DE AJUSTES · Cambiá TODO desde acá
//
//  SISTEMA DE CHUNKS 2D:
//    El mundo se divide en chunks cuadrados de ANCHO_CHUNK × ALTO_CHUNK.
//    Cada chunk se genera proceduralmente a partir de su (cx, cy).
//
//  VENTANA VISIBLE:
//    El jugador ve una ventana de ANCHO_VENTANA × ALTO_VENTANA celdas.
//    La cámara está centrada en el jugador.
//
//  TAMAÑO VISUAL:
//    Cada celda se dibuja a TAMANO_CELDA píxeles.
//    Los emojis son FONT_EMOJI píxeles (un poco más chicos).
// ═══════════════════════════════════════════════════════════════

// ─── Tamaño del chunk ───
const ANCHO_CHUNK = 32;
const ALTO_CHUNK  = 32;

// ─── Tamaño de la ventana visible ───
const ANCHO_VENTANA = 32;
const ALTO_VENTANA  = 24;

// ─── Tamaño visual de cada celda ───
const TAMANO_CELDA = 24;
const FONT_EMOJI   = TAMANO_CELDA - 2;

// ─── Límite de chunks (radio desde (0,0)) ───
// ±LIMITE_CHUNKS en X e Y → (2*LIMITE+1)² chunks totales
const LIMITE_CHUNKS = 4;

// ─── Llave (posición del chunk donde aparece) ───
const LLAVE_CHUNK_CX = 2;
const LLAVE_CHUNK_CY = 0;

// ─── Duración del movimiento del jugador ───
// Cuánto tarda en moverse de una celda a la siguiente.
const DURACION_MOVIMIENTO_MS = 100;

// ─── Tick de IA (mobs en tiempo real) ───
const TICK_MS = 400;
const TICK_DEAMBULAR_CADA = 2;

// ─── Sistema de rotura (romper árboles, piedras, etc.) ───
const DURACION_ROTURA_MS = 3000;
const INTERVALO_ROTURA_MS = 50;

// ─── Radio de seguridad al entrar a una zona (tiles) ───
const RADIO_SEGURIDAD_SPAWN = 3;

// ─── Semilla y límites ───
// SEMILLA = mundo (terreno, biomas, estructuras). Editable por el jugador.
let SEMILLA = "test_mundo_01";

// SEMILLA_MOBS = distribución de mobs. Independiente del mundo.
let SEMILLA_MOBS = Date.now();

// SEMILLA_OBJETOS = distribución de ítems. Ligada al mundo por ahora.
let SEMILLA_OBJETOS = SEMILLA;