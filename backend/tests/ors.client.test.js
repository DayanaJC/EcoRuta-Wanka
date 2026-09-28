// Pruebas del cliente de OpenRouteService con una respuesta simulada de la API.

import { describe, expect, it } from "vitest";
import { OptimizacionExternaError, OptimizacionNoConfiguradaError } from "../src/errors/errores.js";
import { crearClienteOrs, decodificarPolilinea } from "../src/services/optimizacion/ors.client.js";

const almacen = { latitud: -12.0681, longitud: -75.2104 };
const vehiculo = { capacidad_carga_kg: 1000 };
const pedidos = [
  { id: "a", latitud: -12.06, longitud: -75.2, peso_kg: 120.5, tiempo_servicio_min: 10, prioridad: "express", ventana_entrega_inicio: "08:00", ventana_entrega_fin: "12:00" },
  { id: "b", latitud: -12.05, longitud: -75.21, peso_kg: 30, tiempo_servicio_min: 5, prioridad: "economico", ventana_entrega_inicio: "10:00", ventana_entrega_fin: "12:00" },
];

const respuestaJson = (cuerpo, status = 200) => async () => ({ ok: status < 400, status, json: async () => cuerpo });

describe("decodificarPolilinea", () => {
  it("decodifica el ejemplo oficial del formato", () => {
    expect(decodificarPolilinea("_p~iF~ps|U_ulLnnqC_mqNvxq`@")).toEqual([
      [38.5, -120.2],
      [40.7, -120.95],
      [43.252, -126.453],
    ]);
  });
});

describe("crearClienteOrs", () => {
  it("falla con 503 si no hay API key", async () => {
    await expect(crearClienteOrs({ apiKey: null }).optimizarRuta({ almacen, vehiculo, pedidos, horaSalida: "08:00", factorVelocidad: 1 })).rejects.toBeInstanceOf(
      OptimizacionNoConfiguradaError,
    );
  });

  it("envía gramos, ventanas en segundos, prioridad y factor de velocidad", async () => {
    let enviado;
    const fetchImpl = async (url, opciones) => {
      enviado = JSON.parse(opciones.body);
      return respuestaJson({ routes: [{ distance: 0, geometry: "", steps: [{ type: "start", duration: 0 }, { type: "end", duration: 0 }] }], unassigned: [] })();
    };
    await crearClienteOrs({ apiKey: "k", fetchImpl }).optimizarRuta({ almacen, vehiculo, pedidos, horaSalida: "08:00", factorVelocidad: 0.7 });

    expect(enviado.jobs[0]).toMatchObject({ delivery: [120500], service: 600, priority: 100, time_windows: [[28800, 43200]], location: [-75.2, -12.06] });
    expect(enviado.vehicles[0]).toMatchObject({ capacity: [1000000], speed_factor: 0.7, start: [-75.2104, -12.0681], time_window: [28800, 86399] });
  });

  it("recalcula el horario desde la hora de salida y espera a que abra la ventana", async () => {
    // VROOM retrasa la salida (arrival) pero step.duration es el manejo acumulado
    const fetchImpl = respuestaJson({
      routes: [
        {
          distance: 8000,
          geometry: "_p~iF~ps|U",
          steps: [
            { type: "start", arrival: 34000, duration: 0 },
            { type: "job", id: 1, arrival: 34600, duration: 600, service: 600 },
            { type: "job", id: 2, arrival: 36000, duration: 900, service: 300 },
            { type: "end", arrival: 37000, duration: 1500 },
          ],
        },
      ],
      unassigned: [],
    });
    const r = await crearClienteOrs({ apiKey: "k", fetchImpl }).optimizarRuta({ almacen, vehiculo, pedidos, horaSalida: "08:00", factorVelocidad: 1 });

    // a: 08:00 + 10 min = 08:10; servicio 10 min -> 08:20; + 5 min -> 08:25, pero b abre a las 10:00
    expect(r.paradas).toEqual([
      { pedido_id: "a", llegada_seg: 8 * 3600 + 600 },
      { pedido_id: "b", llegada_seg: 10 * 3600 },
    ]);
    // 10:00 + 5 min de servicio + 10 min de regreso = 10:15 -> 2 h 15 min desde las 08:00
    expect(r.duracion_total_s).toBe(2 * 3600 + 15 * 60);
    expect(r).toMatchObject({ distancia_m: 8000, no_asignados: [], geometria: [[38.5, -120.2]] });
  });

  it("devuelve los pedidos no asignados", async () => {
    const fetchImpl = respuestaJson({ routes: [], unassigned: [{ id: 2 }] });
    const r = await crearClienteOrs({ apiKey: "k", fetchImpl }).optimizarRuta({ almacen, vehiculo, pedidos, horaSalida: "08:00", factorVelocidad: 1 });
    expect(r.no_asignados).toEqual(["b"]);
  });

  it("convierte los errores de la API en 502", async () => {
    const fetchImpl = respuestaJson({ error: { message: "Too many vehicles" } }, 400);
    await expect(
      crearClienteOrs({ apiKey: "k", fetchImpl }).optimizarRuta({ almacen, vehiculo, pedidos, horaSalida: "08:00", factorVelocidad: 1 }),
    ).rejects.toBeInstanceOf(OptimizacionExternaError);
  });
});
