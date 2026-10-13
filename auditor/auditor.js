// ═══ AUDITOR DE SEMILLAS ═══

const auditor = {
  semilla: "test_mundo_01",
  chunks: [],
  seleccionado: null,
  pegados: 3
};

const EMOJI_BIOMA = {
  bosque:  "🌳",
  pradera: "🌿",
  costa:   "🌊",
  ruina:   "🧱"
};

// ═══ 1 · GENERAR CHUNKS ═══
function generarChunks(semilla, oeste, este) {
  const chunks = [];
  for (let i = oeste; i >= 1; i--) chunks.push(generarUnChunk(semilla, -i));
  for (let z = 0; z < este; z++)    chunks.push(generarUnChunk(semilla, z));
  return chunks;
}
function generarUnChunk(semilla, zona) {
  const r = generarPantallaValida(semilla, zona);
  return { zona, bioma: r.bioma, mapa: r.mapa, intentos: r.intentos };
}

// ═══ 2 · FRANJA ═══
function renderFranja() {
  const cont = document.getElementById("franja-chunks");
  cont.innerHTML = "";
  if (auditor.chunks.length === 0) {
    cont.innerHTML = '<p style="color:#555;margin:auto">Sin chunks generados.</p>';
    return;
  }
  for (const c of auditor.chunks) {
    const div = document.createElement("div");
    div.className = "chunk" + (c.zona === auditor.seleccionado ? " seleccionado" : "");
    div.innerHTML = `
      <div class="emoji">${EMOJI_BIOMA[c.bioma] || "❓"}</div>
      <div class="zona">zona ${c.zona}</div>
      <div class="meta">${c.bioma}</div>
      <div class="meta">${c.intentos === 0 ? "✓ directo" : "↻ " + c.intentos + " retry"}</div>
    `;
    div.addEventListener("click", () => {
      auditor.seleccionado = c.zona;
      renderFranja();
      renderGrilla();
    });
    cont.appendChild(div);
  }
}

// ═══ 3 · GRILLA ═══
function renderGrilla() {
  const panel = document.getElementById("panel-grilla");
  if (auditor.seleccionado === null) {
    panel.innerHTML = '<p class="vacio">Hacé click en un chunk para ver su grilla.</p>';
    return;
  }
  const c = auditor.chunks.find(x => x.zona === auditor.seleccionado);
  if (!c) {
    panel.innerHTML = '<p class="vacio">Chunk no encontrado.</p>';
    return;
  }

  const mitad = Math.floor(auditor.pegados / 2);

// Correr ventana: si el seleccionado está cerca de un borde
// de lo generado, desplazamos el rango para mostrar siempre
// `pegados` chunks válidos.
const zonas = auditor.chunks.map(x => x.zona).sort((a, b) => a - b);
const min = zonas[0];
const max = zonas[zonas.length - 1];
const total = zonas.length;

let inicio;
if (total <= auditor.pegados) {
  inicio = min;
} else {
  inicio = c.zona - mitad;
  if (inicio < min) inicio = min;
  if (inicio + auditor.pegados - 1 > max) inicio = max - auditor.pegados + 1;
}

let html = `<h2>Zona ${c.zona} · Bioma: ${c.bioma}`;
html += ` · ${c.mapa[0].length}×${c.mapa.length}`;
html += ` · ${c.intentos === 0 ? "sin reintentos" : c.intentos + " reintentos"}`;
html += `</h2>`;

html += `<div class="fila-grillas">`;

for (let i = 0; i < auditor.pegados; i++) {
  const zona = inicio + i;
  if (i > 0) html += `<div class="columna-union"></div>`;

  const chunk = auditor.chunks.find(x => x.zona === zona);
  if (!chunk) continue;

  const esActual = (zona === c.zona);
  html += `<div class="grilla-wrapper">`;
  html += `<div class="etiqueta ${esActual ? "actual" : ""}">zona ${zona} · ${chunk.bioma}</div>`;
  html += `<div class="grilla" style="
    --tam-celda: ${TAMANO_CELDA / 2}px;
    --font-emoji: ${FONT_EMOJI / 2}px;
    grid-template-columns: repeat(${chunk.mapa[0].length}, ${TAMANO_CELDA / 2}px);
  ">`;
  for (let y = 0; y < chunk.mapa.length; y++) {
    for (let x = 0; x < chunk.mapa[y].length; x++) {
      const emoji = ICONOS[chunk.mapa[y][x]] || "?";
      html += `<div class="celda">${emoji}</div>`;
    }
  }
  html += `</div></div>`;
}

html += `</div>`;
panel.innerHTML = html;
}

// ═══ 4 · EVENTOS ═══
function generarDesdeInputs() {
  const semilla = document.getElementById("input-semilla").value.trim() || "test_mundo_01";
  const oeste = Math.max(0, parseInt(document.getElementById("input-oeste").value) || 0);
  const este = Math.max(1, parseInt(document.getElementById("input-este").value) || 10);
  const pegados = parseInt(document.getElementById("select-pegados").value) || 3;

  auditor.semilla = semilla;
  auditor.pegados = pegados;
  auditor.chunks = generarChunks(semilla, oeste, este);
  auditor.seleccionado = null;

  renderFranja();
  renderGrilla();
}

function init() {
  document.getElementById("btn-generar").addEventListener("click", generarDesdeInputs);
  document.getElementById("input-semilla").addEventListener("keydown", (e) => {
    if (e.key === "Enter") generarDesdeInputs();
  });
  document.getElementById("select-pegados").addEventListener("change", (e) => {
    auditor.pegados = parseInt(e.target.value) || 3;
    renderGrilla();
  });
  generarDesdeInputs();
}

document.addEventListener("DOMContentLoaded", init);