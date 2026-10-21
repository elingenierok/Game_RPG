// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.13 · BARRA DE TIMING (v2.7-alpha · F28.2)
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
//      modo: "ataque",               // "ataque" | "defensa"
//      pista: "Espacio para atacar",
//      zonaPerfecta: 20,             // % total del centro
//      zonaAceptable: 15,            // % extra a cada lado
//      onResultado: (precision) => { ... }
//    });
//
//  Zonas visuales por defecto:
//    0-25%    rojo     (miss)
//    25-40%   naranja  (aceptable)
//    40-60%   verde    (perfecto)
//    60-75%   naranja  (aceptable)
//    75-100%  rojo     (miss)
//
//  Los ataques de mob pueden variar duracionMs y el ancho de zonas.
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
  let timeoutFeedback = null;
  let zonaPerfecta = 20;
  let zonaAceptable = 15;

  function limitar(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(maximo, valor));
  }

  // ─── Iniciar el minijuego ───
  function iniciar(opciones) {
    if (activo) return;
    if (timeoutFeedback) {
      clearTimeout(timeoutFeedback);
      timeoutFeedback = null;
    }
    activo = true;
    duracion = opciones.duracionMs || 1500;
    onResultado = opciones.onResultado || (() => {});

    const perfecta = Number(opciones.zonaPerfecta);
    const aceptable = Number(opciones.zonaAceptable);
    zonaPerfecta = limitar(Number.isFinite(perfecta) ? perfecta : 20, 4, 80);
    zonaAceptable = limitar(
      Number.isFinite(aceptable) ? aceptable : 15,
      0,
      (100 - zonaPerfecta) / 2
    );

    crearUI(opciones.titulo || "¡Apretá Espacio!", opciones.modo, opciones.pista);
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
  function crearUI(titulo, modo, pista) {
    const esDefensa = modo === "defensa";
    const claseModo = esDefensa ? "modo-defensa" : "modo-ataque";
    const icono = esDefensa ? "🛡️" : "⚔️";
    const etiqueta = esDefensa ? "DEFENSA" : "ATAQUE";
    const hint = pista || (esDefensa ? "Espacio para bloquear" : "Espacio para atacar");
    const zonaRoja = Math.max(0, (100 - zonaPerfecta - zonaAceptable * 2) / 2);

    contenedor = document.createElement("div");
    contenedor.id = "barra-timing-overlay";
    contenedor.innerHTML = `
      <div id="barra-timing-panel" class="${claseModo}" style="--zona-perfecta: ${zonaPerfecta}%; --zona-aceptable: ${zonaAceptable}%; --zona-roja: ${zonaRoja}%;">
        <div id="barra-timing-icono" aria-hidden="true">${icono}</div>
        <div id="barra-timing-contenido">
          <div id="barra-timing-modo">${etiqueta}</div>
          <div id="barra-timing-titulo">${titulo}</div>
          <div id="barra-timing-barra">
            <div class="zona roja-izq"></div>
            <div class="zona naranja-izq"></div>
            <div class="zona verde"></div>
            <div class="zona naranja-der"></div>
            <div class="zona roja-der"></div>
            <div id="barra-timing-marcador"></div>
          </div>
          <div id="barra-timing-hint">${hint}</div>
        </div>
      </div>
    `;
    document.body.appendChild(contenedor);
    marcador = document.getElementById("barra-timing-marcador");

    // Click en el panel central cuenta como apretar.
    // La capa de fondo no recibe clicks (pointer-events: none), así
    // el botón Huir del combate sigue siendo clickeable.
    const panel = document.getElementById("barra-timing-panel");
    if (panel) panel.addEventListener("click", apretar);
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
    terminar(calcularPrecision(posicion));
  }

  // La zona perfecta vale 0.8-1.0; la aceptable baja de 0.8 a 0.4;
  // el resto de la barra cae de 0.4 a 0.
  function calcularPrecision(posicion) {
    const distancia = Math.abs(posicion - 50);
    const mitadPerfecta = zonaPerfecta / 2;
    const finAceptable = mitadPerfecta + zonaAceptable;

    if (distancia <= mitadPerfecta) {
      return 1 - (distancia / Math.max(0.001, mitadPerfecta)) * 0.2;
    }

    if (distancia <= finAceptable) {
      return 0.8 - ((distancia - mitadPerfecta) / Math.max(0.001, zonaAceptable)) * 0.4;
    }

    const resto = 50 - finAceptable;
    if (resto <= 0) return 0;
    return Math.max(0, 0.4 - ((distancia - finAceptable) / resto) * 0.4);
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
    timeoutFeedback = setTimeout(() => {
      timeoutFeedback = null;
      if (contenedor && contenedor.parentNode) {
        contenedor.parentNode.removeChild(contenedor);
      }
      contenedor = null;
      marcador = null;

      const callback = onResultado;
      onResultado = null;
      if (typeof callback === "function") callback(precision);
    }, 400);
  }

  // ─── Clase CSS según la precisión ───
  function claseDePrecision(p) {
    if (p >= 0.8) return "perfecto";
    if (p >= 0.4) return "aceptable";
    return "fallo";
  }

  // ─── Cancelar el minijuego sin disparar callback ───
  function cancelar() {
    activo = false;

    if (timeoutFeedback) {
      clearTimeout(timeoutFeedback);
      timeoutFeedback = null;
    }

    if (frameId) { cancelAnimationFrame(frameId); frameId = null; }
    if (teclaHandler) {
      document.removeEventListener("keydown", teclaHandler);
      teclaHandler = null;
    }

    if (contenedor && contenedor.parentNode) {
      contenedor.parentNode.removeChild(contenedor);
    }
    contenedor = null;
    marcador = null;
    onResultado = null;
  }

  return { iniciar, cancelar };
})();