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