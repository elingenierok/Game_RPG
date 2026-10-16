// ═══════════════════════════════════════════════════════════════
//  BLOQUE 12 · MOVIMIENTO DEL JUGADOR (360°)
// ─────────────────────────────────────────────────────────────────
//  El jugador se mueve en coordenadas del mundo (wx, wy).
//  Cada movimiento dura DURACION_MOVIMIENTO_MS.
//  La cámara lo sigue con la misma duración.
// ═══════════════════════════════════════════════════════════════

// ─── Colisiones ───
function tileEnMundo(wx, wy) {
  const info = coordsMundoATile(wx, wy);
  const chunk = obtenerChunk(info.cx, info.cy);
  return chunk.mapa[info.ly][info.lx];
}

function celdaBloqueante(wx, wy) {
  return BLOQUEANTES.has(tileEnMundo(wx, wy));
}

// ─── Iniciar movimiento hacia una dirección ───
function intentarMover(dx, dy) {
  if (estado.ganado) return;
  if (estado.jugador.animando) return;

  const actualX = estado.jugador.wx;
  const actualY = estado.jugador.wy;

  const destinoX = actualX + dx;
  const destinoY = actualY + dy;

  // ¿Celda destino bloqueante?
  if (celdaBloqueante(destinoX, destinoY)) return;

  // Iniciar animación
  estado.jugador.animando = true;
  estado.jugador.animInicioX = estado.jugador.wx;
  estado.jugador.animInicioY = estado.jugador.wy;
  estado.jugador.animFinX = destinoX;
  estado.jugador.animFinY = destinoY;
  estado.jugador.animInicio = performance.now();

  // Actualizar orientación
  if (dx > 0) estado.jugador.mirandoIzquierda = true;
  if (dx < 0) estado.jugador.mirandoIzquierda = false;
}

// ─── Efectos al terminar de moverse (pisar celda) ───
function alPisarCelda(wx, wy) {
  // ─── ¿Es la llave? ───
  if (estado.llave.wx === wx && estado.llave.wy === wy) {
    if (typeof ganar === "function") ganar();
    return;
  }

  // ─── ¿Es una manzana? ───
  const item = recogerItemEn(wx, wy);
  if (item) {
    const nombre = tipoItemANombre(item.tipo);
    const icono = ICONOS[MANZANA] || "🍎";
    if (typeof mostrarCartelRapido === "function") {
      mostrarCartelRapido(`${icono} +1 ${nombre}`);
    }
    console.log("🍎 Recogiste:", nombre);
  }

  // ─── ¿Es un equipable? ───
  const equipable = recogerEquipableEn(wx, wy);
  if (equipable) {
    const nombre = tipoEquipableANombre(equipable.tipo);
    let icono = "🎒";
    if (nombre === "HACHA")    icono = "🪓";
    if (nombre === "PICO")     icono = "⛏️";
    if (nombre === "LINTERNA") icono = "🕯️";
    if (nombre === "BARCO")    icono = "🛶";
    if (typeof mostrarCartelRapido === "function") {
      mostrarCartelRapido(`${icono} ¡${nombre} conseguido!`);
    }
    console.log("🎒 Recogiste:", nombre);
  }

  if (typeof actualizarHUD === "function") actualizarHUD();
}

// ─── Actualizar animación del jugador ───
function actualizarJugador() {
  if (!estado.jugador.animando) return;

  const t = Math.min(1, (performance.now() - estado.jugador.animInicio) / DURACION_MOVIMIENTO_MS);

  // Interpolar la posición del jugador
  estado.jugador.wx = estado.jugador.animInicioX + (estado.jugador.animFinX - estado.jugador.animInicioX) * t;
  estado.jugador.wy = estado.jugador.animInicioY + (estado.jugador.animFinY - estado.jugador.animInicioY) * t;

  if (t >= 1) {
    estado.jugador.wx = estado.jugador.animFinX;
    estado.jugador.wy = estado.jugador.animFinY;
    estado.jugador.animando = false;

    // Efectos al terminar de moverse
    alPisarCelda(Math.floor(estado.jugador.wx), Math.floor(estado.jugador.wy));
  }
}

// ─── Compatibilidad con victoria y otras funciones ───
function cambiarZona(delta) {
  // Ya no aplica con cámara fluida. Se mantiene por compatibilidad.
}