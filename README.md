# 🎮 Game_RPG · Proyecto Roguelike Procedural

> Motor de mundo procedural con semilla, exploración acotada E-O por zonas,
> con fronteras compartidas entre chunks, ítems recolectables, estructuras
> estáticas multi-tile, arquitectura modular en múltiples archivos, y
> módulo de combate por reflejos en desarrollo paralelo.

---

## 📌 Estado actual del proyecto

| Campo | Valor |
|-------|-------|
| **Versión actual** | v1.1 · Grilla 50×34 + Estructuras Forma A + Combate en paralelo |
| **Última actualización** | 2026-10-09 |
| **Estado global** | 🧪 En fase de test · Prototipo jugable |
| **Archivo principal** | `index.html` (solo estructura HTML) |
| **Lenguaje** | HTML + CSS + JavaScript (sin dependencias) |
| **Ejecución local** | Live Server en VS Code |
| **Ejecución pública** | [elingenierok.github.io/Game_RPG](https://elingenierok.github.io/Game_RPG/) |
| **Repositorio** | [github.com/elingenierok/Game_RPG](https://github.com/elingenierok/Game_RPG) |
| **Editor** | VS Code |
| **Carpeta raíz** | `C:\Users\Usuario\Game_RPG` |

---

## 🎯 Objetivo del proyecto

Probar una **jugabilidad base** que, si resulta entretenida, escala hacia:

- Mapas más grandes y complejos
- Enemigos y sistema de combate
- Objetos recolectables e inventario (en progreso)
- Estructuras estáticas (casas, edificios, ruinas)
- Misiones y acertijos
- Múltiples pantallas/menús

**Frase guía:** *"Si el test se siente entretenido, agrego complejidad."*

---

## 🚀 Cómo ejecutar

### Opción A · Desarrollo local (Live Server)

1. Abrir VS Code en `C:\Users\Usuario\Game_RPG`
2. Click derecho en `index.html` → **Open with Live Server**
3. Editar cualquier archivo y guardar (Ctrl+S) → Live Server recarga solo

**⚠️ Importante:** por la arquitectura de múltiples archivos, **abrir el `index.html` con doble clic ya no funciona** (CORS bloquea la carga de `.js` desde `file://`). **Siempre usar Live Server.**

### Opción B · Versión pública (GitHub Pages)

**👉 [https://elingenierok.github.io/Game_RPG/](https://elingenierok.github.io/Game_RPG/)**

Se actualiza automáticamente cuando hacés `git push`.

### Controles

- **WASD** o **flechas direccionales** para moverte
- Enter en el input de semilla → aplicar
- Botón 🎲 → semilla aleatoria

**⚠️ Recarga forzada:** al modificar `.js` o `.css`, usar **Ctrl+Shift+R** en el navegador.

---

## 📁 Estructura del proyecto

```
Game_RPG/
├── index.html              ← Solo HTML (estructura + <script src>)
├── README.md               ← Este documento
├── .gitignore              ← Archivos ignorados por Git
├── css/
│   └── estilo.css          ← Todo el CSS del juego
└── js/
    ├── config.js           ← BLOQUE 1: constantes globales
    ├── tiles.js            ← BLOQUE 2: tiles, iconos, bloqueantes
    ├── rng.js              ← BLOQUE 3: hash, PRNG, randInt
    ├── mundo.js            ← BLOQUES 4, 5, 6: generación de chunks
    ├── estructuras.js      ← BLOQUE 5.5: plantillas de estructuras (Forma A)
    ├── estado.js           ← BLOQUE 7: estado global
    ├── items.js            ← BLOQUE 7.5: ítems y recolección
    ├── chunks.js           ← BLOQUE 8: caché y carga de pantalla
    ├── render.js           ← BLOQUES 9, 10, 11: render visual y HUD
    ├── jugador.js          ← BLOQUE 12: movimiento y transición
    ├── victoria.js         ← BLOQUE 13: condición de victoria
    ├── input.js            ← BLOQUE 14: listeners de teclado
    ├── limite.js           ← BLOQUE 18: config de límite de chunks
    └── main.js             ← BLOQUES 16, 17: arranque y reinicio
```

**Orden de carga en `index.html` (importante respetar):**
```
config → tiles → rng → mundo → estructuras → estado → items
→ chunks → render → jugador → victoria → input → limite → main
```

---

## 🔄 Flujo de trabajo con Git

### Hacer cambios y publicarlos

```powershell
git add .
git commit -m "descripción breve del cambio"
git push
```

En 30-60 segundos, GitHub Pages actualiza la URL pública.

### Clonar el proyecto en otra PC

```powershell
git clone https://github.com/elingenierok/Game_RPG.git
cd Game_RPG
```

Después abrir con Live Server en VS Code.

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
| M1 | Direccionalidad del mundo | 🟢 | Infinito E-O, límites N-S | Mundo corredor |
| M2 | Biomas | 🧪 | Bosque, pradera, costa, ruina | 4 tipos, frontera dura |
| M3 | Transición entre biomas | 🟢 | Dura (sin mezcla) | Suavizar es fase futura |
| M4 | Tamaño del chunk | 🟢 | **50×34 (pantalla completa)** | **v1.1: antes 25×17** |
| M5 | Memoria de cambios del jugador | ⏸️ | Sin memoria | Fase futura |
| M6 | Evolución temporal del mundo | ⏸️ | No | Fase futura |
| M7 | Ventana visible | 🟢 | **50×34 tiles** | **v1.1** |
| M8 | Comportamiento en bordes | 🟢 | Límite sólido N-S · Cambio de zona E-O | Con pausa de transición |
| M9 | Fronteras entre chunks | 🟢 | Columna compartida 100% transitable | v0.3 |
| M10 | Continuidad del jugador al cruzar | 🟢 | Preserva la fila Y | v0.3 |
| M11 | Caché de chunks | 🟢 | Actual + 2 vecinos | v0.3 |
| M12 | Límite de chunks | 🟢 | ±5 por defecto, configurable | v0.4 |
| M13 | Muros sólidos en extremos | 🟢 | Columna de 🧱 en zonas -N y +N | v0.4 |
| M14 | **Tamaño de celda** | 🟢 | **16×16 px** | **v1.1: antes 30×30** |

---

## 🎮 MARCO 2 · Jugabilidad / Core Loop

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| J1 | Objetivo del juego | 🧪 | Encontrar la 🔑 | Test de exploración |
| J2 | Condición de victoria | 🧪 | Pisar la llave | Pantalla de "¡Ganaste!" |
| J3 | Condición de derrota | ⏸️ | No hay | Sin HP todavía |
| J4 | Progresión | ⏸️ | No hay | Fase futura |
| J5 | Muerte definitiva | ⏸️ | No aplica | Fase futura |
| J6 | Turnos vs tiempo real | ⏸️ | No aplica | Fase futura |
| J7 | Sistema de iniciativa | ⏸️ | No aplica | Fase futura |
| J8 | Pantallas/menús | 🧪 | Solo mapa | Combate por reflejos en paralelo |
| J9 | Cambio entre pantallas | ⏸️ | No aplica aún | FSM cuando haya más pantallas |
| J10 | Diálogos con NPCs | ⏸️ | No | Fase futura |

---

## 🧑 MARCO 3 · Personaje / Jugador

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| P1 | Cantidad de personajes | 🟢 | 1 | Sin clases por ahora |
| P2 | Estadísticas | ⏸️ | Ninguna | HP, ataque, defensa → fase futura |
| P3 | Controles | 🟢 | WASD + flechas | Estándar |
| P4 | Inventario | 🧪 | Contador de ítems | v0.4: solo cuenta, sin uso aún |
| P5 | Tipos de objetos | 🧪 | 🍎 Manzana | v0.4: solo uno de prueba |
| P6 | Habilidades especiales | ⏸️ | Ninguna | Nadar, trepar, romper → fase futura |
| P7 | Modificar el mundo | ⏸️ | No | Talar, romper → fase futura |
| P8 | Necesidades (hambre/sed) | ⏸️ | No | Fase futura |
| P9 | **Orientación visual del jugador** | 🟢 | **Espejado horizontal (scaleX(-1))** | **v1.1: mira hacia donde camina** |

---

## ⚔️ MARCO 4 · Enemigos y Combate

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| E1 | Tipos de enemigos | 🔴 | — | Empezar con 3-4 |
| E2 | Movimiento de enemigos | 🔴 | — | Patrulla, persecución, estático |
| E3 | Detección del jugador | 🔴 | — | Visión, sonido, radio |
| E4 | Entrada al combate | 🟡 | — | Al chocar → módulo de combate por reflejos |
| E5 | Tipo de combate | 🟢 | **Combate por reflejos (tiempo real con ventanas)** | **v1.1: ver módulo aparte** |
| E6 | Huida del combate | 🔴 | — | ¿Vuelve al mapa? ¿Persigue? |
| E7 | Loot y XP | 🔴 | — | ¿Suelta objetos? ¿Sube nivel? |
| E8 | Combate grupal (1vN) | 🔴 | — | Fase avanzada |
| E9 | Jefes (bosses) | 🔴 | — | Cuando el sistema base esté listo |
| E10 | **Tamaño de enemigos** | 🟢 | **1×1 (emoji simple)** | **v1.1: enemigos chicos, estructuras grandes** |

---

## 🧩 MARCO 5 · Acertijos

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| A1 | Trigger del acertijo | 🔴 | — | Cofre / tile / NPC |
| A2 | Tipos de acertijo | 🔴 | — | Adivinanza, código, patrón, memoria |
| A3 | Generación de acertijos | 🔴 | — | Fijos vs procedurales |
| A4 | Consecuencia de fallar | 🔴 | — | Daño, bloqueo, muerte |
| A5 | Recompensa | 🔴 | — | Objeto, llave, info |
| A6 | Obligatoriedad | 🔴 | — | Opcionales vs forzados |
| A7 | Sistema de pistas | 🔴 | — | Sin pistas vs con pistas |

---

## 🌱 MARCO 6 · Generación Procedural

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| G1 | Ingreso de semilla | 🟢 | Manual + aleatoria + Enter | v0.4 |
| G2 | Compartir semillas | 🟢 | Sí | Texto copiable |
| G3 | Determinismo | 🟢 | 100% determinista | FNV-1a + Mulberry32 |
| G4 | Variedad de mundos | 🟢 | Alta | Biomas + posición aleatoria |
| G5 | Puntos de interés garantizados | 🧪 | Llave en zona +2 | Regla fija para test |
| G6 | Fallback si falla generación | 🟢 | Reintento con `@retry` (10 intentos) | Semilla derivada |
| G7 | Velocidad de generación | 🟢 | Instantánea (<50ms) | Por zona |
| G8 | Versionado del generador | ⏸️ | No | Fase futura |
| G9 | Validación de transitabilidad | 🟢 | BFS desde borde oeste a borde este | v0.3 |
| G10 | RNG por capa | 🟡 | Terreno e ítems separados | v0.4 |
| G11 | Ítems generados por semilla | 🟢 | 0 a 3 por chunk, solo en celdas transitables | v0.4 |
| G12 | **Estructuras estáticas (Forma A)** | 🟢 | **Plantillas de emojis pintadas en el mapa** | **v1.1: ver MARCO 9** |

---

## 🏛️ MARCO 7 · Estructuras Estáticas (Forma A)

**Concepto:** las estructuras se "pintan" directamente sobre la matriz del mapa como plantillas de strings. Son **estáticas** (no se mueven). Se destruyen tile por tile.

**Diferencia con entidades móviles:** los enemigos y el jugador son 1×1 y "viven" en la matriz. Las estructuras ocupan N×M celdas y **no se mueven**.

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| S1 | Método de pintado | 🟢 | Forma A (plantillas de strings) | v1.1 |
| S2 | Tamaño mínimo | 🟢 | 3×3 | Ej: casa chica |
| S3 | Tamaño máximo | 🟢 | 10×10 | Ej: templo grande |
| S4 | Colocación | 🧪 | Aleatoria dentro del chunk | v1.1 |
| S5 | Cantidad por chunk | 🧪 | 0-2 según bioma | v1.1 |
| S6 | Validación | 🟢 | Solo sobre tiles transitables (pasto, pradera) | v1.1 |
| S7 | Tiles nuevos requeridos | 🟢 | 🔺 techo, 🔻 cumbrera, 🪟 ventana, ⬛ alfombra, ⛲ fuente, 🕯️ vela, 🛏️ cama, 📦 cofre | v1.1 |
| S8 | Estructuras iniciales | 🧪 | Casa simple, Templo, Campamento, Muelle, Torre | v1.1 |

### Estructuras definidas

**Casa simple:**
```
   🔺
  🔺🔺🔺
 🧱🧱🧱🧱🧱
 🧱⬜⬜⬜🧱
 🧱⬜🚪⬜🧱
 🧱🧱🧱🧱🧱
```

**Templo / ruina antigua:**
```
 🔺🔻🔺🔻🔺
🧱🧱🧱🧱🧱🧱🧱
🧱⬜⬜⬜⬜⬜🧱
🧱⬜⬛⬛⬛⬜🧱
🧱⬜⬛⛲⬛⬜🧱
🧱⬜⬛⬛⬛⬜🧱
🧱🧱🧱🚪🧱🧱🧱
```

**Campamento:**
```
   🔥
 🌳🪨🌳
 🪨⬜🪨
 🌳🪨🌳
```

**Muelle / Puerto:**
```
🌊🌊🌊🌊🌊
🟫🟫🟫🟫🟫
🌊🟫⬜🟫🌊
🌊🟫🚪🟫🌊
🌊🌊🌊🌊🌊
```

**Torre / Puesto de vigilancia:**
```
  🔺🔺🔺
  🔺🔺🔺
 🧱🧱🪟🧱🧱
 🧱⬜⬜⬜🧱
 🧱⬜⬜⬜🧱
 🧱⬜🚪⬜🧱
 🧱🧱🧱🧱🧱
```

---

## 🖥️ MARCO 8 · Interfaz / UX

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| U1 | HUD | 🧪 | Pos + Zona + Inventario | v0.4 |
| U2 | Minimapa | ⏸️ | No | Barra de zonas cumple función parcial |
| U3 | Log de mensajes | 🧪 | Console.log + overlay | Sistema formal → futuro |
| U4 | Estilo de menús | ⏸️ | Overlay simple | Combate por reflejos → MARCO 13 |
| U5 | Sonido/música | ⏸️ | No | Fase muy tardía |
| U6 | Plataforma | 🟢 | Navegador (PC) · Live Server + GitHub Pages | Móvil → futuro lejano |
| U7 | Guardado/carga | ⏸️ | No | Fase futura |
| U8 | Control de semilla en UI | 🟢 | Input + botón Aplicar + botón 🎲 | v0.4 |
| U9 | Barra de zonas respeta límite | 🟢 | Slots fuera de rango en gris | v0.4 |

---

## 🏗️ MARCO 9 · Arquitectura

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| R1 | Un solo archivo vs múltiples | 🟢 | **Múltiples archivos** | v1.0 |
| R2 | Método de carga | 🟢 | `<script src>` clásicos (sin módulos ES) | v1.0 |
| R3 | Requiere servidor HTTP | 🟢 | Sí (Live Server / GitHub Pages) | Obligatorio por CORS |
| R4 | Separación del CSS | 🟢 | `css/estilo.css` | v1.0 |
| R5 | Bloques referenciables | 🟢 | Comentarios `// ═══ BLOQUE N ═══` | v1.0 |
| R6 | Orden de carga | 🟢 | config → tiles → rng → mundo → estructuras → estado → items → chunks → render → jugador → victoria → input → limite → main | v1.1 |
| R7 | Versionado del código | 🟢 | Git + GitHub | v1.0 |
| R8 | Deploy público | 🟢 | GitHub Pages | v1.0 |

---

## 🎨 MARCO 10 · Estilo Visual

| Elemento | Estilo | Referencia |
|----------|--------|------------|
| Fondo general | Oscuro `#0a0a0a` | Minimalista |
| Bordes | Redondeados `border-radius: 8px` | Suaves |
| Tiles | **Emojis 14px en celdas 16×16** | **v1.1: antes 26px/30px** |
| **Glow** | Halos luminosos celestes/rosas | **Muy valorado** |
| Slot actual (barra) | Borde celeste + `box-shadow` glow | `#6cf` |
| Slots visitados | Punto celeste inferior | `#6cf` |
| Slots fuera de rango | Opacidad 0.3, borde tenue | v0.4 |
| Números de zona | Gris chico arriba del slot | `#666` |
| Flechas de dirección | Rosa `#f4a` | Cuando la llave está fuera de rango |
| Transiciones | Overlay negro 85% + fade | 400ms total |
| Fuente | `monospace` | Consistencia retro |
| Input de semilla | Fondo oscuro, glow celeste al focus | v0.4 |
| **Jugador mirando a la izquierda** | **`transform: scaleX(-1)`** | **v1.1** |

**Regla de oro:** los efectos de **glow / borde luminoso** son parte de la identidad visual.

---

## 🧪 MARCO 11 · Sistema de Test (v1.1)

### Lo que hay ahora
- Mundo E-O acotado (±5 chunks por defecto, configurable)
- Biomas con frontera dura (4 tipos)
- Fronteras compartidas entre chunks
- Caché de chunks con precarga de vecinos
- Continuidad física al cruzar (misma fila Y)
- Validación BFS de transitabilidad por chunk
- Muros sólidos 🧱 en los extremos del mundo
- Jugador 🧑 que se mueve con WASD + flechas
- **Jugador con orientación visual (se espeja según dirección)**
- Llave 🔑 escondida en zona +2 al este
- Ítems 🍎 recolectables (0 a 3 por chunk)
- Inventario visible en el HUD
- Control de semilla en UI (input + botones + Enter)
- Barra de zonas con 5 slots, jugador centrado, límite respetado
- Arquitectura modular: 13 archivos `.js` + 1 CSS + index limpio
- Versionado con Git + deploy público en GitHub Pages

### Lo que el test responde
1. ¿Se siente bien el cambio de zona? → ✅ OK
2. ¿El tamaño de la grilla es cómodo? → 🧪 v1.1: 50×34 en validación
3. ¿Caminar al este es entretenido? → ✅ OK
4. ¿Los biomas cambian lo suficiente? → ✅ OK
5. ¿La distancia a la llave es adecuada? → ✅ OK
6. ¿La transición entre chunks es continua? → ✅ OK
7. ¿Los ítems recolectables funcionan? → ✅ OK
8. ¿El límite del mundo se siente natural? → ✅ OK
9. ¿La arquitectura modular es mantenible? → ✅ OK
10. ¿La orientación del jugador aporta? → 🧪 v1.1
11. ¿Las estructuras estáticas mejoran el mundo? → 🧪 v1.1

---

## 🎯 MARCO 12 · Alcance / Producción

| ID | Decisión | Estado | Valor actual |
|:--:|----------|:------:|--------------|
| X1 | Tiempo de dedicación | 🟢 | Iterativo, sin plazo |
| X2 | Propósito | 🟢 | Aprender |
| X3 | Meta | 🟢 | Prototipo → escalable |
| X4 | Equipo | 🟢 | Solo desarrollador |
| X5 | Prioridad #1 | 🟢 | Divertido |

---

## ⚔️ MARCO 13 · Módulo de Combate por Reflejos

> **Módulo independiente en desarrollo paralelo.** No depende del motor de mundo. Se integrará cuando esté listo el Prototipo 3.

### 🎯 Objetivo

Desarrollar un **sistema de combate en primera persona** basado en **reacción visual y timing**, donde el jugador interactúa con un enemigo mediante acciones de **ataque** y **bloqueo** que se resuelven en ventanas de tiempo determinadas.

El sistema está pensado como un **módulo independiente** dentro del proyecto, y se desarrolla por fases: desde prototipos mínimos hasta una mecánica completa con animaciones y enemigos.

### 🧩 Concepto central

El combate se resuelve en una **interfaz radial** (tipo diana de dardos) dividida en **sectores anidados**:

- **Anillo externo:** 6 sectores (3 arriba, 3 abajo) que representan **direcciones de ataque enemigo**. El jugador debe **bloquear** arrastrando el mouse desde el centro hacia el sector correcto.
- **Área central:** zona donde aparecen **puntos débiles** del enemigo. El jugador debe **atacar** haciendo clic/arrastrando hacia ellos.

Cada acción enemiga se comunica visualmente con:
- **Advertencias (TELEGRAPH):** el sector se ilumina con una barra de progreso que se vacía desde el borde externo hacia el centro. Cuando llega al centro, el ataque impacta.
- **Puntos débiles (VULNERABLE):** sectores que parpadean con iluminación en los bordes, indicando dónde atacar.

### ⚙️ Mecánicas principales

| Acción | Input del jugador | Resultado |
|--------|-------------------|-----------|
| **Bloqueo** | Clic sostenido + arrastre desde el centro hacia el sector atacado, **antes** del impacto y **mantenido** durante él. | Bloqueo exitoso o daño recibido. |
| **Ataque** | Clic/arrastre hacia un sector vulnerable. | Daño al enemigo (si acierta) o fallo. |

**Reglas generales:**
- El enemigo tiene **HP propio** y el jugador también.
- Los ataques fallidos o bloqueos mal ejecutados **quitan vida**.
- La **velocidad y dificultad** del enemigo escalan con el progreso.
- El sistema es **infinito o por rondas** (a definir según diseño final).

### 🧠 Arquitectura técnica (planificada)

- **Tecnología base:** HTML + CSS + JavaScript vanilla (sin frameworks).
- **Interfaz radial:** SVG con paths generados matemáticamente (gajos de anillo) para los 6 sectores.
- **Máquina de estados del enemigo:**
  - `IDLE` → espera.
  - `TELEGRAPH` → advertencia con barra de progreso.
  - `ATTACK` → impacto (resolución).
  - `VULNERABLE` → oportunidad de ataque.
  - `HIT` → feedback de daño.
- **Input del jugador:** detección de `mousedown`, `mousemove`, `mouseup` con cálculo de ángulo y sector.
- **Feedback visual:** parpadeos, flashes, barras animadas, carteles de resultado.
- **Extensible a:** sonido (Web Audio API), animaciones del enemigo, efectos de partículas.

### 🧪 Fases de desarrollo

| Fase | Nombre | Estado |
|:----:|--------|:------:|
| 1 | Prototipo 1 · Test de reflejos simple | ✅ Completado |
| 2 | Prototipo 2 · Sectores radiales + arrastre (SVG) | ⏸️ Próximo |
| 3 | Prototipo 3 · Ciclo completo de combate (HP + estados) | ⏸️ Pendiente |
| 4 | Fase final · Integración con el juego principal | ⏸️ Pendiente |

**Prototipo 1 (completado):**
- Cuadrado central que parpadea en rojo (ataque enemigo) o verde (vulnerable).
- El jugador debe apretar clic derecho o izquierdo según corresponda, dentro de una ventana de tiempo.
- HUD con cartel de resultado ("Bloqueaste", "Te pegó", "Atacaste", "Fallaste") y estadísticas.
- **Objetivo:** validar la mecánica de reacción y feedback básico.

**Prototipo 2 (próximo):**
- SVG con 6 sectores anidados.
- Advertencia visual con barra de progreso que se vacía desde el exterior.
- Input por arrastre desde el centro hacia el sector.
- Sin enemigo visual aún (solo mecánica).

### 🎨 Decisiones de diseño tomadas

- Interfaz radial con 6 sectores (3 arriba, 3 abajo).
- Bloqueo por arrastre desde el centro, mantenido durante el impacto.
- Ataque por clic/arrastre hacia sectores vulnerables.
- Feedback inmediato con carteles y cambios de color.
- Sin enemigo visual en las primeras fases.
- Sin frameworks para mantener control total y ligereza.

### 🔮 Extensiones futuras

- Múltiples tipos de enemigos con patrones de ataque distintos.
- Combos y cadenas de bloqueos exitosos.
- Sistema de puntaje y progresión.
- Animaciones detalladas del enemigo.
- Modo multijugador local.
- Efectos de cámara (shake, zoom) en impactos.

### 📌 Estado actual del módulo

**En fase de prototipado.** Se completó el **Prototipo 1** para validar la mecánica central. El siguiente paso es el **Prototipo 2** con sectores radiales en SVG.

---

## 🧩 MARCO 14 · Preguntas Libres

### Lo que NO queremos
- _(pendiente)_

### Inspiraciones
- _(pendiente)_

### Otros
- _(pendiente)_

---

## 🗺️ Roadmap · Próximas iteraciones

### ✅ Completado
- [x] Motor base de generación con semilla
- [x] Mundo E-O por zonas
- [x] Biomas con frontera dura
- [x] Movimiento del jugador
- [x] Barra de zonas con jugador centrado
- [x] Transición entre zonas con overlay
- [x] Objetivo: encontrar la llave
- [x] Fronteras compartidas entre chunks
- [x] Continuidad física al cruzar (misma fila Y)
- [x] Validación BFS de transitabilidad
- [x] Límite configurable de chunks con muros sólidos
- [x] Ítems recolectables (🍎)
- [x] Inventario en HUD
- [x] Carga de semilla dinámica desde UI
- [x] Refactorización completa a múltiples archivos
- [x] CSS separado en `css/estilo.css`
- [x] Documentación README
- [x] Subir el proyecto a GitHub
- [x] Activar GitHub Pages para URL pública
- [x] **Prototipo 1 del módulo de combate (test de reflejos)**

### 🔥 Próximas tareas (urgentes)

| Prioridad | Tarea | Estado | Notas |
|:---------:|-------|:------:|-------|
| 🔥 Alta | Ajustar código a grilla 50×34 y celdas 16px | ⏸️ | v1.1 |
| 🔥 Alta | Implementar orientación del jugador (`scaleX(-1)`) | ⏸️ | v1.1 |
| 🔥 Alta | Implementar estructuras Forma A (BLOQUE 5.5) | ⏸️ | v1.1 |
| 🔥 Alta | Prototipo 2 del módulo de combate (SVG radial) | ⏸️ | En paralelo |
| 🔥 Alta | Agregar 1 tipo de enemigo simple 1×1 | ⏸️ | Después de estructuras |
| 🔥 Alta | Sistema de HP + daño básico | ⏸️ | Necesario para combate |
| 🟡 Media | Integrar módulo de combate con el mapa | ⏸️ | Depende de prototipo 3 |
| 🟡 Media | Más tipos de ítems (🍎, 🌿, 💎) | ⏸️ | Extender sistema actual |
| 🟡 Media | Ítems con efecto (comer manzana → +HP) | ⏸️ | Requiere sistema de HP |
| 🟢 Baja | Sonidos simples | ⏸️ | Feedback al recoger ítem |
| 🟢 Baja | Minimapa completo | ⏸️ | Complementa la barra de zonas |

### 🌟 Ideas para más adelante
- Múltiples biomas con transición suave
- Clima (lluvia, nieve) que afecta gameplay
- NPCs con diálogos
- Sistema de misiones
- Guardado/carga de partida
- Modo "creativo" con editor de mapas
- Fronteras con obstáculos rompibles
- Sistema de inventario completo
- Movimiento N-S con scroll vertical
- Refactorización a módulos ES (`import`/`export`)
- **Entidades multi-tile (enemigos 2×2, NPCs grandes)** — Fase avanzada

---

## 📝 Changelog

### v1.1 · 2026-10-09
- 🔧 **Grilla cambiada a 50×34** (antes 25×17)
- 🔧 **Tamaño de celda reducido a 16×16 px** (antes 30×30)
- ➕ **Orientación del jugador** con `scaleX(-1)` — mira hacia donde camina
- ➕ **Estructuras estáticas (Forma A)** — plantillas de emojis pintadas en el mapa
- ➕ Nuevo archivo: `js/estructuras.js` (BLOQUE 5.5)
- ➕ Tiles nuevos: 🔺 techo, 🔻 cumbrera, 🪟 ventana, ⬛ alfombra, ⛲ fuente, 🕯️ vela, 🛏️ cama, 📦 cofre, 🔥 fogata
- ➕ 5 estructuras iniciales: casa simple, templo, campamento, muelle, torre
- ➕ **Módulo de combate por reflejos** documentado (Prototipo 1 completado)
- 📖 README reorganizado: 14 marcos de análisis
- 📌 Decisión de diseño: enemigos chicos 1×1, estructuras grandes Forma A

### v1.0 · 2026-10-09
- ☁️ Proyecto subido a GitHub
- 🌐 GitHub Pages activado
- 📖 README con flujo de trabajo Git documentado
- 🔧 `.gitignore` creado

### v1.0-beta · 2026-10-09
- 🏗️ Refactorización completa a múltiples archivos
- ➕ 13 archivos `.js` + `css/estilo.css`
- ➕ Bloques 12-18 movidos a archivos individuales

### v0.5 · 2026-10-09
- 🏗️ Refactorización parcial (bloques 1-11)
- ➕ 8 archivos `.js` creados
- ⚠️ Requiere Live Server

### v0.4 · 2026-10-09
- ➕ Ítems recolectables (🍎)
- ➕ Inventario en HUD
- ➕ Control de semilla en UI
- ➕ Límite configurable de chunks
- ➕ Muros sólidos en extremos

### v0.3 · 2026-10-09
- ➕ Fronteras compartidas entre chunks
- ➕ Caché de chunks con precarga de vecinos
- ➕ Continuidad física al cruzar
- ➕ Validación BFS de transitabilidad

### v0.2 · 2026-10-09
- ➕ Barra de zonas con 5 slots
- ➕ Jugador centrado en la barra
- ➕ Indicadores de zonas visitadas
- ➕ Flechas direccionales
- 🎨 Glow en slot actual

### v0.1 · 2026-10-09
- ➕ Motor inicial de generación con semilla
- ➕ Mundo E-O por zonas
- ➕ 4 biomas con frontera dura
- ➕ Movimiento WASD + flechas

---

## 🏗️ Índice de bloques y su ubicación

| Bloque | Nombre | Ubicación |
|:------:|--------|-----------|
| 1 | Configuración global | `js/config.js` |
| 2 | Tiles y propiedades | `js/tiles.js` |
| 3 | Hash y PRNG | `js/rng.js` |
| 4 | Fronteras entre chunks | `js/mundo.js` |
| 5 | Generador de pantalla | `js/mundo.js` |
| 5.5 | Estructuras estáticas | `js/estructuras.js` ⏸️ pendiente |
| 6 | Validación de transitabilidad | `js/mundo.js` |
| 7 | Estado global | `js/estado.js` |
| 7.5 | Ítems | `js/items.js` |
| 8 | Carga de pantalla | `js/chunks.js` |
| 9 | Render del mapa | `js/render.js` |
| 10 | Render barra de zonas | `js/render.js` |
| 11 | HUD | `js/render.js` |
| 12 | Movimiento y transición | `js/jugador.js` |
| 13 | Victoria | `js/victoria.js` |
| 14 | Input | `js/input.js` |
| 15 | Estilos CSS | `css/estilo.css` |
| 16 | Inicio | `js/main.js` |
| 17 | Reinicio con nueva semilla | `js/main.js` |
| 18 | Configuración de límite | `js/limite.js` |

---

## 🔄 Cómo actualizar este README

**Regla de oro:** el README es la **fuente de verdad** del proyecto.

### Al agregar una feature nueva:
1. Cambiar el estado en la tabla correspondiente
2. Agregar entrada al changelog
3. Marcar la tarea como completada en el roadmap

### Al tomar una decisión de diseño:
1. Buscar el ID correspondiente
2. Cambiar de 🟡/🔴 a 🟢
3. Anotar brevemente en "Notas"

### Al cambiar de versión:
1. Bump en el encabezado (`v1.1` → `v1.2`)
2. Agregar entrada en el changelog
3. Actualizar la fecha

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
| RNG por capa | Cada sistema usa su propio `@sufijo` |
| Comentarios | Secciones con `// ═══` separadores |
| Bloques del código | Referenciar por número (`BLOQUE 7.5`) |
| Archivos `.js` | Un archivo por responsabilidad |
| Orden de carga | Respetar dependencias |

---

## ⚠️ Notas importantes de arquitectura

- **Live Server obligatorio**: por CORS, no funciona abrir `index.html` con doble clic.
- **Recarga forzada**: usar **Ctrl+Shift+R** cuando se modifican archivos `.js` o `.css`.
- **Orden de `<script src>`**: cambiar el orden rompe las dependencias.
- **RNG separado por capa**: `@zona` para terreno, `@items` para ítems, `@llave` para la llave, `@estructuras` para estructuras.
- **GitHub Pages tarda ~30-60s** en actualizarse tras un `git push`.

---

## 📞 Notas finales

- Este README se actualiza **cada vez que se agrega o cambia algo relevante**.
- Las decisiones 🧪 pueden cambiar. Las decisiones 🟢 se mantienen salvo razón fuerte.
- Los IDs (M1, J1, R1, S1, etc.) **no cambian** aunque se modifiquen las decisiones.
- Los bloques del código (BLOQUE 1 a 18) son referenciables para modificaciones puntuales.

---

**Fin del README · Última revisión: 2026-10-09**
