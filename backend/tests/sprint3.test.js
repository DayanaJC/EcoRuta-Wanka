// Pruebas del Sprint 3: preferencias de entrega de clientes/bodegas (RF-09) y
// re-optimización de rutas ante incidentes durante el reparto (RF-07).

import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { crearApp } from "../src/aplicacion.js";
import { horaASegundos } from "../src/utils/tiempo.js";
import { crearOptimizadorFalso, crearRepositoriosMemoria, pedidoValido, vehiculoValido } from "./helpers/memoria.js";

const ALMACEN = { nombre: "Almacén", latitud: -12.0681, longitud: -75.2104 };
// 10:00 del lunes 28/09/2026 en Lima
const RELOJ = () => new Date("2026-09-28T15:00:00Z");
let api, optimizador, placas, codigos;

const montar = (opt = crearOptimizadorFalso()) => {
  optimizador = opt;
  api = request(
    crearApp({ repos: crearRepositoriosMemoria(), optimizador, geocodificador: {}, almacen: ALMACEN, reloj: RELOJ, aleatorio: () => 0.5 }),
  );
};

beforeEach(() => {
  placas = 100;
  codigos = 100;
  montar();
});

const clienteValido = (extra = {}) => ({
  codigo: "cli-0001",
  nombre: "Bodega Doña Rosa",
  direccion: "Jr. Ica 320, Huancayo",
  latitud: -12.0651,
  longitud: -75.2049,
  ventana_inicio: "09:00",
  ventana_fin: "13:00",
  ...extra,
});
const crearCliente = async (extra) => (await api.post("/api/v1/clientes").send(clienteValido(extra)).expect(201)).body;
const crearVehiculo = async () => (await api.post("/api/v1/vehiculos").send(vehiculoValido({ placa: `ABC-${placas++}` })).expect(201)).body;
const crearPedido = async (extra) =>
  (await api.post("/api/v1/pedidos").send(pedidoValido({ cliente_id: `CLI-${codigos++}`, ...extra })).expect(201)).body;
const generarRuta = async (pedidos, extra = {}, estado = 201) => {
  const v = await crearVehiculo();
  return api
    .post("/api/v1/rutas")
    .send({ vehiculo_id: v.id, pedido_ids: pedidos.map((p) => p.id), fecha: "2026-09-28", hora_salida: "08:00", ajustar_salida: false, ...extra })
    .expect(estado);
};

describe("clientes y preferencias de entrega (RF-09)", () => {
  it("registra un cliente con sus preferencias (valores por defecto incluidos)", async () => {
    const c = await crearCliente({ dias_recepcion: [6, 1, 1, 3] });
    expect(c).toMatchObject({
      codigo: "CLI-0001", tipo: "bodega", ventana_inicio: "09:00", ventana_fin: "13:00",
      dias_recepcion: [1, 3, 6], tiempo_atencion_min: 5, telefono: null, estado: "activo",
    });
    const otro = await crearCliente({ codigo: "CLI-0002" });
    expect(otro.dias_recepcion).toEqual([1, 2, 3, 4, 5, 6]);
    const lista = (await api.get("/api/v1/clientes?busqueda=rosa").expect(200)).body;
    expect(lista).toHaveLength(2);
  });

  it("valida el horario, los días y que el código no se repita", async () => {
    await api.post("/api/v1/clientes").send(clienteValido({ ventana_inicio: "14:00", ventana_fin: "10:00" })).expect(422);
    await api.post("/api/v1/clientes").send(clienteValido({ dias_recepcion: [] })).expect(422);
    await api.post("/api/v1/clientes").send(clienteValido({ codigo: "a" })).expect(422);
    await crearCliente();
    const res = await api.post("/api/v1/clientes").send(clienteValido({ nombre: "Otra bodega" })).expect(409);
    expect(res.body.detail).toMatch(/CLI-0001/);
  });

  it("actualiza la preferencia (el código no cambia) y desactiva al cliente", async () => {
    const c = await crearCliente();
    const editado = (await api.put(`/api/v1/clientes/${c.id}`).send({ codigo: "CLI-9999", ventana_fin: "16:00", indicaciones: "Tocar el timbre" }).expect(200)).body;
    expect(editado).toMatchObject({ codigo: "CLI-0001", ventana_fin: "16:00", indicaciones: "Tocar el timbre" });
    await api.put(`/api/v1/clientes/${c.id}`).send({ ventana_inicio: "17:00" }).expect(422);
    const inactivo = (await api.patch(`/api/v1/clientes/${c.id}/estado`).send({ estado: "inactivo" }).expect(200)).body;
    expect(inactivo.estado).toBe("inactivo");
    await api.get("/api/v1/clientes/no-existe").expect(404);
  });

  it("la ruta usa el horario preferido del cliente (intersección con la ventana del pedido)", async () => {
    await crearCliente({ ventana_inicio: "10:00", ventana_fin: "11:30" });
    const conPreferencia = await crearPedido({ cliente_id: "CLI-0001", ventana_entrega_inicio: "08:00", ventana_entrega_fin: "12:00" });
    const sinCliente = await crearPedido();
    await generarRuta([conPreferencia, sinCliente], {}, 201);
    const enviados = Object.fromEntries(optimizador.ultimaLlamada.pedidos.map((p) => [p.id, `${p.ventana_entrega_inicio}-${p.ventana_entrega_fin}`]));
    expect(enviados[conPreferencia.id]).toBe("10:00-11:30");
    expect(enviados[sinCliente.id]).toBe("08:00-12:00");
  });

  it("rechaza la ruta si el cliente no recibe ese día o si su horario no coincide con el pedido", async () => {
    // 28/09/2026 es lunes (1)
    await crearCliente({ dias_recepcion: [2, 4] });
    const p = await crearPedido({ cliente_id: "CLI-0001" });
    let res = await generarRuta([p], {}, 422);
    expect(res.body.detail).toMatch(/no reciben pedidos los lunes/);
    await generarRuta([p], { fecha: "2026-09-29" }, 201);

    await crearCliente({ codigo: "CLI-0002", ventana_inicio: "15:00", ventana_fin: "18:00" });
    const q = await crearPedido({ cliente_id: "CLI-0002" });
    res = await generarRuta([q], {}, 422);
    expect(res.body.detail).toMatch(/prefiere 15:00-18:00/);
  });

  it("un cliente inactivo no impone sus preferencias", async () => {
    const c = await crearCliente({ dias_recepcion: [2] });
    await api.patch(`/api/v1/clientes/${c.id}/estado`).send({ estado: "inactivo" }).expect(200);
    const p = await crearPedido({ cliente_id: "CLI-0001" });
    await generarRuta([p], {}, 201);
  });
});

describe("re-optimización ante incidentes (RF-07)", () => {
  // Optimizador falso: orden inverso, 10 min por tramo. Ruta de 2 pedidos saliendo a las 08:00:
  // B 08:10, A 08:25, regreso 08:40. Se inicia a las 10:00 (reloj de las pruebas).
  const rutaEnReparto = async (extra = {}) => {
    const a = await crearPedido({ cliente_nombre: "Bodega A", ...extra });
    const b = await crearPedido({ cliente_nombre: "Bodega B", ...extra });
    const ruta = (await generarRuta([a, b], {}, 201)).body;
    await api.patch(`/api/v1/rutas/${ruta.id}/estado`).send({ estado: "en_reparto" }).expect(200);
    return { ruta, a, b };
  };
  const incidente = (ruta, datos) => api.post(`/api/v1/rutas/${ruta.id}/incidentes`).send(datos);

  it("guarda el tramo planificado de cada parada al generar la ruta", async () => {
    const { ruta } = await rutaEnReparto();
    expect(ruta.paradas.map((p) => p.viaje_planificado_s)).toEqual([600, 600]);
  });

  it("mantiene la planificación si ninguna entrega queda fuera de su ventana", async () => {
    const { ruta } = await rutaEnReparto();
    const res = (await incidente(ruta, { tipo: "trafico_intenso", retraso_min: 10 }).expect(201)).body;
    expect(res.paradas.map((p) => p.hora_estimada_llegada)).toEqual(ruta.paradas.map((p) => p.hora_estimada_llegada));
    expect(res.reoptimizada_at).toBeFalsy();
    expect(res.incidentes).toHaveLength(1);
    const [i] = res.incidentes;
    expect(i).toMatchObject({ tipo: "trafico_intenso", resultado: "sin_cambios", hora_referencia: "10:00", factor_velocidad: 0.7 });
    expect(i.resumen.mensaje).toMatch(/se mantiene la planificación/);
    expect(i.resumen.antes.fuera_ventana).toEqual([]);
    // Salió del almacén sin atender a nadie: la posición es el almacén
    expect([i.latitud, i.longitud]).toEqual([ALMACEN.latitud, ALMACEN.longitud]);
  });

  it("re-optimiza las paradas pendientes cuando el incidente deja entregas fuera de ventana e informa el cambio", async () => {
    const { ruta, a, b } = await rutaEnReparto();
    const res = (await incidente(ruta, { tipo: "via_bloqueada", descripcion: "Av. Ferrocarril cerrada", retraso_min: 120 }).expect(201)).body;
    const [i] = res.incidentes;
    expect(i.resultado).toBe("reoptimizada");
    expect(i.resumen.antes.fuera_ventana).toEqual(["Bodega B", "Bodega A"]);
    expect(i.resumen.orden_cambiado).toBe(true);
    expect(i.resumen.mensaje).toMatch(/Ruta actualizada desde las 12:00/);
    // El optimizador falso invierte el orden pendiente (B, A) -> A, B
    expect(res.paradas.map((p) => [p.orden, p.pedido_id, p.hora_estimada_llegada, p.estado])).toEqual([
      [1, a.id, "12:10", "pendiente"],
      [2, b.id, "12:25", "pendiente"],
    ]);
    expect(res.hora_replanificacion).toBe("12:00");
    expect(res.reoptimizada_at).toBeTruthy();
    // 08:00 -> 12:40 (12:25 + 5 de atención + 10 de regreso)
    expect(res.tiempo_estimado_min).toBe(280);
    expect(optimizador.ultimaLlamada).toMatchObject({ inicio: ALMACEN, horaSalida: "12:00", factorVelocidad: 0.8 });
  });

  it("conserva las paradas atendidas y sale desde la última entrega", async () => {
    const { ruta, b } = await rutaEnReparto();
    await api.patch(`/api/v1/rutas/${ruta.id}/paradas/1`).send({ resultado: "entregada" }).expect(200);
    const res = (await incidente(ruta, { tipo: "lluvia", forzar: true, hora: "10:30" }).expect(201)).body;
    expect(res.paradas[0]).toMatchObject({ orden: 1, pedido_id: b.id, estado: "entregada" });
    expect(res.paradas[1]).toMatchObject({ orden: 2, estado: "pendiente", hora_estimada_llegada: "10:40" });
    expect(optimizador.ultimaLlamada.inicio.id).toBe(b.id);
    expect(optimizador.ultimaLlamada.pedidos).toHaveLength(1);
    // Recorrido hecho (20 km del falso) + tramo replanificado (12,345 km)
    expect(res.distancia_estimada_km).toBe(32.34);
    expect(res.incidentes[0].hora_referencia).toBe("10:30");
  });

  it("acepta la posición indicada por el operador", async () => {
    const { ruta } = await rutaEnReparto();
    const res = (await incidente(ruta, { tipo: "accidente", forzar: true, latitud: -12.07, longitud: -75.21 }).expect(201)).body;
    expect(optimizador.ultimaLlamada.inicio).toEqual({ latitud: -12.07, longitud: -75.21 });
    expect(res.incidentes[0]).toMatchObject({ latitud: -12.07, longitud: -75.21 });
    await incidente(ruta, { tipo: "accidente", latitud: -12.07 }).expect(422);
    await incidente(ruta, { tipo: "terremoto" }).expect(422);
  });

  it("solo se registran incidentes en rutas en reparto con entregas pendientes", async () => {
    const p = await crearPedido();
    const ruta = (await generarRuta([p], {}, 201)).body;
    let res = await incidente(ruta, { tipo: "otro" }).expect(409);
    expect(res.body.detail).toMatch(/genera una nueva/);
    await api.patch(`/api/v1/rutas/${ruta.id}/estado`).send({ estado: "en_reparto" }).expect(200);
    await api.patch(`/api/v1/rutas/${ruta.id}/paradas/1`).send({ resultado: "entregada" }).expect(200);
    res = await incidente(ruta, { tipo: "otro" }).expect(409);
    expect(res.body.detail).toMatch(/completada/);
    await api.post("/api/v1/rutas/no-existe/incidentes").send({ tipo: "otro" }).expect(404);
  });

  it("si una entrega ya no llega a tiempo, la mantiene en la ruta (fuera de ventana) y lo informa", async () => {
    // Optimizador que, como VROOM, deja sin asignar los pedidos cuya ventana cierra antes de la salida
    const base = crearOptimizadorFalso();
    montar({
      ...base,
      async optimizarRuta(datos) {
        const salida = horaASegundos(datos.horaSalida);
        const imposibles = datos.pedidos.filter((p) => horaASegundos(p.ventana_entrega_fin) < salida).map((p) => p.id);
        const r = await base.optimizarRuta.call(this, { ...datos, pedidos: datos.pedidos.filter((p) => !imposibles.includes(p.id)) });
        return { ...r, no_asignados: imposibles };
      },
    });
    const { ruta } = await rutaEnReparto({ ventana_entrega_inicio: "08:00", ventana_entrega_fin: "11:00" });
    const res = (await incidente(ruta, { tipo: "retraso_vehiculo", retraso_min: 90 }).expect(201)).body;
    expect(res.paradas.filter((p) => p.estado === "pendiente")).toHaveLength(2);
    const { resumen } = res.incidentes[0];
    expect(resumen.despues.fuera_ventana).toHaveLength(2);
    expect(resumen.mensaje).toMatch(/Llegarán fuera de su ventana/);
  });

  it("el simulador continúa la ruta re-optimizada desde la hora replanificada", async () => {
    const { ruta } = await rutaEnReparto();
    await incidente(ruta, { tipo: "via_bloqueada", retraso_min: 120 }).expect(201);
    const fin = (await api.post(`/api/v1/rutas/${ruta.id}/simular`).send({}).expect(200)).body;
    expect(fin.estado).toBe("completada");
    expect(fin.paradas.every((p) => p.estado === "entregada")).toBe(true);
    // La primera entrega ocurre después de las 12:00 (hora replanificada), 17:00 UTC
    expect(new Date(fin.paradas[0].entregado_at).getTime()).toBeGreaterThan(new Date("2026-09-28T17:00:00Z").getTime());
  });
});
