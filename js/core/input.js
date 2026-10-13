// ═══════════════════════════════════════════════════════════════
//  BLOQUE 14 · INPUT
// ─────────────────────────────────────────────────────────────────
//  Soporta 3 formas de mover al jugador:
//  1. Teclas WASD
//  2. Flechas del teclado
//  3. Botones en pantalla (click sostenido)
// ═══════════════════════════════════════════════════════════════

// ─── Teclado ───
document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "w" || k === "arrowup")    intentarMover(0, -1);
  if (k === "s" || k === "arrowdown")  intentarMover(0, +1);
  if (k === "a" || k === "arrowleft")  intentarMover(-1, 0);
  if (k === "d" || k === "arrowright") intentarMover(+1, 0);
});

// ═══════════════════════════════════════════════════════════════
//  BOTONES DE MOVIMIENTO (click sostenido)
// ─────────────────────────────────────────────────────────────────
//  Cada botón corresponde a una dirección.
//  Mientras se mantiene apretado, el jugador se mueve repetidamente.
//  Al soltar, se detiene.
// ═══════════════════════════════════════════════════════════════

const INTERVALO_MOVIMIENTO = 200;  // ms entre cada movimiento

// Estado de cada botón
const botonesEstado = {
  arriba:    { activo: false, intervaloID: null, dx: 0,  dy: -1 },
  abajo:     { activo: false, intervaloID: null, dx: 0,  dy: +1 },
  izquierda: { activo: false, intervaloID: null, dx: -1, dy: 0  },
  derecha:   { activo: false, intervaloID: null, dx: +1, dy: 0  },
};

// ─── Iniciar movimiento continuo ───
function iniciarMovimiento(direccion, boton) {
  const estadoBoton = botonesEstado[direccion];
  if (!estadoBoton) return;
  if (estadoBoton.activo) return;   // ya está activo

  estadoBoton.activo = true;
  boton.classList.add("activo");

  // Primer movimiento inmediato
  intentarMover(estadoBoton.dx, estadoBoton.dy);

  // Después, mover cada INTERVALO_MOVIMIENTO ms
  estadoBoton.intervaloID = setInterval(() => {
    intentarMover(estadoBoton.dx, estadoBoton.dy);
  }, INTERVALO_MOVIMIENTO);
}

// ─── Detener movimiento continuo ───
function detenerMovimiento(direccion, boton) {
  const estadoBoton = botonesEstado[direccion];
  if (!estadoBoton) return;

  estadoBoton.activo = false;
  boton.classList.remove("activo");

  if (estadoBoton.intervaloID !== null) {
    clearInterval(estadoBoton.intervaloID);
    estadoBoton.intervaloID = null;
  }
}

// ─── Detener TODOS los botones (por si se sueltan varios a la vez) ───
function detenerTodosLosBotones() {
  document.querySelectorAll(".btn-mover").forEach((boton) => {
    const dir = boton.dataset.dir;
    detenerMovimiento(dir, boton);
  });
}

// ─── Conectar los botones ───
document.querySelectorAll(".btn-mover").forEach((boton) => {
  const direccion = boton.dataset.dir;

  // Mouse: presionar
  boton.addEventListener("mousedown", (e) => {
    e.preventDefault();
    iniciarMovimiento(direccion, boton);
  });

  // Mouse: soltar
  boton.addEventListener("mouseup", () => {
    detenerMovimiento(direccion, boton);
  });

  // Mouse: salir del botón mientras se mantiene
  boton.addEventListener("mouseleave", () => {
    detenerMovimiento(direccion, boton);
  });

  // Touch: presionar
  boton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    iniciarMovimiento(direccion, boton);
  }, { passive: false });

  // Touch: soltar
  boton.addEventListener("touchend", (e) => {
    e.preventDefault();
    detenerMovimiento(direccion, boton);
  }, { passive: false });

  // Touch: cancelar
  boton.addEventListener("touchcancel", () => {
    detenerMovimiento(direccion, boton);
  });
});

// ─── Si el mouse sale de la ventana mientras aprieta, detener todo ───
document.addEventListener("mouseup", detenerTodosLosBotones);
document.addEventListener("mouseleave", detenerTodosLosBotones);