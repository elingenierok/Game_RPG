# AGENTS.md · Game_RPG

Configuración del proyecto para agentes de IA (OpenCode, Claude Code, Aider, etc.).

**Antes de tocar código, leé:** `README.md`, `BACKLOG.md`, `CHANGELOG.md`.

---

## Qué es este proyecto

Motor de un roguelike procedural en **JavaScript vanilla**, sin frameworks, sin build, sin dependencias externas. Corre en el navegador con **Live Server**. Mundo 2D circular con chunks de 32×32, cámara fluida, combate por turnos con timing.

**Frase guía del creador:** *"Si el test se siente entretenido, agrego complejidad."*

**Versión actual:** v2.5-alpha (combate funcional, 2 bugs conocidos: F28.1).

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
├── BACKLOG.md              ← ideas futuras (F1-F30)
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
    ├── ui/                 ← render, combate-ui, victoria
    └── systems/            ← camara, efectos, barra-timing, combate, ia, rotura, barco, cheats
```

**Orden de carga en `index.html` (CRÍTICO — respetar):**

```
temas → config → ruido → tiles → rng → biomas → mundo → camara → estado
→ chunks → items → mobs → enemigos → efectos → barra-timing → render
→ ia → jugador → combate-ui → combate → victoria → input → rotura
→ barco → cheats → main
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

- **`js/systems/cheats.js`** → botón 🎁 en la UI. **TEMPORAL, borrar antes de producción.**
- **`auditor/`** → herramienta de diagnóstico de mundos.
- **`pruebas/`** → archivos HTML sueltos.

---

## Estado actual (v2.5-alpha)

### Implementado
- Mundo 2D circular, cámara fluida, movimiento 360°.
- Biomas por celda con ruido (temp + humedad).
- Sistema de temas (tierra / espacio).
- Ítems recolectables, equipables (hacha, pico, linterna, barco).
- Sistema de rotura con efecto de golpe.
- Mobs con IA (deambular, perseguir, huir).
- **Combate por turnos con minijuego de timing** (F28 fase 1-6).
- HP del jugador, daño real, muerte.
- Huida probabilística con penalización.
- Sistema de efectos visuales genéricos (`efectos.js`).

### Bugs conocidos (F28.1 · PENDIENTES)
- **B6:** HP del jugador en 0 no cierra el combate.
- **B7:** matar al mob con HP 0 cura al jugador al máximo.

Ver `BACKLOG.md · F28.1` para causas y soluciones tentativas.

### Prioridad actual
1. **Resolver B6 y B7** (F28.1).
2. F28 fase 7-9 (muerte jugador pulida, pantalla derrota, corazones).
3. F30 (sistema de niveles del jugador).

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