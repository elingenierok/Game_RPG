// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.5 · ÍTEMS
// ─────────────────────────────────────────────────────────────────
//  Los ítems se generan con su propio RNG (@items), separado del
//  terreno. Cada chunk tiene 0 a 3 ítems, siempre en celdas
//  transitables.
// ═══════════════════════════════════════════════════════════════
function obtenerItemsDeChunk(zona) {
  const clave = SEMILLA_OBJETOS + "@items" + zona;
  const rng = crearRNG(hashString(clave));
  const items = [];

  const chunk = cacheChunks.get(zona) || obtenerChunk(zona);
  if (!chunk) return items;

  const cantidad = randInt(rng, 0, 3);
  const maxIntentosPorItem = 20;

  for (let i = 0; i < cantidad; i++) {
    for (let intento = 0; intento < maxIntentosPorItem; intento++) {
      const x = randInt(rng, 1, ANCHO_PANTALLA - 2);
      const y = randInt(rng, 1, ALTO_PANTALLA - 2);

      if (BLOQUEANTES.has(chunk.mapa[y][x])) continue;
      if (estado.llave.zona === zona &&
          estado.llave.x === x && estado.llave.y === y) continue;
      if (items.some(it => it.x === x && it.y === y)) continue;

      items.push({ x, y, tipo: MANZANA });
      break;
    }
  }
  return items;
}

function tipoItemANombre(tipo) {
  if (tipo === MANZANA) return "MANZANA";
  return "DESCONOCIDO";
}

function iconoDeItem(tipo) {
  return ICONOS[tipo] || "?";
}

function recogerItemEn(x, y) {
  const clave = estado.zona + ":" + x + "," + y;
  if (estado.itemsRecogidos.has(clave)) return null;

  const items = obtenerItemsDeChunk(estado.zona);
  const item = items.find(it => it.x === x && it.y === y);
  if (!item) return null;

  const tileBase = estado.pantalla.mapa[y][x];
  if (BLOQUEANTES.has(tileBase)) return null;

  estado.itemsRecogidos.add(clave);
  const nombre = tipoItemANombre(item.tipo);
  estado.inventario[nombre] = (estado.inventario[nombre] || 0) + 1;
  return item;
}

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.5b · OBJETOS EQUIPABLES
// ─────────────────────────────────────────────────────────────────
//  Los objetos equipables (🪓 ⛏️ 🕯️) son únicos por mundo:
//  1 de cada uno, en una zona específica elegida AL AZAR entre
//  todas las zonas del mundo que tengan el bioma correspondiente.
//
//  La elección depende de SEMILLA_OBJETOS → cambia con cada semilla.
//
//  Semilla: SEMILLA_OBJETOS.
//  Ubicación: determinista por semilla (misma semilla → mismo lugar).
// ═══════════════════════════════════════════════════════════════

// Configuración: qué objeto va en qué bioma
const EQUIPABLES = [
  { tipo: HACHA,    bioma: "bosque"  },
  { tipo: PICO,     bioma: "ruina"   },
  { tipo: LINTERNA, bioma: "costa"   },
];

// Cache: zona → [{ tipo, x, y }]
const cacheEquipables = new Map();

// Cache: tipo → zona donde va
const _zonasEquipables = new Map();

// ─── Determina en qué zona va cada equipable ───
//  Busca TODAS las zonas del mundo con el bioma correspondiente
//  y elige una AL AZAR según SEMILLA_OBJETOS.
//  Si no hay ninguna, devuelve null (el objeto no aparece).
function obtenerZonaDeEquipable(tipo, bioma) {
  if (_zonasEquipables.has(tipo)) return _zonasEquipables.get(tipo);

  // Recorrer todas las zonas del mundo (positivas y negativas)
  // y recolectar las que tengan el bioma buscado.
  const candidatas = [];

  for (let z = -LIMITE_CHUNKS; z <= LIMITE_CHUNKS; z++) {
    if (z === 0) continue;   // zona 0 no tiene objetos
    const chunk = cacheChunks.get(z) || obtenerChunk(z);
    if (chunk && chunk.bioma === bioma) {
      candidatas.push(z);
    }
  }

  // Si no hay candidatas, el objeto no aparece en este mundo
  if (candidatas.length === 0) {
    _zonasEquipables.set(tipo, null);
    return null;
  }

  // Elegir una candidata al azar según SEMILLA_OBJETOS
  const clave = SEMILLA_OBJETOS + "@equipable_zona@" + tipo;
  const rng = crearRNG(hashString(clave));
  const indiceElegido = Math.floor(rng() * candidatas.length);
  const zonaElegida = candidatas[indiceElegido];

  _zonasEquipables.set(tipo, zonaElegida);
  return zonaElegida;
}

// ─── Devuelve los equipables de un chunk ───
function obtenerEquipablesDeChunk(zona) {
  if (cacheEquipables.has(zona)) return cacheEquipables.get(zona);

  const chunk = cacheChunks.get(zona) || obtenerChunk(zona);
  if (!chunk) {
    cacheEquipables.set(zona, []);
    return [];
  }

  const equipables = [];

  for (const { tipo, bioma } of EQUIPABLES) {
    const zonaObjeto = obtenerZonaDeEquipable(tipo, bioma);
    if (zonaObjeto !== zona) continue;

    const rng = crearRNG(hashString(SEMILLA_OBJETOS + "@equipable" + tipo + "@zona" + zona));

    for (let intento = 0; intento < 30; intento++) {
      const x = randInt(rng, 1, ANCHO_PANTALLA - 2);
      const y = randInt(rng, 1, ALTO_PANTALLA - 2);

      if (BLOQUEANTES.has(chunk.mapa[y][x])) continue;
      if (estado.llave.zona === zona &&
          estado.llave.x === x && estado.llave.y === y) continue;
      if (equipables.some(e => e.x === x && e.y === y)) continue;

      const items = obtenerItemsDeChunk(zona);
      if (items.some(it => it.x === x && it.y === y)) continue;

      equipables.push({ tipo, x, y });
      break;
    }
  }

  cacheEquipables.set(zona, equipables);
  return equipables;
}

// ─── Obtiene un equipable en una posición (o null) ───
function obtenerEquipableEn(zona, x, y) {
  const equipables = obtenerEquipablesDeChunk(zona);
  return equipables.find(e => e.x === x && e.y === y) || null;
}

// ─── Marca un equipable como recogido (desaparece) ───
function recogerEquipableEn(x, y) {
  const clave = estado.zona + ":" + x + "," + y;
  if (estado.itemsRecogidos.has(clave)) return null;

  const equipables = obtenerEquipablesDeChunk(estado.zona);
  const eq = equipables.find(e => e.x === x && e.y === y);
  if (!eq) return null;

  const nombre = tipoEquipableANombre(eq.tipo);
  estado.inventario[nombre] = (estado.inventario[nombre] || 0) + 1;

  estado.itemsRecogidos.add(clave);

  return eq;
}

// ─── Nombre legible de un equipable ───
function tipoEquipableANombre(tipo) {
  if (tipo === HACHA)    return "HACHA";
  if (tipo === PICO)     return "PICO";
  if (tipo === LINTERNA) return "LINTERNA";
  return "DESCONOCIDO";
}