// ═══════════════════════════════════════════════════════════════
//  BLOQUE 8 · CARGA DE CHUNKS 2D
// ─────────────────────────────────────────────────────────────────
//  Cada chunk se identifica por (cx, cy).
//  El caché usa la clave "cx,cy".
//
//  obtenerChunk(cx, cy):
//    1. Si ya está en caché → lo devuelve
//    2. Si no → lo genera y lo guarda
// ═══════════════════════════════════════════════════════════════

function obtenerChunk(cx, cy) {
  const clave = cx + "," + cy;
  if (cacheChunks.has(clave)) return cacheChunks.get(clave);

  const chunk = generarPantallaValida(SEMILLA, cx, cy);
  cacheChunks.set(clave, chunk);
  return chunk;
}

// ─── Inicialización del jugador (spawn) ───
function inicializarJugador() {
  if (estado.jugador.inicializado) return;

  const chunk = obtenerChunk(0, 0);
  const rng = crearRNG(hashString(SEMILLA + "@spawn"));
  const libres = [];

  for (let ly = 1; ly < ALTO_CHUNK - 1; ly++) {
    for (let lx = 1; lx < ANCHO_CHUNK - 1; lx++) {
      if (!BLOQUEANTES.has(chunk.mapa[ly][lx])) {
        libres.push([lx, ly]);
      }
    }
  }

  if (libres.length === 0) {
    estado.jugador.wx = Math.floor(ANCHO_CHUNK / 2);
    estado.jugador.wy = Math.floor(ALTO_CHUNK / 2);
  } else {
    // Elegir el más cercano al centro del chunk
    const centroX = Math.floor(ANCHO_CHUNK / 2);
    const centroY = Math.floor(ALTO_CHUNK / 2);
    libres.sort((a, b) => {
      const distA = Math.abs(a[0] - centroX) + Math.abs(a[1] - centroY);
      const distB = Math.abs(b[0] - centroX) + Math.abs(b[1] - centroY);
      return distA - distB;
    });
    const [lx, ly] = libres[0];
    estado.jugador.wx = lx;
    estado.jugador.wy = ly;
  }

  estado.jugador.inicializado = true;

  colocarHoguerasDeSpawn();

  if (typeof iniciarCamara === "function") {
    iniciarCamara(estado.jugador.wx, estado.jugador.wy);
  }

  inicializarLlave();
}

// ─── Hogueras del campamento inicial (F1: fuente de luz fija) ───
//  Solo se generan cerca del spawn, nunca en el resto del mundo.
function colocarHoguerasDeSpawn() {
  const chunk = obtenerChunk(0, 0);
  const rng = crearRNG(hashString(SEMILLA + "@hogueras"));
  const centroX = estado.jugador.wx;
  const centroY = estado.jugador.wy;
  const candidatos = [];

  for (let ly = 1; ly < ALTO_CHUNK - 1; ly++) {
    for (let lx = 1; lx < ANCHO_CHUNK - 1; lx++) {
      const dx = lx - centroX;
      const dy = ly - centroY;
      const d2 = dx * dx + dy * dy;
      if (d2 < 1 || d2 > 16) continue;   // entre 1 y 4 celdas del spawn
      const tile = chunk.mapa[ly][lx];
      if (BLOQUEANTES.has(tile)) continue;
      if (tile === LLAGUE || tile === MANZANA || tile === HOGUERA) continue;
      candidatos.push([lx, ly]);
    }
  }

  // Mezcla determinista
  for (let i = candidatos.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i);
    const tmp = candidatos[i];
    candidatos[i] = candidatos[j];
    candidatos[j] = tmp;
  }

  const cantidad = Math.min(2, candidatos.length);
  for (let k = 0; k < cantidad; k++) {
    const [lx, ly] = candidatos[k];
    chunk.mapa[ly][lx] = HOGUERA;
  }
}

// ─── Inicialización de la llave ───
function inicializarLlave() {
  const chunk = obtenerChunk(LLAVE_CHUNK_CX, LLAVE_CHUNK_CY);
  const rng = crearRNG(hashString(SEMILLA + "@llave"));
  const libres = [];

  for (let ly = 1; ly < ALTO_CHUNK - 1; ly++) {
    for (let lx = 1; lx < ANCHO_CHUNK - 1; lx++) {
      if (!BLOQUEANTES.has(chunk.mapa[ly][lx])) {
        libres.push([lx, ly]);
      }
    }
  }

  if (libres.length > 0) {
    const [lx, ly] = libres[randInt(rng, 0, libres.length - 1)];
    estado.llave.wx = LLAVE_CHUNK_CX * ANCHO_CHUNK + lx;
    estado.llave.wy = LLAVE_CHUNK_CY * ALTO_CHUNK + ly;
  }
}