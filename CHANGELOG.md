# 📝 Changelog · Game_RPG

Historial completo de versiones del proyecto. Para el estado actual, ver [README.md](README.md).

---
## v2.6-alpha · 2026-10-20 (F28 completo + corazones + manzanas curativas)

### 🎯 Objetivo

Cerrar las fases 7-9 de F28, reemplazar la barra de HP por corazones y convertir las manzanas en una fuente real de curación.

### ✅ Completado

**Fase 7 — Muerte del mob**

- Mensaje `💀 ¡Derrotaste al <mob>!` con el nombre del enemigo.
- Animación de muerte del panel del mob.
- Cierre del combate diferido ~0.9s (`DELAY_MUERTE_MOB_MS`).
- Botón Huir deshabilitado mientras el mob está derrotado.
- Cartel del mundo con el nombre del mob derrotado.

**Fase 8 — Pantalla de derrota**

- Overlay propio de derrota con HP final y mensaje del mob.
- Botón **Reiniciar mundo** con la misma semilla.
- Se eliminó el reinicio automático (`derrotaTimeout`).
- El botón queda enfocado para poder reiniciar con Enter/Espacio.

**Fase 9 — Corazones y feedback**

- HUD principal con **10 corazones** para 20 HP (2 HP por corazón).
- `❤️` = 2 HP, `💔` = 1 HP, `🖤` = 0 HP.
- Número de vida junto a los corazones (`20 / 20`).
- Eliminada la barra de HP del HUD principal y su CSS.
- Las barras de HP del overlay de combate se mantienen.
- Feedback de precisión: `✨ ¡PERFECTO!`, `👍 Bien.`, `😕 Débil.`
- Mensajes de daño/bloqueo más claros para el turno del mob.
- El total de corazones se deriva de `hpMax`, listo para futuros aumentos de vida máxima.

**HUD inicial**

- `actualizarHUD()` se ejecuta al cargar el mundo, antes del primer movimiento.
- La posición y los corazones aparecen desde el inicio (se corrigió el `0,0` y el HUD vacío).

**Manzanas curativas**

- Cada manzana cura **1 HP** al pisarla (`HP_POR_MANZANA = 1`).
- La curación nunca supera `hpMax`; no aumenta la vida máxima.
- Al estar al máximo, la manzana **no se consume**: queda en el suelo.
- Las manzanas ya no se acumulan en el inventario; son comida de uso inmediato.
- Nueva función reutilizable `curarJugador(cantidad)`.

### 🧪 Pruebas

- `node --check` OK en los JS modificados y `git diff --check` sin errores.
- Captura headless: 10 corazones, `20 / 20` y posición `16,16` desde el arranque, sin mover al jugador.
- Curación probada en 20, 19, 10 y 1 HP: siempre respeta el máximo.
- Validación manual del usuario: el HUD y la curación con manzanas funcionan correctamente.

### 📝 Documentación

- README, BACKLOG, CHANGELOG, AGENTS e `index.html` actualizados a `v2.6-alpha`.
- F28 marcado como completo (fases 1-9).
- Manzanas curativas documentadas como consumible.

### 📌 Estado

- **v2.6-alpha jugable.** F28 completo, corazones con número y manzanas curativas.
- Próxima prioridad: F30 (sistema de niveles del jugador).
- Balance fino de combate queda como ajuste opcional después de más pruebas.

---
## v2.5.1-alpha · 2026-10-20 (fixes F28.1 + UX de combate)

### 🎯 Objetivo

Cerrar los bugs conocidos de F28 y dejar el combate listo para seguir con las fases 7-9.

### ✅ Corregido

**B6 · HP 0 no cerraba el combate**

- Causa real: el combate sí cerraba, pero durante la pantalla de DERROTA se reanudaban la IA y el movimiento, y el mob podía iniciar un combate nuevo.
- Fix: flag `estadoCombate.derrota` + pausa global durante la derrota; `iniciarCombate` queda bloqueado mientras dura.
- Se agregó `verificarMuerteJugador()` en el loop principal: si el HP llega a 0 en cualquier momento, cierra el combate al instante.

**B7 · Matar al mob con HP 0 “curaba” al jugador**

- Causa: `reiniciarMundo()` reseteaba `hp = hpMax` pero no refrescaba el HUD; la barra se actualizaba recién al moverse.
- Fix: `actualizarHUD()` después de reiniciar. La muerte del jugador ahora tiene prioridad sobre la victoria contra el mob.

**B8 · Huir no funcionaba durante la barra de timing**

- Causa: `#barra-timing-overlay` (`z-index: 500`) tapaba el overlay de combate y capturaba todos los clicks; clickear Huir ejecutaba `apretar()`.
- Fix: la capa de fondo usa `pointer-events: none`; solo `#barra-timing-panel` captura clicks. Huir cancela la barra y abre la confirmación.

**B9 · Callback de timing pendiente**

- `BarraTiming.cancelar()` ahora cancela el `setTimeout` de feedback de 400ms y protege el callback. Evita `TypeError` y acciones después de huir o cerrar el combate.

**Limpieza de `index.html`**

- Eliminado bloque duplicado de `#barra-stamina`.
- Título actualizado a `v2.5.1-alpha`.
- `barra-timing.js` movido antes de `render.js` para respetar el orden documentado.

### 🧪 Pruebas manuales

- B6: HP 0 → DERROTA sin barra extra, mundo reiniciado y HP visible en máximo.
- B7: HP 0 + ataque → DERROTA, sin victoria ni curación.
- Huir durante la barra: la barra se cancela y abre la confirmación.
- Huida: 35% contra tigre, penalización 8% del HP máximo (2 HP con 20).
- Combate normal: atacar, defender, matar mob y conservar HP.

### 📖 Documentación

- README, BACKLOG, CHANGELOG y AGENTS actualizados a v2.5.1-alpha.

### ⚠️ Estado

- v2.5.1-alpha jugable, sin bugs críticos conocidos de F28.1.
- F28 fases 7-9 siguen pendientes (resueltas después en v2.6-alpha).

---

## v2.5-alpha · 2026-10-20 (sistema de combate con timing · F28 fase 1-6)

### 🎯 Objetivo

Reemplazar el overlay de batalla simulada por un **combate real por turnos** con **minijuego de timing**. Introducir HP del jugador, daño real, ataques, defensas, huida probabilística y muerte.

### ✅ Completado

**Fase 1 · Stats del jugador + HP en mobs**

- `estado.jugador` ahora tiene: `hp`, `hpMax`, `ataque`, `defensa`, `velocidad`, `nivel` (placeholder).
- Valores base: HP 20/20, ataque 3, defensa 1, velocidad 1, nivel 1.
- `enemigos.js`: al spawnear mob se agrega `hpActual: mob.hp` y `hpMax: mob.hp`.
- `main.js`: al reiniciar mundo se resetea `hp` a `hpMax`.

**Fase 2 · Barra de HP en HUD**

- `index.html`: nuevo `<div id="barra-hp">` arriba del mapa.
- `css/estilo.css`: gradiente rojo→naranja→verde, texto `X / Y` superpuesto.
- `render.js`: nueva `actualizarBarraHP()` llamada desde `actualizarHUD()`.

**Fase 3 · Minijuego de timing (`js/systems/barra-timing.js` — NUEVO)**

- Barra horizontal con marcador que recorre izq→der en `duracionMs`.
- Zonas coloreadas: rojo (miss) → naranja (aceptable) → verde (perfecto) → naranja → rojo.
- Precición calculada: `max(0, 1 - |posicion - 50| / 50)`.
- Función pública `BarraTiming.iniciar({duracionMs, titulo, onResultado})`.
- Función pública `BarraTiming.cancelar()` para abortar sin disparar callback.
- HTML de prueba en `pruebas/barra-timing.html`.

**Fase 4 · Overlay de combate (`js/ui/combate-ui.js` — NUEVO)**

- Pantalla completa con dos paneles: jugador (izq) vs mob (der).
- Barras de HP en cada panel.
- Botón "Huir" arriba a la derecha con confirmación.
- Mensaje central de estado del turno.
- Contenedor para la barra de timing (que se inyecta desde combate.js).
- Al abrir: `estado.pausado = true` (bloquea movimiento, IA, rotura, barco).
- Al cerrar: `estado.pausado = false`.

**Fase 5 · Lógica de combate (`js/systems/combate.js` — NUEVO)**

- Turnos alternados: jugador ataca → mob defiende → mob ataca → jugador defiende.
- **Fórmula ataque:** `daño = max(1, ataqueJug - defMob) * (precision * 2)`.
- **Fórmula defensa:** `daño = max(1, ataqueMob - defJug) * (1 - precision)`.
- Aplica `efecto-ataque` al mob cuando recibe daño.
- Aplica `efecto-danio` al jugador cuando recibe daño.
- Al morir el mob: `derrotarMobEn()` + cartel + cierre del overlay.
- Al morir el jugador: pantalla de derrota + reinicio del mundo.

**Fase 6 · Huida probabilística**

- Fórmulas helper:
  - `calcularNivelMob(mob)` = `(hp + ataque + defensa) / 4`.
  - `calcularProbHuida(nivelJug, nivelMob)` = `0.5 + (nivelJug - nivelMob) * 0.05`, entre 10% y 90%.
  - `calcularPenalizacionHuida(nivelJug, nivelMob)` = `5 + (nivelMob - nivelJug)`, entre 2% y 40% del hpMax.
- Al apretar Huir:
  - Barra de timing activa se cancela.
  - Se abre diálogo "¿De verdad querés huir? (X%)".
  - Si el jugador dice NO: combate sigue desde el turno actual.
  - Si dice SÍ: roll de probabilidad.
    - **Éxito:** el mob desaparece del mapa + HP del jugador baja por la penalización.
    - **Fallo:** el mob ataca (turno del mob).

**Fixes técnicos**

- `BarraTiming.cancelar()` para abortar sin disparar callback.
- Sistema de `timeoutPendiente` en `estadoCombate` para poder cancelar `setTimeout` entre turnos.
- `pausado` en `estadoCombate` para bloquear doble huida.
- `intentarMover` verifica `estado.pausado` (bloquea movimiento en combate).
- `cerrarCombate("cancelado")` al reiniciar mundo.

### 🐛 Bugs conocidos (ver BACKLOG · F28.1)

- **B6:** HP del jugador en 0 no cierra el combate.
- **B7:** matar al mob con HP 0 cura al jugador.

### ⏸️ Pendiente (F28 fase 7-9)

- Fase 7-8: muerte del jugador + pantalla de derrota (básico ya funciona, falta pulir).
- Fase 9: balance final + íconos de corazón (❤️/💔).

### 📖 Documentación

- BACKLOG: F28 marcada como parcialmente implementada. F28.1, F30 agregadas.
- CHANGELOG: esta entrada.
- README: versión actualizada a v2.5-alpha.

### ⚠️ Estado

- **v2.5-alpha funcional con 2 bugs conocidos (F28.1).**
- El combate se siente adecuado y es jugable. Los bugs son de casos extremos (HP 0).

---


## Docs · 2026-10-20 (anotaciones: F29 escalado, corazones, velocidad, inventario)

### 📝 Documentación

**BACKLOG expandido con F29 (va aparte de F28):**

- **F29 nueva** — Escalado dinámico de dificultad del timing:
  - **Por tipo de mob:** cada mob tiene su propia `duracionMs` y tamaño de zonas (gallina 2000ms → boss 700ms).
  - **Por fase del día (F1):** de noche las zonas verde/naranja se achican a la mitad.
  - **Por nivel del jugador (futuro):** requiere sistema de niveles.
  - Requiere: F28 (combate) + F1 (día-noche) + configuración por mob.

**F12 expandido con equipables que modifican stats del jugador:**

- Nueva subsección en F12: "Equipables que modifican stats del jugador".
- Bicicleta, botas, armaduras, cascos → modifican velocidad, defensa, ataque, HP máximo.
- Velocidad del jugador: constante por defecto (100ms por celda). Solo equipables la modifican.
- Reglas: aditivos con máximos por stat.

**F28 confirmado con corazones dentro:**

- Los íconos de corazón (❤️/💔) quedan dentro de F28 fase 9 (no son feature aparte).
- Se implementan después de que la barra de HP esté funcionando.

**Inventario visual anotado en F8:**

- Ventana nueva con todo pausado (`estado.pausado = true`) para ver inventario completo.
- Se desglosa más adelante, no ahora.

### ⚠️ Estado

- **v2.4.2-alpha sigue estable.** Solo cambios en documentación.
- F28 sigue siendo la próxima tarea urgente. F29 es una capa encima, se hace después.

---

## Docs · 2026-10-19 (anotaciones: F28 sistema de combate con timing)

### 📝 Documentación

**BACKLOG expandido con F28:**

- **F28 nueva** — Sistema de combate con timing (HP + daño real):
  - Combate por turnos en overlay.
  - Minijuego de timing: barra horizontal con marcador izq→der en 1500ms, una sola pasada.
  - **Ataque:** precisión del click determina multiplicador (0 a 2× el daño).
  - **Defensa:** precisión del click determina reducción (0 a 100%).
  - Stats del jugador: HP 20, ataque 3, defensa 1, velocidad 1.
  - HP del mob ya existe en `mobs.js`, se copia a `hpActual` al iniciar.
  - Huir: mantiene HP del mob.
  - Muerte del jugador: pantalla de derrota + reiniciar.
  - HP en el HUD: barra + número (futuro: corazones ❤️/💔).
  - Archivos nuevos: `barra-timing.js`, `combate.js`, `combate-ui.js`.
  - 9 fases de implementación, 2-3 sesiones estimadas.

**Relaciones actualizadas:**

- F28 es prerequisito de F1 (día-noche "peligroso"), F26 (especiales), F27 (bosses), y MARCO 11 (combate por reflejos).
- F28 va a usar los efectos de F25 (`efecto-ataque` y `efecto-danio`).

### ⚠️ Estado

- **v2.4.2-alpha sigue estable.** Solo cambios en documentación.
- F28 es la próxima tarea urgente. Cuando se implemente, la versión sube a v2.5-alpha.

---

## Docs · 2026-10-19 (anotaciones de diseño: día-noche, mobs especiales, bosses)

### 📝 Documentación

**BACKLOG reescrito y expandido:**

- **F1 reescrita** — Ciclo día-noche completo:
  - Día (20s en test): todo visible.
  - Transición día→noche (5s): oscurecimiento gradual + aviso "Se hace de noche. Es peligroso."
  - Noche (15s): oscuridad casi total. Solo se ven los tiles que emiten luz + radio de 5 celdas alrededor del jugador.
  - Transición noche→día (5s): aclarado gradual.
  - Pausable (se detiene en batalla de boss, menú, etc.).
  - Mobs normales desaparecen de noche. Aparecen mobs especiales nocturnos.
  - La linterna equipada ilumina un radio (ver F12).

- **F12 actualizada** — Objetos equipables de mejor nivel + linterna por niveles:
  - Hachas/picos: madera (1.0×), hierro (0.6×), diamante (0.3×) → reduce `duracionMs` de rotura.
  - Linteras con radio: vela (6×6), mano (10×10), militar (13×13), farol mágico (16×16).
  - Campo nuevo `nivel` y `velocidad` en `EQUIPABLES`.

- **F26 nueva** — Sistema de mobs especiales (categoría 2):
  - `MOBS_ESPECIALES` con drops únicos garantizados.
  - Spawn condicional: por noche, por estructura, por nivel de jugador.
  - Vinculación a misiones (`mision.questId`, `objetivo`, `cantidad`, `recompensa`).
  - Requiere: F1, F15, sistema de misiones (nuevo archivo `js/systems/misiones.js`), persistencia.

- **F27 nueva** — Sistema de mobs bosses (categoría 3):
  - `MOBS_BOSS` con pelea por fases (`fases[].hpMin`, `ataques`, `efectosAlJugador`, `invocaEsbirros`, `furia`).
  - Inmunidades y resistencias a tipos de daño.
  - Drops legendarios garantizados.
  - Requiere: combate real (HP + daño), sistema de estados, F15.

**Relaciones anotadas entre ideas:**

- F1 ↔ F12 (linterna).
- F1 ↔ F26 (mobs nocturnos).
- F15 ↔ F26 y F27 (spawn en estructuras).
- F22 ↔ F12 (qué nivel usa `porChunk: true`).
- F3 ↔ F1 (capa de iluminación).

### ⏸️ Pendiente

- Nada implementado. Todo queda anotado para cuando se decida avanzar.
- Orden natural sugerido: HP + daño → F12 (velocidad) → F15 (estructuras) → F1 (día-noche) → F26 (especiales) → F27 (bosses).

### ⚠️ Estado

- **v2.4.2-alpha sigue estable.** Solo cambios en documentación.
- El próximo hito técnico es **HP + daño real** (base para todo lo demás).

---

## v2.4.2-alpha · 2026-10-19 (sistema de efectos visuales)

### 🎯 Objetivo

Crear un sistema de efectos visuales **genérico y desacoplado**: cualquier tile, mob, ítem o entidad puede "recibir" un efecto visual (vibrar, parpadear, glow, etc.) sin código específico por entidad.

### 🧠 El problema que resuelve

Hasta v2.4.1-alpha, los efectos visuales estaban hardcodeados dentro de `render.js` por entidad:

- `if (tile === TILE_LLAVE) celda.classList.add("glow")`
- `if (mob.tipo === "tigre") celda.style.transform = "scaleX(-1)"`

Con 3 mobs no dolía, pero al querer agregar vibrar/parpadear/destello a **cualquier** entidad (tigre, lobo, roca, árbol, cofre, puerta), hubiera implicado tocar `render.js` una y otra vez.

### ✅ Completado

**Nuevo sistema de efectos (`js/systems/efectos.js` — NUEVO)**

- Mapa global `efectosActivos: Map<"wx,wy", [{ clase, hasta }]>`.
- `aplicarEfecto(wx, wy, clase, duracionMs?)` — si no se pasa duración, dura para siempre hasta quitarse manualmente.
- `quitarEfecto(wx, wy, clase)` — quita un efecto puntual.
- `quitarTodosLosEfectos(wx, wy)` — quita todos de una celda.
- `obtenerEfectosDe(wx, wy)` — devuelve las clases activas, filtrando expirados.
- `limpiarEfectos()` — limpia todo (para reiniciar mundo).
- Autocontenido, sin dependencias.

**CSS (`css/estilo.css`)**

- Nuevos keyframes:
  - `vibrar-random` — vibración **orgánica** combinando `translateX` y `translateY` en secuencia irregular (no solo izq-der).
  - `parpadeo` — `opacity: 1 ↔ 0.2`.
  - `destello-rojo` — `drop-shadow` rojo + `brightness` alternado.
  - `pulse` — `scale(1 ↔ 1.3)` infinito.
- Nuevas clases compuestas:
  - `.efecto-ataque` — vibrar + parpadeo + destello rojo (~0.5s, 1 sola pasada).
  - `.efecto-golpe` — vibrar + parpadeo lentos (~1s, 3 pasadas).
  - `.efecto-golpe-loop` — vibrar + parpadeo **infinitos** (mientras dura la rotura).
  - `.efecto-recoger` — solo parpadeo rápido.
  - `.efecto-danio` — vibrar + parpadeo + destello rojo (para daño al jugador).
  - `.efecto-glow` — halo celeste permanente.
  - `.efecto-pulse` — pulsación permanente.

**`js/ui/render.js`**

- Nueva función `actualizarEfectosEnGrid()` que se ejecuta **cada frame** (no solo al cambiar la esquina del grid).
- Solo itera si hay efectos activos o los hubo en el frame anterior (optimización).
- **No toca** `textContent`, `background` ni `transform`: **solo** el `className` de la celda. Así las animaciones CSS no se reinician cada frame.
- Se mantiene todo lo demás: `dibujarCeldaEnGrid`, `llenarGrid`, HUD, orientación del jugador.

**`js/systems/rotura.js`**

- Al iniciar la rotura: `aplicarEfecto(wx, wy, "efecto-golpe-loop")` (sin duración → infinito).
- Mientras la barra baja, la animación corre en bucle.
- Al llegar la barra a **0** (o al cancelar): `quitarEfecto(...)` **en el mismo instante** que se cambia el tile / se resetea la barra.
- Se eliminó el "re-aplicar efecto cada 1s" que tenía la versión anterior. Ahora es un único efecto-loop.
- La animación, la barra y el cambio de tile terminan **exactamente juntos**.

**`index.html`**

- Agregado `<script src="js/systems/efectos.js"></script>` **justo antes** de `render.js`.

### 🎨 Ajustes visuales

- **Vibración reducida de 4px a 2px.** Con 4px se sacudía demasiado "violento", con 2px se ve como un golpe real.
- Vibrar ahora es **orgánico** (no solo izquierda-derecha): combina desplazamientos en X e Y.
- Vibración "en bucle" mientras se pica/tala → sensación de "estar trabajando" sobre el tile.
- Al terminar la rotura, **la animación se corta en el mismo frame** en que el tile desaparece.

### 🔧 Cambios técnicos

- `efectos.js` es transversal: cualquier sistema (rotura, combate, recolección, victoria) puede llamar `aplicarEfecto(...)` sin acoplarse al render.
- Los efectos se guardan por **coordenadas del mundo** `(wx, wy)`, no por índice de celda. Así siguen vigentes cuando la cámara se mueve.
- El render consulta `obtenerEfectosDe(wx, wy)` y aplica las clases CSS. El motor no sabe qué es un efecto: solo lo dibuja.

### 🧪 Bugs encontrados y resueltos durante el desarrollo

- **Bug 1:** las animaciones CSS no se veían porque `render()` reseteaba `celda.className` cada frame (60fps). Solución: solo actualizar `className` cuando el valor nuevo es distinto.
- **Bug 2:** dos clases con `animation:` se pisaban entre sí. Solución: combinar las animaciones en una sola clase con múltiples animaciones separadas por coma.
- **Bug 3:** `const lineas` se usaba antes de declararse en el HTML de prueba. Solución: declarar antes.

### 🚀 Lo que se puede hacer ahora (antes no)

| Caso | Antes | Ahora |
|------|-------|-------|
| Atacar a un tigre | Comportamiento hardcodeado | `aplicarEfecto(wx, wy, "efecto-ataque", 500)` |
| Picar una roca | No tenía animación | `aplicarEfecto(wx, wy, "efecto-golpe-loop")` mientras dura |
| Recoger un ítem | No tenía animación | `aplicarEfecto(wx, wy, "efecto-recoger", 300)` |
| Daño al jugador | No tenía animación | `aplicarEfecto(wx, wy, "efecto-danio", 500)` |
| Cofre importante | Hardcodeo por tile | `aplicarEfecto(wx, wy, "efecto-glow")` permanente |
| Portal activo | Hardcodeo por tile | `aplicarEfecto(wx, wy, "efecto-pulse")` permanente |
| Mob herido | No existía | Agregar `"efecto-danio"` al golpear |

### ⏸️ Pendiente (ver BACKLOG · F25)

- Aplicar `efecto-ataque` al iniciar batalla.
- Aplicar `efecto-danio` al jugador cuando HP esté implementado.
- Aplicar `efecto-recoger` al recoger ítems y equipables.
- Efecto `efecto-glow` permanente a la llave.
- Sistema de efectos en la UI de HTML de prueba.

### 📖 Documentación

- CHANGELOG: esta entrada.
- BACKLOG: F25 agregado.
- README: sistema de efectos documentado.

### ⚠️ Estado

- **v2.4.2-alpha estable.** El sistema de efectos funciona y la rotura es la primera en usarlo.

---

## v2.4.1-alpha · 2026-10-17 (fix bugs de v2.4-alpha)

### 🎯 Objetivo

Arreglar los 5 bugs detectados al implementar biomas por celda en v2.4-alpha.

### 🐛 Arreglados

- **B1 (romper tile usa bioma del chunk):** `rotura.js` ahora usa `obtenerBiomaDeCelda(wx, wy)` en vez de `obtenerBiomaDeChunk`.
- **B2 (filas de pasto entre chunks):** `generarPantalla` ahora pinta de `yMin = 0` a `yMax = ALTO_CHUNK - 1`.
- **B3 (mobs de tierra en agua):** `ia.js` reescrito completo para 2D.
- **B4 (atravesar mob no dispara pelea):** resuelto por el mismo fix de `ia.js`.
- **B5 (romper roca en agua genera arena):** mismo fix que B1.

### 🔧 Cambios técnicos

**`js/systems/ia.js` reescrito completo:**

- Uso de coordenadas del mundo `(wx, wy)`.
- `tickMobs` procesa los mobs del chunk del jugador.
- `moverMob` verifica colisiones con terreno, mobs y jugador.
- `moverMob` dispara batalla si el mob hostil llega al jugador.
- `alejarMobsDelJugador` adaptado a 2D.
- `distancia` calcula con `wx, wy`.

**`js/main.js`:**

- Se agregó `iniciarTicks()` después de `inicializarJugador()`.

**`js/systems/rotura.js`:**

- `intentarIniciarRotura` usa `obtenerBiomaDeCelda(wx, wy)`.

### 🎁 Extras

**Cheats temporales (`js/systems/cheats.js`):**

- Botón 🎁 arriba a la derecha.
- Carga / limpia todos los equipables.
- **Para test. Se borra antes de producción.**

### 📖 Documentación

- BACKLOG: F24 marcada como resuelta.
- CHANGELOG: esta entrada.
- README: tabla de bugs actualizada.

### ⚠️ Estado

- **v2.4.1-alpha estable.** Los 5 bugs de F24 están cerrados.

---

## v2.4-alpha · 2026-10-16 (biomas por celda + ruido)

### 🎯 Objetivo

Reemplazar el sistema de "bioma por chunk" (cuadrados pegados) por un sistema de "bioma por celda" usando ruido (temperatura + humedad).

### ✅ Completado

**Nuevo sistema de ruido (`js/core/ruido.js` — NUEVO)**

- `ruido2D(x, y, seed)` — Value Noise 2D con interpolación smoothstep.
- `ruidoFBM(x, y, seed, octavas, persistencia)` — ruido fractal con varias capas.
- Autocontenido, sin dependencias.
- Cargado en `index.html` después de `config.js`.

**Biomas con temperatura y humedad**

- Cada bioma (en ambos temas) tiene `temperatura` y `humedad` entre 0 y 1.
- Valores:
  - pradera: 0.5 / 0.5
  - bosque: 0.4 / 0.75
  - costa: 0.6 / 0.85
  - ruina: 0.5 / 0.25
  - oceano: 0.5 / 0.98
  - desierto: 0.9 / 0.1
  - nieve: 0.1 / 0.35

**`obtenerBiomaDeCelda(semilla, wx, wy)` en `mundo.js`**

- Consulta `ruido2D` para temperatura y humedad de la celda.
- Elige el bioma cuyo `(temp, hum)` esté más cerca (distancia euclídea).
- Determinista por semilla.
- `ESCALA_BIOMA = 0.01` → 1 bioma ≈ 100 celdas ≈ 3 chunks.

**`generarPantalla` reescrita**

- Pinta el chunk **celda por celda**, consultando el bioma de cada una.
- La costa (`forma: "franja"`) sigue usando su lógica especial por ahora.
- El chunk guarda su `bioma` dominante para spawns de mobs e ítems.

### 🐛 Bugs conocidos (ver BACKLOG · F24) · ✅ TODOS RESUELTOS en v2.4.1

- **B1:** romper un tile usa el bioma del chunk en vez de la celda.
- **B2:** filas horizontales de pasto entre chunks.
- **B3:** mobs de tierra aparecen en el agua.
- **B4:** atravesar un mob no dispara animación de pelea.
- **B5:** romper roca en agua genera arena.

### 📖 Documentación

- BACKLOG: F24 con los 5 bugs.
- CHANGELOG: esta entrada.
- README: pendiente de actualizar con M21.

### ⚠️ Estado

- **v2.4-alpha funcional con bugs.** Los bugs se arreglan por partes (hecho en v2.4.1).

---

## v2.3-alpha · 2026-10-16 (tema espacio + color bioma + animación)

### 🎯 Objetivo

Convertir el juego en un "explorador espacial" sin tocar el motor. Además, agregar identidad visual por bioma y animar al jugador.

### ✅ Completado

**Infraestructura de temas (v2.2-alpha ya la había preparado)**

- `js/core/temas/tema-tierra.js` — datos originales.
- `js/core/temas/tema-espacio.js` — datos espaciales.
- `TEMA_ACTIVO` en `config.js`.
- Wrappers en `tiles.js`, `biomas.js`, `mobs.js`.

**Tema espacio completo (`tema-espacio.js`)**

- 25 iconos espaciales.
- 7 biomas espaciales.
- 3 mobs espaciales.
- 1 objeto jugador con 4 estados.

**Botón de cambio de tema**

- Botón arriba a la derecha de la pantalla.
- Alterna entre "tierra" y "espacio".
- Persistencia en `localStorage`.
- Texto del botón dinámico.
- Ayuda del HUD cambia de texto.

**Color de fondo por bioma**

- Campo `color` en cada bioma de ambos temas.
- Se aplica al fondo de los tiles del mapa.
- Colores sutiles.

**Animación del jugador**

- Objeto `jugador` en cada tema.
- Alternancia entre `correrA` y `correrB` cada 150ms mientras se mueve.
- Orientación respetada.
- Al detenerse, vuelve a `quieto`.
- Al subir al barco, muestra `barco`.

**Arreglos varios**

- `items.js`: refactor con semillas opcionales.
- `items.js`: `obtenerChunk` reemplazado por `generarPantalla`.
- `jugador.js`: bug de orientación corregido.
- `jugador.js`: `alPisarCelda` usa `ICONOS`.
- `render.js`: slots de equipados usan `ICONOS`.
- `render.js`: HUD del inventario usa `ICONOS`.
- `render.js`: `jugador-fijo` ya no tiene emoji hardcodeado.
- `barco.js`: sincroniza `estado.jugador.enBarco`.
- `estado.js`: nuevo flag `enBarco`.
- `config.js`: `TEMA_ACTIVO` en lugar de `const` fijo.

### ⏸️ Pendiente (ver BACKLOG · F19)

- Pulir emojis y nombres del tema espacio.
- Diseñar más biomas, mobs, ítems.
- Adaptar `auditor/` al sistema de temas.
- Adaptar `victoria.js` con mensaje temático.
- Definir narrativa.

### 📖 Documentación

- README: MARCO 4.5 y MARCO 8 actualizados.
- BACKLOG: F19 parcialmente implementado.
- CHANGELOG: esta entrada.

### ⚠️ Estado

- **v2.3-alpha estable.** El juego es jugable en ambos temas.

---

## v2.2-alpha · 2026-10-16 (infraestructura de temas)

### 🎯 Objetivo

Preparar el motor para cambiar la temática visual (tierra ↔ espacio) sin tocar la lógica.

### ✅ Completado

- Nuevos archivos: `js/core/temas/tema-tierra.js` y `js/core/temas/tema-espacio.js`.
- `TEMA_ACTIVO` en `config.js` (`"tierra"` por defecto).
- `tiles.js`, `biomas.js`, `mobs.js` convertidos en wrappers.
- El juego se ve idéntico. Los IDs numéricos no cambian.

### ⏸️ Pendiente

- Llenar `tema-espacio.js` con datos reales (hecho en v2.3-alpha).
- Adaptar `items.js` al sistema de temas.
- Adaptar `auditor/` al sistema de temas.

### ⚠️ Estado

- Infraestructura lista. El juego funciona igual que antes.

---

## v2.1-alpha · 2026-10-16 (auditor 2D + refactor items)

### 🎯 Objetivo

Adaptar el auditor de semillas al mundo 2D circular y hacer que `items.js` sea reutilizable desde fuera del juego.

### ✅ Completado

**Auditor 2D (`auditor/`)**

- Reescrito completo para chunks `{cx, cy}`.
- Layout de 2 columnas.
- Ejes X e Y con coordenadas.
- Botón 🎲 de semilla aleatoria.
- Íconos de equipables visibles sobre cada chunk.
- Scroll horizontal y vertical.
- Límite 10×10 chunks.

**Refactor `items.js`**

- `generarItemsDeChunk(cx, cy, semillaMundo, semillaObjetos)`.
- `generarEquipablesDeChunk(cx, cy, semillaMundo, semillaObjetos)`.
- `obtenerChunkDeEquipable(tipo, bioma, semillaMundo, semillaObjetos)`.
- Reemplazado `obtenerChunk(cx, cy)` por `generarPantalla(semillaMundo, cx, cy)`.
- Cachés separadas por semilla.
- **Compatibilidad:** si no se pasan semillas, usa las globales.

### ⏸️ Pendiente (anotado en BACKLOG · F22)

- Limitar generación de equipables en producción.
- Condiciones más finas.
- Documentar el flag en `items.js`.

### 📖 Documentación

- BACKLOG: F22 agregado.
- CHANGELOG: esta entrada.

### ⚠️ Estado

- Auditor funcional con mundo 2D.
- `items.js` refactorizado y compatible.

---

## v2.0 · 2026-10-16 (migración a chunks 2D completada)

### 🎯 Objetivo

Migrar de un mundo **1D** a un mundo **2D circular (360°)** con **cámara fluida**.

### ✅ Completado

**Fase 1 · Constantes nuevas**

- `ANCHO_CHUNK = 32`, `ALTO_CHUNK = 32`
- `ANCHO_VENTANA = 25`, `ALTO_VENTANA = 17` (luego 32×24)
- `TAMANO_CELDA = 16` (luego 24)
- `LIMITE_CHUNKS = 4`
- `DURACION_MOVIMIENTO_MS = 200` (luego 100)
- Llave en chunk (2, 0)

**Fase 2 · Sistema de cámara (`js/systems/camara.js` — NUEVO)**

- `camara.x`, `camara.y`
- `iniciarCamara()`, `sincronizarCamara()`, `obtenerOffsetCamara()`
- `coordsMundoAChunk()`, `coordsMundoATile()`, `normalizarChunk()`

**Fase 3 · Chunks 2D**

- `estado.js`: jugador vive en `(wx, wy)`.
- `chunks.js`: caché `"cx,cy"` → chunk.
- `mundo.js`: `generarPantalla(semilla, cx, cy)`.

**Fase 4 · Render + movimiento 360°**

- `render.js`: grid extendido, `translate` para el desplazamiento.
- `jugador.js`: movimiento 360° con interpolación.
- `input.js`: input continuo.
- `main.js`: loop con `requestAnimationFrame`.

**Fase 5 · Ítems y mobs 2D**

- `items.js` reescrito.
- `enemigos.js` reescrito.
- Fix: manzanas no se generan sobre agua.
- Fix: mobs no se generan sobre ítems.
- Fix: ítems no se generan sobre mobs.

**Fase 6 · Rotura y barco 2D**

- `rotura.js`: click → coordenadas del mundo.
- `barco.js`: click → coordenadas del mundo.
- Romper rocas del agua desde el barco.
- Navegación entre chunks en barco.

**Fase 7 · Victoria y pausa**

- `victoria.js`: adaptado a `estado.llave.wx, wy`.
- Pausa global durante batalla.
- Se cancela rotura/barco al iniciar batalla.

### 🎨 Ajustes visuales

- Jugador fijo en el centro exacto del viewport.
- Jugador y mapa no seleccionables.
- Cámara y mapa sincronizados.
- Barra de stamina no mueve el layout.

### 🔧 Fixes adicionales

- Muros N-S eliminados.
- Colisión con mobs restaurada.
- Equipables en cada chunk de su bioma.
- Tigres aparecen en nieve.
- Barco no se puede colocar sobre mobs.
- `limite.js` y `funLimiteChunk()` eliminados.

### ⏸️ Pendiente

- Fronteras compartidas en 2D (resuelto por v2.4-alpha).
- Barco: mob bloqueando la única celda de tierra.
- Mobs de chunks vecinos.

### 📖 Documentación

- README: actualizado a v2.0.
- BACKLOG: F21 marcado como implementado.
- CHANGELOG: esta entrada.

### ⚠️ Estado

- **v2.0 estable.** El juego es 100% jugable.

---

## v1.9.1 · 2026-10-15 (prototipo chunks 2D aprobado)

### 🎨 Prototipo · Chunks 2D con cámara fluida (APROBADO)

- Archivo nuevo: `chunks-2d.html`.
- **Sistema probado y aprobado:**
  - Chunks de **32×32 celdas**.
  - Celdas de **32px** en el prototipo.
  - Ventana visible de **32×24 celdas**.
  - **Cámara fluida**.
  - **Movimiento 360°** con WASD.
  - **Mundo circular** en X e Y (tipo Pac-Man).
  - **Límite de ±5 chunks**.
  - **Zona (0,0) segura** (pradera).
  - **Render de ventana** que consulta varios chunks.
  - **Movimiento fluido** (200ms por celda).

### ✅ Observaciones del test

1. Se ve bien con chunk 32×32 y celda 32px. ✅
2. **Los cortes entre chunks se notan**. ⚠️ (resuelto en v2.4-alpha)
3. El wrap circular funciona bien. ✅
4. El movimiento es fluido. ✅
5. El jugador está correctamente centrado. ✅

### ⏸️ Próximo paso (bloqueante)

**Migración al juego real** (ver BACKLOG · F21).

### 📖 Documentación

- BACKLOG: F21 ampliado.
- README: R17, R18 agregados.

---

## v1.8 · 2026-10-13 (fix costa + idea tema espacio)

### 🎨 Cambios

- **Costa con forma de franja**: agua + arena + pasto en franjas con bordes irregulares.
- **Nuevo campo `forma` en biomas**: `forma: "franja"`.
- **Nueva función `pintarCosta()`** en `mundo.js`.
- **Tile del desierto** cambiado a 🟧.
- **Fix**: barra de stamina ya no mueve el mapa.
- **Ice** ahora se rompe con pico.

### 📖 Documentación

- BACKLOG: F16, F17, F18 anotados.
- README: M19, G18, R16.

### 🌌 Idea anotada (futuro)

- **Tema "espacio"**: el proyecto completo puede convertirse a un juego espacial.

---

## v1.7 · 2026-10-13 (sistema de rotura)

### ➕ Nuevo

- **Sistema de rotura** (`js/systems/rotura.js`).
- Click sostenido sobre un tile rompible.
- Barra de stamina arriba del mapa (100% → 0%).
- Cartel "Necesitás un hacha/pico".
- Al terminar: el tile se convierte al `tileBase` del bioma.

### 🔧 Cambios

- `js/core/tiles.js`: `ROTURA_POR_TILE`.
- `js/world/biomas.js`: `tileBase` por bioma.
- `js/core/config.js`: `DURACION_ROTURA_MS`, `INTERVALO_ROTURA_MS`.
- `js/main.js`: `reiniciarMundo()` cancela rotura activa.

### 🎨 Diseño

- Barra de stamina con `visibility`.
- Botón de cartel temporal.

### ✅ Condiciones para romper

1. Click exacto sobre el tile.
2. Jugador adyacente (4 direcciones).
3. Objeto correcto equipado.

### 📖 Documentación

- README: MARCO 4.5.
- BACKLOG: F11 completado.

### ⏸️ Pendiente futuro

- Objetos de mejor nivel — ver F12.

---

## v1.6-alpha · 2026-10-11 (objetos equipables · EN DESARROLLO)

### ➕ Nuevo

- 3 objetos equipables: 🪓 Hacha, ⛏️ Pico, 🕯️ Linterna.
- Spawn único por mundo.
- Recolección al pisarlos.
- Sistema de forzar los 4 biomas por mundo.

### 🐛 Bug pendiente

- **Permutación de biomas no funciona correctamente.**

### ⚠️ Estado

- **v1.6-alpha no es estable.**

---

## v1.5.1 · 2026-10-11 (fixes de IA)

### 🐛 Fixes

- Mobs spawneaban cerca del jugador → Zona 0 sin mobs.
- Mobs atravesaban ítems → ahora colisionan.
- Orientación de mobs invertida → corregido.
- Jugador aparecía encima de un mob al cruzar zona → `alejarMobsDelJugador()`.
- Tigre no atacaba → `moverMob()` dispara batalla.
- Bug de `...` fantasma en `jugador.js`.
- Bug de `}` duplicado en `ia.js`.

### 🔧 Nuevo

- `RADIO_SEGURIDAD_SPAWN = 3`.
- `alejarMobsDelJugador()`, `generarDireccionesDeEscape()`.

### 📖 Documentación

- Separación del historial en `CHANGELOG.md`.
- Separación del backlog en `BACKLOG.md`.

---

## v1.5 · 2026-10-11 (IA de mobs)

- ➕ **IA de mobs en tiempo real**.
- ➕ Sistema de ticks (400ms base).
- ➕ Comportamiento hostil/pacífico/neutral.
- ➕ Deambulación, persecución, huida.
- ➕ Mobs con orientación visual.
- ➕ Colisiones.
- ➕ Pausa de ticks en overlays.
- ➕ Zona 0 sin mobs.
- 🔧 `config.js`: `TICK_MS`, `TICK_DEAMBULAR_CADA`.
- 🔧 `mobs.js`: `actitud.base`.
- 📖 Backlog ampliado: F6, F7, F8.

---

## v1.4 · 2026-10-11 (subcarpetas)

- 🏗️ Reorganización en subcarpetas (`core/`, `world/`, `entities/`, `ui/`, `systems/`).
- ➕ 5 carpetas nuevas en `js/`.
- 🔧 15 archivos movidos.

---

## v1.3 · 2026-10-11 (semillas separadas)

- ➕ Semillas independientes por sistema (F4 implementado).
- ➕ `SEMILLA_MOBS` = `Date.now()`.
- ➕ `SEMILLA_OBJETOS` = `SEMILLA`.
- 🔧 `enemigos.js` usa `SEMILLA_MOBS`.
- 🔧 `items.js` usa `SEMILLA_OBJETOS`.

---

## v1.2 · 2026-10-10 (sistema de mobs)

- ➕ Sistema de mobs escalable.
- ➕ Spawn de mobs por chunk.
- ➕ Batalla simulada.
- ➕ 3 mobs iniciales: 🐅 🐓 🐖.
- ➕ RNG separado para mobs.
- 🔧 Fix de orientación del jugador.
- 📖 README reorganizado: 13 marcos + backlog.
- 📌 5 ideas futuras anotadas.

---

## v1.1 · 2026-10-10 (grilla 50×34)

- 🔧 Grilla cambiada a 50×34.
- 🔧 Tamaño de celda reducido a 16×16 px.
- ➕ Orientación del jugador con `scaleX(-1)`.
- ➕ Centralización de tamaño.
- 📌 Ideas anotadas: día-noche, movimiento amortiguado, capas.

---

## v1.0 · 2026-10-09 (GitHub + Pages)

- ☁️ Proyecto subido a GitHub.
- 🌐 GitHub Pages activado.
- 📖 README con flujo de trabajo Git.
- 🔧 `.gitignore` creado.
- ➕ Prototipo 1 del módulo de combate.

---

## v1.0-beta · 2026-10-09 (arquitectura modular)

- 🏗️ Refactorización completa.
- ➕ 13 archivos `.js` + `css/estilo.css`.
- ➕ Bloques 12-18 movidos.

---

## v0.5 · 2026-10-09 (refactor parcial)

- 🏗️ Refactorización parcial (bloques 1-11).
- ➕ 8 archivos `.js` creados.
- ⚠️ Requiere Live Server.

---

## v0.4 · 2026-10-09 (ítems + límites)

- ➕ Ítems recolectables (🍎).
- ➕ Inventario en HUD.
- ➕ Control de semilla en UI.
- ➕ Límite configurable de chunks.
- ➕ Muros sólidos en extremos.

---

## v0.3 · 2026-10-09 (fronteras compartidas)

- ➕ Fronteras compartidas entre chunks.
- ➕ Caché de chunks con precarga de vecinos.
- ➕ Continuidad física al cruzar.
- ➕ Validación BFS de transitabilidad.

---

## v0.2 · 2026-10-09 (barra de zonas)

- ➕ Barra de zonas con 5 slots.
- ➕ Jugador centrado en la barra.
- ➕ Indicadores de zonas visitadas.
- ➕ Flechas direccionales.
- 🎨 Glow en slot actual.

---

## v0.1 · 2026-10-09 (motor base)

- ➕ Motor inicial de generación con semilla.
- ➕ Mundo E-O por zonas.
- ➕ 4 biomas con frontera dura.
- ➕ Movimiento WASD + flechas.

---

**Fin del CHANGELOG**