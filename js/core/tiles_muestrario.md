## 🎨 Lo que se puede modificar de un emoji

### 1 · Transformaciones geométricas (CSS `transform`)

| Transformación | CSS | Utilidad en tu proyecto |
|----------------|-----|-------------------------|
| **Flip horizontal** | `scaleX(-1)` | Ya usado (jugador, mobs) |
| **Flip vertical** | `scaleY(-1)` | Fuego 🔥, flechas ↑↓, hojas 🍃 |
| **Rotación arbitraria** | `rotate(45deg)` | Flechas apuntando a NE, NW, SE, SW |
| **Rotación animada** | `rotate()` + `transition` | Reloj, brújula, engranaje |
| **Escala (tamaño)** | `scale(2)` | Mobs grandes (tigre 2×2), objetos destacados |
| **Espejo en diagonal** | `scale(-1, 1)` combinado con `rotate()` | Efectos ópticos |

**Ejemplo real para tu juego:** una flecha `➡️` puede apuntar a las 8 direcciones combinando `scaleX(-1)` + `rotate(Ndeg)`.

---

### 2 · Tamaño en la grilla (layout, no transform)

| Cambio | Cómo | Utilidad |
|--------|------|----------|
| **1×1 normal** | Actual | Mobs comunes |
| **2×2 (mob grande)** | Ocupa 4 celdas del grid, emoji con `font-size` doble | Jefe, tigre alfa, estructura |
| **3×3 (estructura)** | Ídem | Árbol grande, roca, altar |
| **1×2 (alto)** | Solo una columna, dos filas | Puerta, antorcha alta |
| **2×1 (ancho)** | Dos columnas, una fila | Tronco caído, valla |

**Nota:** tu proyecto ya usa 1×1. Pasar a 2×2 **es posible** pero requiere tocar el sistema de colisiones y el render. Es un cambio medio.

---

### 3 · Color / apariencia del emoji

Acá hay **limitaciones técnicas** porque los emojis son fuente, no imagen.

| Cosa | ¿Se puede? | Cómo |
|------|:----------:|------|
| Cambiar el color del emoji en sí | ❌ No | El emoji trae su color incorporado |
| Aplicar filtro de color | ✅ Parcial | `filter: hue-rotate(90deg)` cambia el tono (funciona en algunos SO, no en todos) |
| Aplicar opacidad | ✅ Sí | `opacity: 0.5` |
| Aplicar brillo / saturación | ✅ Sí | `filter: brightness(1.5)` |
| **Cambiar el color de fondo** de la celda | ✅ Sí | Ya lo estás usando (color por bioma) |
| **Aplicar un halo/glow** | ✅ Sí | `text-shadow: 0 0 6px cyan` |
| **Poner un borde de color** | ✅ Sí | `border: 1px solid red` en la celda |

**Truco útil para tu proyecto:** si querés que un mob se vea "enojado" o "herido", podés usar `filter: hue-rotate()` o `filter: brightness()` para que se vea distinto, sin cambiar el emoji.

**Ejemplo:** un 👽 con `filter: hue-rotate(120deg)` se ve verde en vez de gris/verde pálido.

---

### 4 · Efectos visuales

| Efecto | CSS | Utilidad |
|--------|-----|----------|
| **Glow (halo)** | `text-shadow: 0 0 8px cyan` | Ya usado en la identidad visual |
| **Sombra proyectada** | `filter: drop-shadow(2px 2px 2px black)` | Profundidad |
| **Parpadeo** | `animation: parpadeo` | Objeto brillante, daño recibido |
| **Vibración** | `animation: shake` | Objeto "vivo", combate |
| **Latido** | `animation: pulse` (scale 1 → 1.1 → 1) | Corazón, recuperación |
| **Rotación continua** | `animation: spin` | Portal, energía |

**Ejemplo:** un 🔮 (orbe mágico) con `pulse` se ve como si latiera. Un ✨ con `spin` gira constantemente.

---

### 5 · Animación de tiles (lo que estábamos viendo)

| Técnica | Cómo | Utilidad |
|---------|------|----------|
| **Flip alternado** | `scaleX(1)` ↔ `scaleX(-1)` | Fuego, hoja |
| **Secuencia de emojis** | Ciclar array | 🌍🌎🌏, 🌑🌒🌓... |
| **Rotación alternada** | `rotate(0)` ↔ `rotate(180deg)` | ⛓️, reloj |
| **Cambio de opacidad** | `opacity: 1` ↔ `opacity: 0.5` | Antorcha, faro |
| **Cambio de escala** | `scale(1)` ↔ `scale(1.2)` | Latido, respiración |
| **Cambio de color (filtro)** | `filter: hue-rotate(0)` ↔ `hue-rotate(180deg)` | Cristales, energía |

---

### 6 · Cambios de "estado" (lógica, no CSS)

Estos no son transformaciones visuales, pero son **muy útiles**:

| Cambio | Ejemplo |
|--------|---------|
| **Emoji por estado** | Jugador: 🧍 quieto, 🏃 corriendo, 🚣 en barco |
| **Emoji por orientación** | Flecha: ➡️⬅️⬆️⬇️ |
| **Emoji por vida** | ❤️❤️❤️ → ❤️❤️🖤 → ❤️🖤🖤 |
| **Emoji por bioma** | 🌳 en bosque, 🌵 en desierto |
| **Emoji por hora** | ☀️ de día, 🌙 de noche |

---

## 📋 Resumen práctico para tu proyecto

### Lo que ya usás:

- ✅ Flip horizontal (jugador, mobs)
- ✅ Secuencia de emojis (jugador al correr)
- ✅ Color de fondo por bioma

### Lo que podés agregar con poco esfuerzo:

1. **Flip vertical** → fuego animado, antorchas.
2. **Glow / text-shadow** → ítems destacados, llave.
3. **Pulse** → orbes, recuperación.
4. **Rotación estática** → flechas direccionales (N, NE, E, SE, S, SO, O, NO).
5. **Cambio de emoji por estado** → "tigre herido" vs "tigre sano".

### Lo que requiere más trabajo:

6. **Rotación animada** → girar un emoji continuamente (reloj, portal).
7. **Filtros de color** (`hue-rotate`) → variantes del mismo emoji.
8. **Mobs 2×2** → sistema de colisiones y render multi-celda.
9. **Sprites reales (PNG)** → reemplazar emojis por imágenes (F20 del BACKLOG).

### Lo que NO se puede:

- ❌ Cambiar el color interno de un emoji.
- ❌ Hacer transparente una parte del emoji (ya lo vimos).
- ❌ Usar un emoji "con fondo transparente" (eso requiere PNG).

---

## Ideas concretas para el tema espacio

| Cosa | Transformación | Resultado |
|------|----------------|-----------|
| 🔥 (llama) | flip vertical a 300ms | Llama viva |
| 🌪️ (tornado) | rotación alternada | Tornado activo |
| 🛸 (nave) | pulse lento | Nave flotando |
| 🔮 (orbe) | pulse + hue-rotate | Orbe mágico |
| ⚡ (sable) | parpadeo | Energía activa |
| 👽 (alien) | flip horizontal al caminar | Ya funciona |
| 🗼 (torre) | pulse de brillo | Antena activa |
| 🪐 (anillo) | rotación estática | Anillo inclinado |
| ☄️ (meteorito) | rotación dinámica | Meteorito cayendo |

---

¿Querés que probemos **algunos de estos** en el HTML de prueba? Yo sugiero empezar por los más útiles:

1. **Rotación** (para direcciones).
2. **Pulse** (para objetos vivos).
3. **Glow** (para destacar ítems).

