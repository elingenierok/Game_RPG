// ═══ AUDITOR DE SEMILLAS (2D) ═══

const auditor = {
  semilla: "test_mundo_01",
  chunks: [],
  ancho: 5,
  alto: 5,
  cx: 0,
  cy: 0
};

// ═══ 1 · GENERAR MATRIZ DE CHUNKS ═══
function generarChunks(semilla, cx0, cy0, ancho, alto) {
  const chunks = [];
  const xIni = cx0 - Math.floor(ancho / 2);
  const yIni = cy0 - Math.floor(alto / 2);
  for (let j = 0; j < alto; j++) {
    for (let i = 0; i < ancho; i++) {
      const cx = xIni + i;
      const cy = yIni + j;
      const r = generarPantalla(semilla, cx, cy);
      chunks.push({ cx, cy, bioma: r.bioma, mapa: r.mapa });
    }
  }
  return chunks;
}

// ═══ 2 · MAPA DE BIOMAS ═══
function renderMapaBiomas() {
  const cont = document.getElementById("matriz-simplificada");
  cont.innerHTML = "";

  const xIni = Math.min(...auditor.chunks.map(c => c.cx));
  const yIni = Math.min(...auditor.chunks.map(c => c.cy));

  const wrapper = document.createElement("div");
  wrapper.className = "matriz-con-ejes";

  const ejeY = document.createElement("div");
  ejeY.className = "eje-y";
  for (let j = 0; j < auditor.alto; j++) {
    const celda = document.createElement("div");
    celda.className = "eje-celda";
    celda.textContent = yIni + j;
    ejeY.appendChild(celda);
  }
  wrapper.appendChild(ejeY);

  const bloque = document.createElement("div");
  bloque.className = "bloque-matriz";

  const ejeX = document.createElement("div");
  ejeX.className = "eje-x";
  ejeX.style.gridTemplateColumns = `repeat(${auditor.ancho}, 1fr)`;
  for (let i = 0; i < auditor.ancho; i++) {
    const celda = document.createElement("div");
    celda.className = "eje-celda";
    celda.textContent = xIni + i;
    ejeX.appendChild(celda);
  }
  bloque.appendChild(ejeX);

  const grid = document.createElement("div");
  grid.className = "grid-biomas";
  grid.style.gridTemplateColumns = `repeat(${auditor.ancho}, 1fr)`;

  for (const c of auditor.chunks) {
    const div = document.createElement("div");
    div.className = "bioma-celda";
    const emoji = (BIOMAS[c.bioma] && BIOMAS[c.bioma].emoji) || "❓";

    let iconosEquip = "";
    try {
      const equipables = generarEquipablesDeChunk(c.cx, c.cy);
      if (equipables && equipables.length > 0) {
        iconosEquip = equipables.map(e => (e.id ? obtenerDatosItem(e.id).icono : ICONOS[e.tipo]) || "?").join(" ");
      }
    } catch (err) {
      console.error("[auditor] error equipables en", c.cx, c.cy, err);
    }

    div.innerHTML = `
      <div class="emoji">${emoji}</div>
      <div class="nombre">${c.bioma}</div>
      ${iconosEquip ? `<div class="equip">${iconosEquip}</div>` : ""}
    `;
    div.addEventListener("click", () => centrarEnChunk(c.cx, c.cy));
    grid.appendChild(div);
  }
  bloque.appendChild(grid);
  wrapper.appendChild(bloque);
  cont.appendChild(wrapper);
}

// ═══ 3 · MUNDO GENERADO ═══
function renderMundo() {
  const cont = document.getElementById("mundo");
  cont.innerHTML = "";

  const ESCALA = TAMANO_CELDA / 4;
  const ANCHO_CELDA = ANCHO_CHUNK * ESCALA;
  const ALTO_CELDA  = ALTO_CHUNK  * ESCALA;
  const GAP = 1;

  cont.style.gridTemplateColumns = `repeat(${auditor.ancho}, ${ANCHO_CELDA}px)`;
  cont.style.gap = GAP + "px";

  for (const c of auditor.chunks) {
    const chunkDiv = document.createElement("div");
    chunkDiv.className = "chunk-mundo";
    chunkDiv.dataset.cx = c.cx;
    chunkDiv.dataset.cy = c.cy;
    chunkDiv.style.gridTemplateColumns = `repeat(${ANCHO_CHUNK}, ${ESCALA}px)`;
    chunkDiv.style.width = ANCHO_CELDA + "px";
    chunkDiv.style.height = ALTO_CELDA + "px";

    for (let y = 0; y < c.mapa.length; y++) {
      for (let x = 0; x < c.mapa[y].length; x++) {
        const celda = document.createElement("div");
        celda.className = "celda-mundo";
        celda.style.width = ESCALA + "px";
        celda.style.height = ESCALA + "px";
        celda.style.fontSize = (FONT_EMOJI / 4) + "px";
        celda.textContent = ICONOS[c.mapa[y][x]] || "?";
        chunkDiv.appendChild(celda);
      }
    }
    cont.appendChild(chunkDiv);
  }
}

// ═══ 4 · CENTRAR EN CHUNK ═══
function centrarEnChunk(cx, cy) {
  const wrapper = document.getElementById("mundo-wrapper");
  const target = document.querySelector(`.chunk-mundo[data-cx="${cx}"][data-cy="${cy}"]`);
  if (!target) return;
  const wr = wrapper.getBoundingClientRect();
  const tr = target.getBoundingClientRect();
  wrapper.scrollLeft += (tr.left - wr.left) - (wr.width - tr.width) / 2;
  wrapper.scrollTop  += (tr.top  - wr.top)  - (wr.height - tr.height) / 2;
}

// ═══ 5 · SEMILLA ALEATORIA ═══
function semillaAleatoria() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < 12; i++) s += chars[Math.floor(Math.random() * chars.length)];
  document.getElementById("input-semilla").value = s;
  generarDesdeInputs();
}

// ═══ 6 · EVENTOS ═══
function generarDesdeInputs() {
  const semilla = document.getElementById("input-semilla").value.trim() || "test_mundo_01";
  const ancho = Math.min(10, Math.max(1, parseInt(document.getElementById("input-ancho").value) || 5));
  const alto  = Math.min(10, Math.max(1, parseInt(document.getElementById("input-alto").value)  || 5));
  const cx = parseInt(document.getElementById("input-cx").value) || 0;
  const cy = parseInt(document.getElementById("input-cy").value) || 0;

  if (typeof limpiarCacheBiomas === "function") limpiarCacheBiomas();

  auditor.semilla = semilla;
  auditor.ancho = ancho;
  auditor.alto  = alto;
  auditor.cx = cx;
  auditor.cy = cy;
  auditor.chunks = generarChunks(semilla, cx, cy, ancho, alto);

  renderMapaBiomas();
  renderMundo();
}

function init() {
  document.getElementById("btn-generar").addEventListener("click", generarDesdeInputs);
  document.getElementById("btn-random").addEventListener("click", semillaAleatoria);
  document.getElementById("input-semilla").addEventListener("keydown", (e) => {
    if (e.key === "Enter") generarDesdeInputs();
  });
  generarDesdeInputs();
}

document.addEventListener("DOMContentLoaded", init);