// ═══════════════════════════════════════════════════════════════
//  BLOQUE 3.5 · RUIDO (Value Noise + fBm)
// ─────────────────────────────────────────────────────────────────
//  Genera valores suaves entre 0 y 1 a partir de coordenadas (x, y).
//  Se usa para decidir biomas de forma orgánica (no cuadrados).
//
//  Depende de: nada (autocontenido).
// ═══════════════════════════════════════════════════════════════

// ─── Hash rápido para ruido (determinista) ───
function _hashRuido(x, y, seed) {
  let h = 2166136261 ^ seed;
  h = Math.imul(h ^ x, 16777619);
  h = Math.imul(h ^ y, 16777619);
  h ^= h >>> 13;
  h = Math.imul(h, 16777619);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
}

// ─── Suavizado (smoothstep) ───
function _smoothstep(t) {
  return t * t * (3 - 2 * t);
}

// ─── Interpolación lineal ───
function _lerp(a, b, t) {
  return a + (b - a) * t;
}

// ─── Value Noise 2D ───
//  Devuelve un valor suave entre 0 y 1 para (x, y).
function ruido2D(x, y, seed) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  const v00 = _hashRuido(x0, y0, seed);
  const v10 = _hashRuido(x1, y0, seed);
  const v01 = _hashRuido(x0, y1, seed);
  const v11 = _hashRuido(x1, y1, seed);

  const tx = _smoothstep(x - x0);
  const ty = _smoothstep(y - y0);

  const a = _lerp(v00, v10, tx);
  const b = _lerp(v01, v11, tx);
  return _lerp(a, b, ty);
}

// ─── fBm · Ruido fractal con varias octavas ───
//  Suma varias capas de ruido para dar más detalle.
//  octavas: cuántas capas (3 por defecto)
//  persistencia: cuánto pesa cada octava (0.5 por defecto)
function ruidoFBM(x, y, seed, octavas = 3, persistencia = 0.5) {
  let valor = 0;
  let amplitud = 1;
  let frecuencia = 1;
  let maxValor = 0;

  for (let i = 0; i < octavas; i++) {
    valor += ruido2D(x * frecuencia, y * frecuencia, seed + i * 1000) * amplitud;
    maxValor += amplitud;
    amplitud *= persistencia;
    frecuencia *= 2;
  }

  return valor / maxValor;
}