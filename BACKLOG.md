# 🔮 Backlog · Game_RPG

Ideas futuras anotadas. **No están priorizadas ni implementadas.** Se anotan para no perderlas.

Para el estado actual del proyecto, ver [README.md](README.md).

**Contenido actual:**

- F1 · Ciclo día-noche
- F2 · Movimiento amortiguado (Modelo 2 · Pokémon) · ✅ IMPLEMENTADO en v2.0
- F3 · Sistema de capas del mundo
- F4 · Semillas independientes por sistema · ✅ IMPLEMENTADO en v1.3
- F5 · Spawn forzado por bioma o estructura
- F6 · Pathfinding con obstáculos
- F7 · Deambulación más realista
- F8 · Objetos equipables y modificar el mundo · 🧪 FASES 1-2 IMPLEMENTADAS
- F9 · Sistema de mouse / interacción con click · 🧪 PARCIAL
- F10 · Bioma "playa" como bioma separado
- F11 · Fases de objetos equipables · ✅ IMPLEMENTADO en v1.7
- F12 · Objetos equipables de mejor nivel
- F13 · Drops alternativos de objetos
- F14 · Rediseño del sistema de biomas con JSON · ✅ IMPLEMENTADO en v1.6
- F15 · Biomas forzados + chunks de transición
- F16 · Rediseño del bioma "costa" · ✅ IMPLEMENTADO en v1.7.1
- F17 · Sistema de "biomas con forma"
- F18 · Barco (atravesar agua) · ✅ IMPLEMENTADO en v2.0
- F19 · Tema "espacio" (nueva piel) · 🧪 PARCIAL en v2.3-alpha
- F20 · Sistema de sprites animados (atlas + animaciones)
- F21 · Migración a chunks 2D + cámara fluida · ✅ IMPLEMENTADO (base) en v2.0
- F22 · Limitar generación de equipables
- F23 · Transformaciones visuales de tiles y mobs
- F24 · Bugs conocidos de v2.4-alpha · ✅ TODOS RESUELTOS en v2.4.1
- F25 · Sistema de efectos visuales genéricos · 🧪 PARCIAL en v2.4.2-alpha

---

## 🌗 F1 · Ciclo día-noche

**Idea:** visión variable según momento del día.

- **Día:** todas las celdas visibles.
- **Noche:** visión limitada a ~5 celdas de radio, salvo iluminación artificial (farolas, fogatas, antorchas).
- **Implementación:** celdas lejanas "apagadas" (opacidad reducida o no renderizadas).

**Preguntas pendientes:**

- ¿Duración del ciclo? ¿Turnos? ¿Tiempo real? ¿Fijo?
- ¿Afecta gameplay (enemigos más agresivos de noche, eventos)?
- Fuentes de luz: ¿ítems portables? ¿estructuras fijas? ¿ambas?

**Estado:** ⏸️ Anotado.

---

## 🚶 F2 · Movimiento amortiguado entre celdas (Modelo 2 · Pokémon) · ✅ IMPLEMENTADO en v2.0

**Idea:** el jugador se mueve **casilla a casilla**, pero con una **animación visual suave** entre una y la siguiente. La lógica de grilla queda intacta.

**Diferencia con Modelo 1 (viejo):**

| Modelo | Comportamiento |
|--------|----------------|
| **1 · Viejo** | El jugador salta de casilla en casilla **instantáneamente** |
| **2 · Pokémon** | El jugador se **desliza** de casilla a casilla en ~120-150ms |
| **3 · Zelda** | El jugador se mueve libremente por píxeles (no viable sin reescribir) |

**Concepto clave:** el jugador **nunca está entre casillas lógicamente**. Solo **visualmente** durante la animación. Al terminar la animación, está en la nueva casilla.

**Estado:** ✅ Implementado en v2.0 (`DURACION_MOVIMIENTO_MS = 100`).

**Extensión (v2.3-alpha):** animación de "correr" alternando 2 emojis cada 150ms mientras se mueve, y orientación según dirección.

---

## 🗂️ F3 · Sistema de capas del mundo

**Idea:** separar el mundo en **capas independientes**, cada una con su responsabilidad.

| Capa | Contenido |
|:----:|-----------|
| 1 | Terreno base (pasto, agua, arena, árboles) |
| 2 | Objetos estáticos (estructuras, cofres, letreros) |
| 3 | Entidades móviles (jugador, mobs, NPCs) |
| 4 | Iluminación / visión |
| 5 | Clima / ambiental (lluvia, nieve, niebla) |
| 6 | Efectos especiales (visión infrarroja, detección mágica) |

**Ventajas:** encender/apagar capas sin reescribir código. Cada capa tiene su lógica propia.

**Preguntas pendientes:** ¿cómo se renderiza? ¿canvas múltiple? ¿puede una capa leer otra? ¿impacto en performance?

**Estado:** ⏸️ Anotado. Pendiente para después de HP + daño.

---

## 🎲 F4 · Semillas independientes por sistema · ✅ IMPLEMENTADO en v1.3

**Estado:** implementado. Ver `SEMILLA_MOBS` en `js/core/config.js`.

| Sistema | Semilla | ¿Editable? |
|---------|---------|:----------:|
| Mundo (terreno, biomas, estructuras) | `SEMILLA` | ✅ Sí |
| Mobs | `SEMILLA_MOBS` | ⏸️ Automática (`Date.now()`) |
| Objetos | `SEMILLA_OBJETOS` | ⏸️ Ligada a `SEMILLA` por ahora |

**Pendiente futuro:** permitir que `SEMILLA_MOBS` sea editable por el jugador.

---

## 📌 F5 · Spawn forzado por bioma o estructura

**Idea:** permitir forzar la aparición de un mob en un lugar específico.

**Ejemplos:**

- Un 🐉 dragón que aparece **solo en ruinas** y **solo una vez** por mundo.
- Un 🐟 pez que aparece **solo en agua** y **solo de noche**.
- Un 👻 fantasma que aparece **solo dentro de una estructura "castillo"**.

**Campos ya definidos en la plantilla:** `spawn.forzarEnEstructura`, `spawn.tipoAparicion`, `spawn.porMapa`.

**Falta:** lógica de detección de estructura, control de "veces que puede aparecer", condiciones especiales.

**Estado:** ⏸️ Anotado.

---

## 🧭 F6 · Pathfinding con obstáculos (IA avanzada)

**Idea:** los mobs actualmente se mueven en **línea recta**. Si hay un obstáculo en el camino (árbol, otro mob, muro), **se quedan quietos ese tick**.

**Mejora propuesta:** que puedan **rodear** obstáculos para llegar al jugador.

**Consideraciones:**

- Requiere algoritmo **A\*** o similar sobre la grilla.
- El cálculo es más costoso → hay que optimizarlo (cachear caminos, recalcular cada N ticks).
- Aplica a: persecución (tigre) y huida (gallina).
- No aplica a deambulación (el moverse al azar ya funciona bien).

**Estado:** ⏸️ Anotado. Se implementará si el juego lo necesita.

---

## 🚶 F7 · Deambulación más realista

**Idea:** actualmente los mobs deambulan de forma **totalmente aleatoria**: cada 2 ticks eligen una dirección al azar entre las 4 posibles.

**Problema:** el movimiento se ve "zigzagueante" e impredecible. No parece que estén "paseando".

**Mejoras propuestas:**

- **Momentum:** preferir seguir la misma dirección que venían (ej: 70% de mantener, 30% de cambiar).
- **Puntos de interés:** que el mob tenga 1-3 puntos de interés en el chunk y vaya rotando entre ellos.
- **Descansos:** pausas aleatorias de 2-4 ticks entre movimientos.
- **Zonas preferidas:** que cada mob prefiera deambular en un área específica del chunk.

**Estado:** ⏸️ Anotado. Se implementará si la deambulación actual se siente demasiado errática.

---

## 🎒 F8 · Objetos equipables y modificar el mundo · 🧪 FASES 1-2 IMPLEMENTADAS

**Idea:** permitir al jugador **equipar ítems** (cascos, botas, hachas) y **modificar el mundo** (picar, talar, construir). Los cambios deben **persistir** entre sesiones.

**Modelo de persistencia:** deltas.

```text
mundo = función(semilla, chunk) + deltas
```

- Los deltas guardan solo los cambios del jugador (`"cx,cy:lx,ly" → tile nuevo`).
- Se combinan con el mundo generado al cargar un chunk.
- Es el modelo estándar de Minecraft, Terraria, etc.

**Capas del sistema:**

| Capa | Semilla | Estado |
|------|---------|:------:|
| Terreno | `SEMILLA` | ✅ Implementado |
| Estructuras | `SEMILLA_ESTRUCTURAS` | ⏸️ Pendiente |
| Mobs | `SEMILLA_MOBS` | ✅ Implementado |
| Objetos de terreno | `SEMILLA_OBJETOS` | 🧪 Ligado a `SEMILLA` |
| Loot de contenedores | `SEMILLA_LOOT` | ⏸️ Pendiente |

**Fases propuestas:**

1. Objetos equipables (slots + stats). ✅ v1.7
2. Modificar mundo en memoria (picar/talar). ✅ v2.0
3. Persistencia con deltas (localStorage). ⏸️
4. Inventario visual completo. ⏸️

**Estado:** Fases 1-2 completadas. Fases 3-4 pendientes.

---

## 🖱️ F9 · Sistema de mouse / interacción con click · 🧪 PARCIAL

**Idea:** usar el mouse para **interactuar con entidades y objetos** en el mapa, en lugar de solo caminar sobre ellos.

**Comportamiento por tipo de objetivo:**

| Objetivo | Acción al hacer click |
|----------|----------------------|
| Mob hostil | Atacar (inicia batalla) |
| Mob neutral | Interactuar |
| Mob pacífico | Interactuar |
| NPC | Hablar (abre diálogo) |
| Cofre | Abrir |
| Cueva / puerta | Ingresar |
| Ítem en el suelo | Recoger |
| Tile rompible | Romper (con objeto) |

**Estado:** 🧪 Parcialmente implementado en v2.0 (click → romper, click → barco, click → desembarcar).

**Pendiente:** interacción con NPCs, cofres, cuevas.

---

## 🏖️ F10 · Bioma "playa" como bioma separado

**Idea:** actualmente "playa" NO es un bioma. Es un conjunto de tiles (arena 🟨) dentro del bioma "costa".

**Consecuencia:** no se puede hacer un objeto equipable específico para "playa", ni un mob de playa, ni transiciones suaves.

**Propuesta:** separar "playa" como un bioma propio en el futuro.

**Estado:** ⏸️ Anotado.

---

## 🎒 F11 · Fases de objetos equipables · ✅ IMPLEMENTADO en v1.7

**Estado:** completo. Los objetos equipables se recogen, se muestran en slots, y permiten romper tiles del mundo.

**Referencia:**

- `ROTURA_POR_TILE` en `tiles.js` — define qué se rompe con qué.
- `tileBase` en `biomas.js` — a qué tile se convierte el objeto roto.

---

## ⚙️ F12 · Sistema de objetos equipables de mejor nivel

**Idea:** a futuro, poder tener versiones de mejor nivel de cada objeto.

**Ejemplos:**

- Hacha de madera (5 seg), hacha de hierro (3 seg), hacha de diamante (1 seg).
- Pico similar.
- Linterna con más radio de luz.

**Sistema propuesto:** cada objeto tiene un `nivel` y `velocidad` que modifican el tiempo de rotura.

**Estado:** ⏸️ Anotado. Futuro lejano.

---

## 📦 F13 · Drops alternativos de objetos

**Idea:** los objetos equipables pueden obtenerse de formas alternativas además del spawn en el mundo.

**Fuentes propuestas:**

- Al matar ciertos mobs.
- Al romper vehículos/piedras específicas.
- Al abrir cofres.
- Al completar misiones.

**Estado:** ⏸️ Anotado. Futuro medio.

---

## 🗺️ F14 · Rediseño del sistema de biomas con JSON · ✅ IMPLEMENTADO en v1.6

**Motivo:** el sistema viejo (`permutacionBiomas()`) era rígido, difícil de escalar y tenía bugs. Se reemplazó por una **tabla JSON/JS externa**.

**Estado:** completado. Ver `js/world/biomas.js`.

**Concepto:**

- 7 biomas definidos como datos.
- Cada bioma tiene: `nombre`, `emoji`, `tileBase`, `vecinos` (con pesos), `tiles` (con pesos).
- El motor `obtenerBiomaDeChunk()` decide el bioma de cada chunk por hash determinista.
- Determinista por semilla.

**Biomas actuales:** pradera, bosque, costa, ruina, oceano, desierto, nieve.

**Referencia:**

- `js/world/biomas.js` — tabla de biomas.
- `js/world/mundo.js` — motor de asignación y pintado.

---

## 🏙️ F15 · Biomas forzados + chunks de transición

**Idea:** después de generar el mundo natural, una **segunda pasada** inserta biomas forzados (ciudades, puertos, islas, ruinas temáticas) que reemplazan chunks existentes.

### Reglas confirmadas

| Aspecto | Decisión |
|---------|----------|
| Aparición | Regla por chunk |
| Tamaño | Chunk entero (32×32) |
| Transición | Chunks de transición automáticos alrededor |
| Detección | El jugador los descubre al llegar |
| Continuidad | Puede bloquear el paso |
| Reemplazo | Los tiles nuevos pisan los viejos |

### Tipos de biomas forzados (ejemplos)

- 🏙️ Ciudad — reemplaza pradera o bosque.
- ⚓ Puerto — reemplaza costa, requiere oceano cerca.
- 🏝️ Isla — aparece dentro de océano.
- 🏰 Castillo — reemplaza ruina.

**Estado:** ⏸️ Planificado. Se implementará después de HP + daño.

---

## 🏖️ F16 · Rediseño del bioma "costa" · ✅ IMPLEMENTADO en v1.7.1

**Problema:** el bioma "costa" pintaba los tiles con probabilidad uniforme. El resultado eran "charcos" de agua salpicados por el chunk.

**Solución:** la costa ahora usa **forma de franja**:

- Agua en un lateral (~1/3 del chunk).
- Arena en el medio (~1/3).
- Pasto en el otro lateral (~1/3).
- Bordes irregulares (con ondulación) para naturalidad.

**Implementación:**

- `js/world/biomas.js`: campo `forma: "franja"` en el bioma costa.
- `js/world/mundo.js`: función `pintarCosta()`.

**Estado:** ✅ Completado.

---

## 🌊 F17 · Sistema de "biomas con forma"

**Idea:** algunos biomas no se generan con probabilidad uniforme por celda. Tienen **forma**.

**Formas previstas:**

- **Franja:** agua en un lateral (costa) — ✅ implementado.
- **Lago:** masa circular en el centro.
- **Río:** franja atravesando el chunk.
- **Isla:** tierra rodeada de agua.
- **Montaña:** elevación con cordillera.

**Estado actual:**

- ✅ `pintarCosta()` implementado (franja).
- ⏸️ Otras formas pendientes.

**Extensible a:** motor genérico de formas basado en el campo `forma` de cada bioma.

**Estado:** ⏸️ Planificado.

---

## 🛶 F18 · Barco (atravesar agua) · ✅ IMPLEMENTADO en v2.0

**Idea:** un objeto equipable que permite al jugador caminar sobre tiles de agua.

### Objeto: 🛶 (Canoa)

- **Aparece:** en cada chunk de costa (porChunk), en tierra, pegado a agua, lejos de los bordes.
- **Recolección:** al pisarlo, se suma al inventario.
- **Slot:** slot de equipados (junto a 🪓 ⛏️ 🕯️).

### Uso

1. El jugador tiene 🛶 en el inventario.
2. Hace **click** sobre un tile de agua **adyacente**.
3. Se inicia una **barra de 5 segundos**.
4. Al terminar: el jugador se sube al barco (🚣 / 🛸) y puede moverse sobre agua.
5. Click sobre tierra adyacente → barra de 2 seg → se baja del barco.

### Detalles

- **Solo atraviesa `WATER`.**
- **El barco es del jugador.** Una vez conseguido, siempre lo tiene.
- **No se consume.**
- **Puede romper tiles desde el barco** (ej: rocas en el agua).

**Estado:** ✅ Completado en v2.0. Animación de "en barco" agregada en v2.3-alpha.

---

## 🌌 F19 · Tema "espacio" (nueva piel) · 🧪 PARCIAL en v2.3-alpha

**Idea:** reutilizar el motor completo del juego con un cambio temático de "roguelike" a "explorador espacial".

**Regla clave:** **no se toca el motor.** Solo se cambian **datos**.

### Estado actual (v2.3-alpha)

**Infraestructura completa:**

- `js/core/temas/tema-tierra.js` — datos originales.
- `js/core/temas/tema-espacio.js` — datos espaciales.
- `TEMA_ACTIVO` en `config.js`.
- `tiles.js`, `biomas.js`, `mobs.js` son wrappers que leen del tema activo.

**Tema espacio funcional:**

- 25 iconos espaciales (nave, meteorito, alien, etc.).
- 7 biomas espaciales (llanura lunar, zona de naves, borde de cráter, ruinas alienígenas, mar de metano, dunas rojas, campo de hielo).
- 3 mobs espaciales (alien hostil, dron pacífico, reptiliano neutral).
- Botón de cambio de tema en la UI (arriba a la derecha).
- Persistencia en `localStorage`.

**Extras que surgieron durante la implementación:**

- Color de fondo por bioma (tierra y espacio).
- Animación del jugador (quieto, corriendo, en barco).
- Emojis del jugador por tema (🧍‍♂️/👨‍🚀, 🏃‍♂️/🏍️, 🚣/🛸).

### Falta

**Diseño:**

- Revisar y ajustar los emojis actuales (los más dudosos: 🪐 como TALLGRASS, 🦎 como CERDO, 🏍️/🏎️ como correr).
- Diseñar más biomas específicos de espacio (ej: campo de asteroides, pantano de metano tóxico, base minera abandonada).
- Diseñar mobs nuevos (jefe final, drones hostiles, robots mineros).
- Diseñar ítems nuevos (herramientas espaciales, combustible, llaves de acceso).
- Definir la narrativa: ¿por qué el astronauta busca piezas? ¿Qué pasa al reparar la nave?

**Técnico:**

- Adaptar `items.js` para que `EQUIPABLES` use nombres y emojis del tema.
- Adaptar `auditor/` para que muestre el tema activo.
- Adaptar `victoria.js` para que el mensaje final dependa del tema ("¡Reparaste la nave!" vs "¡Ganaste!").

### Ejemplos de conversión (referencia)

| Original | Espacio |
|----------|---------|
| 🟩 GRASS | 🌑 Suelo lunar |
| 🌳 TREE | 🛸 Nave alienígena |
| 🧱 WALL | 🔩 Panel metálico |
| 🌊 WATER | 🟪 Líquido alienígena |
| 🟨 SAND | 🟫 Arena espacial |
| 🏜️ DESIERTO | 🟥 Arena roja (Marte) |
| 🌵 CACTUS | 🦑 Criatura alienígena |
| ❄️ SNOW | ⬜ Cristal blanco |
| 🧊 ICE | 🔷 Hielo azul |
| 🌲 PINE | 🗼 Torre/antena |
| 🐅 TIGRE | 👽 Alien hostil |
| 🐓 GALLINA | 🤖 Dron pacífico |
| 🐖 CERDO | 🦎 Reptiliano neutral |
| 🏃‍♂️ PLAYER | 🧑‍🚀 Astronauta |
| 🪓 HACHA | ⚡ Sable de energía |
| ⛏️ PICO | 🔫 Taladro |
| 🕯️ LINTERNA | 💡 Lámpara |
| 🛶 BARCO | 🚀 Módulo de escape |

### Rama de trabajo

- Branch: `tema-espacio` (a mergear a `2d` cuando esté estable).
- Aún no mergeado.

**Estado:** 🧪 Funcional pero con mucho por pulir. El motor está intacto.

---

## 🎨 F20 · Sistema de sprites animados (atlas + animaciones)

**Idea:** reemplazar los emojis del jugador, mobs y objetos interactivos por **imágenes (sprites) animadas**. Un solo archivo de imagen (atlas) contiene todos los frames, indexados por posición.

### Concepto

**Atlas (imagen):** un PNG con una grilla de frames.

**Metadatos (JSON):** un archivo que dice qué celdas componen cada animación.

**Motor de animación:** un sistema que sabe qué objeto animar, en qué estado está, en qué frame va, y cuándo cambiar al siguiente.

**Render:** dibuja la celda correcta del atlas con `background-image` + `background-position`.

### Fases propuestas

| Fase | Descripción | Estado |
|:----:|-------------|:------:|
| 1 | Sprite estático (sin animación) del jugador | ⏸️ Pendiente |
| 2 | Animación de quieto + caminar | ⏸️ Pendiente |
| 3 | Animaciones de acción (talar, picar, remar) | ⏸️ Pendiente |
| 4 | Animación de objetos (árbol, piedra, cofre) | ⏸️ Pendiente |
| 5 | Animación de enemigos | ⏸️ Pendiente |

### Herramientas recomendadas

- **Piskel** (navegador, gratis).
- **Aseprite** (~$20).
- **LibreSprite** (gratis).

**Estado:** ⏸️ Anotado. Se implementará después de HP + daño real.

---

## 🎥 F21 · Migración a chunks 2D + cámara fluida · ✅ IMPLEMENTADO (base) en v2.0

**Estado:** base completa. El juego funciona con chunks 2D, cámara fluida, movimiento 360°, y todas las mecánicas principales migradas.

### Concepto general

- El **jugador queda fijo en el centro** de la pantalla.
- El **mundo se desplaza** debajo.
- El **movimiento entre tiles es fluido** (100ms por tile).
- **Mundo circular** en X e Y (tipo Pac-Man).

### Valores finales

| Aspecto | Valor |
|---------|-------|
| `ANCHO_CHUNK` | 32 |
| `ALTO_CHUNK` | 32 |
| `TAMANO_CELDA` | 24 |
| `ANCHO_VENTANA` | 32 |
| `ALTO_VENTANA` | 24 |
| `DURACION_MOVIMIENTO_MS` | 100 |
| `LIMITE_CHUNKS` | 4 (±4 en X e Y) |

### Fases de la migración

| Fase | Descripción | Estado |
|:----:|-------------|:------:|
| 0 | Prototipo aprobado | ✅ |
| 1 | Constantes nuevas | ✅ |
| 2 | Sistema de cámara aislado | ✅ |
| 3 | Chunks 2D | ✅ |
| 4 | Render de ventana + movimiento 360° | ✅ |
| 5 | Ítems y mobs en 2D | ✅ |
| 6 | Rotura y barco en coordenadas del mundo | ✅ |
| 7 | Victoria y pausa global en batalla | ✅ |
| 8 | Fronteras compartidas en 2D | ✅ Resuelto por v2.4-alpha (biomas por celda) |
| 9 | Limpieza de código muerto | ✅ (parcial) |

### Lo que falta

**Fronteras compartidas en 2D:**

- Los cortes entre chunks se veían (cambio brusco de tiles).
- **Nota (v2.4-alpha):** con biomas por celda, el problema **desapareció**. Cada celda consulta su bioma por ruido, no por chunk.

**Otras mejoras posibles:**

- Barco: si un mob bloquea la única celda de tierra, no se puede desembarcar.
- Mobs de chunks vecinos: ¿actúan cuando el jugador no los ve?

### Ubicación de trabajo

- **Branch de git:** `2d` (a mergear a `main` cuando se cierre la migración).

### Estado

✅ **Base completa.** El juego es 100% jugable con chunks 2D y cámara fluida.

---

## ⚙️ F22 · Limitar generación de equipables

**Idea:** hoy los equipables (🪓 ⛏️ 🕯️ 🛶) se generan en **todos** los chunks de su bioma (`porChunk: true`). Eso sirve para test pero no para producción.

**Preparado:** el flag `porChunk` en `EQUIPABLES` (`items.js`) ya controla ambos modos:

- `porChunk: true` → todos los chunks del bioma (modo test actual).
- `porChunk: false` → un solo chunk del bioma, elegido por semilla (modo producción).

**Falta:**

- Decidir qué objetos van en cada modo.
- Poder limitar por condiciones más finas (ej: "solo si el chunk es adyacente a ruina", "solo lejos del spawn").
- Documentar bien el flag en `items.js`.

**Estado:** ⏸️ Anotado. Se define cuando el sistema base esté estable.

---

## 🎨 F23 · Transformaciones visuales de tiles y mobs

**Idea:** aprovechar el hecho de que los tiles y mobs son **emojis** (glifos de fuente) para aplicarles transformaciones CSS sin cambiar el emoji en sí. Permite dar vida al mundo, marcar estados, orientar objetos y diferenciar entidades con muy poco código.

**Regla clave:** los emojis son caracteres, no imágenes. Algunas transformaciones son triviales (flip, rotación, escala, opacidad) y otras son imposibles (color interno, transparencia parcial).

**Nota:** gran parte de F23 fue implementada en v2.4.2-alpha como **F25 (sistema de efectos visuales)**. La rama de "sprites reales" sigue pendiente (ver F20).

### 1 · Transformaciones geométricas (CSS `transform`)

| Transformación | CSS | Utilidad |
|----------------|-----|----------|
| Flip horizontal | `scaleX(-1)` | Jugador, mobs (ya implementado) |
| Flip vertical | `scaleY(-1)` | Fuego 🔥, flechas ↑↓, hojas 🍃 |
| Rotación arbitraria | `rotate(45deg)` | Flechas a NE, NW, SE, SW |
| Rotación animada | `rotate()` + `transition` | Reloj, brújula, engranaje |
| Escala | `scale(2)` | Mobs grandes, objetos destacados |
| Espejo diagonal | `scale(-1, 1)` + `rotate()` | Efectos ópticos |

**Ejemplo:** una flecha `➡️` puede apuntar a las 8 direcciones combinando `scaleX(-1)` + `rotate(Ndeg)`.

### 2 · Tamaño en la grilla (layout, no transform)

| Cambio | Cómo | Utilidad |
|--------|------|----------|
| 1×1 normal | Actual | Mobs comunes |
| 2×2 (mob grande) | Ocupa 4 celdas, emoji con `font-size` doble | Jefe, tigre alfa, estructura |
| 3×3 (estructura) | Ídem | Árbol grande, roca, altar |
| 1×2 (alto) | Una columna, dos filas | Puerta, antorcha alta |
| 2×1 (ancho) | Dos columnas, una fila | Tronco caído, valla |

**Nota:** requiere tocar el sistema de colisiones y el render. Cambio medio.

### 3 · Color / apariencia

| Cosa | ¿Se puede? | Cómo |
|------|:----------:|------|
| Cambiar el color del emoji en sí | ❌ No | El emoji trae su color incorporado |
| Filtro de color | ✅ Parcial | `filter: hue-rotate(90deg)` (varía por SO) |
| Opacidad | ✅ Sí | `opacity: 0.5` |
| Brillo / saturación | ✅ Sí | `filter: brightness(1.5)` |
| Color de fondo de la celda | ✅ Sí | Ya implementado (color por bioma) |
| Halo / glow | ✅ Sí | `text-shadow: 0 0 6px cyan` |
| Borde de color | ✅ Sí | `border: 1px solid red` en la celda |

### 4 · Efectos visuales (CSS animations)

✅ Implementado en v2.4.2-alpha (ver F25):

- Glow (halo) permanente.
- Parpadeo.
- Vibración.
- Latido (pulse).
- Destello rojo.

### 5 · Animación de tiles (secuencia)

| Técnica | Cómo | Ejemplo |
|---------|------|---------|
| Flip alternado | `scaleX(1)` ↔ `scaleX(-1)` | Fuego, hoja |
| Secuencia de emojis | Ciclar array | 🌍🌎🌏, 🌑🌒🌓... |
| Rotación alternada | `rotate(0)` ↔ `rotate(180deg)` | ⛓️, reloj |
| Cambio de opacidad | `opacity: 1` ↔ `opacity: 0.5` | Antorcha, faro |
| Cambio de escala | `scale(1)` ↔ `scale(1.2)` | Latido, respiración |

**Probado en `pruebas/catalogo.html`** y `auditor/laboratorio-v1.html`: fichas de ejemplo con cada efecto.

### 6 · Cambios de "estado" (lógica, no CSS)

| Cambio | Ejemplo |
|--------|---------|
| Emoji por estado | Jugador: 🧍 quieto, 🏃 corriendo, 🚣 en barco |
| Emoji por orientación | Flecha: ➡️⬅️⬆️⬇️ |
| Emoji por vida | ❤️❤️❤️ → ❤️❤️🖤 → ❤️🖤🖤 |
| Emoji por bioma | 🌳 en bosque, 🌵 en desierto |
| Emoji por hora | ☀️ de día, 🌙 de noche |

### Herramientas de experimentación

| Archivo | Función |
|---------|---------|
| `pruebas/catalogo.html` | Catálogo de efectos con ejemplos prácticos. Sirve para elegir el efecto adecuado. |
| `auditor/laboratorio-v1.html` | Laboratorio libre para probar cualquier emoji con cualquier efecto (vibrar, glow, pulse, etc.). |

### Lo que NO se puede

- ❌ Cambiar el color interno de un emoji.
- ❌ Hacer transparente una parte del emoji (requiere PNG).
- ❌ Usar un emoji "con fondo transparente".

**Estado:** 🧪 Parcialmente implementado en v2.4.2-alpha (los efectos visuales básicos). La parte de "secuencias de emojis" y "mobs 2×2" sigue pendiente.

---

## 🐛 F24 · Bugs conocidos de v2.4-alpha · ✅ TODOS RESUELTOS en v2.4.1

Bugs detectados al implementar biomas por celda (v2.4-alpha). Todos fueron arreglados en v2.4.1-alpha.

### B1 · Romper un tile usa el bioma del chunk en vez de la celda · ✅ ARREGLADO

**Síntoma:** rompés una roca en el desierto y aparece hielo abajo.
**Causa:** `rotura.js` consultaba `chunk.bioma` (dominante) en vez de `obtenerBiomaDeCelda(wx, wy)`.
**Solución:** `intentarIniciarRotura` ahora usa `obtenerBiomaDeCelda(SEMILLA, wx, wy)`.
**Prioridad:** 🔥 Alta.
**Estado:** ✅ Arreglado en v2.4.1-alpha.

### B2 · Filas horizontales de pasto entre chunks · ✅ ARREGLADO

**Síntoma:** las filas en los bordes de cada chunk (y=0, y=31, y=63, etc.) quedaban con pasto por defecto.
**Causa:** `generarPantalla` solo pintaba `yMin=1` a `yMax=ALTO_CHUNK-2`. Las filas 0 y 31 quedaban sin pintar.
**Solución:** `yMin = 0`, `yMax = ALTO_CHUNK - 1`.
**Prioridad:** 🔥 Alta.
**Estado:** ✅ Arreglado en v2.4.1-alpha.

### B3 · Mobs de tierra aparecen en el agua · ✅ ARREGLADO

**Síntoma:** tigres / cerdos / alienígenas aparecían sobre agua.
**Causa:** `ia.js` seguía usando coordenadas 1D (`mob.x`, `estado.pantalla`, `estado.zona`). Nunca funcionó en 2D.
**Solución:** `ia.js` reescrito completo para 2D. Ahora `moverMob` verifica el tile destino con `tileEnMundo` y respeta `BLOQUEANTES`.
**Prioridad:** 🟡 Media.
**Estado:** ✅ Arreglado en v2.4.1-alpha.

### B4 · Atravesar un mob no dispara animación de pelea · ✅ ARREGLADO

**Síntoma:** el jugador caminaba sobre un mob no sólido y no pasaba nada.
**Causa:** mismo problema que B3. `ia.js` no funcionaba, los mobs quedaban estáticos.
**Solución:** con `ia.js` reescrito, `moverMob` verifica si el jugador está en la celda destino y dispara `iniciarBatalla` si corresponde.
**Prioridad:** 🟡 Media.
**Estado:** ✅ Arreglado en v2.4.1-alpha.

### B5 · Romper roca en agua genera arena · ✅ ARREGLADO

**Síntoma:** rompés una roca en el agua y aparece arena (SAND) en vez de agua.
**Causa:** mismo problema que B1.
**Solución:** mismo fix. `intentarIniciarRotura` usa `obtenerBiomaDeCelda(wx, wy)`.
**Prioridad:** 🔥 Alta.
**Estado:** ✅ Arreglado en v2.4.1-alpha.

### Notas adicionales de v2.4.1-alpha

- **`js/main.js`:** se agregó `iniciarTicks()` después de `inicializarJugador()`. Los ticks de IA nunca se estaban arrancando.
- **`js/systems/cheats.js` (temporal):** botón 🎁 arriba a la derecha para cargar/limpiar equipables en test. **Borrar antes de producción.**

---

## ✨ F25 · Sistema de efectos visuales genéricos · 🧪 PARCIAL en v2.4.2-alpha

**Idea:** unificar todos los efectos visuales en un sistema **desacoplado de las entidades**. Cualquier tile, mob, ítem o entidad puede "recibir" un efecto (vibrar, parpadear, glow, pulse, etc.) sin código específico por entidad.

**Motivación:** antes de v2.4.2-alpha, agregar un efecto a una nueva entidad implicaba tocar `render.js`. Con muchos mobs, tiles y objetos interactivos futuros, eso no escala.

### Estado actual (v2.4.2-alpha)

**`js/systems/efectos.js` (NUEVO)**

- `aplicarEfecto(wx, wy, clase, duracionMs?)` — temporal o permanente.
- `quitarEfecto(wx, wy, clase)` — quitar uno puntual.
- `quitarTodosLosEfectos(wx, wy)` — quitar todos de una celda.
- `obtenerEfectosDe(wx, wy)` — devuelve las clases activas.
- `limpiarEfectos()` — limpiar todo (al reiniciar mundo).
- Los efectos viven en `Map<"wx,wy", [{ clase, hasta }]>`, indexados por coordenadas del mundo.

**CSS (`css/estilo.css`)**

- Keyframes: `vibrar-random` (orgánica, no solo izq-der), `parpadeo`, `destello-rojo`, `pulse`.
- Clases: `.efecto-ataque`, `.efecto-golpe`, `.efecto-golpe-loop`, `.efecto-recoger`, `.efecto-danio`, `.efecto-glow`, `.efecto-pulse`.

**`js/ui/render.js`**

- `actualizarEfectosEnGrid()` se ejecuta **cada frame** (no solo cuando cambia la esquina).
- Solo actualiza `className` si el valor cambió. Así las animaciones CSS no se reinician.
- Se mantiene `dibujarCeldaEnGrid`, `llenarGrid`, HUD y orientación del jugador.

**`js/systems/rotura.js`**

- Al iniciar la rotura: `aplicarEfecto(wx, wy, "efecto-golpe-loop")` (sin duración, bucle infinito).
- Al terminar la barra o al cancelar: `quitarEfecto(...)` exactamente en el mismo instante en que se cambia el tile.
- La animación, la barra y el cambio de tile terminan **exactamente juntos**.

**`index.html`**

- Agregado `<script src="js/systems/efectos.js"></script>` justo antes de `render.js`.

### Efectos disponibles

| Clase | Efecto | Cuándo usarla |
|-------|--------|---------------|
| `.efecto-ataque` | Vibrar + parpadear + destello rojo (~0.5s) | Cuando un ente recibe un golpe (mob, jugador) |
| `.efecto-golpe` | Vibrar + parpadear lentos (~1s) | Cuando se pica/tala algo (una sola vez) |
| `.efecto-golpe-loop` | Vibrar + parpadear **infinitos** | Mientras dura la rotura de un tile |
| `.efecto-recoger` | Parpadeo rápido (0.3s) | Al recoger un ítem |
| `.efecto-danio` | Vibrar + parpadear + destello rojo (~0.5s) | Cuando el jugador recibe daño |
| `.efecto-glow` | Halo celeste permanente | Ítem importante, llave |
| `.efecto-pulse` | Pulsación permanente | Portal, orbe, objeto "vivo" |

### Herramientas de experimentación

| Archivo | Función |
|---------|---------|
| `pruebas/catalogo.html` | Catálogo de efectos con ejemplos prácticos. Sirve para elegir el adecuado. |
| `auditor/laboratorio-v1.html` | Laboratorio libre para probar cualquier emoji con cualquier efecto. |

### Falta

- Aplicar `efecto-ataque` al iniciar batalla (hoy la batalla es un overlay sin feedback visual del mob).
- Aplicar `efecto-danio` al jugador cuando HP esté implementado.
- Aplicar `efecto-recoger` al recoger ítems y equipables.
- Reemplazar el glow hardcodeado de la llave por `aplicarEfecto(..., "efecto-glow")`.
- Aplicar `efecto-ataque` o `efecto-danio` a los mobs cuando se implemente el combate real.
- Sistema de "secuencias de emojis" (ciclar emojis como animación) — pendiente (era parte de F23).

### ⚠️ Recordatorio

`js/systems/cheats.js` sigue siendo **temporal**. Borrar antes de producción.

**Estado:** 🧪 Funcional. Solo la rotura lo usa hoy. Los demás hooks se agregarán a medida que se implementen esas features (HP, combate, recoger ítems).

---

**Fin del BACKLOG**