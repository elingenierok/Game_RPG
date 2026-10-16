// ═══════════════════════════════════════════════════════════════
//  BLOQUE 20 · SISTEMA DE CÁMARA
// ─────────────────────────────────────────────────────────────────
//  La cámara sigue EXACTAMENTE la posición visual del jugador.
//  No anima por su cuenta: se sincroniza con el jugador en cada frame.
// ═══════════════════════════════════════════════════════════════

const camara = {
  x: 0,
  y: 0,
};

// ─── Iniciar la cámara en una posición ───
function iniciarCamara(x, y) {
  camara.x = x;
  camara.y = y;
}

// ─── Sincronizar la cámara con la posición visual del jugador ───
//  Se llama cada frame, después de actualizar al jugador.
function sincronizarCamara() {
  camara.x = estado.jugador.wx;
  camara.y = estado.jugador.wy;
}

// ─── Actualizar la cámara (compatibilidad) ───
function actualizarCamara() {
  sincronizarCamara();
}

// ─── Obtener el offset en píxeles para dibujar el mundo ───
function obtenerOffsetCamara() {
  const centroX = Math.floor(ANCHO_VENTANA / 2);
  const centroY = Math.floor(ALTO_VENTANA / 2);

  const esquinaX = camara.x - centroX;
  const esquinaY = camara.y - centroY;

  return {
    esquinaX: esquinaX,
    esquinaY: esquinaY,
    esquinaIntX: Math.floor(esquinaX),
    esquinaIntY: Math.floor(esquinaY),
    offsetPxX: -esquinaX * TAMANO_CELDA,
    offsetPxY: -esquinaY * TAMANO_CELDA,
  };
}

// ═══════════════════════════════════════════════════════════════
//  CONVERSIÓN DE COORDENADAS
// ═══════════════════════════════════════════════════════════════

function normalizarChunk(c) {
  const rango = LIMITE_CHUNKS * 2 + 1;
  let resultado = ((c % rango) + rango) % rango;
  if (resultado > LIMITE_CHUNKS) resultado -= rango;
  return resultado;
}

function coordsMundoAChunk(wx, wy) {
  const chunkX = Math.floor(wx / ANCHO_CHUNK);
  const chunkY = Math.floor(wy / ALTO_CHUNK);
  const localX = wx - chunkX * ANCHO_CHUNK;
  const localY = wy - chunkY * ALTO_CHUNK;

  return {
    cx: normalizarChunk(chunkX),
    cy: normalizarChunk(chunkY),
    lx: localX,
    ly: localY,
  };
}

function coordsMundoATile(wx, wy) {
  return coordsMundoAChunk(Math.floor(wx), Math.floor(wy));
}