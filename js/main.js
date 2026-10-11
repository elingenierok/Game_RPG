// ═══════════════════════════════════════════════════════════════
//  BLOQUE 16 · INICIO
// ═══════════════════════════════════════════════════════════════
cargarPantalla(0);
iniciarTicks();
console.log("Semilla:", SEMILLA);
console.log("Llave en zona", estado.llave.zona, "posición", estado.llave.x + "," + estado.llave.y);

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 17 · REINICIO CON NUEVA SEMILLA
// ═══════════════════════════════════════════════════════════════
function reiniciarMundo(nuevaSemilla) {
  SEMILLA = nuevaSemilla;
  SEMILLA_MOBS = Date.now();       // mobs nuevos con cada mundo nuevo
  SEMILLA_OBJETOS = SEMILLA;       // objetos ligados al mundo (por ahora)

  estado.zona = 0;
  estado.pantalla = null;
  estado.jugador = { x: 5, y: 8 };
  estado.jugadorInicializado = false;
  estado.jugadorMirandoIzquierda = false;
  estado.zonasVisitadas = new Set([0]);
  estado.transicionando = false;
  estado.ganado = false;
  estado.inventario = {};
  estado.itemsRecogidos = new Set();

  cacheChunks.clear();
  detenerTicks();
  cacheMobs.clear();
  cacheEquipables.clear();
  
  document.getElementById("overlay").classList.remove("visible");

  {
    const rngLlave = crearRNG(hashString(SEMILLA + "@llave"));
    const { mapa } = generarPantallaValida(SEMILLA, ZONA_LLAVE);
    const libres = [];
    for (let y = 1; y < ALTO_PANTALLA - 1; y++)
      for (let x = 2; x < ANCHO_PANTALLA - 2; x++)
        if (!BLOQUEANTES.has(mapa[y][x])) libres.push([x, y]);
    if (libres.length > 0) {
      const [lx, ly] = libres[randInt(rngLlave, 0, libres.length - 1)];
      estado.llave = { zona: ZONA_LLAVE, x: lx, y: ly };
    }
  }

  cargarPantalla(0);
  iniciarTicks();

  console.log("🌱 Nueva semilla:", SEMILLA);
  console.log("🔑 Llave en zona", estado.llave.zona, "posición", estado.llave.x + "," + estado.llave.y);
}

document.getElementById("btn-aplicar").addEventListener("click", () => {
  const s = document.getElementById("input-semilla").value.trim();
  if (s.length === 0) return;
  reiniciarMundo(s);
});

document.getElementById("btn-random").addEventListener("click", () => {
  const nueva = "mundo_" + Math.floor(Math.random() * 999999);
  document.getElementById("input-semilla").value = nueva;
  reiniciarMundo(nueva);
});

document.getElementById("input-semilla").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const s = document.getElementById("input-semilla").value.trim();
    if (s.length === 0) return;
    reiniciarMundo(s);
  }
});