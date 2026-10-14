// ═══════════════════════════════════════════════════════════════
//  BLOQUE 2 · TILES Y PROPIEDADES
// ═══════════════════════════════════════════════════════════════
const GRASS  = 0, TREE   = 1, WALL   = 2, WATER = 3,
      SAND   = 4, BUSH   = 5, ROCK   = 6, TALLGRASS = 7,
      PATH   = 8, LLAGUE = 9, PLAYER = 10, LUPA = 11,
      MANZANA = 12, TIGRE = 13, GALLINA = 14, CERDO = 15,
      HACHA = 16, PICO = 17, LINTERNA = 18,
      DESERT_SAND = 19, CACTUS = 20, SNOW = 21, ICE = 22, PINE = 23,
      BARCO = 24;

const ICONOS = {
  [GRASS]:       "🟩",
  [TREE]:        "🌳",
  [WALL]:        "🧱",
  [WATER]:       "🌊",
  [SAND]:        "🟨",
  [BUSH]:        "🌿",
  [ROCK]:        "⛰️",
  [TALLGRASS]:   "🌾",
  [PATH]:        "🟫",
  [LLAGUE]:      "🔑",
  [PLAYER]:      "🏃‍♂️",
  [LUPA]:        "🔍",
  [MANZANA]:     "🍎",
  [TIGRE]:       "🐅",
  [GALLINA]:     "🐓",
  [CERDO]:       "🐖",
  [HACHA]:       "🪓",
  [PICO]:        "⛏️",
  [LINTERNA]:    "🕯️",
  [DESERT_SAND]: "🟧",
  [CACTUS]:      "🌵",
  [SNOW]:        "❄️",
  [ICE]:         "🧊",
  [PINE]:        "🌲",
  [BARCO]:       "🛶",
};

const BLOQUEANTES = new Set([TREE, WALL, WATER, ROCK, CACTUS, ICE, PINE]);

// ═══════════════════════════════════════════════════════════════
//  MAPA DE NOMBRE → ID DE TILE
//  Permite usar strings en los datos de biomas
// ═══════════════════════════════════════════════════════════════
const NOMBRE_A_TILE = {
  GRASS:       GRASS,
  TREE:        TREE,
  WALL:        WALL,
  WATER:       WATER,
  SAND:        SAND,
  BUSH:        BUSH,
  ROCK:        ROCK,
  TALLGRASS:   TALLGRASS,
  PATH:        PATH,
  LLAGUE:      LLAGUE,
  PLAYER:      PLAYER,
  LUPA:        LUPA,
  MANZANA:     MANZANA,
  TIGRE:       TIGRE,
  GALLINA:     GALLINA,
  CERDO:       CERDO,
  HACHA:       HACHA,
  PICO:        PICO,
  LINTERNA:    LINTERNA,
  DESERT_SAND: DESERT_SAND,
  CACTUS:      CACTUS,
  SNOW:        SNOW,
  ICE:         ICE,
  PINE:        PINE,
  BARCO:       BARCO,
};

// ═══════════════════════════════════════════════════════════════
//  PROPIEDADES DE ROTURA
// ─────────────────────────────────────────────────────────────────
//  Define qué tiles se pueden romper y con qué objeto.
//  Formato: { [tileID]: { objeto, duracionMs } }
// ═══════════════════════════════════════════════════════════════
const ROTURA_POR_TILE = {
  [TREE]:   { objeto: "HACHA", duracionMs: 3000 },
  [PINE]:   { objeto: "HACHA", duracionMs: 3000 },  // pino se corta con hacha
  [CACTUS]: { objeto: "HACHA", duracionMs: 2500 },  // cactus se corta con hacha
  [ROCK]:   { objeto: "PICO",  duracionMs: 3000 },
  [WALL]:   { objeto: "PICO",  duracionMs: 4000 },  // muro se pica con pico (más lento)
  [ICE]:    { objeto: "PICO",  duracionMs: 2500 },
};