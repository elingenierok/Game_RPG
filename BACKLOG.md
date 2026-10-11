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
```
mundo = función(semilla, zona) + deltas
```
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

**Fin del BACKLOG**