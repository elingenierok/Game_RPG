// ═══════════════════════════════════════════════════════════════
//  BLOQUE 5.1 · BIOMAS (datos)
// ─────────────────────────────────────────────────────────────────
//  Tabla de biomas. Cada bioma es un objeto de datos.
//
//  Estructura:
//    nombre  → nombre legible
//    emoji   → representación visual para resúmenes
//    vecinos → [{ id, peso }] — qué biomas pueden estar al lado
//    tiles   → [{ tile, peso }] — qué tiles componen el bioma
//
//  Los "pesos" son números relativos. No tienen que sumar 100.
//  El motor los normaliza automáticamente.
//
//  Los IDs deben coincidir con las constantes de tiles.js.
// ═══════════════════════════════════════════════════════════════

const BIOMAS = {

  // ─── Zona 0 (segura) ───
  pradera: {
    nombre: "Pradera",
    emoji: "🌿",
    vecinos: [
      { id: "bosque",   peso: 35 },
      { id: "pradera",  peso: 20 },
      { id: "costa",    peso: 20 },
      { id: "desierto", peso: 15 },
      { id: "ruina",    peso: 10 },
    ],
    tiles: [
      { tile: "GRASS",     peso: 85 },
      { tile: "TREE",      peso: 5  },
      { tile: "TALLGRASS", peso: 5  },
      { tile: "ROCK",      peso: 5  },
    ],
  },

  // ─── Bosque ───
  bosque: {
    nombre: "Bosque",
    emoji: "🌳",
    vecinos: [
      { id: "bosque",   peso: 30 },
      { id: "pradera",  peso: 35 },
      { id: "ruina",    peso: 20 },
      { id: "nieve",    peso: 15 },
    ],
    tiles: [
      { tile: "GRASS",     peso: 60 },
      { tile: "TREE",      peso: 15 },
      { tile: "BUSH",      peso: 15 },
      { tile: "TALLGRASS", peso: 10 },
    ],
  },

  // ─── Costa ───
  costa: {
    nombre: "Costa",
    emoji: "🏖️",
    vecinos: [
      { id: "oceano",  peso: 40 },
      { id: "costa",   peso: 20 },
      { id: "pradera", peso: 40 },
    ],
    tiles: [
      { tile: "SAND",  peso: 50 },
      { tile: "WATER", peso: 30 },
      { tile: "GRASS", peso: 15 },
      { tile: "BUSH",  peso: 5  },
    ],
  },

  // ─── Ruina ───
  ruina: {
    nombre: "Ruina",
    emoji: "🧱",
    vecinos: [
      { id: "ruina",    peso: 25 },
      { id: "bosque",   peso: 30 },
      { id: "desierto", peso: 30 },
      { id: "pradera",  peso: 15 },
    ],
    tiles: [
      { tile: "GRASS",     peso: 70 },
      { tile: "WALL",      peso: 10 },
      { tile: "ROCK",      peso: 10 },
      { tile: "TALLGRASS", peso: 10 },
    ],
  },

  // ─── Océano ───
  oceano: {
    nombre: "Océano",
    emoji: "🌊",
    vecinos: [
      { id: "oceano", peso: 45 },
      { id: "costa",  peso: 55 },
    ],
    tiles: [
      { tile: "WATER", peso: 93 },
      { tile: "ROCK",  peso: 7  },
    ],
  },

  // ─── Desierto ───
  desierto: {
    nombre: "Desierto",
    emoji: "🏜️",
    vecinos: [
      { id: "desierto", peso: 35 },
      { id: "pradera",  peso: 35 },
      { id: "ruina",    peso: 20 },
      { id: "costa",    peso: 10 },
    ],
    tiles: [
      { tile: "DESERT_SAND", peso: 85 },
      { tile: "CACTUS",      peso: 5  },
      { tile: "ROCK",        peso: 5  },
      { tile: "SAND",        peso: 5  },
    ],
  },

  // ─── Nieve ───
  nieve: {
    nombre: "Nieve",
    emoji: "❄️",
    vecinos: [
      { id: "nieve",   peso: 35 },
      { id: "bosque",  peso: 40 },
      { id: "pradera", peso: 25 },
    ],
    tiles: [
      { tile: "SNOW", peso: 75 },
      { tile: "PINE", peso: 10 },
      { tile: "ICE",  peso: 8  },
      { tile: "ROCK", peso: 7  },
    ],
  },

};

// ─── Bioma inicial del mundo (zona 0) ───
const BIOMA_INICIAL = "pradera";