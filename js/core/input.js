// ═══════════════════════════════════════════════════════════════
//  BLOQUE 14 · INPUT
// ─────────────────────────────────────────────────────────────────
//  Teclado (WASD + flechas) + botones en pantalla.
//  El input es continuo: si mantenés una tecla, el jugador se mueve
//  en cuanto termina la animación anterior.
// ═══════════════════════════════════════════════════════════════

// Estado de las teclas
const teclas = {
  arriba: false,
  abajo: false,
  izquierda: false,
  derecha: false,
};

// Dirección que se está intentando mover
function obtenerDireccionActual() {
  // Si el juego está pausado, no devolver dirección
  if (estado.pausado) return null;

  if (teclas.arriba)    return { dx: 0, dy: -1 };
  if (teclas.abajo)     return { dx: 0, dy: +1 };
  if (teclas.izquierda) return { dx: -1, dy: 0 };
  if (teclas.derecha)   return { dx: +1, dy: 0 };
  return null;
}

// ─── Teclado ───
document.addEventListener("keydown", (e) => {
  if (e.repeat) return;   // ignorar repetición del teclado
  if (estado.pausado) return;   // ← NUEVO: ignorar input si está pausado
  const k = e.key.toLowerCase();
  if (k === "w" || k === "arrowup")    { teclas.arriba = true;    e.preventDefault(); }
  if (k === "s" || k === "arrowdown")  { teclas.abajo = true;     e.preventDefault(); }
  if (k === "a" || k === "arrowleft")  { teclas.izquierda = true; e.preventDefault(); }
  if (k === "d" || k === "arrowright") { teclas.derecha = true;   e.preventDefault(); }
});

document.addEventListener("keyup", (e) => {
  const k = e.key.toLowerCase();
  if (k === "w" || k === "arrowup")    teclas.arriba = false;
  if (k === "s" || k === "arrowdown")  teclas.abajo = false;
  if (k === "a" || k === "arrowleft")  teclas.izquierda = false;
  if (k === "d" || k === "arrowright") teclas.derecha = false;
});

// ─── Botones en pantalla ───
document.querySelectorAll(".btn-mover").forEach((boton) => {
  const dir = boton.dataset.dir;

    const iniciar = (e) => {
    e.preventDefault();
    if (estado.pausado) return;   // ← NUEVO
    if (dir === "arriba")    teclas.arriba = true;
    if (dir === "abajo")     teclas.abajo = true;
    if (dir === "izquierda") teclas.izquierda = true;
    if (dir === "derecha")   teclas.derecha = true;
    boton.classList.add("activo");
  };

  const detener = (e) => {
    e.preventDefault();
    if (dir === "arriba")    teclas.arriba = false;
    if (dir === "abajo")     teclas.abajo = false;
    if (dir === "izquierda") teclas.izquierda = false;
    if (dir === "derecha")   teclas.derecha = false;
    boton.classList.remove("activo");
  };

  boton.addEventListener("mousedown", iniciar);
  boton.addEventListener("mouseup", detener);
  boton.addEventListener("mouseleave", detener);
  boton.addEventListener("touchstart", iniciar, { passive: false });
  boton.addEventListener("touchend", detener, { passive: false });
  boton.addEventListener("touchcancel", detener, { passive: false });
});