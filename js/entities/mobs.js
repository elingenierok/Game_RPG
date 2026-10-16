// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.7 · MOBS · Plantilla base + datos
// ─────────────────────────────────────────────────────────────────
//  Cada mob es un objeto con una estructura común. El motor de
//  spawn/render/colisión/IA lee estos datos y actúa.
//
//  ⚠️  MUCHOS CAMPOS NO SE USAN TODAVÍA. Están definidos para que
//      cuando agreguemos loot, combate, etc., no haya que reescribir.
//
//  Estado actual (v1.5):
//    ✔ Se usa: emoji, spawn.porChunk, spawn.biomas, colision.alChocar,
//              actitud.base, movilidad.velocidad, deteccion.distancia
//    ⏸ Se ignora: hp, ataque, defensa, loot
// ═══════════════════════════════════════════════════════════════

const MOBS = {
  tigre: {
    id: "tigre",
    nombre: "Tigre",
    emoji: "🐅",

    hp: 12,
    ataque: 5,
    defensa: 2,
    velocidadAtaque: 2,

    spawn: {
      porChunk: [2, 3],
      porMapa: null,
      biomas: {
        bosque:   true,
        pradera:  false,
        costa:    true,
        ruina:    true,
        nieve:    true,
      },
      tipoAparicion: "ambos",
      forzarEnEstructura: null,
      nivelMinimoJugador: 1,
    },

    actitud: {
      base: "hostil",                // "neutral" | "hostil" | "pacifico"
      seVuelveAgresivoSi: "nunca",
      seVuelveNeutralSi: "nunca",
    },

    movilidad: {
      tipo: "movil",
      velocidad: 1,                  // tiles por tick cuando persigue
      rangoPatrulla: 0,
    },

    deteccion: {
      distancia: 6,                  // rango de detección del jugador
      persecucion: 0,
      alejamiento: 0,
      requiereVision: false,
      afectadoPorArbustos: false,
    },

    colision: {
      alChocar: "batalla",
      requiereInteraccion: false,
    },

    eliminacion: {
      seEliminaSi: "alGanarBatalla",
      reaparece: false,
      tiempoRespawn: 0,
    },

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
      base: "pacifico",              // huye del jugador
      seVuelveAgresivoSi: "nunca",
      seVuelveNeutralSi: "nunca",
    },

    movilidad: {
      tipo: "movil",
      velocidad: 1,                  // tiles por tick cuando huye
      rangoPatrulla: 0,
    },

    deteccion: {
      distancia: 4,                  // rango de detección del jugador
      persecucion: 0,
      alejamiento: 0,
      requiereVision: false,
      afectadoPorArbustos: false,
    },

    colision: {
      alChocar: "nada",              // no hace nada al chocar
      requiereInteraccion: false,
    },

    eliminacion: {
      seEliminaSi: "alMatarlo",
      reaparece: false,
      tiempoRespawn: 0,
    },

    loot: {
      dropea: true,
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
      base: "neutral",               // quieto, ataca solo si lo atacan
      seVuelveAgresivoSi: "loAtacan",
      seVuelveNeutralSi: "nunca",
    },

    movilidad: {
      tipo: "fijo",                  // no se mueve
      velocidad: 0,
      rangoPatrulla: 0,
    },

    deteccion: {
      distancia: 0,
      persecucion: 0,
      alejamiento: 0,
      requiereVision: false,
      afectadoPorArbustos: false,
    },

    colision: {
      alChocar: "nada",
      requiereInteraccion: true,
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