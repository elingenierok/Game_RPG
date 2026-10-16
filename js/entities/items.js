// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.5 · ÍTEMS (chunks 2D)
// ─────────────────────────────────────────────────────────────────
//  Ahora los ítems viven en coordenadas del mundo (wx, wy).
//  Un chunk es de 32×32 celdas.
// ═══════════════════════════════════════════════════════════════

const _cacheItemsPorChunk = new Map();

// ─── Genera los ítems de un chunk (0-3 por chunk) ───
function generarItemsDeChunk(cx, cy) {
  const clave = cx + "," + cy;
  if (_cacheItemsPorChunk.has(clave)) return _cacheItemsPorChunk.get(clave);

  const rng = crearRNG(hashString(SEMILLA_OBJETOS + "@items@" + cx + "," + cy));
  const items = [];
  const cantidad = randInt(rng, 0, 3);
  const maxIntentos = 20;

  const chunk = obtenerChunk(cx, cy);

  for (let i = 0; i < cantidad; i++) {
    for (let intento = 0; intento < maxIntentos; intento++) {
      const lx = randInt(rng, 1, ANCHO_CHUNK - 2);
      const ly = randInt(rng, 1, ALTO_CHUNK - 2);

            if (BLOQUEANTES.has(chunk.mapa[ly][lx])) continue;
      if (chunk.mapa[ly][lx] === WATER) continue;

      const wx = cx * ANCHO_CHUNK + lx;
      const wy = cy * ALTO_CHUNK + ly;

      if (items.some(it => it.wx === wx && it.wy === wy)) continue;

      // No spawnear manzana si hay un mob en esa celda
      if (typeof cacheMobs !== "undefined") {
        const mobs = cacheMobs.get(cx + "," + cy);
        if (mobs && mobs.some(m => m.wx === wx && m.wy === wy)) continue;
      }

      items.push({ wx, wy, tipo: MANZANA });
      break;
    }
  }

  _cacheItemsPorChunk.set(clave, items);
  return items;
}

// ─── Obtiene los ítems que pueden estar en coordenadas (wx, wy) ───
//  Como el mundo es grande, solo consultamos el chunk de esa celda.
function obtenerItemsDeChunk(wx, wy) {
  const info = coordsMundoATile(wx, wy);
  const items = generarItemsDeChunk(info.cx, info.cy);
  return items;
}

// ─── Datos de un ítem ───
function tipoItemANombre(tipo) {
  if (tipo === MANZANA) return "MANZANA";
  return "DESCONOCIDO";
}

function iconoDeItem(tipo) {
  return ICONOS[tipo] || "?";
}

// ─── Recoger un ítem en coordenadas del mundo ───
function recogerItemEn(wx, wy) {
  const clave = wx + "," + wy;
  if (estado.itemsRecogidos.has(clave)) return null;

  const info = coordsMundoATile(wx, wy);
  const items = generarItemsDeChunk(info.cx, info.cy);
  const item = items.find(it => it.wx === wx && it.wy === wy);
  if (!item) return null;

  const tileBase = tileEnMundo(wx, wy);
  if (BLOQUEANTES.has(tileBase)) return null;

  estado.itemsRecogidos.add(clave);
  const nombre = tipoItemANombre(item.tipo);
  estado.inventario[nombre] = (estado.inventario[nombre] || 0) + 1;
  return item;
}

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.5b · OBJETOS EQUIPABLES (chunks 2D)
// ─────────────────────────────────────────────────────────────────
//  Cada equipable se genera UNA VEZ por mundo, en un chunk
//  específico elegido al azar según la semilla.
// ═══════════════════════════════════════════════════════════════

const EQUIPABLES = [
  { tipo: HACHA,    bioma: "bosque"  },
  { tipo: PICO,     bioma: "ruina"   },
  { tipo: LINTERNA, bioma: "costa"   },
  { tipo: BARCO,    bioma: "costa",  porChunk: true },
];

const _cacheEquipablesPorChunk = new Map();
const _zonasEquipables = new Map();

// ─── Determina el chunk donde va cada equipable ───
function obtenerChunkDeEquipable(tipo, bioma) {
  if (_zonasEquipables.has(tipo)) return _zonasEquipables.get(tipo);

  const config = EQUIPABLES.find(e => e.tipo === tipo);
  if (config && config.porChunk) {
    _zonasEquipables.set(tipo, "porChunk");
    return "porChunk";
  }

  // Buscar chunks del bioma correspondiente
  const candidatos = [];
  const r = LIMITE_CHUNKS;
  for (let cy = -r; cy <= r; cy++) {
    for (let cx = -r; cx <= r; cx++) {
      if (cx === 0 && cy === 0) continue;
      const biomaChunk = obtenerBiomaDeChunk(SEMILLA, cx, cy);
      if (biomaChunk === bioma) candidatos.push({ cx, cy });
    }
  }

  if (candidatos.length === 0) {
    _zonasEquipables.set(tipo, null);
    return null;
  }

  const clave = SEMILLA_OBJETOS + "@equipable_chunk@" + tipo;
  const rng = crearRNG(hashString(clave));
  const elegido = candidatos[Math.floor(rng() * candidatos.length)];

  _zonasEquipables.set(tipo, elegido);
  return elegido;
}

// ─── Genera los equipables de un chunk ───
function generarEquipablesDeChunk(cx, cy) {
  const clave = cx + "," + cy;
  if (_cacheEquipablesPorChunk.has(clave)) return _cacheEquipablesPorChunk.get(clave);

  const chunk = obtenerChunk(cx, cy);
  const equipables = [];

  for (const { tipo, bioma } of EQUIPABLES) {
    const config = EQUIPABLES.find(e => e.tipo === tipo);
    const chunkObjetivo = obtenerChunkDeEquipable(tipo, bioma);

    // ¿Va en este chunk?
    if (config.porChunk) {
      // Debe ser del bioma correcto
      if (chunk.bioma !== bioma) continue;
    } else {
      if (!chunkObjetivo || chunkObjetivo.cx !== cx || chunkObjetivo.cy !== cy) continue;
    }

    const rng = crearRNG(hashString(SEMILLA_OBJETOS + "@equipable@" + tipo + "@" + cx + "," + cy));
    const maxIntentos = (tipo === BARCO) ? 80 : 30;

    for (let intento = 0; intento < maxIntentos; intento++) {
      const lx = randInt(rng, 1, ANCHO_CHUNK - 2);
      const ly = randInt(rng, 1, ALTO_CHUNK - 2);

      if (BLOQUEANTES.has(chunk.mapa[ly][lx])) continue;
      if (chunk.mapa[ly][lx] === WATER) continue;

      if (tipo === BARCO) {
        if (lx <= 1 || lx >= ANCHO_CHUNK - 2) continue;
        if (ly <= 1 || ly >= ALTO_CHUNK - 2) continue;

        const tieneAgua =
          (ly > 0 && chunk.mapa[ly-1][lx] === WATER) ||
          (ly < ALTO_CHUNK - 1 && chunk.mapa[ly+1][lx] === WATER) ||
          (lx > 0 && chunk.mapa[ly][lx-1] === WATER) ||
          (lx < ANCHO_CHUNK - 1 && chunk.mapa[ly][lx+1] === WATER);
        if (!tieneAgua) continue;
      }

      const wx = cx * ANCHO_CHUNK + lx;
      const wy = cy * ALTO_CHUNK + ly;

      if (equipables.some(e => e.wx === wx && e.wy === wy)) continue;

      // No spawnear equipable si hay un mob en esa celda
      if (typeof cacheMobs !== "undefined") {
        const mobs = cacheMobs.get(cx + "," + cy);
        if (mobs && mobs.some(m => m.wx === wx && m.wy === wy)) continue;
      }

      equipables.push({ tipo, wx, wy });
      break;
    }
  }

  _cacheEquipablesPorChunk.set(clave, equipables);
  return equipables;
}

// ─── Obtiene los equipables que pueden estar en (wx, wy) ───
function obtenerEquipablesDeChunk(wx, wy) {
  const info = coordsMundoATile(wx, wy);
  return generarEquipablesDeChunk(info.cx, info.cy);
}

// ─── Recoger un equipable ───
function recogerEquipableEn(wx, wy) {
  const clave = wx + "," + wy;
  if (estado.itemsRecogidos.has(clave)) return null;

  const info = coordsMundoATile(wx, wy);
  const equipables = generarEquipablesDeChunk(info.cx, info.cy);
  const eq = equipables.find(e => e.wx === wx && e.wy === wy);
  if (!eq) return null;

  const nombre = tipoEquipableANombre(eq.tipo);
  estado.inventario[nombre] = (estado.inventario[nombre] || 0) + 1;

  estado.itemsRecogidos.add(clave);

  return eq;
}

function tipoEquipableANombre(tipo) {
  if (tipo === HACHA)    return "HACHA";
  if (tipo === PICO)     return "PICO";
  if (tipo === LINTERNA) return "LINTERNA";
  if (tipo === BARCO)    return "BARCO";
  return "DESCONOCIDO";
}