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

  // ─── ¿Está navegando? ───
  const tileDestino = tileEnMundo(destinoX, destinoY);
  if (typeof estaNavegando === "function" && estaNavegando()) {
    // Con barco: solo puede moverse sobre agua
    if (tileDestino !== WATER) return;
  } else {
    // Sin barco: colisiones normales
    if (BLOQUEANTES.has(tileDestino)) return;
  }
    // ─── ¿Hay un mob en la celda destino? ───
  if (typeof estaNavegando !== "function" || !estaNavegando()) {
    const mob = obtenerMobEn(destinoX, destinoY);
    if (mob) {
      const datos = MOBS[mob.tipo];
      if (datos.colision.alChocar === "batalla") {
        if (typeof pausarTicks === "function") pausarTicks();
        if (typeof iniciarBatalla === "function") iniciarBatalla(mob);
      }
      return;   // En cualquier caso, no puede pasar
    }
  }

  // Iniciar animación
  estado.jugador.animando = true;
  estado.jugador.animInicioX = estado.jugador.wx;
  estado.jugador.animInicioY = estado.jugador.wy;
  estado.jugador.animFinX = destinoX;
  estado.jugador.animFinY = destinoY;
  estado.jugador.animInicio = performance.now();

  // Actualizar orientación
  if (dx > 0) estado.jugador.mirandoIzquierda = true;  // va a la derecha
  if (dx < 0) estado.jugador.mirandoIzquierda = false;   // va a la izquierda
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
if (nombre === "HACHA")    icono = ICONOS[HACHA];
if (nombre === "PICO")     icono = ICONOS[PICO];
if (nombre === "LINTERNA") icono = ICONOS[LINTERNA];
if (nombre === "BARCO")    icono = ICONOS[BARCO];
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