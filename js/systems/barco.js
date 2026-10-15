// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.11 · SISTEMA DE BARCO
// ─────────────────────────────────────────────────────────────────
//  Permite al jugador subirse a un barco para atravesar agua.
//
//  Reglas:
//    - Solo si tiene BARCO en el inventario.
//    - Solo si hace click sobre un tile de agua adyacente.
//    - Barra de 5 segundos (como rotura).
//    - Al terminar: el jugador se sube al barco (emoji 🚣).
//    - Al pisar tierra: se baja automáticamente.
// ═══════════════════════════════════════════════════════════════

const barco = {
  activo: false,
  colocando: false,
  zona: null,
  x: null,
  y: null,
  tiempoInicio: 0,
  duracionMs: 5000,
  intervalID: null,
};

const DURACION_COLOCAR_BARCO_MS = 5000;

// ─── ¿El jugador tiene el barco? ───
function tieneBarcoEquipado() {
  return (estado.inventario.BARCO || 0) > 0;
}

// ─── ¿El jugador está en un barco (navegando)? ───
function estaNavegando() {
  return barco.activo;
}

// ─── Intentar colocar el barco ───
function intentarColocarBarco(x, y) {
  // 1. ¿El tile es agua?
  const tile = estado.pantalla.mapa[y][x];
  if (tile !== WATER) return false;   // No es agua, no es tarea del barco

  // 2. ¿El jugador está adyacente?
  const dx = Math.abs(estado.jugador.x - x);
  const dy = Math.abs(estado.jugador.y - y);
  if (dx + dy !== 1) return false;    // No adyacente, no hacer nada

  // 3. ¿Ya está navegando?
  if (barco.activo) return false;

  // 4. ¿Tiene barco?
  if (!tieneBarcoEquipado()) {
    mostrarCartelRapido("Necesitás un 🛶");
    return true;   // Consumimos el click (para no iniciar rotura)
  }

  // 5. Iniciar colocación
  barco.colocando = true;
  barco.zona = estado.zona;
  barco.x = x;
  barco.y = y;
  barco.tiempoInicio = Date.now();

  const barra = document.getElementById("barra-stamina");
  barra.classList.add("visible");

  barco.intervalID = setInterval(actualizarColocacionBarco, INTERVALO_ROTURA_MS);

  return true;
}

// ─── Loop de colocación ───
function actualizarColocacionBarco() {
  if (!barco.colocando) return;

  // ¿El jugador se movió? Cancelar
  const dx = Math.abs(estado.jugador.x - barco.x);
  const dy = Math.abs(estado.jugador.y - barco.y);
  if (dx + dy !== 1) {
    cancelarColocacionBarco();
    return;
  }

  // ¿Cambió de zona? Cancelar
  if (estado.zona !== barco.zona) {
    cancelarColocacionBarco();
    return;
  }

  // Actualizar barra
  const transcurrido = Date.now() - barco.tiempoInicio;
  const progreso = Math.max(0, 1 - (transcurrido / barco.duracionMs));
  const relleno = document.getElementById("barra-stamina-relleno");
  relleno.style.width = (progreso * 100) + "%";

  if (transcurrido >= barco.duracionMs) {
    finalizarColocacionBarco();
  }
}

// ─── Finalizar colocación ───
function finalizarColocacionBarco() {
  if (!barco.colocando) return;

  // Subir al barco
  barco.activo = true;
  barco.colocando = false;

  // Mover al jugador al tile del agua
  estado.jugador.x = barco.x;
  estado.jugador.y = barco.y;

  // Ocultar barra
  document.getElementById("barra-stamina").classList.remove("visible");
  document.getElementById("barra-stamina-relleno").style.width = "100%";

  if (barco.intervalID !== null) {
    clearInterval(barco.intervalID);
    barco.intervalID = null;
  }

  render();
}

// ─── Cancelar colocación ───
function cancelarColocacionBarco() {
  barco.colocando = false;

  if (barco.intervalID !== null) {
    clearInterval(barco.intervalID);
    barco.intervalID = null;
  }

  document.getElementById("barra-stamina").classList.remove("visible");
  document.getElementById("barra-stamina-relleno").style.width = "100%";
}

// ─── ¿El jugador puede moverse a esta celda (con barco)? ───
function puedeMoverseConBarco(tile) {
  // Si está navegando, solo puede moverse sobre agua
  if (barco.activo) {
    return tile === WATER;
  }
  return null; // No aplica
}

// ─── Verificar si debe bajarse del barco ───
function verificarBajarseDelBarco() {
  if (!barco.activo) return;

  const tile = estado.pantalla.mapa[estado.jugador.y][estado.jugador.x];
  if (tile !== WATER) {
    barco.activo = false;
    mostrarCartelRapido("🚣 Bajaste del barco");
  }
}

// ═══════════════════════════════════════════════════════════════
//  DESEMBARCO · Bajar del barco a tierra adyacente
// ─────────────────────────────────────────────────────────────────
//  Mientras el jugador navega, puede hacer click sostenido sobre
//  una celda de tierra adyacente. Tras 2 segundos, se baja del
//  barco y aparece en esa celda.
// ═══════════════════════════════════════════════════════════════

const desembarco = {
  activo: false,
  x: null,
  y: null,
  tiempoInicio: 0,
  duracionMs: 2000,
  intervalID: null,
};

// ─── ¿El jugador puede desembarcar en esta celda? ───
function puedeDesembarcarEn(x, y) {
  // 1. Debe estar navegando
  if (!barco.activo) return false;

  // 2. La celda debe ser tierra (no agua)
  const tile = estado.pantalla.mapa[y][x];
  if (tile === WATER) return false;

  // 3. No debe ser bloqueante
  if (BLOQUEANTES.has(tile)) return false;

  // 4. Debe estar adyacente al jugador
  const dx = Math.abs(estado.jugador.x - x);
  const dy = Math.abs(estado.jugador.y - y);
  if (dx + dy !== 1) return false;

  // 5. No debe haber mob
  const mob = obtenerMobEn(estado.zona, x, y);
  if (mob) return false;

  return true;
}

// ─── Iniciar desembarco ───
function iniciarDesembarco(x, y) {
  if (!puedeDesembarcarEn(x, y)) return false;

  desembarco.activo = true;
  desembarco.x = x;
  desembarco.y = y;
  desembarco.tiempoInicio = Date.now();

  // Mostrar barra
  const barra = document.getElementById("barra-stamina");
  barra.classList.add("visible");

  desembarco.intervalID = setInterval(actualizarDesembarco, INTERVALO_ROTURA_MS);

  return true;
}

// ─── Actualizar desembarco ───
function actualizarDesembarco() {
  if (!desembarco.activo) return;

  // ¿El jugador se movió? Cancelar
  const dx = Math.abs(estado.jugador.x - desembarco.x);
  const dy = Math.abs(estado.jugador.y - desembarco.y);
  if (dx + dy !== 1) {
    cancelarDesembarco();
    return;
  }

  // Actualizar barra
  const transcurrido = Date.now() - desembarco.tiempoInicio;
  const progreso = Math.max(0, 1 - (transcurrido / desembarco.duracionMs));
  const relleno = document.getElementById("barra-stamina-relleno");
  relleno.style.width = (progreso * 100) + "%";

  if (transcurrido >= desembarco.duracionMs) {
    finalizarDesembarco();
  }
}

// ─── Finalizar desembarco ───
function finalizarDesembarco() {
  if (!desembarco.activo) return;

  // Mover al jugador a tierra
  estado.jugador.x = desembarco.x;
  estado.jugador.y = desembarco.y;

  // Bajar del barco
  barco.activo = false;

  // Limpiar
  desembarco.activo = false;

  if (desembarco.intervalID !== null) {
    clearInterval(desembarco.intervalID);
    desembarco.intervalID = null;
  }

  // Ocultar barra
  document.getElementById("barra-stamina").classList.remove("visible");
  document.getElementById("barra-stamina-relleno").style.width = "100%";

  if (typeof mostrarCartelRapido === "function") {
    mostrarCartelRapido("🏃 Bajaste del barco");
  }

  render();
}

// ─── Cancelar desembarco ───
function cancelarDesembarco() {
  desembarco.activo = false;

  if (desembarco.intervalID !== null) {
    clearInterval(desembarco.intervalID);
    desembarco.intervalID = null;
  }

  document.getElementById("barra-stamina").classList.remove("visible");
  document.getElementById("barra-stamina-relleno").style.width = "100%";
}

// ═══════════════════════════════════════════════════════════════
//  FORZAR BAJADA DEL BARCO (por cambio de zona)
// ─────────────────────────────────────────────────────────────────
//  Cuando el jugador cruza de zona navegando, pero el tile de
//  destino no es agua, se baja del barco automáticamente.
// ═══════════════════════════════════════════════════════════════
function finalizarNavegacionForzada() {
  if (!barco.activo) return;
  barco.activo = false;
}