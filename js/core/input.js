// ═══════════════════════════════════════════════════════════════
//  BLOQUE 14 · INPUT
// ═══════════════════════════════════════════════════════════════
document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "w" || k === "arrowup")    intentarMover(0, -1);
  if (k === "s" || k === "arrowdown")  intentarMover(0, +1);
  if (k === "a" || k === "arrowleft")  intentarMover(-1, 0);
  if (k === "d" || k === "arrowright") intentarMover(+1, 0);
});