# 🔮 Backlog · Game_RPG

Ideas futuras anotadas. **No están priorizadas ni implementadas.** Se anotan para no perderlas.

Para el estado actual del proyecto, ver [README.md](README.md).

**Contenido actual:**

- F1 · Ciclo día-noche (con sistema de luz)
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
- F12 · Objetos equipables de mejor nivel (+ linterna por niveles)
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
- F26 · Sistema de mobs especiales (categoría 2)
- F27 · Sistema de mobs bosses (categoría 3)

---

## 🌗 F1 · Ciclo día-noche (con sistema de luz)

**Idea:** el mundo pasa por fases de día, noche y transiciones. De noche la visibilidad se reduce drásticamente y aparecen mobs peligrosos. Solo los tiles que emiten luz y un radio alrededor del jugador quedan visibles.

### Fases del ciclo

| Fase | Duración (test) | Comportamiento |
|------|:---------------:|----------------|
| **Día** | 20s | Todo visible. Mobs normales activos. |
| **Transición día→noche** | 5s | Oscurecimiento gradual. Aviso: *"Se hace de noche. Es peligroso."* |
| **Noche** | 15s | Oscuridad casi total. Solo luces + radio del jugador. Mobs nocturnos/especiales. |
| **Transición noche→día** | 5s | Aclarado gradual. |

**Regla de tiempos:** `X (día) > Z (noche) > Y (transición)`. En test: `20 > 15 > 5`. En versión final: minutos en lugar de segundos.

**Pausable:** el ciclo se detiene cuando hay batalla de boss, menú abierto, o cualquier estado que pause el juego (`estado.pausado`).

### Visibilidad

**De día:**
- Todos los tiles visibles con sus colores normales.

**De noche:**
- **Oscuridad global:** todos los tiles se oscurecen (bajan saturación/brillo hasta casi negro).
- **Excepciones:**
  1. **Tiles que emiten luz** (fogatas, faroles, máquinas con luces): quedan visibles con su color normal.
  2. **Radio de visión del jugador:** 5 celdas alrededor del jugador quedan visibles (aunque no haya luz). Centro en el jugador.

**Durante la transición:** el oscurecimiento es **gradual** (interpolar entre 1.0 y 0.0 de brillo).

### Avisos

- Al entrar a la noche: cartel *"🌙 Se hace de noche. Es peligroso."*
- Al entrar al día: cartel *"☀️ Amanece."* (opcional, para dar feedback)

### Linterna (equipable)

- La 🕯️ Linterna ilumina un radio alrededor del jugador mientras esté equipada.
- **Radio según nivel** (ver F12):
  - Vela: 6×6
  - Linterna de mano: 10×10
  - Linterna militar: 13×13
- Se combina con el radio de visión base del jugador (5×5): el mayor gana.

### Mobs de noche

- **Mobs normales (categoría 1):** desaparecen al entrar la noche. Vuelven al amanecer.
- **Mobs especiales nocturnos (categoría 2):** aparecen solo de noche. Más rápidos, más peligrosos, con mayor daño y drops únicos. Ver F26.
- **Bosses (categoría 3):** independiente del ciclo. Ver F27.

### Implementación técnica (futura)

- Nueva variable global `estado.ciclo = { fase, tiempoRestante }`.
- En `render.js`: aplicar `filter: brightness()` según fase + radio de visión + tiles de luz.
- Tiles nuevos: propiedad `emiteLuz: true` y radio.
- Nueva `js/systems/ciclo.js` (o dentro de `render.js`).
- Pausa: `estado.pausado` detiene el avance del ciclo.

### Preguntas pendientes

- ¿Los efectos visuales (vibrar, glow) se ven de noche? ¿O quedan ocultos por la oscuridad?
- ¿Los mobs especiales nocturnos reaparecen cada noche o solo aparecen una vez?
- ¿El ciclo afecta el gameplay (regeneración de mobs normales, eventos)?
- ¿Los tiles de luz consumen algo o son estáticos?

### Herramientas de experimentación

Hoy no hay prueba. Cuando se implemente, se puede empezar con un HTML de prueba (`pruebas/ciclo.html`) antes de meter al motor.

**Estado:** ⏸️ Anotado. Depende de HP + daño para que "peligroso" tenga sentido.

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
| 4 | Iluminación / visión (vinculada a F1) |
| 5 | Clima / ambiental (lluvia, nieve, niebla) |
| 6 | Efectos especiales (visión infrarroja, detección mágica) |

**Ventajas:** encender/apagar capas sin reescribir código. Cada capa tiene su lógica propia.

**Preguntas pendientes:** ¿cómo se renderiza? ¿canvas múltiple? ¿puede una capa leer otra? ¿impacto en performance?

**Relación con F1:** el sistema de iluminación (día-noche) podría ir en la capa 4.

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

**Relación con F26 y F27:** esta es la base técnica para spawnear mobs especiales y bosses.

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

**Relación con F26:** los mobs especiales con quests requieren interacción por click (o algún mecanismo similar).

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

## ⚙️ F12 · Objetos equipables de mejor nivel (+ linterna por niveles)

**Idea:** cada equipable tiene versiones de mejor nivel. Reducen tiempos de rotura, aumentan radio de luz, etc.

### Hachas / Picos

| Objeto | Nivel | Velocidad (multiplicador) | Duración efectiva |
|--------|:-----:|:-------------------------:|:-----------------:|
| Hacha de madera | 1 | 1.0 | 3.0s (base) |
| Hacha de hierro | 2 | 0.6 | 1.8s |
| Hacha de diamante | 3 | 0.3 | 0.9s |
| Pico de madera | 1 | 1.0 | 3.0s (base) |
| Pico de hierro | 2 | 0.6 | 1.8s |
| Pico de diamante | 3 | 0.3 | 0.9s |

**Campo nuevo en `EQUIPABLES` de `items.js`:**
```js
{ tipo: HACHA_HIERRO, bioma: "ruina", porChunk: false, nivel: 2, velocidad: 0.6 }
```

`rotura.js` multiplica `duracionMs * velocidad`.

### Linteras (con radio de luz)

**Vinculado a F1 (ciclo día-noche).** La linterna ilumina un radio mientras está equipada:

| Linterna | Nivel | Radio de luz | Cuándo aparece |
|----------|:-----:|:------------:|----------------|
| Vela | 1 | 6×6 | Spawn inicial (base) |
| Linterna de mano | 2 | 10×10 | Chunk de costa (o drop) |
| Linterna militar | 3 | 13×13 | Drop de mob especial |
| Farol mágico | 4 | 16×16 | Drop de boss |

**Se combina con el radio de visión base del jugador (5×5):** el mayor gana.

### Dónde aparecen los mejorados

| Modo | Cómo |
|------|------|
| Spawn natural | `porChunk: true` en biomas específicos (ruina, castillo) |
| Único por mundo | `porChunk: false` (determinista por semilla) |
| Drop de mob | Campo `dropDe: "id_mob"` (vinculado a F26 y F27) |

### Pendiente

- Definir qué nivel aparece dónde.
- Definir si los mejorados son recogibles al pisar o solo por drop.
- Balance: ¿cuánto cuesta cada nivel? ¿qué mobs lo dropean?
- Verificar que `rotura.js` lea `velocidad` sin romper la compatibilidad actual.

**Estado:** ⏸️ Anotado. Futuro medio. Se empieza por `velocidad` (simple) y después se agrega la linterna con radio.

---

## 📦 F13 · Drops alternativos de objetos

**Idea:** los objetos equipables pueden obtenerse de formas alternativas además del spawn en el mundo.

**Fuentes propuestas:**

- Al matar ciertos mobs.
- Al romper vehículos/piedras específicas.
- Al abrir cofres.
- Al completar misiones.

**Relación con F26 y F27:** los drops únicos de mobs especiales y bosses se implementan en esta fase.

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

**Relación con F26 y F27:** los mobs especiales y bosses suelen spawnear en estructuras (castillo, cueva, ruina). F15 es requisito para eso.

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
- **Nota (v2.4-alpha):** con biomas por celda, el problema **desapareció**.

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

**Relación con F12:** al agregar niveles, hay que decidir qué nivel usa `porChunk: true` y cuál `false`.

**Falta:**

- Decidir qué objetos van en cada modo.
- Poder limitar por condiciones más finas (ej: "solo si el chunk es adyacente a ruina", "solo lejos del spawn").
- Documentar bien el flag en `items.js`.

**Estado:** ⏸️ Anotado. Se define cuando el sistema base esté estable.

---

## 🎨 F23 · Transformaciones visuales de tiles y mobs

**Idea:** aprovechar el hecho de que los tiles y mobs son **emojis** (glifos de fuente) para aplicarles transformaciones CSS sin cambiar el emoji en sí.

**Nota:** gran parte de F23 fue implementada en v2.4.2-alpha como **F25 (sistema de efectos visuales)**. La rama de "sprites reales" sigue pendiente (ver F20).

### Lo que sigue pendiente

- **Mobs 2×2** (sistema de colisiones multi-celda). Cambio medio-alto.
- **Secuencias de emojis** (ciclar emojis como animación). Ejemplo: 🌍🌎🌏 girando, o 🌑🌒🌓🌔🌕🌖🌗🌘 (fases lunares).
- **Rotación animada continua** (portal, engranaje).
- **Flip vertical** para fuego, antorchas, flechas ↑↓.

### Herramientas de experimentación

| Archivo | Función |
|---------|---------|
| `pruebas/catalogo.html` | Catálogo de efectos con ejemplos prácticos. |
| `auditor/laboratorio-v1.html` | Laboratorio libre para probar cualquier emoji con cualquier efecto. |

**Estado:** 🧪 Parcialmente implementado en v2.4.2-alpha (efectos básicos). Lo que queda (mobs 2×2, secuencias) sigue pendiente.

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

## 🌟 F26 · Sistema de mobs especiales (categoría 2)

**Idea:** separar los mobs en 3 categorías. Esta es la **categoría 2**: mobs especiales que dropean objetos raros, son parte de misiones, o tienen condiciones especiales de aparición.

### Categorías de mobs

| Categoría | Nombre | Spawn | Drops | Misiones |
|:---------:|--------|-------|-------|:--------:|
| 1 | Normales | Por chunk + bioma | Comunes (🍎, pluma, carne) | No |
| **2** | **Especiales** | **Único por mundo, por estructura, o condicional** | **Únicos + comunes** | **Sí** |
| 3 | Bosses | Único por mundo, en estructura | Legendarios | Sí (implícito) |

### Estructura de datos propuesta

Array nuevo `MOBS_ESPECIALES` (en archivo separado, ej: `js/entities/mobs-especiales.js`):

```js
{
  id: "lobo_plateado",
  categoria: "especial",
  nombre: "Lobo plateado",
  emoji: "🐺",
  hp: 30, ataque: 8, defensa: 3,
  
  spawn: {
    porMapa: 1,                    // 1 por mundo
    biomas: { bosque: true },
    forzarEnEstructura: "cueva",   // solo en cuevas (depende de F15)
    nivelMinimoJugador: 3,         // solo si ya exploró
    condicion: "noche",            // solo de noche (depende de F1)
  },
  
  mision: {                        // ← sistema de misiones (futuro)
    questId: "matar_lobo_5",
    objetivo: "matar",
    cantidad: 5,
    recompensa: { item: "piel_plateada", cantidad: 5, xp: 100 },
  },
  
  dropsUnicos: [                   // ← drops garantizados
    { item: "colmillo_plateado", probabilidad: 1.0, cantidad: 1 },
  ],
  
  loot: { dropea: true, probabilidad: 0.8, objetos: [...], xp: 50 },
}
```

### Campos nuevos explicados

| Campo | Qué permite |
|-------|-------------|
| `categoria` | Distinguir especiales de normales y bosses |
| `spawn.condicion` | Spawnear solo de noche, solo de día, solo si llueve, etc. |
| `spawn.forzarEnEstructura` | Solo aparece en cuevas/castillos/ruinas (ya previsto en F5) |
| `mision.questId` | Atar el mob a una quest |
| `mision.objetivo` | "matar", "recoger", "escoltar", etc. |
| `mision.cantidad` | Cuántos matar/recoger |
| `mision.recompensa` | Qué se obtiene al completar |
| `dropsUnicos` | Drops garantizados (no probabilísticos) |

### Requisitos técnicos

| Requisito | Estado | Depende de |
|-----------|:------:|------------|
| Spawn condicional (noche, nivel) | ⏸️ | F1 (día-noche) |
| Spawn por estructura | ⏸️ | F15 (biomas forzados) |
| Drops únicos garantizados | ⏸️ | Extender `loot` en `enemigos.js` |
| Sistema de misiones | ⏸️ | Archivo nuevo `js/systems/misiones.js` |
| Persistencia de progreso | ⏸️ | F8 fase 3 (localStorage) |

### Sistema de misiones (futuro)

Necesita un archivo nuevo `js/systems/misiones.js` que rastree:

- Quest activas (`estado.misiones = { matar_lobo_5: { progreso: 0, meta: 5 } }`).
- Cómo progresa cada quest (matar, recoger, etc.).
- Recompensas al completar.
- UI para mostrar quests activas (HUD).

### Ejemplos de mobs especiales (ideas)

| Mob | Emoji | Condición | Drop único | Misión |
|-----|:-----:|-----------|------------|--------|
| Lobo plateado | 🐺 | Noche, bosque | Colmillo plateado | Matar 5 |
| Fantasma | 👻 | Noche, ruina | Esencia espectral | Matar 3 |
| Guardián de cueva | 🦇 | Cueva | Llave de cueva | Escoltar |
| Sapo dorado | 🐸 | Día, río | Moneda de oro | Recoger 10 |

**Estado:** ⏸️ Anotado. Depende de F1, F15, y sistema de misiones.

---

## 👑 F27 · Sistema de mobs bosses (categoría 3)

**Idea:** mobs muy poderosos, únicos por mundo, con **pelea por fases**, efectos al jugador, inmunidades, y drops legendarios.

### Estructura de datos propuesta

Array nuevo `MOBS_BOSS` (en `js/entities/mobs-boss.js`):

```js
{
  id: "rey_oscuro",
  categoria: "boss",
  nombre: "Rey Oscuro",
  emoji: "👹",
  hp: 200, ataque: 20, defensa: 10,
  
  spawn: {
    porMapa: 1,
    forzarEnEstructura: "castillo",
    nivelMinimoJugador: 10,
  },
  
  fases: [                         // ← pelea por fases según HP restante
    { 
      hpMin: 150,                  // HP mínimo para entrar a esta fase
      ataques: ["basico", "embestida"],
      efectosAlJugador: ["lentitud"],
    },
    { 
      hpMin: 80, 
      ataques: ["embestida", "fuego"],
      efectosAlJugador: ["quemadura"],
      invocaEsbirros: ["esqueleto"],   // ← invoca mobs menores
    },
    { 
      hpMin: 0, 
      ataques: ["fuego", "rayo"],
      efectosAlJugador: ["veneno", "silencio"],
      furia: true,                     // ← modo furia: más rápido y fuerte
    },
  ],
  
  inmunidades: ["veneno"],        // ← no le afecta cierto tipo de daño
  resistencias: { fuego: 0.5 },   // ← recibe 50% del daño de fuego
  
  loot: {
    dropea: true,
    probabilidad: 1.0,
    objetos: [
      { item: "espada_legendaria", probabilidad: 1.0 },
      { item: "armadura_rey", probabilidad: 0.5 },
    ],
    xp: 500,
  },
}
```

### Campos nuevos explicados

| Campo | Qué permite |
|-------|-------------|
| `fases` | Pelea por etapas según HP restante |
| `fases[].hpMin` | HP mínimo del jugador para entrar a esa fase |
| `fases[].ataques` | Ataques disponibles en esa fase |
| `fases[].efectosAlJugador` | Efectos negativos (lentitud, veneno, quemadura, silencio) |
| `fases[].invocaEsbirros` | Invocar mobs menores durante la pelea |
| `fases[].furia` | Enrage en última fase (más rápido, más daño) |
| `inmunidades` | No recibe cierto tipo de daño |
| `resistencias` | Recibe menos daño de ciertos tipos |

### Requisitos técnicos

| Requisito | Estado | Depende de |
|-----------|:------:|------------|
| Combate real (HP, daño) | ⏸️ | Tarea urgente del roadmap |
| Efectos negativos al jugador | ⏸️ | Sistema de estados (nuevo) |
| Fases según HP | ⏸️ | Lógica en combate |
| Invocación de esbirros | ⏸️ | Spawn dinámico en combate |
| Inmunidades / resistencias | ⏸️ | Sistema de tipos de daño |
| Spawn por estructura | ⏸️ | F15 (biomas forzados) |

### Sistema de combate (futuro)

Requiere `js/systems/combate.js` con:

- HP del jugador y del mob.
- Turnos de ataque.
- Efectos de estado (lentitud, veneno, quemadura, silencio).
- Tipos de daño (fuego, veneno, físico, mágico).
- Lógica de fases.

**Nota:** el módulo de combate por reflejos (MARCO 11 del README) es **independiente** de este sistema. El combate por reflejos es la mecánica de timing. Este sistema de bosses es la lógica de stats + fases + estados.

### Ejemplos de bosses (ideas)

| Boss | Emoji | Estructura | Fases | Drops |
|------|:-----:|------------|:-----:|-------|
| Rey Oscuro | 👹 | Castillo | 3 | Espada legendaria |
| Dragón Anciano | 🐉 | Montaña | 3 | Escama de dragón |
| Dios del Mar | 🌊 | Océano profundo | 2 | Tridente |
| Esqueleto Gigante | 💀 | Ruina | 4 | Hueso eterno |

**Estado:** ⏸️ Anotado. Depende de combate real + F15 + sistema de estados. Fase tardía.

---

**Fin del BACKLOG**