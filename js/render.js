// ═══════════════════════════════════════════════════════════════
//  BLOQUE 9 · RENDER DEL MAPA
// ═══════════════════════════════════════════════════════════════
const divMapa = document.getElementById("mapa");
divMapa.style.gridTemplateColumns = `repeat(${ANCHO_PANTALLA}, 30px)`;

const celdas = [];
for (let y = 0; y < ALTO_PANTALLA; y++) {
  for (let x = 0; x < ANCHO_PANTALLA; x++) {
    const c = document.createElement("div");
    c.className = "tile";
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

      if (estado.llave.zona === estado.zona &&
          estado.llave.x === x && estado.llave.y === y) {
        celdas[idx].textContent = ICONOS[LLAGUE];
        continue;
      }

      if (estado.jugador.x === x && estado.jugador.y === y) {
        celdas[idx].textContent = ICONOS[PLAYER];
        continue;
      }

      const claveItem = estado.zona + ":" + x + "," + y;
      if (itemsPorPos.has(x + "," + y) && !estado.itemsRecogidos.has(claveItem)) {
        const it = itemsPorPos.get(x + "," + y);
        celdas[idx].textContent = iconoDeItem(it.tipo);
        continue;
      }

      const icono = ICONOS[mapa[y][x]];
      celdas[idx].textContent = icono !== undefined ? icono : ICONOS[GRASS];
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 10 · RENDER DE BARRA DE ZONAS
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

    const esJugador = (zonaSlot === estado.zona);
    const esLlave   = (zonaSlot === estado.llave.zona);

    if (esJugador && esLlave) icono.textContent = ICONOS[LUPA];
    else if (esJugador)       icono.textContent = ICONOS[PLAYER];
    else if (esLlave)         icono.textContent = ICONOS[LLAGUE];
  }

  const zonaMinVisible = zonaInicio;
  const zonaMaxVisible = zonaInicio + ZONAS_VISIBLES - 1;
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
//  BLOQUE 11 · HUD
// ═══════════════════════════════════════════════════════════════
function actualizarHUD() {
  document.getElementById("pos").textContent = `${estado.jugador.x},${estado.jugador.y}`;
  document.getElementById("zona").textContent = estado.zona;

  const entradas = Object.entries(estado.inventario);
  if (entradas.length === 0) {
    document.getElementById("inventario").textContent = "—";
  } else {
    document.getElementById("inventario").textContent =
      entradas.map(([nombre, cant]) => `🍎 x${cant}`).join(" · ");
  }
}