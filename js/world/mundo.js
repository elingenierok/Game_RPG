// ═══════════════════════════════════════════════════════════════
//  BLOQUE 4 · FRONTERAS ENTRE CHUNKS
// ─────────────────────────────────────────────────────────────────
//  TODO (futuro): fronteras compartidas en 4 direcciones.
//  Por ahora, cada chunk se genera independientemente.
// ═══════════════════════════════════════════════════════════════
// (Sin implementación todavía. Se hace en Fase 8.)

// ═══════════════════════════════════════════════════════════════
//  MOTOR DE ASIGNACIÓN DE BIOMAS
// ─────────────────────────────────────────────────────────────────
//  El bioma de un chunk se decide con hash determinista según (cx, cy).
//  Por ahora: aleatorio entre los biomas disponibles, sin vecinos.
//  En el futuro: vecinos + pesos en 2D.
// ═══════════════════════════════════════════════════════════════
const _cacheBiomasPorChunk = new Map();

function obtenerBiomaDeChunk(semillaBase, cx, cy) {
  const clave = cx + "," + cy;
  if (_cacheBiomasPorChunk.has(clave)) {
    return _cacheBiomasPorChunk.get(clave);
  }

  // Zona (0,0): siempre pradera (segura)
  if (cx === 0 && cy === 0) {
    _cacheBiomasPorChunk.set(clave, BIOMA_INICIAL);
    return BIOMA_INICIAL;
  }

  // Hash determinista para este chunk
  const h = hashString(semillaBase + "@bioma@" + cx + "," + cy);
  const lista = Object.keys(BIOMAS);
  const elegido = lista[h % lista.length];

  _cacheBiomasPorChunk.set(clave, elegido);
  return elegido;
}

// ─── Limpia el cache de biomas ───
function limpiarCacheBiomas() {
  _cacheBiomasPorChunk.clear();
}

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 5 · GENERADOR DE CHUNK
// ─────────────────────────────────────────────────────────────────
//  Genera un chunk de ANCHO_CHUNK × ALTO_CHUNK celdas.
//  Recibe (cx, cy) en lugar de "zona".
// ═══════════════════════════════════════════════════════════════
function generarPantalla(semillaBase, cx, cy) {
  const rng = crearRNG(hashString(semillaBase + "@chunk@" + cx + "," + cy));
  const mapa = [];

  for (let y = 0; y < ALTO_CHUNK; y++) {
    mapa.push(new Array(ANCHO_CHUNK).fill(GRASS));
  }

  // ─── Elegir bioma del chunk ───
  const bioma = obtenerBiomaDeChunk(semillaBase, cx, cy);
  const datosBioma = BIOMAS[bioma];

  // ─── Pintar el interior según los tiles del bioma ───
  const yMin = 1, yMax = ALTO_CHUNK - 2;
  const sumaPesos = datosBioma.tiles.reduce((acc, t) => acc + t.peso, 0);

  for (let y = yMin; y <= yMax; y++) {
    for (let x = 0; x < ANCHO_CHUNK; x++) {
      const tiro = rng() * sumaPesos;
      let acumulado = 0;
      let elegido = "GRASS";
      for (const t of datosBioma.tiles) {
        acumulado += t.peso;
        if (tiro <= acumulado) {
          elegido = t.tile;
          break;
        }
      }
      const tileID = NOMBRE_A_TILE[elegido];
      if (tileID !== undefined) {
        mapa[y][x] = tileID;
      }
    }
  }

  return { mapa, bioma };
}

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 6 · VALIDACIÓN DE TRANSITABILIDAD
// ─────────────────────────────────────────────────────────────────
//  Con chunks 2D, no forzamos transitabilidad por ahora.
//  La validación se hará cuando tengamos el sistema completo.
// ═══════════════════════════════════════════════════════════════
function generarPantallaValida(semillaBase, cx, cy) {
  // Por ahora: sin validación, devuelve el chunk directo.
  return generarPantalla(semillaBase, cx, cy);
}