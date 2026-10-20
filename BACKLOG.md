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
- F12 · Objetos equipables de mejor nivel (+ linterna + stats)
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
- F28 · Sistema de combate con timing · 🧪 FASES 1-6 IMPLEMENTADAS en v2.5-alpha
- F28.1 · Bugs conocidos del combate con timing · ⏸️ PENDIENTE
- F29 · Escalado dinámico de dificultad del timing
- F30 · Sistema de niveles del jugador

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

**De día:** todos los tiles visibles con sus colores normales.

**De noche:**
- **Oscuridad global:** todos los tiles se oscurecen hasta casi negro.
- **Excepciones:**
  1. **Tiles que emiten luz** (fogatas, faroles, máquinas con luces): quedan visibles.
  2. **Radio de visión del jugador:** 5 celdas alrededor del jugador quedan visibles.

**Transición:** interpolación gradual de brillo entre 1.0 y 0.0.

### Avisos

- Al entrar a la noche: cartel *"🌙 Se hace de noche. Es peligroso."*
- Al entrar al día: cartel *"☀️ Amanece."* (opcional).

### Linterna (equipable)

- La 🕯️ Linterna ilumina un radio alrededor del jugador mientras esté equipada.
- **Radio según nivel** (ver F12): vela 6×6, mano 10×10, militar 13×13, farol 16×16.
- Se combina con el radio base del jugador (5×5): el mayor gana.

### Mobs de noche

- **Mobs normales (cat. 1):** desaparecen al entrar la noche. Vuelven al amanecer.
- **Mobs especiales nocturnos (cat. 2):** aparecen solo de noche. Ver F26.
- **Bosses (cat. 3):** independiente del ciclo. Ver F27.

### Implementación técnica (futura)

- Nueva `estado.ciclo = { fase, tiempoRestante }`.
- En `render.js`: `filter: brightness()` según fase + radio + tiles de luz.
- Tiles nuevos: propiedad `emiteLuz: true` y radio.
- Nueva `js/systems/ciclo.js`.

### Preguntas pendientes

- ¿Los efectos visuales (vibrar, glow) se ven de noche o quedan ocultos?
- ¿Los mobs especiales nocturnos reaparecen cada noche?
- ¿Los tiles de luz consumen algo?

**Estado:** ⏸️ Anotado. Depende de F28 (combate) para que "peligroso" tenga sentido.

---

## 🚶 F2 · Movimiento amortiguado entre celdas (Modelo 2 · Pokémon) · ✅ IMPLEMENTADO en v2.0

**Idea:** el jugador se mueve **casilla a casilla**, pero con una **animación visual suave** entre una y la siguiente.

**Diferencia con Modelo 1 (viejo):**

| Modelo | Comportamiento |
|--------|----------------|
| **1 · Viejo** | El jugador salta de casilla en casilla **instantáneamente** |
| **2 · Pokémon** | El jugador se **desliza** de casilla a casilla en ~120-150ms |
| **3 · Zelda** | El jugador se mueve libremente por píxeles |

**Estado:** ✅ Implementado en v2.0 (`DURACION_MOVIMIENTO_MS = 100`).

**Extensión (v2.3-alpha):** animación de "correr" alternando 2 emojis cada 150ms. Orientación según dirección.

---

## 🗂️ F3 · Sistema de capas del mundo

**Idea:** separar el mundo en **capas independientes**.

| Capa | Contenido |
|:----:|-----------|
| 1 | Terreno base |
| 2 | Objetos estáticos |
| 3 | Entidades móviles |
| 4 | Iluminación / visión (vinculada a F1) |
| 5 | Clima / ambiental |
| 6 | Efectos especiales |

**Relación con F1:** el sistema de iluminación podría ir en la capa 4.

**Estado:** ⏸️ Anotado. Pendiente para después de F28.

---

## 🎲 F4 · Semillas independientes por sistema · ✅ IMPLEMENTADO en v1.3

| Sistema | Semilla | ¿Editable? |
|---------|---------|:----------:|
| Mundo | `SEMILLA` | ✅ Sí |
| Mobs | `SEMILLA_MOBS` | ⏸️ Automática |
| Objetos | `SEMILLA_OBJETOS` | ⏸️ Ligada a `SEMILLA` |

**Pendiente futuro:** permitir que `SEMILLA_MOBS` sea editable.

---

## 📌 F5 · Spawn forzado por bioma o estructura

**Idea:** forzar la aparición de un mob en un lugar específico.

**Ejemplos:** 🐉 dragón en ruinas una vez por mundo, 🐟 pez en agua de noche, 👻 fantasma en castillo.

**Campos ya definidos:** `spawn.forzarEnEstructura`, `spawn.tipoAparicion`, `spawn.porMapa`.

**Relación con F26 y F27:** base técnica para mobs especiales y bosses.

**Estado:** ⏸️ Anotado.

---

## 🧭 F6 · Pathfinding con obstáculos (IA avanzada)

**Idea:** los mobs actualmente se mueven en **línea recta**. Si hay obstáculo, se quedan quietos.

**Mejora:** que puedan **rodear** obstáculos (A*).

**Aplica a:** persecución (tigre) y huida (gallina). No aplica a deambulación.

**Estado:** ⏸️ Anotado.

---

## 🚶 F7 · Deambulación más realista

**Idea:** los mobs deambulan **totalmente al azar** cada 2 ticks. Se ve "zigzagueante".

**Mejoras:**
- **Momentum:** preferir seguir la misma dirección.
- **Puntos de interés:** 1-3 puntos y rotar entre ellos.
- **Descansos:** pausas de 2-4 ticks.
- **Zonas preferidas.**

**Estado:** ⏸️ Anotado.

---

## 🎒 F8 · Objetos equipables y modificar el mundo · 🧪 FASES 1-2 IMPLEMENTADAS

**Idea:** equipar ítems + modificar mundo, con persistencia.

**Modelo de persistencia:** deltas.

```
mundo = función(semilla, chunk) + deltas
```

**Fases propuestas:**

1. Objetos equipables (slots + stats). ✅ v1.7
2. Modificar mundo en memoria (picar/talar). ✅ v2.0
3. Persistencia con deltas (localStorage). ⏸️
4. Inventario visual completo (ventana con todo pausado). ⏸️

**Inventario visual (fase 4):**
- Ventana nueva que se abre con tecla (ej: I o Tab).
- Todo el juego se pausa (`estado.pausado = true`).
- Muestra todos los ítems recolectados con íconos y cantidades.
- Cerrar con la misma tecla o Esc.

**Estado:** Fases 1-2 completadas. Fases 3-4 pendientes.

---

## 🖱️ F9 · Sistema de mouse / interacción con click · 🧪 PARCIAL

**Idea:** usar el mouse para interactuar con entidades.

| Objetivo | Acción al hacer click |
|----------|----------------------|
| Mob hostil | Atacar |
| Mob neutral | Interactuar |
| NPC | Hablar |
| Cofre | Abrir |
| Cueva | Ingresar |
| Ítem | Recoger |
| Tile rompible | Romper |

**Estado:** 🧪 Parcial en v2.0 (romper, barco, desembarcar).

**Pendiente:** NPCs, cofres, cuevas.

---

## 🏖️ F10 · Bioma "playa" como bioma separado

**Idea:** "playa" NO es bioma, es conjunto de tiles dentro de "costa".

**Propuesta:** separar "playa" como bioma propio.

**Estado:** ⏸️ Anotado.

---

## 🎒 F11 · Fases de objetos equipables · ✅ IMPLEMENTADO en v1.7

**Estado:** completo.

**Referencia:**
- `ROTURA_POR_TILE` en `tiles.js`.
- `tileBase` en `biomas.js`.

---

## ⚙️ F12 · Objetos equipables de mejor nivel (+ linterna + stats)

**Idea:** cada equipable tiene versiones de mejor nivel. También hay equipables que modifican stats del jugador.

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

### Equipables que modifican stats del jugador

Además de los equipables de herramienta (hacha, pico, linterna, barco), hay **equipables que modifican las stats del personaje**. Ver F28 para las stats base (`hp`, `hpMax`, `ataque`, `defensa`, `velocidad`).

| Slot | Objeto | Efecto | Notas |
|------|--------|--------|-------|
| Pies | Botas | +1 velocidad | Desplazamiento más rápido |
| Pies | Bicicleta | +3 velocidad | Item desbloqueable |
| Cabeza | Casco de hierro | +1 defensa | |
| Torso | Armadura | +2 defensa | |
| Cabeza | Amuleto | +5 HP máximo | |

**Velocidad del jugador:**
- Por defecto es **constante** (100ms por celda, `DURACION_MOVIMIENTO_MS`).
- Solo equipables como bicicleta o botas la reducen (menos ms = más rápido).
- Fórmula: `duracionEfectiva = DURACION_MOVIMIENTO_MS / (1 + bonusVelocidad)`.

**Reglas de aplicación:**
- Los modificadores son **aditivos** (se suman).
- Hay un **máximo** por stat (para evitar valores rotos). Ej: `velocidad` máximo +5.
- Al quitarse el equipable, la stat vuelve al valor base + bonificaciones restantes.

**Pendiente definir:**
- ¿Cuántos slots tiene el jugador? (cabeza, torso, piernas, pies, manos, accesorio)
- ¿Los equipables se dropean de mobs, se craftean o se encuentran en el mundo?
- ¿Hay equipables que modifican HP máximo, o solo ataque/defensa/velocidad?
- ¿Cómo se visualiza el cambio de stats en el HUD? (¿números? ¿íconos?)
- ¿Cómo interactúa con la barra de HP cuando cambia `hpMax`?

**Requiere:** F28 (stats base ya existen).

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

**Estado:** completado. Ver `js/world/biomas.js`.

- 7 biomas definidos como datos.
- Cada bioma tiene: `nombre`, `emoji`, `tileBase`, `vecinos`, `tiles`.
- `obtenerBiomaDeChunk()` decide por hash determinista.

**Biomas actuales:** pradera, bosque, costa, ruina, oceano, desierto, nieve.

---

## 🏙️ F15 · Biomas forzados + chunks de transición

**Idea:** segunda pasada que inserta biomas forzados (ciudades, puertos, islas, ruinas temáticas).

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

**Relación con F26 y F27:** prerequisito para spawnear mobs especiales y bosses en estructuras.

**Estado:** ⏸️ Planificado. Después de F28.

---

## 🏖️ F16 · Rediseño del bioma "costa" · ✅ IMPLEMENTADO en v1.7.1

**Solución:** forma de franja.
- Agua en un lateral (~1/3), arena en el medio (~1/3), pasto en el otro (~1/3).
- Bordes irregulares.
- `forma: "franja"` en `biomas.js`.
- `pintarCosta()` en `mundo.js`.

**Estado:** ✅ Completado.

---

## 🌊 F17 · Sistema de "biomas con forma"

**Idea:** algunos biomas no se generan con probabilidad uniforme por celda. Tienen **forma**.

**Formas previstas:**
- **Franja:** agua en un lateral — ✅ implementado.
- **Lago:** masa circular en el centro.
- **Río:** franja atravesando el chunk.
- **Isla:** tierra rodeada de agua.
- **Montaña:** elevación con cordillera.

**Estado:** ⏸️ Planificado. Extensible a motor genérico basado en el campo `forma`.

---

## 🛶 F18 · Barco (atravesar agua) · ✅ IMPLEMENTADO en v2.0

### Objeto: 🛶 (Canoa)

- **Aparece:** en cada chunk de costa, en tierra, pegado a agua.
- **Recolección:** al pisarlo.
- **Slot:** slot de equipados.

### Uso

1. Click sobre agua adyacente → barra (5s) → jugador se sube (🚣 / 🛸).
2. Mientras navega, solo se mueve sobre agua.
3. Click sobre tierra adyacente → barra (2s) → se baja.
4. Puede romper tiles desde el barco.

**Estado:** ✅ Completado en v2.0. Animación "en barco" en v2.3-alpha.

---

## 🌌 F19 · Tema "espacio" (nueva piel) · 🧪 PARCIAL en v2.3-alpha

**Infraestructura completa:**
- `js/core/temas/tema-tierra.js` / `tema-espacio.js`.
- `TEMA_ACTIVO` en `config.js`.
- Wrappers en `tiles.js`, `biomas.js`, `mobs.js`.

**Tema espacio funcional:**
- 25 iconos espaciales, 7 biomas, 3 mobs.
- Botón de cambio en UI, persistencia en `localStorage`.

**Falta:**
- Pulir emojis y nombres (🪐 como TALLGRASS, 🦎 como CERDO, 🏍️/🏎️ como correr).
- Más biomas específicos de espacio.
- Mobs nuevos (jefe final, drones hostiles).
- Ítems nuevos.
- Narrativa.
- Adaptar `items.js`, `auditor/`, `victoria.js`.

### Ejemplos de conversión

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

**Estado:** 🧪 Funcional con mucho por pulir. Motor intacto.

---

## 🎨 F20 · Sistema de sprites animados (atlas + animaciones)

**Idea:** reemplazar emojis por **imágenes (sprites) animadas**.

### Concepto

**Atlas (PNG):** grilla de frames.
**Metadatos (JSON):** qué celdas componen cada animación.
**Motor:** sabe qué objeto animar, en qué estado, en qué frame, cuándo cambiar.
**Render:** `background-image` + `background-position`.

### Fases propuestas

| Fase | Descripción | Estado |
|:----:|-------------|:------:|
| 1 | Sprite estático del jugador | ⏸️ Pendiente |
| 2 | Animación quieto + caminar | ⏸️ Pendiente |
| 3 | Animaciones de acción (talar, picar, remar) | ⏸️ Pendiente |
| 4 | Animación de objetos (árbol, piedra, cofre) | ⏸️ Pendiente |
| 5 | Animación de enemigos | ⏸️ Pendiente |

**Herramientas:** Piskel (gratis), Aseprite (~$20), LibreSprite.

**Estado:** ⏸️ Anotado. Después de F28.

---

## 🎥 F21 · Migración a chunks 2D + cámara fluida · ✅ IMPLEMENTADO (base) en v2.0

**Valores finales:**

| Aspecto | Valor |
|---------|-------|
| `ANCHO_CHUNK` | 32 |
| `ALTO_CHUNK` | 32 |
| `TAMANO_CELDA` | 24 |
| `ANCHO_VENTANA` | 32 |
| `ALTO_VENTANA` | 24 |
| `DURACION_MOVIMIENTO_MS` | 100 |
| `LIMITE_CHUNKS` | 4 |

**Todas las fases ✅ completadas** (fronteras resueltas por v2.4-alpha).

**Otras mejoras posibles:**
- Barco: mob bloqueando la única celda de tierra.
- Mobs de chunks vecinos: ¿actúan cuando el jugador no los ve?

**Estado:** ✅ Base completa.

---

## ⚙️ F22 · Limitar generación de equipables

**Idea:** hoy los equipables se generan en **todos** los chunks de su bioma (`porChunk: true`).

**Preparado:** `porChunk: false` → un solo chunk por semilla.

**Relación con F12:** al agregar niveles, decidir qué nivel usa `porChunk: true`.

**Falta:**
- Decidir qué objetos van en cada modo.
- Poder limitar por condiciones más finas.
- Documentar bien el flag en `items.js`.

**Estado:** ⏸️ Anotado.

---

## 🎨 F23 · Transformaciones visuales de tiles y mobs

**Nota:** gran parte implementada en v2.4.2-alpha como **F25**.

### Pendiente
- **Mobs 2×2** (colisiones multi-celda).
- **Secuencias de emojis** (ciclar).
- **Rotación animada continua**.
- **Flip vertical**.

**Herramientas:** `pruebas/catalogo.html`, `auditor/laboratorio-v1.html`.

**Estado:** 🧪 Parcial en v2.4.2-alpha.

---

## 🐛 F24 · Bugs conocidos de v2.4-alpha · ✅ TODOS RESUELTOS en v2.4.1

### B1 · Romper tile usa bioma del chunk · ✅ ARREGLADO

**Solución:** `rotura.js` usa `obtenerBiomaDeCelda(wx, wy)`.

### B2 · Filas de pasto entre chunks · ✅ ARREGLADO

**Solución:** `yMin = 0`, `yMax = ALTO_CHUNK - 1`.

### B3 · Mobs de tierra aparecen en el agua · ✅ ARREGLADO

**Solución:** `ia.js` reescrito para 2D.

### B4 · Atravesar mob no dispara pelea · ✅ ARREGLADO

**Solución:** mismo fix que B3.

### B5 · Romper roca en agua genera arena · ✅ ARREGLADO

**Solución:** mismo fix que B1.

---

## ✨ F25 · Sistema de efectos visuales genéricos · 🧪 PARCIAL en v2.4.2-alpha

**Idea:** efectos desacoplados de las entidades. Cualquier tile, mob, ítem o entidad puede "recibir" un efecto.

### Estado actual

**`js/systems/efectos.js`:**
- `aplicarEfecto(wx, wy, clase, duracionMs?)`.
- `quitarEfecto(wx, wy, clase)`.
- `quitarTodosLosEfectos(wx, wy)`.
- `obtenerEfectosDe(wx, wy)`.
- `limpiarEfectos()`.
- `Map<"wx,wy", [{ clase, hasta }]>`.

**CSS:** `.efecto-ataque`, `.efecto-golpe`, `.efecto-golpe-loop`, `.efecto-recoger`, `.efecto-danio`, `.efecto-glow`, `.efecto-pulse`.

**`render.js`:** `actualizarEfectosEnGrid()` cada frame.

### Efectos disponibles

| Clase | Efecto | Cuándo |
|-------|--------|--------|
| `.efecto-ataque` | Vibrar + parpadear + destello rojo (~0.5s) | Ente recibe golpe |
| `.efecto-golpe` | Vibrar + parpadear lentos (~1s) | Picar/talar (una vez) |
| `.efecto-golpe-loop` | Vibrar + parpadear infinitos | Mientras dura la rotura |
| `.efecto-recoger` | Parpadeo rápido (0.3s) | Recoger ítem |
| `.efecto-danio` | Vibrar + parpadear + destello rojo | Jugador recibe daño |
| `.efecto-glow` | Halo celeste permanente | Ítem importante |
| `.efecto-pulse` | Pulsación permanente | Portal, orbe |

### Usado por

- `rotura.js`: `efecto-golpe-loop`.
- `combate.js`: `efecto-ataque` (mob) y `efecto-danio` (jugador).

### Pendiente
- Aplicar `efecto-recoger` al recoger ítems.
- Reemplazar el glow hardcodeado de la llave por `efecto-glow`.

**Estado:** 🧪 Funcional. Rotura y combate lo usan.

---

## 🌟 F26 · Sistema de mobs especiales (categoría 2)

**Idea:** mobs especiales que dropean objetos raros, son parte de misiones, o tienen condiciones especiales de aparición.

### Categorías de mobs

| Categoría | Nombre | Spawn | Drops | Misiones |
|:---------:|--------|-------|-------|:--------:|
| 1 | Normales | Por chunk + bioma | Comunes | No |
| **2** | **Especiales** | **Único o condicional** | **Únicos + comunes** | **Sí** |
| 3 | Bosses | Único en estructura | Legendarios | Sí (implícito) |

### Estructura propuesta (`MOBS_ESPECIALES`)

```js
{
  id: "lobo_plateado",
  categoria: "especial",
  nombre: "Lobo plateado",
  emoji: "🐺",
  hp: 30, ataque: 8, defensa: 3,
  
  spawn: {
    porMapa: 1,
    biomas: { bosque: true },
    forzarEnEstructura: "cueva",
    nivelMinimoJugador: 3,
    condicion: "noche",
  },
  
  mision: {
    questId: "matar_lobo_5",
    objetivo: "matar",
    cantidad: 5,
    recompensa: { item: "piel_plateada", cantidad: 5, xp: 100 },
  },
  
  dropsUnicos: [
    { item: "colmillo_plateado", probabilidad: 1.0, cantidad: 1 },
  ],
  
  loot: { dropea: true, probabilidad: 0.8, objetos: [...], xp: 50 },
}
```

### Requisitos técnicos

| Requisito | Estado | Depende de |
|-----------|:------:|------------|
| Spawn condicional (noche, nivel) | ⏸️ | F1 (día-noche) + F30 (niveles) |
| Spawn por estructura | ⏸️ | F15 |
| Drops únicos garantizados | ⏸️ | Extender `loot` en `enemigos.js` |
| Sistema de misiones | ⏸️ | `js/systems/misiones.js` (nuevo) |
| Persistencia de progreso | ⏸️ | F8 fase 3 |

**Estado:** ⏸️ Anotado. Depende de F1, F15, F28, F30 y sistema de misiones.

---

## 👑 F27 · Sistema de mobs bosses (categoría 3)

**Idea:** mobs muy poderosos, únicos por mundo, con **pelea por fases**, efectos al jugador, inmunidades y drops legendarios.

### Estructura propuesta (`MOBS_BOSS`)

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
  
  fases: [
    { hpMin: 150, ataques: ["basico", "embestida"], efectosAlJugador: ["lentitud"] },
    { hpMin: 80, ataques: ["embestida", "fuego"], efectosAlJugador: ["quemadura"], invocaEsbirros: ["esqueleto"] },
    { hpMin: 0, ataques: ["fuego", "rayo"], efectosAlJugador: ["veneno", "silencio"], furia: true },
  ],
  
  inmunidades: ["veneno"],
  resistencias: { fuego: 0.5 },
  
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

### Requisitos técnicos

| Requisito | Estado | Depende de |
|-----------|:------:|------------|
| Combate real (HP, daño) | ⏸️ | F28 |
| Efectos negativos al jugador | ⏸️ | Sistema de estados (nuevo) |
| Fases según HP | ⏸️ | Lógica en combate |
| Invocación de esbirros | ⏸️ | Spawn dinámico en combate |
| Inmunidades / resistencias | ⏸️ | Sistema de tipos de daño |
| Spawn por estructura | ⏸️ | F15 |

**Estado:** ⏸️ Anotado. Depende de F28 + F15 + sistema de estados + F30. Fase tardía.

---

## ⚔️ F28 · Sistema de combate con timing · 🧪 FASES 1-6 IMPLEMENTADAS en v2.5-alpha

**Idea:** reemplazar el overlay de batalla simulada por un **combate real por turnos** con **minijuego de timing**. Introducir HP del jugador, daño real, muerte y pantalla de derrota.

### Motivación

Antes de F28 el overlay de batalla era simulado (sin HP, sin daño, sin consecuencias).

**F28 es la base técnica para F1 (día-noche), F26 (mobs especiales), F27 (bosses), F29 (escalado) y F30 (niveles).**

### Modelo de combate

**Por turnos, con minijuego de timing:**

1. Jugador choca con mob hostil → `iniciarCombate(mob)`.
2. Overlay, pausa global (`estado.pausado = true`).
3. Se copia el HP del mob: `mob.hpActual = mob.hp` (solo si no existe).
4. **Turno del jugador (ataque):**
   - Barra horizontal con marcador izq→der en **1500ms** (una sola pasada, no rebota).
   - Jugador aprieta **Espacio**.
   - `precision = max(0, 1 - |posicion - 50| / 50)` → 0 a 1.
   - `multiplicadorDaño = precision * 2` → 0 a 2.
   - `dañoFinal = max(1, ataqueJug - defMob) * multiplicadorDaño`.
   - `aplicarEfecto(mob, "efecto-ataque", 500)`.
   - Esperar 800ms.
5. Si el mob muere → quitar del chunk, cerrar overlay, `estado.pausado = false`.
6. **Turno del mob (defensa):**
   - Barra de timing.
   - `reduccion = precision`.
   - `dañoRecibido = max(1, ataqueMob - defJug) * (1 - reduccion)`.
   - `aplicarEfecto(jugador, "efecto-danio", 500)`.
   - Esperar 800ms.
7. Si el jugador muere → pantalla derrota + reinicio.
8. Si ambos viven → volver al paso 4.

### Visual del minijuego

Barra con zonas coloreadas:
- 🟩 Centro (40-60%): verde = "perfecto"
- 🟧 Cerca del centro (25-40% y 60-75%): naranja = "aceptable"
- 🟥 Extremos (0-25% y 75-100%): rojo = "miss"

Marcador recorre la barra en 1500ms.

### Stats del jugador

```js
jugador: {
  wx, wy, ...,
  hp: 20,
  hpMax: 20,
  ataque: 3,
  defensa: 1,
  velocidad: 1,
  nivel: 1,   // placeholder (ver F30)
}
```

**Modificables por equipables futuros** (F12, cascos, botas, etc.).

### Balance con mobs actuales

Mobs: tigre (HP 12, ataque 5, defensa 2), gallina (HP 3, ataque 0), cerdo (HP 6, ataque 2).

| Escenario | Turnos para matar al tigre | Turnos para morir del tigre |
|-----------|:--------------------------:|:---------------------------:|
| Jugador perfecto | 2 turnos | Nunca |
| Jugador promedio | 4 turnos | 10 turnos |
| Jugador sin timing | ∞ (miss) | 5 turnos |

### HP en el HUD normal

- **Barra de HP** arriba del mapa, junto a la barra de stamina.
- **Número** en el HUD lateral: "HP: 20/20".
- **Futuro (fase 9):** íconos de corazón.
  - 10 HP lleno = ❤️❤️❤️❤️❤️ (2 HP por corazón).
  - 9 HP = ❤️❤️❤️❤️💔 (medio corazón).
  - 8 HP = ❤️❤️❤️❤️🖤 (un corazón menos).

### Huida (probabilística) — implementado en fase 6

**Flujo:**

1. Botón "🏃 Huir" arriba a la derecha del overlay.
2. Al apretar: cancela la barra de timing activa + cancela `setTimeout` pendiente entre turnos.
3. Diálogo "¿De verdad querés huir? (X%)".
4. Si **NO**: el combate sigue desde el turno actual.
5. Si **SÍ**: roll de probabilidad.
   - **Éxito:** el mob **desaparece del mapa** + HP del jugador baja por penalización (% del hpMax).
   - **Fallo:** el mob ataca (turno del mob).

**Fórmulas:**

```
nivelMob = max(1, floor((hp + ataque + defensa) / 4))
nivelJug = estado.jugador.nivel  // placeholder = 1
probHuida = clamp(0.5 + (nivelJug - nivelMob) * 0.05, 0.1, 0.9)
penalizacion% = clamp(5 + (nivelMob - nivelJug), 2, 40)
```

**Ejemplo:** tigre nivel 4, jugador nivel 1 → 35% de huida, penalización 8% del hpMax.

**Pendiente:** que el nivel del jugador suba (ver F30).

### Muerte del jugador

- Overlay cambia a pantalla de derrota.
- Botón "Reiniciar" → `reiniciarMundo(SEMILLA)`.
- (Futuro: opción de "cargar partida" si hay persistencia.)

### Archivos

**Nuevos:**

| Archivo | Función |
|---------|---------|
| `js/systems/barra-timing.js` | Minijuego de timing (barra, marcador, precisión) |
| `js/systems/combate.js` | Lógica de combate: iniciar, atacar, defender, huir, muerte |
| `js/ui/combate-ui.js` | Overlay de combate |

**Modificados:**

| Archivo | Cambio |
|---------|--------|
| `js/core/estado.js` | `hp`, `hpMax`, `ataque`, `defensa`, `velocidad`, `nivel` al jugador |
| `js/entities/enemigos.js` | `hpActual: mob.hp` + `hpMax: mob.hp` al spawnear + función `removerMobEn` |
| `js/ui/render.js` | Barra de HP del jugador en el HUD |
| `js/ui/victoria.js` | `iniciarBatalla` delega a `iniciarCombate` |
| `js/systems/combate.js` | `pausado` + `timeoutPendiente` + `BarraTiming.cancelar()` |
| `js/systems/barra-timing.js` | `cancelar()` para abortar sin disparar callback |
| `js/entities/jugador.js` | `intentarMover` verifica `estado.pausado` |
| `js/main.js` | `cancelarCombateSiActivo()` al reiniciar |
| `index.html` | Scripts nuevos + `<div id="barra-hp">` |
| `css/estilo.css` | Estilos de overlay + barra HP + timing + confirmación huida |

### Fases

| Fase | Qué se hace | Estado |
|:----:|-------------|:------:|
| 1 | Stats del jugador en `estado.js` + HP en mobs | ✅ |
| 2 | Barra de HP en el HUD | ✅ |
| 3 | `barra-timing.js` (con `pruebas/barra-timing.html`) | ✅ |
| 4 | `combate-ui.js` (overlay con paneles) | ✅ |
| 5 | `combate.js` (lógica de turnos) | ✅ |
| 6 | Huida probabilística + conectar `victoria.js` | ✅ |
| 7 | Muerte del mob pulida | ⏸️ |
| 8 | Muerte del jugador + pantalla derrota | ⏸️ (básico funciona) |
| 9 | Balance final + íconos de corazón | ⏸️ |

### Decisiones confirmadas

- Turnos (no tiempo real).
- Marcador izq→der una sola vez (no rebota).
- Jugador forzado a atacar (no puede pasar turno).
- Overlay (no combate en el mapa).
- Huida probabilística con penalización (el mob desaparece).
- HP del mob se mantiene si el jugador huye sin éxito (fallo del roll).
- HUD: barra + número (después corazones).
- Combate por reflejos (MARCO 11) reemplazará este sistema en el futuro.

### Pendiente futuro

- **Bugs B6 y B7** (ver F28.1).
- Loot y XP (F13).
- Íconos de corazón (❤️/💔) en el HUD.
- Stats modificables por equipables (F12).
- Efectos negativos (veneno, lentitud) para bosses (F27).
- Integración con combate por reflejos (MARCO 11).

**Estado:** 🧪 Fases 1-6 implementadas en v2.5-alpha. Fases 7-9 pendientes. Bugs B6 y B7 conocidos (F28.1).

---

## 🐛 F28.1 · Bugs conocidos del combate con timing · ⏸️ PENDIENTE

Bugs detectados al probar F28 (fases 1-6). No bloquean el test pero deben resolverse antes de producción.

### B6 · HP del jugador en 0 no cierra el combate

**Síntoma:** el HP del jugador llega a 0 pero el combate sigue. El jugador puede seguir atacando.

**Causa probable:** `aplicarDañoAlJugador` baja el HP pero el chequeo `if (estado.jugador.hp <= 0)` solo ocurre al final del `setTimeout` del turno del mob. Si el jugador mata al mob en el turno siguiente (antes del próximo turno del mob), el chequeo nunca se ejecuta.

**Solución tentativa:** agregar chequeo `if (estado.jugador.hp <= 0)` también después de cada ataque del jugador (en el `onResultado` de `turnoJugador`), y también en `aplicarDañoAlJugador`.

### B7 · Matar al mob con HP 0 cura al jugador

**Síntoma:** estando en 0 HP, el jugador mata al tigre y su HP se recupera al máximo.

**Causa probable:** `cerrarCombate("muerte_mob")` no resetea `estado.jugador.hp`. Pero algo en el flujo (probablemente el `render` o `actualizarHUD` después de derrotar el mob) puede estar reseteando la barra de HP visual, y/o `estado.jugador.hp` no se está seteando correctamente cuando llega a 0.

**Hipótesis secundaria:** si `derrotarMobEn` remueve el mob y el jugador queda en 0 HP, el siguiente render podría no mostrar el HP en 0 por algún cálculo con `Math.max(0, ...)`. Hay que revisar en detalle.

**Prioridad:** 🟡 Media.
**Estado:** ⏸️ Pendiente. Resolver en la próxima sesión con OpenCode.

---

## 📊 F29 · Escalado dinámico de dificultad del timing

**Idea:** la dificultad del minijuego de timing (F28) se ajusta según el **tipo de mob** y la **fase del ciclo día-noche**. Se anota aparte de F28 porque es una capa de dificultad, no la base del combate.

### Eje 1 · Por tipo de mob

| Mob | `duracionMs` | Zona verde | Zona naranja (cada lado) |
|-----|:------------:|:----------:|:------------------------:|
| Gallina 🐓 | 2000 | 25% | 15% |
| Cerdo 🐖 | 1700 | 22% | 15% |
| Tigre 🐅 | 1500 | 20% | 15% |
| Mobs especiales (F26) | 1000 | 15% | 10% |
| Bosses (F27) | 700 | 10% | 8% |

**Valores iniciales para test.** Se calibran después.

### Eje 2 · Por fase del día (F1)

De noche el timing se hace **más difícil**: las zonas verde y naranja se achican.

| Fase | Multiplicador de zona |
|------|:---------------------:|
| Día | 1.0 |
| Transición día→noche | 0.75 |
| Noche | 0.5 |
| Transición noche→día | 0.75 |

**Ejemplo con tigre:**
- Día: barra 1500ms, zona verde 20%.
- Noche: barra 1500ms, zona verde 10% (la mitad).

**Pregunta:** ¿el achique de zona por noche aplica a **todos** los mobs o solo a los normales? Sugerencia: a todos.

### Eje 3 (futuro) · Por nivel del jugador

Cuando exista F30:

- Nivel 1: sin cambio.
- Nivel 10: zona verde -2%.
- Nivel 20: zona verde -4%.

Fórmula tentativa: `zonaVerde = base - (nivel * 0.2)`.

### Implementación técnica

- `BarraTiming.iniciar()` recibe `duracionMs`, `zonaVerde`, `zonaNaranja` como parámetros.
- CSS con variables (`--zona-verde`, `--zona-naranja`).
- `combate.js` calcula estos valores antes de cada ronda, según mob y fase del ciclo.

### Requisitos técnicos

| Requisito | Depende de |
|-----------|------------|
| BarraTiming parametrizable | F28 fase 3 (ya tiene `duracionMs`, falta zonas) |
| Zona verde/naranja dinámica | F28 + CSS variables |
| Detección de fase día-noche | F1 |
| Configuración por mob | Data de mobs |
| Sistema de niveles | F30 |

### Decisiones confirmadas

- F29 va aparte de F28 (capa de dificultad).
- Cada mob tiene su velocidad base.
- De noche las zonas se achican a la mitad.

### Pendiente

- Definir valores exactos por mob.
- Confirmar si el achique nocturno aplica a todos los mobs.
- Calibrar el multiplicador de zona nocturna (¿50%? ¿60%? ¿40%?).
- ¿Afecta también `duracionMs` o solo zonas? (Sugerido: solo zonas).
- ¿Otras condiciones que afecten el timing? (lluvia, boss en furia, etc.).

**Estado:** ⏸️ Anotado. Depende de F28 + F1.

---

## 📈 F30 · Sistema de niveles del jugador

**Idea:** sistema de progresión del jugador basado en experiencia (XP). Afecta probabilidades de huida (F28 fase 6) y dificultad del timing (F29 eje 3).

### Estado actual (placeholder)

- `estado.jugador.nivel = 1` (hardcodeado en `estado.js`).
- La fórmula de huida (`calcularProbHuida`, `calcularPenalizacionHuida`) ya usa `nivelJug` y `nivelMob`.
- `calcularNivelMob(mob)` = `(hp + ataque + defensa) / 4` (heurística, en `combate.js`).

### Cómo ganar XP (a definir)

**Opciones:**
- **A)** Matar mobs → +XP según el mob (`loot.xp` ya existe en la data).
- **B)** Completar quests → +XP.
- **C)** Romper tiles → +XP chico.
- **D)** Explorar chunks nuevos → +XP.
- **E)** Combinación de las anteriores.

### Progresión de nivel

**Opciones:**
- **A)** Lineal: 100 XP por nivel.
- **B)** Exponencial: `XP_necesaria = 100 * nivel^1.5`.
- **C)** Curva: rápido al principio, lento después.

### Qué se gana por nivel

**Futuro (a definir):**
- +HP máximo cada N niveles.
- +Ataque / +Defensa cada N niveles.
- Mejor probabilidad de huida (ya parcialmente en F28).
- Zona verde más chica en timing (F29 eje 3).

### Fórmulas actuales (placeholder, ya en `combate.js`)

```js
function calcularNivelMob(mob) {
  return Math.max(1, Math.floor((datos.hp + datos.ataque + datos.defensa) / 4));
}

function calcularProbHuida(nivelJug, nivelMob) {
  return Math.max(0.1, Math.min(0.9, 0.5 + (nivelJug - nivelMob) * 0.05));
}

function calcularPenalizacionHuida(nivelJug, nivelMob) {
  return Math.max(2, Math.min(40, 5 + (nivelMob - nivelJug)));
}
```

**Cuando exista F30 real**, estas fórmulas se pueden ajustar o mantener.

### Preguntas pendientes

- ¿Cómo se gana XP? (ver opciones arriba)
- ¿Cómo se sube de nivel? (ver opciones arriba)
- ¿Qué se gana por nivel? (ver opciones arriba)
- ¿El nivel del jugador se persiste entre sesiones? (requiere F8 fase 3)
- ¿El nivel del mob se deriva de sus stats o es un dato explícito?

**Requiere:** F28 (fase 6 ya lo usa) + sistema de XP + persistencia (F8 fase 3).

**Estado:** ⏸️ Anotado. Se implementa después de F28.1.

---

**Fin del BACKLOG**