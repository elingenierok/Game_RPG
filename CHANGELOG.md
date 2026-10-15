📝 Changelog · Game_RPG
Historial completo de versiones del proyecto. Para el estado actual, ver [README.md](README.md).
v1.9 · 2026-10-15 (barco completo + cámara fluida aprobada)
➕ Nuevo
- Desembarco del barco: click sostenido sobre tierra adyacente → barra de 2 seg → bajarse
- Cruce de zona navegando: adaptado cambiarZona() para funcionar con barco
  - Si el borde del nuevo chunk es agua → sigue navegando
  - Si es tierra → se baja automáticamente
- Click único para acciones: ya no hace falta mantener apretado el mouse
  - Romper árboles/piedras: 1 click → barra baja → se rompe
  - Colocar barco: 1 click sobre agua adyacente → barra → se sube
  - Desembarcar: 1 click sobre tierra adyacente → barra → se baja
  - Cancelaciones siguen funcionando: mover al jugador, cambiar de zona
🎨 Prototipo · Cámara central fluida (APROBADO para migrar)
- Archivo nuevo: chunk-camara.html (independiente, para pruebas)
- Sistema probado y aprobado:
  - Cámara central: el jugador queda fijo en el centro de la pantalla
  - El mundo se desplaza debajo (no el jugador)
  - Movimiento fluido entre tiles (200ms por tile)
  - Mantener tecla = movimiento continuo
  - Mundo circular en X (al cruzar borde vuelve al principio)
  - Mapa duplicado para evitar saltos en el borde
- Visualización más suave, sin escalonamiento
🐛 Fixes
- Fix barco: aparece en tierra, pegado a agua, lejos de los bordes del chunk
- Fix barco: porChunk en costa (1 por cada chunk de costa)
- Fix manzanas: no se generan sobre agua
- Fix cartel "Necesitás un barco": solo aparece si el click fue sobre agua adyacente
📖 Documentación
- BACKLOG: F18 marcado como completo
- BACKLOG: F21 nuevo (cámara central fluida)
- README: versión v1.9
⏸️ Próximo paso (bloqueante)
- Migrar al juego real el sistema de cámara central fluida (ver F21).
- Es un cambio estructural. Requiere tocar render.js, jugador.js, chunks.js, estilo.css.
v1.8.1 · 2026-10-14 (barco · CON BUGS PENDIENTES)
➕ Nuevo
- Tile 🛶 (BARCO) agregado a tiles.js.
- Sistema de barco (js/systems/barco.js):
  - Click sostenido sobre agua adyacente → barra de 5 segundos → jugador se sube al barco (emoji 🚣).
  - Mientras navega, el jugador solo puede moverse sobre agua.
  - El barco es porChunk: true en bioma costa (1 por cada chunk de costa).
  - Aparece en tierra, pegado a agua, lejos de los bordes del chunk.
- 4to slot de equipados en el HTML/CSS (arriba del mapa).
- Cartel al recoger objetos: "🛶 ¡BARCO conseguido!"
- Fix: manzanas no se generan sobre agua.
- Fix: cartel "Necesitás un barco" solo aparece si el click es sobre agua adyacente.
🐛 Bugs pendientes
Bug 1 · No se puede bajar del barco
- El jugador queda atascado en el agua al subirse al barco.
- Falta implementar "desembarco": click sostenido sobre tierra adyacente → barra → bajarse.
- Sin desembarco, el jugador queda atrapado.
Bug 2 · No se puede cruzar zona navegando
- Al intentar cruzar de zona con el barco, el jugador no puede pasar al chunk siguiente.
- Causa probable: la transición de zona (cambiarZona) no considera el estado "navegando".
- Falta: adaptar cambiarZona() para que funcione si el jugador está en un barco (aparecer en el mismo tipo de agua del chunk siguiente).
Bug 3 · No se puede volver a la arena (tierra) desde el agua
- Mientras navega, el jugador está bloqueado en el agua. No puede pisar tierra sin bajarse del barco.
- Es consecuencia del Bug 1.
📖 Documentación
- README: sistema del barco agregado al MARCO 9, índice de bloques 7.11.
- BACKLOG: F18 actualizado con bugs pendientes.
⚠️ Estado
- v1.8.1 no es estable para el barco.
- El resto del juego funciona normal.
- La próxima sesión debe empezar por el Bug 1 (desembarco).
📐 Rediseño planificado (no implementado)
- Decisión: el sistema de permutacionBiomas() se reemplazará por una tabla JSON externa (biomas.json).
- Motivo: el sistema actual es rígido, difícil de escalar y tiene bugs.
- Nuevo sistema: biomas definidos como datos (vecinos permitidos + pesos + tiles con probabilidad).
- Nuevos biomas: oceano, desierto, nieve (total: 7 biomas naturales).
- Fase 2 (futuro): biomas forzados (ciudades, puertos, islas) + chunks de transición.
- Ver: BACKLOG · F14 y F15.
v1.7 · 2026-10-13 (sistema de rotura)
➕ Nuevo
- Sistema de rotura (js/systems/rotura.js).
- Click sostenido sobre un tile rompible (árbol, piedra, etc.).
- Barra de stamina arriba del mapa (100% → 0%).
- Cartel "Necesitás un hacha/pico" al intentar romper sin objeto.
- Al terminar la rotura: el tile se convierte al tileBase del bioma.
🔧 Cambios
- js/core/tiles.js: nuevo mapa ROTURA_POR_TILE (qué se rompe con qué).
- js/world/biomas.js: cada bioma ahora tiene un campo tileBase.
- js/core/config.js: DURACION_ROTURA_MS (3000) y INTERVALO_ROTURA_MS (50).
- js/main.js: reiniciarMundo() cancela rotura activa.
🎨 Diseño
- Barra de stamina con visibility (no mueve el layout al aparecer).
- Botón de cartel temporal (aparece y desaparece).
✅ Condiciones para romper
1. Click exacto sobre el tile.
2. Jugador adyacente (4 direcciones).
3. Objeto correcto equipado.
✅ Cancelaciones
- Al soltar el click.
- Al moverse el jugador.
- Al cambiar de zona.
- Al perder el objeto.
- Al reiniciar el mundo.
📖 Documentación
- README: MARCO 4.5 actualizado con sistema de rotura completo.
- BACKLOG: F11 marcado como completado.
⏸️ Pendiente futuro
- Objetos de mejor nivel (hacha de diamante, etc.) — ver F12.
- Más tiles rompibles — agregar a ROTURA_POR_TILE.
v1.6-alpha · 2026-10-11 (objetos equipables · EN DESARROLLO)
➕ Nuevo
- 3 objetos equipables: 🪓 Hacha, ⛏️ Pico, 🕯️ Linterna.
- Spawn único por mundo (1 de cada uno), determinista por semilla.
- Recolección al pisarlos (se suman al inventario del HUD).
- Sistema de forzar los 4 biomas por mundo (permutación por semilla).
- Nuevas funciones en items.js: obtenerZonaDeEquipable, obtenerEquipablesDeChunk, obtenerEquipableEn, recogerEquipableEn.
- Nueva función en mundo.js: permutacionBiomas.
🐛 Bug pendiente (bloquea v1.6)
- Permutación de biomas no funciona correctamente.
  - Con semilla diagnostico, la zona 2 repite el bioma de la zona 1.
  - El bioma "costa" no aparece nunca.
  - Los objetos 🕯️ Linterna no se generan.
- Próximo paso: diagnosticar permutacionBiomas() con console.log.
📖 Documentación
- README: nuevo MARCO 4.5 · Objetos equipables.
- CHANGELOG: esta entrada.
⚠️ Estado
- v1.6-alpha no es estable. El juego funciona, pero los objetos pueden no aparecer correctamente.
- La próxima sesión debe empezar retomando el bug de permutacionBiomas.
v1.5.1 · 2026-10-11 (fixes de IA)
🐛 Fixes
- Mobs spawneaban cerca del jugador → Zona 0 sin mobs (zona segura).
- Mobs atravesaban ítems (🍎) → ahora colisionan con ítems.
- Orientación de mobs invertida → corregido en moverMob().
- Jugador aparecía encima de un mob al cruzar zona → alejarMobsDelJugador() con radio de 3 tiles.
- El mob solo se alejaba 1 bloque → ahora empuja repetidamente hasta estar fuera del radio.
- Tigre no atacaba al alcanzar al jugador → moverMob() dispara batalla al pisar al jugador.
- ... fantasma en jugador.js → eliminado (bloqueaba toda la carga de scripts).
- } duplicado en ia.js → eliminado.
🔧 Nuevo
- RADIO_SEGURIDAD_SPAWN = 3 en config.js.
- Función alejarMobsDelJugador() en ia.js.
- Función generarDireccionesDeEscape() en ia.js.
📖 Documentación
- Separación del historial en CHANGELOG.md.
- Separación del backlog en BACKLOG.md.
- README reducido de ~800 a ~400 líneas.
v1.5 · 2026-10-11 (IA de mobs)
- ➕ IA de mobs en tiempo real (js/systems/ia.js).
- ➕ Sistema de ticks (400ms base, deambulación cada 2 ticks).
- ➕ Comportamiento hostil / pacífico / neutral.
- ➕ Deambulación aleatoria por el chunk.
- ➕ Persecución (hostil) y huida (pacífico).
- ➕ Mobs con orientación visual (espejado según dirección).
- ➕ Colisiones: bloqueantes, mobs, jugador, ítems, barrera de chunk.
- ➕ Pausa de ticks en overlays (batalla, transición).
- ➕ Zona 0 sin mobs (zona segura de spawn).
- 🔧 config.js agregado: TICK_MS, TICK_DEAMBULAR_CADA.
- 🔧 mobs.js actualizado: actitud.base = hostil/pacifico/neutral.
- 🔧 enemigos.js: estado mutable de cada mob (posición, IA).
- 🔧 jugador.js, victoria.js, chunks.js, main.js: pausa/reanudación de ticks.
- 📖 Backlog ampliado: F6 (pathfinding), F7 (deambulación realista), F8 (objetos equipables).
v1.4 · 2026-10-11 (subcarpetas)
- 🏗️ Reorganización en subcarpetas (core/, world/, entities/, ui/, systems/).
- ➕ 5 carpetas nuevas en js/.
- 🔧 15 archivos movidos a sus carpetas correspondientes.
- 🔧 <script src> actualizados con las nuevas rutas.
- 📌 systems/ queda preparada para sistemas futuros.
v1.3 · 2026-10-11 (semillas separadas)
- ➕ Semillas independientes por sistema (F4 implementado).
- ➕ SEMILLA_MOBS = Date.now() → los mobs cambian en cada carga de página.
- ➕ SEMILLA_OBJETOS = SEMILLA (preparada para separar en el futuro).
- 🔧 js/entities/enemigos.js ahora usa SEMILLA_MOBS.
- 🔧 js/entities/items.js ahora usa SEMILLA_OBJETOS.
v1.2 · 2026-10-10 (sistema de mobs)
- ➕ Sistema de mobs escalable (js/entities/mobs.js) — plantilla + 3 mobs.
- ➕ Spawn de mobs (js/entities/enemigos.js) — por chunk, según bioma.
- ➕ Batalla simulada al chocar con mob agresivo (overlay + botón).
- ➕ 3 mobs iniciales: 🐅 Tigre (agresivo), 🐓 Gallina (pasivo), 🐖 Cerdo (neutral).
- ➕ RNG separado para mobs (@mobs).
- 🔧 Fix de orientación del jugador (invertido).
- 📖 README reorganizado: 13 marcos + backlog de análisis futuros.
- 📌 Anotadas 5 ideas futuras: día-noche, movimiento amortiguado, capas, semillas separadas, spawn forzado.
v1.1 · 2026-10-11 (grilla 50×34)
- 🔧 Grilla cambiada a 50×34 (antes 25×17).
- 🔧 Tamaño de celda reducido a 16×16 px (antes 30×30).
- ➕ Orientación del jugador con scaleX(-1).
- ➕ Centralización de tamaño: todo derivado de config.js.
- 📌 Anotadas ideas: día-noche, movimiento amortiguado, capas.
- 📌 Decisión: enemigos 1×1, estructuras grandes (Forma A) → fase futura.
v1.0 · 2026-10-09 (GitHub + Pages)
- ☁️ Proyecto subido a GitHub: elingenierok/Game_RPG.
- 🌐 GitHub Pages activado: elingenierok.github.io/Game_RPG.
- 📖 README con flujo de trabajo Git documentado.
- 🔧 .gitignore creado.
- ➕ Prototipo 1 del módulo de combate.
v1.0-beta · 2026-10-09 (arquitectura modular)
- 🏗️ Refactorización completa a múltiples archivos.
- ➕ 13 archivos .js + css/estilo.css.
- ➕ Bloques 12-18 movidos a archivos individuales.
v0.5 · 2026-10-09 (refactor parcial)
- 🏗️ Refactorización parcial (bloques 1-11).
- ➕ 8 archivos .js creados.
- ⚠️ Requiere Live Server.
v0.4 · 2026-10-09 (ítems + límites)
- ➕ Ítems recolectables (🍎).
- ➕ Inventario en HUD.
- ➕ Control de semilla en UI.
- ➕ Límite configurable de chunks.
- ➕ Muros sólidos en extremos.
v0.3 · 2026-10-09 (fronteras compartidas)
- ➕ Fronteras compartidas entre chunks.
- ➕ Caché de chunks con precarga de vecinos.
- ➕ Continuidad física al cruzar.
- ➕ Validación BFS de transitabilidad.
v0.2 · 2026-10-09 (barra de zonas)
- ➕ Barra de zonas con 5 slots.
- ➕ Jugador centrado en la barra.
- ➕ Indicadores de zonas visitadas.
- ➕ Flechas direccionales.
- 🎨 Glow en slot actual.
v0.1 · 2026-10-09 (motor base)
- ➕ Motor inicial de generación con semilla.
- ➕ Mundo E-O por zonas.
- ➕ 4 biomas con frontera dura.
- ➕ Movimiento WASD + flechas.
Fin del CHANGELOG