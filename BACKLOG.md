# 🔮 Backlog · Game_RPG

Ideas futuras anotadas. **No están priorizadas ni implementadas.** Se anotan para no perderlas.

Para el estado actual del proyecto, ver [README.md](README.md).

**Contenido actual:**
- F1 · Ciclo día-noche
- F2 · Movimiento amortiguado (Modelo 2 · Pokémon)
- F3 · Sistema de capas del mundo
- F4 · Semillas independientes por sistema · ✅ IMPLEMENTADO en v1.3
- F5 · Spawn forzado por bioma o estructura
- F6 · Pathfinding con obstáculos
- F7 · Deambulación más realista
- F8 · Objetos equipables y modificar el mundo
- F9 · Sistema de mouse / interacción con click
- F10 · Bioma "playa" como bioma separado
- F11 · Fases de objetos equipables · ✅ IMPLEMENTADO en v1.7
- F12 · Objetos equipables de mejor nivel
- F13 · Drops alternativos de objetos
- F14 · Rediseño del sistema de biomas con JSON · ✅ IMPLEMENTADO en v1.6
- F15 · Biomas forzados + chunks de transición
- F16 · Rediseño del bioma "costa" · ✅ IMPLEMENTADO en v1.7.1
- F17 · Sistema de "biomas con forma"
- F18 · Barco (atravesar agua)
- F19 · Tema "espacio" (nueva piel)

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

---

## 🚶 F2 · Movimiento amortiguado entre celdas (Modelo 2 · Pokémon)

**Idea:** el jugador se mueve **casilla a casilla**, pero con una **animación visual suave** entre una y la siguiente. La lógica de grilla queda intacta.

**Diferencia con Modelo 1 (actual):**

| Modelo | Comportamiento |
|--------|----------------|
| **1 · Actual** | El jugador salta de casilla en casilla **instantáneamente** |
| **2 · Pokémon** | El jugador se **desliza** de casilla a casilla en ~120-150ms |
| **3 · Zelda** | El jugador se mueve libremente por píxeles (no viable sin reescribir) |

**Concepto clave:** el jugador **nunca está entre casillas lógicamente**. Solo **visualmente** durante la animación. Al terminar la animación, está en la nueva casilla.

**Lo que NO cambia:** colisión, transición de zona, recoger ítems, batalla, IA de mobs, estado del jugador.

**Lo que SÍ cambia:** el jugador deja de ser una celda y pasa a ser un elemento superpuesto (`position: absolute` + `transform: translate`).

**Archivos afectados:** `jugador.js`, `render.js`, `input.js`, `estilo.css`, `index.html`.

**Parámetros propuestos:** duración 120-150ms · sin encolar · teclas durante animación ignoradas · velocidad lineal.

**Estado:** ⏸️ Anotado con plan detallado. Se implementará después de las tareas urgentes actuales.

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

---

## 🧭 F6 · Pathfinding con obstáculos (IA avanzada)

**Idea:** los mobs actualmente se mueven en **línea recta**. Si hay un obstáculo en el camino (árbol, otro mob, muro), **se quedan quietos ese tick**.

**Mejora propuesta:** que puedan **rodear** obstáculos para llegar al jugador.

**Consideraciones:**
- Requiere algoritmo **A*** o similar sobre la grilla.
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

## 🎒 F8 · Objetos equipables y modificar el mundo

**Idea:** permitir al jugador **equipar ítems** (cascos, botas, hachas) y **modificar el mundo** (picar, talar, construir). Los cambios deben **persistir** entre sesiones.

**Modelo de persistencia:** deltas.
mundo = función(semilla, zona) + deltas

- Los deltas guardan solo los cambios del jugador (`"zona:x,y" → tile nuevo`).
- Se combinan con el mundo generado al cargar un chunk.
- Es el modelo estándar de Minecraft, Terraria, etc.

**Capas del sistema:**

| Capa | Semilla | Estado |
|------|---------|:------:|
| Terreno | `SEMILLA` | ✅ Implementado |
| Estructuras | `SEMILLA_ESTRUCTURAS` | ⏸️ Pendiente |
| Mobs | `SEMILLA_MOBS` | ✅ Implementado (v1.3) |
| Objetos de terreno | `SEMILLA_OBJETOS` | 🧪 Ligado a `SEMILLA` |
| Loot de contenedores | `SEMILLA_LOOT` | ⏸️ Pendiente |

**Fases propuestas:**
1. Objetos equipables (slots + stats).
2. Modificar mundo en memoria (picar/talar).
3. Persistencia con deltas (localStorage).
4. Inventario visual completo.

**Estado:** ⏸️ Anotado con plan detallado. Se implementará después de las tareas urgentes actuales.

---

## 🖱️ F9 · Sistema de mouse / interacción con click

**Idea:** usar el mouse para **interactuar con entidades y objetos** en el mapa, en lugar de solo caminar sobre ellos.

**Comportamiento por tipo de objetivo:**

| Objetivo | Acción al hacer click |
|----------|----------------------|
| Mob hostil | Atacar (inicia batalla) |
| Mob neutral | Interactuar (varía: acariciar, provocar, alimentar) |
| Mob pacífico | Interactuar (varía: espantar, alimentar) |
| NPC | Hablar (abre diálogo) |
| Cofre | Abrir (emergente con contenido) |
| Cueva / puerta | Ingresar (cambia de pantalla/escena) |
| Ítem en el suelo (🍎, 💎) | Recoger (alternativa a pisarlo) |
| Llave 🔑 | Recoger |

**Ventajas:**
- Más control: el jugador decide qué hacer sin moverse.
- Habilita acciones sin caminar (atacar desde lejos, abrir cofres a distancia, etc.).
- Menú contextual (click derecho) con opciones específicas.

**Consideraciones:**
- Requiere **hit detection** en el canvas/grid (convertir coordenadas de mouse → celda).
- Requiere **feedback visual** al pasar el mouse (resaltar celda/entidad).
- Requiere **menú contextual** para objetivos con múltiples opciones.
- En móvil → adaptar a tap + long-press.

**Dependencias:**
- Cofres, cuevas, NPCs → features futuras (aún no implementadas).
- Menú contextual → FSM de pantallas (aún no implementado).

**Estado:** ⏸️ Anotado. Se implementará cuando haya objetos/NPCs interactuables.

---

## 🏖️ F10 · Bioma "playa" como bioma separado

**Idea:** actualmente "playa" NO es un bioma. Es un conjunto de tiles (arena 🟨) dentro del bioma "costa".

**Consecuencia:** no se puede hacer un objeto equipable específico para "playa", ni un mob de playa, ni transiciones suaves.

**Propuesta:** separar "playa" como un bioma propio en el futuro:
- `bosque`, `pradera`, `costa`, `ruina`, `playa`.
- Rediseñar el sistema de permutación de biomas para soportar N biomas.
- Reasignar objetos equipables si aplica.

**Estado:** ⏸️ Anotado. Se trabajará cuando se agreguen más biomas.

---

## 🎒 F11 · Fases de objetos equipables · ✅ IMPLEMENTADO en v1.7

**Estado:** completo. Los objetos equipables se recogen, se muestran en slots, y permiten romper tiles del mundo.

**Lo que quedó fuera (futuro):**
- **F12:** objetos de mejor nivel (hacha de diamante, etc.).
- **F13:** drops alternativos.

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
- El motor `obtenerBiomaDeZona()` decide el bioma de cada zona en cadena.
- Determinista por semilla.

**Biomas actuales:**
- pradera, bosque, costa, ruina, oceano, desierto, nieve.

**Tiles nuevos:** 🟧 (desierto), 🌵 (cactus), ❄️ (nieve), 🧊 (hielo), 🌲 (pino).

**Referencia:**
- `js/world/biomas.js` — tabla de biomas.
- `js/world/mundo.js` — motor de asignación y pintado.

---

## 🏙️ F15 · Biomas forzados + chunks de transición

**Idea:** después de generar el mundo natural, una **segunda pasada** inserta biomas forzados (ciudades, puertos, islas, ruinas temáticas) que reemplazan zonas existentes.

### Reglas confirmadas

| Aspecto | Decisión |
|---------|----------|
| Aparición | Regla por zona (ej: "cada 10 zonas insertar un bioma forzado") |
| Tamaño | Zona entera (50×34) |
| Transición | Chunks de transición automáticos alrededor |
| Detección | El jugador los descubre al llegar |
| Continuidad | Puede bloquear el paso. No se garantiza transitable |
| Reemplazo | Los tiles nuevos pisan los viejos |

### Tipos de biomas forzados (ejemplos)

- 🏙️ Ciudad — reemplaza pradera o bosque.
- ⚓ Puerto — reemplaza costa, requiere oceano cerca.
- 🏝️ Isla — aparece dentro de océano.
- 🏰 Castillo — reemplaza ruina.

### Chunks de transición

**Concepto:**
Sin transición: [pradera] [ciudad] [pradera]
Con transición: [pradera] [trans] [ciudad] [trans] [pradera]

El chunk de transición **mezcla automáticamente** los tiles de ambos biomas adyacentes.

### Condiciones de aparición

Cada bioma forzado tendrá condiciones en el JSON:

```json
"puerto": {
  "tipo": "forzado",
  "condiciones": {
    "reemplaza": ["costa"],
    "vecinosRequeridos": ["oceano"]
  }
}

Pendiente de definir
Regla exacta de aparición (¿cada cuántas zonas?).

Definición completa de cada bioma forzado.

Algoritmo de mezcla para chunks de transición.

Si los biomas forzados afectan a sus vecinos.

Si son transitables o pueden bloquear.

Estado: ⏸️ Planificado. Se implementará después de HP + daño.

## 🏖️ F16 · Rediseño del bioma "costa" · ✅ IMPLEMENTADO en v1.7.1

**Problema:** el bioma "costa" pintaba los tiles con probabilidad uniforme. El resultado eran "charcos" de agua salpicados por el chunk.

**Solución:** la costa ahora usa **forma de franja**:
- Agua en un lateral (~1/3 del chunk).
- Arena en el medio (~1/3).
- Pasto en el otro lateral (~1/3).
- Bordes irregulares (con ondulación) para naturalidad.

**Implementación:**
- `js/world/biomas.js`: campo `forma: "franja"` en el bioma costa.
- `js/world/mundo.js`: nueva función `pintarCosta()`.

**Estado:** ✅ Completado.

Problema: el bioma "costa" pintaba los tiles con probabilidad uniforme. El resultado eran "charcos" de agua salpicados por el chunk.

Solución: la costa ahora usa forma de franja:

Agua en un lateral (~1/3 del chunk).

Arena en el medio (~1/3).

Pasto en el otro lateral (~1/3).

Bordes irregulares (con ondulación) para naturalidad.

Implementación:

js/world/biomas.js: campo forma: "franja" en el bioma costa.

js/world/mundo.js: nueva función pintarCosta().

Estado: ✅ Completado.

🌊 F17 · Sistema de "biomas con forma"
Idea: algunos biomas no se generan con probabilidad uniforme por celda. Tienen forma.

Formas previstas:

Franja: agua en un lateral (costa) — ✅ implementado.

Lago: masa circular en el centro.

Río: franja atravesando el chunk.

Isla: tierra rodeada de agua.

Montaña: elevación con cordillera.

Estado actual:

✅ pintarCosta() implementado (franja).

⏸️ Otras formas pendientes.

Extensible a:

Motor genérico de formas basado en el campo forma de cada bioma.

Función pintarForma(mapa, forma, ...) que dispatchee a la estrategia correcta.

Estado: ⏸️ Planificado. Se implementará cuando se necesite (ríos, lagos, etc.).

🛶 F18 · Barco (atravesar agua)
Idea: un objeto equipable que permite al jugador caminar sobre tiles de agua.

Objeto: 🛶 (Canoa)
Aparece: 1 por mundo, en cualquier zona, siempre pegado a un tile de agua.

Recolección: al pisarlo, se suma al inventario.

Slot: slot de equipados (junto a 🪓 ⛏️ 🕯️).

Uso
El jugador tiene 🛶 en el inventario.

Hace click sostenido sobre un tile de agua adyacente (a 1 tile).

Se inicia una barra de 5 segundos (como al talar/picar).

Al terminar:

El jugador se "sube" al barco.

Su emoji cambia a 🚣.

Puede moverse sobre tiles de WATER 🌊.

Si el jugador pisa un tile no-agua (pasto, arena, etc.), vuelve a 🏃‍♂️ automáticamente. El barco queda "guardado" en el inventario.

Detalles
Solo atraviesa WATER. No atraviesa arena, pasto, árboles, etc.

El barco es del jugador. Una vez conseguido, siempre lo tiene (no se pierde).

No se consume. Se puede usar infinitas veces.

Pendiente de definir
¿Qué pasa si el jugador "atraviesa" agua pero hay una isla en el medio?

¿El barco puede "romperse" o perderse? (no por ahora)

¿Se puede volver a "colocar" el barco en agua desde el inventario después?

Estado: ⏸️ Anotado. Se implementará después de HP + daño real.

---

## 🌌 F19 · Tema "espacio" (nueva piel)

**Idea:** reutilizar el motor completo del juego con un cambio temático de "roguelike medieval" a "explorador espacial".

**Regla clave:** **no se toca el motor.** Solo se cambian **datos**.

### Qué cambia

| Capa | Archivo | Cambio |
|------|---------|--------|
| Tiles | `tiles.js` | Los íconos (emoji) de cada tile |
| Biomas | `biomas.js` | Los nombres, emojis de resumen, y vecinos |
| Mobs | `mobs.js` | Nombres, emojis, y quizás stats |
| UI | `index.html`, `render.js` | Textos de la interfaz |
| Config | `config.js` | `BIOMA_INICIAL` |

### Ejemplos de conversión

| Original | Espacio |
|----------|---------|
| 🟩 GRASS | 🌑 Suelo lunar |
| 🌳 TREE | 🛸 Nave alienígena |
| 🧱 WALL | 🔩 Panel metálico |
| 🌊 WATER | 🟪 Líquido alienígena |
| 🟨 SAND | 🟫 Arena espacial |
| 🏜️ DESERT | 🟥 Arena roja (Marte) |
| 🌵 CACTUS | 🦑 Criatura alienígena |
| ❄️ SNOW | ⬜ Cristal blanco |
| 🧊 ICE | 🔵 Hielo azul |
| 🌲 PINE | 🗼 Torre/antena |
| 🐅 TIGRE | 👽 Alien hostil |
| 🐓 GALLINA | 🤖 Dron pacífico |
| 🐖 CERDO | 🦎 Reptiliano neutral |
| 🏃‍♂️ PLAYER | 🚀 Astronauta o cohete |
| 🪓 HACHA | ⚡ Sable de energía |
| ⛏️ PICO | 🔫 Taladro |
| 🕯️ LINTERNA | 💡 Lámpara |
| 🛶 BARCO | 🚀 Módulo de escape |

### Biomas espaciales

| Original | Espacio |
|----------|---------|
| pradera | superficie_lunar 🌑 |
| bosque | campo_de_cristales 💎 |
| costa | lago_de_metano 🟪 |
| ruina | base_abandonada 🛸 |
| oceano | mar_de_energía 🔵 |
| desierto | desierto_rojo 🟥 |
| nieve | glaciar_espacial ⬜ |

### Tiempo estimado
- Conversión básica (íconos + nombres): **1-2 horas**.
- Ajuste de pesos de vecinos y tiles: **1-2 horas adicionales**.

### Consideraciones
- Los IDs de los biomas (`pradera`, `bosque`, etc.) pueden quedar iguales para no tocar el motor.
- Solo cambian los **nombres legibles** y los **emojis**.
- Si se quiere hacer un fork separado, duplicar todo el proyecto.

### Estado
⏸️ Anotado. No es prioridad. Se puede implementar en cualquier momento porque solo toca datos.

---

**Fin del BACKLOG**