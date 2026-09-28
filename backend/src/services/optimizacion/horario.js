// Programación del horario de una ruta con el orden ya optimizado.
//
// La API de optimización decide el ORDEN y los tiempos de manejo. Aquí se
// calcula la hora de entrega de cada parada y la SALIDA ÓPTIMA: si el
// vehículo llegaría a un cliente antes de que abra su ventana, conviene
// retrasar la salida del almacén en lugar de esperar en la calle, siempre
// que ninguna entrega quede después del cierre de su ventana menos un margen
// de seguridad.

/**
 * @typedef {{ id: string, viaje_s: number, servicio_s: number, ventana_inicio_s: number, ventana_fin_s: number }} ParadaEntrada
 *   viaje_s: segundos de manejo desde el punto anterior (almacén o parada previa)
 */

function simular(salida_s, paradas, regreso_s) {
  let reloj = salida_s;
  const resultado = paradas.map((p) => {
    const llegada = reloj + p.viaje_s;
    const entrega = Math.max(llegada, p.ventana_inicio_s);
    reloj = entrega + p.servicio_s;
    return { id: p.id, entrega_s: entrega, espera_s: entrega - llegada };
  });
  return { paradas: resultado, fin_s: reloj + regreso_s };
}

/**
 * @param {{ disponible_s: number, paradas: ParadaEntrada[], regreso_s: number,
 *           margen_s?: number, ajustarSalida?: boolean }} datos
 * @returns {{ salida_s: number, fin_s: number, espera_evitada_s: number,
 *             paradas: { id: string, entrega_s: number, espera_s: number }[] }}
 */
export function programarHorario({ disponible_s, paradas, regreso_s, margen_s = 15 * 60, ajustarSalida = true }) {
  const base = simular(disponible_s, paradas, regreso_s);
  if (!ajustarSalida || paradas.length === 0) return { salida_s: disponible_s, espera_evitada_s: 0, ...base };

  // Retrasar la salida d segundos desplaza la entrega de la parada i en
  // max(0, d - esperas acumuladas hasta i): cada espera "absorbe" el retraso.
  // Límite por parada: no pasar de (cierre - margen); si ya estaba dentro del
  // margen, no se empeora.
  let esperaAcumulada = 0;
  let retrasoMaximo = Infinity;
  base.paradas.forEach((p, i) => {
    esperaAcumulada += p.espera_s;
    const holgura = Math.max(0, paradas[i].ventana_fin_s - margen_s - p.entrega_s);
    retrasoMaximo = Math.min(retrasoMaximo, esperaAcumulada + holgura);
  });

  // Retrasar más que la espera total ya no acorta la ruta: solo la movería
  const retraso = Math.floor(Math.min(retrasoMaximo, esperaAcumulada) / 60) * 60;
  if (retraso <= 0) return { salida_s: disponible_s, espera_evitada_s: 0, ...base };

  return { salida_s: disponible_s + retraso, espera_evitada_s: retraso, ...simular(disponible_s + retraso, paradas, regreso_s) };
}
