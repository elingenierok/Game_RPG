// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.9 · IA DE MOBS (tiempo real)
// ─────────────────────────────────────────────────────────────────
//  Los mobs se mueven en tiempo real con un sistema de "ticks".
//  Cada TICK_MS milisegundos, todos los mobs de la zona actual
//  procesan su comportamiento.
//
//  Estados posibles de un mob:
//    DEAMBULANDO  → se mueve al azar cada 2 ticks
//    PERSIGUIENDO → se mueve hacia el jugador cada tick (hostil)
//    HUYENDO      → se mueve lejos del jugador cada tick (pacífico)
//    QUIETO       → no se mueve (neutral o bloqueado)
//
//  ⏸️ Pendiente futuro (F6): pathfinding con obstáculos (A*)
// ═══════════════════════════════════════════════════════════════

let tickIntervalID = null;
let tickPausado = false;

// ─── Inicia el loop de ticks ───
function iniciarTicks() {
  if (tickIntervalID !== null) return;    // ya está andando
  tickPausado = false;
  tickIntervalID = setInterval(tickMobs, TICK_MS);
  console.log("⏱ Ticks de IA iniciados (cada", TICK_MS, "ms)");
}

// ─── Pausa los ticks (durante overlays) ───
function pausarTicks() {
  tickPausado = true;
}

// ─── Reanuda los ticks ───
function reanudarTicks() {
  tickPausado = false;
}

// ─── Detiene el loop (al reiniciar mundo) ───
function detenerTicks() {
  if (tickIntervalID !== null) {
    clearInterval(tickIntervalID);
    tickIntervalID = null;
  }
}

// ═══════════════════════════════════════════════════════════════
//  TICK PRINCIPAL · procesa todos los mobs de la zona actual
// ═══════════════════════════════════════════════════════════════
function tickMobs() {
  if (tickPausado) return;
  if (estado.ganado) return;
  if (!estado.pantalla) return;

  const mobs = obtenerMobsDeChunk(estado.zona);
  let algunCambio = false;

  for (const mob of mobs) {
    const movido = procesarMob(mob);
    if (movido) algunCambio = true;
  }

  // Solo renderizamos si algo se movió
  if (algunCambio) {
    render();
  }
}

// ═══════════════════════════════════════════════════════════════
//  PROCESAR UN MOB · decide y ejecuta su movimiento
// ═══════════════════════════════════════════════════════════════
function procesarMob(mob) {
  const datos = MOBS[mob.tipo];
  if (!datos) return false;

  // ─── Mob fijo (neutral quieto) ───
  if (datos.movilidad.tipo === "fijo") {
    mob.estado = "QUIETO";
    return false;
  }

  // ─── Calcular distancia al jugador ───
  const dist = distancia(mob, estado.jugador);
  const rangoDeteccion = datos.deteccion.distancia;

  // ─── Determinar estado según actitud y distancia ───
  let nuevoEstado;
  if (datos.actitud.base === "hostil") {
    nuevoEstado = (dist <= rangoDeteccion) ? "PERSIGUIENDO" : "DEAMBULANDO";
  } else if (datos.actitud.base === "pacifico") {
    nuevoEstado = (dist <= rangoDeteccion) ? "HUYENDO" : "DEAMBULANDO";
  } else {
    nuevoEstado = "QUIETO";
  }

  mob.estado = nuevoEstado;

  // ─── Comportamiento según estado ───
  if (nuevoEstado === "PERSIGUIENDO") {
    return moverHaciaJugador(mob);
  } else if (nuevoEstado === "HUYENDO") {
    return moverLejosDeJugador(mob);
  } else if (nuevoEstado === "DEAMBULANDO") {
    return deambular(mob);
  }

  return false;
}

// ═══════════════════════════════════════════════════════════════
//  COMPORTAMIENTOS
// ═══════════════════════════════════════════════════════════════

// ─── Persecución: 1 paso hacia el jugador ───
function moverHaciaJugador(mob) {
  const dx = Math.sign(estado.jugador.x - mob.x);
  const dy = Math.sign(estado.jugador.y - mob.y);

  // Preferimos el eje con mayor diferencia (movimiento más recto)
  const difX = Math.abs(estado.jugador.x - mob.x);
  const difY = Math.abs(estado.jugador.y - mob.y);

  let pasoX = 0, pasoY = 0;
  if (difX >= difY) {
    pasoX = dx;
  } else {
    pasoY = dy;
  }

  // Si no puede moverse en el eje principal, intenta el otro
  if (pasoX !== 0) {
    if (moverMob(mob, pasoX, 0)) return true;
    if (moverMob(mob, 0, dy))    return true;
  } else {
    if (moverMob(mob, 0, pasoY)) return true;
    if (moverMob(mob, dx, 0))    return true;
  }
  return false;   // bloqueado: se queda quieto este tick
}

// ─── Huida: 1 paso en dirección opuesta al jugador ───
function moverLejosDeJugador(mob) {
  const dx = Math.sign(mob.x - estado.jugador.x);
  const dy = Math.sign(mob.y - estado.jugador.y);

  const difX = Math.abs(mob.x - estado.jugador.x);
  const difY = Math.abs(mob.y - estado.jugador.y);

  let pasoX = 0, pasoY = 0;
  if (difX >= difY) {
    pasoX = dx;
  } else {
    pasoY = dy;
  }

  if (pasoX !== 0) {
    if (moverMob(mob, pasoX, 0)) return true;
    if (moverMob(mob, 0, dy))    return true;
  } else {
    if (moverMob(mob, 0, pasoY)) return true;
    if (moverMob(mob, dx, 0))    return true;
  }
  return false;
}

// ─── Deambulación: 1 paso al azar cada N ticks ───
function deambular(mob) {
  // Solo intenta moverse cada TICK_DEAMBULAR_CADA ticks
  mob.tickContador = (mob.tickContador || 0) + 1;
  if (mob.tickContador < TICK_DEAMBULAR_CADA) return false;
  mob.tickContador = 0;

  // Elegir dirección al azar entre las 4
  const direcciones = [
    [ 1, 0],
    [-1, 0],
    [ 0, 1],
    [ 0,-1],
  ];

  // Barajar para no repetir siempre la misma
  for (let i = direcciones.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [direcciones[i], direcciones[j]] = [direcciones[j], direcciones[i]];
  }

  // Intentar cada dirección hasta encontrar una válida
  for (const [dx, dy] of direcciones) {
    if (moverMob(mob, dx, dy)) return true;
  }
  return false;
}

// ═══════════════════════════════════════════════════════════════
//  MOVER UN MOB · aplica colisiones
// ═══════════════════════════════════════════════════════════════
function moverMob(mob, dx, dy) {
  const nx = mob.x + dx;
  const ny = mob.y + dy;

  // ─── Barrera de chunk (invisible) ───
  if (nx < 0 || nx >= ANCHO_PANTALLA) return false;
  if (ny < 0 || ny >= ALTO_PANTALLA)  return false;

  // ─── Tile bloqueante del terreno ───
  const tile = estado.pantalla.mapa[ny][nx];
  if (BLOQUEANTES.has(tile)) return false;

  // ─── ¿Ocupado por el jugador? ───
  if (nx === estado.jugador.x && ny === estado.jugador.y) {
    // El mob no puede pisar al jugador, pero el choque lo maneja
    // el movimiento del jugador (cuando él se mueve hacia el mob).
    return false;
  }

    // ─── ¿Ocupado por otro mob? ───
  const mobs = obtenerMobsDeChunk(estado.zona);
  for (const otro of mobs) {
    if (otro === mob) continue;
    if (otro.x === nx && otro.y === ny) return false;
  }

  // ─── ¿Hay un ítem en la celda destino? ───
  const items = obtenerItemsDeChunk(estado.zona);
  const claveItem = estado.zona + ":" + nx + "," + ny;
  if (items.some(it => it.x === nx && it.y === ny) &&
      !estado.itemsRecogidos.has(claveItem)) {
    return false;
  }

  // ─── Movimiento válido ───
  if (dx > 0) mob.mirandoIzquierda = true;
  if (dx < 0) mob.mirandoIzquierda = false;

  mob.x = nx;
  mob.y = ny;
  return true;
}

// ═══════════════════════════════════════════════════════════════
//  UTILIDADES
// ═══════════════════════════════════════════════════════════════
function distancia(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}