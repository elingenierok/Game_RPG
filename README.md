# 🎮 Game_RPG · Proyecto Roguelike Procedural

> Motor de mundo procedural con semilla, exploración acotada E-O por zonas,
> fronteras compartidas entre chunks, ítems recolectables, mobs con sistema
> de datos escalable, y módulo de combate por reflejos en desarrollo paralelo.

---

## 📌 Estado actual del proyecto

| Campo | Valor |
|-------|-------|
| **Versión actual** | v1.4 · Arquitectura reorganizada en subcarpetas |
| **Última actualización** | 2026-10-11 |
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
- Mobs con IA, actitudes y loot
- Sistema de combate por reflejos
- Estructuras estáticas (casas, edificios, ruinas)
- Objetos recolectables e inventario funcional
- Misiones y acertijos
- Múltiples pantallas/menús

**Frase guía:** *"Si el test se siente entretenido, agrego complejidad."*

---

## 🚀 Cómo ejecutar

### Opción A · Desarrollo local (Live Server)

1. Abrir VS Code en `C:\Users\Usuario\Game_RPG`
2. Click derecho en `index.html` → **Open with Live Server**
3. Editar cualquier archivo y guardar (Ctrl+S) → Live Server recarga solo

**⚠️ Importante:** por la arquitectura de múltiples archivos, **abrir el `index.html` con doble clic no funciona** (CORS bloquea la carga de `.js` desde `file://`). **Siempre usar Live Server.**

### Opción B · Versión pública (GitHub Pages)

**👉 [https://elingenierok.github.io/Game_RPG/](https://elingenierok.github.io/Game_RPG/)**

Se actualiza automáticamente al hacer `git push`.

### Controles

- **WASD** o **flechas direccionales** para moverte
- Enter en el input de semilla → aplicar
- Botón 🎲 → semilla aleatoria
- Chocar con 🐅 → batalla simulada

**⚠️ Recarga forzada:** usar **Ctrl+Shift+R** al modificar `.js` o `.css`.

---

## 📁 Estructura del proyecto

```
Game_RPG/
├── index.html                    ← Solo HTML (estructura + <script src>)
├── README.md                     ← Este documento
├── .gitignore                    ← Archivos ignorados por Git
├── css/
│   └── estilo.css                ← Todo el CSS del juego
└── js/
    ├── main.js                   ← Entry point (arranque + reinicio)
    │
    ├── core/                     ← Base del motor
    │   ├── config.js             ← BLOQUE 1: constantes globales
    │   ├── rng.js                ← BLOQUE 3: hash, PRNG, randInt
    │   ├── tiles.js              ← BLOQUE 2: tiles, iconos, bloqueantes
    │   ├── estado.js             ← BLOQUE 7: estado global
    │   └── input.js              ← BLOQUE 14: listeners de teclado
    │
    ├── world/                    ← Generación y gestión del mundo
    │   ├── mundo.js              ← BLOQUES 4, 5, 6: generación de chunks
    │   ├── chunks.js             ← BLOQUE 8: caché y carga de pantalla
    │   └── limite.js             ← BLOQUE 18: config de límite de chunks
    │
    ├── entities/                 ← Todo lo que "vive" en el mundo
    │   ├── jugador.js            ← BLOQUE 12: movimiento y transición
    │   ├── mobs.js               ← BLOQUE 7.7: plantilla + datos de mobs
    │   ├── enemigos.js           ← BLOQUE 7.8: spawn, colisión, derrota
    │   └── items.js              ← BLOQUE 7.5: ítems y recolección
    │
    ├── ui/                       ← Render visual y pantallas
    │   ├── render.js             ← BLOQUES 9, 10, 11: render y HUD
    │   └── victoria.js           ← BLOQUES 13, 13.5: victoria + batalla
    │
    └── systems/                  ← Sistemas transversales (futuro)
        └── (vacía)               ← Combate, inventario, guardado, etc.
```

**Orden de carga en `index.html` (importante respetar):**
```
config → tiles → rng → mundo → estado → items → mobs → enemigos
→ chunks → render → jugador → victoria → input → limite → main
```

**Dependencias críticas:**
- `mobs.js` **antes** de `enemigos.js` (los datos son usados por la lógica).
- `estado.js` **antes** de `items.js`, `mobs.js`, `enemigos.js`.
- `render.js` **después** de todo lo que produce datos a renderizar.

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
| M4 | Tamaño del chunk | 🟢 | 50×34 (pantalla completa) | v1.1 |
| M5 | Memoria de cambios del jugador | ⏸️ | Sin memoria | Fase futura |
| M6 | Evolución temporal del mundo | ⏸️ | No | Fase futura |
| M7 | Ventana visible | 🟢 | 50×34 tiles | v1.1 |
| M8 | Comportamiento en bordes | 🟢 | Límite sólido N-S · Cambio de zona E-O | Con pausa de transición |
| M9 | Fronteras entre chunks | 🟢 | Columna compartida 100% transitable | v0.3 |
| M10 | Continuidad del jugador al cruzar | 🟢 | Preserva la fila Y | v0.3 |
| M11 | Caché de chunks | 🟢 | Actual + 2 vecinos | v0.3 |
| M12 | Límite de chunks | 🟢 | ±5 por defecto, configurable | v0.4 |
| M13 | Muros sólidos en extremos | 🟢 | Columna de 🧱 en zonas -N y +N | v0.4 |
| M14 | Tamaño de celda | 🟢 | 16×16 px | v1.1 |
| M15 | Centralización de tamaño | 🟢 | Todo derivado de `config.js` | v1.1: cambiar `ANCHO_PANTALLA` ajusta todo |

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
| J8 | Pantallas/menús | 🧪 | Mapa + overlay de batalla | v1.2 |
| J9 | Cambio entre pantallas | 🧪 | Overlay simple | FSM cuando crezca |
| J10 | Diálogos con NPCs | ⏸️ | No | Fase futura |

---

## 🧑 MARCO 3 · Personaje / Jugador

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| P1 | Cantidad de personajes | 🟢 | 1 | Sin clases por ahora |
| P2 | Estadísticas | ⏸️ | Ninguna | HP, ataque, defensa → fase futura |
| P3 | Controles | 🟢 | WASD + flechas | Estándar |
| P4 | Inventario | 🧪 | Contador de ítems | Solo cuenta, sin uso aún |
| P5 | Tipos de objetos | 🧪 | 🍎 Manzana | Solo uno de prueba |
| P6 | Habilidades especiales | ⏸️ | Ninguna | Nadar, trepar, romper → fase futura |
| P7 | Modificar el mundo | ⏸️ | No | Talar, romper → fase futura |
| P8 | Necesidades (hambre/sed) | ⏸️ | No | Fase futura |
| P9 | Orientación visual del jugador | 🟢 | Espejado horizontal (`scaleX(-1)`) | v1.1: `dx > 0` → espejado |

---

## ⚔️ MARCO 4 · Mobs y Combate

### Sistema de mobs (v1.2)

Cada mob es un **objeto de datos** con una estructura común. El motor de spawn/render/colisión lee esos datos y actúa. Agregar un mob nuevo = escribir datos, no código.

**Estructura de un mob:**
```
{
  id, nombre, emoji,
  hp, ataque, defensa, velocidadAtaque,
  spawn:    { porChunk, porMapa, biomas, tipoAparicion, forzarEnEstructura, nivelMinimoJugador },
  actitud:  { base, seVuelveAgresivoSi, seVuelveNeutralSi },
  movilidad:{ tipo, velocidad, rangoPatrulla },
  deteccion:{ distancia, persecucion, alejamiento, requiereVision, afectadoPorArbustos },
  colision: { alChocar, requiereInteraccion },
  eliminacion: { seEliminaSi, reaparece, tiempoRespawn },
  loot:     { dropea, probabilidad, objetos, xp },
}
```

**⚠️ Muchos campos no se usan todavía.** Están definidos para escalar sin reescribir.

### Mobs implementados (v1.2)

| Mob | Emoji | Actitud | Spawn por chunk | Biomas | Al chocar |
|-----|:-----:|---------|:---------------:|--------|-----------|
| Tigre | 🐅 | Agresivo | 0-2 | Bosque, Ruina | ⚔️ Batalla |
| Gallina | 🐓 | Pasivo | 0-2 | Pradera | Nada (bloquea) |
| Cerdo | 🐖 | Neutral | 0-2 | Pradera, Costa | Nada (bloquea) |

**Todos estáticos por ahora.** IA de movimiento, loot y XP → fase futura.

### Estados usados vs ignorados

| Campo | Estado actual |
|-------|:-------------:|
| `emoji`, `spawn.porChunk`, `spawn.biomas`, `colision.alChocar` | ✅ Usado |
| `hp`, `ataque`, `defensa` | 🧪 Mostrado en overlay de batalla |
| `actitud`, `movilidad`, `deteccion` | ⏸️ Ignorado |
| `loot`, `eliminacion` (parcial) | ⏸️ Ignorado |

### Decisiones de diseño

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| E1 | Tipos de mobs | 🧪 | 3 (🐅 🐓 🐖) | Escalable con nueva plantilla |
| E2 | Movimiento de mobs | ⏸️ | Fijo | IA → fase futura |
| E3 | Detección del jugador | ⏸️ | No | Fase futura |
| E4 | Entrada al combate | 🧪 | Al chocar + mob agresivo | Overlay simulado |
| E5 | Tipo de combate | 🟢 | Combate por reflejos | Ver MARCO 13 |
| E6 | Huida del combate | ⏸️ | No | Fase futura |
| E7 | Loot y XP | ⏸️ | No | Campos definidos en datos |
| E8 | Combate grupal (1vN) | ⏸️ | No | Fase avanzada |
| E9 | Jefes (bosses) | ⏸️ | No | Cuando el sistema base esté listo |
| E10 | Tamaño de enemigos | 🟢 | 1×1 (emoji simple) | v1.1 |
| E11 | **Separación de semillas** | 🟢 | **`SEMILLA` (mundo) + `SEMILLA_MOBS` (mobs)** | **v1.2: ver MARCO 15** |

---

## 🌱 MARCO 5 · Generación Procedural

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| G1 | Ingreso de semilla (mundo) | 🟢 | Manual + aleatoria + Enter | v0.4 |
| G2 | Compartir semillas | 🟢 | Sí | Texto copiable |
| G3 | Determinismo del mundo | 🟢 | 100% determinista | FNV-1a + Mulberry32 |
| G4 | Variedad de mundos | 🟢 | Alta | Biomas + posición aleatoria |
| G5 | Puntos de interés garantizados | 🧪 | Llave en zona +2 | Regla fija para test |
| G6 | Fallback si falla generación | 🟢 | Reintento con `@retry` (10 intentos) | Semilla derivada |
| G7 | Velocidad de generación | 🟢 | Instantánea (<50ms) | Por zona |
| G8 | Versionado del generador | ⏸️ | No | Fase futura |
| G9 | Validación de transitabilidad | 🟢 | BFS desde borde oeste a borde este | v0.3 |
| G10 | RNG por sistema | 🟢 | 3 capas: `@zona`, `@items`, `@mobs` | v1.3 |
| G11 | Ítems generados por semilla | 🟢 | 0 a 3 por chunk, solo en celdas transitables | v0.4 |
| G12 | Mobs generados por semilla separada | 🟢 | 0-2 por tipo, según bioma | v1.2 |
| G13 | **Semillas independientes** | 🟢 | **`SEMILLA` (mundo) · `SEMILLA_MOBS` (Date.now) · `SEMILLA_OBJETOS` (=SEMILLA)** | **v1.3** |

---

## 🖥️ MARCO 6 · Interfaz / UX

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| U1 | HUD | 🧪 | Pos + Zona + Inventario | v0.4 |
| U2 | Minimapa | ⏸️ | No | Barra de zonas cumple función parcial |
| U3 | Log de mensajes | 🧪 | Console.log + overlay | Sistema formal → futuro |
| U4 | Estilo de menús | 🧪 | Overlay simple + overlay de batalla | v1.2 |
| U5 | Sonido/música | ⏸️ | No | Fase muy tardía |
| U6 | Plataforma | 🟢 | Navegador (PC) · Live Server + GitHub Pages | Móvil → futuro lejano |
| U7 | Guardado/carga | ⏸️ | No | Fase futura |
| U8 | Control de semilla en UI | 🟢 | Input + botón Aplicar + botón 🎲 | v0.4 |
| U9 | Barra de zonas respeta límite | 🟢 | Slots fuera de rango en gris | v0.4 |

---

## 🏗️ MARCO 7 · Arquitectura

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| R1 | Un solo archivo vs múltiples | 🟢 | Múltiples archivos | v1.0 |
| R2 | Método de carga | 🟢 | `<script src>` clásicos (sin módulos ES) | v1.0 |
| R3 | Requiere servidor HTTP | 🟢 | Sí (Live Server / GitHub Pages) | Obligatorio por CORS |
| R4 | Separación del CSS | 🟢 | `css/estilo.css` | v1.0 |
| R5 | Bloques referenciables | 🟢 | Comentarios `// ═══ BLOQUE N ═══` | v1.0 |
| R6 | Orden de carga | 🟢 | config → tiles → rng → mundo → estado → items → mobs → enemigos → chunks → render → jugador → victoria → input → limite → main | v1.2 |
| R7 | Versionado del código | 🟢 | Git + GitHub | v1.0 |
| R8 | Deploy público | 🟢 | GitHub Pages | v1.0 |
| R9 | Centralización de tamaño | 🟢 | Todo derivado de `config.js` | v1.1 |
| R10 | RNG separado por sistema | 🟢 | 3 capas: `@zona`, `@items`, `@mobs` | v1.2 |
| R11 | **Semillas independientes en config** | 🟢 | **`SEMILLA`, `SEMILLA_MOBS`, `SEMILLA_OBJETOS` en `config.js`** | **v1.3** |

---

## 🎨 MARCO 8 · Estilo Visual

| Elemento | Estilo | Referencia |
|----------|--------|------------|
| Fondo general | Oscuro `#0a0a0a` | Minimalista |
| Bordes | Redondeados `border-radius: 8px` | Suaves |
| Tiles | Emojis 14px en celdas 16×16 | v1.1 |
| **Glow** | Halos luminosos celestes/rosas | **Muy valorado** |
| Slot actual (barra) | Borde celeste + `box-shadow` glow | `#6cf` |
| Slots visitados | Punto celeste inferior | `#6cf` |
| Slots fuera de rango | Opacidad 0.3, borde tenue | v0.4 |
| Números de zona | Gris chico arriba del slot | `#666` |
| Flechas de dirección | Rosa `#f4a` | Cuando la llave está fuera de rango |
| Transiciones | Overlay negro 85% + fade | 400ms total |
| Fuente | `monospace` | Consistencia retro |
| Input de semilla | Fondo oscuro, glow celeste al focus | v0.4 |
| Jugador mirando a la izquierda | `transform: scaleX(-1)` | v1.1 |
| Overlay de batalla | Mismo overlay, con botón Continuar glow | v1.2 |

**Regla de oro:** los efectos de **glow / borde luminoso** son parte de la identidad visual.

---

## 🧪 MARCO 9 · Sistema de Test (v1.2)

### Lo que hay ahora
- Mundo E-O acotado (±5 chunks por defecto, configurable)
- Biomas con frontera dura (4 tipos)
- Fronteras compartidas entre chunks
- Caché de chunks con precarga de vecinos
- Continuidad física al cruzar (misma fila Y)
- Validación BFS de transitabilidad por chunk
- Muros sólidos 🧱 en los extremos del mundo
- Jugador 🧑 que se mueve con WASD + flechas
- **Jugador con orientación visual** (`scaleX(-1)`)
- Llave 🔑 escondida en zona +2 al este
- Ítems 🍎 recolectables (0 a 3 por chunk)
- Inventario visible en el HUD
- Control de semilla en UI (input + botones + Enter)
- Barra de zonas con 5 slots, jugador centrado, límite respetado
- **3 mobs (🐅 🐓 🐖) con sistema de datos escalable**
- **Batalla simulada** al chocar con mobs agresivos
- Arquitectura modular: 15 archivos `.js` + 1 CSS + index limpio
- Versionado con Git + deploy público en GitHub Pages
- **Tamaño de grilla centralizado** en `config.js`

### Lo que el test responde
1. ¿Se siente bien el cambio de zona? → ✅ OK
2. ¿El tamaño de la grilla (50×34) es cómodo? → ✅ OK
3. ¿Caminar al este es entretenido? → ✅ OK
4. ¿Los biomas cambian lo suficiente? → ✅ OK
5. ¿La distancia a la llave es adecuada? → ✅ OK
6. ¿La transición entre chunks es continua? → ✅ OK
7. ¿Los ítems recolectables funcionan? → ✅ OK
8. ¿El límite del mundo se siente natural? → ✅ OK
9. ¿La arquitectura modular es mantenible? → ✅ OK
10. ¿La orientación del jugador aporta? → ✅ OK
11. ¿Los mobs en el mapa funcionan? → ✅ OK
12. ¿La batalla simulada aporta? → ✅ OK

**Conclusión:** el test supera validaciones. Sistema de mobs listo para escalar.

---

## 🎯 MARCO 10 · Alcance / Producción

| ID | Decisión | Estado | Valor actual |
|:--:|----------|:------:|--------------|
| X1 | Tiempo de dedicación | 🟢 | Iterativo, sin plazo |
| X2 | Propósito | 🟢 | Aprender |
| X3 | Meta | 🟢 | Prototipo → escalable |
| X4 | Equipo | 🟢 | Solo desarrollador |
| X5 | Prioridad #1 | 🟢 | Divertido |

---

## ⚔️ MARCO 11 · Módulo de Combate por Reflejos

> **Módulo independiente en desarrollo paralelo.** Se integrará al juego cuando esté listo el Prototipo 3.

### 🎯 Objetivo

Sistema de combate en primera persona basado en **reacción visual y timing**, donde el jugador interactúa con un enemigo mediante **ataque** y **bloqueo** en ventanas de tiempo determinadas.

### 🧩 Concepto central

Interfaz radial (tipo diana de dardos) con **sectores anidados**:

- **Anillo externo:** 6 sectores (3 arriba, 3 abajo) con direcciones de ataque enemigo. El jugador **bloquea** arrastrando el mouse desde el centro hacia el sector correcto.
- **Área central:** zona donde aparecen puntos débiles del enemigo. El jugador **ataca** haciendo clic/arrastrando hacia ellos.

Cada acción enemiga se comunica con:
- **TELEGRAPH:** el sector se ilumina con barra de progreso que se vacía. Al llegar al centro, impacta.
- **VULNERABLE:** sectores que parpadean, indicando dónde atacar.

### ⚙️ Mecánicas

| Acción | Input | Resultado |
|--------|-------|-----------|
| **Bloqueo** | Clic sostenido + arrastre del centro al sector, **antes** del impacto y **mantenido** durante él | Bloqueo o daño |
| **Ataque** | Clic/arrastre hacia sector vulnerable | Daño al enemigo o fallo |

**Reglas:** HP para ambos. Ataques fallidos quitan vida. Dificultad escala con progreso.

### 🧠 Arquitectura

- **Base:** HTML + CSS + JS vanilla, sin frameworks.
- **Interfaz radial:** SVG con paths matemáticos.
- **Máquina de estados:** `IDLE` → `TELEGRAPH` → `ATTACK` → `VULNERABLE` → `HIT`.
- **Input:** `mousedown`, `mousemove`, `mouseup` con cálculo de ángulo/sector.
- **Extensible a:** sonido (Web Audio API), animaciones, partículas.

### 🧪 Fases

| Fase | Nombre | Estado |
|:----:|--------|:------:|
| 1 | Prototipo 1 · Test de reflejos simple | ✅ Completado |
| 2 | Prototipo 2 · Sectores radiales + arrastre (SVG) | ⏸️ Próximo |
| 3 | Prototipo 3 · Ciclo completo de combate (HP + estados) | ⏸️ Pendiente |
| 4 | Fase final · Integración con el juego principal | ⏸️ Pendiente |

**Prototipo 1 (completado):** cuadrado central que parpadea rojo (ataque) o verde (vulnerable). Input por clic derecho/izquierdo dentro de ventana de tiempo. HUD con cartel de resultado.

**Prototipo 2 (próximo):** SVG con 6 sectores. Advertencia visual con barra de progreso. Input por arrastre del centro al sector. Sin enemigo visual aún.

---

## 🧩 MARCO 12 · Preguntas Libres

### Lo que NO queremos
- _(pendiente)_

### Inspiraciones
- _(pendiente)_

### Otros
- _(pendiente)_

---

## 🔮 MARCO 13 · Análisis Futuros (Backlog)

Ideas en evaluación. **No están priorizadas ni implementadas.** Se anotan para no perderlas.

### 🌗 F1 · Ciclo día-noche

**Idea:** visión variable según momento del día.

- **Día:** todas las celdas visibles.
- **Noche:** visión limitada a ~5 celdas de radio, salvo iluminación artificial (farolas, fogatas, antorchas).
- **Implementación:** celdas lejanas "apagadas" (opacidad reducida o no renderizadas).

**Preguntas pendientes:**
- ¿Duración del ciclo? ¿Turnos? ¿Tiempo real? ¿Fijo?
- ¿Afecta gameplay (enemigos más agresivos de noche, eventos)?
- Fuentes de luz: ¿ítems portables? ¿estructuras fijas? ¿ambas?

---

### 🚶 F2 · Movimiento amortiguado entre celdas (Modelo 2 · Pokémon)

**Idea:** el jugador se mueve **casilla a casilla**, pero con una **animación visual suave** entre una y la siguiente. La lógica de grilla queda intacta.

**Diferencia con Modelo 1 (actual):**

| Modelo | Comportamiento |
|--------|----------------|
| **1 · Actual** | El jugador salta de casilla en casilla **instantáneamente** |
| **2 · Pokémon** | El jugador se **desliza** de casilla a casilla en ~120-150ms |
| **3 · Zelda** | El jugador se mueve libremente por píxeles (no viable sin reescribir) |

**Concepto clave:** el jugador **nunca está entre casillas lógicamente**. Solo **visualmente** durante la animación. Al terminar la animación, está en la nueva casilla. La lógica, colisión, turnos, todo sigue igual.

**Lo que NO cambia:**
- Colisión con mobs y terreno.
- Transición entre zonas (E-O).
- Recoger ítems.
- Batalla.
- IA de mobs.
- Estado del jugador.

**Lo que SÍ cambia:**
- El jugador deja de ser una **celda de la grilla** y pasa a ser un **elemento superpuesto** (`position: absolute` + `transform: translate`).
- Nuevo flag de estado: `animando` (bloquea input durante la animación).
- Nueva posición visual del jugador en píxeles: `(vx, vy)`.

**Archivos afectados:**
- `js/jugador.js` — lógica de animación, bloqueo de input.
- `js/render.js` — superponer jugador con `position: absolute`.
- `js/input.js` — ignorar teclas si `animando === true`.
- `css/estilo.css` — estilos del jugador como elemento superpuesto.
- `index.html` — agregar un `<div>` para el jugador fuera de la grilla.

**Parámetros de diseño propuestos:**
| Parámetro | Valor propuesto |
|-----------|-----------------|
| Duración de la animación | 120-150 ms |
| Encolar movimientos | No (como Pokémon) |
| Teclas durante animación | Ignoradas |
| Velocidad | Lineal (sin aceleración) |

**Aprendizajes del análisis:**
- Es un **paso intermedio** entre tile-based puro y movimiento libre.
- No requiere reescribir la lógica de grilla.
- Mejora mucho la sensación visual.
- Es compatible con TODO lo que ya tenemos (mobs, ítems, batalla, transiciones).

**Estado:** ⏸️ Anotado con plan detallado. Se implementará **después de** las tareas urgentes actuales (SEMILLA_MOBS, IA básica de mobs, HP real).

### 🗂️ F3 · Sistema de capas del mundo

**Idea:** separar el mundo en **capas independientes**, cada una con su responsabilidad.

| Capa | Contenido |
|:----:|-----------|
| 1 | Terreno base (pasto, agua, arena, árboles) |
| 2 | Objetos estáticos (estructuras, cofres, letreros) |
| 3 | Entidades móviles (jugador, mobs, NPCs) |
| 4 | Iluminación / visión |
| 5 | Clima / ambiental (lluvia, nieve, niebla) |
| 6 | Efectos especiales (visión infrarroja, detección mágica) |

**Ventajas:**
- Encender/apagar capas sin reescribir código.
- Cada capa tiene su lógica propia.
- Ejemplo: capa de luces detecta noche + objeto iluminable → activa luz.
- Fácil agregar capas nuevas (infrarrojo, rastreo, magia).

**Preguntas pendientes:**
- ¿Cómo se renderiza? ¿Canvas múltiple? ¿Grilla por capa?
- ¿Puede una capa leer otra?
- Impacto en performance con muchas capas activas.

---

### 🎲 F4 · Semillas independientes por sistema · ✅ IMPLEMENTADO en v1.3

**Estado:** implementado. Ver `SEMILLA_MOBS` en `js/config.js`.

| Sistema | Semilla | ¿Editable? |
|---------|---------|:----------:|
| Mundo (terreno, biomas, estructuras) | `SEMILLA` | ✅ Sí, la que ya existe |
| Mobs | `SEMILLA_MOBS` | ⏸️ Automática (`Date.now()`) |
| Objetos | `SEMILLA_OBJETOS` | ⏸️ Ligada a `SEMILLA` por ahora |

**Comportamiento actual:**
- Dos jugadores con la misma `SEMILLA` **comparten el mundo** (terreno, biomas, estructuras, ítems).
- Cada uno tiene **mobs distintos** en cada partida (porque `SEMILLA_MOBS` usa `Date.now()`).
- Al cambiar de mundo (input de semilla), `SEMILLA_MOBS` se regenera.

**Pendiente futuro:**
- Permitir que `SEMILLA_MOBS` sea editable por el jugador (campo en la UI).
- Decidir si `SEMILLA_OBJETOS` también pasa a `Date.now()`.

---

### 📌 F5 · Spawn forzado por bioma o estructura

**Idea:** permitir forzar la aparición de un mob en un lugar específico.

**Ejemplos:**
- Un 🐉 dragón que aparece **solo en ruinas** y **solo una vez** por mundo.
- Un 🐟 pez que aparece **solo en agua** y **solo de noche**.
- Un 👻 fantasma que aparece **solo dentro de una estructura "castillo"**.

**Campos ya definidos en la plantilla:**
- `spawn.forzarEnEstructura` → ej: `"cueva"`, `"castillo"`.
- `spawn.tipoAparicion` → `"diurna"`, `"nocturna"`, `"ambos"`.
- `spawn.porMapa` → máximo global.

**Falta:**
- Lógica de detección de estructura.
- Control de "veces que puede aparecer en el mundo".
- Condiciones especiales (nivel del jugador, hora, etc.).

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
- [x] Refactorización a múltiples archivos
- [x] CSS separado en `css/estilo.css`
- [x] Documentación README
- [x] Subir el proyecto a GitHub
- [x] Activar GitHub Pages para URL pública
- [x] Prototipo 1 del módulo de combate (test de reflejos)
- [x] Grilla 50×34 + celdas 16×16
- [x] Orientación del jugador (`scaleX(-1)`)
- [x] Centralización de tamaño (`config.js`)
- [x] **3 mobs con sistema de datos escalable**
- [x] **Batalla simulada (overlay)**
- [x] **Semillas independientes por sistema (SEMILLA_MOBS)**

### 🔥 Próximas tareas (urgentes)

| Prioridad | Tarea | Estado | Notas |
|:---------:|-------|:------:|-------|
| 🔥 Alta | IA básica de mobs (persecución / huida) | ⏸️ | Probar movimiento |
| 🔥 Alta | IA básica de mobs (persecución / huida) | ⏸️ | Probar movimiento |
| 🔥 Alta | Sistema de HP + daño real | ⏸️ | Reemplaza batalla simulada |
| 🔥 Alta | Prototipo 2 del módulo de combate (SVG radial) | ⏸️ | En paralelo |
| 🟡 Media | Integrar módulo de combate al mapa | ⏸️ | Cuando prototipo 3 esté listo |
| 🟡 Media | Loot y XP de mobs | ⏸️ | Campos ya definidos |
| 🟡 Media | Más tipos de ítems (🌿, 💎) | ⏸️ | Extender sistema actual |
| 🟡 Media | Ítems con efecto (comer manzana → +HP) | ⏸️ | Requiere sistema de HP |
| 🟢 Baja | Estructuras Forma A | ⏸️ | Plantillas de emojis pintadas |
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
- Entidades multi-tile (mobs 2×2, NPCs grandes)
- **Ver MARCO 13 · Análisis Futuros** (F1-F5)

---

## 📝 Changelog

### v1.3 · 2026-10-11
- ➕ **Semillas independientes por sistema** (F4 implementado)
- ➕ `SEMILLA_MOBS` = `Date.now()` → los mobs cambian en cada carga de página
- ➕ `SEMILLA_OBJETOS` = `SEMILLA` (preparada para separar en el futuro)
- 🔧 `js/enemigos.js` ahora usa `SEMILLA_MOBS`
- 🔧 `js/items.js` ahora usa `SEMILLA_OBJETOS`
- 🔧 `reiniciarMundo()` regenera `SEMILLA_MOBS` y `SEMILLA_OBJETOS`
- 📖 Sección F4 del backlog marcada como implementada

### v1.2 · 2026-10-10
- ➕ **Sistema de mobs escalable** (`js/mobs.js`) — plantilla + 3 mobs
- ➕ **Spawn de mobs** (`js/enemigos.js`) — por chunk, según bioma
- ➕ **Batalla simulada** al chocar con mob agresivo (overlay + botón)
- ➕ 3 mobs iniciales: 🐅 Tigre (agresivo), 🐓 Gallina (pasivo), 🐖 Cerdo (neutral)
- ➕ RNG separado para mobs (`@mobs`)
- 🔧 Fix de orientación del jugador (invertido)
- 📖 README reorganizado: 13 marcos + backlog de análisis futuros
- 📌 Anotadas 5 ideas futuras: día-noche, movimiento amortiguado, capas, semillas separadas, spawn forzado

### v1.1 · 2026-10-10
- 🔧 Grilla cambiada a 50×34 (antes 25×17)
- 🔧 Tamaño de celda reducido a 16×16 px (antes 30×30)
- ➕ Orientación del jugador con `scaleX(-1)`
- ➕ **Centralización de tamaño**: todo derivado de `config.js`
- 📌 Anotadas ideas: día-noche, movimiento amortiguado, capas
- 📌 Decisión: enemigos 1×1, estructuras grandes (Forma A) → fase futura

### v1.0 · 2026-10-09
- ☁️ Proyecto subido a GitHub
- 🌐 GitHub Pages activado
- 📖 README con flujo de trabajo Git documentado
- 🔧 `.gitignore` creado
- ➕ Prototipo 1 del módulo de combate

### v1.0-beta · 2026-10-09
- 🏗️ Refactorización completa a múltiples archivos
- ➕ 13 archivos `.js` + `css/estilo.css`
- ➕ Bloques 12-18 movidos a archivos individuales

### v0.5 · 2026-10-09
- 🏗️ Refactorización parcial (bloques 1-11)
- ➕ 8 archivos `.js` creados

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
| 5.5 | Estructuras estáticas (Forma A) | ⏸️ pendiente |
| 6 | Validación de transitabilidad | `js/mundo.js` |
| 7 | Estado global | `js/estado.js` |
| 7.5 | Ítems | `js/items.js` |
| 7.7 | Mobs (plantilla + datos) | `js/mobs.js` |
| 7.7b | **Semillas independientes** | **`js/config.js`** |
| 7.8 | Enemigos (spawn, colisión) | `js/enemigos.js` |
| 8 | Carga de pantalla | `js/chunks.js` |
| 9 | Render del mapa | `js/render.js` |
| 10 | Render barra de zonas | `js/render.js` |
| 11 | HUD | `js/render.js` |
| 12 | Movimiento y transición | `js/jugador.js` |
| 13 | Victoria | `js/victoria.js` |
| 13.5 | Batalla simulada | `js/victoria.js` |
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
1. Bump en el encabezado (`v1.2` → `v1.3`)
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
- **RNG separado por sistema**: `@zona` (terreno), `@items` (ítems), `@mobs` (mobs), `@llave` (llave).
- **GitHub Pages tarda ~30-60s** en actualizarse tras un `git push`.

---

## 📞 Notas finales

- Este README se actualiza **cada vez que se agrega o cambia algo relevante**.
- Las decisiones 🧪 pueden cambiar. Las decisiones 🟢 se mantienen salvo razón fuerte.
- Los IDs (M1, J1, R1, S1, F1, etc.) **no cambian** aunque se modifiquen las decisiones.
- Los bloques del código (BLOQUE 1 a 18) son referenciables para modificaciones puntuales.

---

**Fin del README · Última revisión: 2026-10-10**