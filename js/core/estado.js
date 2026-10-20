// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7 · ESTADO GLOBAL
// ─────────────────────────────────────────────────────────────────
//  Con chunks 2D, el jugador vive en coordenadas del mundo (wx, wy).
//  Cada chunk es de 32×32 celdas. La cámara sigue al jugador.
// ═══════════════════════════════════════════════════════════════

const estado = {
  // ─── Jugador ───
  //  Posición en coordenadas del mundo (puede ser decimal durante
  //  la animación). El jugador siempre está en el centro de la cámara.
  jugador: {
    wx: 0,     // posición X en el mundo
    wy: 0,     // posición Y en el mundo
    mirandoIzquierda: false,
    inicializado: false,
    corriendo: false,
    enBarco: false,
    hp: 20,
    hpMax: 20,
    ataque: 3,
    defensa: 1,
    velocidad: 1,
    nivel: 1,   // ← NUEVO (placeholder, F30 futuro: sistema de niveles real)
    // Animación en curso
    animando: false,
    animInicioX: 0,
    animInicioY: 0,
    animFinX: 0,
    animFinY: 0,
    animInicio: 0,
  },

  // ─── Llave ───
  //  Posición en coordenadas del mundo.
  llave: { wx: 0, wy: 0 },

  // ─── Inventario ───
  inventario: {},
  itemsRecogidos: new Set(),

  // ─── Estado del juego ───
  transicionando: false,
  ganado: false,
  pausado: false,   // ← NUEVO: pausa global (batalla, menú, etc.)
};

// Caché de chunks: clave "cx,cy" → chunk generado
const cacheChunks = new Map();