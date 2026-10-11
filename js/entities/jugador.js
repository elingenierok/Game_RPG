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
  if (BLOQUEANTES.has(tile)) return;

  // ¿Hay un mob en la celda destino?
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

  // Actualizar orientación según dirección horizontal
  if (dx > 0) estado.jugadorMirandoIzquierda = true;
  if (dx < 0) estado.jugadorMirandoIzquierda = false;

  estado.jugador.x = nx;
  estado.jugador.y = ny;

  if (estado.llave.zona === estado.zona &&
      estado.llave.x === nx && estado.llave.y === ny) {
    ganar();
    return;
  }

  const item = recogerItemEn(nx, ny);
  if (item) {
    console.log("🍎 Recogiste:", tipoItemANombre(item.tipo));
  }

  render();
  renderBarraZonas();
  actualizarHUD();
}

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

  alejarMobsDelJugador();  // ← esta línea debe estar acá

  render();
  renderBarraZonas();
  actualizarHUD();

  setTimeout(() => {
    overlay.classList.remove("visible");
    estado.transicionando = false;
  }, 150);
}, 250);
}