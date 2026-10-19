// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.8 · ENEMIGOS (chunks 2D)
// ─────────────────────────────────────────────────────────────────
//  Los mobs se generan por chunk. Cada chunk tiene sus mobs,
//  cacheados por "cx,cy".
// ═══════════════════════════════════════════════════════════════

const cacheMobs = new Map();   // "cx,cy" → [{tipo, wx, wy, estado, ...}]

// ─── Genera los mobs de un chunk ───
function generarMobsDeChunk(cx, cy) {
  const clave = cx + "," + cy;
  if (cacheMobs.has(clave)) return cacheMobs.get(clave);

  // Zona (0,0): sin mobs (zona segura)
  if (cx === 0 && cy === 0) {
    cacheMobs.set(clave, []);
    return [];
  }

  const chunk = obtenerChunk(cx, cy);
  const rng = crearRNG(hashString(SEMILLA_MOBS + "@mobs@" + cx + "," + cy));
  const mobs = [];

  for (const id of Object.keys(MOBS)) {
    const mob = MOBS[id];
    if (!mob.spawn.biomas[chunk.bioma]) continue;

    const [min, max] = mob.spawn.porChunk;
    const cantidad = randInt(rng, min, max);

    for (let i = 0; i < cantidad; i++) {
      let colocado = false;
      for (let intento = 0; intento < 20; intento++) {
        const lx = randInt(rng, 1, ANCHO_CHUNK - 2);
        const ly = randInt(rng, 1, ALTO_CHUNK - 2);

        if (BLOQUEANTES.has(chunk.mapa[ly][lx])) continue;

        const wx = cx * ANCHO_CHUNK + lx;
        const wy = cy * ALTO_CHUNK + ly;

        // No spawnear un mob sobre un ítem o equipable
        const items = generarItemsDeChunk(cx, cy);
        if (items.some(it => it.wx === wx && it.wy === wy)) continue;

        const equipables = generarEquipablesDeChunk(cx, cy);
        if (equipables.some(e => e.wx === wx && e.wy === wy)) continue;

        if (mobs.some(m => m.wx === wx && m.wy === wy)) continue;

        mobs.push({
          tipo: id,
          wx: wx,
          wy: wy,
          hpActual: mob.hp,   // ← NUEVO
          hpMax: mob.hp,      // ← NUEVO
          estado: "DEAMBULANDO",
          tickContador: 0,
          mirandoIzquierda: false,
        });
        colocado = true;
        break;
      }
    }
  }

  cacheMobs.set(clave, mobs);
  return mobs;
}

// ─── Obtiene el mob en coordenadas del mundo (o null) ───
function obtenerMobEn(wx, wy) {
  const info = coordsMundoATile(wx, wy);
  const mobs = generarMobsDeChunk(info.cx, info.cy);
  return mobs.find(m => m.wx === wx && m.wy === wy) || null;
}

// ─── Marca un mob como derrotado ───
function derrotarMobEn(wx, wy) {
  const info = coordsMundoATile(wx, wy);
  const mobs = cacheMobs.get(info.cx + "," + info.cy);
  if (!mobs) return;

  const idx = mobs.findIndex(m => m.wx === wx && m.wy === wy);
  if (idx === -1) return;

  mobs.splice(idx, 1);
  console.log(`⚔️ Mob derrotado en ${wx},${wy}`);
}