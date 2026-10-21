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
- F28 · Sistema de combate con timing · 🟢 COMPLETO + F28.2/F28.3/F28.5/F28.6 en v2.7-alpha
- F28.1 · Bugs de combate con timing · ✅ RESUELTO en v2.5.1-alpha
- F28.2 · Ataques telegrafiados por mob · ✅ IMPLEMENTADO en v2.7-alpha
- F28.3 · Resumen de victoria · ✅ IMPLEMENTADO en v2.7-alpha
- F28.4 · Motor de efectos y modificadores de combate · ⏸️ DISEÑADO
- F28.5 · Combo de 3 perfectos · ✅ IMPLEMENTADO en v2.7-alpha
- F28.6 · Historial de combate y último golpe · ✅ IMPLEMENTADO en v2.7-alpha
- F29 · Escalado dinámico de dificultad del timing
- F30 · Sistema de niveles del jugador
- F31 · Adaptación móvil y controles táctiles
- F32 · Campaña por etapas de bioma único + etapa final
- F33 · Menú, guardado/carga y muerte

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
- ¿Cómo se agregan/quitan corazones cuando cambia `hpMax`?

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

### Variante 2x2

Un mob especial puede ser una versión agrandada de un mob normal: ocupa **2×2 celdas** en vez de 1×1, tiene más vida, más ataque y mejor loot. La implementación futura necesita soporte de render y colisión para entidades de 2×2; no se resuelve solo cambiando el emoji.

### Estructura propuesta (`MOBS_ESPECIALES`)

```js
{
  id: "lobo_plateado",
  categoria: "especial",
  nombre: "Lobo plateado",
  emoji: "🐺",
  hp: 30, ataque: 8, defensa: 3,
  tamano: { ancho: 2, alto: 2 },   // variante especial 2×2

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
| Render/colisión para entidades 2×2 | ⏸️ | Motor de entidades actual |
| Spawn condicional (noche, nivel) | ⏸️ | F1 (día-noche) + F30 (niveles) |
| Spawn por estructura | ⏸️ | F15 |
| Drops únicos garantizados | ⏸️ | Extender `loot` en `enemigos.js` |
| Sistema de misiones | ⏸️ | `js/systems/misiones.js` (nuevo) |
| Persistencia de progreso | ⏸️ | F33 |

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
    { hpMin: 150, ataques: ["ATAQUE_1", "ATAQUE_2"], efectosAlJugador: ["lentitud"] },
    { hpMin: 80, ataques: ["ATAQUE_BOSS_1", "ATAQUE_5", "ATAQUE_2"], efectosAlJugador: ["quemadura"], invocaEsbirros: ["esqueleto"] },
    { hpMin: 0, ataques: ["ATAQUE_BOSS_1", "ATAQUE_BOSS_2"], efectosAlJugador: ["veneno", "silencio"], furia: true },
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

**Ataques de boss:** el catálogo ya reserva `ATAQUE_BOSS_1` como placeholder. Cada boss puede reutilizarlo o definir `ATAQUE_BOSS_2`, `ATAQUE_BOSS_3`, etc. `ATAQUE_5` (Golpe contundente) queda reservado para un boss futuro. Los efectos al jugador dependen de F28.4 (motor de estados).

### Requisitos técnicos

| Requisito | Estado | Depende de |
|-----------|:------:|------------|
| Combate real (HP, daño) | ⏸️ | F28 |
| Efectos negativos al jugador | ⏸️ | F28.4 (motor de estados) |
| Fases según HP | ⏸️ | Lógica en combate |
| Invocación de esbirros | ⏸️ | Spawn dinámico en combate |
| Inmunidades / resistencias | ⏸️ | Sistema de tipos de daño |
| Spawn por estructura | ⏸️ | F15 |

**Estado:** ⏸️ Anotado. Depende de F28 + F15 + F28.4 (estados) + F30. Fase tardía.

---

## ⚔️ F28 · Sistema de combate con timing · 🟢 COMPLETO + F28.2/F28.3/F28.5/F28.6 en v2.7-alpha · F28.4 diseñado

**Idea:** reemplazar el overlay de batalla simulada por un **combate real por turnos** con **minijuego de timing**. Introducir HP del jugador, daño real, muerte y pantalla de derrota.

### Motivación

Antes de F28 el overlay de batalla era simulado (sin HP, sin daño, sin consecuencias).

**F28 es la base técnica para F1 (día-noche), F26 (mobs especiales), F27 (bosses), F29 (escalado) y F30 (niveles).**

### Modelo de combate

**Por turnos, con minijuego de timing:**

1. Jugador choca con mob hostil → `iniciarCombate(mob)`.
2. Overlay, pausa global (`estado.pausado = true`).
3. Aviso inicial (`DELAY_AVISO_MS = 1800`): "¡Atención! <mob> te va a atacar." + "¡PREPÁRATE!".
4. Se copia el HP del mob: `mob.hpActual = mob.hp` (solo si no existe).
5. **Turno del jugador (ataque):**
   - Barra horizontal con marcador izq→der en **1500ms** (una sola pasada, no rebota).
   - Jugador aprieta **Espacio**.
   - `precision = max(0, 1 - |posicion - 50| / 50)` → 0 a 1.
   - `multiplicadorDaño = precision * 2` → 0 a 2.
   - `dañoFinal = max(1, ataqueJug - defMob) * multiplicadorDaño`.
   - `aplicarEfecto(mob, "efecto-ataque", 500)`.
   - Esperar 800ms.
6. Si el mob muere → resumen de victoria (XP + objetos de prueba) y cierre.
7. **Turno del mob (defensa):**
   - Telegráfico: anuncia el ataque elegido (`DELAY_TELEGRAFO_MS = 900`).
   - Barra de timing con el perfil del ataque (duración y zonas).
   - `reduccion = precision`.
   - `dañoRecibido = max(1, ataqueMob - defJug) * (1 - reduccion)`.
   - `aplicarEfecto(jugador, "efecto-danio", 500)`.
   - Esperar 800ms.
8. Si el jugador muere → pantalla de derrota con botón de reinicio.
9. Si ambos viven → volver al paso 5.

### Visual del minijuego

Barra con zonas coloreadas:
- 🟩 Centro (40-60%): verde = "perfecto"
- 🟧 Cerca del centro (25-40% y 60-75%): naranja = "aceptable"
- 🟥 Extremos (0-25% y 75-100%): rojo = "miss"

Marcador recorre la barra en 1500ms.

**Perfiles por ataque (F28.2):** `BarraTiming.iniciar()` acepta `zonaPerfecta` (% total del centro) y `zonaAceptable` (% extra a cada lado). El combate pasa la duración y las zonas del ataque elegido. Las zonas se implementan con CSS variables (`--zona-perfecta`, `--zona-aceptable`, `--zona-roja`).

**Modos visuales:** ataque = ⚔️ rojo; defensa = 🛡️ celeste. La etiqueta, el icono de fondo y el hint cambian según el modo.

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

- **Corazones** arriba del mapa + número de vida, sin barra.
- **2 HP por corazón:** 20 HP = 10 corazones.
- **❤️ lleno** = 2 HP, **💔 roto** = 1 HP, **🖤 vacío** = 0 HP.
- Ejemplo: 3 HP = ❤️💔 + 8 corazones vacíos.
- El total de corazones se deriva de `hpMax`, así que futuros aumentos de vida máxima agregan corazones.
- **Manzanas curativas:** +1 HP al recogerlas, sin superar `hpMax`. Al estar al máximo, la manzana queda en el suelo.
- `curarJugador(cantidad)` queda disponible para futuras comidas o consumibles.

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

- Overlay de derrota propio con HP final y mensaje del mob.
- Botón "Reiniciar mundo" → `reiniciarMundo(SEMILLA)`.
- (Futuro: opción de "cargar partida" si hay persistencia.)

### F28.2 · Ataques telegrafiados por mob · ✅ IMPLEMENTADO en v2.7-alpha

**Idea:** cada mob tiene un repertorio de ataques. Antes de la barra de defensa, el juego anuncia cuál va a usar y la barra adopta su perfil.

**Catálogo interno (`js/systems/combate.js`):**

| ID | Ataque | Emoji | Perfil | `duracionMs` | `zonaPerfecta` | `zonaAceptable` | `zonaRoja` | `mitigacionMaxima` |
|----|--------|:-----:|--------|:------------:|:--------------:|:---------------:|:----------:|:------------------:|
| ATAQUE_1 | Zarpazo | 🐾 | Rápido y angosto | 1100 | 12% | 14% | 30% | 100% |
| ATAQUE_2 | Embestida | 💥 | Lento y amplio | 1700 | 32% | 18% | 16% | 100% |
| ATAQUE_3 | Mordida | 🦷 | Precisión normal | 1400 | 20% | 15% | 25% | 100% |
| ATAQUE_4 | Disparo | 🎯 | Muy rápido y angosto | 950 | 8% | 10% | 36% | 100% |
| ATAQUE_5 | Golpe contundente | 💢 | Muy rápido y barras finas | 800 | 6% | 8% | 39% | 100% |
| ATAQUE_6 | Picotazo | 🐔 | Rápido y preciso | 1000 | 16% | 16% | 26% | 100% |
| ATAQUE_7 | Tentáculo | 🐙 | Amplio y envolvente | 1600 | 28% | 18% | 18% | 100% |
| ATAQUE_8 | Golpe | 👊 | 50% imbloqueable | 1200 | 16% | 14% | 28% | **50%** |
| ATAQUE_BOSS_1 | Ataque especial | ☠️ | Placeholder de boss | 1000 | 10% | 10% | 35% | 100% |

**`mitigacionMaxima`:** fracción máxima del daño que puede mitigar la barra de defensa. `1.0` = un bloqueo perfecto anula todo; `0.5` = incluso con precisión perfecta entra la mitad del daño. Es determinista, no una probabilidad.

**Zona roja:** espacio restante de la barra, repartido en dos mitades: `(100 − verde − 2 × naranja) / 2`.

**Asignación actual:**

| Tema | Mob | `ataques` |
|------|-----|-----------|
| Tierra | Tigre | ATAQUE_1, ATAQUE_2, ATAQUE_3 |
| Tierra | Gallina | ATAQUE_6 |
| Tierra | Cerdo | ATAQUE_2 |
| Espacio | Alien hostil | ATAQUE_1, ATAQUE_3, ATAQUE_4 |
| Espacio | Dron pacífico | ATAQUE_4 |
| Espacio | Reptiliano | ATAQUE_2, ATAQUE_3, ATAQUE_8 |

`ATAQUE_5` (Golpe contundente) queda reservado para un boss futuro de F27. `ATAQUE_BOSS_1` está en el catálogo como placeholder; `ATAQUE_BOSS_N` es la convención para ataques únicos de bosses.

Los datos viven en `js/core/temas/tema-tierra.js` y `tema-espacio.js` (campo `ataques` de cada mob). `elegirAtaqueMob()` evita repetir el ataque anterior cuando hay más de uno.

**Flujo:** turno mob → `mostrarTelegrafo()` (emoji + nombre + "¡Preparate para defenderte!") → espera 900ms → `BarraTiming.iniciar()` con el perfil del ataque → daño con `mitigacionMaxima`.

**Ejemplos futuros:** jabalí → Embestida + Mordida; asesino → Disparo + Golpe; pulpo → Tentáculo (no Mordida); boss → `ATAQUE_BOSS_1` o superior.

### F28.3 · Resumen de victoria · ✅ IMPLEMENTADO en v2.7-alpha

Al derrotar un mob, después del cierre del combate, se muestra un overlay `#victoria-overlay` con:

- Título "¡HAS GANADO!" y nombre del mob derrotado.
- XP estimada: `5 + nivelMob * 3` (placeholder; tigre nivel 4 = 17 XP).
- Objetos de prueba: `💰 Moneda antigua x2` y `🦴 Resto de <mob> x1`.
- Desglose de recompensas y botón **Continuar**.
- Mientras se muestra, el juego queda pausado; **Continuar** reanuda ticks/HUD.
- El loot/XP real llegará con F13; los valores actuales son solo de prueba.

### F28.4 · Motor de efectos y modificadores de combate · ⏸️ DISEÑADO, NO IMPLEMENTADO

**Problema:** hoy el catálogo solo cambia el perfil de la barra y `mitigacionMaxima`. No existe un sistema de estados (veneno, quemadura, buffs, debuffs) ni multiplicadores de daño/defensa por turno.

**Diseño propuesto:**

- `estadoCombate.estadosJugador` y `estadoCombate.estadosMob`: listas de efectos activos.
- Cada efecto: `{ id, tipo: "buff" | "debuff", duracionTurnos, stacks, trigger, modificadores }`.
- `trigger`: `inicioTurno`, `alAtacar`, `alDefender`, `alRecibirDanio`, `finTurno`.
- `modificadores`: `multiplicadorAtaque`, `multiplicadorDefensa`, `multiplicadorDanio`, `probabilidadBloqueo`, `danoPorTurno`, etc.
- Los ataques declaran `efectos: [{ id, probabilidad, duracionTurnos, stacks }]`; las defensas pueden declarar efectos propios.
- Orden de resolución por turno:
  1. Efectos de inicio de turno.
  2. Acción (ataque o defensa).
  3. Modificadores de ataque/defensa.
  4. Daño y `mitigacionMaxima`.
  5. Efectos al recibir daño.
  6. Descontar duración de estados y limpiar los vencidos.
- Regla de multiplicadores: primero se suman los porcentajes del mismo tipo, luego se aplican en un orden fijo y documentado. Nunca mezclar suma y multiplicación sin una tabla de orden.
- Los efectos deben probarse con un harness de turnos antes de asignarlos a mobs reales.

**Estado:** solo diseñado. No implementar efectos hasta tener tests de secuencia de turnos, duración y limpieza.

### F28.5 · Combo de 3 perfectos · ✅ IMPLEMENTADO en v2.7-alpha

**Idea:** premiar la precisión sostenida del jugador. Tres ataques perfectos consecutivos cargan un combo; el cuarto ataque pega ×1.5 y consume la carga.

**Implementación:**

- `estadoCombate.perfectosSeguidos` (0..3) persiste entre turnos de ataque y defensa.
- `COMBATE.PERFECTOS_PARA_COMBO = 3` y `COMBATE.MULTIPLICADOR_COMBO = 1.5`.
- `resolverComboPerfecto(precision)` calcula el multiplicador y actualiza la carga.
- El 4.º ataque recibe ×1.5 aunque no sea perfecto; si es perfecto, arranca una nueva cadena con 1/3.
- Un ataque no perfecto reinicia la cadena a 0.
- UI: 3 slots en el panel del jugador (`CombateUI.actualizarCombo`), con estado `¡LISTO! ×1.5`.
- El mensaje de daño muestra la carga (`1/3`, `2/3`, `3/3`) y `⚡ COMBO ×1.5` cuando se consume.

**Pruebas:** harness `test-combo.js` con secuencias perfecto/perfecto/perfecto/bonus, fallo y reinicio. Capturas headless de los slots en 2/3 y en estado `¡LISTO! ×1.5`.

### F28.6 · Historial de combate y último golpe · ✅ IMPLEMENTADO en v2.7-alpha

**Idea:** que el jugador pueda reconstruir qué pasó en la batalla sin depender del mensaje central, que cambia cada turno.

**Implementación:**

- `CombateUI.agregarHistorial(tipo, texto)` agrega una entrada a `#combate-historial-lista`.
- Tipos: `negativo` (rojo: daño recibido, huida fallida), `alerta` (amarillo: ataque fallado), `positivo` (verde: daño hecho, bloqueo, curación) y `sistema` (gris: inicio de combate).
- Máximo 24 entradas; al superarlo se elimina la más vieja. El panel tiene scroll y auto-scrollea a la última entrada.
- `CombateUI.actualizarUltimoGolpe(objetivo, cantidad, tipo)` muestra un badge temporal en `#combate-jugador-ultimo-golpe` o `#combate-mob-ultimo-golpe`.
- Badges: `−N HP` (daño), `BLOQUEO` (bloqueo perfecto), `SIN DAÑO` (fallo) y `+N HP` (curación).
- `CombateUI.registrarCuracion(cantidad, fuente)` queda listo para curas dentro del combate.
- `combate.js` registra inicio, ataque, defensa y huida fallida; `formatearDanio()` compacta enteros y decimales.
- Al cerrar el combate, `redondearHP()` normaliza jugador y mob a medios puntos hacia arriba (`14.899999 → 15`, `7.2 → 7.5`), con tope en `hpMax`; así las manzanas suman `+1` exacto.

**Pruebas:** harness `test-historial-flow.js` que verifica entrada de sistema, ataque favorable, defensa, badge del mob y badge del jugador. Harness `test-redondeo-hp.js` para snap de HP y manzana. Captura headless `historial-ui.png`.

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
| `js/ui/render.js` | Corazones + número de HP en el HUD |
| `js/ui/victoria.js` | `iniciarBatalla` delega a `iniciarCombate` |
| `js/systems/combate.js` | `pausado` + `timeoutPendiente` + muerte/derrota + feedback + catálogo de ataques + telegráfico + victoria |
| `js/systems/barra-timing.js` | `cancelar()`, modos ataque/defensa, zonas parametrizables y pista |
| `js/ui/combate-ui.js` | Aviso inicial + telegráfico + resumen de victoria |
| `js/core/temas/tema-tierra.js` | Campo `ataques` en cada mob |
| `js/core/temas/tema-espacio.js` | Campo `ataques` en cada mob |
| `js/entities/jugador.js` | `intentarMover` pausado + `curarJugador()` + manzanas |
| `js/entities/items.js` | `buscarItemEn()` + manzanas consumibles |
| `js/main.js` | Reinicio + `actualizarHUD()` inicial |
| `index.html` | `<div id="hp-corazones">` (sin barra de HP) |
| `css/estilo.css` | Corazones + overlay + modos de timing + telegráfico + victoria/derrota |

### Fases

| Fase | Qué se hace | Estado |
|:----:|-------------|:------:|
| 1 | Stats del jugador en `estado.js` + HP en mobs | ✅ |
| 2 | Barra de HP en el HUD (reemplazada por corazones en fase 9) | ✅ |
| 3 | `barra-timing.js` (con `pruebas/barra-timing.html`) | ✅ |
| 4 | `combate-ui.js` (overlay con paneles) | ✅ |
| 5 | `combate.js` (lógica de turnos) | ✅ |
| 6 | Huida probabilística + conectar `victoria.js` | ✅ |
| 7 | Muerte del mob pulida | ✅ (mensaje, animación y cierre diferido) |
| 8 | Muerte del jugador + pantalla derrota | ✅ (overlay con botón de reinicio) |
| 9 | Corazones + feedback + balance | ✅ (corazones con número; balance fino queda opcional) |
| 10 | Ataques telegrafiados + perfiles de timing (F28.2) | ✅ v2.7-alpha |
| 11 | Resumen de victoria con XP/objetos de prueba (F28.3) | ✅ v2.7-alpha |

### Decisiones confirmadas

- Turnos (no tiempo real).
- Marcador izq→der una sola vez (no rebota).
- Jugador forzado a atacar (no puede pasar turno).
- Overlay (no combate en el mapa).
- Huida probabilística con penalización (el mob desaparece).
- HP del mob se mantiene si el jugador huye sin éxito (fallo del roll).
- HUD: corazones + número (2 HP por corazón); sin barra.
- Manzanas curativas: +1 HP, sin superar `hpMax`.
- Ataques del mob definidos por datos (`ataques` en el tema), no hardcodeados en la lógica.
- Cada ataque tiene perfil de timing propio (duración + zonas); el telegráfico lo anuncia ~0.9s antes.
- Guardia/punto débil y fases de furia quedan para mobs especiales/bosses (F26/F27), no para mobs comunes.
- Resumen de victoria con XP/objetos de prueba hasta que F13 implemente loot real.
- Combate por reflejos (MARCO 11) reemplazará este sistema en el futuro.

### Pendiente futuro

- Balance fino de combate (opcional, después de más pruebas).
- Loot y XP reales (F13).
- Stats modificables por equipables (F12).
- Efectos negativos (veneno, lentitud) para bosses (F27).
- Guardia/punto débil y fases de furia para mobs especiales/bosses.
- Integración con combate por reflejos (MARCO 11).

**Estado:** 🟢 F28 completo (fases 1-11) en v2.7-alpha. F28.1 resuelto en v2.5.1-alpha (B6-B9). Incluye corazones, manzanas, aviso inicial, ataques telegrafiados, resumen de victoria y pantalla de derrota.

---

## 🐛 F28.1 · Bugs de combate con timing · ✅ RESUELTO en v2.5.1-alpha

Bugs detectados al probar F28 (fases 1-6). Resueltos y verificados manualmente en v2.5.1-alpha.

### B6 · HP del jugador en 0 no cerraba el combate

**Síntoma original:** el HP llegaba a 0 y el combate seguía.

**Causa real:** el combate cerraba y mostraba DERROTA, pero durante esos 2 segundos se reanudaban la IA y el movimiento; el mob podía iniciar un combate nuevo. Además, el HUD no se refrescaba al reiniciar.

**Solución:**
- Flag `estadoCombate.derrota` + pausa global durante la derrota.
- `iniciarCombate` bloqueado mientras `derrota` está activo.
- `verificarMuerteJugador()` en el loop principal cierra el combate apenas el HP llega a 0.
- `actualizarHUD()` al reiniciar el mundo.

### B7 · Matar al mob con HP 0 “curaba” al jugador

**Síntoma:** parecía que el HP se recuperaba al máximo.

**Causa real:** `reiniciarMundo()` reseteaba `hp = hpMax` pero el HUD recién se actualizaba al moverse. No era una curación: era el reinicio del mundo + barra desactualizada.

**Solución:** refresco del HUD al reiniciar y prioridad de la muerte del jugador sobre la muerte del mob.

### B8 · Huir bloqueado por la barra de timing

**Causa:** `#barra-timing-overlay` cubría toda la pantalla con `z-index: 500` y capturaba todos los clicks.

**Solución:** `pointer-events: none` en la capa de fondo; solo `#barra-timing-panel` captura clicks. Huir cancela la barra y abre la confirmación.

### B9 · Callback de timing pendiente

**Causa:** `BarraTiming.cancelar()` no cancelaba el `setTimeout` de feedback de 400ms; podía dispararse después de huir o cerrar el combate.

**Solución:** timeout cancelable + callback protegido.

**Estado:** ✅ Resuelto y probado en v2.5.1-alpha.

---

## 🐛 B10 · HUD vacío al iniciar el mundo · ✅ RESUELTO en v2.6-alpha

**Síntoma:** al recargar con `Ctrl+Shift+R`, la posición quedaba en `0,0` y los corazones/HP no aparecían hasta dar el primer paso.

**Causa:** `actualizarHUD()` solo se llamaba al pisar una celda o después de una acción; no se ejecutaba al crear el jugador.

**Solución:** llamada inicial a `actualizarHUD()` en `main.js`, después de `inicializarJugador()` e `iniciarTicks()`. La posición y los corazones aparecen desde el arranque.

**Estado:** ✅ Resuelto y verificado con captura headless y prueba manual en v2.6-alpha.

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

- `BarraTiming.iniciar()` recibe `duracionMs`, `zonaPerfecta` y `zonaAceptable` como parámetros (implementado en v2.7-alpha).
- CSS con variables (`--zona-perfecta`, `--zona-aceptable`, `--zona-roja`) (implementado en v2.7-alpha).
- Los perfiles base ya existen por ataque en `ATAQUES_MOB`; falta que `combate.js` los module por fase del ciclo.
- `combate.js` calculará los valores finales antes de cada ronda, según ataque + fase del ciclo.

### Requisitos técnicos

| Requisito | Depende de | Estado |
|-----------|------------|:------:|
| BarraTiming parametrizable | F28 fase 3 | ✅ v2.7-alpha |
| Zona perfecta/aceptable dinámica | F28 + CSS variables | ✅ v2.7-alpha |
| Perfil base por ataque | F28.2 | ✅ v2.7-alpha |
| Detección de fase día-noche | F1 | ⏸️ |
| Modulación por fase | F1 + perfiles base | ⏸️ |
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

**Estado:** ⏸️ Anotado. La base parametrizable ya está en v2.7-alpha (perfiles por ataque + CSS variables); falta F1 para modular por fase del día.

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
- ¿El nivel del jugador se persiste entre sesiones? (requiere F33)
- ¿El nivel del mob se deriva de sus stats o es un dato explícito?

**Requiere:** F28 (fase 6 ya lo usa) + sistema de XP + persistencia (F33).

**Estado:** ⏸️ Anotado. Se implementa después de F28 (ya completo).

---

## 📱 F31 · Adaptación móvil y controles táctiles

**Idea:** que el juego sea jugable en celular sin teclado físico, sin perder la mecánica de timing ni la legibilidad del HUD.

**Estado actual:**

- Ya existen botones de movimiento en pantalla.
- El combate depende de la tecla **Espacio** para atacar/defender; en celular no hay equivalente.
- El overlay de combate, el historial y la barra de timing pueden quedar apretados en pantallas bajas.
- No hay gestos táctiles, pantalla completa ni ajustes específicos para móvil.

**Alcance propuesto:**

- **Layout responsive:** HUD, overlay de combate, historial y barra de timing adaptados a vertical y horizontal; respetar `safe-area-inset` y evitar scroll accidental.
- **Controles táctiles:** botón de acción contextual grande (atacar / defender / confirmar / continuar), tap directo sobre la barra de timing, y botones de movimiento más grandes.
- **Acciones más automáticas (a evaluar):** auto-recoger manzanas, auto-avanzar mensajes de victoria/derrota, repetir última acción o confirmar automáticamente cuando haya una sola opción. No aplicar automatización que elimine el timing del combate.
- **Compensación de latencia:** evaluar si reducir la velocidad de algunas acciones, ampliar levemente zonas táctiles o agregar una pequeña ventana de gracia. La duración base no debería cambiar sin pruebas en dispositivos reales.
- **Rendimiento y UX:** pausar al perder foco, limitar efectos costosos, soportar orientación y agregar pantalla completa/PWA como opción futura.

**Decisiones pendientes:**

- ¿Vertical, horizontal o ambos?
- ¿Timing por tap directo o por botón único?
- ¿Qué acciones se automatizan y cuáles no?
- ¿Se agrandan las zonas de timing o solo los botones?
- ¿Se soporta PWA/offline y guardado local (F33)?
- ¿Qué dispositivo mínimo se toma como referencia?

**Depende de:** F28 (combate), HUD actual, F33 (si se guarda configuración táctil).

**Estado:** ⏸️ Anotado. No implementado.

---

## 🗺️ F32 · Campaña por etapas de bioma único + etapa final

**Idea:** convertir la exploración actual en una campaña por etapas. Cada mundo/etapa usa **un solo bioma** y tiene una misión principal; al completarla se desbloquea la siguiente etapa. Después de varias etapas introductorias, se abre una etapa final más grande que combina todos los biomas, con más misiones y un boss final.

**Modelo propuesto:**

- **Etapa = mapa finito de un bioma** con objetivo claro, mobs/objetos acordes y una salida que se desbloquea al completar la misión.
- **Progresión lineal:** etapa 1 → etapa 2 → … → etapa X → etapa final.
- **Misiones posibles:** buscar un objeto, derrotar un enemigo concreto, recolectar N recursos, fabricar/crear algo, sobrevivir, escoltar o activar una estructura.
- **Etapa final:** mundo amplio con todos los biomas mezclados (como el mundo actual), varias misiones encadenadas y un boss final. Debería ser la culminación, no solo un mapa más grande.
- **Transición:** resumen de etapa → siguiente etapa, conservando HP, inventario, XP y desbloqueos según se decida.

**Implicaciones técnicas:**

- Hoy el mundo es circular e infinito y el bioma se calcula por celda con ruido (F14/F24). Habría que agregar un **modo de mundo/etapa** con bioma forzado, tamaño limitado y borde/transición.
- Reutilizar F5/F15/F17 para biomas forzados y formas; F26/F27 para mobs especiales y bosses.
- El sistema de misiones no existe: habría que crear objetivos, flags de progreso y UI de misión.
- La etapa final puede reutilizar el generador actual de biomas mezclados.
- Guardar etapa actual, misión, flags y seed (F33).

**Decisiones pendientes:**

- ¿Cuántas etapas y en qué orden de biomas?
- ¿Tamaño de cada etapa y cantidad de chunks?
- ¿Qué misión principal tiene cada bioma?
- ¿Se conserva HP/inventario/XP entre etapas o se reinicia parcialmente?
- ¿Se puede volver a una etapa anterior?
- ¿Qué pasa si el jugador muere en una etapa?
- ¿Cómo se desbloquea y estructura la etapa final?
- ¿El boss final es uno solo o una secuencia de jefes?

**Depende de:** F5, F15, F17, F26, F27, F30 y F33.

**Estado:** ⏸️ Anotado. No implementado.

---

## 💾 F33 · Menú, guardado/carga y muerte

**Idea:** cerrar el ciclo de partida con un menú principal, pausa, guardado/carga y una política clara de muerte. Hoy no existe persistencia de progreso: al recargar se reinicia el mundo.

**Alcance propuesto:**

- **Menú principal:** Nueva partida, Continuar, Cargar, Opciones y Créditos.
- **Menú de pausa:** Reanudar, Guardar, Opciones, Volver al menú.
- **Guardado:** slots o partida única; autoguardado en puntos seguros (inicio de etapa, después de una misión, al cerrar combate).
- **Carga:** validar versión del guardado, mostrar resumen (etapa, nivel, HP, seed) y evitar cargar datos corruptos.
- **Muerte:** definir si es permadeath, reinicio de etapa, checkpoint o pérdida parcial de recursos. La pantalla de derrota actual ya ofrece reiniciar con la misma seed.

**Qué guardar (propuesta):**

- `version` del formato y fecha.
- Seed maestra + etapa actual + progreso de misión.
- HP/HP máximo, XP/nivel, ataque/defensa e inventario/equipables.
- Flags desbloqueados, objetos únicos y ajustes (tema, táctil, audio).
- **No guardar:** chunks completos, timers, efectos visuales ni estado transitorio de combate. Como el mundo es determinista, conviene regenerarlo desde la seed.

**Decisiones pendientes:**

- ¿Permadeath, checkpoints o guardado libre?
- ¿Un slot o varios?
- ¿Guardado automático, manual o ambos?
- ¿`localStorage` o IndexedDB?
- ¿Se guarda durante el combate o solo fuera de él?
- ¿Cómo se migran guardados entre versiones?
- ¿Se comparte progreso entre temas (tierra/espacio)?
- ¿El menú de pausa reemplaza o complementa el overlay actual?

**Depende de:** F30 (nivel/XP), F12/F13 (equipables/loot) y el estado global actual. Puede implementarse antes de F32; F32 reutiliza esta persistencia para guardar etapa, misión y flags.

**Estado:** ⏸️ Anotado. No implementado. Absorbe la idea anterior de “persistencia de progreso (F8 fase 3)”.

---

**Fin del BACKLOG**