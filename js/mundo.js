// ═══════════════════════════════════════════════════════════════
//  BLOQUE 4 · FRONTERAS ENTRE CHUNKS
// ─────────────────────────────────────────────────────────────────
//  La frontera entre zona N y zona N+1 es UNA COLUMNA de tiles
//  que comparten ambos chunks. Se genera una vez por frontera,
//  de forma determinista, con hash(semilla + "@frontera_izq_der").
//
//  La columna es 100% transitable (sin bloqueantes) para garantizar
//  que el jugador pueda cruzar desde cualquier fila.
//
//  TODO (futuro): permitir que la frontera tenga obstáculos
//  rompibles (árboles talables, muros rompibles con pico, etc.).
// ═══════════════════════════════════════════════════════════════
function generarFrontera(semillaBase, zonaIzq, zonaDer) {
  const izq = Math.min(zonaIzq, zonaDer);
  const der = Math.max(zonaIzq, zonaDer);
  const clave = semillaBase + "@frontera_" + izq + "_" + der;
  const rng = crearRNG(hashString(clave));

  const columna = [];
  for (let y = 0; y < ALTO_PANTALLA; y++) {
    if (y === 0 || y === ALTO_PANTALLA - 1) {
      columna.push(WALL);
      continue;
    }
    const r = rng();
    if (r < 0.7)       columna.push(GRASS);
    else if (r < 0.85) columna.push(PATH);
    else               columna.push(SAND);
  }
  return columna;
}

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 5 · GENERADOR DE PANTALLA
// ─────────────────────────────────────────────────────────────────
//  Genera un chunk completo. NO usa filas de paso: los bordes
//  este/oeste se "pisan" después con la frontera compartida
//  (eso lo hace el BLOQUE 8 al cargar).
// ═══════════════════════════════════════════════════════════════
function generarPantalla(semillaBase, zona) {
  const rng = crearRNG(hashString(semillaBase + "@zona" + zona));
  const mapa = [];
  for (let y = 0; y < ALTO_PANTALLA; y++) {
    mapa.push(new Array(ANCHO_PANTALLA).fill(GRASS));
  }

  for (let x = 0; x < ANCHO_PANTALLA; x++) {
    mapa[0][x] = WALL;
    mapa[ALTO_PANTALLA - 1][x] = WALL;
  }

  const biomas = ["bosque", "pradera", "costa", "ruina"];
  const bioma = biomas[Math.abs(hashString(semillaBase + "@bioma" + zona)) % biomas.length];

  const yMin = 1, yMax = ALTO_PANTALLA - 2;

  if (bioma === "bosque") {
    for (let y = yMin; y <= yMax; y++)
      for (let x = 0; x < ANCHO_PANTALLA; x++) {
        const r = rng();
        if (r < 0.20)      mapa[y][x] = TREE;
        else if (r < 0.28) mapa[y][x] = BUSH;
        else if (r < 0.35) mapa[y][x] = TALLGRASS;
      }
  } else if (bioma === "pradera") {
    for (let y = yMin; y <= yMax; y++)
      for (let x = 0; x < ANCHO_PANTALLA; x++) {
        const r = rng();
        if (r < 0.06)      mapa[y][x] = TREE;
        else if (r < 0.12) mapa[y][x] = TALLGRASS;
        else if (r < 0.15) mapa[y][x] = ROCK;
      }
  } else if (bioma === "costa") {
    const lado = rng() < 0.5 ? "izq" : "der";
    const anchoAgua = randInt(rng, 5, 9);
    for (let y = yMin; y <= yMax; y++) {
      for (let x = 0; x < ANCHO_PANTALLA; x++) {
        const dist = lado === "izq" ? x : (ANCHO_PANTALLA - 1 - x);
        if (dist < anchoAgua) {
          const prof = dist / anchoAgua;
          if (prof < 0.4) mapa[y][x] = SAND;
          else            mapa[y][x] = WATER;
        } else if (rng() < 0.08) {
          mapa[y][x] = BUSH;
        }
      }
    }
  } else {
    for (let y = yMin; y <= yMax; y++)
      for (let x = 0; x < ANCHO_PANTALLA; x++) {
        const r = rng();
        if (r < 0.10)      mapa[y][x] = WALL;
        else if (r < 0.20) mapa[y][x] = ROCK;
        else if (r < 0.25) mapa[y][x] = TALLGRASS;
      }
  }

  return { mapa, bioma };
}

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 6 · VALIDACIÓN DE TRANSITABILIDAD
// ─────────────────────────────────────────────────────────────────
//  Verifica que exista ALGÚN camino desde alguna celda transitable
//  del borde oeste hasta alguna celda transitable del borde este.
//  No importa la fila: puede serpentear.
// ═══════════════════════════════════════════════════════════════
function esTransitable(mapa) {
  const vistos = new Set();
  const cola = [];

  for (let y = 0; y < ALTO_PANTALLA; y++) {
    if (!BLOQUEANTES.has(mapa[y][0])) cola.push([0, y]);
  }

  while (cola.length > 0) {
    const [x, y] = cola.shift();
    const key = x + "," + y;
    if (vistos.has(key)) continue;
    if (x < 0 || x >= ANCHO_PANTALLA || y < 0 || y >= ALTO_PANTALLA) continue;
    if (BLOQUEANTES.has(mapa[y][x])) continue;
    vistos.add(key);

    if (x === ANCHO_PANTALLA - 1) return true;

    cola.push([x+1, y], [x-1, y], [x, y+1], [x, y-1]);
  }
  return false;
}

function generarPantallaValida(semillaBase, zona, maxIntentos = 10) {
  for (let intento = 0; intento < maxIntentos; intento++) {
    const sufijo = intento === 0 ? "" : "@retry" + intento;
    const { mapa, bioma } = generarPantalla(semillaBase + sufijo, zona);

    if (esTransitable(mapa)) {
      return { mapa, bioma, intentos: intento };
    }
  }
  return generarPantalla(semillaBase, zona);
}