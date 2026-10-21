// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.5 · ÍTEMS (chunks 2D)
// ─────────────────────────────────────────────────────────────────
//  Ahora los ítems viven en coordenadas del mundo (wx, wy).
//  Un chunk es de 32×32 celdas.
//
//  Refactor v2.1: las funciones aceptan semillas opcionales para
//  que el auditor pueda generar ítems sin depender del estado
//  global del juego.
// ═══════════════════════════════════════════════════════════════

const HP_POR_MANZANA = 1;
const _cacheItemsPorChunk = new Map();

// ─── Genera los ítems de un chunk (0-3 por chunk) ───
function generarItemsDeChunk(cx, cy, semillaMundo, semillaObjetos) {
  const sMundo   = semillaMundo   || SEMILLA;
  const sObjetos = semillaObjetos || SEMILLA_OBJETOS;
  const clave = sObjetos + "|" + cx + "," + cy;
  if (_cacheItemsPorChunk.has(clave)) return _cacheItemsPorChunk.get(clave);

  const rng = crearRNG(hashString(sObjetos + "@items@" + cx + "," + cy));
  const items = [];
  const cantidad = randInt(rng, 0, 3);
  const maxIntentos = 20;

  const chunk = generarPantalla(sMundo, cx, cy);

  for (let i = 0; i < cantidad; i++) {
    for (let intento = 0; intento < maxIntentos; intento++) {
      const lx = randInt(rng, 1, ANCHO_CHUNK - 2);
      const ly = randInt(rng, 1, ALTO_CHUNK - 2);

      if (BLOQUEANTES.has(chunk.mapa[ly][lx])) continue;
      if (chunk.mapa[ly][lx] === WATER) continue;

      const wx = cx * ANCHO_CHUNK + lx;
      const wy = cy * ALTO_CHUNK + ly;

      if (items.some(it => it.wx === wx && it.wy === wy)) continue;

      if (typeof cacheMobs !== "undefined") {
        const mobs = cacheMobs.get(cx + "," + cy);
        if (mobs && mobs.some(m => m.wx === wx && m.wy === wy)) continue;
      }

      items.push({ wx, wy, tipo: MANZANA });
      break;
    }
  }

  _cacheItemsPorChunk.set(clave, items);
  return items;
}

// ─── Obtiene los ítems que pueden estar en coordenadas (wx, wy) ───
function obtenerItemsDeChunk(wx, wy) {
  const info = coordsMundoATile(wx, wy);
  return generarItemsDeChunk(info.cx, info.cy);
}

// ─── Datos de un ítem ───
function tipoItemANombre(tipo) {
  if (tipo === MANZANA) return "MANZANA";
  return "DESCONOCIDO";
}

function iconoDeItem(tipo) {
  return ICONOS[tipo] || "?";
}

// ─── Buscar un ítem sin recogerlo ───
function buscarItemEn(wx, wy) {
  const clave = wx + "," + wy;
  if (estado.itemsRecogidos.has(clave)) return null;

  const info = coordsMundoATile(wx, wy);
  const items = generarItemsDeChunk(info.cx, info.cy);
  return items.find(it => it.wx === wx && it.wy === wy) || null;
}

// ─── Recoger un ítem en coordenadas del mundo ───
function recogerItemEn(wx, wy) {
  const item = buscarItemEn(wx, wy);
  if (!item) return null;

  const tileBase = tileEnMundo(wx, wy);
  if (BLOQUEANTES.has(tileBase)) return null;

  const clave = wx + "," + wy;

  estado.itemsRecogidos.add(clave);

  // Las manzanas son comida: se consumen al pisarlas, no van al inventario.
  if (item.tipo !== MANZANA) {
    const nombre = tipoItemANombre(item.tipo);
    estado.inventario[nombre] = (estado.inventario[nombre] || 0) + 1;
  }

  return item;
}

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.5b · OBJETOS EQUIPABLES (chunks 2D)
// ─────────────────────────────────────────────────────────────────
//  Cada equipable se genera UNA VEZ por mundo, en un chunk
//  específico elegido al azar según la semilla.
//
//  Refactor v2.1: acepta semillaMundo y semillaObjetos opcionales.
// ═══════════════════════════════════════════════════════════════

const EQUIPABLES = [
  { tipo: HACHA,    bioma: "bosque",  porChunk: true },
  { tipo: PICO,     bioma: "ruina",   porChunk: true },
  { tipo: LINTERNA, bioma: "costa",   porChunk: true },
  { tipo: BARCO,    bioma: "costa",   porChunk: true },
];

const _cacheEquipablesPorChunk = new Map();
const _zonasEquipables = new Map();

// ─── Determina el chunk donde va cada equipable ───
function obtenerChunkDeEquipable(tipo, bioma, semillaMundo, semillaObjetos) {
  const sMundo   = semillaMundo   || SEMILLA;
  const sObjetos = semillaObjetos || SEMILLA_OBJETOS;
  const cacheKey = tipo + "|" + sObjetos;

  if (_zonasEquipables.has(cacheKey)) return _zonasEquipables.get(cacheKey);

  const config = EQUIPABLES.find(e => e.tipo === tipo);
  if (config && config.porChunk) {
    _zonasEquipables.set(cacheKey, "porChunk");
    return "porChunk";
  }

  const candidatos = [];
  const r = LIMITE_CHUNKS;
  for (let cy = -r; cy <= r; cy++) {
    for (let cx = -r; cx <= r; cx++) {
      if (cx === 0 && cy === 0) continue;
      const biomaChunk = obtenerBiomaDeChunk(sMundo, cx, cy);
      if (biomaChunk === bioma) candidatos.push({ cx, cy });
    }
  }

  if (candidatos.length === 0) {
    _zonasEquipables.set(cacheKey, null);
    return null;
  }

  const clave = sObjetos + "@equipable_chunk@" + tipo;
  const rng = crearRNG(hashString(clave));
  const elegido = candidatos[Math.floor(rng() * candidatos.length)];

  _zonasEquipables.set(cacheKey, elegido);
  return elegido;
}

// ─── Genera los equipables de un chunk ───
function generarEquipablesDeChunk(cx, cy, semillaMundo, semillaObjetos) {
  const sMundo   = semillaMundo   || SEMILLA;
  const sObjetos = semillaObjetos || SEMILLA_OBJETOS;
  const clave = sObjetos + "|" + cx + "," + cy;
  if (_cacheEquipablesPorChunk.has(clave)) return _cacheEquipablesPorChunk.get(clave);

  const chunk = generarPantalla(sMundo, cx, cy);
  const equipables = [];

  for (const { tipo, bioma } of EQUIPABLES) {
    const config = EQUIPABLES.find(e => e.tipo === tipo);
    const chunkObjetivo = obtenerChunkDeEquipable(tipo, bioma, sMundo, sObjetos);

    if (config.porChunk) {
      if (chunk.bioma !== bioma) continue;
    } else {
      if (!chunkObjetivo || chunkObjetivo.cx !== cx || chunkObjetivo.cy !== cy) continue;
    }

    const rng = crearRNG(hashString(sObjetos + "@equipable@" + tipo + "@" + cx + "," + cy));
    const maxIntentos = (tipo === BARCO) ? 80 : 30;

    for (let intento = 0; intento < maxIntentos; intento++) {
      const lx = randInt(rng, 1, ANCHO_CHUNK - 2);
      const ly = randInt(rng, 1, ALTO_CHUNK - 2);

      if (BLOQUEANTES.has(chunk.mapa[ly][lx])) continue;
      if (chunk.mapa[ly][lx] === WATER) continue;

      if (tipo === BARCO) {
        if (lx <= 1 || lx >= ANCHO_CHUNK - 2) continue;
        if (ly <= 1 || ly >= ALTO_CHUNK - 2) continue;

        const tieneAgua =
          (ly > 0 && chunk.mapa[ly-1][lx] === WATER) ||
          (ly < ALTO_CHUNK - 1 && chunk.mapa[ly+1][lx] === WATER) ||
          (lx > 0 && chunk.mapa[ly][lx-1] === WATER) ||
          (lx < ANCHO_CHUNK - 1 && chunk.mapa[ly][lx+1] === WATER);
        if (!tieneAgua) continue;
      }

      const wx = cx * ANCHO_CHUNK + lx;
      const wy = cy * ALTO_CHUNK + ly;

      if (equipables.some(e => e.wx === wx && e.wy === wy)) continue;

      if (typeof cacheMobs !== "undefined") {
        const mobs = cacheMobs.get(cx + "," + cy);
        if (mobs && mobs.some(m => m.wx === wx && m.wy === wy)) continue;
      }

      const tipoNombre = tipoEquipableANombre(tipo);
      const nivelHerramienta = tipoNombre === "BARCO" || typeof Equipamiento === "undefined"
        ? 0
        : Equipamiento.elegirNivel(rng, cx, cy);
      const idHerramienta = typeof Equipamiento !== "undefined"
        ? Equipamiento.idHerramienta(tipoNombre, nivelHerramienta)
        : null;

      equipables.push({
        tipo: tipoNombre,
        nivel: nivelHerramienta,
        id: idHerramienta,
        wx,
        wy,
      });
      break;
    }
  }

  // ─── Equipo (casco, pechera, guantes, botas) ───
  if (typeof Equipamiento !== "undefined") {
    const rngEquipo = crearRNG(hashString(sObjetos + "@equipo@" + cx + "," + cy));
    if (rngEquipo() < 0.12) {
      const slots = Equipamiento.SLOTS;
      const slot = slots[Math.floor(rngEquipo() * slots.length)];
      const nivel = Equipamiento.elegirNivel(rngEquipo, cx, cy);
      const id = Equipamiento.idEquipo(slot, nivel);

      if (id) {
        for (let intento = 0; intento < 30; intento++) {
          const lx = randInt(rngEquipo, 1, ANCHO_CHUNK - 2);
          const ly = randInt(rngEquipo, 1, ALTO_CHUNK - 2);

          if (BLOQUEANTES.has(chunk.mapa[ly][lx])) continue;
          if (chunk.mapa[ly][lx] === WATER) continue;

          const wx = cx * ANCHO_CHUNK + lx;
          const wy = cy * ALTO_CHUNK + ly;

          if (equipables.some(e => e.wx === wx && e.wy === wy)) continue;

          if (typeof cacheMobs !== "undefined") {
            const mobs = cacheMobs.get(cx + "," + cy);
            if (mobs && mobs.some(m => m.wx === wx && m.wy === wy)) continue;
          }

          equipables.push({ tipo: "EQUIPO", id, slot, nivel, wx, wy });
          break;
        }
      }
    }
  }

  _cacheEquipablesPorChunk.set(clave, equipables);
  return equipables;
}

// ─── Obtiene los equipables que pueden estar en (wx, wy) ───
function obtenerEquipablesDeChunk(wx, wy) {
  const info = coordsMundoATile(wx, wy);
  return generarEquipablesDeChunk(info.cx, info.cy);
}

// ─── Recoger un equipable ───
function recogerEquipableEn(wx, wy) {
  const clave = wx + "," + wy;
  if (estado.itemsRecogidos.has(clave)) return null;

  const info = coordsMundoATile(wx, wy);
  const equipables = generarEquipablesDeChunk(info.cx, info.cy);
  const eq = equipables.find(e => e.wx === wx && e.wy === wy);
  if (!eq) return null;

  estado.itemsRecogidos.add(clave);

  if (typeof Equipamiento !== "undefined") {
    if (eq.tipo === "EQUIPO") {
      const resultado = Equipamiento.recogerEquipo(eq.id);
      return { ...eq, ...resultado, item: resultado.item };
    }

    const resultado = Equipamiento.recogerAccion(eq.tipo, eq.nivel || 0);
    return { ...eq, ...resultado, item: resultado.item };
  }

  const nombre = tipoEquipableANombre(eq.tipo);
  estado.inventario[nombre] = (estado.inventario[nombre] || 0) + 1;
  return {
    ...eq,
    ok: true,
    item: obtenerDatosItem(nombre),
  };
}

function tipoEquipableANombre(tipo) {
  if (tipo === "HACHA" || tipo === "PICO" || tipo === "LINTERNA" || tipo === "BARCO") return tipo;
  if (tipo === HACHA)    return "HACHA";
  if (tipo === PICO)     return "PICO";
  if (tipo === LINTERNA) return "LINTERNA";
  if (tipo === BARCO)    return "BARCO";
  return "DESCONOCIDO";
}

// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.5c · CATÁLOGO E INVENTARIO (F13)
// ═══════════════════════════════════════════════════════════════

const LIMITE_PILA_EQUIPO = 99;

const CATALOGO_ITEMS = {
  MANZANA:  { id: "MANZANA",  nombre: "Manzana",         icono: ICONOS[MANZANA],  tipo: "consumible", categoria: "consumible" },
  HACHA:    { id: "HACHA",    nombre: "Hacha de madera", icono: ICONOS[HACHA],    tipo: "herramienta", categoria: "accion", nivel: 0 },
  PICO:     { id: "PICO",     nombre: "Pico de piedra",  icono: ICONOS[PICO],     tipo: "herramienta", categoria: "accion", nivel: 0 },
  LINTERNA: { id: "LINTERNA", nombre: "Linterna de aceite", icono: ICONOS[LINTERNA], tipo: "herramienta", categoria: "accion", nivel: 0 },
  BARCO:    { id: "BARCO",    nombre: "Bote de madera",  icono: ICONOS[BARCO],    tipo: "herramienta", categoria: "accion", nivel: 0 },
  PLUMA:    { id: "PLUMA",    nombre: "Pluma",           icono: "🪶",             tipo: "material", categoria: "uso" },
  CARNE:    { id: "CARNE",    nombre: "Carne",           icono: "🥩",             tipo: "material", categoria: "uso" },
  COLMILLO: { id: "COLMILLO", nombre: "Colmillo",        icono: "🦷",             tipo: "material", categoria: "uso" },
  HUEVO:    { id: "HUEVO",    nombre: "Huevo",           icono: "🥚",             tipo: "material", categoria: "uso" },
  HUESO:    { id: "HUESO",    nombre: "Hueso",           icono: "🦴",             tipo: "material", categoria: "uso" },
  MONEDA:   { id: "MONEDA",   nombre: "Moneda antigua",  icono: "🪙",             tipo: "material", categoria: "uso" },
  CHATARRA: { id: "CHATARRA", nombre: "Chatarra",        icono: "⚙️",             tipo: "material", categoria: "uso" },
  NUCLEO:   { id: "NUCLEO",   nombre: "Núcleo",          icono: "🔮",             tipo: "material", categoria: "uso" },
  LLAVE_BOSQUE: { id: "LLAVE_BOSQUE", nombre: "Llave del bosque", icono: "🗝️", tipo: "único", categoria: "unico" },
  TROFEO_TIGRE: { id: "TROFEO_TIGRE", nombre: "Trofeo del tigre", icono: "🏆", tipo: "único", categoria: "unico" },
};

function normalizarIdItem(id) {
  return String(id || "").trim().toUpperCase();
}

function obtenerDatosItem(id) {
  const clave = normalizarIdItem(id);
  const datos = CATALOGO_ITEMS[clave];

  if (datos) {
    return {
      categoria: datos.tipo === "material" || datos.tipo === "único" ? "uso" : datos.tipo,
      ...datos,
    };
  }

  return {
    id: clave || "DESCONOCIDO",
    nombre: clave || "Desconocido",
    icono: "❓",
    tipo: "material",
    categoria: "uso",
  };
}

function agregarItemInventario(id, cantidad) {
  const datos = obtenerDatosItem(id);
  const n = Math.max(1, Math.floor(Number(cantidad) || 1));
  const actual = estado.inventario[datos.id] || 0;
  const tope = datos.categoria === "equipable" && !datos.unico ? LIMITE_PILA_EQUIPO : Infinity;
  const agregado = Math.min(tope, actual + n) - actual;
  estado.inventario[datos.id] = actual + Math.max(0, agregado);
  return { ...datos, cantidad: Math.max(0, agregado) };
}

function listarInventario() {
  return Object.entries(estado.inventario)
    .filter(([, cantidad]) => cantidad > 0)
    .map(([id, cantidad]) => ({ ...obtenerDatosItem(id), cantidad }));
}