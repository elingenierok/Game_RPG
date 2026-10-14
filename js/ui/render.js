// ═══════════════════════════════════════════════════════════════
//  BLOQUE 9 · RENDER DEL MAPA
// ─────────────────────────────────────────────────────────────────
//  Los tamaños (grid, celdas, emojis) se derivan de config.js.
//  Cambiar ANCHO_PANTALLA / ALTO_PANTALLA allí ajusta todo acá.
// ═══════════════════════════════════════════════════════════════
const divMapa = document.getElementById("mapa");
divMapa.style.gridTemplateColumns = `repeat(${ANCHO_PANTALLA}, ${TAMANO_CELDA}px)`;
divMapa.style.fontSize = FONT_EMOJI + "px";

const celdas = [];
for (let y = 0; y < ALTO_PANTALLA; y++) {
  for (let x = 0; x < ANCHO_PANTALLA; x++) {
    const c = document.createElement("div");
    c.className = "tile";
    c.style.width  = TAMANO_CELDA + "px";
    c.style.height = TAMANO_CELDA + "px";
    divMapa.appendChild(c);
    celdas.push(c);
  }
}

function render() {
  const { mapa } = estado.pantalla;
  const items = obtenerItemsDeChunk(estado.zona);

  const itemsPorPos = new Map();
  for (const it of items) {
    itemsPorPos.set(it.x + "," + it.y, it);
  }

  for (let y = 0; y < ALTO_PANTALLA; y++) {
    for (let x = 0; x < ANCHO_PANTALLA; x++) {
      const idx = y * ANCHO_PANTALLA + x;
      const celda = celdas[idx];

      // Resetear transform
      celda.style.transform = "";

      // 1. Llave
      if (estado.llave.zona === estado.zona &&
          estado.llave.x === x && estado.llave.y === y) {
        celda.textContent = ICONOS[LLAGUE];
        continue;
      }

      // 2. Jugador (con orientación)
      if (estado.jugador.x === x && estado.jugador.y === y) {
        celda.textContent = ICONOS[PLAYER];
        if (estado.jugadorMirandoIzquierda) {
          celda.style.transform = "scaleX(-1)";
        }
        continue;
      }

      // 3. Ítems (manzanas)
      const claveItem = estado.zona + ":" + x + "," + y;
      if (itemsPorPos.has(x + "," + y) && !estado.itemsRecogidos.has(claveItem)) {
        const it = itemsPorPos.get(x + "," + y);
        celda.textContent = iconoDeItem(it.tipo);
        continue;
      }

      // 3.5. Equipables (hacha, pico, linterna)
      const equipables = obtenerEquipablesDeChunk(estado.zona);
      const claveEquip = estado.zona + ":" + x + "," + y;
      const equip = equipables.find(e => e.x === x && e.y === y);
      if (equip && !estado.itemsRecogidos.has(claveEquip)) {
        celda.textContent = ICONOS[equip.tipo];
        continue;
      }

      // 4. Mobs
      const mob = obtenerMobEn(estado.zona, x, y);
      if (mob) {
        const datos = MOBS[mob.tipo];
        celda.textContent = datos.emoji;
        // Espejado según dirección del último movimiento
        if (mob.mirandoIzquierda) {
          celda.style.transform = "scaleX(-1)";
        }
        continue;
      }

      // 5. Terreno base
      const icono = ICONOS[mapa[y][x]];
      celda.textContent = icono !== undefined ? icono : ICONOS[GRASS];
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 10 · RENDER DE BARRA DE OBJETIVOS
// ─────────────────────────────────────────────────────────────────
//  La barra muestra múltiples objetivos (jugador, llave, objetos equipables).
//  Cada slot puede tener un ícono distinto según lo que esté en esa zona.
// ═══════════════════════════════════════════════════════════════
const divSlots    = document.getElementById("slots");
const flechaIzq   = document.getElementById("flechaIzq");
const flechaDer   = document.getElementById("flechaDer");

const slots = [];
for (let i = 0; i < ZONAS_VISIBLES; i++) {
  const s = document.createElement("div");
  s.className = "slot";
  s.innerHTML = `<span class="num"></span><span class="icono"></span>`;
  divSlots.appendChild(s);
  slots.push(s);
}

// ─── Cache de ubicaciones de equipables por zona ───
// Ayuda a no recalcular en cada render
const _ubicacionesEquipablesPorZona = new Map();

function obtenerUbicacionEquipables(zona) {
  if (_ubicacionesEquipablesPorZona.has(zona)) {
    return _ubicacionesEquipablesPorZona.get(zona);
  }
  const equipables = obtenerEquipablesDeChunk(zona);
  _ubicacionesEquipablesPorZona.set(zona, equipables);
  return equipables;
}

// ─── Limpia el cache de ubicaciones (al cambiar semilla) ───
function limpiarCacheUbicaciones() {
  _ubicacionesEquipablesPorZona.clear();
}

function renderBarraZonas() {
  const centro = Math.floor(ZONAS_VISIBLES / 2);
  const zonaInicio = estado.zona - centro;

  for (let i = 0; i < ZONAS_VISIBLES; i++) {
    const zonaSlot = zonaInicio + i;
    const slot = slots[i];
    const num = slot.querySelector(".num");
    const icono = slot.querySelector(".icono");

    const fueraDeRango = zonaSlot < -LIMITE_CHUNKS || zonaSlot > LIMITE_CHUNKS;

    if (fueraDeRango) {
      num.textContent = "";
      icono.textContent = "";
      slot.classList.remove("actual", "visitada");
      slot.classList.add("fuera");
      continue;
    }

    slot.classList.remove("fuera");
    num.textContent = zonaSlot;
    icono.textContent = "";

    slot.classList.remove("actual", "visitada");
    if (zonaSlot === estado.zona) slot.classList.add("actual");
    if (estado.zonasVisitadas.has(zonaSlot)) slot.classList.add("visitada");

    // ─── Decidir qué mostrar en este slot ───
    const esJugador = (zonaSlot === estado.zona);
    const esLlave   = (zonaSlot === estado.llave.zona);

    // Objetos equipables en esta zona (puede haber 0 o 1)
    const equipablesEnZona = obtenerUbicacionEquipables(zonaSlot);
    // Filtrar los que ya fueron recogidos
    const equipablesPendientes = equipablesEnZona.filter(eq => {
      const clave = zonaSlot + ":" + eq.x + "," + eq.y;
      return !estado.itemsRecogidos.has(clave);
    });

    // Prioridad de visualización:
    // 1. Jugador + llave → 🔍
    // 2. Jugador solo → 🏃‍♂️
    // 3. Llave → 🔑
    // 4. Equipables pendientes → su ícono
    if (esJugador && esLlave) {
      icono.textContent = ICONOS[LUPA];
    } else if (esJugador) {
      icono.textContent = ICONOS[PLAYER];
    } else if (esLlave) {
      icono.textContent = ICONOS[LLAGUE];
    } else if (equipablesPendientes.length > 0) {
      icono.textContent = ICONOS[equipablesPendientes[0].tipo];
    }
  }

  // ─── Flechas si la llave o algún equipable está fuera del rango ───
  const zonaMinVisible = zonaInicio;
  const zonaMaxVisible = zonaInicio + ZONAS_VISIBLES - 1;

  // Llave
  const dz = estado.llave.zona - estado.zona;

  if (estado.llave.zona < zonaMinVisible) {
    flechaIzq.classList.add("visible");
    flechaIzq.textContent = `← 🔑 (${Math.abs(dz)})`;
  } else {
    flechaIzq.classList.remove("visible");
  }

  if (estado.llave.zona > zonaMaxVisible) {
    flechaDer.classList.add("visible");
    flechaDer.textContent = `🔑 (${Math.abs(dz)}) →`;
  } else {
    flechaDer.classList.remove("visible");
  }
}

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 11 · HUD Y SLOTS DE EQUIPADOS
// ═══════════════════════════════════════════════════════════════

// Mapeo de nombres de objetos a íconos
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
  document.getElementById("pos").textContent = `${estado.jugador.x},${estado.jugador.y}`;
  document.getElementById("zona").textContent = estado.zona;

  const entradas = Object.entries(estado.inventario);
  if (entradas.length === 0) {
    document.getElementById("inventario").textContent = "—";
  } else {
    document.getElementById("inventario").textContent =
      entradas.map(([nombre, cant]) => `${iconoPorNombre(nombre)} x${cant}`).join(" · ");
  }

  // ─── Slots de equipados (arriba del mapa) ───
  actualizarSlotsEquipados();
}

function actualizarSlotsEquipados() {
  const slotHacha    = document.getElementById("slot-hacha");
  const slotPico     = document.getElementById("slot-pico");
  const slotLinterna = document.getElementById("slot-linterna");
  const slotBarco    = document.getElementById("slot-barco");

  const tieneHacha    = (estado.inventario.HACHA    || 0) > 0;
  const tienePico     = (estado.inventario.PICO     || 0) > 0;
  const tieneLinterna = (estado.inventario.LINTERNA || 0) > 0;
  const tieneBarco    = (estado.inventario.BARCO    || 0) > 0;

  if (tieneHacha) {
    slotHacha.textContent = "🪓";
    slotHacha.classList.add("tiene");
  } else {
    slotHacha.textContent = "—";
    slotHacha.classList.remove("tiene");
  }

  if (tienePico) {
    slotPico.textContent = "⛏️";
    slotPico.classList.add("tiene");
  } else {
    slotPico.textContent = "—";
    slotPico.classList.remove("tiene");
  }

  if (tieneLinterna) {
    slotLinterna.textContent = "🕯️";
    slotLinterna.classList.add("tiene");
  } else {
    slotLinterna.textContent = "—";
    slotLinterna.classList.remove("tiene");
  }

  if (tieneBarco) {
    slotBarco.textContent = "🛶";
    slotBarco.classList.add("tiene");
  } else {
    slotBarco.textContent = "—";
    slotBarco.classList.remove("tiene");
  }
}