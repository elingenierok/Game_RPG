# 📝 Changelog · Game_RPG

Historial completo de versiones del proyecto. Para el estado actual, ver [README.md](README.md).

---
## v1.6.1 · 2026-10-13 (interfaz lateral + botones)

### ➕ Nuevo
- **Layout 3 columnas**: flechas (20%) + mapa (60%) + panel derecho (20%)
- **Botones de movimiento** en rombo (↑ arriba, ← ↓ → abajo) con click sostenido
- **Slots de equipados** arriba del mapa (3 slots, siempre visibles)
- **Barra de objetivos** abajo del mapa con múltiples objetivos (jugador + llave + equipables)
- **HUD rediseñado** con íconos correctos por tipo de objeto

### 🔧 Cambios
- `index.html` reestructurado con nuevo layout
- `css/estilo.css` reescrito para el nuevo layout
- `js/ui/render.js`:
  - `actualizarHUD()` ahora muestra el ícono correcto por objeto
  - Nueva función `actualizarSlotsEquipados()`
  - `renderBarraZonas()` muestra múltiples objetivos con prioridad
  - Nuevo `ICONO_POR_NOMBRE` (mapa nombre → ícono)
- `js/core/input.js`:
  - Nuevo sistema de botones con click sostenido (200ms)
  - Soporte de touch (móvil)
  - Detención automática al salir de la ventana

### 🎨 Diseño
- Botones en rombo estilo teclas con glow celeste al apretar
- Slots de equipados con glow cuando tienen un objeto
- Barra de objetivos con flechas laterales cuando hay objetivos fuera del rango

### 📖 Documentación
- README: MARCO 4.5 actualizado con fases y diseño del sistema de rotura
- BACKLOG: F11 actualizado

### ⏸️ Pendiente (próxima sesión)
- **F11 Fase 3:** click sostenido sobre árboles/piedras
- **F11 Fase 4:** barra de stamina de rotura (3-5 segundos)

---

## v1.6 · 2026-10-13 (sistema de biomas por tabla JSON)

### ➕ Nuevo
- **Sistema de biomas por tabla JSON** (`js/world/biomas.js`)
- 7 biomas: pradera, bosque, costa, ruina, oceano, desierto, nieve
- Cada bioma define **vecinos permitidos con pesos** + **tiles con probabilidad**
- **5 tiles nuevos**: 🏜️ DESERT_SAND, 🌵 CACTUS, ❄️ SNOW, 🧊 ICE, 🌲 PINE
- Nuevas funciones en `mundo.js`:
  - `obtenerBiomaDeZona(semillaBase, zona)` — asigna bioma por cadena
  - `elegirPorPeso(lista, ...)` — elige según pesos
  - `limpiarCacheBiomas()` — limpia el cache
- Nuevo mapa en `tiles.js`: `NOMBRE_A_TILE` (string → ID)
- **Auditor de semillas** funcionando como módulo independiente (3 archivos HTML/CSS/JS, lee del madre sin modificarlo)

### 🔧 Cambios
- `generarPantalla()` reescrita: ahora usa `obtenerBiomaDeZona()` + tabla `BIOMAS`
- `LIMITE_CHUNKS` subido a 20 temporalmente (para testear biomas nuevos)
- ROCK ahora usa ⛰️ (antes 🪨)
- PLAYER ahora usa 🏃‍♂️ (antes 🧑)
- `BLOQUEANTES` ahora incluye CACTUS, ICE, PINE
- Pesos de vecinos ajustados para más variedad

### 🐛 Fixes
- **Bug de `permutacionBiomas()` resuelto**: se reemplazó todo el sistema por el motor nuevo
- Bosque ya no bloquea el paso (densidad de árboles bajada de 40% a 15%)
- Ruina, costa, desierto y nieve ajustados para no bloquear el paso

### 📖 Documentación
- BACKLOG actualizado con F14 (rediseño de biomas, ✅ implementado) y F15 (biomas forzados)
- BACKLOG agregó F16 (rediseño de costa) y F17 (biomas con forma)
- README: nuevos M17, M18, G15, G16, G17

### ⚠️ Notas
- La distribución de agua en el bioma "costa" todavía es imperfecta (charcos en lugar de franjas). Ver **F16**.
- El límite de chunks (`LIMITE_CHUNKS = 20`) es temporal. Volver a 5 cuando se terminen los tests.

### 📌 Objetos equipables (v1.6-alpha)
- Siguen implementados (fase 1).
- Pendientes las fases 2, 3 y 4 (ver **F11**).

---

## v1.6-alpha · 2026-10-11 (objetos equipables · EN DESARROLLO)

### ➕ Nuevo
- 3 objetos equipables: 🪓 Hacha, ⛏️ Pico, 🕯️ Linterna
- Spawn único por mundo (1 de cada uno), determinista por semilla
- Recolección al pisarlos (se suman al inventario del HUD)
- Sistema de forzar los 4 biomas por mundo (permutación por semilla)
- Nuevas funciones en `items.js`: `obtenerZonaDeEquipable`, `obtenerEquipablesDeChunk`, `obtenerEquipableEn`, `recogerEquipableEn`
- Nueva función en `mundo.js`: `permutacionBiomas`

### 🐛 Bug pendiente (bloquea v1.6)
- **Permutación de biomas no funciona correctamente.**
  - Con semilla `diagnostico`, la zona 2 repite el bioma de la zona 1.
  - El bioma "costa" no aparece nunca.
  - Los objetos 🕯️ Linterna no se generan.
- **Próximo paso:** diagnosticar `permutacionBiomas()` con `console.log`.

### 📖 Documentación
- README: nuevo MARCO 4.5 · Objetos equipables
- CHANGELOG: esta entrada

### ⚠️ Estado
- **v1.6-alpha no es estable.** El juego funciona, pero los objetos pueden no aparecer correctamente.
- La próxima sesión debe empezar retomando el bug de `permutacionBiomas`.

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