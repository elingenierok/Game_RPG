// ═══════════════════════════════════════════════════════════════
//  BLOQUE 8 · CARGA DE PANTALLA Y GESTIÓN DE CHUNKS
// ─────────────────────────────────────────────────────────────────
//  obtenerChunk(zona):
//    1. Si ya está en caché → lo devuelve
//    2. Si no → lo genera, le copia las fronteras compartidas,
//       agrega muros sólidos si es un extremo del mundo
//    3. Lo guarda en caché
// ═══════════════════════════════════════════════════════════════
function obtenerChunk(zona) {
  if (cacheChunks.has(zona)) return cacheChunks.get(zona);

  const chunk = generarPantallaValida(SEMILLA, zona);

  const fronteraOeste = generarFrontera(SEMILLA, zona - 1, zona);
  for (let y = 0; y < ALTO_PANTALLA; y++) {
    chunk.mapa[y][0] = fronteraOeste[y];
  }

  const fronteraEste = generarFrontera(SEMILLA, zona, zona + 1);
  for (let y = 0; y < ALTO_PANTALLA; y++) {
    chunk.mapa[y][ANCHO_PANTALLA - 1] = fronteraEste[y];
  }

  if (zona === -LIMITE_CHUNKS) {
    for (let y = 0; y < ALTO_PANTALLA; y++) {
      chunk.mapa[y][0] = WALL;
    }
  }
  if (zona === LIMITE_CHUNKS) {
    for (let y = 0; y < ALTO_PANTALLA; y++) {
      chunk.mapa[y][ANCHO_PANTALLA - 1] = WALL;
    }
  }

  cacheChunks.set(zona, chunk);
  return chunk;
}

function cargarPantalla(zona) {
  estado.pantalla = obtenerChunk(zona);
  estado.zona = zona;
  estado.zonasVisitadas.add(zona);

  if (zona === 0 && !estado.jugadorInicializado) {
    const rng = crearRNG(hashString(SEMILLA + "@spawn"));
    const libres = [];
    for (let y = 1; y < ALTO_PANTALLA - 1; y++)
      for (let x = 1; x < ANCHO_PANTALLA - 1; x++)
        if (!BLOQUEANTES.has(estado.pantalla.mapa[y][x]))
          libres.push([x, y]);
    const [sx, sy] = libres[randInt(rng, 0, libres.length - 1)];
    estado.jugador = { x: sx, y: sy };
    estado.jugadorInicializado = true;
  }

  obtenerChunk(zona - 1);
  obtenerChunk(zona + 1);

  render();
  renderBarraZonas();
  actualizarHUD();
  reanudarTicks();
}