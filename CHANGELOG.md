# 📝 Changelog · Game_RPG

Historial completo de versiones del proyecto. Para el estado actual, ver [README.md](README.md).

---
### 📐 Rediseño planificado (no implementado)

- **Decisión:** el sistema de `permutacionBiomas()` se reemplazará por una **tabla JSON externa** (`biomas.json`).
- **Motivo:** el sistema actual es rígido, difícil de escalar y tiene bugs.
- **Nuevo sistema:** biomas definidos como datos (vecinos permitidos + pesos + tiles con probabilidad).
- **Nuevos biomas:** oceano, desierto, nieve (total: 7 biomas naturales).
- **Fase 2 (futuro):** biomas forzados (ciudades, puertos, islas) + chunks de transición.
- **Ver:** BACKLOG · F14 y F15.

## v2.0 · 2026-10-16 (migración a chunks 2D completada)

### 🎯 Objetivo

Migrar de un mundo **1D (corredor E-O)** a un mundo **2D circular (360°)** con **cámara fluida**.

### ✅ Completado

**Fase 1 · Constantes nuevas**
- `ANCHO_CHUNK = 32`, `ALTO_CHUNK = 32`
- `ANCHO_VENTANA = 25`, `ALTO_VENTANA = 17`
- `TAMANO_CELDA = 16`
- `LIMITE_CHUNKS = 4`
- `DURACION_MOVIMIENTO_MS = 200`
- Llave en chunk (2, 0)

**Fase 2 · Sistema de cámara (`js/systems/camara.js` — NUEVO)**
- `camara.x`, `camara.y`
- `iniciarCamara()`, `sincronizarCamara()`, `obtenerOffsetCamara()`
- `coordsMundoAChunk()`, `coordsMundoATile()`, `normalizarChunk()`

**Fase 3 · Chunks 2D**
- `estado.js`: jugador vive en `(wx, wy)`.
- `chunks.js`: caché `"cx,cy"` → chunk. `inicializarJugador()`, `inicializarLlave()`.
- `mundo.js`: `generarPantalla(semilla, cx, cy)`. `obtenerBiomaDeChunk()`.

**Fase 4 · Render + movimiento 360°**
- `render.js`: grid extendido, contenido recalculado, `translate` para el desplazamiento.
- `jugador.js`: movimiento 360° con interpolación. `alPisarCelda()`.
- `input.js`: input continuo (teclas + botones).
- `main.js`: loop con `requestAnimationFrame`.

**Fase 5 · Ítems y mobs 2D**
- `items.js` reescrito: ítems y equipables en coordenadas del mundo.
- `enemigos.js` reescrito: mobs por chunk 2D.
- Fix: manzanas no se generan sobre agua.
- Fix: mobs no se generan sobre ítems.
- Fix: ítems no se generan sobre mobs.

**Fase 6 · Rotura y barco 2D**
- `rotura.js`: click → coordenadas del mundo. Rotura instantánea.
- `barco.js`: click → coordenadas del mundo. Desembarco funcional.
- Romper rocas del agua desde el barco.
- Navegación entre chunks en barco.

**Fase 7 · Victoria y pausa**
- `victoria.js`: adaptado a `estado.llave.wx, wy`.
- Pausa global (`estado.pausado`) durante batalla.
- Se cancela rotura/barco al iniciar batalla.

### 🎨 Ajustes visuales
- Jugador fijo en el centro exacto del viewport.
- Jugador y mapa no seleccionables (`user-select: none`).
- Cámara y mapa sincronizados (sin desfase).
- Barra de stamina no mueve el layout.

### 🔧 Fixes adicionales
- Muros N-S eliminados (sin bloqueo vertical).
- Colisión con mobs restaurada (cerdos/gallinas bloquean, tigres inician batalla).
- Equipables en cada chunk de su bioma (porChunk: true).
- Tigres aparecen en nieve.
- Barco no se puede colocar sobre mobs.
- `limite.js` y `funLimiteChunk()` eliminados.

### ⏸️ Pendiente
- **Fronteras compartidas en 2D:** suavizar cortes entre chunks.
- Barco: mob bloqueando la única celda de tierra.
- Mobs de chunks vecinos: ¿actúan cuando el jugador no los ve?

### 📖 Documentación
- README: actualizado a v2.0.
- BACKLOG: F21 marcado como implementado.
- CHANGELOG: esta entrada.

### ⚠️ Estado
- **v2.0 estable.** El juego es 100% jugable.
- Todas las mecánicas funcionan: exploración, ítems, mobs, rotura, barco, batalla, victoria.

---


## v1.9.1 · 2026-10-15 (prototipo chunks 2D aprobado)

### 🎨 Prototipo · Chunks 2D con cámara fluida (APROBADO)

- Archivo nuevo: `chunks-2d.html` (independiente, para pruebas)
- **Sistema probado y aprobado:**
  - Chunks de **32×32 celdas** (potencia de 2)
  - Celdas de **32px** en el prototipo (para ver bien; en el juego real puede ser otra)
  - Ventana visible de **32×24 celdas**
  - **Cámara fluida** (jugador fijo en el centro, mundo se desplaza)
  - **Movimiento 360°** con WASD
  - **Mundo circular** en X e Y (tipo Pac-Man)
  - **Límite de ±5 chunks** (aunque con wrap es circular)
  - **Zona (0,0) segura** (pradera)
  - **Render de ventana** que consulta varios chunks a la vez
  - **Movimiento fluido** (200ms por celda)

### ✅ Observaciones del test

1. Se ve bien con chunk 32×32 y celda 32px. ✅
2. **Los cortes entre chunks se notan** (cambio brusco de tiles). ⚠️
   - **Solución propuesta:** fronteras compartidas en 2D (el chunk nuevo consulta el borde del anterior y arranca con tiles similares).
   - Se implementará después de la migración base.
3. El wrap circular funciona bien. ✅
4. El movimiento es fluido. ✅
5. El jugador está correctamente centrado. ✅

### ⏸️ Próximo paso (bloqueante)

**Migración al juego real** (ver BACKLOG · F21).
- Trabajar en un **branch `2d`** para no romper `main`.
- 4-6 sesiones estimadas.

### 📖 Documentación
- BACKLOG: F21 ampliado con plan de migración completo
- README: R17, R18 agregados

---

## v1.8 · 2026-10-13 (fix costa + idea tema espacio)

### 🎨 Cambios
- **Costa con forma de franja**: el bioma "costa" ahora pinta agua + arena + pasto en franjas con bordes irregulares (antes eran charcos salpicados)
- **Nuevo campo `forma` en biomas**: `forma: "franja"` activa el motor especial de pintado
- **Nueva función `pintarCosta()`** en `mundo.js`
- **Tile del desierto** cambiado a 🟧 (naranja) para no confundirse con el cactus 🌵
- **Fix**: barra de stamina ya no mueve el mapa al aparecer (usa `visibility` en lugar de `display: none`)
- **Ice** ahora se rompe con pico ⛏️

### 📖 Documentación
- BACKLOG: F16 marcado como implementado, F18 (barco) anotado, F17 (biomas con forma) anotado
- README: M19 (costa franja), G18 (forma biomas), R16 (sistema forma)

### 🌌 Idea anotada (futuro)
- **Tema "espacio"**: el proyecto completo puede convertirse a un juego espacial (astronauta, planetas, meteoritos, ciencia ficción)
- Solo requiere cambiar **datos**: íconos en `tiles.js`, nombres y tiles en `biomas.js`, mobs en `mobs.js`
- El motor no se toca

---


## v1.7 · 2026-10-13 (sistema de rotura)

### ➕ Nuevo
- **Sistema de rotura** (`js/systems/rotura.js`)
- Click sostenido sobre un tile rompible (árbol, piedra, etc.)
- Barra de stamina arriba del mapa (100% → 0%)
- Cartel "Necesitás un hacha/pico" al intentar romper sin objeto
- Al terminar la rotura: el tile se convierte al `tileBase` del bioma

### 🔧 Cambios
- `js/core/tiles.js`: nuevo mapa `ROTURA_POR_TILE` (qué se rompe con qué)
- `js/world/biomas.js`: cada bioma ahora tiene un campo `tileBase`
- `js/core/config.js`: `DURACION_ROTURA_MS` (3000) y `INTERVALO_ROTURA_MS` (50)
- `js/main.js`: `reiniciarMundo()` cancela rotura activa

### 🎨 Diseño
- Barra de stamina con `visibility` (no mueve el layout al aparecer)
- Botón de cartel temporal (aparece y desaparece)

### ✅ Condiciones para romper
1. Click exacto sobre el tile
2. Jugador adyacente (4 direcciones)
3. Objeto correcto equipado

### ✅ Cancelaciones
- Al soltar el click
- Al moverse el jugador
- Al cambiar de zona
- Al perder el objeto
- Al reiniciar el mundo

### 📖 Documentación
- README: MARCO 4.5 actualizado con sistema de rotura completo
- BACKLOG: F11 marcado como completado

### ⏸️ Pendiente futuro
- Objetos de mejor nivel (hacha de diamante, etc.) — ver F12
- Más tiles rompibles — agregar a `ROTURA_POR_TILE`

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