// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.18 · MENÚ DEL JUGADOR (F30)
// ─────────────────────────────────────────────────────────────────
//  Menú único con pestañas: Personaje, Habilidades, Inventario
//  y Misiones (placeholder para F32).
// ═══════════════════════════════════════════════════════════════

const MenuJugador = (() => {
  const PESTANAS = [
    { id: "personaje", nombre: "Personaje", icono: "👤" },
    { id: "habilidades", nombre: "Habilidades", icono: "🌟" },
    { id: "inventario", nombre: "Inventario", icono: "🎒" },
    { id: "misiones", nombre: "Misiones", icono: "📜" },
  ];

  let abierto = false;
  let pestanaActiva = "personaje";
  let pausaPrevia = false;
  let overlay = null;
  let contenido = null;
  let tabs = null;

  function crearUI() {
    if (overlay) return;

    overlay = document.createElement("div");
    overlay.id = "menu-jugador-overlay";
    overlay.className = "menu-jugador-overlay";
    overlay.innerHTML = `
      <div class="menu-jugador-panel" role="dialog" aria-modal="true" aria-label="Menú del jugador">
        <div class="menu-jugador-cabecera">
          <div class="menu-jugador-titulo-grupo">
            <span class="menu-jugador-titulo">👤 Jugador</span>
            <span id="menu-jugador-nivel" class="menu-jugador-nivel">Nv. 1</span>
          </div>
          <button id="menu-jugador-cerrar" class="menu-jugador-cerrar" title="Cerrar menú">✕</button>
        </div>
        <div class="menu-jugador-xp">
          <span>⭐ XP disponible: <strong id="menu-jugador-xp">0</strong></span>
          <span>XP total: <strong id="menu-jugador-xp-total">0</strong></span>
        </div>
        <div id="menu-jugador-tabs" class="menu-jugador-tabs"></div>
        <div id="menu-jugador-contenido" class="menu-jugador-contenido"></div>
        <div class="menu-jugador-pie">I o Esc para cerrar · cada rango comprado sube 1 nivel</div>
      </div>
    `;
    document.body.appendChild(overlay);

    contenido = document.getElementById("menu-jugador-contenido");
    tabs = document.getElementById("menu-jugador-tabs");

    document.getElementById("menu-jugador-cerrar").addEventListener("click", cerrar);
    overlay.addEventListener("mousedown", (e) => {
      if (e.target === overlay) cerrar();
    });

    tabs.addEventListener("click", (e) => {
      const boton = e.target.closest("[data-pestana]");
      if (!boton) return;
      pestanaActiva = boton.dataset.pestana;
      render();
    });

    contenido.addEventListener("click", (e) => {
      const boton = e.target.closest("[data-comprar]");
      if (!boton) return;
      const id = boton.dataset.comprar;
      const resultado = Progresion.comprarHabilidad(id);
      if (!resultado.ok) {
        if (resultado.motivo === "xp") {
          mostrarAviso(`Faltan ${resultado.faltante} XP`);
        } else if (resultado.motivo === "maximo") {
          mostrarAviso("Habilidad al máximo");
        }
        return;
      }
      mostrarAviso(`+1 rango · Nv. ${resultado.nivel}`);
      render();
    });
  }

  function mostrarAviso(texto) {
    if (typeof mostrarCartelRapido === "function") mostrarCartelRapido(texto);
  }

  function estaBloqueado() {
    if (estado.ganado) return true;
    if (typeof estadoCombate !== "undefined") {
      if (estadoCombate.activo || estadoCombate.victoria || estadoCombate.derrota) return true;
    }
    if (typeof rotura !== "undefined" && rotura.activa) return true;
    const overlayGeneral = document.getElementById("overlay");
    if (overlayGeneral && overlayGeneral.classList.contains("visible")) return true;
    return false;
  }

  function abrir(pestana) {
    if (abierto) return;
    if (estaBloqueado()) {
      mostrarAviso("No podés abrir el menú ahora");
      return;
    }

    crearUI();
    abierto = true;
    pausaPrevia = estado.pausado;
    estado.pausado = true;
    if (pestana && PESTANAS.some((p) => p.id === pestana)) pestanaActiva = pestana;
    overlay.classList.add("visible");
    render();
  }

  function cerrar() {
    if (!abierto) return;
    abierto = false;
    overlay.classList.remove("visible");
    estado.pausado = pausaPrevia;
  }

  function alternar() {
    if (abierto) cerrar();
    else abrir();
  }

  function actualizarBoton() {
    const boton = document.getElementById("btn-jugador");
    if (!boton) return;
    const resumen = Progresion.obtenerResumen();
    boton.textContent = `👤 Nv.${resumen.nivel}`;
    boton.title = `Menú del jugador · ${resumen.xp} XP`;
  }

  function render() {
    if (!overlay) return;

    const resumen = Progresion.obtenerResumen();
    document.getElementById("menu-jugador-nivel").textContent = `Nv. ${resumen.nivel}`;
    document.getElementById("menu-jugador-xp").textContent = resumen.xp;
    document.getElementById("menu-jugador-xp-total").textContent = resumen.xpTotal;

    tabs.innerHTML = PESTANAS.map((p) => `
      <button class="menu-jugador-tab ${p.id === pestanaActiva ? "activa" : ""}" data-pestana="${p.id}">
        ${p.icono} ${p.nombre}
      </button>
    `).join("");

    if (pestanaActiva === "personaje") renderPersonaje(resumen);
    else if (pestanaActiva === "habilidades") renderHabilidades();
    else if (pestanaActiva === "inventario") renderInventario();
    else renderMisiones();

    actualizarBoton();
  }

  function renderPersonaje(resumen) {
    contenido.innerHTML = `
      <div class="menu-stats">
        ${tarjetaStat("⭐ Nivel", resumen.nivel, "Cada rango comprado suma 1")}
        ${tarjetaStat("❤️ Vida", `${Math.ceil(resumen.hp)} / ${resumen.hpMax}`, "2 HP por corazón")}
        ${tarjetaStat("⚔️ Ataque", resumen.ataque, "Daño base")}
        ${tarjetaStat("🛡️ Defensa", resumen.defensa, "Reduce daño recibido")}
        ${tarjetaStat("👟 Velocidad", `x${resumen.velocidad.toFixed(2)}`, "Caminata")}
        ${tarjetaStat("⛏️ Rotura", `x${resumen.multiplicadorRotura.toFixed(2)}`, "Hacha y pico")}
      </div>
      <div class="menu-nota">La XP se gasta en la pestaña Habilidades. No hay niveles automáticos: cada compra sube el nivel.</div>
    `;
  }

  function tarjetaStat(titulo, valor, detalle) {
    return `
      <div class="menu-stat">
        <span class="menu-stat-titulo">${titulo}</span>
        <strong class="menu-stat-valor">${valor}</strong>
        <span class="menu-stat-detalle">${detalle}</span>
      </div>
    `;
  }

  function renderHabilidades() {
    const habilidades = Progresion.obtenerHabilidades();
    contenido.innerHTML = `
      <div class="menu-habilidades">
        ${habilidades.map((h) => {
          const rangos = Array.from({ length: h.max }, (_, i) => `<span class="menu-rango ${i < h.rango ? "lleno" : ""}"></span>`).join("");
          const textoBoton = h.max ? "Máximo" : `Comprar · ${h.costo} XP`;
          return `
            <div class="menu-habilidad ${h.max ? "maxima" : ""}">
              <div class="menu-habilidad-icono">${h.icono}</div>
              <div class="menu-habilidad-info">
                <div class="menu-habilidad-titulo">${h.nombre} <span>${h.rango}/${h.max}</span></div>
                <div class="menu-habilidad-desc">${h.descripcion}</div>
                <div class="menu-rangos">${rangos}</div>
              </div>
              <button class="menu-comprar" data-comprar="${h.id}" ${h.puedeComprar ? "" : "disabled"}>${textoBoton}</button>
            </div>
          `;
        }).join("")}
      </div>
      <div class="menu-nota">La XP se gana al vencer mobs. Los drops reales también llegan con F13.</div>
    `;
  }

  function renderInventario() {
    const items = typeof listarInventario === "function" ? listarInventario() : [];
    if (items.length === 0) {
      contenido.innerHTML = `
        <div class="menu-vacio">🎒 El inventario está vacío.</div>
        <div class="menu-nota">Recogé equipables del mundo o vencé mobs para conseguir materiales.</div>
      `;
      return;
    }

    contenido.innerHTML = `
      <div class="menu-inventario">
        ${items.map((item) => `
          <div class="menu-item">
            <span class="menu-item-icono">${item.icono}</span>
            <span class="menu-item-info">
              <strong>${item.nombre}</strong>
              <small>${item.tipo}</small>
            </span>
            <span class="menu-item-cantidad">x${item.cantidad}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderMisiones() {
    contenido.innerHTML = `
      <div class="menu-vacio">📜 Todavía no hay misiones.</div>
      <div class="menu-nota">El sistema de misiones y campaña por etapas está planificado para F32.</div>
    `;
  }

  function actualizar() {
    if (abierto) render();
    else actualizarBoton();
  }

  function conectarBotones() {
    const boton = document.getElementById("btn-jugador");
    if (boton) boton.addEventListener("click", alternar);

    document.addEventListener("keydown", (e) => {
      if (e.repeat) return;
      const objetivo = e.target;
      const escribiendo = objetivo && (
        objetivo.tagName === "INPUT" ||
        objetivo.tagName === "TEXTAREA" ||
        objetivo.tagName === "SELECT" ||
        objetivo.isContentEditable
      );
      if (escribiendo) return;

      const k = e.key.toLowerCase();
      if (k === "escape" && abierto) {
        e.preventDefault();
        cerrar();
        return;
      }
      if (k === "i") {
        e.preventDefault();
        alternar();
      }
    });
  }

  function inicializar() {
    crearUI();
    conectarBotones();
    actualizarBoton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializar);
  } else {
    inicializar();
  }

  return {
    abrir,
    cerrar,
    alternar,
    actualizar,
    estaAbierto: () => abierto,
  };
})();

window.MenuJugador = MenuJugador;
