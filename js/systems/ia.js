// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.9 · IA DE MOBS (tiempo real · 2D)
// ─────────────────────────────────────────────────────────────────
//  Los mobs se mueven en tiempo real con ticks.
//  Cada TICK_MS, los mobs del chunk del jugador procesan su IA.
//
//  Estados:
//    DEAMBULANDO  → al azar cada 2 ticks
//    PERSIGUIENDO → hacia el jugador (hostil)
//    HUYENDO      → lejos del jugador (pacífico)
//    QUIETO       → no se mueve (neutral o bloqueado)
// ═══════════════════════════════════════════════════════════════

let tickIntervalID = null;
let tickPausado = false;

function iniciarTicks() {
  if (tickIntervalID !== null) return;
  tickPausado = false;
  tickIntervalID = setInterval(tickMobs, TICK_MS);
  console.log("⏱ Ticks de IA iniciados (" + TICK_MS + "ms)");
}

function pausarTicks() {
  tickPausado = true;
}

function reanudarTicks() {
  tickPausado = false;
}

function detenerTicks() {
  if (tickIntervalID !== null) {
    clearInterval(tickIntervalID);
    tickIntervalID = null;
  }
}

// ═══ Tick principal ═══
function tickMobs() {
  if (tickPausado) return;
  if (estado.ganado) return;
  if (estado.pausado) return;
  if (!estado.jugador.inicializado) return;

  const infoJug = coordsMundoATile(Math.floor(estado.jugador.wx), Math.floor(estado.jugador.wy));
  const mobs = generarMobsDeChunk(infoJug.cx, infoJug.cy);

  let algunCambio = false;
  for (const mob of mobs) {
    if (procesarMob(mob)) algunCambio = true;
  }

  if (algunCambio) {
    forzarRedibujadoGrid();
    render();
  }
}

// ═══ Procesar un mob ═══
function procesarMob(mob) {
  const datos = MOBS[mob.tipo];
  if (!datos) return false;

  if (datos.movilidad.tipo === "fijo") {
    mob.estado = "QUIETO";
    return false;
  }

  const dist = distancia(mob, estado.jugador);
  const rangoDeteccion = datos.deteccion.distancia;

  let nuevoEstado;
  if (datos.actitud.base === "hostil") {
    nuevoEstado = (dist <= rangoDeteccion) ? "PERSIGUIENDO" : "DEAMBULANDO";
  } else if (datos.actitud.base === "pacifico") {
    nuevoEstado = (dist <= rangoDeteccion) ? "HUYENDO" : "DEAMBULANDO";
  } else {
    nuevoEstado = "QUIETO";
  }

  mob.estado = nuevoEstado;

  if (nuevoEstado === "PERSIGUIENDO") return moverHaciaJugador(mob);
  if (nuevoEstado === "HUYENDO")      return moverLejosDeJugador(mob);
  if (nuevoEstado === "DEAMBULANDO")  return deambular(mob);
  return false;
}

// ═══ Persecución ═══
function moverHaciaJugador(mob) {
  const jx = Math.floor(estado.jugador.wx);
  const jy = Math.floor(estado.jugador.wy);
  const dx = Math.sign(jx - mob.wx);
  const dy = Math.sign(jy - mob.wy);
  const difX = Math.abs(jx - mob.wx);
  const difY = Math.abs(jy - mob.wy);

  let pasoX = 0, pasoY = 0;
  if (difX >= difY) pasoX = dx;
  else              pasoY = dy;

  if (pasoX !== 0) {
    if (moverMob(mob, pasoX, 0)) return true;
    if (moverMob(mob, 0, dy))    return true;
  } else {
    if (moverMob(mob, 0, pasoY)) return true;
    if (moverMob(mob, dx, 0))    return true;
  }
  return false;
}

// ═══ Huida ═══
function moverLejosDeJugador(mob) {
  const jx = Math.floor(estado.jugador.wx);
  const jy = Math.floor(estado.jugador.wy);
  const dx = Math.sign(mob.wx - jx);
  const dy = Math.sign(mob.wy - jy);
  const difX = Math.abs(mob.wx - jx);
  const difY = Math.abs(mob.wy - jy);

  let pasoX = 0, pasoY = 0;
  if (difX >= difY) pasoX = dx;
  else              pasoY = dy;

  if (pasoX !== 0) {
    if (moverMob(mob, pasoX, 0)) return true;
    if (moverMob(mob, 0, dy))    return true;
  } else {
    if (moverMob(mob, 0, pasoY)) return true;
    if (moverMob(mob, dx, 0))    return true;
  }
  return false;
}

// ═══ Deambular ═══
function deambular(mob) {
  mob.tickContador = (mob.tickContador || 0) + 1;
  if (mob.tickContador < TICK_DEAMBULAR_CADA) return false;
  mob.tickContador = 0;

  const direcciones = [[1,0],[-1,0],[0,1],[0,-1]];

  for (let i = direcciones.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [direcciones[i], direcciones[j]] = [direcciones[j], direcciones[i]];
  }

  for (const [dx, dy] of direcciones) {
    if (moverMob(mob, dx, dy)) return true;
  }
  return false;
}

// ═══ Mover un mob ═══
function moverMob(mob, dx, dy) {
  const nx = mob.wx + dx;
  const ny = mob.wy + dy;

  // Tile del destino
  let tile;
  try {
    tile = tileEnMundo(nx, ny);
  } catch (e) {
    return false;
  }

  if (BLOQUEANTES.has(tile)) return false;

  // ¿El jugador está ahí? → batalla si corresponde
  const jx = Math.floor(estado.jugador.wx);
  const jy = Math.floor(estado.jugador.wy);
  if (nx === jx && ny === jy) {
    const datos = MOBS[mob.tipo];
    if (datos.colision.alChocar === "batalla") {
      pausarTicks();
      if (typeof iniciarBatalla === "function") iniciarBatalla(mob);
    }
    return false;
  }

  // ¿Ocupado por otro mob?
  const info = coordsMundoATile(nx, ny);
  const mobs = generarMobsDeChunk(info.cx, info.cy);
  if (mobs.some(o => o !== mob && o.wx === nx && o.wy === ny)) return false;

  // Orientación
  if (dx > 0) mob.mirandoIzquierda = true;
  if (dx < 0) mob.mirandoIzquierda = false;

  mob.wx = nx;
  mob.wy = ny;
  return true;
}

// ═══ Distancia Manhattan ═══
function distancia(a, b) {
  const ax = Math.floor(a.wx);
  const ay = Math.floor(a.wy);
  const bx = Math.floor(b.wx);
  const by = Math.floor(b.wy);
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

// ═══ Alejar mobs del jugador (al inicializar) ═══
function alejarMobsDelJugador() {
  if (!estado.jugador.inicializado) return;

  const infoJug = coordsMundoATile(Math.floor(estado.jugador.wx), Math.floor(estado.jugador.wy));
  const mobs = generarMobsDeChunk(infoJug.cx, infoJug.cy);
  if (!mobs || mobs.length === 0) return;

  const jx = Math.floor(estado.jugador.wx);
  const jy = Math.floor(estado.jugador.wy);
  const radio = RADIO_SEGURIDAD_SPAWN;
  const maxPasos = 10;

  for (const mob of mobs) {
    let pasos = 0;
    while (pasos < maxPasos) {
      const dx = mob.wx - jx;
      const dy = mob.wy - jy;
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist > radio) break;

      const intentos = generarDireccionesDeEscape(dx, dy);
      let movido = false;

      for (const [mx, my] of intentos) {
        const nx = mob.wx + mx;
        const ny = mob.wy + my;

        let tile;
        try { tile = tileEnMundo(nx, ny); } catch (e) { continue; }
        if (BLOQUEANTES.has(tile)) continue;
        if (nx === jx && ny === jy) continue;

        const ocupado = mobs.some(o => o !== mob && o.wx === nx && o.wy === ny);
        if (ocupado) continue;

        mob.wx = nx;
        mob.wy = ny;
        movido = true;
        break;
      }

      if (!movido) break;
      pasos++;
    }
  }
}

function generarDireccionesDeEscape(dx, dy) {
  const dirs = [
    [-1,-1], [ 0,-1], [ 1,-1],
    [-1, 0],          [ 1, 0],
    [-1, 1], [ 0, 1], [ 1, 1],
  ];
  const signoX = Math.sign(dx) || 0;
  const signoY = Math.sign(dy) || 0;
  return dirs.sort((a, b) => {
    const distA = Math.abs(a[0] - signoX) + Math.abs(a[1] - signoY);
    const distB = Math.abs(b[0] - signoX) + Math.abs(b[1] - signoY);
    return distA - distB;
  });
}