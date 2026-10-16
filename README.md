# 🎮 Game_RPG · Proyecto Roguelike Procedural

> Motor de mundo procedural con semilla, mundo 2D circular, cámara fluida,
> chunks compartidos, ítems recolectables, mobs con IA en tiempo real, y
> módulo de combate por reflejos en desarrollo paralelo.

---

## 📌 Estado actual del proyecto

| Campo | Valor |
|-------|-------|
| **Versión actual** | v2.0-alpha · Migración a chunks 2D en progreso |
| **Última actualización** | 2026-10-15 |
| **Estado global** | 🚧 Migración estructural · En desarrollo |
| **Archivo principal** | `index.html` (solo estructura HTML) |
| **Lenguaje** | HTML + CSS + JavaScript (sin dependencias) |
| **Ejecución local** | Live Server en VS Code |
| **Ejecución pública** | [elingenierok.github.io/Game_RPG](https://elingenierok.github.io/Game_RPG/) |
| **Repositorio** | [github.com/elingenierok/Game_RPG](https://github.com/elingenierok/Game_RPG) |
| **Editor** | VS Code |
| **Carpeta raíz** | _(depende del PC: `C:\Users\Usuario\Game_RPG` o similar)_ |

📖 **Documentos complementarios:**
- [CHANGELOG.md](CHANGELOG.md) — Historial completo de versiones
- [BACKLOG.md](BACKLOG.md) — Ideas futuras (F1-F21)

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

1. Abrir VS Code en la carpeta raíz del proyecto
2. Click derecho en `index.html` → **Open with Live Server**
3. Editar cualquier archivo y guardar (Ctrl+S) → Live Server recarga solo

**⚠️ Importante:** por la arquitectura de múltiples archivos, **abrir el `index.html` con doble clic no funciona** (CORS bloquea la carga de `.js` desde `file://`). **Siempre usar Live Server.**

### Opción B · Versión pública (GitHub Pages)

**👉 [https://elingenierok.github.io/Game_RPG/](https://elingenierok.github.io/Game_RPG/)**

Se actualiza automáticamente al hacer `git push`.

### Controles

- **WASD** o **flechas direccionales** para moverte (360°)
- **Botones en pantalla** (abajo a la izquierda)
- Enter en el input de semilla → aplicar
- Botón 🎲 → semilla aleatoria
- Click en el mundo → romper (con objeto equipado) / colocar barco / desembarcar

**⚠️ Recarga forzada:** usar **Ctrl+Shift+R** al modificar `.js` o `.css`.

---

## 📁 Estructura del proyecto

```
Game_RPG/
├── index.html                    ← Solo HTML (estructura + <script src>)
├── README.md                     ← Este documento
├── CHANGELOG.md                  ← Historial de versiones
├── BACKLOG.md                    ← Ideas futuras (F1-F21)
├── chunk-camara.html             ← Prototipo aislado (v1.9)
├── chunks-2d.html                ← Prototipo aislado (v1.9.1)
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
    │   ├── estado.js             ← BLOQUE 7: estado global (coords del mundo)
    │   └── input.js              ← BLOQUE 14: listeners de teclado
    │
    ├── world/                    ← Generación y gestión del mundo
    │   ├── biomas.js             ← BLOQUE 5.1: tabla de biomas (datos)
    │   ├── mundo.js              ← BLOQUES 4, 5, 6: generación de chunks 2D
    │   └── chunks.js             ← BLOQUE 8: caché 2D + inicialización
    │
    ├── entities/                 ← Todo lo que "vive" en el mundo
    │   ├── jugador.js            ← BLOQUE 12: movimiento 360° + recolección
    │   ├── mobs.js               ← BLOQUE 7.7: plantilla + datos de mobs
    │   ├── enemigos.js           ← BLOQUE 7.8: spawn, colisión, derrota
    │   └── items.js              ← BLOQUE 7.5: ítems y equipables
    │
    ├── ui/                       ← Render visual y pantallas
    │   ├── render.js             ← BLOQUES 9, 10, 11: render y HUD
    │   └── victoria.js           ← BLOQUES 13, 13.5: victoria + batalla
    │
    └── systems/                  ← Sistemas transversales
        ├── camara.js             ← BLOQUE 20: cámara fluida (NUEVO en v2.0)
        ├── ia.js                 ← BLOQUE 7.9: IA de mobs en tiempo real
        ├── rotura.js             ← BLOQUE 7.10: sistema de rotura (pendiente migrar)
        └── barco.js              ← BLOQUE 7.11: sistema del barco (pendiente migrar)
```

**Orden de carga en `index.html` (importante respetar):**
```
config → tiles → rng → biomas → mundo → camara → estado → chunks
→ items → mobs → enemigos → render → ia → jugador → victoria → input
→ rotura → barco → main
```

**Criterio de organización en carpetas:**

| Carpeta | Responsabilidad |
|---------|-----------------|
| `core/` | Base del motor sin dependencias: config, RNG, tiles, estado, input |
| `world/` | Generación y gestión del terreno: chunks 2D, biomas |
| `entities/` | Todo lo que "vive" en el mundo: jugador, mobs, ítems |
| `ui/` | Render visual, pantallas y overlays |
| `systems/` | Sistemas transversales: cámara, IA, combate, inventario |

**Dependencias críticas:**
- `mobs.js` **antes** de `enemigos.js` (los datos son usados por la lógica).
- `camara.js` **antes** de `estado.js` (usa funciones de la cámara).
- `estado.js` **antes** de `chunks.js`, `items.js`, `mobs.js`, `enemigos.js`.
- `render.js` **antes** de `ia.js` (la IA llama a `render()`).
- `ia.js` **antes** de `jugador.js` (el jugador usa `pausarTicks()`).

---

## 🔄 Flujo de trabajo con Git

### Branches

| Branch | Uso |
|--------|-----|
| `main` | Trabajo general · versión estable |
| `2d` | Migración a chunks 2D (temporal) |

### Antes de trabajar

```powershell
git branch          # verificar en qué branch estás
git pull            # traer últimos cambios
```

### Después de trabajar

```powershell
git add .
git commit -m "descripción"
git push
```

### Cambiar de branch

```powershell
git checkout 2d     # ir a migración 2D
git checkout main   # volver a main
```

### Clonar el proyecto en otra PC

```powershell
cd $HOME
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
| M1 | Direccionalidad del mundo | 🟢 | **Mundo 2D circular, ±4 chunks en X e Y** | v2.0 |
| M2 | Biomas | 🧪 | 7 tipos: pradera, bosque, costa, ruina, oceano, desierto, nieve | v1.6 |
| M3 | Transición entre biomas | 🟢 | Dura (sin mezcla) | Suavizar es fase futura |
| M4 | Tamaño del chunk | 🟢 | **32×32 celdas (potencia de 2)** | v2.0 |
| M5 | Memoria de cambios del jugador | ⏸️ | Sin memoria | Fase futura |
| M6 | Evolución temporal del mundo | ⏸️ | No | Fase futura |
| M7 | Ventana visible | 🟢 | **25×17 celdas (o 32×24 en pruebas)** | v2.0 |
| M8 | Comportamiento en bordes | 🟢 | **Wrap circular en X e Y (tipo Pac-Man)** | v2.0 |
| M9 | Fronteras entre chunks | 🟡 | Sin fronteras compartidas todavía | Pendiente (Fase 9) |
| M10 | Continuidad del jugador al cruzar | 🟢 | **Cámara fluida · sin saltos** | v2.0 |
| M11 | Caché de chunks | 🟢 | **Map `"cx,cy"` → chunk** | v2.0 |
| M12 | Límite de chunks | 🟢 | **±4 (configurable)** | v2.0 |
| M13 | Muros sólidos en extremos | ⏸️ | No aplica (mundo circular) | v2.0 |
| M14 | Tamaño de celda | 🟢 | **16×16 px** (32×32 en prototipo) | v2.0 |
| M15 | Centralización de tamaño | 🟢 | Todo derivado de `config.js` | v1.1 |
| M16 | Radio de seguridad al cruzar | ⏸️ | No aplica (mundo continuo) | v2.0 |
| M17 | Sistema de biomas por tabla | 🟢 | 7 biomas con vecinos + pesos | v1.6 |
| M18 | Bioma inicial | 🟢 | pradera (chunk 0,0) | v1.6 |
| M19 | Costa con forma de franja | 🟢 | Agua + arena + pasto con bordes irregulares | v1.7.1 |

---

## 🎮 MARCO 2 · Jugabilidad / Core Loop

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| J1 | Objetivo del juego | 🧪 | Encontrar la 🔑 | Test de exploración |
| J2 | Condición de victoria | 🧪 | Pisar la llave | Pantalla de "¡Ganaste!" |
| J3 | Condición de derrota | ⏸️ | No hay | Sin HP todavía |
| J4 | Progresión | ⏸️ | No hay | Fase futura |
| J5 | Muerte definitiva | ⏸️ | No aplica | Fase futura |
| J6 | Turnos vs tiempo real | 🟢 | Tiempo real para mobs | v1.5: ticks cada 400ms |
| J7 | Sistema de iniciativa | ⏸️ | No aplica | Fase futura |
| J8 | Pantallas/menús | 🧪 | Mapa + overlay de batalla | v1.2 |
| J9 | Cambio entre pantallas | 🧪 | Overlay simple | FSM cuando crezca |
| J10 | Diálogos con NPCs | ⏸️ | No | Fase futura |

---

## 🏃‍♂️ MARCO 3 · Personaje / Jugador

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| P1 | Cantidad de personajes | 🟢 | 1 | Sin clases por ahora |
| P2 | Estadísticas | ⏸️ | Ninguna | HP, ataque, defensa → fase futura |
| P3 | Controles | 🟢 | WASD + flechas + botones en pantalla | v2.0 |
| P4 | Inventario | 🧪 | Contador de ítems | Solo cuenta, sin uso aún |
| P5 | Tipos de objetos | 🧪 | 🍎 Manzana + 🪓 ⛏️ 🕯️ 🛶 equipables | v1.9 |
| P6 | Habilidades especiales | ⏸️ | Ninguna | Nadar, trepar, romper → fase futura |
| P7 | Modificar el mundo | 🟢 | Romper árboles, piedras, muros, cactus, hielo | v1.7 |
| P8 | Necesidades (hambre/sed) | ⏸️ | No | Fase futura |
| P9 | Orientación visual del jugador | 🟢 | Espejado horizontal (`scaleX(-1)`) | v1.1 |
| P10 | Movimiento | 🟢 | **360° fluido (200ms por celda)** | v2.0 |

---

## ⚔️ MARCO 4 · Mobs y Combate

### Sistema de mobs

Cada mob es un **objeto de datos** con una estructura común. El motor de spawn/render/colisión/IA lee esos datos y actúa.

**Estructura de un mob:**
```js
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

### Mobs implementados

| Mob | Emoji | Actitud | Spawn por chunk | Biomas | Rango detección | Al chocar |
|-----|:-----:|---------|:---------------:|--------|:---------------:|-----------|
| Tigre | 🐅 | Hostil | 0-2 | Bosque, Ruina | 6 tiles | ⚔️ Batalla |
| Gallina | 🐓 | Pacífico | 0-2 | Pradera | 4 tiles | Nada (bloquea) |
| Cerdo | 🐖 | Neutral | 0-2 | Pradera, Costa | — | Nada (bloquea) |

### Estados de IA

| Estado | Comportamiento | Velocidad |
|--------|----------------|:---------:|
| `DEAMBULANDO` | Movimiento aleatorio por el chunk | 1 tile cada 2 ticks (800ms) |
| `PERSIGUIENDO` | Se mueve hacia el jugador (hostil) | 1 tile por tick (400ms) |
| `HUYENDO` | Se mueve lejos del jugador (pacífico) | 1 tile por tick (400ms) |
| `QUIETO` | No se mueve (neutral) | — |

### Decisiones de diseño

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| E1 | Tipos de mobs | 🧪 | 3 (🐅 🐓 🐖) | Escalable con nueva plantilla |
| E2 | Movimiento de mobs | 🟢 | Tiempo real (ticks cada 400ms) | v1.5 |
| E3 | Detección del jugador | 🟢 | Por distancia Manhattan | v1.5 |
| E4 | Entrada al combate | 🧪 | Choque jugador↔mob o mob persiguiendo | Overlay simulado |
| E5 | Tipo de combate | 🟢 | Combate por reflejos | Ver MARCO 11 |
| E6 | Huida del combate | ⏸️ | No | Fase futura |
| E7 | Loot y XP | ⏸️ | No | Campos definidos en datos |
| E8 | Combate grupal (1vN) | ⏸️ | No | Fase avanzada |
| E9 | Jefes (bosses) | ⏸️ | No | Cuando el sistema base esté listo |
| E10 | Tamaño de enemigos | 🟢 | 1×1 (emoji simple) | v1.1 |
| E11 | Separación de semillas | 🟢 | `SEMILLA` (mundo) + `SEMILLA_MOBS` (mobs) | v1.3 |

---

## 🎒 MARCO 4.5 · Objetos equipables

### Estado actual (v1.9)

- **4 objetos:** 🪓 Hacha, ⛏️ Pico, 🕯️ Linterna, 🛶 Barco.
- **Spawn:** 1 de cada uno por mundo (excepto 🛶 que aparece por chunk de costa). Determinista por semilla.
- **Recolección:** al pisarlos, se suman al inventario del HUD.
- **Slots de equipados:** arriba del mapa, 4 slots siempre visibles.
- **Efecto:** permiten romper árboles, piedras, etc. y navegar con el barco.

### Configuración

| Objeto | Bioma asignado |
|--------|:--------------:|
| 🪓 Hacha | bosque |
| ⛏️ Pico | ruina |
| 🕯️ Linterna | costa |
| 🛶 Barco | costa (por chunk) |

### Sistema de rotura

**Condiciones para romper un tile:**
1. El click debe ser **exactamente sobre** la celda del tile.
2. El jugador debe estar **adyacente** (4 direcciones, sin diagonales).
3. Debe tener el objeto correcto equipado.
4. Si falta objeto: cartel "Necesitás un hacha/pico".

**Tiles rompibles actuales:**

| Tile | Objeto | Duración |
|------|:------:|:--------:|
| 🌳 TREE | 🪓 HACHA | 3.0 s |
| 🌲 PINE | 🪓 HACHA | 3.0 s |
| 🌵 CACTUS | 🪓 HACHA | 2.5 s |
| ⛰️ ROCK | ⛏️ PICO | 3.0 s |
| 🧱 WALL | ⛏️ PICO | 4.0 s |
| 🧊 ICE | ⛏️ PICO | 2.5 s |

**Tile base por bioma (al romper):**

| Bioma | Tile base |
|-------|-----------|
| pradera | 🟩 GRASS |
| bosque | 🟩 GRASS |
| costa | 🟨 SAND |
| ruina | 🟩 GRASS |
| oceano | 🌊 WATER |
| desierto | 🟧 DESERT_SAND |
| nieve | ❄️ SNOW |

### Sistema del barco

- El 🛶 aparece **en cada chunk de costa** (porChunk).
- Aparece **en tierra, pegado a agua, lejos de los bordes**.
- Click sostenido sobre agua adyacente → barra → jugador se sube (🚣).
- Mientras navega, solo puede moverse sobre agua.
- Click sostenido sobre tierra adyacente → barra → jugador se baja.

---

## 🌱 MARCO 5 · Generación Procedural

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| G1 | Ingreso de semilla (mundo) | 🟢 | Manual + aleatoria + Enter | v0.4 |
| G2 | Compartir semillas | 🟢 | Sí | Texto copiable |
| G3 | Determinismo del mundo | 🟢 | 100% determinista | FNV-1a + Mulberry32 |
| G4 | Variedad de mundos | 🟢 | Alta | Biomas + posición aleatoria |
| G5 | Puntos de interés garantizados | 🧪 | Llave en chunk (2, 0) | Regla fija para test |
| G6 | Fallback si falla generación | 🟢 | Reintento con `@retry` (10 intentos) | Semilla derivada |
| G7 | Velocidad de generación | 🟢 | Instantánea (<50ms) | Por chunk |
| G8 | Versionado del generador | ⏸️ | No | Fase futura |
| G9 | Validación de transitabilidad | ⏸️ | No aplica (mundo 2D) | v2.0 |
| G10 | RNG por sistema | 🟢 | 3 capas: `@chunk`, `@items`, `@mobs` | v2.0 |
| G11 | Ítems generados por semilla | 🟢 | 0 a 3 por chunk, solo en celdas transitables | v2.0 |
| G12 | Mobs generados por semilla separada | 🟢 | 0-2 por tipo, según bioma | v2.0 |
| G13 | Semillas independientes | 🟢 | `SEMILLA` · `SEMILLA_MOBS` · `SEMILLA_OBJETOS` | v1.3 |
| G14 | Chunk (0,0) sin mobs | 🟢 | Chunk inicial libre de mobs (zona segura) | v2.0 |
| G15 | Sistema de biomas por JSON | 🟢 | 7 biomas con vecinos permitidos y pesos | v1.6 |
| G16 | Tiles nuevos | 🟢 | 🟧 🌵 ❄️ 🧊 🌲 (desierto y nieve) | v1.6 |
| G17 | Biomas forzados (Pasada 2) | 🟡 | Ciudades, puertos, islas | Planificado · ver F15 |
| G18 | Forma de biomas | 🟢 | Costa usa `forma: "franja"` | v1.7.1 |

---

## 🖥️ MARCO 6 · Interfaz / UX

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| U1 | HUD | 🟢 | Pos + Zona (chunk) + Inventario | v2.0 |
| U2 | Minimapa | ⏸️ | No | Fase futura |
| U3 | Log de mensajes | 🧪 | Console.log + carteles temporales | v1.7 |
| U4 | Estilo de menús | 🧪 | Overlay simple + overlay de batalla | v1.2 |
| U5 | Sonido/música | ⏸️ | No | Fase muy tardía |
| U6 | Plataforma | 🟢 | Navegador (PC) · Live Server + GitHub Pages | Móvil → futuro lejano |
| U7 | Guardado/carga | ⏸️ | No | Fase futura |
| U8 | Control de semilla en UI | 🟢 | Input + botón Aplicar + botón 🎲 | v0.4 |
| U9 | Barra de objetivos | ❌ | **Eliminada** | v2.0 |
| U10 | Botones de movimiento | 🟢 | 4 botones en rombo, click sostenido | v1.6.1 |
| U11 | Slots de equipados | 🟢 | 4 slots arriba del mapa, siempre visibles | v1.9 |
| U12 | Layout 3 columnas | 🟢 | 20% flechas · 60% mapa · 20% panel | v1.6.1 |
| U13 | Barra de stamina | 🟢 | Arriba del mapa, visible solo durante rotura | v1.7 |

---

## 🏗️ MARCO 7 · Arquitectura

| ID | Decisión | Estado | Valor actual | Notas |
|:--:|----------|:------:|--------------|-------|
| R1 | Un solo archivo vs múltiples | 🟢 | Múltiples archivos | v1.0 |
| R2 | Método de carga | 🟢 | `<script src>` clásicos (sin módulos ES) | v1.0 |
| R3 | Requiere servidor HTTP | 🟢 | Sí (Live Server / GitHub Pages) | Obligatorio por CORS |
| R4 | Separación del CSS | 🟢 | `css/estilo.css` | v1.0 |
| R5 | Bloques referenciables | 🟢 | Comentarios `// ═══ BLOQUE N ═══` | v1.0 |
| R6 | Orden de carga | 🟢 | **config → tiles → rng → biomas → mundo → camara → estado → chunks → items → mobs → enemigos → render → ia → jugador → victoria → input → rotura → barco → main** | v2.0 |
| R7 | Versionado del código | 🟢 | Git + GitHub | v1.0 |
| R8 | Deploy público | 🟢 | GitHub Pages | v1.0 |
| R9 | Centralización de tamaño | 🟢 | Todo derivado de `config.js` | v1.1 |
| R10 | RNG separado por sistema | 🟢 | 3 capas: `@chunk`, `@items`, `@mobs` | v2.0 |
| R11 | Semillas independientes en config | 🟢 | `SEMILLA`, `SEMILLA_MOBS`, `SEMILLA_OBJETOS` | v1.3 |
| R12 | Organización en subcarpetas | 🟢 | `core/`, `world/`, `entities/`, `ui/`, `systems/` | v1.4 |
| R13 | IA en `systems/` | 🟢 | `js/systems/ia.js` — tick loop en tiempo real | v1.5 |
| R14 | Tick de IA configurable | 🟢 | `TICK_MS = 400`, `TICK_DEAMBULAR_CADA = 2` | v1.5 |
| R15 | Documentación modular | 🟢 | README + CHANGELOG + BACKLOG | v1.5.1 |
| R16 | Sistema de "forma" para biomas | 🟢 | `forma: "franja"` en `biomas.js` | v1.7.1 |
| R17 | Chunks 2D | 🟢 | **`{cx, cy}` en lugar de `zona` (número)** | **v2.0** |
| R18 | Cámara fluida | 🟢 | **Jugador fijo en el centro, mundo se desplaza** | **v2.0** |

---

## 🎨 MARCO 8 · Estilo Visual

| Elemento | Estilo | Referencia |
|----------|--------|------------|
| Fondo general | Oscuro `#0a0a0a` | Minimalista |
| Bordes | Redondeados `border-radius: 8px` | Suaves |
| Tiles | Emojis en celdas de `TAMANO_CELDA` px | v2.0 |
| **Glow** | Halos luminosos celestes/rosas | **Muy valorado** |
| Slot actual (slots) | Borde celeste + `box-shadow` glow | `#6cf` |
| Slots de equipados con objeto | Borde celeste + glow | v1.6.1 |
| Fuente | `monospace` | Consistencia retro |
| Input de semilla | Fondo oscuro, glow celeste al focus | v0.4 |
| Jugador y mobs mirando a la izquierda | `transform: scaleX(-1)` | v1.1 / v1.5 |
| Overlay de batalla | Mismo overlay, con botón Continuar glow | v1.2 |
| Barra de stamina | Gradiente celeste→verde | v1.7 |

**Regla de oro:** los efectos de **glow / borde luminoso** son parte de la identidad visual.

---

## 🧪 MARCO 9 · Sistema de Test (v2.0-alpha)

### Lo que hay ahora

- **Mundo 2D circular** con chunks de 32×32 celdas
- **Cámara fluida**: jugador fijo en el centro, mundo se desplaza
- **Movimiento 360°** fluido (200ms por celda)
- **Wrap circular** en X e Y (tipo Pac-Man)
- **Chunk (0,0) seguro** (pradera, sin mobs)
- **7 biomas**: pradera, bosque, costa, ruina, oceano, desierto, nieve
- **Sistema de biomas por tabla** (vecinos + pesos)
- **Costa con forma de franja** (agua + arena + pasto)
- **Ítems recolectables** (🍎, 0-3 por chunk)
- **Objetos equipables**: 🪓 hacha, ⛏️ pico, 🕯️ linterna, 🛶 barco
- **Sistema de rotura** (click + barra de stamina)
- **Sistema del barco** (navegar sobre agua)
- **Mobs con IA** en tiempo real (deambular, perseguir, huir)
- **Inventario en HUD** con íconos correctos
- **Control de semilla en UI** (input + botones + Enter)
- **Botones de movimiento** en pantalla (click sostenido)
- Arquitectura modular: 16 archivos `.js` + 1 CSS + index limpio

### Lo que falta (v2.0-alpha)

- **Adaptar `rotura.js`** a coordenadas del mundo
- **Adaptar `barco.js`** a coordenadas del mundo
- **Adaptar `victoria.js`** a la nueva posición de la llave
- **Fronteras compartidas en 2D** (suavizar cortes entre chunks)
- **Limpieza de código muerto** (`renderBarraZonas`, `cambiarZona`, `limite.js`)

### Lo que el test responde (histórico)

1. ¿Se siente bien el cambio de zona? → ✅ (sistema viejo)
2. ¿El tamaño del mundo es cómodo? → ✅ 32×32 chunks
3. ¿Caminar es entretenido? → ✅
4. ¿Los biomas cambian lo suficiente? → ✅
5. ¿Los ítems recolectables funcionan? → ✅
6. ¿La arquitectura modular es mantenible? → ✅
7. ¿La orientación del jugador aporta? → ✅
8. ¿Los mobs en el mapa funcionan? → ✅
9. ¿La IA de mobs aporta? → ✅
10. ¿El radio de seguridad al cruzar evita bugs? → ✅ (sistema viejo)
11. ¿La cámara fluida aporta? → ✅ v2.0
12. ¿El movimiento 360° es cómodo? → ✅ v2.0

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

### 🧪 Fases

| Fase | Nombre | Estado |
|:----:|--------|:------:|
| 1 | Prototipo 1 · Test de reflejos simple | ✅ Completado |
| 2 | Prototipo 2 · Sectores radiales + arrastre (SVG) | ⏸️ Próximo |
| 3 | Prototipo 3 · Ciclo completo de combate (HP + estados) | ⏸️ Pendiente |
| 4 | Fase final · Integración con el juego principal | ⏸️ Pendiente |

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

**Movido a [BACKLOG.md](BACKLOG.md).**

El backlog contiene las **ideas futuras anotadas** (F1-F21):
F1 (día-noche) · F2 (movimiento amortiguado) · F3 (capas) · F4 (semillas separadas ✅) · F5 (spawn forzado) · F6 (pathfinding) · F7 (deambulación realista) · F8 (objetos equipables ✅) · F9 (mouse) · F10 (playa) · F11 (objetos equipables ✅) · F12 (mejor nivel) · F13 (drops alternativos) · F14 (biomas JSON ✅) · F15 (biomas forzados) · F16 (costa ✅) · F17 (biomas con forma) · F18 (barco ✅) · F19 (tema espacio) · F20 (sprites) · F21 (chunks 2D, en progreso)

---

## 🗺️ Roadmap · Próximas iteraciones

### ✅ Completado
- [x] Motor base de generación con semilla
- [x] Mundo E-O por zonas (v1.x, obsoleto)
- [x] Biomas con frontera dura
- [x] Movimiento del jugador
- [x] Barra de zonas (v1.x, obsoleto en v2.0)
- [x] Transición entre zonas con overlay (v1.x, obsoleto en v2.0)
- [x] Objetivo: encontrar la llave
- [x] Fronteras compartidas entre chunks (v1.x, pendiente readaptar a 2D)
- [x] Ítems recolectables
- [x] Inventario en HUD
- [x] Carga de semilla dinámica desde UI
- [x] Refactorización a múltiples archivos
- [x] CSS separado
- [x] Documentación README/CHANGELOG/BACKLOG
- [x] GitHub + Pages
- [x] Prototipo 1 del módulo de combate
- [x] Orientación del jugador
- [x] Centralización de tamaño
- [x] 3 mobs con sistema de datos escalable
- [x] Batalla simulada
- [x] Semillas independientes
- [x] Reorganización en subcarpetas
- [x] IA de mobs en tiempo real
- [x] Radio de seguridad al cruzar (v1.x, obsoleto en v2.0)
- [x] Rediseño del sistema de biomas (F14)
- [x] 7 biomas + 5 tiles nuevos
- [x] Auditor de semillas
- [x] Interfaz lateral completa (F11)
- [x] Botones de movimiento
- [x] Slots de equipados
- [x] HUD con íconos correctos
- [x] Sistema de rotura (F11 fases 3-4)
- [x] Rediseño de costa (F16)
- [x] Barco (F18)
- [x] **Migración a chunks 2D (F21, en progreso)**

### 🔥 Próximas tareas (urgentes)

| Prioridad | Tarea | Estado | Notas |
|:---------:|-------|:------:|-------|
| 🔥 Alta | **Adaptar `rotura.js` a coordenadas del mundo** | ⏸️ | Fase 6 |
| 🔥 Alta | **Adaptar `barco.js` a coordenadas del mundo** | ⏸️ | Fase 6 |
| 🔥 Alta | **Adaptar `victoria.js` a la nueva llave** | ⏸️ | Fase 7 |
| 🔥 Alta | **Fronteras compartidas en 2D** | ⏸️ | Fase 9 |
| 🟡 Media | Limpieza de código muerto | ⏸️ | `renderBarraZonas`, `cambiarZona`, `limite.js` |
| 🟡 Media | Sistema de HP + daño real | ⏸️ | Reemplaza batalla simulada |
| 🟡 Media | Prototipo 2 del módulo de combate | ⏸️ | En paralelo |
| 🟡 Media | Loot y XP de mobs | ⏸️ | Campos ya definidos |
| 🟢 Baja | Más tipos de ítems | ⏸️ | Extender sistema actual |
| 🟢 Baja | Ítems con efecto (comer manzana → +HP) | ⏸️ | Requiere HP |
| 🟢 Baja | Estructuras Forma A | ⏸️ | Plantillas de emojis pintadas |
| 🟢 Baja | Sonidos simples | ⏸️ | Feedback al recoger ítem |

### 🌟 Ideas para más adelante
- Fronteras con obstáculos rompibles
- Sistema de inventario completo
- Refactorización a módulos ES
- Entidades multi-tile (mobs 2×2)
- **Ver [BACKLOG.md](BACKLOG.md)** (F1-F21)

---

## 🏗️ Índice de bloques y su ubicación

| Bloque | Nombre | Ubicación |
|:------:|--------|-----------|
| 1 | Configuración global | `js/core/config.js` |
| 2 | Tiles y propiedades | `js/core/tiles.js` |
| 3 | Hash y PRNG | `js/core/rng.js` |
| 4 | (Eliminado en v2.0 — antes: fronteras 1D) | — |
| 5 | Generador de chunk | `js/world/mundo.js` |
| 5.1 | Biomas (datos) | `js/world/biomas.js` |
| 6 | Validación (simplificada) | `js/world/mundo.js` |
| 7 | Estado global | `js/core/estado.js` |
| 7.5 | Ítems y equipables | `js/entities/items.js` |
| 7.7 | Mobs (plantilla + datos) | `js/entities/mobs.js` |
| 7.8 | Enemigos (spawn, colisión) | `js/entities/enemigos.js` |
| 7.9 | IA de mobs | `js/systems/ia.js` |
| 7.10 | Sistema de rotura | `js/systems/rotura.js` |
| 7.11 | Sistema del barco | `js/systems/barco.js` |
| 8 | Carga e inicialización de chunks | `js/world/chunks.js` |
| 9 | Render del mundo | `js/ui/render.js` |
| 10 | (Eliminado en v2.0 — barra de zonas) | — |
| 11 | HUD | `js/ui/render.js` |
| 12 | Movimiento del jugador | `js/entities/jugador.js` |
| 13 | Victoria | `js/ui/victoria.js` |
| 13.5 | Batalla simulada | `js/ui/victoria.js` |
| 14 | Input | `js/core/input.js` |
| 15 | Estilos CSS | `css/estilo.css` |
| 16 | Inicio | `js/main.js` |
| 17 | Reinicio con nueva semilla | `js/main.js` |
| 18 | (Eliminado en v2.0 — límite de chunks) | — |
| 20 | Cámara fluida | `js/systems/camara.js` |

---

## 🔄 Cómo actualizar este README

**Regla de oro:** el README es la **fuente de verdad** del proyecto.

### Al agregar una feature nueva:
1. Cambiar el estado en la tabla correspondiente
2. Agregar entrada al `CHANGELOG.md`
3. Marcar la tarea como completada en el roadmap

### Al tomar una decisión de diseño:
1. Buscar el ID correspondiente
2. Cambiar de 🟡/🔴 a 🟢
3. Anotar brevemente en "Notas"

### Al anotar una idea futura:
1. Agregar un bloque F<N> en `BACKLOG.md`
2. Actualizar la lista "Contenido actual" al inicio de `BACKLOG.md`

### Al cambiar de versión:
1. Bump en el encabezado (`v2.0-alpha` → `v2.1`)
2. Agregar entrada en `CHANGELOG.md`
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
| RNG por sistema | Cada sistema usa su propio `@sufijo` |
| Comentarios | Secciones con `// ═══` separadores |
| Bloques del código | Referenciar por número (`BLOQUE 7.5`) |
| Archivos `.js` | Un archivo por responsabilidad |
| Orden de carga | Respetar dependencias |

---

## ⚠️ Notas importantes de arquitectura

- **Live Server obligatorio**: por CORS, no funciona abrir `index.html` con doble clic.
- **Recarga forzada**: usar **Ctrl+Shift+R** cuando se modifican archivos `.js` o `.css`.
- **Orden de `<script src>`**: cambiar el orden rompe las dependencias.
- **RNG separado por sistema**: `@chunk` (terreno), `@items` (ítems), `@mobs` (mobs), `@llave` (llave).
- **GitHub Pages tarda ~30-60s** en actualizarse tras un `git push`.
- **Carpeta raíz variable**: cambia según la PC. No afecta al proyecto.

---

## 📞 Notas finales

- Este README se actualiza **cada vez que se agrega o cambia algo relevante**.
- Las decisiones 🧪 pueden cambiar. Las decisiones 🟢 se mantienen salvo razón fuerte.
- Los IDs (M1, J1, R1, S1, F1, etc.) **no cambian** aunque se modifiquen las decisiones.
- Los bloques del código (BLOQUE 1 a 20) son referenciables para modificaciones puntuales.
- El changelog completo vive en **[CHANGELOG.md](CHANGELOG.md)**.
- Las ideas futuras viven en **[BACKLOG.md](BACKLOG.md)**.

---

**Fin del README · Última revisión: 2026-10-15**