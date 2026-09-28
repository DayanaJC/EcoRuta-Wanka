// Cliente de la API de optimización de OpenRouteService (motor VROOM).
// Recibe los datos ya validados por el servicio de rutas y devuelve el
// orden de visita, la distancia, los tiempos y el trazado de la ruta.

import { OptimizacionExternaError, OptimizacionNoConfiguradaError } from "../../errors/errores.js";
import { horaASegundos } from "../../utils/tiempo.js";

const URL_ORS = "https://api.openrouteservice.org/optimization";

// VROOM solo acepta cantidades enteras: el peso se envía en gramos
const aGramos = (kg) => Math.round(kg * 1000);
const PRIORIDAD_VROOM = { express: 100, estandar: 50, economico: 10 };
const FIN_DEL_DIA = 24 * 3600 - 1;

// Polilínea codificada (formato Google, precisión 5) -> [[lat, lon], ...]
export function decodificarPolilinea(texto) {
  const puntos = [];
  let i = 0;
  let lat = 0;
  let lon = 0;
  while (i < texto.length) {
    for (const eje of [0, 1]) {
      let resultado = 0;
      let desplazamiento = 0;
      let b;
      do {
        b = texto.charCodeAt(i++) - 63;
        resultado |= (b & 0x1f) << desplazamiento;
        desplazamiento += 5;
      } while (b >= 0x20);
      const delta = resultado & 1 ? ~(resultado >> 1) : resultado >> 1;
      if (eje === 0) lat += delta;
      else lon += delta;
    }
    puntos.push([lat / 1e5, lon / 1e5]);
  }
  return puntos;
}

export function crearClienteOrs({ apiKey, fetchImpl = fetch }) {
  return {
    configurado: Boolean(apiKey),

    /**
     * @param {{ almacen: {latitud:number, longitud:number}, vehiculo: object, pedidos: object[],
     *           horaSalida: string, factorVelocidad: number }} datos
     * @returns {{ paradas: {pedido_id:string, llegada_seg:number}[], no_asignados: string[],
     *             distancia_m:number, duracion_total_s:number, geometria: number[][] }}
     */
    async optimizarRuta({ almacen, vehiculo, pedidos, horaSalida, factorVelocidad }) {
      if (!apiKey) throw new OptimizacionNoConfiguradaError("El servicio de optimización no está configurado (falta ORS_API_KEY).");

      const deposito = [almacen.longitud, almacen.latitud];
      const cuerpo = {
        jobs: pedidos.map((p, i) => ({
          id: i + 1,
          location: [p.longitud, p.latitud],
          service: (p.tiempo_servicio_min ?? 5) * 60,
          delivery: [aGramos(p.peso_kg)],
          priority: PRIORIDAD_VROOM[p.prioridad] ?? 0,
          time_windows: [[horaASegundos(p.ventana_entrega_inicio), horaASegundos(p.ventana_entrega_fin)]],
        })),
        vehicles: [
          {
            id: 1,
            profile: "driving-car",
            start: deposito,
            end: deposito,
            capacity: [aGramos(vehiculo.capacidad_carga_kg)],
            time_window: [horaASegundos(horaSalida), FIN_DEL_DIA],
            // Factor de tráfico: < 1 hace que el vehículo avance más lento que en vías libres
            speed_factor: factorVelocidad,
          },
        ],
        options: { g: true },
      };

      let respuesta;
      try {
        respuesta = await fetchImpl(URL_ORS, {
          method: "POST",
          headers: { Authorization: apiKey, "Content-Type": "application/json" },
          body: JSON.stringify(cuerpo),
          signal: AbortSignal.timeout(30_000),
        });
      } catch (e) {
        throw new OptimizacionExternaError(`No se pudo contactar al servicio de optimización: ${e.message}`);
      }
      const datos = await respuesta.json().catch(() => null);
      if (!respuesta.ok || !datos || datos.error) {
        const detalle = datos?.error?.message ?? datos?.error ?? `HTTP ${respuesta.status}`;
        throw new OptimizacionExternaError(`El servicio de optimización respondió con un error: ${detalle}`);
      }

      const ruta = datos.routes?.[0];
      const noAsignados = (datos.unassigned ?? []).map((u) => pedidos[u.id - 1].id);
      if (!ruta) return { paradas: [], no_asignados: noAsignados, distancia_m: 0, duracion_total_s: 0, geometria: [] };

      // VROOM puede retrasar la salida para evitar esperas en ventanas tardías.
      // Recalculamos el horario saliendo a la hora pedida, con sus tiempos de
      // viaje (step.duration es el tiempo de manejo acumulado): si el vehículo
      // llega antes de que abra la ventana, espera y entrega al abrir.
      let reloj = horaASegundos(horaSalida);
      let manejoPrevio = 0;
      const paradas = [];
      for (const paso of ruta.steps) {
        if (paso.type === "start") continue;
        reloj += paso.duration - manejoPrevio;
        manejoPrevio = paso.duration;
        if (paso.type !== "job") continue;
        const pedido = pedidos[paso.id - 1];
        const entrega = Math.max(reloj, horaASegundos(pedido.ventana_entrega_inicio));
        paradas.push({ pedido_id: pedido.id, llegada_seg: entrega });
        reloj = entrega + (paso.service ?? 0);
      }

      return {
        paradas,
        no_asignados: noAsignados,
        distancia_m: ruta.distance ?? 0,
        // Desde la salida del almacén hasta el regreso, con tiempos de servicio y esperas
        duracion_total_s: reloj - horaASegundos(horaSalida),
        geometria: ruta.geometry ? decodificarPolilinea(ruta.geometry) : [],
      };
    },
  };
}
