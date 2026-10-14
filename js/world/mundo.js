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

    // ─── Pintar el interior según la forma del bioma ───
  if (datosBioma.forma === "franja") {
    pintarCosta(mapa, semillaBase, zona);
  } else {
    // Lógica de tiles uniformes (la de siempre)
    const yMin = 1, yMax = ALTO_PANTALLA - 2;
    const sumaPesos = datosBioma.tiles.reduce((acc, t) => acc + t.peso, 0);

    for (let y = yMin; y <= yMax; y++) {
      for (let x = 0; x < ANCHO_PANTALLA; x++) {
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
        const tileID = NOMBRE_A_TILE[elegido];
        if (tileID !== undefined) {
          mapa[y][x] = tileID;
        }
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

// ═══════════════════════════════════════════════════════════════
//  GENERADOR DE COSTA (forma "franja")
// ─────────────────────────────────────────────────────────────────
//  Pinta el chunk en 3 franjas con bordes irregulares:
//    1. Franja agua (1/3 aprox, del lado del océano)
//    2. Franja arena (1/3 aprox, en el medio)
//    3. Franja pasto (1/3 aprox, del lado opuesto)
//
//  El lado del océano se decide con la semilla.
//  Los bordes son irregulares para dar naturalidad.
// ═══════════════════════════════════════════════════════════════
function pintarCosta(mapa, semillaBase, zona) {
  const rng = crearRNG(hashString(semillaBase + "@costa" + zona));

  // ─── 1. ¿De qué lado está el océano? ───
  const ladoOceano = rng() < 0.5 ? "izquierda" : "derecha";

  // ─── 2. Ancho de cada franja (con variación) ───
  const tercio = Math.floor(ANCHO_PANTALLA / 3);
  const anchoAgua   = tercio + randInt(rng, -2, 2);
  const anchoArena  = tercio + randInt(rng, -2, 2);
  // El pasto ocupa el resto

  // ─── 3. Pintar las 3 franjas ───
  const yMin = 1, yMax = ALTO_PANTALLA - 2;

  // Para cada columna, decidimos si es agua, arena o pasto
  for (let x = 0; x < ANCHO_PANTALLA; x++) {
    // Calcular la "distancia desde el océano" para esta columna
    const distOceano = ladoOceano === "izquierda" ? x : (ANCHO_PANTALLA - 1 - x);

    // Decidir la zona base de esta columna
    let zonaBase;  // "agua" | "arena" | "pasto"
    if (distOceano < anchoAgua) {
      zonaBase = "agua";
    } else if (distOceano < anchoAgua + anchoArena) {
      zonaBase = "arena";
    } else {
      zonaBase = "pasto";
    }

    // Pintar la columna
    for (let y = yMin; y <= yMax; y++) {
      // ─── Irregularidad: bordes ondulados ───
      // Cada celda tiene una pequeña chance de "saltar" a la franja vecina.
      // Esto rompe la línea recta.

      // Ondulación: valor entre -2 y 2 según la fila
      const ondaY = Math.sin((y + zona * 3) * 0.4) * 1.5;

      // Distancia efectiva: incluye la ondulación
      const distEfectiva = distOceano + ondaY;

      let zonaCelda = zonaBase;
      if (distEfectiva < anchoAgua - 1) {
        zonaCelda = "agua";
      } else if (distEfectiva < anchoAgua + anchoArena - 1) {
        zonaCelda = "arena";
      }

      // Pequeña chance de variación celda por celda
      const r = rng();
      if (r < 0.05) {
        // 5% de saltar a la franja vecina
        if (zonaCelda === "agua" && distEfectiva > anchoAgua - 3) zonaCelda = "arena";
        else if (zonaCelda === "arena") zonaCelda = (r < 0.025 ? "agua" : "pasto");
        else if (zonaCelda === "pasto" && distEfectiva < anchoAgua + anchoArena + 2) zonaCelda = "arena";
      }

      // ─── Asignar tile según la zona ───
      if (zonaCelda === "agua") {
        mapa[y][x] = WATER;
      } else if (zonaCelda === "arena") {
        // Arena: mayormente SAND, con algún arbusto suelto
        const r2 = rng();
        if (r2 < 0.05) mapa[y][x] = BUSH;
        else           mapa[y][x] = SAND;
      } else {
        // Pasto: GRASS con árboles/arbustos ocasionales
        const r2 = rng();
        if (r2 < 0.10)      mapa[y][x] = BUSH;
        else if (r2 < 0.14) mapa[y][x] = TREE;
        else                mapa[y][x] = GRASS;
      }
    }
  }
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