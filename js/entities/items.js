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
      if (chunk.mapa[y][x] === WATER) continue;
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
//  Los objetos equipables (🪓 ⛏️ 🕯️ 🛶) son únicos por mundo:
//  1 de cada uno, en una zona específica elegida AL AZAR entre
//  todas las zonas del mundo que cumplan con los requisitos.
//
//  Semilla: SEMILLA_OBJETOS.
//  Ubicación: determinista por semilla (misma semilla → mismo lugar).
// ═══════════════════════════════════════════════════════════════

// Configuración: qué objeto va en qué bioma
const EQUIPABLES = [
  { tipo: HACHA,    bioma: "bosque"  },
  { tipo: PICO,     bioma: "ruina"   },
  { tipo: LINTERNA, bioma: "costa"   },
  { tipo: BARCO,    bioma: "costa",  porChunk: true },
];

// Cache: zona → [{ tipo, x, y }]
const cacheEquipables = new Map();

// Cache: tipo → zona donde va
const _zonasEquipables = new Map();

// ─── Determina en qué zona va cada equipable ───
function obtenerZonaDeEquipable(tipo, bioma) {
  if (_zonasEquipables.has(tipo)) return _zonasEquipables.get(tipo);

  // ¿Este equipable va en TODOS los chunks del bioma? (porChunk)
  const config = EQUIPABLES.find(e => e.tipo === tipo);
  if (config && config.porChunk) {
    _zonasEquipables.set(tipo, "porChunk");
    return "porChunk";
  }

  const candidatas = [];

  for (let z = -LIMITE_CHUNKS; z <= LIMITE_CHUNKS; z++) {
    if (z === 0) continue;
    const chunk = cacheChunks.get(z) || obtenerChunk(z);
    if (chunk && chunk.bioma === bioma) {
      candidatas.push(z);
    }
  }

  if (candidatas.length === 0) {
    _zonasEquipables.set(tipo, null);
    return null;
  }

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
    // ¿Va en todos los chunks del bioma?
    const config = EQUIPABLES.find(e => e.tipo === tipo);
    const zonaObjeto = obtenerZonaDeEquipable(tipo, bioma);

    if (config && config.porChunk) {
      // Debe ser del bioma correspondiente
      if (chunk.bioma !== bioma) continue;
    } else {
      // Solo en la zona elegida
      if (zonaObjeto !== zona) continue;
    }

    const rng = crearRNG(hashString(SEMILLA_OBJETOS + "@equipable" + tipo + "@zona" + zona));

    // El barco necesita más intentos porque tiene más restricciones
    const maxIntentos = (tipo === BARCO) ? 80 : 30;

    for (let intento = 0; intento < maxIntentos; intento++) {
      const x = randInt(rng, 1, ANCHO_PANTALLA - 2);
      const y = randInt(rng, 1, ALTO_PANTALLA - 2);

      // No sobre bloqueantes
      if (BLOQUEANTES.has(chunk.mapa[y][x])) continue;

      // No sobre agua
      if (chunk.mapa[y][x] === WATER) continue;

      // ─── Reglas especiales del barco ───
      if (tipo === BARCO) {
        // No puede estar en los bordes del chunk (para que sea accesible)
        if (x <= 1 || x >= ANCHO_PANTALLA - 2) continue;
        if (y <= 1 || y >= ALTO_PANTALLA - 2) continue;

        // Debe tener agua adyacente
        const tieneAguaAlLado =
          (y > 0 && chunk.mapa[y-1][x] === WATER) ||
          (y < ALTO_PANTALLA - 1 && chunk.mapa[y+1][x] === WATER) ||
          (x > 0 && chunk.mapa[y][x-1] === WATER) ||
          (x < ANCHO_PANTALLA - 1 && chunk.mapa[y][x+1] === WATER);
        if (!tieneAguaAlLado) continue;
      }

      // No sobre la llave
      if (estado.llave.zona === zona &&
          estado.llave.x === x && estado.llave.y === y) continue;

      // No sobre otro equipable
      if (equipables.some(e => e.x === x && e.y === y)) continue;

      // No sobre manzana
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
  if (tipo === BARCO)    return "BARCO";
  return "DESCONOCIDO";
}