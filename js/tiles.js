// ═══════════════════════════════════════════════════════════════
//  BLOQUE 2 · TILES Y PROPIEDADES
// ═══════════════════════════════════════════════════════════════
const GRASS  = 0, TREE   = 1, WALL   = 2, WATER = 3,
      SAND   = 4, BUSH   = 5, ROCK   = 6, TALLGRASS = 7,
      PATH   = 8, LLAGUE = 9, PLAYER = 10, LUPA = 11,
      MANZANA = 12, TIGRE = 13, GALLINA = 14, CERDO = 15;

const ICONOS = {
  [GRASS]:     "🟩",
  [TREE]:      "🌳",
  [WALL]:      "🧱",
  [WATER]:     "🌊",
  [SAND]:      "🟨",
  [BUSH]:      "🌿",
  [ROCK]:      "🪨",
  [TALLGRASS]: "🌾",
  [PATH]:      "🟫",
  [LLAGUE]:    "🔑",
  [PLAYER]:    "🏃‍♂️",
  [LUPA]:      "🔍",
  [MANZANA]:   "🍎",
  [TIGRE]:     "🐅",
  [GALLINA]:   "🐓",
  [CERDO]:     "🐖",
};

const BLOQUEANTES = new Set([TREE, WALL, WATER, ROCK]);