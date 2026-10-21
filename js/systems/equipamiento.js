// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.19 · EQUIPAMIENTO Y NIVELES (F12)
// ─────────────────────────────────────────────────────────────────
//  Herramientas y linterna: se mejoran automáticamente al
//  encontrar una versión superior. No se mueven del inventario.
//  Equipo (casco, pechera, guantes, botas): se acumula y se
//  equipa por slot; al reemplazar, el objeto anterior vuelve.
// ═══════════════════════════════════════════════════════════════

const NIVELES_EQUIPO = [
  { nivel: 0, clave: "base",       nombre: "Base",       glow: 0 },
  { nivel: 1, clave: "normal",     nombre: "Normal",     glow: 1 },
  { nivel: 2, clave: "especial",   nombre: "Especial",   glow: 2 },
  { nivel: 3, clave: "legendario", nombre: "Legendario", glow: 3 },
];

const HERRAMIENTAS = {
  HACHA: {
    tipo: "HACHA",
    nombre: "Hacha",
    icono: ICONOS[HACHA],
    niveles: [
      { id: "HACHA",            nombre: "Hacha de madera",     nivel: 0, material: "Madera",        velocidad: 0.68 },
      { id: "HACHA_HIERRO",     nombre: "Hacha de hierro",     nivel: 1, material: "Hierro",        velocidad: 0.82 },
      { id: "HACHA_ESPECIAL",   nombre: "Hacha de acero estelar", nivel: 2, material: "Acero estelar", velocidad: 0.98 },
      { id: "HACHA_LEGENDARIA", nombre: "Hacha del bosque",    nivel: 3, material: "Madera ancestral", velocidad: 1.18, unico: true },
    ],
  },
  PICO: {
    tipo: "PICO",
    nombre: "Pico",
    icono: ICONOS[PICO],
    niveles: [
      { id: "PICO",           nombre: "Pico de piedra",    nivel: 0, material: "Piedra",       velocidad: 0.68 },
      { id: "PICO_HIERRO",    nombre: "Pico de hierro",    nivel: 1, material: "Hierro",       velocidad: 0.82 },
      { id: "PICO_ESPECIAL",  nombre: "Pico de obsidiana", nivel: 2, material: "Obsidiana",    velocidad: 0.98 },
      { id: "PICO_LEGENDARIO", nombre: "Pico del núcleo",  nivel: 3, material: "Núcleo",       velocidad: 1.18, unico: true },
    ],
  },
  LINTERNA: {
    tipo: "LINTERNA",
    nombre: "Linterna",
    icono: ICONOS[LINTERNA],
    niveles: [
      { id: "LINTERNA",          nombre: "Linterna de aceite", nivel: 0, material: "Aceite",  vision: 1 },
      { id: "LINTERNA_METAL",    nombre: "Linterna de metal",  nivel: 1, material: "Metal",   vision: 2 },
      { id: "LINTERNA_CRISTAL",  nombre: "Linterna de cristal", nivel: 2, material: "Cristal", vision: 3 },
      { id: "LINTERNA_SOL",      nombre: "Linterna del sol",   nivel: 3, material: "Solar",   vision: 5, unico: true },
    ],
  },
  BARCO: {
    tipo: "BARCO",
    nombre: "Barco",
    icono: ICONOS[BARCO],
    niveles: [
      { id: "BARCO", nombre: "Bote de madera", nivel: 0, material: "Madera", velocidad: 1 },
    ],
  },
};

const SLOTS_EQUIPO = [
  { id: "casco",   nombre: "Casco",   icono: "⛑️" },
  { id: "pechera", nombre: "Pechera", icono: "🦺" },
  { id: "guantes", nombre: "Guantes", icono: "🧤" },
  { id: "botas",   nombre: "Botas",   icono: "👢" },
];

const EQUIPO = {
  CASCO_CUERO: {
    id: "CASCO_CUERO", nombre: "Casco de cuero", icono: "⛑️",
    tipo: "equipable", categoria: "equipable", slot: "casco", nivel: 0,
    stats: { defensa: 1 }, descripcion: "+1 defensa",
  },
  CASCO_HIERRO: {
    id: "CASCO_HIERRO", nombre: "Casco de hierro", icono: "⛑️",
    tipo: "equipable", categoria: "equipable", slot: "casco", nivel: 1,
    stats: { defensa: 2 }, descripcion: "+2 defensa",
  },
  CASCO_CRISTAL: {
    id: "CASCO_CRISTAL", nombre: "Casco de cristal", icono: "⛑️",
    tipo: "equipable", categoria: "equipable", slot: "casco", nivel: 2,
    stats: { defensa: 2, hpMax: 1 }, descripcion: "+2 defensa · +1 HP máximo",
  },
  CASCO_CORONA: {
    id: "CASCO_CORONA", nombre: "Corona del guardián", icono: "👑",
    tipo: "equipable", categoria: "equipable", slot: "casco", nivel: 3,
    stats: { defensa: 3, ataque: 1 }, descripcion: "+3 defensa · +1 ataque", unico: true,
  },

  PECHERA_CUERO: {
    id: "PECHERA_CUERO", nombre: "Pechera de cuero", icono: "🦺",
    tipo: "equipable", categoria: "equipable", slot: "pechera", nivel: 0,
    stats: { hpMax: 2 }, descripcion: "+2 HP máximo",
  },
  PECHERA_HIERRO: {
    id: "PECHERA_HIERRO", nombre: "Pechera de hierro", icono: "🦺",
    tipo: "equipable", categoria: "equipable", slot: "pechera", nivel: 1,
    stats: { hpMax: 3 }, descripcion: "+3 HP máximo",
  },
  PECHERA_ESCAMA: {
    id: "PECHERA_ESCAMA", nombre: "Pechera de escamas", icono: "🦺",
    tipo: "equipable", categoria: "equipable", slot: "pechera", nivel: 2,
    stats: { hpMax: 5, defensa: 1 }, descripcion: "+5 HP máximo · +1 defensa",
  },
  PECHERA_CORAZON: {
    id: "PECHERA_CORAZON", nombre: "Pechera del corazón", icono: "🫀",
    tipo: "equipable", categoria: "equipable", slot: "pechera", nivel: 3,
    stats: { hpMax: 7, defensa: 1 }, descripcion: "+7 HP máximo · +1 defensa", unico: true,
  },

  GUANTES_CUERO: {
    id: "GUANTES_CUERO", nombre: "Guantes de cuero", icono: "🧤",
    tipo: "equipable", categoria: "equipable", slot: "guantes", nivel: 0,
    stats: { ataque: 1 }, descripcion: "+1 ataque",
  },
  GUANTES_HIERRO: {
    id: "GUANTES_HIERRO", nombre: "Guantes de hierro", icono: "🧤",
    tipo: "equipable", categoria: "equipable", slot: "guantes", nivel: 1,
    stats: { ataque: 1, rotura: 0.05 }, descripcion: "+1 ataque · +5% rotura",
  },
  GUANTES_ACERO: {
    id: "GUANTES_ACERO", nombre: "Guantes de acero", icono: "🧤",
    tipo: "equipable", categoria: "equipable", slot: "guantes", nivel: 2,
    stats: { ataque: 2, rotura: 0.10 }, descripcion: "+2 ataque · +10% rotura",
  },
  GUANTES_TITAN: {
    id: "GUANTES_TITAN", nombre: "Guantes del titán", icono: "✊",
    tipo: "equipable", categoria: "equipable", slot: "guantes", nivel: 3,
    stats: { ataque: 3, defensa: 1, rotura: 0.10 }, descripcion: "+3 ataque · +1 defensa · +10% rotura", unico: true,
  },

  BOTAS_CUERO: {
    id: "BOTAS_CUERO", nombre: "Botas de cuero", icono: "👢",
    tipo: "equipable", categoria: "equipable", slot: "botas", nivel: 0,
    stats: { velocidad: 0.04 }, descripcion: "+4% velocidad",
  },
  BOTAS_HIERRO: {
    id: "BOTAS_HIERRO", nombre: "Botas de hierro", icono: "👢",
    tipo: "equipable", categoria: "equipable", slot: "botas", nivel: 1,
    stats: { velocidad: 0.07 }, descripcion: "+7% velocidad",
  },
  BOTAS_ESCAMA: {
    id: "BOTAS_ESCAMA", nombre: "Botas de escamas", icono: "👢",
    tipo: "equipable", categoria: "equipable", slot: "botas", nivel: 2,
    stats: { velocidad: 0.10 }, descripcion: "+10% velocidad",
  },
  BOTAS_VIENTO: {
    id: "BOTAS_VIENTO", nombre: "Botas del viento", icono: "🪽",
    tipo: "equipable", categoria: "equipable", slot: "botas", nivel: 3,
    stats: { velocidad: 0.15, hpMax: 1 }, descripcion: "+15% velocidad · +1 HP máximo", unico: true,
  },
};

const _equipoPorSlotNivel = {};
for (const item of Object.values(EQUIPO)) {
  if (!_equipoPorSlotNivel[item.slot]) _equipoPorSlotNivel[item.slot] = {};
  _equipoPorSlotNivel[item.slot][item.nivel] = item.id;
}

function registrarCatalogoEquipamiento() {
  for (const def of Object.values(HERRAMIENTAS)) {
    for (const nivel of def.niveles) {
      const esLinterna = def.tipo === "LINTERNA";
      const detalle = esLinterna
        ? `Visión nocturna +${nivel.vision}`
        : `Velocidad de rotura x${nivel.velocidad.toFixed(2)}`;
      CATALOGO_ITEMS[nivel.id] = {
        ...(CATALOGO_ITEMS[nivel.id] || {}),
        id: nivel.id,
        nombre: nivel.nombre,
        icono: def.icono,
        tipo: "herramienta",
        categoria: "accion",
        slot: def.tipo,
        nivel: nivel.nivel,
        material: nivel.material,
        velocidad: nivel.velocidad,
        vision: nivel.vision || 0,
        unico: !!nivel.unico,
        descripcion: `${detalle} · ${NIVELES_EQUIPO[nivel.nivel].nombre}`,
      };
    }
  }

  for (const item of Object.values(EQUIPO)) {
    CATALOGO_ITEMS[item.id] = {
      ...(CATALOGO_ITEMS[item.id] || {}),
      ...item,
      nivelNombre: NIVELES_EQUIPO[item.nivel].nombre,
    };
  }
}

function asegurarEquipamiento() {
  if (!estado.equipamiento || typeof estado.equipamiento !== "object") {
    estado.equipamiento = {};
  }

  const eq = estado.equipamiento;
  if (!eq.equipo || typeof eq.equipo !== "object") eq.equipo = {};
  for (const slot of SLOTS_EQUIPO) {
    if (!Object.prototype.hasOwnProperty.call(eq.equipo, slot.id)) eq.equipo[slot.id] = null;
    if (eq.equipo[slot.id] && !EQUIPO[eq.equipo[slot.id]]) eq.equipo[slot.id] = null;
  }
  if (!(eq.unicos instanceof Set)) eq.unicos = new Set();
  return eq;
}

function migrarAcciones() {
  for (const def of Object.values(HERRAMIENTAS)) {
    const ids = def.niveles.map((n) => n.id).filter((id) => (estado.inventario[id] || 0) > 0);
    if (ids.length <= 1) continue;

    let mejor = null;
    for (const id of ids) {
      const nivel = def.niveles.find((n) => n.id === id).nivel;
      if (!mejor || nivel > mejor.nivel) mejor = { id, nivel };
    }

    for (const id of ids) {
      if (id !== mejor.id) delete estado.inventario[id];
    }
    estado.inventario[mejor.id] = 1;
  }
}

function nivelDeItem(id) {
  const datos = obtenerDatosItem(id);
  return Number.isInteger(datos.nivel) ? datos.nivel : 0;
}

function obtenerAccion(tipo) {
  const def = HERRAMIENTAS[tipo];
  if (!def) return null;

  let mejor = null;
  for (const nivel of def.niveles) {
    if ((estado.inventario[nivel.id] || 0) <= 0) continue;
    if (!mejor || nivel.nivel > mejor.nivel) mejor = nivel;
  }
  if (!mejor) return null;

  return {
    ...obtenerDatosItem(mejor.id),
    nivel: mejor.nivel,
    nivelNombre: NIVELES_EQUIPO[mejor.nivel].nombre,
    velocidad: mejor.velocidad,
    vision: mejor.vision || 0,
  };
}

function tieneAccion(tipo) {
  return !!obtenerAccion(tipo);
}

function listarAcciones() {
  return Object.keys(HERRAMIENTAS)
    .map((tipo) => obtenerAccion(tipo))
    .filter(Boolean);
}

function idHerramienta(tipo, nivel) {
  const def = HERRAMIENTAS[tipo];
  if (!def) return null;
  const n = Math.max(0, Math.min(def.niveles.length - 1, Math.floor(Number(nivel) || 0)));
  return def.niveles[n].id;
}

function idEquipo(slot, nivel) {
  const mapa = _equipoPorSlotNivel[slot];
  if (!mapa) return null;
  return mapa[nivel] || mapa[0] || null;
}

function crearEquipo(slot, nivel) {
  const id = idEquipo(slot, nivel);
  if (!id) return null;
  return { ...obtenerDatosItem(id), slot, nivel };
}

function estaEnInventarioOEquipado(id) {
  if ((estado.inventario[id] || 0) > 0) return true;
  const eq = asegurarEquipamiento();
  return Object.values(eq.equipo).includes(id);
}

function recogerAccion(tipo, nivel) {
  const def = HERRAMIENTAS[tipo];
  if (!def) return { ok: false, motivo: "inexistente" };

  const n = Math.max(0, Math.min(def.niveles.length - 1, Math.floor(Number(nivel) || 0)));
  const nuevo = def.niveles[n];
  const eq = asegurarEquipamiento();
  const actual = obtenerAccion(tipo);

  if (actual && actual.nivel >= nuevo.nivel) {
    return {
      ok: false,
      motivo: actual.nivel === nuevo.nivel ? "igual" : "mejor",
      actual,
      item: obtenerDatosItem(nuevo.id),
    };
  }

  if (nuevo.unico && eq.unicos.has(nuevo.id)) {
    return { ok: false, motivo: "unico", actual, item: obtenerDatosItem(nuevo.id) };
  }

  for (const nivelDef of def.niveles) delete estado.inventario[nivelDef.id];
  estado.inventario[nuevo.id] = 1;
  if (nuevo.unico) eq.unicos.add(nuevo.id);

  if (typeof actualizarHUD === "function") actualizarHUD();
  if (typeof MenuJugador !== "undefined" && typeof MenuJugador.actualizar === "function") {
    MenuJugador.actualizar();
  }

  return {
    ok: true,
    item: obtenerDatosItem(nuevo.id),
    mejora: !!actual,
    anterior: actual,
  };
}

function recogerEquipo(id) {
  const datos = obtenerDatosItem(id);
  if (datos.categoria !== "equipable" || !datos.slot) {
    return { ok: false, motivo: "no-equipable", item: datos };
  }

  const eq = asegurarEquipamiento();
  if (datos.unico && (eq.unicos.has(id) || estaEnInventarioOEquipado(id))) {
    return { ok: false, motivo: "unico", item: datos };
  }

  if (datos.categoria === "equipable" && !datos.unico && typeof LIMITE_PILA_EQUIPO !== "undefined" &&
      (estado.inventario[id] || 0) >= LIMITE_PILA_EQUIPO) {
    return { ok: false, motivo: "lleno", item: datos };
  }

  agregarItemInventario(id, 1);
  if (datos.unico) eq.unicos.add(id);

  if (typeof actualizarHUD === "function") actualizarHUD();
  if (typeof MenuJugador !== "undefined" && typeof MenuJugador.actualizar === "function") {
    MenuJugador.actualizar();
  }

  return { ok: true, item: datos };
}

function equipar(id) {
  const datos = obtenerDatosItem(id);
  if (datos.categoria !== "equipable" || !datos.slot) {
    return { ok: false, motivo: "no-equipable" };
  }
  if ((estado.inventario[id] || 0) <= 0) {
    return { ok: false, motivo: "inventario" };
  }

  const eq = asegurarEquipamiento();
  const anterior = eq.equipo[datos.slot] || null;

  estado.inventario[id] -= 1;
  if (estado.inventario[id] <= 0) delete estado.inventario[id];

  if (anterior) {
    estado.inventario[anterior] = (estado.inventario[anterior] || 0) + 1;
  }

  eq.equipo[datos.slot] = id;
  recalcularStatsEquipo(true);
  return { ok: true, item: datos, anterior };
}

function desequipar(slot) {
  const eq = asegurarEquipamiento();
  const id = eq.equipo[slot];
  if (!id) return { ok: false, motivo: "vacio" };

  eq.equipo[slot] = null;
  estado.inventario[id] = (estado.inventario[id] || 0) + 1;
  recalcularStatsEquipo(false);
  return { ok: true, item: obtenerDatosItem(id) };
}

function recalcularStatsEquipo(curarDiferencia) {
  if (typeof Progresion !== "undefined") {
    Progresion.recalcularStatsJugador(curarDiferencia === true);
  }
  if (typeof actualizarHUD === "function") actualizarHUD();
  if (typeof MenuJugador !== "undefined" && typeof MenuJugador.actualizar === "function") {
    MenuJugador.actualizar();
  }
}

function obtenerEquipoEquipado() {
  const eq = asegurarEquipamiento();
  return SLOTS_EQUIPO.map((slot) => ({
    ...slot,
    item: eq.equipo[slot.id] ? obtenerDatosItem(eq.equipo[slot.id]) : null,
  }));
}

function listarEquipoInventario() {
  return listarInventario()
    .filter((item) => item.categoria === "equipable")
    .sort((a, b) => {
      const orden = (item) => {
        const idx = SLOTS_EQUIPO.findIndex((slot) => slot.id === item.slot);
        return (idx < 0 ? 99 : idx) * 10 + (item.nivel || 0);
      };
      return orden(a) - orden(b) || a.nombre.localeCompare(b.nombre);
    });
}

function obtenerBonos() {
  const eq = asegurarEquipamiento();
  const bonos = { hpMax: 0, ataque: 0, defensa: 0, velocidad: 0, rotura: 0, vision: 0 };

  for (const slot of SLOTS_EQUIPO) {
    const id = eq.equipo[slot.id];
    if (!id) continue;
    const stats = EQUIPO[id] && EQUIPO[id].stats;
    if (!stats) continue;
    for (const clave of Object.keys(bonos)) {
      if (Number.isFinite(stats[clave])) bonos[clave] += stats[clave];
    }
  }

  const linterna = obtenerAccion("LINTERNA");
  if (linterna) bonos.vision += linterna.vision || 0;
  return bonos;
}

function obtenerVelocidadHerramienta(tipo) {
  const actual = obtenerAccion(tipo);
  return actual && Number.isFinite(actual.velocidad) ? actual.velocidad : 1;
}

function obtenerVision() {
  return obtenerBonos().vision;
}

function elegirNivel(rng, cx, cy) {
  const distancia = Math.min(1, Math.hypot(Number(cx) || 0, Number(cy) || 0) / 6);
  const legendario = 0.01 + distancia * 0.04;
  const especial = 0.07 + distancia * 0.08;
  const normal = 0.24 + distancia * 0.10;
  const tirada = rng();

  if (tirada < legendario) return 3;
  if (tirada < legendario + especial) return 2;
  if (tirada < legendario + especial + normal) return 1;
  return 0;
}

function reiniciarEquipamiento() {
  estado.equipamiento = {
    equipo: { casco: null, pechera: null, guantes: null, botas: null },
    unicos: new Set(),
  };
}

const Equipamiento = {
  NIVELES: NIVELES_EQUIPO,
  HERRAMIENTAS,
  EQUIPO,
  SLOTS: SLOTS_EQUIPO.map((slot) => slot.id),
  SLOTS_INFO: SLOTS_EQUIPO,

  asegurarEquipamiento,
  obtenerAccion,
  tieneAccion,
  listarAcciones,
  idHerramienta,
  idEquipo,
  crearEquipo,
  recogerAccion,
  recogerEquipo,
  equipar,
  desequipar,
  obtenerEquipoEquipado,
  listarEquipoInventario,
  obtenerBonos,
  obtenerVelocidadHerramienta,
  obtenerVision,
  elegirNivel,
  nivelDeItem,
  reiniciarEquipamiento,
};

registrarCatalogoEquipamiento();
asegurarEquipamiento();
migrarAcciones();

window.Equipamiento = Equipamiento;
