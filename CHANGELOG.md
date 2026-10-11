# 📝 Changelog · Game_RPG

Historial completo de versiones del proyecto. Para el estado actual, ver [README.md](README.md).

---

## v1.5.1 · 2026-10-11 (fixes de IA)

### 🐛 Fixes
- **Mobs spawneaban cerca del jugador** → Zona 0 sin mobs (zona segura)
- **Mobs atravesaban ítems (🍎)** → ahora colisionan con ítems
- **Orientación de mobs invertida** → corregido en `moverMob()`
- **Jugador aparecía encima de un mob al cruzar zona** → `alejarMobsDelJugador()` con radio de 3 tiles
- **El mob solo se alejaba 1 bloque** → ahora empuja repetidamente hasta estar fuera del radio
- **Tigre no atacaba al alcanzar al jugador** → `moverMob()` dispara batalla al pisar al jugador
- **`...` fantasma en `jugador.js`** → eliminado (bloqueaba toda la carga de scripts)
- **`}` duplicado en `ia.js`** → eliminado

### 🔧 Nuevo
- `RADIO_SEGURIDAD_SPAWN = 3` en `config.js`
- Función `alejarMobsDelJugador()` en `ia.js`
- Función `generarDireccionesDeEscape()` en `ia.js`

### 📖 Documentación
- Separación del historial en `CHANGELOG.md`
- Separación del backlog en `BACKLOG.md`
- README reducido de ~800 a ~400 líneas

---

## v1.5 · 2026-10-11 (IA de mobs)

- ➕ **IA de mobs en tiempo real** (`js/systems/ia.js`)
- ➕ Sistema de ticks (400ms base, deambulación cada 2 ticks)
- ➕ Comportamiento hostil / pacífico / neutral
- ➕ Deambulación aleatoria por el chunk
- ➕ Persecución (hostil) y huida (pacífico)
- ➕ Mobs con orientación visual (espejado según dirección)
- ➕ Colisiones: bloqueantes, mobs, jugador, ítems, barrera de chunk
- ➕ Pausa de ticks en overlays (batalla, transición)
- ➕ Zona 0 sin mobs (zona segura de spawn)
- 🔧 `config.js` agregado: `TICK_MS`, `TICK_DEAMBULAR_CADA`
- 🔧 `mobs.js` actualizado: `actitud.base` = `hostil`/`pacifico`/`neutral`
- 🔧 `enemigos.js`: estado mutable de cada mob (posición, IA)
- 🔧 `jugador.js`, `victoria.js`, `chunks.js`, `main.js`: pausa/reanudación de ticks
- 📖 Backlog ampliado: F6 (pathfinding), F7 (deambulación realista), F8 (objetos equipables)

---

## v1.4 · 2026-10-11 (subcarpetas)

- 🏗️ Reorganización en subcarpetas (`core/`, `world/`, `entities/`, `ui/`, `systems/`)
- ➕ 5 carpetas nuevas en `js/`
- 🔧 15 archivos movidos a sus carpetas correspondientes
- 🔧 `<script src>` actualizados con las nuevas rutas
- 📌 `systems/` queda preparada para sistemas futuros

---

## v1.3 · 2026-10-11 (semillas separadas)

- ➕ Semillas independientes por sistema (F4 implementado)
- ➕ `SEMILLA_MOBS` = `Date.now()` → los mobs cambian en cada carga de página
- ➕ `SEMILLA_OBJETOS` = `SEMILLA` (preparada para separar en el futuro)
- 🔧 `js/entities/enemigos.js` ahora usa `SEMILLA_MOBS`
- 🔧 `js/entities/items.js` ahora usa `SEMILLA_OBJETOS`

---

## v1.2 · 2026-10-10 (sistema de mobs)

- ➕ Sistema de mobs escalable (`js/entities/mobs.js`) — plantilla + 3 mobs
- ➕ Spawn de mobs (`js/entities/enemigos.js`) — por chunk, según bioma
- ➕ Batalla simulada al chocar con mob agresivo (overlay + botón)
- ➕ 3 mobs iniciales: 🐅 Tigre (agresivo), 🐓 Gallina (pasivo), 🐖 Cerdo (neutral)
- ➕ RNG separado para mobs (`@mobs`)
- 🔧 Fix de orientación del jugador (invertido)
- 📖 README reorganizado: 13 marcos + backlog de análisis futuros
- 📌 Anotadas 5 ideas futuras: día-noche, movimiento amortiguado, capas, semillas separadas, spawn forzado

---

## v1.1 · 2026-10-10 (grilla 50×34)

- 🔧 Grilla cambiada a 50×34 (antes 25×17)
- 🔧 Tamaño de celda reducido a 16×16 px (antes 30×30)
- ➕ Orientación del jugador con `scaleX(-1)`
- ➕ Centralización de tamaño: todo derivado de `config.js`
- 📌 Anotadas ideas: día-noche, movimiento amortiguado, capas
- 📌 Decisión: enemigos 1×1, estructuras grandes (Forma A) → fase futura

---

## v1.0 · 2026-10-09 (GitHub + Pages)

- ☁️ Proyecto subido a GitHub: [elingenierok/Game_RPG](https://github.com/elingenierok/Game_RPG)
- 🌐 GitHub Pages activado: [elingenierok.github.io/Game_RPG](https://elingenierok.github.io/Game_RPG/)
- 📖 README con flujo de trabajo Git documentado
- 🔧 `.gitignore` creado
- ➕ Prototipo 1 del módulo de combate

---

## v1.0-beta · 2026-10-09 (arquitectura modular)

- 🏗️ Refactorización completa a múltiples archivos
- ➕ 13 archivos `.js` + `css/estilo.css`
- ➕ Bloques 12-18 movidos a archivos individuales

---

## v0.5 · 2026-10-09 (refactor parcial)

- 🏗️ Refactorización parcial (bloques 1-11)
- ➕ 8 archivos `.js` creados
- ⚠️ Requiere Live Server

---

## v0.4 · 2026-10-09 (ítems + límites)

- ➕ Ítems recolectables (🍎)
- ➕ Inventario en HUD
- ➕ Control de semilla en UI
- ➕ Límite configurable de chunks
- ➕ Muros sólidos en extremos

---

## v0.3 · 2026-10-09 (fronteras compartidas)

- ➕ Fronteras compartidas entre chunks
- ➕ Caché de chunks con precarga de vecinos
- ➕ Continuidad física al cruzar
- ➕ Validación BFS de transitabilidad

---

## v0.2 · 2026-10-09 (barra de zonas)

- ➕ Barra de zonas con 5 slots
- ➕ Jugador centrado en la barra
- ➕ Indicadores de zonas visitadas
- ➕ Flechas direccionales
- 🎨 Glow en slot actual

---

## v0.1 · 2026-10-09 (motor base)

- ➕ Motor inicial de generación con semilla
- ➕ Mundo E-O por zonas
- ➕ 4 biomas con frontera dura
- ➕ Movimiento WASD + flechas

---

**Fin del CHANGELOG**