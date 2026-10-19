// ═══════════════════════════════════════════════════════════════
//  BLOQUE 7.12 · SISTEMA DE EFECTOS VISUALES GENÉRICOS
// ─────────────────────────────────────────────────────────────────
//  Efectos desacoplados del render y de la entidad.
//
//  Uso:
//    aplicarEfecto(wx, wy, "efecto-ataque", 500);       // temporal
//    aplicarEfecto(wx, wy, "efecto-golpe");             // permanente
//    quitarEfecto(wx, wy, "efecto-golpe");              // forzar quitado
//
//  El render consulta obtenerEfectosDe(wx, wy) cada frame y
//  aplica las clases CSS correspondientes a la celda.
// ═══════════════════════════════════════════════════════════════

const efectosActivos = new Map();  // "wx,wy" → [{ clase, hasta }]

// ─── Aplicar un efecto ───
//  duracionMs: si se pasa, expira solo. Si no, dura hasta quitarEfecto.
function aplicarEfecto(wx, wy, clase, duracionMs) {
  const clave = wx + "," + wy;
  if (!efectosActivos.has(clave)) efectosActivos.set(clave, []);
  const lista = efectosActivos.get(clave);

  const idx = lista.findIndex(e => e.clase === clase);
  const nuevo = {
    clase,
    hasta: duracionMs ? Date.now() + duracionMs : Infinity,
  };

  if (idx >= 0) lista[idx] = nuevo;
  else lista.push(nuevo);
}

// ─── Quitar un efecto puntual ───
function quitarEfecto(wx, wy, clase) {
  const clave = wx + "," + wy;
  const lista = efectosActivos.get(clave);
  if (!lista) return;

  const idx = lista.findIndex(e => e.clase === clase);
  if (idx >= 0) lista.splice(idx, 1);

  if (lista.length === 0) efectosActivos.delete(clave);
}

// ─── Quitar todos los efectos de una celda ───
function quitarTodosLosEfectos(wx, wy) {
  const clave = wx + "," + wy;
  efectosActivos.delete(clave);
}

// ─── Obtener los efectos activos de una celda (filtrando expirados) ───
function obtenerEfectosDe(wx, wy) {
  if (efectosActivos.size === 0) return [];
  const clave = wx + "," + wy;
  const lista = efectosActivos.get(clave);
  if (!lista) return [];

  const ahora = Date.now();
  const vivos = lista.filter(e => e.hasta > ahora);

  if (vivos.length === 0) efectosActivos.delete(clave);
  else efectosActivos.set(clave, vivos);

  return vivos.map(e => e.clase);
}

// ─── Limpiar todo (al reiniciar mundo) ───
function limpiarEfectos() {
  efectosActivos.clear();
}