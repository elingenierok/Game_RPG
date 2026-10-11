// ═══════════════════════════════════════════════════════════════
//  BLOQUE 18 · CONFIGURACIÓN DE LÍMITE DE CHUNKS
// ═══════════════════════════════════════════════════════════════
//  funLimiteChunk(N) → el mundo se extiende N chunks a cada lado.
//  Ej: funLimiteChunk(5)  → zonas -5 a +5 (11 zonas totales)
//      funLimiteChunk(99) → zonas -99 a +99 (199 zonas totales)
function funLimiteChunk(N) {
  LIMITE_CHUNKS = N;
  console.log("📏 Límite de chunks actualizado a:", N);
  console.log("   Zonas disponibles:", -N, "a", N);
}