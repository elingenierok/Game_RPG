// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.7 · MOBS · Plantilla base + datos
// ─────────────────────────────────────────────────────────────────
//  Cada mob es un objeto con una estructura común. El motor de
//  spawn/render/colisión lee estos datos y actúa en consecuencia.
//
//  ⚠️  MUCHOS CAMPOS NO SE USAN TODAVÍA. Están definidos para que
//      cuando agreguemos IA, loot, combate, no haya que reescribir.
//
//  Estado actual (v1.1):
//    ✔ Se usa: emoji, spawn.porChunk, spawn.biomas, colision.alChocar
//    ⏸ Se ignora: hp, ataque, actitud, movilidad, deteccion, loot
// ═══════════════════════════════════════════════════════════════

const MOBS = {
  tigre: {
    // Identidad
    id: "tigre",
    nombre: "Tigre",
    emoji: "🐅",

    // Stats (ignorados por ahora)
    hp: 12,
    ataque: 5,
    defensa: 2,
    velocidadAtaque: 2,

    // Aparición
    spawn: {
      porChunk: [0, 2],              // rango min-max por chunk
      porMapa: null,                 // null = sin límite global (por ahora)
      biomas: {                      // true = aparece, false = no
        bosque:   true,
        pradera:  false,
        costa:    false,
        ruina:    true,
      },
      tipoAparicion: "ambos",        // "diurna" | "nocturna" | "ambos" (futuro)
      forzarEnEstructura: null,      // ej: "cueva" (futuro)
      nivelMinimoJugador: 1,
    },

    // Actitud
    actitud: {
      base: "agresivo",              // "neutral" | "agresivo" | "pasivo"
      seVuelveAgresivoSi: "nunca",
      seVuelveNeutralSi: "nunca",
    },

    // Movilidad (ignorada por ahora)
    movilidad: {
      tipo: "fijo",
      velocidad: 0,
      rangoPatrulla: 0,
    },

    // Detección (ignorada por ahora)
    deteccion: {
      distancia: 0,
      persecucion: 0,
      alejamiento: 0,
      requiereVision: false,
      afectadoPorArbustos: false,
    },

    // Colisión
    colision: {
      alChocar: "batalla",           // "nada" | "batalla" | "ataca" | "huye"
      requiereInteraccion: false,
    },

    // Eliminación
    eliminacion: {
      seEliminaSi: "alGanarBatalla",
      reaparece: false,
      tiempoRespawn: 0,
    },

    // Loot (ignorado por ahora)
    loot: {
      dropea: false,
      probabilidad: 0,
      objetos: [],
      xp: 5,
    },
  },

  gallina: {
    id: "gallina",
    nombre: "Gallina",
    emoji: "🐓",

    hp: 3,
    ataque: 0,
    defensa: 0,
    velocidadAtaque: 0,

    spawn: {
      porChunk: [0, 2],
      porMapa: null,
      biomas: {
        bosque:   false,
        pradera:  true,
        costa:    false,
        ruina:    false,
      },
      tipoAparicion: "ambos",
      forzarEnEstructura: null,
      nivelMinimoJugador: 1,
    },

    actitud: {
      base: "pasivo",
      seVuelveAgresivoSi: "nunca",
      seVuelveNeutralSi: "nunca",
    },

    movilidad: {
      tipo: "libre",                 // ⏸ TODO: implementar huida
      velocidad: 1,
      rangoPatrulla: 0,
    },

    deteccion: {
      distancia: 4,
      persecucion: 0,
      alejamiento: 0,
      requiereVision: false,
      afectadoPorArbustos: false,
    },

    colision: {
      alChocar: "nada",              // ⏸ no hace nada al chocar
      requiereInteraccion: false,
    },

    eliminacion: {
      seEliminaSi: "alMatarlo",
      reaparece: false,
      tiempoRespawn: 0,
    },

    loot: {
      dropea: true,                  // ⏸ pendiente
      probabilidad: 0.8,
      objetos: [{ id: "pluma", prob: 1.0 }],
      xp: 1,
    },
  },

  cerdo: {
    id: "cerdo",
    nombre: "Cerdo",
    emoji: "🐖",

    hp: 6,
    ataque: 2,
    defensa: 1,
    velocidadAtaque: 2,

    spawn: {
      porChunk: [0, 2],
      porMapa: null,
      biomas: {
        bosque:   false,
        pradera:  true,
        costa:    true,
        ruina:    false,
      },
      tipoAparicion: "ambos",
      forzarEnEstructura: null,
      nivelMinimoJugador: 1,
    },

    actitud: {
      base: "neutral",
      seVuelveAgresivoSi: "loAtacan", // ⏸ pendiente
      seVuelveNeutralSi: "nunca",
    },

    movilidad: {
      tipo: "fijo",
      velocidad: 0,
      rangoPatrulla: 0,
    },

    deteccion: {
      distancia: 3,
      persecucion: 0,
      alejamiento: 0,
      requiereVision: false,
      afectadoPorArbustos: false,
    },

    colision: {
      alChocar: "nada",
      requiereInteraccion: true,     // ⏸ requiere acción explícita
    },

    eliminacion: {
      seEliminaSi: "alMatarlo",
      reaparece: false,
      tiempoRespawn: 0,
    },

    loot: {
      dropea: true,
      probabilidad: 0.6,
      objetos: [{ id: "carne", prob: 1.0 }],
      xp: 3,
    },
  },
};