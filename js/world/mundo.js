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
//  MOTOR DE ASIGNACIÓN DE BIOMAS
// ─────────────────────────────────────────────────────────────────
//  Cada zona (chunk) tiene un bioma.
//  El bioma se decide con la siguiente lógica:
//
//  1. Zona 0        → BIOMA_INICIAL (pradera)
//  2. Zona +N       → entre los vecinos de la zona +N-1, según pesos
//  3. Zona -N       → entre los vecinos de la zona -N+1, según pesos
//                     (independiente del este)
//
//  Determinista por semilla. Sin orden fijo.
//  Cachea los resultados para no recalcular.
// ═══════════════════════════════════════════════════════════════

// Cache: "zona" → "idBioma"
const _cacheBiomasPorZona = new Map();

function obtenerBiomaDeZona(semillaBase, zona) {
  const clave = zona.toString();
  if (_cacheBiomasPorZona.has(clave)) {
    return _cacheBiomasPorZona.get(clave);
  }

  // ─── Zona 0: siempre BIOMA_INICIAL ───
  if (zona === 0) {
    _cacheBiomasPorZona.set(clave, BIOMA_INICIAL);
    return BIOMA_INICIAL;
  }

  // ─── Zona N: se genera en cadena desde la zona anterior ───
  const direccion = zona > 0 ? "este" : "oeste";
  const anterior = zona > 0 ? zona - 1 : zona + 1;

  // Obtener el bioma de la zona anterior (recursivo)
  const biomaAnterior = obtenerBiomaDeZona(semillaBase, anterior);

  // Elegir un vecino del bioma anterior
  const vecinos = BIOMAS[biomaAnterior].vecinos;
  const elegido = elegirPorPeso(vecinos, semillaBase, zona, direccion);

  _cacheBiomasPorZona.set(clave, elegido);
  return elegido;
}

// ─── Elige un elemento de una lista según sus pesos ───
// Cada elemento debe tener una propiedad `peso`.
function elegirPorPeso(lista, semillaBase, zona, direccion) {
  const clave = semillaBase + "@bioma@" + direccion + "@zona" + zona;
  const rng = crearRNG(hashString(clave));

  const sumaPesos = lista.reduce((acc, el) => acc + el.peso, 0);
  const tiro = rng() * sumaPesos;

  let acumulado = 0;
  for (const el of lista) {
    acumulado += el.peso;
    if (tiro <= acumulado) {
      return el.id;
    }
  }

  return lista[lista.length - 1].id;
}

// ─── Limpia el cache (al cambiar de semilla) ───
function limpiarCacheBiomas() {
  _cacheBiomasPorZona.clear();
}

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 5 · GENERADOR DE PANTALLA
// ─────────────────────────────────────────────────────────────────
//  Genera un chunk completo.
//  El bioma se elige con `obtenerBiomaDeZona()`.
//  Los tiles se eligen según la tabla `BIOMAS[bioma].tiles`.
// ═══════════════════════════════════════════════════════════════
function generarPantalla(semillaBase, zona) {
  const rng = crearRNG(hashString(semillaBase + "@zona" + zona));
  const mapa = [];
  for (let y = 0; y < ALTO_PANTALLA; y++) {
    mapa.push(new Array(ANCHO_PANTALLA).fill(GRASS));
  }

  // ─── Bordes N-S: muros ───
  for (let x = 0; x < ANCHO_PANTALLA; x++) {
    mapa[0][x] = WALL;
    mapa[ALTO_PANTALLA - 1][x] = WALL;
  }

  // ─── Elegir bioma de la zona ───
  const bioma = obtenerBiomaDeZona(semillaBase, zona);
  const datosBioma = BIOMAS[bioma];

  // ─── Pintar el interior según los tiles del bioma ───
  const yMin = 1, yMax = ALTO_PANTALLA - 2;

  // Precalcular suma total de pesos
  const sumaPesos = datosBioma.tiles.reduce((acc, t) => acc + t.peso, 0);

  for (let y = yMin; y <= yMax; y++) {
    for (let x = 0; x < ANCHO_PANTALLA; x++) {
      // Elegir tile según pesos
      const tiro = rng() * sumaPesos;
      let acumulado = 0;
      let elegido = "GRASS";
      for (const t of datosBioma.tiles) {
        acumulado += t.peso;
        if (tiro <= acumulado) {
          elegido = t.tile;
          break;
        }
      }

      // Aplicar el tile (buscar el ID por nombre)
      const tileID = NOMBRE_A_TILE[elegido];
      if (tileID !== undefined) {
        mapa[y][x] = tileID;
      }
    }
  }

  return { mapa, bioma };
}

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 6 · VALIDACIÓN DE TRANSITABILIDAD
// ─────────────────────────────────────────────────────────────────
//  Verifica que exista ALGÚN camino desde alguna celda transitable
//  del borde oeste hasta alguna celda transitable del borde este.
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