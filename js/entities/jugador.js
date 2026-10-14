// ═══════════════════════════════════════════════════════════════
//  BLOQUE 12 · MOVIMIENTO Y TRANSICIÓN
// ═══════════════════════════════════════════════════════════════
function intentarMover(dx, dy) {
  if (estado.transicionando || estado.ganado) return;

  const nx = estado.jugador.x + dx;
  const ny = estado.jugador.y + dy;

  if (nx < 0)  { cambiarZona(-1); return; }
  if (nx >= ANCHO_PANTALLA) { cambiarZona(+1); return; }
  if (ny < 0 || ny >= ALTO_PANTALLA) return;

  const tile = estado.pantalla.mapa[ny][nx];

  // ─── ¿Está navegando? Solo puede moverse sobre agua ───
  if (typeof estaNavegando === "function" && estaNavegando()) {
    if (tile !== WATER) {
      return;   // No puede salir del agua mientras navega
    }
  } else {
    // Sin barco: bloqueantes como siempre
    if (BLOQUEANTES.has(tile)) return;
  }

  // ─── ¿Hay un mob en la celda destino? ───
  const mob = obtenerMobEn(estado.zona, nx, ny);
  if (mob) {
    const datos = MOBS[mob.tipo];
    if (datos.colision.alChocar === "batalla") {
      pausarTicks();
      iniciarBatalla(mob);
      return;
    } else {
      return;
    }
  }

  // ─── Actualizar orientación ───
  if (dx > 0) estado.jugadorMirandoIzquierda = true;
  if (dx < 0) estado.jugadorMirandoIzquierda = false;

  // ─── Mover al jugador ───
  estado.jugador.x = nx;
  estado.jugador.y = ny;

  // ─── ¿Pisó la llave? ───
  if (estado.llave.zona === estado.zona &&
      estado.llave.x === nx && estado.llave.y === ny) {
    ganar();
    return;
  }

  // ─── ¿Pisó una manzana? ───
  const item = recogerItemEn(nx, ny);
  if (item) {
    const nombre = tipoItemANombre(item.tipo);
    const icono = ICONOS[MANZANA] || "🍎";
    if (typeof mostrarCartelRapido === "function") {
      mostrarCartelRapido(`${icono} +1 ${nombre}`);
    }
    console.log("🍎 Recogiste:", nombre);
  }

  // ─── ¿Pisó un equipable? ───
  const equipable = recogerEquipableEn(nx, ny);
  if (equipable) {
    const nombre = tipoEquipableANombre(equipable.tipo);
    let icono = "🎒";
    if (nombre === "HACHA")    icono = "🪓";
    if (nombre === "PICO")     icono = "⛏️";
    if (nombre === "LINTERNA") icono = "🕯️";
    if (nombre === "BARCO")    icono = "🛶";
    if (typeof mostrarCartelRapido === "function") {
      mostrarCartelRapido(`${icono} ¡${nombre} conseguido!`);
    }
    console.log("🎒 Recogiste:", nombre);
  }

  // ─── ¿Pisa tierra y está navegando? → Bajar del barco ───
  if (typeof verificarBajarseDelBarco === "function") {
    verificarBajarseDelBarco();
  }

  render();
  renderBarraZonas();
  actualizarHUD();
}

// ═══════════════════════════════════════════════════════════════
//  TRANSICIÓN ENTRE ZONAS
// ═══════════════════════════════════════════════════════════════
function cambiarZona(delta) {
  const zonaNueva = estado.zona + delta;

  if (zonaNueva < -LIMITE_CHUNKS || zonaNueva > LIMITE_CHUNKS) {
    return;
  }

  estado.transicionando = true;

  const direccion = delta > 0 ? "este" : "oeste";
  const yActual = estado.jugador.y;

  const overlay = document.getElementById("overlay");
  document.getElementById("ovTitulo").textContent = `⟶ Zona ${zonaNueva}`;
  document.getElementById("ovSubtitulo").textContent = `Entrando por el ${direccion}...`;
  overlay.classList.add("visible");

  setTimeout(() => {
    cargarPantalla(zonaNueva);

    if (delta > 0) {
      estado.jugador.x = 0;
    } else {
      estado.jugador.x = ANCHO_PANTALLA - 1;
    }
    estado.jugador.y = yActual;

    alejarMobsDelJugador();

    render();
    renderBarraZonas();
    actualizarHUD();

    setTimeout(() => {
      overlay.classList.remove("visible");
      estado.transicionando = false;
    }, 150);
  }, 250);
}