// Pruebas de los endpoints (Supertest) con repositorios en memoria.

import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { crearApp } from "../src/app.js";
import { crearOptimizadorFalso, crearRepositoriosMemoria, pedidoValido, vehiculoValido } from "./helpers/memoria.js";

const ALMACEN = { nombre: "Almacén", latitud: -12.0681, longitud: -75.2104 };
let repos, optimizador, api;

beforeEach(() => {
  repos = crearRepositoriosMemoria();
  optimizador = crearOptimizadorFalso();
  api = request(crearApp({ repos, optimizador, almacen: ALMACEN }));
});

const crearVehiculo = async (extra) => (await api.post("/api/v1/vehiculos").send(vehiculoValido(extra)).expect(201)).body;
const crearPedido = async (extra) => (await api.post("/api/v1/pedidos").send(pedidoValido(extra)).expect(201)).body;

describe("salud", () => {
  it("responde ok con base de datos y optimización", async () => {
    const res = await api.get("/health").expect(200);
    expect(res.body).toMatchObject({ status: "ok", database: { connected: true }, optimizacion: { configurada: true } });
  });

  it("responde 404 con { detail } en rutas inexistentes", async () => {
    const res = await api.get("/api/v1/no-existe").expect(404);
    expect(res.body.detail).toMatch(/No existe el recurso/);
  });
});

describe("vehículos (RF-01)", () => {
  it("registra normalizando la placa a mayúsculas", async () => {
    const v = await crearVehiculo({ placa: " abc-123 " });
    expect(v).toMatchObject({ placa: "ABC-123", estado: "activo" });
  });

  it("rechaza placas con formato inválido (422)", async () => {
    const res = await api.post("/api/v1/vehiculos").send(vehiculoValido({ placa: "AB-1234" })).expect(422);
    expect(res.body.detail).toMatch(/placa/i);
  });

  it("rechaza placas duplicadas (409)", async () => {
    await crearVehiculo();
    await api.post("/api/v1/vehiculos").send(vehiculoValido()).expect(409);
  });

  it("valida capacidad y año de fabricación", async () => {
    await api.post("/api/v1/vehiculos").send(vehiculoValido({ capacidad_carga_kg: 0 })).expect(422);
    await api.post("/api/v1/vehiculos").send(vehiculoValido({ anio_fabricacion: 1970 })).expect(422);
  });

  it("filtra por estado, actualiza y desactiva", async () => {
    const v = await crearVehiculo();
    await crearVehiculo({ placa: "DEF-456", estado: "inactivo" });
    expect((await api.get("/api/v1/vehiculos?estado=activo")).body).toHaveLength(1);

    const editado = (await api.put(`/api/v1/vehiculos/${v.id}`).send({ capacidad_carga_kg: 800 }).expect(200)).body;
    expect(editado.capacidad_carga_kg).toBe(800);

    await api.put(`/api/v1/vehiculos/${v.id}`).send({ placa: "DEF-456" }).expect(409);
    expect((await api.delete(`/api/v1/vehiculos/${v.id}`).expect(200)).body.estado).toBe("inactivo");
  });

  it("devuelve 404 si el vehículo no existe", async () => {
    await api.get("/api/v1/vehiculos/no-existe").expect(404);
    await api.patch("/api/v1/vehiculos/no-existe/estado").send({ estado: "activo" }).expect(404);
  });
});

describe("pedidos (RF-02)", () => {
  it("registra con valores por defecto", async () => {
    const p = await crearPedido();
    expect(p).toMatchObject({ estado: "pendiente", punto_referencia: "", tiempo_servicio_min: 5 });
  });

  it("rechaza hora con formato inválido y ventana invertida (422)", async () => {
    await api.post("/api/v1/pedidos").send(pedidoValido({ ventana_entrega_inicio: "9:00" })).expect(422);
    const res = await api.post("/api/v1/pedidos").send(pedidoValido({ ventana_entrega_inicio: "12:00", ventana_entrega_fin: "08:00" })).expect(422);
    expect(res.body.detail).toMatch(/ventana/i);
  });

  it("valida la ventana combinando con los datos actuales al editar", async () => {
    const p = await crearPedido();
    await api.put(`/api/v1/pedidos/${p.id}`).send({ ventana_entrega_inicio: "13:00" }).expect(422);
    await api.put(`/api/v1/pedidos/${p.id}`).send({ ventana_entrega_inicio: "09:00" }).expect(200);
  });

  it("filtra por estado, prioridad y búsqueda de texto", async () => {
    await crearPedido();
    await crearPedido({ cliente_id: "CLI-0002", cliente_nombre: "Minimarket El Tambo", prioridad: "express" });
    expect((await api.get("/api/v1/pedidos?prioridad=express")).body).toHaveLength(1);
    expect((await api.get("/api/v1/pedidos?busqueda=tambo")).body[0].cliente_nombre).toBe("Minimarket El Tambo");
    expect((await api.get("/api/v1/pedidos?estado=cancelado")).body).toHaveLength(0);
  });

  it("no permite modificar ni cambiar el estado de pedidos entregados (409)", async () => {
    const p = await crearPedido();
    await api.patch(`/api/v1/pedidos/${p.id}/estado`).send({ estado: "entregado" }).expect(200);
    await api.put(`/api/v1/pedidos/${p.id}`).send({ peso_kg: 10 }).expect(409);
    await api.patch(`/api/v1/pedidos/${p.id}/estado`).send({ estado: "pendiente" }).expect(409);
    await api.delete(`/api/v1/pedidos/${p.id}`).expect(409);
  });

  it("cancelar es idempotente", async () => {
    const p = await crearPedido();
    expect((await api.delete(`/api/v1/pedidos/${p.id}`).expect(200)).body.estado).toBe("cancelado");
    expect((await api.delete(`/api/v1/pedidos/${p.id}`).expect(200)).body.estado).toBe("cancelado");
  });
});

describe("asignaciones", () => {
  it("asigna un pedido a un vehículo activo con capacidad", async () => {
    const v = await crearVehiculo();
    const p = await crearPedido();
    const a = (await api.post("/api/v1/asignaciones").send({ pedido_id: p.id, vehiculo_id: v.id }).expect(201)).body;
    expect(a.estado).toBe("asignada");
    expect((await api.get(`/api/v1/asignaciones/pedido/${p.id}`)).body).toHaveLength(1);
    expect((await api.get(`/api/v1/asignaciones/vehiculo/${v.id}`)).body).toHaveLength(1);
  });

  it("aplica las reglas de disponibilidad y capacidad", async () => {
    const v = await crearVehiculo({ capacidad_carga_kg: 50 });
    const inactivo = await crearVehiculo({ placa: "DEF-456", estado: "inactivo" });
    const p = await crearPedido();
    await api.post("/api/v1/asignaciones").send({ pedido_id: "x", vehiculo_id: v.id }).expect(404);
    await api.post("/api/v1/asignaciones").send({ pedido_id: p.id, vehiculo_id: "x" }).expect(404);
    await api.post("/api/v1/asignaciones").send({ pedido_id: p.id, vehiculo_id: inactivo.id }).expect(409);
    const res = await api.post("/api/v1/asignaciones").send({ pedido_id: p.id, vehiculo_id: v.id }).expect(409);
    expect(res.body.detail).toMatch(/pesa 120 kg/);
  });

  it("no permite dos asignaciones activas del mismo pedido y cancelar libera el pedido", async () => {
    const v = await crearVehiculo();
    const p = await crearPedido();
    const a = (await api.post("/api/v1/asignaciones").send({ pedido_id: p.id, vehiculo_id: v.id }).expect(201)).body;
    await api.post("/api/v1/asignaciones").send({ pedido_id: p.id, vehiculo_id: v.id }).expect(409);
    await api.delete(`/api/v1/asignaciones/${a.id}`).expect(200);
    await api.delete(`/api/v1/asignaciones/${a.id}`).expect(200);
    await api.post("/api/v1/asignaciones").send({ pedido_id: p.id, vehiculo_id: v.id }).expect(201);
  });

  it("no asigna pedidos cancelados", async () => {
    const v = await crearVehiculo();
    const p = await crearPedido();
    await api.delete(`/api/v1/pedidos/${p.id}`);
    await api.post("/api/v1/asignaciones").send({ pedido_id: p.id, vehiculo_id: v.id }).expect(409);
  });
});

describe("rutas optimizadas (RF-03)", () => {
  it("genera la ruta con el orden devuelto por el optimizador", async () => {
    const v = await crearVehiculo();
    const p1 = await crearPedido();
    const p2 = await crearPedido({ cliente_id: "CLI-0002", cliente_nombre: "Farmacia Chilca" });
    const ruta = (
      await api.post("/api/v1/rutas").send({ vehiculo_id: v.id, pedido_ids: [p1.id, p2.id], fecha: "2026-09-28", hora_salida: "08:00" }).expect(201)
    ).body;

    expect(ruta.pedido_ids).toEqual([p2.id, p1.id]);
    expect(ruta.paradas.map((x) => x.orden)).toEqual([1, 2]);
    expect(ruta.paradas[0].hora_estimada_llegada).toBe("08:10");
    expect(ruta).toMatchObject({ estado: "generada", distancia_estimada_km: 12.35, tiempo_estimado_min: 60, hora_salida: "08:00" });
    expect(optimizador.ultimaLlamada.almacen).toEqual(ALMACEN);
  });

  it("aplica el factor de tráfico de la franja y tipo de día", async () => {
    repos.factoresTrafico.agregar({ tipo_dia: "laborable", hora_inicio: "06:30", hora_fin: "09:00", factor: 0.7 });
    const v = await crearVehiculo();
    const p = await crearPedido();
    const cuerpo = { vehiculo_id: v.id, pedido_ids: [p.id], hora_salida: "08:00" };

    await api.post("/api/v1/rutas").send({ ...cuerpo, fecha: "2026-09-28" }).expect(201); // lunes
    expect(optimizador.ultimaLlamada.factorVelocidad).toBe(0.7);

    const domingo = (await api.post("/api/v1/rutas").send({ ...cuerpo, fecha: "2026-09-27" }).expect(201)).body;
    expect(optimizador.ultimaLlamada.factorVelocidad).toBe(1);
    expect(domingo.factor_trafico_aplicado).toBe(1);
  });

  it("valida vehículo, pedidos y capacidad antes de llamar al optimizador", async () => {
    const v = await crearVehiculo({ capacidad_carga_kg: 100 });
    const inactivo = await crearVehiculo({ placa: "DEF-456", estado: "inactivo" });
    const p = await crearPedido();

    await api.post("/api/v1/rutas").send({ vehiculo_id: "x", pedido_ids: [p.id] }).expect(404);
    await api.post("/api/v1/rutas").send({ vehiculo_id: inactivo.id, pedido_ids: [p.id] }).expect(409);
    await api.post("/api/v1/rutas").send({ vehiculo_id: v.id, pedido_ids: [] }).expect(422);
    await api.post("/api/v1/rutas").send({ vehiculo_id: v.id, pedido_ids: ["no-existe"] }).expect(404);
    const res = await api.post("/api/v1/rutas").send({ vehiculo_id: v.id, pedido_ids: [p.id] }).expect(409);
    expect(res.body.detail).toMatch(/suman 120 kg/);
    expect(optimizador.ultimaLlamada).toBeNull();
  });

  it("rechaza pedidos entregados o cancelados", async () => {
    const v = await crearVehiculo();
    const p = await crearPedido();
    await api.delete(`/api/v1/pedidos/${p.id}`);
    await api.post("/api/v1/rutas").send({ vehiculo_id: v.id, pedido_ids: [p.id] }).expect(409);
  });

  it("informa los pedidos que no caben en su ventana (422)", async () => {
    const v = await crearVehiculo();
    const p = await crearPedido({ cliente_nombre: "Restaurante La Huancaína" });
    api = request(crearApp({ repos, optimizador: crearOptimizadorFalso({ noAsignar: [p.id] }), almacen: ALMACEN }));
    const res = await api.post("/api/v1/rutas").send({ vehiculo_id: v.id, pedido_ids: [p.id], hora_salida: "15:00" }).expect(422);
    expect(res.body.detail).toMatch(/Restaurante La Huancaína/);
  });

  it("cambia el estado y cancela la ruta", async () => {
    const v = await crearVehiculo();
    const p = await crearPedido();
    const ruta = (await api.post("/api/v1/rutas").send({ vehiculo_id: v.id, pedido_ids: [p.id] }).expect(201)).body;
    expect((await api.patch(`/api/v1/rutas/${ruta.id}/estado`).send({ estado: "en_reparto" }).expect(200)).body.estado).toBe("en_reparto");
    await api.patch(`/api/v1/rutas/${ruta.id}/estado`).send({ estado: "otro" }).expect(422);
    expect((await api.delete(`/api/v1/rutas/${ruta.id}`).expect(200)).body.estado).toBe("cancelada");
    await api.get("/api/v1/rutas/no-existe").expect(404);
    expect((await api.get(`/api/v1/rutas/vehiculo/${v.id}`)).body).toHaveLength(1);
  });
});
