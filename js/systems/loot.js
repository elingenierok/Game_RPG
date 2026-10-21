// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.17 · LOOT Y XP POR MOB (F13)
// ─────────────────────────────────────────────────────────────────
//  Cada mob tiene una tabla con probabilidad y rango de cantidad.
//  Los drops únicos se entregan una sola vez por mundo.
// ═══════════════════════════════════════════════════════════════

const LOOT_POR_MOB = {
  tigre: {
    xp: 6,
    dropea: true,
    probabilidad: 1,
    objetos: [
      { id: "carne", prob: 1, min: 1, max: 2 },
      { id: "colmillo", prob: 0.35, min: 1, max: 1 },
      { id: "hueso", prob: 0.5, min: 1, max: 1 },
    ],
    unicos: [],
  },
  gallina: {
    xp: 2,
    dropea: true,
    probabilidad: 1,
    objetos: [
      { id: "pluma", prob: 1, min: 1, max: 2 },
      { id: "huevo", prob: 0.45, min: 1, max: 1 },
    ],
    unicos: [],
  },
  cerdo: {
    xp: 4,
    dropea: true,
    probabilidad: 1,
    objetos: [
      { id: "carne", prob: 1, min: 1, max: 2 },
      { id: "hueso", prob: 0.3, min: 1, max: 1 },
    ],
    unicos: [],
  },
};

const LOOT_UNICOS_POR_MOB = {
  tigre_boss: [
    { id: "trofeo_tigre", cantidad: 1 },
  ],
};

function asegurarDropsUnicos() {
  if (!(estado.dropsUnicos instanceof Set)) estado.dropsUnicos = new Set();
  return estado.dropsUnicos;
}

function limitarProbabilidad(valor) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return 1;
  return Math.max(0, Math.min(1, n));
}

function numeroEntero(min, max) {
  const a = Math.floor(Number(min) || 1);
  const b = Math.max(a, Math.floor(Number(max) || a));
  return a + Math.floor(Math.random() * (b - a + 1));
}

function normalizarObjetoLoot(objeto) {
  if (!objeto || !objeto.id) return null;

  const cantidad = objeto.cantidad;
  const minCantidad = Array.isArray(cantidad) ? cantidad[0] : cantidad;
  const maxCantidad = Array.isArray(cantidad) ? cantidad[1] : cantidad;

  return {
    id: objeto.id,
    prob: limitarProbabilidad(objeto.prob ?? objeto.probabilidad ?? 1),
    min: Math.max(1, Math.floor(Number(objeto.min ?? minCantidad ?? 1) || 1)),
    max: Math.max(1, Math.floor(Number(objeto.max ?? maxCantidad ?? minCantidad ?? 1) || 1)),
  };
}

function normalizarTablaLoot(tabla) {
  if (!tabla || typeof tabla !== "object") {
    return { xp: 0, dropea: false, probabilidad: 0, objetos: [], unicos: [] };
  }

  return {
    xp: Math.max(0, Math.floor(Number(tabla.xp) || 0)),
    dropea: tabla.dropea !== false,
    probabilidad: limitarProbabilidad(tabla.probabilidad ?? 1),
    objetos: Array.isArray(tabla.objetos)
      ? tabla.objetos.map(normalizarObjetoLoot).filter(Boolean)
      : [],
    unicos: Array.isArray(tabla.unicos) ? tabla.unicos : [],
  };
}

function obtenerTablaLoot(mob) {
  const tipo = mob && mob.tipo;
  const datosMob = tipo && typeof MOBS !== "undefined" ? MOBS[tipo] : null;

  if (tipo && LOOT_POR_MOB[tipo]) {
    const lootTema = datosMob && datosMob.loot;
    const objetosTema = lootTema && Array.isArray(lootTema.objetos) ? lootTema.objetos : [];
    const temaCompleto = objetosTema.length > 0 && objetosTema.every((objeto) =>
      objeto.min != null || objeto.max != null || objeto.cantidad != null
    );
    const tabla = temaCompleto
      ? normalizarTablaLoot(lootTema)
      : normalizarTablaLoot(LOOT_POR_MOB[tipo]);
    const unicosTema = lootTema && Array.isArray(lootTema.unicos) ? lootTema.unicos : [];
    const unicos = unicosTema.length > 0
      ? unicosTema
      : (LOOT_UNICOS_POR_MOB[tipo] || tabla.unicos);
    return { ...tabla, unicos: Array.isArray(unicos) ? unicos : [] };
  }

  const tabla = normalizarTablaLoot(datosMob && datosMob.loot);
  const unicosExtra = (tipo && LOOT_UNICOS_POR_MOB[tipo]) || [];
  return { ...tabla, unicos: [...tabla.unicos, ...unicosExtra] };
}

function obtenerUnicosMob(mob, tabla) {
  const datosMob = mob && typeof MOBS !== "undefined" ? MOBS[mob.tipo] : null;
  const candidatos = [];

  if (mob && Array.isArray(mob.dropsUnicos)) candidatos.push(...mob.dropsUnicos);
  if (datosMob && Array.isArray(datosMob.dropsUnicos)) candidatos.push(...datosMob.dropsUnicos);
  if (tabla && Array.isArray(tabla.unicos)) candidatos.push(...tabla.unicos);

  return candidatos.filter((entrada) => entrada && entrada.id);
}

function generarLootMob(mob) {
  const tabla = obtenerTablaLoot(mob);
  const unicos = asegurarDropsUnicos();
  const items = [];

  if (tabla.dropea && Math.random() <= tabla.probabilidad) {
    for (const entrada of tabla.objetos) {
      if (Math.random() > entrada.prob) continue;

      const cantidad = numeroEntero(entrada.min, entrada.max);
      const datos = obtenerDatosItem(entrada.id);
      items.push({
        id: datos.id,
        nombre: datos.nombre,
        icono: datos.icono,
        cantidad,
        unico: false,
      });
    }
  }

  for (const entrada of obtenerUnicosMob(mob, tabla)) {
    const datos = obtenerDatosItem(entrada.id);
    const clave = `${mob.tipo}:${datos.id}`;
    if (unicos.has(clave)) continue;

    unicos.add(clave);
    const cantidad = Math.max(1, Math.floor(Number(entrada.cantidad) || 1));
    items.push({
      id: datos.id,
      nombre: datos.nombre,
      icono: datos.icono,
      cantidad,
      unico: true,
    });
  }

  return { xp: tabla.xp, items };
}

function entregarRecompensasVictoria(mob) {
  if (mob && mob._lootEntregado && mob._lootResultado) {
    return mob._lootResultado;
  }

  const datosMob = mob && typeof MOBS !== "undefined" ? MOBS[mob.tipo] : null;
  const nombreMob = datosMob && datosMob.nombre ? datosMob.nombre : "El enemigo";
  const loot = generarLootMob(mob);

  if (loot.xp > 0 && typeof Progresion !== "undefined") {
    Progresion.otorgarXP(loot.xp);
  }

  for (const item of loot.items) {
    agregarItemInventario(item.id, item.cantidad);
  }

  if (typeof actualizarHUD === "function") actualizarHUD();
  if (typeof MenuJugador !== "undefined" && typeof MenuJugador.actualizar === "function") {
    MenuJugador.actualizar();
  }

  const resultado = {
    nombreMob,
    xp: loot.xp,
    items: loot.items,
  };

  if (mob) {
    mob._lootEntregado = true;
    mob._lootResultado = resultado;
  }

  return resultado;
}

function reiniciarLoot() {
  estado.dropsUnicos = new Set();
}

const Loot = {
  LOOT_POR_MOB,
  obtenerTablaLoot,
  generarLootMob,
  entregarRecompensasVictoria,
  reiniciarLoot,
};

reiniciarLoot();
