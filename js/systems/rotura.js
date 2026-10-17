// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.10 · SISTEMA DE ROTURA (chunks 2D)
// ─────────────────────────────────────────────────────────────────
//  El click se convierte a coordenadas del mundo (wx, wy).
//  La rotura modifica el chunk correspondiente.
// ═══════════════════════════════════════════════════════════════

// ─── Estado de la rotura actual ───
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

// ─── ¿El jugador está adyacente a (wx, wy)? ───
function jugadorAdyacenteA(wx, wy) {
  const jx = Math.floor(estado.jugador.wx);
  const jy = Math.floor(estado.jugador.wy);
  const dx = Math.abs(jx - wx);
  const dy = Math.abs(jy - wy);
  return (dx + dy) === 1;
}

// ─── ¿Tiene el objeto equipado? ───
function tieneObjetoEquipado(nombre) {
  return (estado.inventario[nombre] || 0) > 0;
}

// ═══════════════════════════════════════════════════════════════
//  INICIAR ROTURA
// ═══════════════════════════════════════════════════════════════
function intentarIniciarRotura(wx, wy) {
  // 1. ¿Hay algo rompible en esa celda?
  const tile = tileEnMundo(wx, wy);
  const config = ROTURA_POR_TILE[tile];
  if (!config) return false;

  // 2. ¿El jugador está adyacente?
  if (!jugadorAdyacenteA(wx, wy)) return false;

  // 3. ¿Tiene el objeto correcto?
  if (!tieneObjetoEquipado(config.objeto)) {
    const nombreObjeto = config.objeto === "HACHA" ? "hacha" : "pico";
    mostrarCartelRapido(`Necesitás un ${nombreObjeto}`);
    return false;
  }

  // 4. Iniciar rotura
  rotura.activa = true;
  rotura.wx = wx;
  rotura.wy = wy;
  rotura.tileOriginal = tile;

    // Tile base según el bioma de la celda
  const bioma = obtenerBiomaDeCelda(SEMILLA, wx, wy);
  rotura.tileBase = NOMBRE_A_TILE[BIOMAS[bioma].tileBase];

  rotura.tiempoInicio = Date.now();
  rotura.duracionMs = config.duracionMs;

  const barra = document.getElementById("barra-stamina");
  barra.classList.add("visible");

  rotura.intervalID = setInterval(actualizarRotura, INTERVALO_ROTURA_MS);
  return true;
}

// ═══════════════════════════════════════════════════════════════
//  ACTUALIZAR ROTURA
// ═══════════════════════════════════════════════════════════════
function actualizarRotura() {
  if (!rotura.activa) return;

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

  if (transcurrido >= rotura.duracionMs) {
    finalizarRotura();
  }
}

// ═══════════════════════════════════════════════════════════════
//  FINALIZAR ROTURA
// ═══════════════════════════════════════════════════════════════
function finalizarRotura() {
  if (!rotura.activa) return;

  // Convertir el tile en el chunk correspondiente
  const info = coordsMundoATile(rotura.wx, rotura.wy);
  const chunk = obtenerChunk(info.cx, info.cy);
  chunk.mapa[info.ly][info.lx] = rotura.tileBase;

  cancelarRotura();

  // Forzar el redibujado del grid (para que el cambio se vea al instante)
  if (typeof forzarRedibujadoGrid === "function") {
    forzarRedibujadoGrid();
  }
  render();
}

// ═══════════════════════════════════════════════════════════════
//  CANCELAR ROTURA
// ═══════════════════════════════════════════════════════════════
function cancelarRotura() {
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

  // 1. ¿Navegando? Intentar desembarcar
  if (typeof estaNavegando === "function" && estaNavegando()) {
    // 1a. Intentar desembarcar
    if (typeof iniciarDesembarco === "function") {
      if (iniciarDesembarco(coords.wx, coords.wy)) return;
    }
    // 1b. Si no puede desembarcar, intentar romper (ej: roca en el agua)
    intentarIniciarRotura(coords.wx, coords.wy);
    return;
  }

  // 2. Intentar colocar barco
  if (typeof intentarColocarBarco === "function") {
    if (intentarColocarBarco(coords.wx, coords.wy)) return;
  }

  // 3. Intentar romper
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