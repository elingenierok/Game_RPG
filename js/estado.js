// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7 · ESTADO GLOBAL
// ═══════════════════════════════════════════════════════════════
const estado = {
  zona: 0,
  pantalla: null,
  jugador: { x: 5, y: 8 },
  jugadorInicializado: false,
  llave: { zona: 0, x: 0, y: 0 },
  zonasVisitadas: new Set([0]),
  transicionando: false,
  ganado: false,
  inventario: {},
  itemsRecogidos: new Set(),
};

const cacheChunks = new Map();

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