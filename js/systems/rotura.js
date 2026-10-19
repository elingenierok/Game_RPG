// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.10 · SISTEMA DE ROTURA (chunks 2D)
// ─────────────────────────────────────────────────────────────────
//  El click se convierte a coordenadas del mundo (wx, wy).
//  Mientras se rompe, la celda vibra en bucle hasta que la barra
//  llega a cero. Al terminar, el efecto se quita y el tile cambia.
// ═══════════════════════════════════════════════════════════════

const rotura = {
  activa: false,
  wx: null,
  wy: null,
  tileOriginal: null,
  tileBase: null,
  tiempoInicio: 0,
  duracionMs: 0,
  intervalID: null,
};

// ═══════════════════════════════════════════════════════════════
//  CONVERSIÓN CLICK → COORDENADAS DEL MUNDO
// ═══════════════════════════════════════════════════════════════
function coordenadasClickAMundo(evento) {
  const pantalla = document.getElementById("pantalla");
  const rect = pantalla.getBoundingClientRect();

  const px = evento.clientX - rect.left;
  const py = evento.clientY - rect.top;

  if (px < 0 || py < 0) return null;
  if (px >= ANCHO_VENTANA * TAMANO_CELDA) return null;
  if (py >= ALTO_VENTANA * TAMANO_CELDA) return null;

  const celdaVX = Math.floor(px / TAMANO_CELDA);
  const celdaVY = Math.floor(py / TAMANO_CELDA);

  const centroX = Math.floor(ANCHO_VENTANA / 2);
  const centroY = Math.floor(ALTO_VENTANA / 2);

  const esquinaX = Math.floor(camara.x - centroX);
  const esquinaY = Math.floor(camara.y - centroY);

  return {
    wx: esquinaX + celdaVX,
    wy: esquinaY + celdaVY,
  };
}

function jugadorAdyacenteA(wx, wy) {
  const jx = Math.floor(estado.jugador.wx);
  const jy = Math.floor(estado.jugador.wy);
  const dx = Math.abs(jx - wx);
  const dy = Math.abs(jy - wy);
  return (dx + dy) === 1;
}

function tieneObjetoEquipado(nombre) {
  return (estado.inventario[nombre] || 0) > 0;
}

// ═══════════════════════════════════════════════════════════════
//  INICIAR ROTURA
// ═══════════════════════════════════════════════════════════════
function intentarIniciarRotura(wx, wy) {
  const tile = tileEnMundo(wx, wy);
  const config = ROTURA_POR_TILE[tile];
  if (!config) return false;

  if (!jugadorAdyacenteA(wx, wy)) return false;

  if (!tieneObjetoEquipado(config.objeto)) {
    const nombreObjeto = config.objeto === "HACHA" ? "hacha" : "pico";
    mostrarCartelRapido(`Necesitás un ${nombreObjeto}`);
    return false;
  }

  rotura.activa = true;
  rotura.wx = wx;
  rotura.wy = wy;
  rotura.tileOriginal = tile;

  const bioma = obtenerBiomaDeCelda(SEMILLA, wx, wy);
  rotura.tileBase = NOMBRE_A_TILE[BIOMAS[bioma].tileBase];

  rotura.tiempoInicio = Date.now();
  rotura.duracionMs = config.duracionMs;

  // ─── Efecto visual de golpe en bucle (permanente hasta quitar) ───
  if (typeof aplicarEfecto === "function") {
    aplicarEfecto(wx, wy, "efecto-golpe-loop");
  }

  const barra = document.getElementById("barra-stamina");
  barra.classList.add("visible");
  document.getElementById("barra-stamina-relleno").style.width = "100%";

  rotura.intervalID = setInterval(actualizarRotura, INTERVALO_ROTURA_MS);
  return true;
}

// ═══════════════════════════════════════════════════════════════
//  ACTUALIZAR ROTURA
// ═══════════════════════════════════════════════════════════════
function actualizarRotura() {
  if (!rotura.activa) return;

  // Cancelaciones
  if (!jugadorAdyacenteA(rotura.wx, rotura.wy)) {
    cancelarRotura();
    return;
  }

  const config = ROTURA_POR_TILE[rotura.tileOriginal];
  if (!tieneObjetoEquipado(config.objeto)) {
    cancelarRotura();
    return;
  }

  const transcurrido = Date.now() - rotura.tiempoInicio;
  const progreso = Math.max(0, 1 - (transcurrido / rotura.duracionMs));
  const relleno = document.getElementById("barra-stamina-relleno");
  relleno.style.width = (progreso * 100) + "%";

  // Fin de la rotura
  if (transcurrido >= rotura.duracionMs) {
    finalizarRotura();
  }
}

// ═══════════════════════════════════════════════════════════════
//  FINALIZAR ROTURA (barra llegó a cero)
// ═══════════════════════════════════════════════════════════════
function finalizarRotura() {
  if (!rotura.activa) return;

  const wx = rotura.wx;
  const wy = rotura.wy;

  // 1. Quitar el efecto de golpe (mismo momento que la barra llega a 0)
  if (typeof quitarEfecto === "function") {
    quitarEfecto(wx, wy, "efecto-golpe-loop");
  }

  // 2. Cambiar el tile
  const info = coordsMundoATile(wx, wy);
  const chunk = obtenerChunk(info.cx, info.cy);
  chunk.mapa[info.ly][info.lx] = rotura.tileBase;

  // 3. Resetear barra y estado
  cancelarRotura();

  // 4. Refrescar la celda inmediatamente
  if (typeof forzarRedibujadoGrid === "function") {
    forzarRedibujadoGrid();
  }
  render();
}

// ═══════════════════════════════════════════════════════════════
//  CANCELAR ROTURA (interrumpida, sin romper el tile)
// ═══════════════════════════════════════════════════════════════
function cancelarRotura() {
  // Quitar el efecto si estaba activo
  if (typeof quitarEfecto === "function" && rotura.wx !== null && rotura.wy !== null) {
    quitarEfecto(rotura.wx, rotura.wy, "efecto-golpe-loop");
  }

  rotura.activa = false;

  if (rotura.intervalID !== null) {
    clearInterval(rotura.intervalID);
    rotura.intervalID = null;
  }

  const barra = document.getElementById("barra-stamina");
  barra.classList.remove("visible");
  document.getElementById("barra-stamina-relleno").style.width = "100%";
}

// ═══════════════════════════════════════════════════════════════
//  CARTEL RÁPIDO
// ═══════════════════════════════════════════════════════════════
let _cartelTimer = null;

function mostrarCartelRapido(texto) {
  let cartel = document.getElementById("cartel-rapido");
  if (!cartel) {
    cartel = document.createElement("div");
    cartel.id = "cartel-rapido";
    cartel.style.cssText = `
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      background: #222;
      color: #6cf;
      padding: 12px 24px;
      border: 2px solid #6cf;
      border-radius: 8px;
      font-family: monospace;
      font-size: 16px;
      box-shadow: 0 0 16px rgba(100,200,255,0.6);
      z-index: 200;
      opacity: 0;
      transition: opacity 0.2s;
    `;
    document.body.appendChild(cartel);
  }

  cartel.textContent = texto;
  cartel.style.opacity = "1";

  if (_cartelTimer) clearTimeout(_cartelTimer);
  _cartelTimer = setTimeout(() => {
    cartel.style.opacity = "0";
  }, 1500);
}

// ═══════════════════════════════════════════════════════════════
//  LISTENER DEL MOUSE
// ═══════════════════════════════════════════════════════════════
const divMapaClick = document.getElementById("pantalla");

divMapaClick.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;

  const coords = coordenadasClickAMundo(e);
  if (!coords) return;

  if (typeof estaNavegando === "function" && estaNavegando()) {
    if (typeof iniciarDesembarco === "function") {
      if (iniciarDesembarco(coords.wx, coords.wy)) return;
    }
    intentarIniciarRotura(coords.wx, coords.wy);
    return;
  }

  if (typeof intentarColocarBarco === "function") {
    if (intentarColocarBarco(coords.wx, coords.wy)) return;
  }

  intentarIniciarRotura(coords.wx, coords.wy);
});

// ═══════════════════════════════════════════════════════════════
//  LIMPIAR AL REINICIAR MUNDO
// ═══════════════════════════════════════════════════════════════
function cancelarRoturaSiActiva() {
  if (rotura.activa) cancelarRotura();
  if (typeof cancelarColocacionBarco === "function" &&
      typeof barco !== "undefined" && barco.colocando) {
    cancelarColocacionBarco();
  }
}