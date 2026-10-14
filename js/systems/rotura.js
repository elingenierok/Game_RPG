// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.10 · SISTEMA DE ROTURA
// ─────────────────────────────────────────────────────────────────
//  Permite romper árboles y piedras haciendo click sostenido.
//
//  Condiciones:
//    1. El click debe ser EXACTAMENTE sobre la celda del objeto.
//    2. El jugador debe estar ADYACENTE (4 direcciones).
//    3. Debe tener el objeto correcto equipado (🪓 para árbol, ⛏️ para piedra).
//
//  Comportamiento:
//    - Al mantener el click: barra de stamina baja de 100% a 0%.
//    - Al soltar: se cancela.
//    - Si el jugador se mueve: se cancela.
//    - Al llegar a 0%: el tile se convierte al tileBase del bioma.
// ═══════════════════════════════════════════════════════════════

// ─── Estado de la rotura actual ───
const rotura = {
  activa: false,
  zona: null,
  x: null,
  y: null,
  tileOriginal: null,
  tileBase: null,
  tiempoInicio: 0,
  duracionMs: 0,
  intervalID: null,
};

// ═══════════════════════════════════════════════════════════════
//  DETECCIÓN DE CLICK SOBRE EL MAPA
// ═══════════════════════════════════════════════════════════════

// Convertir coordenadas del mouse a celda del mapa
function coordenadasACelda(evento) {
  const rect = divMapa.getBoundingClientRect();
  const x = evento.clientX - rect.left;
  const y = evento.clientY - rect.top;

  const celdaX = Math.floor(x / TAMANO_CELDA);
  const celdaY = Math.floor(y / TAMANO_CELDA);

  if (celdaX < 0 || celdaX >= ANCHO_PANTALLA) return null;
  if (celdaY < 0 || celdaY >= ALTO_PANTALLA) return null;

  return { x: celdaX, y: celdaY };
}

// ─── Verificar si el jugador está adyacente a una celda ───
function jugadorAdyacenteA(x, y) {
  const dx = Math.abs(estado.jugador.x - x);
  const dy = Math.abs(estado.jugador.y - y);
  // Adyacente = 1 tile en cualquiera de las 4 direcciones
  return (dx + dy) === 1;
}

// ─── Verificar si el jugador tiene el objeto correcto ───
function tieneObjetoEquipado(nombre) {
  return (estado.inventario[nombre] || 0) > 0;
}

// ═══════════════════════════════════════════════════════════════
//  INICIAR ROTURA
// ═══════════════════════════════════════════════════════════════

function intentarIniciarRotura(x, y) {
  // ─── 1. ¿Hay algo rompible en esa celda? ───
  const tile = estado.pantalla.mapa[y][x];
  const config = ROTURA_POR_TILE[tile];

  if (!config) {
    // No es árbol ni piedra. No hacer nada.
    return false;
  }

  // ─── 2. ¿El jugador está adyacente? ───
  if (!jugadorAdyacenteA(x, y)) {
    return false;
  }

  // ─── 3. ¿Tiene el objeto correcto? ───
  if (!tieneObjetoEquipado(config.objeto)) {
    // Mostrar cartel
    const nombreObjeto = config.objeto === "HACHA" ? "hacha" : "pico";
    mostrarCartelRapido(`Necesitás un ${nombreObjeto}`);
    return false;
  }

  // ─── 4. Iniciar rotura ───
  rotura.activa = true;
  rotura.zona = estado.zona;
  rotura.x = x;
  rotura.y = y;
  rotura.tileOriginal = tile;
  rotura.tileBase = NOMBRE_A_TILE[BIOMAS[estado.pantalla.bioma].tileBase];
  rotura.tiempoInicio = Date.now();
  rotura.duracionMs = config.duracionMs;

  // Mostrar barra
  const barra = document.getElementById("barra-stamina");
  barra.classList.add("visible");

  // Loop de actualización
  rotura.intervalID = setInterval(actualizarRotura, INTERVALO_ROTURA_MS);

  return true;
}

// ═══════════════════════════════════════════════════════════════
//  ACTUALIZAR ROTURA
// ═══════════════════════════════════════════════════════════════

function actualizarRotura() {
  if (!rotura.activa) return;

  // ─── ¿El jugador se movió? Cancelar ───
  if (!jugadorAdyacenteA(rotura.x, rotura.y)) {
    cancelarRotura();
    return;
  }

  // ─── ¿Cambió de zona? Cancelar ───
  if (estado.zona !== rotura.zona) {
    cancelarRotura();
    return;
  }

  // ─── ¿Se perdió el objeto equipado? Cancelar ───
  const config = ROTURA_POR_TILE[rotura.tileOriginal];
  if (!tieneObjetoEquipado(config.objeto)) {
    cancelarRotura();
    return;
  }

  // ─── Actualizar barra ───
  const transcurrido = Date.now() - rotura.tiempoInicio;
  const progreso = Math.max(0, 1 - (transcurrido / rotura.duracionMs));
  const relleno = document.getElementById("barra-stamina-relleno");
  relleno.style.width = (progreso * 100) + "%";

  // ─── ¿Terminó? ───
  if (transcurrido >= rotura.duracionMs) {
    finalizarRotura();
  }
}

// ═══════════════════════════════════════════════════════════════
//  FINALIZAR ROTURA
// ═══════════════════════════════════════════════════════════════

function finalizarRotura() {
  if (!rotura.activa) return;

  // Convertir el tile al tileBase del bioma
  estado.pantalla.mapa[rotura.y][rotura.x] = rotura.tileBase;

  cancelarRotura();
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

  // Ocultar barra
  const barra = document.getElementById("barra-stamina");
  barra.classList.remove("visible");
  document.getElementById("barra-stamina-relleno").style.width = "100%";
}

// ═══════════════════════════════════════════════════════════════
//  CARTEL RÁPIDO (para "Necesitás un hacha")
// ═══════════════════════════════════════════════════════════════

let _cartelTimer = null;

function mostrarCartelRapido(texto) {
  // Crear cartel si no existe
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
//  LISTENERS DEL MOUSE
// ═══════════════════════════════════════════════════════════════

divMapa.addEventListener("mousedown", (e) => {
  // Solo botón izquierdo
  if (e.button !== 0) return;

  const celda = coordenadasACelda(e);
  if (!celda) return;

  // Intentar colocar barco primero (si aplica)
  if (typeof intentarColocarBarco === "function") {
    if (intentarColocarBarco(celda.x, celda.y)) return;
  }

  // Si no, intentar romper
  intentarIniciarRotura(celda.x, celda.y);
});

document.addEventListener("mouseup", () => {
  if (rotura.activa) {
    cancelarRotura();
  }
});

// Si el mouse sale de la ventana mientras aprieta
document.addEventListener("mouseleave", () => {
  if (rotura.activa) {
    cancelarRotura();
  }
});

// ═══════════════════════════════════════════════════════════════
//  LIMPIAR AL CAMBIAR DE ZONA O MUNDO
// ═══════════════════════════════════════════════════════════════

function cancelarRoturaSiActiva() {
  if (rotura.activa) {
    cancelarRotura();
  }
  if (typeof cancelarColocacionBarco === "function" && typeof barco !== "undefined" && barco.colocando) {
    cancelarColocacionBarco();
  }
}