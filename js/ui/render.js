// ═══════════════════════════════════════════════════════════════
//  BLOQUE 9 · RENDER DEL MUNDO (chunks 2D + cámara fluida)
// ─────────────────────────────────────────────────────────────────
//  Grid extendido: viewport + 2 celdas extra a cada lado.
//  El contenido del grid se recalcula cuando:
//    - La cámara está quieta y la esquina cambió.
//    - La cámara se está moviendo y la esquina visible cambió.
//  El translate se calcula SIEMPRE con la posición exacta de la cámara.
// ═══════════════════════════════════════════════════════════════

const divMapa = document.getElementById("mapa");
const divJugador = document.getElementById("jugador-fijo");

// Grid extendido: 2 celdas extra a cada lado
const MARGEN_GRID = 2;
const ANCHO_GRID = ANCHO_VENTANA + MARGEN_GRID * 2;
const ALTO_GRID  = ALTO_VENTANA + MARGEN_GRID * 2;

const anchoViewportPx = ANCHO_VENTANA * TAMANO_CELDA;
const altoViewportPx  = ALTO_VENTANA  * TAMANO_CELDA;

const pantalla = document.getElementById("pantalla");
pantalla.style.width  = anchoViewportPx + "px";
pantalla.style.height = altoViewportPx + "px";

// Configurar el jugador fijo
divJugador.style.width  = TAMANO_CELDA + "px";
divJugador.style.height = TAMANO_CELDA + "px";
divJugador.style.fontSize = FONT_EMOJI + "px";

// El jugador debe quedar EXACTAMENTE sobre la celda central del viewport.
// Con ANCHO_VENTANA = 32, la celda central es la 16 (índice).
// Su esquina izquierda está en 16 * TAMANO_CELDA.
const celdaCentralX = Math.floor(ANCHO_VENTANA / 2);
const celdaCentralY = Math.floor(ALTO_VENTANA / 2);
divJugador.style.left = (celdaCentralX * TAMANO_CELDA) + "px";
divJugador.style.top  = (celdaCentralY * TAMANO_CELDA) + "px";

// Crear el grid extendido
divMapa.style.gridTemplateColumns = `repeat(${ANCHO_GRID}, ${TAMANO_CELDA}px)`;
divMapa.style.gridTemplateRows    = `repeat(${ALTO_GRID}, ${TAMANO_CELDA}px)`;
divMapa.style.fontSize = FONT_EMOJI + "px";

const celdas = [];
for (let vy = 0; vy < ALTO_GRID; vy++) {
  for (let vx = 0; vx < ANCHO_GRID; vx++) {
    const c = document.createElement("div");
    c.className = "tile";
    c.style.width  = TAMANO_CELDA + "px";
    c.style.height = TAMANO_CELDA + "px";
    divMapa.appendChild(c);
    celdas.push(c);
  }
}

// Esquina del grid (la celda [0][0] del grid corresponde a esta posición del mundo)
let _esquinaGridX = null;
let _esquinaGridY = null;

// ─── Forzar el redibujado del grid en el próximo render ───
function forzarRedibujadoGrid() {
  _esquinaGridX = null;
  _esquinaGridY = null;
}

// ─── Dibuja el contenido de UNA celda del mundo ───
function dibujarCeldaEnGrid(celda, wx, wy) {
  celda.style.transform = "";

  if (estado.llave.wx === wx && estado.llave.wy === wy) {
    celda.textContent = ICONOS[LLAGUE];
    return;
  }

  const items = obtenerItemsDeChunk(wx, wy);
  const item = items.find(it => it.wx === wx && it.wy === wy);
  if (item) {
    const clave = wx + "," + wy;
    if (!estado.itemsRecogidos.has(clave)) {
      celda.textContent = iconoDeItem(item.tipo);
      return;
    }
  }

  const equipables = obtenerEquipablesDeChunk(wx, wy);
  const equip = equipables.find(e => e.wx === wx && e.wy === wy);
  if (equip) {
    const clave = wx + "," + wy;
    if (!estado.itemsRecogidos.has(clave)) {
      celda.textContent = ICONOS[equip.tipo];
      return;
    }
  }

  const mob = obtenerMobEn(wx, wy);
  if (mob) {
    const datos = MOBS[mob.tipo];
    celda.textContent = datos.emoji;
    if (mob.mirandoIzquierda) {
      celda.style.transform = "scaleX(-1)";
    }
    return;
  }

  const info = coordsMundoATile(wx, wy);
  const chunk = obtenerChunk(info.cx, info.cy);
  if (!chunk || !chunk.mapa[info.ly] || chunk.mapa[info.ly][info.lx] === undefined) {
    celda.textContent = "";
    return;
  }
  const tileID = chunk.mapa[info.ly][info.lx];
  const icono = ICONOS[tileID];
  celda.textContent = icono !== undefined ? icono : ICONOS[GRASS];
}

// ─── Recalcula todo el grid ───
function llenarGrid(esquinaX, esquinaY) {
  for (let vy = 0; vy < ALTO_GRID; vy++) {
    for (let vx = 0; vx < ANCHO_GRID; vx++) {
      const idx = vy * ANCHO_GRID + vx;
      const celda = celdas[idx];
      const wx = esquinaX + vx;
      const wy = esquinaY + vy;
      dibujarCeldaEnGrid(celda, wx, wy);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  RENDER PRINCIPAL
// ═══════════════════════════════════════════════════════════════
function render() {
  const centroX = Math.floor(ANCHO_VENTANA / 2);
  const centroY = Math.floor(ALTO_VENTANA / 2);

  // Esquina del viewport (con decimales)
  const esquinaX = camara.x - centroX;
  const esquinaY = camara.y - centroY;

  // Esquina del grid (con margen)
  // El grid empieza a dibujarse MARGEN_GRID celdas antes de la esquina visible.
  const nuevaEsquinaX = Math.floor(esquinaX) - MARGEN_GRID;
  const nuevaEsquinaY = Math.floor(esquinaY) - MARGEN_GRID;

  // Si la esquina del grid cambió, recalcular todo el grid
  if (nuevaEsquinaX !== _esquinaGridX || nuevaEsquinaY !== _esquinaGridY) {
    _esquinaGridX = nuevaEsquinaX;
    _esquinaGridY = nuevaEsquinaY;
    llenarGrid(_esquinaGridX, _esquinaGridY);
  }

  // Offset visual del grid:
  // El grid empieza a dibujarse en x=0.
  // La celda [0][0] corresponde a (_esquinaGridX, _esquinaGridY).
  // La esquina visible (esquinaX) debe estar en el margen del grid.
  const offsetPxX = -((esquinaX - _esquinaGridX) * TAMANO_CELDA);
  const offsetPxY = -((esquinaY - _esquinaGridY) * TAMANO_CELDA);

  divMapa.style.transform = `translate(${offsetPxX}px, ${offsetPxY}px)`;
}

// ═══════════════════════════════════════════════════════════════
//  HUD
// ═══════════════════════════════════════════════════════════════
const ICONO_POR_NOMBRE = {
  MANZANA:  "🍎",
  HACHA:    "🪓",
  PICO:     "⛏️",
  LINTERNA: "🕯️",
  BARCO:    "🛶",
};

function iconoPorNombre(nombre) {
  return ICONO_POR_NOMBRE[nombre] || "❓";
}

function actualizarHUD() {
  const info = coordsMundoATile(Math.floor(estado.jugador.wx), Math.floor(estado.jugador.wy));
  document.getElementById("pos").textContent =
    `${Math.floor(estado.jugador.wx)},${Math.floor(estado.jugador.wy)}`;
  document.getElementById("zona").textContent = `${info.cx},${info.cy}`;

  const entradas = Object.entries(estado.inventario);
  if (entradas.length === 0) {
    document.getElementById("inventario").textContent = "—";
  } else {
    document.getElementById("inventario").textContent =
      entradas.map(([nombre, cant]) => `${iconoPorNombre(nombre)} x${cant}`).join(" · ");
  }

  actualizarSlotsEquipados();
}

function actualizarSlotsEquipados() {
  const slotHacha    = document.getElementById("slot-hacha");
  const slotPico     = document.getElementById("slot-pico");
  const slotLinterna = document.getElementById("slot-linterna");
  const slotBarco    = document.getElementById("slot-barco");

  if (!slotHacha) return;

  const tieneHacha    = (estado.inventario.HACHA    || 0) > 0;
  const tienePico     = (estado.inventario.PICO     || 0) > 0;
  const tieneLinterna = (estado.inventario.LINTERNA || 0) > 0;
  const tieneBarco    = (estado.inventario.BARCO    || 0) > 0;

  slotHacha.textContent = tieneHacha ? "🪓" : "—";
  slotHacha.classList.toggle("tiene", tieneHacha);

  slotPico.textContent = tienePico ? "⛏️" : "—";
  slotPico.classList.toggle("tiene", tienePico);

  slotLinterna.textContent = tieneLinterna ? "🕯️" : "—";
  slotLinterna.classList.toggle("tiene", tieneLinterna);

  slotBarco.textContent = tieneBarco ? "🛶" : "—";
  slotBarco.classList.toggle("tiene", tieneBarco);
}