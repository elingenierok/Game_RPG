// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.8 · ENEMIGOS · Spawn, render, colisión
// ─────────────────────────────────────────────────────────────────
//  Los mobs se generan con su propio RNG (@mobs), separado del
//  terreno y los ítems.
//
//  Cache: los mobs de un chunk se generan una vez y se guardan en
//  caché hasta que el jugador cambia de semilla o el mob muere.
// ═══════════════════════════════════════════════════════════════

const cacheMobs = new Map();       // zona → [{ tipo, x, y }]
const mobsDerrotados = new Set();  // "zona:x,y" de mobs eliminados

// ─── Genera los mobs de un chunk ───
function obtenerMobsDeChunk(zona) {
  if (cacheMobs.has(zona)) return cacheMobs.get(zona);

  const rng = crearRNG(hashString(SEMILLA_MOBS + "@mobs" + zona));
  const chunk = cacheChunks.get(zona) || obtenerChunk(zona);
  if (!chunk) {
    cacheMobs.set(zona, []);
    return [];
  }

  const bioma = chunk.bioma;
  const mobs = [];

  // Para cada tipo de mob
  for (const id of Object.keys(MOBS)) {
    const mob = MOBS[id];

    // ¿Aparece en este bioma?
    if (!mob.spawn.biomas[bioma]) continue;

    // Cantidad aleatoria de este tipo
    const [min, max] = mob.spawn.porChunk;
    const cantidad = randInt(rng, min, max);

    for (let i = 0; i < cantidad; i++) {
      // Buscar posición válida
      let colocado = false;
      for (let intento = 0; intento < 20; intento++) {
        const x = randInt(rng, 1, ANCHO_PANTALLA - 2);
        const y = randInt(rng, 1, ALTO_PANTALLA - 2);

        // No sobre bloqueantes del terreno
        if (BLOQUEANTES.has(chunk.mapa[y][x])) continue;

        // No sobre llave
        if (estado.llave.zona === zona &&
            estado.llave.x === x && estado.llave.y === y) continue;

        // No sobre otro mob
        if (mobs.some(m => m.x === x && m.y === y)) continue;

        mobs.push({ tipo: id, x, y });
        colocado = true;
        break;
      }
    }
  }

  cacheMobs.set(zona, mobs);
  return mobs;
}

// ─── Obtiene el mob en una posición (o null) ───
function obtenerMobEn(zona, x, y) {
  const clave = zona + ":" + x + "," + y;
  if (mobsDerrotados.has(clave)) return null;

  const mobs = obtenerMobsDeChunk(zona);
  return mobs.find(m => m.x === x && m.y === y) || null;
}

// ─── Marca un mob como derrotado ───
function derrotarMobEn(zona, x, y) {
  const clave = zona + ":" + x + "," + y;
  mobsDerrotados.add(clave);
  console.log(`⚔️ Mob derrotado en zona ${zona}, posición ${x},${y}`);
}