// ═══════════════════════════════════════════════════════════════
//  BLOQUE 9 · RENDER DEL MUNDO (chunks 2D + cámara fluida)
// ─────────────────────────────────────────────────────────────────
//  Grid extendido: viewport + 2 celdas extra a cada lado.
//  El contenido del grid se recalcula cuando la esquina cambia.
//  Los EFECTOS VISUALES se actualizan SIEMPRE (cada frame).
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

// Esquina del grid
let _esquinaGridX = null;
let _esquinaGridY = null;

// Flag: ¿había efectos en el frame anterior?
let _habiaEfectos = false;

function forzarRedibujadoGrid() {
  _esquinaGridX = null;
  _esquinaGridY = null;
}

// ─── Helper: color del bioma en coordenadas del mundo ───
function colorDeBioma(wx, wy) {
  const info = coordsMundoATile(wx, wy);
  const bioma = obtenerBiomaDeChunk(SEMILLA, info.cx, info.cy);
  const color = BIOMAS[bioma] && BIOMAS[bioma].color;
  return color || "transparent";
}

// ─── Helper: ¿hay tecla apretada? ───
function hayTeclaApretada() {
  if (typeof obtenerDireccionActual !== "function") return false;
  return obtenerDireccionActual() !== null;
}

// ─── Dibuja el contenido de UNA celda del mundo ───
function dibujarCeldaEnGrid(celda, wx, wy) {
  celda.style.transform = "";
  celda.style.background = "transparent";

  if (estado.llave.wx === wx && estado.llave.wy === wy) {
    celda.textContent = ICONOS[LLAGUE];
    celda.style.background = colorDeBioma(wx, wy);
    return;
  }

  const items = obtenerItemsDeChunk(wx, wy);
  const item = items.find(it => it.wx === wx && it.wy === wy);
  if (item) {
    const clave = wx + "," + wy;
    if (!estado.itemsRecogidos.has(clave)) {
      celda.textContent = iconoDeItem(item.tipo);
      celda.style.background = colorDeBioma(wx, wy);
      return;
    }
  }

  const equipables = obtenerEquipablesDeChunk(wx, wy);
  const equip = equipables.find(e => e.wx === wx && e.wy === wy);
  if (equip) {
    const clave = wx + "," + wy;
    if (!estado.itemsRecogidos.has(clave)) {
      celda.textContent = ICONOS[equip.tipo];
      celda.style.background = colorDeBioma(wx, wy);
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
    celda.style.background = colorDeBioma(wx, wy);
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
  celda.style.background = colorDeBioma(wx, wy);
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
//  EFECTOS VISUALES (clases CSS dinámicas)
// ─────────────────────────────────────────────────────────────────
//  Se ejecuta SIEMPRE en render(), no solo cuando la esquina cambia.
//  Solo itera si hay efectos activos (o los hubo en el frame anterior).
//  No toca textContent, background ni transform: solo className.
// ═══════════════════════════════════════════════════════════════
function actualizarEfectosEnGrid() {
  if (typeof efectosActivos === "undefined") return;

  const hayEfectos = efectosActivos.size > 0;
  if (!hayEfectos && !_habiaEfectos) return;
  _habiaEfectos = hayEfectos;

  // Si el grid todavía no se inicializó, salir
  if (_esquinaGridX === null || _esquinaGridY === null) return;

  for (let vy = 0; vy < ALTO_GRID; vy++) {
    for (let vx = 0; vx < ANCHO_GRID; vx++) {
      const idx = vy * ANCHO_GRID + vx;
      const celda = celdas[idx];
      const wx = _esquinaGridX + vx;
      const wy = _esquinaGridY + vy;

      const efectos = obtenerEfectosDe(wx, wy);
      const nuevoClassName = efectos.length > 0
        ? "tile " + efectos.join(" ")
        : "tile";

      if (celda.className !== nuevoClassName) {
        celda.className = nuevoClassName;
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  RENDER PRINCIPAL
// ═══════════════════════════════════════════════════════════════
function render() {
  const centroX = Math.floor(ANCHO_VENTANA / 2);
  const centroY = Math.floor(ALTO_VENTANA / 2);

  const esquinaX = camara.x - centroX;
  const esquinaY = camara.y - centroY;

  const nuevaEsquinaX = Math.floor(esquinaX) - MARGEN_GRID;
  const nuevaEsquinaY = Math.floor(esquinaY) - MARGEN_GRID;

  if (nuevaEsquinaX !== _esquinaGridX || nuevaEsquinaY !== _esquinaGridY) {
    _esquinaGridX = nuevaEsquinaX;
    _esquinaGridY = nuevaEsquinaY;
    llenarGrid(_esquinaGridX, _esquinaGridY);
  }

  const offsetPxX = -((esquinaX - _esquinaGridX) * TAMANO_CELDA);
  const offsetPxY = -((esquinaY - _esquinaGridY) * TAMANO_CELDA);

  divMapa.style.transform = `translate(${offsetPxX}px, ${offsetPxY}px)`;

  // ─── Efectos visuales ───
  actualizarEfectosEnGrid();

  // ─── Emoji + orientación del jugador fijo ───
  const datosJugador = _temaActivo.jugador;
  let emojiJugador;

  if (estado.jugador.enBarco) {
    emojiJugador = datosJugador.barco;
  } else if (estado.jugador.animando || hayTeclaApretada()) {
    const frame = Math.floor(performance.now() / 150) % 2;
    emojiJugador = frame === 0 ? datosJugador.correrA : datosJugador.correrB;
  } else {
    emojiJugador = datosJugador.quieto;
  }

  divJugador.textContent = emojiJugador;
  divJugador.style.transform = estado.jugador.mirandoIzquierda
    ? "scaleX(-1)"
    : "scaleX(1)";
}

// ═══════════════════════════════════════════════════════════════
//  HUD
// ═══════════════════════════════════════════════════════════════
const ICONO_POR_NOMBRE = {
  MANZANA:  ICONOS[MANZANA],
  HACHA:    ICONOS[HACHA],
  PICO:     ICONOS[PICO],
  LINTERNA: ICONOS[LINTERNA],
  BARCO:    ICONOS[BARCO],
};

function iconoPorNombre(nombre) {
  if (typeof obtenerDatosItem === "function") return obtenerDatosItem(nombre).icono;
  return ICONO_POR_NOMBRE[nombre] || "❓";
}

// Iconos de corazón: 2 HP por corazón.
const HP_POR_CORAZON = 2;
const CORAZON_LLENO = "❤️";
const CORAZON_ROTO = "💔";
const CORAZON_VACIO = "🖤";

function actualizarHUD() {
  const info = coordsMundoATile(Math.floor(estado.jugador.wx), Math.floor(estado.jugador.wy));
  document.getElementById("pos").textContent =
    `${Math.floor(estado.jugador.wx)},${Math.floor(estado.jugador.wy)}`;
  document.getElementById("zona").textContent = `${info.cx},${info.cy}`;

  const nivelEl = document.getElementById("nivel-jugador");
  const xpEl = document.getElementById("xp-jugador");
  if (nivelEl && xpEl && typeof Progresion !== "undefined") {
    const resumen = Progresion.obtenerResumen();
    nivelEl.textContent = resumen.nivel;
    xpEl.textContent = resumen.xp;
  }

  const entradas = Object.entries(estado.inventario);
  if (entradas.length === 0) {
    document.getElementById("inventario").textContent = "—";
  } else {
    document.getElementById("inventario").textContent =
      entradas.map(([nombre, cant]) => `${iconoPorNombre(nombre)} x${cant}`).join(" · ");
  }

  // ─── Corazones de HP (F28) ───
  actualizarCorazones();

  actualizarSlotsEquipados();
}

// ─── Corazones de HP (2 HP por corazón) ───
function actualizarCorazones() {
  const cont = document.getElementById("hp-corazones-iconos");
  if (!cont) return;

  const hp = Math.max(0, estado.jugador.hp);
  const hpMax = estado.jugador.hpMax || 20;
  const total = Math.max(1, Math.ceil(hpMax / HP_POR_CORAZON));

  cont.innerHTML = "";
  for (let i = 0; i < total; i++) {
    const restante = hp - i * HP_POR_CORAZON;
    const corazon = document.createElement("span");
    corazon.className = "corazon";

    if (restante >= HP_POR_CORAZON) {
      corazon.textContent = CORAZON_LLENO;
    } else if (restante >= 1) {
      corazon.textContent = CORAZON_ROTO;
      corazon.classList.add("roto");
    } else {
      corazon.textContent = CORAZON_VACIO;
      corazon.classList.add("vacio");
    }

    cont.appendChild(corazon);
  }

  const numero = document.getElementById("hp-corazones-numero");
  if (numero) {
    numero.textContent = `${Math.ceil(hp)} / ${hpMax}`;
  }
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

  slotHacha.textContent = tieneHacha ? ICONOS[HACHA] : "—";
  slotHacha.classList.toggle("tiene", tieneHacha);

  slotPico.textContent = tienePico ? ICONOS[PICO] : "—";
  slotPico.classList.toggle("tiene", tienePico);

  slotLinterna.textContent = tieneLinterna ? ICONOS[LINTERNA] : "—";
  slotLinterna.classList.toggle("tiene", tieneLinterna);

  slotBarco.textContent = tieneBarco ? ICONOS[BARCO] : "—";
  slotBarco.classList.toggle("tiene", tieneBarco);
}