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
  celda.style.animation = "";
  celda.style.textShadow = "";

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
      celda.textContent = equip.id && typeof obtenerDatosItem === "function"
        ? obtenerDatosItem(equip.id).icono
        : (ICONOS[equip.tipo] || "❓");
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

  if (tileID === HOGUERA) {
    const color = colorDeBioma(wx, wy);
    celda.style.background =
      `radial-gradient(ellipse at 50% 80%, #7a4a22 0%, #4a2b14 38%, transparent 58%), ${color}`;
    celda.style.textShadow = "0 0 8px rgba(255,150,40,0.95)";
    celda.style.animation = "hoguera-titilar 640ms ease-in-out infinite alternate";
  }
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
//  OSCURIDAD DEL CICLO DÍA-NOCHE (F1)
// ─────────────────────────────────────────────────────────────────
//  El velo negro de cada celda sale de `1 - luz`. Si la celda no
//  tiene luz local, hereda `--osc-global` (variable de #mapa).
//  De día la luz global es 1 → no se calcula nada (velo en 0).
// ═══════════════════════════════════════════════════════════════
let _oscCache = null;

function actualizarOscuridadEnGrid() {
  if (typeof Ciclo === "undefined" || _esquinaGridX === null || _esquinaGridY === null) return;

  const sol = Ciclo.luzGlobal();
  divMapa.style.setProperty("--osc-global", (1 - sol).toFixed(3));

  const total = ANCHO_GRID * ALTO_GRID;
  if (!_oscCache || _oscCache.length !== total) {
    _oscCache = new Array(total).fill(-1);
  }

  // De día: limpiar cualquier luz local y salir.
  if (sol >= 1) {
    for (let idx = 0; idx < total; idx++) {
      if (_oscCache[idx] !== -1) {
        celdas[idx].style.removeProperty("--osc");
        _oscCache[idx] = -1;
      }
    }
    return;
  }

  const campo = Ciclo.calcularCampoLuz(_esquinaGridX, _esquinaGridY, ANCHO_GRID, ALTO_GRID);

  for (let idx = 0; idx < total; idx++) {
    const luz = campo[idx];
    // Solo pisar el velo global si la celda está más iluminada que el sol.
    const usarLocal = luz > sol + 0.004;
    const valor = usarLocal ? Number((1 - luz).toFixed(3)) : -1;

    if (_oscCache[idx] !== valor) {
      if (valor < 0) {
        celdas[idx].style.removeProperty("--osc");
      } else {
        celdas[idx].style.setProperty("--osc", valor.toFixed(3));
      }
      _oscCache[idx] = valor;
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

  // ─── Oscuridad día-noche ───
  actualizarOscuridadEnGrid();

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

  const entradas = Object.entries(estado.inventario).filter(([id]) => {
    if (typeof obtenerDatosItem !== "function") return true;
    const categoria = obtenerDatosItem(id).categoria;
    return categoria !== "accion" && categoria !== "equipable";
  });
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

function aplicarNivelVisual(elemento, datos) {
  if (!elemento) return;
  for (let i = 0; i < 4; i++) elemento.classList.remove(`nivel-${i}`);
  if (!datos) return;
  const nivel = Number.isInteger(datos.nivel) ? datos.nivel : 0;
  elemento.classList.add(`nivel-${nivel}`);
  elemento.dataset.nivel = nivel;
}

function actualizarSlotsEquipados() {
  const slotHacha    = document.getElementById("slot-hacha");
  const slotPico     = document.getElementById("slot-pico");
  const slotLinterna = document.getElementById("slot-linterna");
  const slotBarco    = document.getElementById("slot-barco");

  if (!slotHacha) return;

  const obtener = (tipo, icono) => {
    if (typeof Equipamiento !== "undefined") return Equipamiento.obtenerAccion(tipo);
    return (estado.inventario[tipo] || 0) > 0
      ? { icono, nombre: tipo, nivel: 0 }
      : null;
  };

  const hacha = obtener("HACHA", ICONOS[HACHA]);
  const pico = obtener("PICO", ICONOS[PICO]);
  const linterna = obtener("LINTERNA", ICONOS[LINTERNA]);
  const barco = obtener("BARCO", ICONOS[BARCO]);

  const aplicar = (slot, datos, iconoBase) => {
    slot.textContent = datos ? (datos.icono || iconoBase) : "—";
    slot.classList.toggle("tiene", !!datos);
    slot.title = datos ? `${datos.nombre} · ${datos.nivelNombre || "Base"}` : "";
    aplicarNivelVisual(slot, datos);
  };

  aplicar(slotHacha, hacha, ICONOS[HACHA]);
  aplicar(slotPico, pico, ICONOS[PICO]);
  aplicar(slotLinterna, linterna, ICONOS[LINTERNA]);
  aplicar(slotBarco, barco, ICONOS[BARCO]);
}