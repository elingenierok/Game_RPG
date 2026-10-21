# 🎮 Game_RPG · Proyecto Roguelike Procedural

> Motor de mundo procedural con semilla, mundo 2D circular, cámara fluida,
> chunks de 32×32, biomas por celda con ruido, ítems recolectables,
> mobs con IA en tiempo real, sistema de efectos visuales genéricos,
> combate con timing y ataques telegrafiados, progresión con XP,
> loot por mob, equipamiento por niveles y menú único del jugador.

---

## 📌 Estado actual del proyecto

| Campo | Valor |
|-------|-------|
| **Versión actual** | v2.10-alpha · F28 completo + F30 (XP, habilidades y menú) + F13 (loot por mob) + F12 (equipamiento por niveles) + F1 (ciclo día-noche y luz) |
| **Última actualización** | 2026-10-21 (F1 día-noche y luz; F12 equipamiento y rotura; F30 progresión; F13 loot/XP; combate F28 completo) |
| **Estado global** | ✅ Jugable · Combate completo · sin bugs críticos conocidos |
| **Archivo principal** | `index.html` (solo estructura HTML) |
| **Lenguaje** | HTML + CSS + JavaScript (sin dependencias) |
| **Ejecución local** | Live Server en VS Code |
| **Ejecución pública** | [elingenierok.github.io/Game_RPG](https://elingenierok.github.io/Game_RPG/) |
| **Repositorio** | [github.com/elingenierok/Game_RPG](https://github.com/elingenierok/Game_RPG) |
| **Editor** | VS Code |
| **Carpeta raíz** | _(depende del PC: `C:\Users\Usuario\Game_RPG` o similar)_ |

📖 **Documentos complementarios:**

- [CHANGELOG.md](CHANGELOG.md) — Historial completo de versiones
- [BACKLOG.md](BACKLOG.md) — Ideas futuras (F1-F33)
- [AGENTS.md](AGENTS.md) — Configuración para agentes de IA (OpenCode)

---

## 🎯 Objetivo del proyecto

Probar una **jugabilidad base** que, si resulta entretenida, escala hacia:

- Mapas más grandes y complejos
- Mobs con IA, actitudes y loot
- Sistema de combate por reflejos
- Estructuras estáticas (casas, edificios, ruinas)
- Objetos recolectables e inventario funcional
- Misiones y acertijos
- Múltiples pantallas/menús

**Frase guía:** *"Si el test se siente entretenido, agrego complejidad."*

---

## 🚀 Cómo ejecutar

### Opción A · Desarrollo local (Live Server)

1. Abrir VS Code en la carpeta raíz del proyecto.
2. Click derecho en `index.html` → **Open with Live Server**.
3. Editar cualquier archivo y guardar (`Ctrl+S`) → Live Server recarga solo.

**⚠️ Importante:** por la arquitectura de múltiples archivos, **abrir el `index.html` con doble clic no funciona** (CORS bloquea la carga de `.js` desde `file://`). **Siempre usar Live Server.**

### Opción B · Versión pública (GitHub Pages)

**👉 [https://elingenierok.github.io/Game_RPG/](https://elingenierok.github.io/Game_RPG/)**

Se actualiza automáticamente al hacer `git push`.

### Controles

- **WASD** o **flechas direccionales** para moverte (360°).
- **Botones en pantalla** (izquierda).
- Enter en el input de semilla → aplicar.
- Botón 🎲 → semilla aleatoria.
- Click en el mundo → romper (con objeto equipado) / colocar barco / desembarcar.
- **Espacio** → atacar / defender durante el combate (minijuego de timing).
- Botón 🌍 / 🚀 (arriba a la derecha) → cambiar tema (tierra ↔ espacio).
- Botón 🎁 (arriba a la derecha, junto al de tema) → **cheat de test** (carga/limpia equipables).

**⚠️ Recarga forzada:** usar `Ctrl+Shift+R` al modificar `.js` o `.css`.

---

## 📁 Estructura del proyecto

```text
Game_RPG/
├── auditor/                      ← Herramienta auxiliar de diagnóstico
│   ├── auditor.html              ← Auditor de semillas 2D
│   ├── auditor.css
│   ├── auditor.js
│   └── laboratorio-v1.html       ← Laboratorio de emojis y efectos (herramienta)
├── pruebas/                      ← Archivos de prueba aislados
│   ├── catalogo.html             ← Catálogo de efectos visuales (herramienta)
│   ├── barra-timing.html         ← Prueba del minijuego de timing (F28 fase 3)
│   └── pruebas/
│       └── biomas.html           ← Prueba de generación de biomas
├── index.html                    ← Solo HTML (estructura + <script src>)
├── README.md                     ← Este documento
├── CHANGELOG.md                  ← Historial de versiones
├── BACKLOG.md                    ← Ideas futuras (F1-F33)
├── AGENTS.md                     ← Configuración para agentes de IA
├── opencode.json                 ← Configuración de OpenCode
├── .gitignore                    ← Archivos ignorados por Git
├── css/
│   └── estilo.css                ← Todo el CSS del juego
└── js/
    ├── main.js                   ← Entry point (arranque + reinicio + loop)
    │
    ├── core/                     ← Base del motor
    │   ├── config.js             ← BLOQUE 1: constantes globales
    │   ├── rng.js                ← BLOQUE 3: hash, PRNG, randInt
    │   ├── ruido.js              ← BLOQUE 3.5: Value Noise + fBm
    │   ├── tiles.js              ← BLOQUE 2: tiles, iconos, bloqueantes
    │   ├── tiles_muestrario.md   ← Referencia de uso de tiles (documento)
    │   ├── estado.js             ← BLOQUE 7: estado global (coords del mundo)
    │   ├── input.js              ← BLOQUE 14: listeners de teclado
    │   └── temas/                ← Datos temáticos (tierra / espacio)
    │       ├── tema-tierra.js
    │       └── tema-espacio.js
    │
    ├── world/                    ← Generación y gestión del mundo
    │   ├── biomas.js             ← BLOQUE 5.1: wrapper de biomas del tema
    │   ├── mundo.js              ← BLOQUES 4, 5, 6: generación de chunks 2D
    │   └── chunks.js             ← BLOQUE 8: caché 2D + inicialización
    │
    ├── entities/                 ← Todo lo que "vive" en el mundo
    │   ├── jugador.js            ← BLOQUE 12: movimiento 360° + recolección
    │   ├── mobs.js               ← BLOQUE 7.7: wrapper de mobs del tema
    │   ├── enemigos.js           ← BLOQUE 7.8: spawn, colisión, derrota, removerMobEn
    │   └── items.js              ← BLOQUE 7.5: ítems y equipables
    │
    ├── ui/                       ← Render visual y pantallas
    │   ├── render.js             ← BLOQUES 9, 10, 11: render y HUD
    │   ├── combate-ui.js         ← BLOQUE 13.7: overlay de combate
    │   ├── menu-jugador.js       ← BLOQUE 7.18: menú único con pestañas
    │   └── victoria.js           ← BLOQUES 13, 13.5: victoria + batalla (delega a combate.js)
    │
    └── systems/                  ← Sistemas transversales
        ├── camara.js             ← BLOQUE 20: cámara fluida
        ├── progresion.js         ← BLOQUE 7.16: XP, habilidades y stats
        ├── loot.js               ← BLOQUE 7.17: loot y XP por mob
        ├── equipamiento.js       ← BLOQUE 7.19: niveles, acciones y slots de equipo (F12)
        ├── ciclo.js              ← BLOQUE 7.20: ciclo día-noche y luz (F1)
        ├── efectos.js            ← BLOQUE 7.12: efectos visuales genéricos
        ├── barra-timing.js       ← BLOQUE 7.13: minijuego de timing
        ├── combate.js            ← BLOQUE 7.14: lógica de combate por turnos
        ├── ia.js                 ← BLOQUE 7.9: IA de mobs en tiempo real
        ├── rotura.js             ← BLOQUE 7.10: sistema de rotura
        ├── barco.js              ← BLOQUE 7.11: sistema del barco
        └── cheats.js             ← BLOQUE 99: CHEATS TEMPORALES (borrar antes de producción)
```

**Orden de carga en `index.html` (importante respetar):**

```text
tema-tierra → tema-espacio → config → ruido → tiles → rng → biomas → mundo
→ camara → estado → progresion → chunks → items → equipamiento → ciclo → mobs → loot → enemigos
→ efectos → barra-timing → render → ia → jugador → combate-ui → combate
→ menu-jugador → victoria → input → rotura → barco → cheats → main
```

**Criterio de organización en carpetas:**

| Carpeta | Responsabilidad |
|---------|-----------------|
| `core/` | Base del motor: config, RNG, ruido, tiles, estado, input, temas |
| `world/` | Generación y gestión del terreno: chunks 2D, biomas |
| `entities/` | Todo lo que "vive" en el mundo: jugador, mobs, ítems |
| `ui/` | Render visual, pantallas y overlays |
| `systems/` | Sistemas transversales: cámara, progresión, loot, equipamiento, ciclo día-noche, efectos, timing, combate, IA, rotura, barco, cheats |
| `auditor/` | Herramientas de diagnóstico y experimentación |
| `pruebas/` | Archivos HTML aislados para experimentar (no se cargan desde el juego) |

**Dependencias críticas:**

- `tema-tierra.js` y `tema-espacio.js` **antes** de `config.js`.
- `config.js` **antes** de `tiles.js` (define `TEMA_ACTIVO`).
- `ruido.js` **antes** de `mundo.js` (lo usa `obtenerBiomaDeCelda`).
- `mobs.js` **antes** de `enemigos.js`.
- `camara.js` **antes** de `estado.js`.
- `estado.js` **antes** de `chunks.js`, `items.js`, `progresion.js`, `loot.js`, `mobs.js`, `enemigos.js`.
- `items.js` y `mobs.js` **antes** de `loot.js` (catálogo y datos de mobs).
- `combate.js` **antes** de `menu-jugador.js` (`estadoCombate`).
- `menu-jugador.js` **antes** de `main.js` (reinicio del menú).
- `ciclo.js` **antes** de `render.js` (lo usa `actualizarOscuridadEnGrid`) y **después** de `equipamiento.js` (visión) y `tiles.js` (`HOGUERA`).
- `efectos.js` **antes** de `render.js` (lo usa `actualizarEfectosEnGrid`).
- `efectos.js` **antes** de `rotura.js` y `combate.js` (lo usan `aplicarEfecto` y `quitarEfecto`).
- `barra-timing.js` **antes** de `combate.js` (lo usa `BarraTiming`).
- `render.js` **antes** de `ia.js`.
- `ia.js` **antes** de `jugador.js`.
- `combate-ui.js` **antes** de `combate.js` (lo usa `CombateUI`).
- `combate.js` **antes** de `victoria.js` (que delega a `iniciarCombate`).
- `cheats.js` **antes** de `main.js`.

---

## 🔄 Flujo de trabajo con Git

### Branches

| Branch | Uso |
|--------|-----|
| `main` | Trabajo general · versión estable |
| `2d` | Migración a chunks 2D (a mergear a `main`) |
| `tema-espacio` | Tema espacio (a mergear a `2d` cuando esté pulido) |

### Antes de trabajar

```powershell
git branch          # verificar en qué branch estás
git pull            # traer últimos cambios
```

### Después de trabajar

```powershell
git add .
git commit -m "descripción"
git push
```

### Cambiar de branch

```powershell
git checkout 2d     # ir a migración 2D
git checkout main   # volver a main
```

### Clonar el proyecto en otra PC

```powershell
cd $HOME
git clone https://github.com/elingenierok/Game_RPG.git
cd Game_RPG
```

---

## 🧭 Sistema de estados

| Símbolo | Significado |
|:---:|-------------|
| 🧪 | **En test** — Implementado para probar, puede cambiar |
| 🟢 | **Definido** — Decidido, se mantiene en el proyecto |
| 🟡 | **Pendiente** — Sabemos que hay que decidirlo, sin respuesta aún |
| 🔴 | **Sin información** — No se ha pensado todavía |
| ⏸️ | **Pospuesto** — Se hará en una fase futura |

---

## 🌍 MARCO 1 · Mundo

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| M1 | Direccionalidad del mundo | 🟢 | Mundo 2D circular, ±4 chunks en X e Y | v2.0 |
| M2 | Biomas | 🧪 | 7 tipos: pradera, bosque, costa, ruina, oceano, desierto, nieve | v1.6 |
| M3 | Transición entre biomas | 🟢 | Suave (por ruido) | v2.4-alpha |
| M4 | Tamaño del chunk | 🟢 | 32×32 celdas | v2.0 |
| M5 | Memoria de cambios del jugador | ⏸️ | Sin memoria | Fase futura |
| M6 | Evolución temporal del mundo | ⏸️ | No | Fase futura |
| M7 | Ventana visible | 🟢 | 32×24 celdas | v2.0 |
| M8 | Comportamiento en bordes | 🟢 | Wrap circular en X e Y (tipo Pac-Man) | v2.0 |
| M9 | Fronteras entre chunks | 🟢 | Desaparecieron (biomas por celda) | v2.4-alpha |
| M10 | Continuidad del jugador al cruzar | 🟢 | Cámara fluida · sin saltos | v2.0 |
| M11 | Caché de chunks | 🟢 | Map `"cx,cy"` → chunk | v2.0 |
| M12 | Límite de chunks | 🟢 | ±4 (configurable) | v2.0 |
| M13 | Muros sólidos en extremos | ⏸️ | No aplica (mundo circular) | v2.0 |
| M14 | Tamaño de celda | 🟢 | 24×24 px | v2.0 |
| M15 | Centralización de tamaño | 🟢 | Todo derivado de `config.js` | v1.1 |
| M16 | Radio de seguridad al cruzar | ⏸️ | No aplica (mundo continuo) | v2.0 |
| M17 | Sistema de biomas por tabla | 🟢 | 7 biomas con temperatura + humedad | v2.4-alpha |
| M18 | Bioma inicial | 🟢 | pradera (chunk 0,0) | v1.6 |
| M19 | Costa con forma de franja | 🟢 | Agua + arena + pasto con bordes irregulares | v1.7.1 |
| M20 | Sistema de temas | 🟢 | `tema-tierra` / `tema-espacio` (datos) | v2.2-alpha |
| M21 | Biomas por celda (ruido) | 🟢 | `obtenerBiomaDeCelda` con temp/humedad + `ESCALA_BIOMA = 0.01` | v2.4.1-alpha |
| M22 | Bioma dominante del chunk | 🟢 | Se usa para spawns (mobs e ítems) | v2.4-alpha |
| M23 | Ciclo día-noche | ✅ | Fases: día → atardecer → noche → amanecer. Luz por celda + hoguera. Pausable. Ver BACKLOG · F1 | v2.10-alpha |

---

## 🎮 MARCO 2 · Jugabilidad / Core Loop

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| J1 | Objetivo del juego | 🧪 | Encontrar la 🔑 (o 🔋 en espacio) | Test de exploración |
| J2 | Condición de victoria | 🧪 | Pisar la llave | Pantalla de "¡Ganaste!" |
| J3 | Condición de derrota | 🧪 | HP del jugador en 0 durante combate | v2.5-alpha (F28) |
| J4 | Progresión | ✅ | XP como moneda + habilidades compradas | v2.8-alpha (F30) |
| J5 | Muerte definitiva | 🧪 | Pantalla de derrota + botón de reinicio | v2.6-alpha |
| J6 | Turnos vs tiempo real | 🟢 | Mobs en tiempo real, combate por turnos | Ticks 400ms, turnos 1500ms |
| J7 | Sistema de iniciativa | ⏸️ | No aplica | Fase futura |
| J8 | Pantallas/menús | 🧪 | Mapa + overlay de combate con timing | v2.5-alpha |
| J9 | Cambio entre pantallas | 🧪 | Overlay con pausa global (`estado.pausado`) | v2.5-alpha |
| J10 | Diálogos con NPCs | ⏸️ | No | Fase futura |
| J11 | Sistema de combate | 🟢 | Turnos + timing + ataques telegrafiados por mob (F28) | v2.7-alpha |
| J12 | Escalado del timing | ⏸️ | Por mob y por fase del día | Ver BACKLOG · F29 |
| J13 | Sistema de niveles del jugador | ✅ | Nivel = 1 + rangos comprados | v2.8-alpha (F30) |

---

## 🏃‍♂️ MARCO 3 · Personaje / Jugador

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| P1 | Cantidad de personajes | 🟢 | 1 | Sin clases por ahora |
| P2 | Estadísticas | 🧪 | HP 20, ataque 3, defensa 1, velocidad 1, nivel 1 | v2.5-alpha (F28 fase 1) |
| P3 | Controles | 🟢 | WASD + flechas + botones + Espacio (combate) | v2.5-alpha |
| P4 | Inventario | 🧪 | Contador + menú con categorías Acciones/Equipables/Uso | v2.9-alpha (F12) |
| P5 | Tipos de objetos | 🧪 | 🍎 + acciones por nivel + equipo por slots (🪓 ⛏️ 🕯️ 🛶 + ⛑️ 🦺 🧤 👢) | v2.9-alpha (F12) |
| P6 | Equipamiento y niveles | ✅ | Acciones auto-mejorables + 4 slots de equipo | v2.9-alpha (F12) |
| P6 | Habilidades especiales | ⏸️ | Ninguna | Fase futura |
| P7 | Modificar el mundo | 🟢 | Romper árboles, piedras, muros, cactus, hielo | v1.7 |
| P8 | Necesidades (hambre/sed) | ⏸️ | No | Fase futura |
| P9 | Orientación visual del jugador | 🟢 | Espejado horizontal (`scaleX(-1)`) | v1.1 |
| P10 | Movimiento | 🟢 | 360° fluido (100ms por celda) | v2.0 |
| P11 | Animación de movimiento | 🟢 | Alterna 2 emojis cada 150ms | v2.3-alpha |
| P12 | Velocidad del jugador | 🟢 | Constante (100ms/celda) | Solo equipables la modifican (F12) |
| P13 | Huida del combate | 🧪 | Probabilística con penalización + mob desaparece | v2.5-alpha (F28 fase 6) |

---

## ⚔️ MARCO 4 · Mobs y Combate

### Sistema de mobs

Cada mob es un **objeto de datos** con una estructura común.

**Estructura de un mob:**

```js
{
  id, nombre, emoji,
  hp, ataque, defensa, velocidadAtaque,
  duracionTimingMs,  // ← nuevo (F29, futuro)
  spawn: {
    porChunk, porMapa, biomas, tipoAparicion,
    forzarEnEstructura, nivelMinimoJugador
  },
  actitud: { base, seVuelveAgresivoSi, seVuelveNeutralSi },
  movilidad: { tipo, velocidad, rangoPatrulla },
  deteccion: {
    distancia, persecucion, alejamiento,
    requiereVision, afectadoPorArbustos
  },
  colision: { alChocar, requiereInteraccion },
  eliminacion: { seEliminaSi, reaparece, tiempoRespawn },
  loot: { dropea, probabilidad, objetos, xp },
}
```

### Mobs implementados (tema tierra)

| Mob | Emoji | Actitud | Spawn por chunk | Biomas | Rango detección | Al chocar |
|-----|:-----:|---------|:---------------:|--------|:---------------:|-----------|
| Tigre | 🐅 | Hostil | 2-3 | Bosque, Costa, Ruina, Nieve | 6 tiles | ⚔️ Combate |
| Gallina | 🐓 | Pacífico | 0-2 | Pradera | 4 tiles | Nada (bloquea) |
| Cerdo | 🐖 | Neutral | 0-2 | Pradera, Costa | — | Nada (bloquea) |

### Mobs implementados (tema espacio)

| Mob | Emoji | Actitud | Basado en |
|-----|:-----:|---------|-----------|
| Alien hostil | 👽 | Hostil | Tigre |
| Dron pacífico | 🤖 | Pacífico | Gallina |
| Reptiliano neutral | 🦎 | Neutral | Cerdo |

### Estados de IA

| Estado | Comportamiento | Velocidad |
|--------|----------------|:---------:|
| `DEAMBULANDO` | Movimiento aleatorio | 1 tile cada 2 ticks |
| `PERSIGUIENDO` | Se mueve hacia el jugador (hostil) | 1 tile por tick |
| `HUYENDO` | Se mueve lejos del jugador (pacífico) | 1 tile por tick |
| `QUIETO` | No se mueve (neutral) | — |

### Decisiones de diseño

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| E1 | Tipos de mobs | 🧪 | 3 por tema (🐅 🐓 🐖 / 👽 🤖 🦎) | Escalable |
| E2 | Movimiento de mobs | 🟢 | Tiempo real (ticks 400ms) | v1.5 |
| E3 | Detección del jugador | 🟢 | Por distancia Manhattan | v1.5 |
| E4 | Entrada al combate | 🧪 | Choque jugador↔mob → overlay real | v2.5-alpha |
| E5 | Tipo de combate | 🟢 | Turnos + timing con perfiles por ataque | v2.7-alpha (F28.2) |
| E6 | Huida del combate | 🧪 | Probabilística: penalización + mob desaparece | v2.5-alpha (F28 fase 6) |
| E7 | Loot y XP | ✅ | Tabla por mob + drops directos al inventario | v2.8-alpha (F13) |
| E8 | Combate grupal (1vN) | ⏸️ | No | Fase avanzada |
| E9 | Jefes (bosses) | ⏸️ | No | Ver BACKLOG · F27 |
| E10 | Tamaño de enemigos | 🟢 | 1×1 | v1.1 |
| E11 | Separación de semillas | 🟢 | `SEMILLA` + `SEMILLA_MOBS` | v1.3 |
| E12 | Pausa global en batalla | 🟢 | Todo se detiene durante el combate | v2.0 |
| E13 | Categorías de mobs | ⏸️ | 1: normales. 2: especiales. 3: bosses. | Ver BACKLOG · F26, F27 |
| E14 | Timing por mob | ⏸️ | Cada mob con su `duracionTimingMs` | Ver BACKLOG · F29 |
| E15 | Nivel de mob | 🧪 | `(hp + ataque + defensa) / 4` | v2.5-alpha (F28 fase 6) |

---

## 🎒 MARCO 4.5 · Objetos y consumibles

### Manzanas curativas

- **Spawn:** 0-3 ítems por chunk; actualmente todos son manzanas.
- **Uso:** al pisarlas se consumen y curan **1 HP** (medio corazón).
- **Límite:** nunca superan `hpMax`; no aumentan la vida máxima.
- **Al estar al máximo:** la manzana queda en el suelo y muestra `🍎 Vida al máximo`.
- **Inventario:** las manzanas no se acumulan; son comida de uso inmediato.
- **Futuro:** la misma función `curarJugador(cantidad)` servirá para otras comidas o consumibles.

### Objetos equipables y niveles (v2.9-alpha · F12)

- **Acciones:** 🪓 Hacha, ⛏️ Pico, 🔦 Linterna, 🛶 Barco. No se mueven del inventario: al encontrar una versión superior, reemplazan a la anterior automáticamente.
- **Equipo por slots:** ⛑️ Casco, 🦺 Pechera, 🧤 Guantes, 👢 Botas. Se acumulan en el inventario y se equipan por slot; al reemplazar, el objeto anterior vuelve al inventario.
- **Niveles:** Base (0), Normal (1), Especial (2) y Legendario (3). Los legendarios son únicos por mundo.
- **Recogida:** si lo recogido es de nivel superior al que tenés, reemplaza; si es igual o peor, no se guarda.
- **Pila:** equipables no únicos hasta **99**; monedas, oro y materiales sin tope (pensado para vender).
- **Velocidad de rotura:** `0.68 / 0.82 / 0.98 / 1.18` según nivel de hacha o pico.
- **Visión de linterna:** `1 / 2 / 3 / 5` según nivel de linterna. Con F1 el radio de luz del jugador es `1 + visión` celdas (sin linterna ves 3×3).
- **Spawn:** herramientas por bioma (`porChunk: true`) y equipo por chunk (`~12%`), con niveles ponderados por distancia.
- **Slots de equipados en HUD:** arriba del mapa, 4 slots con glow por nivel (`nivel-0` a `nivel-3`).
- **Cheats:** `debugHerramienta("HACHA", 3)`, `debugEquipo(2)` y `debugVision()`.

### Configuración

| Objeto | Bioma asignado |
|--------|:--------------:|
| 🪓 Hacha | bosque |
| ⛏️ Pico | ruina |
| 🕯️ Linterna | costa |
| 🛶 Barco | costa |

**Bonus de equipo (por slot y nivel):**

| Slot | Base | Normal | Especial | Legendario |
|------|------|--------|----------|------------|
| Casco | +1 def | +2 def | +2 def · +1 HP | +3 def · +1 atk |
| Pechera | +2 HP | +3 HP | +5 HP · +1 def | +7 HP · +1 def |
| Guantes | +1 atk | +1 atk · +5% rotura | +2 atk · +10% rotura | +3 atk · +1 def · +10% rotura |
| Botas | +4% vel | +7% vel | +10% vel | +15% vel · +1 HP |

### Sistema de rotura

**Condiciones para romper un tile:**

1. El click debe ser **exactamente sobre** la celda del tile.
2. El jugador debe estar **adyacente** (4 direcciones).
3. Debe tener el objeto correcto equipado.
4. Si falta objeto: cartel "Necesitás un hacha/pico".

**Tiles rompibles actuales:**

| Tile | Objeto | Duración base |
|------|:------:|:-------------:|
| 🌳 TREE | 🪓 HACHA | 3.0 s |
| 🌲 PINE | 🪓 HACHA | 3.0 s |
| 🌵 CACTUS | 🪓 HACHA | 2.5 s |
| ⛰️ ROCK | ⛏️ PICO | 3.0 s |
| 🧱 WALL | ⛏️ PICO | 4.0 s |
| 🧊 ICE | ⛏️ PICO | 2.5 s |

**Duración real:** `duracionMs / (habilidad Herramientas × velocidad de herramienta × bonus de guantes)`.
- Habilidad **Herramientas**: `+5%` de velocidad por rango (F30, rebalanceado en v2.9).
- Velocidad de herramienta: `0.68` (base) a `1.18` (legendaria).
- Guantes: `+0% / +5% / +10% / +10%` según nivel.

**Tile base por bioma (al romper):**

| Bioma | Tile base |
|-------|-----------|
| pradera | 🟩 GRASS |
| bosque | 🟩 GRASS |
| costa | 🟨 SAND |
| ruina | 🟩 GRASS |
| oceano | 🌊 WATER |
| desierto | 🟧 DESERT_SAND |
| nieve | ❄️ SNOW |

**Nota (v2.4.1-alpha):** el `tileBase` se calcula con `obtenerBiomaDeCelda(wx, wy)`.

**Nota (v2.4.2-alpha):** mientras se rompe un tile, la celda vibra y parpadea en bucle (`.efecto-golpe-loop`). Al llegar la barra a 0, la animación y el cambio de tile terminan exactamente juntos.

**Idea futura:** objetos de mejor nivel. Ver BACKLOG · F12.

### Sistema del barco

- El 🛶 aparece en cada chunk de costa, en tierra, pegado a agua.
- Click sobre agua adyacente → barra (5s) → jugador se sube (🚣 / 🛸).
- Mientras navega, solo puede moverse sobre agua.
- Click sobre tierra adyacente → barra (2s) → jugador se baja.
- Puede romper rocas del agua desde el barco.
- Puede navegar entre chunks.

### Sistema de temas

Los objetos equipables se muestran según el **tema activo**:

| Objeto | Emoji tierra | Emoji espacio |
|--------|:------------:|:-------------:|
| 🪓 HACHA | 🪓 | ⚡ (sable de energía) |
| ⛏️ PICO | ⛏️ | 🔫 (taladro) |
| 🕯️ LINTERNA | 🕯️ | 💡 (lámpara) |
| 🛶 BARCO | 🛶 | 🚀 (módulo de escape) |

**Cómo funciona el tema activo:**

- Se define en `config.js` como `TEMA_ACTIVO`.
- Se puede cambiar con el botón 🌍/🚀 de la esquina superior derecha.
- La elección se guarda en `localStorage`.
- Los datos de cada tema viven en `js/core/temas/tema-tierra.js` y `js/core/temas/tema-espacio.js`.

### Mejoras futuras (BACKLOG · F12)

**Hachas y picos:**

| Nivel | Objeto | Velocidad | Duración efectiva |
|:-----:|--------|:---------:|:-----------------:|
| 1 | Madera | 1.0× | 3.0s (base) |
| 2 | Hierro | 0.6× | 1.8s |
| 3 | Diamante | 0.3× | 0.9s |

**Linteras (con radio de luz, vinculado a F1):**

| Nivel | Objeto | Radio |
|:-----:|--------|:-----:|
| 1 | Vela | 6×6 |
| 2 | Linterna de mano | 10×10 |
| 3 | Linterna militar | 13×13 |
| 4 | Farol mágico | 16×16 |

**Equipables que modifican stats del jugador:**

| Slot | Objeto | Efecto |
|------|--------|--------|
| Pies | Botas | +1 velocidad |
| Pies | Bicicleta | +3 velocidad |
| Cabeza | Casco de hierro | +1 defensa |
| Torso | Armadura | +2 defensa |
| Cabeza | Amuleto | +5 HP máximo |

**Velocidad del jugador:** constante por defecto (100ms/celda). Solo equipables la modifican.

**Reglas:** modificadores aditivos con máximos por stat.

Ver BACKLOG · F12 para el detalle completo.

### Cómo agregar un objeto equipable nuevo

1. Agregarlo al array `EQUIPABLES` de `items.js`:
   ```js
   { tipo: NOMBRE_TILE, bioma: "biomaDestino", porChunk: true }
   ```
2. Agregar la constante del tile en `tiles.js`.
3. Agregar el emoji en **ambos** temas.
4. Agregar el nombre en `tipoEquipableANombre`.
5. Agregar el slot correspondiente en `index.html` y en `actualizarSlotsEquipados`.

### Cheats de test (temporal)

`js/systems/cheats.js` agrega un botón 🎁 arriba a la derecha.

- Click → carga los 4 equipables.
- Click de nuevo → limpia.
- **Solo para test.** Borrar antes de producción.

---

## 🌱 MARCO 5 · Generación Procedural

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| G1 | Ingreso de semilla | 🟢 | Manual + aleatoria + Enter | v0.4 |
| G2 | Compartir semillas | 🟢 | Sí | Texto copiable |
| G3 | Determinismo | 🟢 | 100% determinista | FNV-1a + Mulberry32 |
| G4 | Variedad de mundos | 🟢 | Alta | Biomas + posición aleatoria |
| G5 | Puntos de interés garantizados | 🧪 | Llave en chunk (2, 0) | Regla fija para test |
| G6 | Fallback si falla generación | 🟢 | Reintento con `@retry` | Semilla derivada |
| G7 | Velocidad de generación | 🟢 | Instantánea (<50ms) | Por chunk |
| G8 | Versionado del generador | ⏸️ | No | Fase futura |
| G9 | Validación de transitabilidad | ⏸️ | No aplica (mundo 2D) | v2.0 |
| G10 | RNG por sistema | 🟢 | 3 capas: `@chunk`, `@items`, `@mobs` | v2.0 |
| G11 | Ítems generados por semilla | 🟢 | 0-3 por chunk | v2.0 |
| G12 | Mobs generados por semilla separada | 🟢 | 0-2 por tipo, según bioma | v2.0 |
| G13 | Semillas independientes | 🟢 | `SEMILLA` · `SEMILLA_MOBS` · `SEMILLA_OBJETOS` | v1.3 |
| G14 | Chunk (0,0) sin mobs | 🟢 | Chunk inicial libre de mobs | v2.0 |
| G15 | Sistema de biomas por tabla | 🟢 | 7 biomas con temperatura + humedad | v2.4-alpha |
| G16 | Tiles nuevos | 🟢 | 🟧 🌵 ❄️ 🧊 🌲 | v1.6 |
| G17 | Biomas forzados (Pasada 2) | 🟡 | Ciudades, puertos, islas | Planificado |
| G18 | Forma de biomas | 🟢 | Costa usa `forma: "franja"` | v1.7.1 |
| G19 | Generación de equipables parametrizable | 🟢 | Semillas opcionales en `items.js` | v2.1-alpha |
| G20 | Datos temáticos centralizados | 🟢 | `temas/` con tierra + espacio | v2.2-alpha |
| G21 | Ruido para biomas | 🟢 | `ruido2D` (Value Noise) + temp/humedad | v2.4-alpha |
| G22 | Escala de biomas | 🟢 | `ESCALA_BIOMA = 0.01` (≈3 chunks por bioma) | v2.4-alpha |

---

## 🖥️ MARCO 6 · Interfaz / UX

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| U1 | HUD | 🟢 | Pos + Zona + Inventario + Corazones + HP | v2.6-alpha |
| U2 | Minimapa | ⏸️ | No | Fase futura |
| U3 | Log de mensajes | 🧪 | Console.log + carteles temporales | v1.7 |
| U4 | Estilo de menús | 🧪 | Overlay simple + overlay de combate | v2.5-alpha |
| U5 | Sonido/música | ⏸️ | No | Fase muy tardía |
| U6 | Plataforma | 🟢 | Navegador (PC) | Móvil → futuro |
| U7 | Guardado/carga | ⏸️ | No | Fase futura |
| U8 | Control de semilla en UI | 🟢 | Input + botón Aplicar + 🎲 | v0.4 |
| U9 | Barra de objetivos | ❌ | Eliminada | v2.0 |
| U10 | Botones de movimiento | 🟢 | 4 botones en rombo | v1.6.1 |
| U11 | Slots de equipados | 🟢 | 4 slots arriba del mapa | v1.9 |
| U12 | Layout 3 columnas | 🟢 | 20% flechas · 60% mapa · 20% panel | v1.6.1 |
| U13 | Barra de stamina | 🟢 | Arriba del mapa, visible en rotura | v1.7 |
| U14 | Botón de cambio de tema | 🟢 | Arriba a la derecha, fixed | v2.3-alpha |
| U15 | Botón de cheat (temporal) | 🧪 | Arriba a la derecha, junto al de tema | v2.4.1-alpha |
| U16 | Corazones de HP | 🟢 | 10 corazones (2 HP c/u) + número; sin barra | v2.6-alpha (F28 fase 9) |
| U17 | Inventario visual | ✅ | Menú único con pestañas, categorías y equipo | v2.9-alpha (F12) |
| U18 | Overlay de combate | 🟢 | Paneles + HP + timing + telegráfico + victoria/derrota | v2.7-alpha (F28) |

---

## 🏗️ MARCO 7 · Arquitectura

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| R1 | Múltiples archivos | 🟢 | Sí | v1.0 |
| R2 | Carga con `<script src>` | 🟢 | Sin módulos ES | v1.0 |
| R3 | Requiere servidor HTTP | 🟢 | Sí (Live Server / Pages) | CORS |
| R4 | CSS separado | 🟢 | `css/estilo.css` | v1.0 |
| R5 | Bloques referenciables | 🟢 | `// ═══ BLOQUE N ═══` | v1.0 |
| R6 | Orden de carga | 🟢 | temas → config → ruido → tiles → rng → biomas → mundo → camara → estado → chunks → items → mobs → enemigos → efectos → barra-timing → render → ia → jugador → combate-ui → combate → victoria → input → rotura → barco → cheats → main | v2.5-alpha |
| R7 | Versionado | 🟢 | Git + GitHub | v1.0 |
| R8 | Deploy público | 🟢 | GitHub Pages | v1.0 |
| R9 | Centralización de tamaño | 🟢 | Todo derivado de `config.js` | v1.1 |
| R10 | RNG separado por sistema | 🟢 | `@chunk`, `@items`, `@mobs` | v2.0 |
| R11 | Semillas independientes | 🟢 | `SEMILLA`, `SEMILLA_MOBS`, `SEMILLA_OBJETOS` | v1.3 |
| R12 | Organización en subcarpetas | 🟢 | `core/`, `world/`, `entities/`, `ui/`, `systems/` | v1.4 |
| R13 | IA en `systems/` | 🟢 | `js/systems/ia.js` | v1.5 |
| R14 | Tick de IA configurable | 🟢 | `TICK_MS = 400` | v1.5 |
| R15 | Documentación modular | 🟢 | README + CHANGELOG + BACKLOG + AGENTS.md | v2.5-alpha |
| R16 | Sistema de "forma" | 🟢 | `forma: "franja"` en `biomas.js` | v1.7.1 |
| R17 | Chunks 2D | 🟢 | `{cx, cy}` en lugar de `zona` | v2.0 |
| R18 | Cámara fluida | 🟢 | Jugador fijo en el centro | v2.0 |
| R19 | Auditor de semillas 2D | 🟢 | Herramienta separada en `auditor/` | v2.1-alpha |
| R20 | Sistema de temas | 🟢 | Datos en `js/core/temas/` | v2.2-alpha |
| R21 | Emojis del jugador por tema | 🟢 | `_temaActivo.jugador` | v2.3-alpha |
| R22 | Ruido autocontenido | 🟢 | `js/core/ruido.js` (sin dependencias) | v2.4-alpha |
| R23 | IA reescrita para 2D | 🟢 | `ia.js` con `wx, wy`, sin `estado.pantalla` | v2.4.1-alpha |
| R24 | Cheats de test temporales | 🧪 | `js/systems/cheats.js` (borrar antes de producción) | v2.4.1-alpha |
| R25 | Sistema de efectos visuales | 🟢 | `js/systems/efectos.js` + clases CSS | v2.4.2-alpha |
| R26 | Efectos por coordenada del mundo | 🟢 | `Map<"wx,wy", efectos[]>`, independientes del render | v2.4.2-alpha |
| R27 | Herramientas de experimentación | 🟢 | `auditor/laboratorio-v1.html` + `pruebas/*` | v2.4.2-alpha |
| R28 | Minijuego de timing autocontenido | 🟢 | `js/systems/barra-timing.js` (module pattern) | v2.5-alpha |
| R29 | Combate por turnos con módulos separados | 🟢 | `combate.js` (lógica) + `combate-ui.js` (UI) | v2.5-alpha |
| R30 | Configuración para agentes de IA | 🟢 | `AGENTS.md` + `opencode.json` | v2.5-alpha |

---

## 🎨 MARCO 8 · Estilo Visual

| Elemento | Estilo | Referencia |
|----------|--------|------------|
| Fondo general | Oscuro `#0a0a0a` | Minimalista |
| Bordes | Redondeados `border-radius: 8px` | Suaves |
| Tiles | Emojis en celdas de 24×24 px | v2.0 |
| **Glow** | Halos luminosos celestes/rosas | **Muy valorado** |
| Slot actual | Borde celeste + `box-shadow` glow | `#6cf` |
| Slots de equipados con objeto | Borde celeste + glow | v1.6.1 |
| Fuente | `monospace` | Consistencia retro |
| Input de semilla | Glow celeste al focus | v0.4 |
| Jugador y mobs mirando a la izquierda | `transform: scaleX(-1)` | v1.1 |
| Barra de stamina | Gradiente celeste→verde | v1.7 |
| **Corazones de HP** | Lleno ❤️ / roto 💔 / vacío 🖤 + número | v2.6-alpha |
| Color de fondo por bioma | Tinte sutil por bioma | v2.3-alpha |
| Animación del jugador | Emojis alternados al caminar | v2.3-alpha |
| Botón de cambio de tema | Glow celeste, arriba a la derecha | v2.3-alpha |
| Botón de cheat | Rojo, arriba a la derecha | v2.4.1-alpha |
| Biomas orgánicos | Manchas sin bordes rectos (ruido) | v2.4-alpha |
| **Efectos visuales genéricos** | Vibrar, parpadear, destello, glow, pulse | v2.4.2-alpha |
| **Overlay de combate** | Paneles con glow + HP + telegráfico + victoria/derrota | v2.7-alpha |
| **Barra de timing** | Zonas verde/naranja/roja parametrizables + modos ataque/defensa | v2.7-alpha |

**Regla de oro:** los efectos de **glow / borde luminoso** son parte de la identidad visual.

### Color de fondo por bioma (v2.3-alpha)

Cada bioma tiene un campo `color` (hexadecimal) que define el fondo sutil de sus tiles.

| Bioma | Tierra | Espacio |
|-------|--------|---------|
| pradera / llanura lunar | `#0d1a0d` | `#141414` |
| bosque / zona de naves | `#0d1f0d` | `#101820` |
| costa / borde de cráter | `#1a1a0d` | `#1a0f0f` |
| ruina / ruinas alienígenas | `#1a1a1a` | `#1a1410` |
| oceano / mar de metano | `#0a1420` | `#150a1a` |
| desierto / dunas rojas | `#1a150d` | `#1a0a0a` |
| nieve / campo de hielo | `#0d1520` | `#101a1a` |

### Biomas orgánicos (v2.4-alpha)

Cada celda tiene **temperatura** y **humedad** (con `ruido2D`). El bioma es el más cercano a ese par `(temp, hum)`.

- `ESCALA_BIOMA = 0.01` → 1 bioma ≈ 100 celdas ≈ 3 chunks.
- Bordes suaves y curvos.

### Animación del jugador (v2.3-alpha)

| Estado | Tierra | Espacio |
|--------|:------:|:-------:|
| Quieto | 🧍‍♂️ | 👨‍🚀 |
| Corriendo A | 🏃‍♂️ | 🏍️ |
| Corriendo B | 🚶‍♂️ | 🏎️ |
| En barco | 🚣 | 🛸 |

- `enBarco === true` → emoji de barco.
- `animando` o tecla → alterna `correrA`/`correrB` cada 150ms.
- Si no → `quieto`.
- Orientación con `scaleX(-1)`.

### Efectos visuales genéricos (v2.4.2-alpha)

| Clase CSS | Efecto | Cuándo |
|-----------|--------|--------|
| `.efecto-ataque` | Vibrar + parpadear + destello rojo (~0.5s) | Ente recibe golpe |
| `.efecto-golpe` | Vibrar + parpadear lentos (~1s) | Picar/talar (una vez) |
| `.efecto-golpe-loop` | Vibrar + parpadear infinitos | Mientras dura la rotura |
| `.efecto-recoger` | Parpadeo rápido (0.3s) | Recoger ítem |
| `.efecto-danio` | Vibrar + parpadear + destello rojo | Jugador recibe daño |
| `.efecto-glow` | Halo celeste permanente | Ítem importante |
| `.efecto-pulse` | Pulsación permanente | Portal, orbe |

**Usado por:** `rotura.js` (`efecto-golpe-loop`), `combate.js` (`efecto-ataque` al mob, `efecto-danio` al jugador).

**Uso:**

```js
aplicarEfecto(wx, wy, "efecto-ataque", 500);       // temporal
aplicarEfecto(wx, wy, "efecto-glow");              // permanente
quitarEfecto(wx, wy, "efecto-glow");               // quitar
```

### Overlay de combate (v2.7-alpha)

Sistema de combate por turnos con minijuego de timing y ataques telegrafiados. Ver BACKLOG · F28.

**Componentes:**
- Dos paneles: jugador (izq) y mob (der), con emoji + barra de HP.
- Aviso inicial antes del primer turno: quién ataca y "¡PREPÁRATE!".
- Mensaje central de estado del turno.
- **Telegráfico del mob:** anuncia el ataque (`🐾 Zarpazo`, `💥 Embestida`, `🎯 Disparo`, etc.) ~0.9s antes de la barra.
- Barra de timing horizontal con zonas coloreadas y **perfil por ataque** (duración y ancho de zonas).
- **Modo ataque** (⚔️ rojo) y **modo defensa** (🛡️ celeste) visualmente distintos.
- Botón "Huir" con confirmación y probabilidad. Se puede usar durante el timing: cancela la barra y abre el diálogo.
- Feedback de precisión: perfecto, bien o débil.
- **Combo de perfectos:** 3 ataques perfectos seguidos llenan 3 slots; el 4.º ataque pega ×1.5 y consume la carga.
- **Historial de combate:** registro con color por tipo (rojo daño recibido, amarillo avisos, verde acciones favorables, gris sistema), hasta 24 entradas con scroll.
- **Último golpe:** badge temporal sobre cada panel (`−N HP`, `BLOQUEO`, `SIN DAÑO` o `+N HP`).
- Muerte del mob: animación, cierre diferido (~0.9s) y **resumen de victoria** con XP/drops reales (F13).
- Derrota: overlay propio con HP final y botón **Reiniciar mundo**.

**Catálogo maestro de ataques:**

La barra base de referencia es **1500 ms, verde 20%, naranja 15% por lado y rojo 25% por lado**. Los porcentajes entre paréntesis indican la diferencia contra esa base.

| ID | Ataque | Perfil | Duración | Verde | Naranja/lado | Rojo/lado | Mitigación máxima | Daño | Efecto |
|----|--------|--------|---------:|------:|-------------:|----------:|------------------:|:----:|--------|
| `ATAQUE_1` | 🐾 Zarpazo | Rápido y angosto | 1100 ms (−27%) | 12% (−40%) | 14% | 30% | 100% | ×1.0 | — |
| `ATAQUE_2` | 💥 Embestida | Lento y amplio | 1700 ms (+13%) | 32% (+60%) | 18% | 16% | 100% | ×1.0 | — |
| `ATAQUE_3` | 🦷 Mordida | Normal | 1400 ms (−7%) | 20% (base) | 15% | 25% | 100% | ×1.0 | — |
| `ATAQUE_4` | 🎯 Disparo | Muy rápido y angosto | 950 ms (−37%) | 8% (−60%) | 10% | 36% | 100% | ×1.0 | — |
| `ATAQUE_5` | 💢 Golpe contundente | Muy rápido y barras finas | 800 ms (−47%) | 6% (−70%) | 8% | 39% | 100% | ×1.0 | — |
| `ATAQUE_6` | 🐔 Picotazo | Rápido y preciso | 1000 ms (−33%) | 16% (−20%) | 16% | 26% | 100% | ×1.0 | — |
| `ATAQUE_7` | 🐙 Tentáculo | Amplio y envolvente | 1600 ms (+7%) | 28% (+40%) | 18% | 18% | 100% | ×1.0 | — |
| `ATAQUE_8` | 👊 Golpe | 50% imbloqueable | 1200 ms (−20%) | 16% (−20%) | 14% | 28% | **50%** | ×1.0 | El 50% del daño entra siempre |
| `ATAQUE_BOSS_1` | ☠️ Ataque especial | Placeholder de boss | 1000 ms (−33%) | 10% (−50%) | 10% | 35% | 100% | ×1.0 | Cada boss define su `ATAQUE_BOSS_N` |

**Cómo leer la mitigación:** `100%` significa que un bloqueo perfecto puede anular todo el daño. `50%` significa que, incluso con precisión perfecta, solo se puede mitigar la mitad; la otra mitad entra siempre. Es una regla determinista, no una probabilidad.

**Zona roja:** es el espacio restante de la barra, repartido en dos mitades (antes y después de las zonas de bloqueo). Por eso `rojo/lado = (100 − verde − 2 × naranja) / 2`.

**Daño:** hoy todos los ataques usan el ataque base del mob (`×1.0`). El multiplicador de daño por ataque y los efectos de estado todavía no están implementados; el combo de perfectos sí aplica `×1.5`.

**Combo de perfectos:** el contador se conserva entre turnos de defensa. Un ataque no perfecto reinicia la cadena. El 4.º ataque recibe `×1.5` aunque no sea perfecto; si es perfecto, arranca una nueva cadena con `1/3`. Se reinicia al cerrar el combate.

**Historial de combate (F28.6):** cada acción se agrega al panel `#combate-historial` mediante `CombateUI.agregarHistorial(tipo, texto)`. Tipos y colores: `negativo` (rojo, daño recibido o huida fallida), `alerta` (amarillo, ataque fallado), `positivo` (verde, daño hecho, bloqueo o curación) y `sistema` (gris, inicio de combate). Conserva las últimas 24 entradas y auto-scrollea. `CombateUI.actualizarUltimoGolpe(objetivo, cantidad, tipo)` muestra un badge temporal en el panel del jugador o del mob; `CombateUI.registrarCuracion(cantidad, fuente)` deja `+N HP` verde para futuras curas en combate.

**HP fraccionario:** los daños con porcentajes y mitigación pueden dejar HP con decimales durante la pelea (ej: `14.899999`). Al cerrar el combate, `redondearHP()` normaliza el HP del jugador y el HP remanente del mob hacia arriba al medio punto más cercano (`14.899999 → 15`, `14.1 → 14.5`), con tope en `hpMax`. Así una manzana siempre suma exactamente `+1 HP` sin arrastrar artefactos de coma flotante.

**Ataques actuales por mob:**

| Mob | Ataques |
|-----|---------|
| Tigre 🐅 | Zarpazo, Embestida, Mordida |
| Gallina 🐓 | Picotazo |
| Cerdo 🐖 | Embestida |
| Alien hostil 👽 | Zarpazo, Mordida, Disparo |
| Dron 🤖 | Disparo |
| Reptiliano 🦎 | Embestida, Mordida, Golpe |

`Golpe contundente` queda reservado para un boss futuro (F27). `ATAQUE_BOSS_1` está como placeholder para ataques únicos de bosses.

**Flujo:**
- Turno jugador → ataque con timing → daño al mob.
- Turno mob → telegráfico del ataque → defensa con timing → reducción de daño según perfil y mitigación máxima.
- Si el mob muere → resumen de victoria. Si el jugador muere → derrota.
- Repetir hasta que uno muera.

**Pausa:** al abrir el overlay, `estado.pausado = true`. Bloquea movimiento, IA, rotura, barco.

### Herramientas de experimentación

| Archivo | Función |
|---------|---------|
| `auditor/laboratorio-v1.html` | Laboratorio ejecutable en el navegador. Permite probar cualquier emoji con cualquier efecto. No afecta el proyecto. |
| `pruebas/catalogo.html` | Catálogo comprimido de efectos con ejemplos prácticos. Sirve para elegir el efecto adecuado. |
| `pruebas/barra-timing.html` | Prueba del minijuego de timing. Mide precisión del click. |
| `js/core/tiles_muestrario.md` | Documento de referencia con el uso de tiles. |

**Consola:** `debugCombate("cerdo", "ATAQUE_8")` inicia un combate de prueba con 100 HP para validar el combo y `Golpe` sin buscar un reptiliano. `debugXP(500)` otorga XP para probar habilidades y el menú. `debugHerramienta("HACHA", 3)`, `debugEquipo(2)` y `debugVision()` prueban F12. Todos son temporales (`cheats.js`).

---

### Progresión y menú del jugador (v2.8-alpha)

**Archivos:** `js/systems/progresion.js` (lógica) + `js/ui/menu-jugador.js` (UI).

- La XP se gana al vencer mobs y se gasta en habilidades.
- **Nivel = 1 + rangos comprados.** No hay subida automática por XP.
- Habilidades: Vitalidad (+2 HP máx.), Fuerza (+1 ataque), Defensa (+1 defensa), Movilidad (+10% velocidad) y Herramientas (+5% velocidad de rotura).
- El menú se abre con `I` o el botón 👤, pausa el juego y tiene pestañas Personaje, Habilidades, Inventario y Misiones (placeholder).
- El HUD muestra nivel y XP disponible.
- Al reiniciar el mundo se resetean XP, habilidades y drops únicos.

### Loot y XP por mob (v2.8-alpha)

**Archivo:** `js/systems/loot.js`.

- `LOOT_POR_MOB` define `xp`, `dropea`, `probabilidad`, `objetos` y `unicos` por mob.
- Cada objeto usa `{ id, prob, min, max }`; la cantidad se tira en ese rango.
- Los drops van directo al inventario y el resumen de victoria muestra los objetos reales.
- Los drops únicos se guardan en `estado.dropsUnicos` y se entregan una sola vez por mundo.
- `LOOT_UNICOS_POR_MOB` queda preparado para mobs especiales/bosses.

### Equipamiento por niveles (v2.9-alpha)

**Archivo:** `js/systems/equipamiento.js`.

- Niveles Base, Normal, Especial y Legendario para herramientas y equipo.
- Las acciones (`HACHA`, `PICO`, `LINTERNA`, `BARCO`) se auto-mejoran: al encontrar una versión superior, reemplazan la anterior y se eliminan los niveles viejos del inventario.
- Equipo por slots (`casco`, `pechera`, `guantes`, `botas`) con bonus de HP, ataque, defensa, velocidad y rotura.
- `estado.equipamiento` guarda `{ equipo, unicos }`; las herramientas siguen en `estado.inventario` con su mejor nivel.
- El menú Inventario agrupa **Acciones**, **Equipables** y **Uso/trueque**; se equipa con doble clic o botón.
- El HUD de slots muestra el ícono con glow según nivel.

### Ciclo día-noche y luz (v2.10-alpha)

**Archivo:** `js/systems/ciclo.js`.

- Fases `día → atardecer → noche → amanecer`, con duraciones en `CICLO_CONFIG` (día 60s, transición 8s, noche 30s) modificables a futuro.
- **Luz global** por fase con interpolación `smoothstep`: `1` de día, `0` de noche, transiciones suaves.
- **Luz por celda:** `luz = max(global, jugador, hogueras…)`; `oscuridad = 1 - luz`. Las luces no se suman.
- Falloff de fuentes: `potencia * (1 - d/radio)^2` con distancia redonda (Euclídea).
- **Jugador como luz móvil:** radio `1 + visión`; sin linterna ves 3×3, con linterna del sol 13×13.
- **Hoguera** (`HOGUERA`, tile 25): solo en el spawn (hasta 2 deterministas), siempre encendida, radio 4 con titileo.
- Render: pseudo-elemento `::after` con `opacity: var(--osc, var(--osc-global, 0))`; `#jugador-fijo` nunca se oscurece.
- Se pausa con `estado.pausado` y se reinicia con el mundo.
- **Cheats:** `debugCiclo("noche", 0.5)`, `debugNoche()` y `debugDia()`.

## 🧪 MARCO 9 · Sistema de Test (v2.10-alpha)

### Lo que hay ahora

- **Mundo 2D circular** con chunks de 32×32 celdas.
- **Cámara fluida**: jugador fijo en el centro, mundo se desplaza.
- **Movimiento 360°** fluido (100ms por celda).
- **Wrap circular** en X e Y (tipo Pac-Man).
- **Chunk (0,0) seguro** (pradera, sin mobs).
- **7 biomas** por tema (tierra + espacio).
- **Biomas por celda** con ruido (temp + humedad).
- **Costa con forma de franja**.
- **Ítems recolectables**: manzanas curativas (0-3 por chunk).
- **Manzanas**: curan 1 HP al pisarlas, sin superar `hpMax`; al máximo quedan en el suelo.
- **Objetos equipables**: 🪓 ⛏️ 🕯️ 🛶 (o ⚡ 🔫 💡 🚀 en espacio), con niveles Base/Normal/Especial/Legendario (F12).
- **Ciclo día-noche**: oscurece por tile, ilumina el radio del jugador y las hogueras del spawn (F1).
- **Sistema de rotura** (click + barra de stamina + efecto de golpe).
- **Sistema del barco** (navegar sobre agua).
- **Mobs con IA** (deambular, perseguir, huir).
- **HP del jugador** con corazones + número en el HUD (2 HP por corazón).
- **HUD inicializado** al cargar (posición y vida sin esperar al primer paso).
- **Sistema de combate por turnos** con timing (F28 fases 1-11).
- **Aviso inicial de combate** + modos visuales ataque/defensa.
- **Ataques telegrafiados** por mob con perfiles de timing propios, `Golpe` 50% imbloqueable y placeholder de ataque de boss (F28.2).
- **Resumen de victoria** con XP y drops reales (F28.3 + F13).
- **Combo de 3 perfectos** con slots visibles y golpe ×1.5 (F28.5).
- **Historial de combate** color-coded y **badges de último golpe** por panel (F28.6).
- **Motor de efectos/estados de combate** solo diseñado, no implementado (F28.4).
- **Huida probabilística** con penalización + mob desaparece.
- **Muerte del jugador** → pantalla de derrota con botón de reinicio.
- **Pausa global en combate** (bloquea movimiento, IA, rotura, barco).
- **Progresión con XP** y 5 habilidades comprables; el nivel sube con cada rango (F30).
- **Menú único del jugador** (`I` o 👤) con Personaje, Habilidades, Inventario y Misiones (F30).
- **Loot por mob** con probabilidades, cantidades y drops únicos por mundo (F13).
- **Equipamiento por niveles** con herramientas auto-mejorables, slots de equipo, glow y bonus (F12).
- **Inventario en HUD** con íconos correctos.
- **Control de semilla en UI**.
- **Botones de movimiento** en pantalla.
- **Botón de cambio de tema** (arriba a la derecha).
- **Botón de cheat** (arriba a la derecha, temporal).
- **Color de fondo por bioma**.
- **Animación del jugador** (quieto, corriendo, en barco).
- **Ruido (Value Noise)** para generación de biomas.
- **Sistema de efectos visuales genéricos**.
- **Minijuego de timing** integrado en el combate.

### Bugs resueltos (ver BACKLOG · F24 y F28.1)

Todos los bugs de v2.4-alpha y de F28.1 fueron resueltos:

| ID | Bug | Estado |
|:--:|-----|:------:|
| B1 | Romper tile usa bioma del chunk | ✅ Arreglado |
| B2 | Filas de pasto entre chunks | ✅ Arreglado |
| B3 | Mobs de tierra aparecen en el agua | ✅ Arreglado |
| B4 | Atravesar mob no dispara pelea | ✅ Arreglado |
| B5 | Romper roca en agua genera arena | ✅ Arreglado |
| B6 | HP jugador en 0 no cierra combate / combate nuevo en derrota | ✅ Arreglado en v2.5.1-alpha |
| B7 | Matar mob con HP 0 “cura” al jugador | ✅ Arreglado en v2.5.1-alpha |
| B8 | Huir bloqueado por la barra de timing | ✅ Arreglado en v2.5.1-alpha |
| B9 | Callback de timing pendiente al cancelar | ✅ Arreglado en v2.5.1-alpha |
| B10 | HUD vacío y posición `0,0` hasta el primer paso | ✅ Arreglado en v2.6-alpha |

**Ver detalle en [BACKLOG.md](BACKLOG.md) · F24, F28.1 y B10.**

### Lo que falta

- Balance fino de combate (opcional, después de más pruebas).
- Aplicar `efecto-recoger` al recoger ítems.
- Reemplazar glow hardcodeado de la llave.
- Pulir tema espacio.
- Adaptar `auditor/` al sistema de temas.
- Barco: mob bloqueando la única celda de tierra.
- Mobs de chunks vecinos: ¿actúan cuando el jugador no los ve?
- **F1 (día-noche)**, **F26 (especiales)**, **F27 (bosses)**, **F29 (escalado)**.
- Persistencia de XP/habilidades (F33).

### ⚠️ Recordatorio: borrar cheats antes de producción

1. Borrar `js/systems/cheats.js`.
2. Borrar `<script src="js/systems/cheats.js"></script>` de `index.html`.
3. Borrar `<button id="btn-cheat">🎁</button>` de `index.html`.
4. Borrar el bloque CSS `#btn-cheat` de `css/estilo.css`.

---

## 🎯 MARCO 10 · Alcance / Producción

| ID | Decisión | Estado | Valor actual |
|:--:|----------|:------:|--------------|
| X1 | Tiempo de dedicación | 🟢 | Iterativo, sin plazo |
| X2 | Propósito | 🟢 | Aprender |
| X3 | Meta | 🟢 | Prototipo → escalable |
| X4 | Equipo | 🟢 | Solo desarrollador |
| X5 | Prioridad #1 | 🟢 | Divertido |

---

## ⚔️ MARCO 11 · Módulo de Combate por Reflejos

> **Módulo independiente en desarrollo paralelo.**

### Objetivo

Sistema de combate en primera persona basado en **reacción visual y timing**, con **ataque** y **bloqueo** en ventanas de tiempo.

### Concepto central

Interfaz radial con 6 sectores anidados. El jugador **bloquea** arrastrando el mouse del centro al sector correcto, y **ataca** hacia sectores vulnerables.

### Fases

| Fase | Nombre | Estado |
|:----:|--------|--------|
| 1 | Prototipo 1 · Test de reflejos simple | ✅ Completado |
| 2 | Prototipo 2 · Sectores radiales + arrastre (SVG) | ⏸️ Próximo |
| 3 | Prototipo 3 · Ciclo completo de combate | ⏸️ Pendiente |
| 4 | Fase final · Integración | ⏸️ Pendiente |

**Nota:** F28 (combate con timing por barra horizontal) reemplaza a este módulo **por ahora**. Cuando el MARCO 11 esté listo, se evalúa si reemplaza a F28 o lo complementa.

---

## 🧩 MARCO 12 · Preguntas Libres

### Lo que NO queremos

- *(pendiente)*

### Inspiraciones

- *(pendiente)*

### Otros

- *(pendiente)*

---

## 🔮 MARCO 13 · Análisis Futuros (Backlog)

**Movido a [BACKLOG.md](BACKLOG.md).**

Ideas futuras: F1-F33.

---

## 🗺️ Roadmap · Próximas iteraciones

### ✅ Completado

- [x] Motor base de generación con semilla
- [x] Mundo E-O por zonas (v1.x, obsoleto)
- [x] Biomas con frontera dura
- [x] Movimiento del jugador
- [x] Barra de zonas (v1.x, obsoleto)
- [x] Objetivo: encontrar la llave
- [x] Ítems recolectables
- [x] Inventario en HUD
- [x] Refactorización a múltiples archivos
- [x] CSS separado
- [x] GitHub + Pages
- [x] Prototipo 1 del módulo de combate
- [x] Orientación del jugador
- [x] Centralización de tamaño
- [x] 3 mobs con sistema de datos escalable
- [x] Batalla simulada
- [x] Semillas independientes
- [x] Reorganización en subcarpetas
- [x] IA de mobs en tiempo real
- [x] Rediseño del sistema de biomas (F14)
- [x] 7 biomas + 5 tiles nuevos
- [x] Interfaz lateral completa (F11)
- [x] Botones de movimiento
- [x] Sistema de rotura (F11)
- [x] Rediseño de costa (F16)
- [x] Barco (F18)
- [x] **Migración a chunks 2D + cámara fluida (F21)** ← v2.0
- [x] **Auditor 2D** ← v2.1-alpha
- [x] **Infraestructura de temas** ← v2.2-alpha
- [x] **Tema espacio + color bioma + animación** ← v2.3-alpha
- [x] **Biomas por celda con ruido (F24)** ← v2.4-alpha
- [x] **Bugs de biomas por celda (F24)** ← v2.4.1-alpha
- [x] **Sistema de efectos visuales genéricos (F25)** ← v2.4.2-alpha
- [x] **F28 fase 1-6** (stats, barra HP, minijuego de timing, overlay, lógica de turnos, huida) ← v2.5-alpha
- [x] **F28.1 · B6/B7/B8/B9** (derrota bloqueada, HUD, Huir durante timing, callback cancelable) ← v2.5.1-alpha
- [x] **F28 fases 7-9** (muerte pulida, derrota con botón, corazones + feedback) ← v2.6-alpha
- [x] **Manzanas curativas** (+1 HP al pisarlas, sin superar `hpMax`; al máximo quedan en el suelo) ← v2.6-alpha
- [x] **HUD inicial** (posición y vida visibles al cargar) ← v2.6-alpha
- [x] **F28.2 · Ataques telegrafiados** (catálogo + perfiles de barra + telegráfico) ← v2.7-alpha
- [x] **F28.3 · Resumen de victoria** (XP y drops reales) ← v2.8-alpha
- [x] **UX de combate** (aviso inicial + modos visuales ataque/defensa) ← v2.7-alpha
- [x] **F28.5 · Combo de 3 perfectos** (slots + ataque ×1.5) ← v2.7-alpha
- [x] **F28.6 · Historial de combate y último golpe** (colores + badges) ← v2.7-alpha
- [x] **F30 · Progresión** (XP, habilidades, nivel por compras y menú del jugador) ← v2.8-alpha
- [x] **F13 · Loot y XP por mob** (probabilidades, cantidades y únicos por mundo) ← v2.8-alpha
- [x] **F12 · Equipamiento por niveles** (acciones auto-mejorables, slots, glow y bonus) ← v2.9-alpha
- [x] **F1 · Ciclo día-noche y luz** (oscuridad por tile, radio del jugador y hoguera del spawn) ← v2.10-alpha
- [ ] **F28.4 · Motor de efectos/estados de combate** (diseñado; falta implementación y tests)

### 🔥 Próximas tareas (urgentes)

| Prioridad | Tarea | Estado | Notas |
|:---------:|-------|:------:|-------|
| ✅ Done | Equipables mejorados (F12) | ✅ | Niveles, slots, rotura y visión · v2.9-alpha |
| ✅ Done | Ciclo día-noche (F1) | ✅ | Oscuridad por tile + hoguera + visión · v2.10-alpha |
| 🟡 Media | Balance de XP/costos (F30/F13) | ⏸️ | Ajustar curvas tras pruebas |
| 🟢 Baja | Persistencia de progresión (F33) | ⏸️ | XP, habilidades e inventario |
| 🟡 Media | Pulir tema espacio | ⏸️ | F19 |
| 🟢 Baja | Escalado de timing (F29) | ⏸️ | Base parametrizable lista (v2.7-alpha); falta conectar fases de F1 |
| 🟢 Baja | Mobs especiales (F26) | ⏸️ | Fase tardía |
| 🟢 Baja | Mobs bosses (F27) | ⏸️ | Fase tardía |
| 🟢 Baja | Inventario visual (F8) | ⏸️ | Ventana con pausa |
| 🟢 Baja | Sonidos simples | ⏸️ | Feedback |
| 🟢 Baja | Estructuras Forma A | ⏸️ | Plantillas de emojis |
| 🟢 Baja | Adaptación móvil (F31) | ⏸️ | Controles táctiles, layout y acciones automáticas |
| 🟢 Baja | Campaña por etapas (F32) | ⏸️ | Mundos de un bioma + etapa final con boss |
| 🟢 Baja | Menú/guardado/muerte (F33) | ⏸️ | Ciclo de partida y persistencia |

### 🌟 Ideas para más adelante

- Fronteras con obstáculos rompibles
- Sistema de inventario completo (F8)
- Refactorización a módulos ES
- Entidades multi-tile (mobs especiales 2×2) — ver F26
- Sprites reales (PNG) — ver F20
- Sistema de misiones (F32)
- Sistema de bosses con fases (F27/F32)
- Adaptación a celular con controles táctiles (F31)
- Campaña por etapas de un solo bioma + etapa final (F32)
- Menú principal, guardado/carga y política de muerte (F33)
- Persistencia de progreso (F33, antes F8 fase 3)
- **Ver [BACKLOG.md](BACKLOG.md)** (F1-F33)

---

## 🏗️ Índice de bloques y su ubicación

| Bloque | Nombre | Ubicación |
|:------:|--------|-----------|
| 1 | Configuración global | `js/core/config.js` |
| 2 | Tiles y propiedades | `js/core/tiles.js` |
| 3 | Hash y PRNG | `js/core/rng.js` |
| 3.5 | Ruido (Value Noise + fBm) | `js/core/ruido.js` |
| 4 | (Eliminado en v2.0 — antes: fronteras 1D) | — |
| 5 | Generador de chunk | `js/world/mundo.js` |
| 5.1 | Biomas (wrapper de tema) | `js/world/biomas.js` |
| 6 | Validación (simplificada) | `js/world/mundo.js` |
| 7 | Estado global | `js/core/estado.js` |
| 7.5 | Ítems y equipables | `js/entities/items.js` |
| 7.7 | Mobs (wrapper de tema) | `js/entities/mobs.js` |
| 7.8 | Enemigos (spawn, colisión) | `js/entities/enemigos.js` |
| 7.9 | IA de mobs | `js/systems/ia.js` |
| 7.10 | Sistema de rotura | `js/systems/rotura.js` |
| 7.11 | Sistema del barco | `js/systems/barco.js` |
| 7.12 | Efectos visuales genéricos | `js/systems/efectos.js` |
| 7.13 | Minijuego de timing | `js/systems/barra-timing.js` |
| 7.14 | Lógica de combate | `js/systems/combate.js` |
| 7.16 | Progresión (XP, habilidades, stats) | `js/systems/progresion.js` |
| 7.17 | Loot y XP por mob | `js/systems/loot.js` |
| 7.18 | Menú del jugador | `js/ui/menu-jugador.js` |
| 7.19 | Equipamiento y niveles | `js/systems/equipamiento.js` |
| 7.20 | Ciclo día-noche y luz | `js/systems/ciclo.js` |
| 8 | Carga e inicialización de chunks | `js/world/chunks.js` |
| 9 | Render del mundo | `js/ui/render.js` |
| 10 | (Eliminado en v2.0 — barra de zonas) | — |
| 11 | HUD | `js/ui/render.js` |
| 12 | Movimiento del jugador | `js/entities/jugador.js` |
| 13 | Victoria | `js/ui/victoria.js` |
| 13.5 | Batalla (delega a combate.js) | `js/ui/victoria.js` |
| 13.7 | UI de combate | `js/ui/combate-ui.js` |
| 14 | Input | `js/core/input.js` |
| 15 | Estilos CSS | `css/estilo.css` |
| 16 | Inicio | `js/main.js` |
| 17 | Reinicio con nueva semilla | `js/main.js` |
| 18 | (Eliminado en v2.0 — límite de chunks) | — |
| 20 | Cámara fluida | `js/systems/camara.js` |
| 99 | Cheats temporales (borrar antes de producción) | `js/systems/cheats.js` |

---

## 🔄 Cómo actualizar este README

**Regla de oro:** el README es la **fuente de verdad** del proyecto.

### Al agregar una feature nueva

1. Cambiar el estado en la tabla correspondiente.
2. Agregar entrada al `CHANGELOG.md`.
3. Marcar la tarea como completada en el roadmap.

### Al tomar una decisión de diseño

1. Buscar el ID correspondiente.
2. Cambiar de 🟡/🔴 a 🟢.
3. Anotar brevemente en "Notas".

### Al anotar una idea futura

1. Agregar un bloque F\<N> en `BACKLOG.md`.
2. Actualizar la lista "Contenido actual" al inicio de `BACKLOG.md`.

### Al cambiar de versión

1. Bump en el encabezado (ej: `v2.7-alpha` → `v2.8-alpha`).
2. Agregar entrada en `CHANGELOG.md`.
3. Actualizar la fecha.

---

## 🏷️ Convenciones de código

| Aspecto | Convención |
|---------|-----------|
| Constantes de tiles | `MAYÚSCULAS` (ej: `GRASS = 0`) |
| Funciones | `camelCase` (ej: `generarPantalla`) |
| Variables | `camelCase` (ej: `anchoPantalla`) |
| Constantes de config | `MAYÚSCULAS_CON_GUION_BAJO` (ej: `LIMITE_CHUNKS`) |
| RNG en generador | Siempre `rng()`, nunca `Math.random()` |
| Determinismo | Obligatorio en todo el generador |
| RNG por sistema | Cada sistema usa su propio `@sufijo` |
| Comentarios | Secciones con `// ═══` separadores |
| Bloques del código | Referenciar por número (`BLOQUE 7.5`) |
| Archivos `.js` | Un archivo por responsabilidad |
| Orden de carga | Respetar dependencias |

---

## ⚠️ Notas importantes de arquitectura

- **Live Server obligatorio**: por CORS, no funciona abrir `index.html` con doble clic.
- **Recarga forzada**: usar `Ctrl+Shift+R` cuando se modifican archivos `.js` o `.css`.
- **Orden de `<script src>`**: cambiar el orden rompe las dependencias.
- **RNG separado por sistema**: `@chunk` (terreno), `@items` (ítems), `@mobs` (mobs), `@llave` (llave).
- **GitHub Pages tarda ~30-60s** en actualizarse tras un `git push`.
- **Carpeta raíz variable**: cambia según la PC. No afecta al proyecto.
- **Tema activo**: se guarda en `localStorage` y se lee en `config.js`.
- **Biomas por celda**: `obtenerBiomaDeCelda(wx, wy)` reemplaza al viejo `obtenerBiomaDeChunk` para el render. El chunk mantiene un "bioma dominante" para spawns.
- **Ruido autocontenido**: `ruido.js` no depende de nada más.
- **Efectos visuales**: `efectos.js` guarda por coordenada `(wx, wy)`. Cualquier sistema puede llamar `aplicarEfecto(...)`. El render solo aplica clases CSS, sin saber qué es un efecto.
- **Barra de timing**: `barra-timing.js` usa module pattern (IIFE), autocontenido. Se invoca con `BarraTiming.iniciar({...})` y `BarraTiming.cancelar()`.
- **Combate por turnos**: `combate.js` usa `estado.pausado = true` para pausar el juego. Al cerrar lo desactiva. Usa `estadoCombate.timeoutPendiente` para poder cancelar `setTimeout` entre turnos y `estadoCombate.pausado` para bloquear doble huida.
- **Cheats temporales**: `cheats.js` es un archivo aparte. **Borrar antes de producción.**
- **Configuración para IA**: `AGENTS.md` + `opencode.json` para trabajar con OpenCode u otros agentes.

---

## 📞 Notas finales

- Este README se actualiza **cada vez que se agrega o cambia algo relevante**.
- Las decisiones 🧪 pueden cambiar. Las decisiones 🟢 se mantienen salvo razón fuerte.
- Los IDs (M1, J1, R1, X1, F1, etc.) **no cambian** aunque se modifiquen las decisiones.
- Los bloques del código (BLOQUE 1 a 99) son referenciables para modificaciones puntuales.
- El changelog completo vive en **[CHANGELOG.md](CHANGELOG.md)**.
- Las ideas futuras viven en **[BACKLOG.md](BACKLOG.md)** (F1-F33).
- La configuración de agentes vive en **[AGENTS.md](AGENTS.md)**.
- **Prioridad actual:** balance de XP/costos, persistencia (F33) y F1 (día/noche) para la visión de la linterna.

---

**Fin del README · Última revisión: 2026-10-21**