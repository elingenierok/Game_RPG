// ═══════════════════════════════════════════════════════════════
//  BLOQUE 16 · INICIO
// ═══════════════════════════════════════════════════════════════

// ─── Botón de cambio de tema ───
(function initBotonTema() {
  const btn = document.getElementById("btn-tema");
  if (!btn) return;
  btn.textContent = TEMA_ACTIVO === "tierra" ? "🚀 Ir a Espacio" : "🌍 Ir a Tierra";
  btn.addEventListener("click", () => {
    const nuevo = TEMA_ACTIVO === "tierra" ? "espacio" : "tierra";
    localStorage.setItem("tema", nuevo);
    location.reload();
  });
})();

// ─── Texto de ayuda según tema ───
(function initAyuda() {
  const span = document.getElementById("ayuda-objetivo");
  if (!span) return;
  span.textContent = TEMA_ACTIVO === "tierra"
    ? "Buscá la 🔑 para ganar"
    : "Buscá la 🔋 para ganar";
})();

// Inicializar el jugador (busca spawn en el chunk 0,0)
inicializarJugador();

// Flag para no duplicar el loop
let _loopIniciado = false;

// Loop principal: actualiza animaciones y renderiza
function loop() {
  if (typeof actualizarJugador === "function") actualizarJugador();
  if (typeof sincronizarCamara === "function") sincronizarCamara();

  // Si el jugador está quieto y hay una tecla apretada, mover
  if (!estado.jugador.animando) {
    const dir = obtenerDireccionActual();
    if (dir) intentarMover(dir.dx, dir.dy);
  }

  render();
  requestAnimationFrame(loop);
}

// Arrancar el loop (una sola vez)
if (!_loopIniciado) {
  _loopIniciado = true;
  loop();
}

console.log("🌱 Semilla:", SEMILLA);
console.log("🔑 Llave:", estado.llave.wx + "," + estado.llave.wy);

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 17 · REINICIO CON NUEVA SEMILLA
// ═══════════════════════════════════════════════════════════════
function reiniciarMundo(nuevaSemilla) {
  SEMILLA = nuevaSemilla;
  SEMILLA_MOBS = Date.now();
  SEMILLA_OBJETOS = SEMILLA;

  limpiarCacheBiomas();
  cacheChunks.clear();

  estado.jugador.wx = 0;
  estado.jugador.wy = 0;
  estado.jugador.inicializado = false;
  estado.jugador.animando = false;
  estado.jugador.mirandoIzquierda = false;
  estado.ganado = false;
  estado.inventario = {};
  estado.itemsRecogidos = new Set();

  document.getElementById("overlay").classList.remove("visible");

  inicializarJugador();

  console.log("🌱 Nueva semilla:", SEMILLA);
}

// ─── Listeners de UI ───
const btnAplicar = document.getElementById("btn-aplicar");
const btnRandom  = document.getElementById("btn-random");
const inputSem   = document.getElementById("input-semilla");

if (btnAplicar) btnAplicar.addEventListener("click", () => {
  const s = inputSem.value.trim();
  if (s.length > 0) reiniciarMundo(s);
});

if (btnRandom) btnRandom.addEventListener("click", () => {
  const nueva = "mundo_" + Math.floor(Math.random() * 999999);
  inputSem.value = nueva;
  reiniciarMundo(nueva);
});

if (inputSem) inputSem.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const s = inputSem.value.trim();
    if (s.length > 0) reiniciarMundo(s);
  }
});