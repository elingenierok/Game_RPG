// ═══════════════════════════════════════════════════════════════
//  BLOQUE 2 · TILES (wrapper de tema)
// ─────────────────────────────────────────────────────────────────
//  Los IDs numéricos son fijos. Los emojis vienen del tema activo.
// ═══════════════════════════════════════════════════════════════
const GRASS  = 0, TREE   = 1, WALL   = 2, WATER = 3,
      SAND   = 4, BUSH   = 5, ROCK   = 6, TALLGRASS = 7,
      PATH   = 8, LLAGUE = 9, PLAYER = 10, LUPA = 11,
      MANZANA = 12, TIGRE = 13, GALLINA = 14, CERDO = 15,
      HACHA = 16, PICO = 17, LINTERNA = 18,
      DESERT_SAND = 19, CACTUS = 20, SNOW = 21, ICE = 22, PINE = 23,
      BARCO = 24;

const NOMBRE_A_TILE = {
  GRASS, TREE, WALL, WATER, SAND, BUSH, ROCK, TALLGRASS,
  PATH, LLAGUE, PLAYER, LUPA, MANZANA, TIGRE, GALLINA, CERDO,
  HACHA, PICO, LINTERNA, DESERT_SAND, CACTUS, SNOW, ICE, PINE, BARCO,
};

const TILE_A_NOMBRE = {};
for (const nombre in NOMBRE_A_TILE) {
  TILE_A_NOMBRE[NOMBRE_A_TILE[nombre]] = nombre;
}

// ─── Tema activo ───
const _temaActivo = (TEMA_ACTIVO === "espacio") ? TEMA_ESPACIO : TEMA_TIERRA;

const ICONOS = {};
for (const nombre in NOMBRE_A_TILE) {
  const id = NOMBRE_A_TILE[nombre];
  ICONOS[id] = _temaActivo.iconos[nombre] || "?";
}

const BLOQUEANTES = new Set([TREE, WALL, WATER, ROCK, CACTUS, ICE, PINE]);

const ROTURA_POR_TILE = {
  [TREE]:   { objeto: "HACHA", duracionMs: 3000 },
  [PINE]:   { objeto: "HACHA", duracionMs: 3000 },
  [CACTUS]: { objeto: "HACHA", duracionMs: 2500 },
  [ROCK]:   { objeto: "PICO",  duracionMs: 3000 },
  [WALL]:   { objeto: "PICO",  duracionMs: 4000 },
  [ICE]:    { objeto: "PICO",  duracionMs: 2500 },
};