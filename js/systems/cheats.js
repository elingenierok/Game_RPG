// ═══════════════════════════════════════════════════════════════
//  BLOQUE 99 · CHEATS (TEMPORAL · BORRAR ANTES DE PRODUCCIÓN)
// ─────────────────────────────────────────────────────────────────
//  Para test rápido. Se borra cuando el juego esté estable.
//
//  Para eliminar:
//    1. Borrar este archivo.
//    2. Borrar <script src="js/systems/cheats.js"> del index.html.
//    3. Borrar <button id="btn-cheat">...</button> del index.html.
//    4. Borrar el bloque CSS #btn-cheat del estilo.css.
// ═══════════════════════════════════════════════════════════════

function initCheats() {
  const btn = document.getElementById("btn-cheat");
  if (!btn) return;
  btn.addEventListener("click", toggleCheatEquipables);
}

// Prueba rápida de combate desde consola:
//   debugCombate("cerdo", "ATAQUE_8")
// Usa 100 HP para poder probar el combo sin matar al mob en 2 golpes.
function debugCombate(tipo = "cerdo", ataque = "ATAQUE_8") {
  if (typeof iniciarCombate !== "function" || typeof MOBS === "undefined" || !MOBS[tipo]) {
    return "No se pudo iniciar: mob o combate no disponible.";
  }

  const hp = 100;
  iniciarCombate({
    ...MOBS[tipo],
    tipo,
    hp,
    hpActual: hp,
    hpMax: hp,
    ataques: [ataque],
  });

  return `Combate de prueba: ${MOBS[tipo].nombre} con ${ataque} (${hp} HP)`;
}

window.debugCombate = debugCombate;

// Prueba rápida de progresión desde consola:
//   debugXP(500)
function debugXP(cantidad = 100) {
  if (typeof Progresion === "undefined") return "Progresión no disponible.";
  const otorgada = Progresion.otorgarXP(cantidad);
  return `+${otorgada} XP · total disponible: ${Progresion.obtenerResumen().xp}`;
}

window.debugXP = debugXP;

// Prueba rápida de herramientas desde consola:
//   debugHerramienta("HACHA", 3)
function debugHerramienta(tipo = "HACHA", nivel = 3) {
  if (typeof Equipamiento === "undefined") return "Equipamiento no disponible.";
  const resultado = Equipamiento.recogerAccion(tipo, nivel);
  if (typeof actualizarHUD === "function") actualizarHUD();
  return resultado.ok
    ? `${resultado.item.nombre} (Nv. ${resultado.item.nivel}) equipada`
    : `No se pudo equipar ${tipo} Nv. ${nivel}`;
}

// Prueba rápida de equipo desde consola:
//   debugEquipo(2)
function debugEquipo(nivel = 1) {
  if (typeof Equipamiento === "undefined") return "Equipamiento no disponible.";
  const resultados = Equipamiento.SLOTS.map((slot) => {
    const id = Equipamiento.idEquipo(slot, nivel);
    return id ? Equipamiento.recogerEquipo(id) : null;
  }).filter(Boolean);

  if (typeof actualizarHUD === "function") actualizarHUD();
  const ok = resultados.filter((r) => r.ok);
  return ok.length > 0
    ? `Equipables al inventario: ${ok.map((r) => r.item.nombre).join(", ")}`
    : "No se pudo generar equipo.";
}

// Prueba rápida de visión/rotura desde consola:
//   debugVision()
function debugVision() {
  if (typeof Progresion === "undefined") return "Progresión no disponible.";
  const r = Progresion.obtenerResumen();
  return `👁 Visión +${r.vision} · ⛏ H x${r.roturaHacha.toFixed(2)} · P x${r.roturaPico.toFixed(2)}`;
}

window.debugHerramienta = debugHerramienta;
window.debugEquipo = debugEquipo;
window.debugVision = debugVision;

// Prueba rápida del ciclo día-noche desde consola:
//   debugCiclo("noche")  ·  debugNoche()  ·  debugDia()
function debugCiclo(fase = "noche", progreso = 0) {
  if (typeof Ciclo === "undefined") return "Ciclo no disponible.";
  Ciclo.saltarA(fase, progreso);
  return `Ciclo → ${Ciclo.fase()} (luz global ${Ciclo.luzGlobal().toFixed(2)})`;
}

function debugNoche(progreso = 0) {
  return debugCiclo("noche", progreso);
}

function debugDia() {
  return debugCiclo("dia", 0);
}

window.debugCiclo = debugCiclo;
window.debugNoche = debugNoche;
window.debugDia = debugDia;

function toggleCheatEquipables() {
  if (typeof Equipamiento === "undefined") return;

  const tieneTodo = ["HACHA", "PICO", "LINTERNA", "BARCO"].every((tipo) => {
    const item = Equipamiento.obtenerAccion(tipo);
    return !!(item && item.nivel >= 3);
  });

  if (tieneTodo) {
    Object.keys(estado.inventario).forEach((id) => { estado.inventario[id] = 0; });
    Equipamiento.reiniciarEquipamiento();
    mostrarCartelRapido("🧹 Inventario limpiado");
  } else {
    Equipamiento.recogerAccion("HACHA", 3);
    Equipamiento.recogerAccion("PICO", 3);
    Equipamiento.recogerAccion("LINTERNA", 3);
    Equipamiento.recogerAccion("BARCO", 0);
    Equipamiento.recogerEquipo(Equipamiento.idEquipo("casco", 3));
    Equipamiento.recogerEquipo(Equipamiento.idEquipo("pechera", 3));
    Equipamiento.recogerEquipo(Equipamiento.idEquipo("guantes", 3));
    Equipamiento.recogerEquipo(Equipamiento.idEquipo("botas", 3));
    mostrarCartelRapido("🎁 Equipables cargados");
  }

  if (typeof actualizarHUD === "function") actualizarHUD();
  if (typeof MenuJugador !== "undefined" && MenuJugador.estaAbierto()) MenuJugador.abrir();
}

document.addEventListener("DOMContentLoaded", initCheats);