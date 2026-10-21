# AGENTS.md · Game_RPG

Configuración del proyecto para agentes de IA (OpenCode, Claude Code, Aider, etc.).

**Antes de tocar código, leé:** `README.md`, `BACKLOG.md`, `CHANGELOG.md`.

---

## Qué es este proyecto

Motor de un roguelike procedural en **JavaScript vanilla**, sin frameworks, sin build, sin dependencias externas. Corre en el navegador con **Live Server**. Mundo 2D circular con chunks de 32×32, cámara fluida, combate por turnos con timing.

**Frase guía del creador:** *"Si el test se siente entretenido, agrego complejidad."*

**Versión actual:** v2.8-alpha (F28 completo, F30 de progresión con XP/habilidades/menú, F13 de loot por mob y F28.4 solo diseñado).

---

## Stack

- **HTML + CSS + JavaScript vanilla.** Sin frameworks, sin npm, sin build.
- Carga con `<script src>` clásicos (no módulos ES).
- Ejecución local: **Live Server** obligatorio (CORS bloquea `file://`).
- Deploy: GitHub Pages.
- Editor: VS Code.

---

## Estructura (resumen)

```
Game_RPG/
├── index.html              ← HTML + orden de carga de scripts
├── README.md               ← fuente de verdad (arquitectura)
├── BACKLOG.md              ← ideas futuras (F1-F33)
├── CHANGELOG.md            ← historial de versiones
├── AGENTS.md               ← este archivo
├── opencode.json           ← config de OpenCode
├── auditor/                ← herramientas de diagnóstico
├── pruebas/                ← HTML aislados para experimentar
├── css/
│   └── estilo.css
└── js/
    ├── main.js
    ├── core/               ← config, rng, ruido, tiles, estado, input, temas
    ├── world/              ← biomas, mundo, chunks
    ├── entities/           ← jugador, mobs, enemigos, items
    ├── ui/                 ← render, combate-ui, menu-jugador, victoria
    └── systems/            ← camara, efectos, barra-timing, combate, progresion, loot, ia, rotura, barco, cheats
```

**Orden de carga en `index.html` (CRÍTICO — respetar):**

```
temas → config → ruido → tiles → rng → biomas → mundo → camara → estado
→ progresion → chunks → items → mobs → loot → enemigos → efectos → barra-timing
→ render → ia → jugador → combate-ui → combate → menu-jugador → victoria
→ input → rotura → barco → cheats → main
```

Cambiar este orden rompe dependencias. No agregar archivos sin actualizar `index.html` y este archivo.

---

## Convenciones de código (obligatorias)

| Aspecto | Convención |
|---------|-----------|
| Constantes de tiles | `MAYÚSCULAS` (ej: `GRASS = 0`) |
| Funciones y variables | `camelCase` (`generarPantalla`, `anchoPantalla`) |
| Constantes de config | `MAYÚSCULAS_CON_GUION_BAJO` (`LIMITE_CHUNKS`) |
| RNG en generador | **Siempre `rng()`**, nunca `Math.random()` |
| Determinismo | Obligatorio en todo el generador |
| RNG por sistema | Cada sistema usa su propio `@sufijo` (`@chunk`, `@items`, `@mobs`) |
| Comentarios de sección | `// ═══ BLOQUE N ═══` |
| Archivos `.js` | Un archivo por responsabilidad |
| HTML | Solo estructura + `<script src>`. Nada de `<style>` ni `<script>` inline |

---

## Reglas duras (NO tocar sin permiso explícito)

Estos archivos son **críticos** y un cambio puede romper todo el motor. **Pedí confirmación antes de modificarlos.**

| Archivo | Por qué es crítico |
|---------|-------------------|
| `js/core/config.js` | Constantes globales (tamaños, límites, `TEMA_ACTIVO`) |
| `js/core/tiles.js` | IDs numéricos de tiles. Cambiarlos rompe todos los biomas y el render |
| `js/world/mundo.js` | Generación de chunks. Cualquier error rompe el mundo entero |
| `js/core/temas/tema-tierra.js` | Datos del tema tierra (biomas, mobs, iconos) |
| `js/core/temas/tema-espacio.js` | Datos del tema espacio |
| `js/core/estado.js` | Estado global. Cambios de estructura rompen todos los sistemas |
| `index.html` | Orden de `<script src>`. Cambiarlo rompe dependencias |
| `js/core/rng.js` | Determinismo. Si cambia, todas las semillas generan mundos distintos |

**Archivos libres para modificar** (implementar features está OK):

- `js/systems/*` (nuevos sistemas)
- `js/ui/*` (interfaz)
- `js/entities/*` (entidades)
- `css/estilo.css`
- `js/main.js` (con cuidado)

---

## Cómo testear

1. Abrir el proyecto en VS Code con **Live Server** (obligatorio).
2. Abrir `index.html` en el navegador.
3. **Ctrl+Shift+R** siempre después de cambios (recarga forzada, cachea mucho).
4. Probar manualmente:
   - Movimiento (WASD / flechas / botones).
   - Chocar con tigre → combate.
   - Apretar **Espacio** durante el combate (timing).
   - Romper un árbol / roca con click.
   - Cambiar de tema (botón 🌍/🚀).
5. Revisar consola del navegador (F12) por errores.

**Archivos de prueba aislados** (no cargan desde el juego):
- `pruebas/barra-timing.html` → minijuego de timing solo.
- `pruebas/catalogo.html` → catálogo de efectos visuales.
- `auditor/laboratorio-v1.html` → laboratorio de emojis.

---

## Herramientas auxiliares (no modificar sin motivo)

- **`js/systems/cheats.js`** → botón 🎁 en la UI y `debugCombate(tipo, ataque)` en consola. **TEMPORAL, borrar antes de producción.**
- **`auditor/`** → herramienta de diagnóstico de mundos.
- **`pruebas/`** → archivos HTML sueltos.

---

## Estado actual (v2.8-alpha)

### Implementado
- Mundo 2D circular, cámara fluida, movimiento 360°.
- Biomas por celda con ruido (temp + humedad).
- Sistema de temas (tierra / espacio).
- Ítems recolectables, equipables (hacha, pico, linterna, barco).
- Manzanas curativas: +1 HP al pisarlas, sin superar `hpMax`; al máximo quedan en el suelo.
- Sistema de rotura con efecto de golpe.
- Mobs con IA (deambular, perseguir, huir).
- **Combate por turnos con minijuego de timing** (F28 fases 1-9).
- Aviso inicial de combate y modos visuales ataque (⚔️) / defensa (🛡️).
- **Ataques telegrafiados por mob** (F28.2): catálogo `ATAQUE_1..8` + `ATAQUE_BOSS_1`, campo `ataques` en cada tema y perfiles de barra (duración + zonas + `mitigacionMaxima`). `Golpe` es 50% imbloqueable.
- **Resumen de victoria** (F28.3) con XP y drops reales; botón Continuar.
- **Combo de 3 perfectos** (F28.5): 3 ataques perfectos cargan slots; el 4.º pega ×1.5 y consume la carga.
- **Historial de combate y último golpe** (F28.6): registro color-coded (rojo/amarillo/verde/gris), 24 entradas con scroll y badges `−N HP` / `BLOQUEO` / `SIN DAÑO` / `+N HP`.
- **HP normalizado al cerrar combate**: `redondearHP()` lleva el HP a medios puntos hacia arriba (`14.899999 → 15`) para que las manzanas sumen `+1` exacto.
- **Progresión con XP** (F30): 5 habilidades comprables, nivel = 1 + rangos, recálculo de stats y movimiento/rotura mejorados.
- **Menú único del jugador** (F30): pestañas Personaje, Habilidades, Inventario y Misiones; se abre con `I` o 👤 y pausa el juego.
- **Loot por mob y XP real** (F13): `LOOT_POR_MOB` con probabilidad/cantidades, drops directos al inventario y únicos una vez por mundo.
- **Motor de efectos de combate** (F28.4): solo diseñado, no implementado.
- HP del jugador, daño real, muerte y derrota con botón de reinicio.
- Corazones de HP con número (2 HP por corazón).
- HUD inicializado al cargar (posición y vida sin esperar al primer paso).
- Huida probabilística con penalización.
- Sistema de efectos visuales genéricos (`efectos.js`).

### Bugs resueltos (F28.1 + B10)
- **B6:** HP en 0 no cerraba el combate / combate nuevo durante la derrota.
- **B7:** matar al mob con HP 0 “curaba” al jugador (HUD sin refrescar tras reinicio).
- **B8:** Huir bloqueado por la barra de timing.
- **B9:** callback de timing pendiente al cancelar.
- **B10:** HUD vacío y posición `0,0` hasta el primer paso (resuelto en v2.6-alpha).

Ver `BACKLOG.md · F28.1 y B10` para causas y soluciones.

### Prioridad actual
1. F12 (equipables que modifican stats y HP máximo).
2. Balance de XP/costos de F30 y tablas de F13.
3. Persistencia de progresión (F33).

### Líneas futuras anotadas (no implementadas)
- **F31 · Adaptación móvil:** controles táctiles, layout responsive, acción contextual para reemplazar Espacio, posibles automatizaciones y ajuste de velocidad/zonas para compensar latencia.
- **F32 · Campaña por etapas:** cada etapa es un mapa finito de un solo bioma con misión principal; tras varias etapas se abre un mapa final amplio con todos los biomas, más misiones y boss final.
- **F33 · Menú, guardado/carga y muerte:** menú principal/pausa, persistencia versionada (seed + etapa + jugador + inventario + flags), carga validada y política de muerte (permadeath, checkpoint o reinicio de etapa). Absorbe “persistencia de progreso (F8 fase 3)”.

---

## Workflow con OpenCode

1. **Leer contexto:** `README.md` (arquitectura) + `BACKLOG.md` (estado de cada feature) + este archivo.
2. **Antes de tocar código:** identificar si el archivo está en la lista de "críticos". Si sí, pedir permiso al usuario.
3. **Después de cada cambio:** correr el juego con Live Server y verificar manualmente.
4. **Actualizar documentación** cuando corresponda:
   - `CHANGELOG.md` → nueva entrada al agregar feature.
   - `BACKLOG.md` → cambiar estado de la feature (⏸️ → 🧪 → ✅).
   - `README.md` → actualizar versión, marcos afectados, roadmap.
5. **Commits chicos y descriptivos.** Preferir varios commits a uno gigante.

---

## Glosario rápido

| Término | Significado |
|---------|-------------|
| **Celda** | Unidad mínima del mapa. Se dibuja un emoji por celda. |
| **Chunk** | Cuadrado de 32×32 celdas. |
| **Bioma** | Tipo de terreno (pradera, bosque, costa, etc.). Se calcula por celda con ruido. |
| **Tema** | Conjunto de datos visuales (tierra o espacio). Cambia emojis y nombres sin tocar el motor. |
| **Efecto** | Clase CSS animada aplicada a una celda (vibrar, parpadear, glow). |
| **Timing** | Minijuego de precisión con barra horizontal y marcador. |
| **Telegráfico** | Aviso previo del ataque que va a usar el mob (emoji + nombre). |
| **Perfil de ataque** | Duración y ancho de zonas de la barra de defensa para un `ATAQUE_N`. |
| **Turno** | Ciclo de ataque o defensa en combate. |
| **Hubida** | Acción probabilística de escapar del combate. |
| **RNG** | Generador pseudoaleatorio. Determinista por semilla. |

---

## Notas finales

- El README es la fuente de verdad. Si hay conflicto entre código y README, **el README gana** (hay que actualizar código, no doc).
- Los IDs (M1, J1, R1, F1, etc.) **no cambian** entre versiones.
- Los bloques del código (BLOQUE 1 a 99) son referenciables: "cambiá el bloque 7.10" es válido.
- Cuando dudes, **preguntá al usuario** en vez de asumir.

---

**Fin del AGENTS.md**