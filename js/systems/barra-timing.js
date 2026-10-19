// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.13 · BARRA DE TIMING (v2.5-alpha · F28)
// ─────────────────────────────────────────────────────────────────
//  Minijuego de precisión. Muestra una barra horizontal con un
//  marcador que recorre de izquierda a derecha en duracionMs.
//  El jugador aprieta Espacio (o click en el panel).
//
//  Resultado: precisión de 0 a 1 según qué tan cerca del centro
//  (50%) estaba el marcador al apretar.
//
//  Uso:
//    BarraTiming.iniciar({
//      duracionMs: 1500,
//      titulo: "¡Apretá Espacio!",
//      onResultado: (precision) => { ... }
//    });
//
//  Zonas visuales:
//    0-25%    rojo     (miss)
//    25-40%   naranja  (aceptable)
//    40-60%   verde    (perfecto)
//    60-75%   naranja  (aceptable)
//    75-100%  rojo     (miss)
// ═══════════════════════════════════════════════════════════════

window.BarraTiming = (() => {
  let activo = false;
  let inicio = 0;
  let duracion = 1500;
  let onResultado = null;
  let frameId = null;
  let teclaHandler = null;
  let contenedor = null;
  let marcador = null;

  // ─── Iniciar el minijuego ───
  function iniciar(opciones) {
    if (activo) return;
    activo = true;
    duracion = opciones.duracionMs || 1500;
    onResultado = opciones.onResultado || (() => {});

    crearUI(opciones.titulo || "¡Apretá Espacio!");
    inicio = performance.now();
    animar();

    teclaHandler = (e) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        apretar();
      }
    };
    document.addEventListener("keydown", teclaHandler);
  }

  // ─── Crear el DOM del minijuego ───
  function crearUI(titulo) {
    contenedor = document.createElement("div");
    contenedor.id = "barra-timing-overlay";
    contenedor.innerHTML = `
      <div id="barra-timing-panel">
        <div id="barra-timing-titulo">${titulo}</div>
        <div id="barra-timing-barra">
          <div class="zona roja-izq"></div>
          <div class="zona naranja-izq"></div>
          <div class="zona verde"></div>
          <div class="zona naranja-der"></div>
          <div class="zona roja-der"></div>
          <div id="barra-timing-marcador"></div>
        </div>
        <div id="barra-timing-hint">Espacio para apretar</div>
      </div>
    `;
    document.body.appendChild(contenedor);
    marcador = document.getElementById("barra-timing-marcador");

    // Click en el panel también cuenta como apretar
    contenedor.addEventListener("click", apretar);
  }

  // ─── Animar el marcador ───
  function animar() {
    if (!activo) return;

    const transcurrido = performance.now() - inicio;
    const progreso = Math.min(1, transcurrido / duracion);

    if (marcador) {
      marcador.style.left = (progreso * 100) + "%";
    }

    if (progreso >= 1) {
      terminar(0);  // miss automático
      return;
    }

    frameId = requestAnimationFrame(animar);
  }

  // ─── Apretar (Espacio o click) ───
  function apretar() {
    if (!activo) return;

    const transcurrido = performance.now() - inicio;
    const posicion = Math.min(100, (transcurrido / duracion) * 100);
    const distanciaAlCentro = Math.abs(posicion - 50);
    const precision = Math.max(0, 1 - distanciaAlCentro / 50);

    terminar(precision);
  }

  // ─── Terminar y llamar callback ───
  function terminar(precision) {
    activo = false;

    if (frameId) { cancelAnimationFrame(frameId); frameId = null; }
    if (teclaHandler) {
      document.removeEventListener("keydown", teclaHandler);
      teclaHandler = null;
    }

    // Feedback visual: cambiar color del borde del panel
    const panel = document.getElementById("barra-timing-panel");
    if (panel) {
      panel.classList.add(claseDePrecision(precision));
    }

    // Esperar un momento para que se vea el feedback
    setTimeout(() => {
      if (contenedor && contenedor.parentNode) {
        contenedor.parentNode.removeChild(contenedor);
      }
      contenedor = null;
      marcador = null;
      onResultado(precision);
    }, 400);
  }

  // ─── Clase CSS según la precisión ───
  function claseDePrecision(p) {
    if (p >= 0.8) return "perfecto";
    if (p >= 0.4) return "aceptable";
    return "fallo";
  }

  return { iniciar };
})();