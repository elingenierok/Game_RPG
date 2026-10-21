// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.11 · SISTEMA DE BARCO (chunks 2D)
// ─────────────────────────────────────────────────────────────────
//  El click se convierte a coordenadas del mundo (wx, wy).
// ═══════════════════════════════════════════════════════════════

const barco = {
  activo: false,
  colocando: false,
  wx: null,
  wy: null,
  tiempoInicio: 0,
  duracionMs: 5000,
  intervalID: null,
};

const DURACION_COLOCAR_BARCO_MS = 5000;

function tieneBarcoEquipado() {
  if (typeof Equipamiento !== "undefined") return Equipamiento.tieneAccion("BARCO");
  return (estado.inventario.BARCO || 0) > 0;
}

function estaNavegando() {
  return barco.activo;
}

// ─── Intentar colocar el barco ───
function intentarColocarBarco(wx, wy) {
  const tile = tileEnMundo(wx, wy);
  if (tile !== WATER) return false;

  if (!jugadorAdyacenteA(wx, wy)) return false;
  if (barco.activo) return false;

  if (!tieneBarcoEquipado()) {
    mostrarCartelRapido("Necesitás un 🛶");
    return true;
  }

  barco.colocando = true;
  barco.wx = wx;
  barco.wy = wy;
  barco.tiempoInicio = Date.now();

  const barra = document.getElementById("barra-stamina");
  barra.classList.add("visible");

  barco.intervalID = setInterval(actualizarColocacionBarco, INTERVALO_ROTURA_MS);
  return true;
}

function actualizarColocacionBarco() {
  if (!barco.colocando) return;

  if (!jugadorAdyacenteA(barco.wx, barco.wy)) {
    cancelarColocacionBarco();
    return;
  }

  const transcurrido = Date.now() - barco.tiempoInicio;
  const progreso = Math.max(0, 1 - (transcurrido / barco.duracionMs));
  const relleno = document.getElementById("barra-stamina-relleno");
  relleno.style.width = (progreso * 100) + "%";

  if (transcurrido >= barco.duracionMs) {
    finalizarColocacionBarco();
  }
}

function finalizarColocacionBarco() {
  if (!barco.colocando) return;

  barco.activo = true;
  estado.jugador.enBarco = true;
  barco.colocando = false;

  // Mover al jugador al tile del agua
  estado.jugador.wx = barco.wx;
  estado.jugador.wy = barco.wy;
  estado.jugador.animando = false;

  document.getElementById("barra-stamina").classList.remove("visible");
  document.getElementById("barra-stamina-relleno").style.width = "100%";

  if (barco.intervalID !== null) {
    clearInterval(barco.intervalID);
    barco.intervalID = null;
  }

  render();
}

function cancelarColocacionBarco() {
  barco.colocando = false;

  if (barco.intervalID !== null) {
    clearInterval(barco.intervalID);
    barco.intervalID = null;
  }

  document.getElementById("barra-stamina").classList.remove("visible");
  document.getElementById("barra-stamina-relleno").style.width = "100%";
}

// ─── ¿Puede moverse con barco a esta celda? ───
function puedeMoverseConBarco(tile) {
  if (barco.activo) return tile === WATER;
  return null;
}

// ─── ¿Debe bajarse del barco? ───
function verificarBajarseDelBarco() {
  if (!barco.activo) return;

  const wx = Math.floor(estado.jugador.wx);
  const wy = Math.floor(estado.jugador.wy);
  const tile = tileEnMundo(wx, wy);
  if (tile !== WATER) {
    barco.activo = false;
    estado.jugador.enBarco = false;
    mostrarCartelRapido("🚣 Bajaste del barco");
  }
}

// ═══════════════════════════════════════════════════════════════
//  DESEMBARCO
// ═══════════════════════════════════════════════════════════════
const desembarco = {
  activo: false,
  wx: null,
  wy: null,
  tiempoInicio: 0,
  duracionMs: 2000,
  intervalID: null,
};

function puedeDesembarcarEn(wx, wy) {
  if (!barco.activo) return false;

  const tile = tileEnMundo(wx, wy);
  if (tile === WATER) return false;
  if (BLOQUEANTES.has(tile)) return false;
  if (!jugadorAdyacenteA(wx, wy)) return false;

  // ¿Hay un mob?
  const mob = obtenerMobEn(wx, wy);
  if (mob) return false;

  return true;
}

function iniciarDesembarco(wx, wy) {
  if (!puedeDesembarcarEn(wx, wy)) return false;

  desembarco.activo = true;
  desembarco.wx = wx;
  desembarco.wy = wy;
  desembarco.tiempoInicio = Date.now();

  const barra = document.getElementById("barra-stamina");
  barra.classList.add("visible");

  desembarco.intervalID = setInterval(actualizarDesembarco, INTERVALO_ROTURA_MS);
  return true;
}

function actualizarDesembarco() {
  if (!desembarco.activo) return;

  if (!jugadorAdyacenteA(desembarco.wx, desembarco.wy)) {
    cancelarDesembarco();
    return;
  }

  const transcurrido = Date.now() - desembarco.tiempoInicio;
  const progreso = Math.max(0, 1 - (transcurrido / desembarco.duracionMs));
  const relleno = document.getElementById("barra-stamina-relleno");
  relleno.style.width = (progreso * 100) + "%";

  if (transcurrido >= desembarco.duracionMs) {
    finalizarDesembarco();
  }
}

function finalizarDesembarco() {
  if (!desembarco.activo) return;

  estado.jugador.wx = desembarco.wx;
  estado.jugador.wy = desembarco.wy;
  estado.jugador.animando = false;

  barco.activo = false;
  estado.jugador.enBarco = false;
  desembarco.activo = false;

  if (desembarco.intervalID !== null) {
    clearInterval(desembarco.intervalID);
    desembarco.intervalID = null;
  }

  document.getElementById("barra-stamina").classList.remove("visible");
  document.getElementById("barra-stamina-relleno").style.width = "100%";

  if (typeof mostrarCartelRapido === "function") {
    mostrarCartelRapido("🏃 Bajaste del barco");
  }

  render();
}

function cancelarDesembarco() {
  desembarco.activo = false;

  if (desembarco.intervalID !== null) {
    clearInterval(desembarco.intervalID);
    desembarco.intervalID = null;
  }

  document.getElementById("barra-stamina").classList.remove("visible");
  document.getElementById("barra-stamina-relleno").style.width = "100%";
}

// ─── Compatibilidad (ya no aplica cambio de zona) ───
function finalizarNavegacionForzada() {
  if (!barco.activo) return;
  barco.activo = false;
}