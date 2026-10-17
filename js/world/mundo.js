// ═══════════════════════════════════════════════════════════════
//  ESCALA DE BIOMAS
// ─────────────────────────────────────────────────────────────────
//  0.01 → 1 bioma ≈ 100 celdas ≈ 3 chunks
//  Más chico → biomas más grandes
//  Más grande → biomas más chicos
// ═══════════════════════════════════════════════════════════════
const ESCALA_BIOMA = 0.01;

// ═══════════════════════════════════════════════════════════════
//  BIOMA POR CELDA (ruido temperatura + humedad)
// ─────────────────────────────────────────────────────────────────
//  Devuelve el bioma de una celda del mundo usando ruido.
//  Determinista por semilla.
// ═══════════════════════════════════════════════════════════════
function obtenerBiomaDeCelda(semillaBase, wx, wy) {
  const seed = hashString(semillaBase + "@bioma");

  // Temperatura y humedad con ruido
  const temp = ruido2D(wx * ESCALA_BIOMA, wy * ESCALA_BIOMA, seed);
  const hum  = ruido2D(wx * ESCALA_BIOMA + 1000, wy * ESCALA_BIOMA + 1000, seed + 100);

  // Buscar el bioma más cercano
  let mejor = BIOMA_INICIAL;
  let mejorDist = Infinity;

  for (const id in BIOMAS) {
    const b = BIOMAS[id];
    const dt = temp - b.temperatura;
    const dh = hum - b.humedad;
    const dist = dt * dt + dh * dh;
    if (dist < mejorDist) {
      mejorDist = dist;
      mejor = id;
    }
  }

  return mejor;
}
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

  // ─── Fondo inicial (pradera) ───
  for (let y = 0; y < ALTO_CHUNK; y++) {
    mapa.push(new Array(ANCHO_CHUNK).fill(GRASS));
  }

  // ─── Pintar celda por celda según bioma de ruido ───
  const yMin = 1, yMax = ALTO_CHUNK - 2;

  for (let y = yMin; y <= yMax; y++) {
    for (let x = 0; x < ANCHO_CHUNK; x++) {
      const wx = cx * ANCHO_CHUNK + x;
      const wy = cy * ALTO_CHUNK + y;

      const biomaId = obtenerBiomaDeCelda(semillaBase, wx, wy);
      const datosBioma = BIOMAS[biomaId];
      if (!datosBioma) continue;

      // Caso especial: costa (franja) → todavía usa la lógica vieja por chunk
      if (datosBioma.forma === "franja") {
        // Por ahora, pintar costa con su tileBase (SAND).
        // La lógica de franja se maneja aparte (ver pintarCosta).
        const tileID = NOMBRE_A_TILE[datosBioma.tileBase];
        if (tileID !== undefined) mapa[y][x] = tileID;
        continue;
      }

      // Elegir tile por peso
      const sumaPesos = datosBioma.tiles.reduce((acc, t) => acc + t.peso, 0);
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

  // ─── Bioma dominante del chunk (para spawns) ───
  const biomaDominante = obtenerBiomaDeChunk(semillaBase, cx, cy);

  return { mapa, bioma: biomaDominante };
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