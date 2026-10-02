// Pruebas de los endpoints (Supertest) con repositorios en memoria.

import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { crearApp } from "../src/aplicacion.js";
import { crearOptimizadorFalso, crearRepositoriosMemoria, pedidoValido, vehiculoValido } from "./helpers/memoria.js";

const ALMACEN = { nombre: "Almacén", latitud: -12.0681, longitud: -75.2104 };
// "HH:MM" -> minutos
const h = (hhmm) => hhmm.split(":").map(Number).reduce((hh, mm) => hh * 60 + mm);
let repos, optimizador, api;

beforeEach(() => {
  repos = crearRepositoriosMemoria();
  optimizador = crearOptimizadorFalso();
  api = request(crearApp({ repos, optimizador, geocodificador: geocodificadorFalso, almacen: ALMACEN }));
});

const geocodificadorFalso = {
  buscar: async (q) => [{ nombre: `${q}, Huancayo, Junín, Perú`, latitud: -12.06, longitud: -75.2 }],
};

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

describe("geocodificación", () => {
  it("devuelve sugerencias de direcciones", async () => {
    const res = await api.get("/api/v1/geocodificar?q=Jr.%20Puno%20450").expect(200);
    expect(res.body[0]).toMatchObject({ latitud: -12.06, longitud: -75.2 });
  });

  it("exige al menos 3 caracteres (422)", async () => {
    await api.get("/api/v1/geocodificar?q=ab").expect(422);
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

  it("expone el volumen útil calculado con las medidas y el aprovechamiento", async () => {
    const v = await crearVehiculo();
    expect(v).toMatchObject({ aprovechamiento_pct: 80, capacidad_volumen_m3: 3.168 });
    await api.post("/api/v1/vehiculos").send(vehiculoValido({ placa: "XYZ-999", largo_util_cm: undefined })).expect(422);
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

  it("calcula peso y volumen a partir de los bultos", async () => {
    const p = await crearPedido({
      bultos: [
        { descripcion: "Caja de clavos", cantidad: 5, largo_cm: 30, ancho_cm: 20, alto_cm: 15, peso_kg: 40 },
        { descripcion: "Colchón 2 plazas", cantidad: 1, largo_cm: 190, ancho_cm: 135, alto_cm: 25, peso_kg: 40 },
      ],
    });
    expect(p).toMatchObject({ peso_kg: 240, volumen_m3: 0.686 });
    expect(p.bultos[0]).toMatchObject({ apilable: true });
  });

  it("exige al menos un bulto con medidas positivas (422)", async () => {
    await api.post("/api/v1/pedidos").send(pedidoValido({ bultos: [] })).expect(422);
    const res = await api
      .post("/api/v1/pedidos")
      .send(pedidoValido({ bultos: [{ descripcion: "Caja", cantidad: 1, largo_cm: 0, ancho_cm: 10, alto_cm: 10, peso_kg: 5 }] }))
      .expect(422);
    expect(res.body.detail).toMatch(/bultos\.0\.largo_cm/);
  });

  it("al editar los bultos recalcula los totales", async () => {
    const p = await crearPedido();
    const editado = (
      await api
        .put(`/api/v1/pedidos/${p.id}`)
        .send({ bultos: [{ descripcion: "Saco de arroz", cantidad: 2, largo_cm: 80, ancho_cm: 50, alto_cm: 20, peso_kg: 50 }] })
        .expect(200)
    ).body;
    expect(editado).toMatchObject({ peso_kg: 100, volumen_m3: 0.16 });
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
    const v = await crearVehiculo();
    const ruta = (await api.post("/api/v1/rutas").send({ vehiculo_id: v.id, pedido_ids: [p.id] }).expect(201)).body;
    await api.post(`/api/v1/rutas/${ruta.id}/simular`).send({}).expect(200);
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
    expect(ruta.paradas[1].hora_estimada_llegada).toBe("08:25");
    expect(ruta.distancia_sin_optimizar_km).toBe(20);
    expect(ruta).toMatchObject({ estado: "generada", distancia_estimada_km: 12.35, tiempo_estimado_min: 40, hora_salida: "08:00", hora_disponible: "08:00" });
    expect(optimizador.ultimaLlamada.almacen).toEqual(ALMACEN);
  });

  it("no aplica factores de tráfico mientras están deshabilitados (por defecto)", async () => {
    repos.factoresTrafico.agregar({ tipo_dia: "laborable", hora_inicio: "06:30", hora_fin: "09:00", factor: 0.7 });
    const v = await crearVehiculo();
    const p = await crearPedido();
    const ruta = (await api.post("/api/v1/rutas").send({ vehiculo_id: v.id, pedido_ids: [p.id], fecha: "2026-09-28", hora_salida: "08:00" }).expect(201)).body;
    expect(optimizador.ultimaLlamada.factorVelocidad).toBe(1);
    expect(ruta.factor_trafico_aplicado).toBeNull();
  });

  it("aplica el factor de tráfico de la franja y tipo de día cuando está habilitado", async () => {
    api = request(crearApp({ repos, optimizador, geocodificador: geocodificadorFalso, almacen: ALMACEN, traficoHabilitado: true }));
    repos.factoresTrafico.agregar({ tipo_dia: "laborable", hora_inicio: "06:30", hora_fin: "09:00", factor: 0.7 });
    const v = await crearVehiculo();
    const p = await crearPedido();
    const cuerpo = { vehiculo_id: v.id, pedido_ids: [p.id], hora_salida: "08:00" };

    const lunes = (await api.post("/api/v1/rutas").send({ ...cuerpo, fecha: "2026-09-28" }).expect(201)).body;
    expect(optimizador.ultimaLlamada.factorVelocidad).toBe(0.7);
    await api.delete(`/api/v1/rutas/${lunes.id}`).expect(200); // libera el pedido para la segunda ruta

    const domingo = (await api.post("/api/v1/rutas").send({ ...cuerpo, fecha: "2026-09-27" }).expect(201)).body;
    expect(optimizador.ultimaLlamada.factorVelocidad).toBe(1);
    expect(domingo.factor_trafico_aplicado).toBe(1);
  });

  it("retrasa la salida para no esperar en la calle (salida óptima con margen)", async () => {
    const v = await crearVehiculo();
    const panaderia = await crearPedido({ cliente_nombre: "Panadería", ventana_entrega_inicio: "08:00", ventana_entrega_fin: "12:00" });
    const bodega = await crearPedido({ cliente_nombre: "Bodega", ventana_entrega_inicio: "13:00", ventana_entrega_fin: "17:00" });
    // El optimizador falso invierte el orden: primero la bodega... se envía al revés para que vaya primero la panadería
    const ruta = (
      await api.post("/api/v1/rutas").send({ vehiculo_id: v.id, pedido_ids: [bodega.id, panaderia.id], hora_salida: "08:00" }).expect(201)
    ).body;
    // Panadería a las 11:45 (12:00 - 15 min de margen) => salida 11:35; bodega a las 13:00
    expect(ruta).toMatchObject({ hora_disponible: "08:00", hora_salida: "11:35" });
    expect(ruta.paradas.map((p) => p.hora_estimada_llegada)).toEqual(["11:45", "13:00"]);
    expect(ruta.paradas[1].espera_min).toBe(60);
    expect(ruta.tiempo_estimado_min).toBe(100); // 11:35 -> 13:15
    await api.delete(`/api/v1/rutas/${ruta.id}`).expect(200); // libera los pedidos para la segunda ruta

    const fija = (
      await api
        .post("/api/v1/rutas")
        .send({ vehiculo_id: v.id, pedido_ids: [bodega.id, panaderia.id], hora_salida: "08:00", ajustar_salida: false })
        .expect(201)
    ).body;
    expect(fija.hora_salida).toBe("08:00");
    expect(fija.paradas[1].espera_min).toBe(h("13:00") - h("08:25"));
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

  it("rechaza la ruta si el volumen supera el del vehículo aunque el peso alcance", async () => {
    const moto = await crearVehiculo({ placa: "MOT-001", tipo: "moto", capacidad_carga_kg: 40, largo_util_cm: 45, ancho_util_cm: 45, alto_util_cm: 40 });
    // 3 cajas de 40×40×35 = 0,168 m³ (> 0,065 m³ útiles) con solo 9 kg
    const p = await crearPedido({ bultos: [{ descripcion: "Caja de pan", cantidad: 3, largo_cm: 40, ancho_cm: 40, alto_cm: 35, peso_kg: 3 }] });
    const res = await api.post("/api/v1/rutas").send({ vehiculo_id: moto.id, pedido_ids: [p.id] }).expect(409);
    expect(res.body.detail).toMatch(/ocupan 0.168 m³.*admite 0.065 m³/);
  });

  it("rechaza la ruta si un bulto no cabe físicamente (colchón en moto)", async () => {
    const moto = await crearVehiculo({ placa: "MOT-001", tipo: "moto", capacidad_carga_kg: 40, largo_util_cm: 45, ancho_util_cm: 45, alto_util_cm: 40, aprovechamiento_pct: 100 });
    const p = await crearPedido({
      cliente_nombre: "Hogar Wanka",
      bultos: [{ descripcion: "Colchón 1 plaza", cantidad: 1, largo_cm: 190, ancho_cm: 10, alto_cm: 3, peso_kg: 8 }],
    });
    const res = await api.post("/api/v1/rutas").send({ vehiculo_id: moto.id, pedido_ids: [p.id] }).expect(409);
    expect(res.body.detail).toMatch(/No caben en el vehículo MOT-001: Colchón 1 plaza \(190×10×3 cm\) de Hogar Wanka/);
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

  it("genera la ruta aunque falle el cálculo del recorrido sin optimizar", async () => {
    const v = await crearVehiculo();
    const p = await crearPedido();
    optimizador.distanciaRecorrido = async () => {
      throw new Error("sin conexión");
    };
    const ruta = (await api.post("/api/v1/rutas").send({ vehiculo_id: v.id, pedido_ids: [p.id] }).expect(201)).body;
    expect(ruta.distancia_sin_optimizar_km).toBeNull();
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

describe("flujo de entregas", () => {
  // 10:00 en Lima (UTC-5); el simulador sin azar: desviación 0 y sin fallas (salvo probabilidad 1)
  const RELOJ = () => new Date("2026-09-28T15:00:00Z");
  let placas;
  beforeEach(() => {
    placas = 100;
    api = request(crearApp({ repos, optimizador, geocodificador: geocodificadorFalso, almacen: ALMACEN, reloj: RELOJ, aleatorio: () => 0.5 }));
  });

  const crearRuta = async (pedidos, extra = {}) => {
    const v = await crearVehiculo({ placa: `RUT-${placas++}` });
    return (await api.post("/api/v1/rutas").send({ vehiculo_id: v.id, pedido_ids: pedidos.map((p) => p.id), fecha: "2026-09-28", ...extra }).expect(201)).body;
  };
  const pedido = async (id) => (await api.get(`/api/v1/pedidos/${id}`).expect(200)).body;
  const iniciar = (ruta) => api.patch(`/api/v1/rutas/${ruta.id}/estado`).send({ estado: "en_reparto" });
  const registrar = (ruta, orden, cuerpo) => api.patch(`/api/v1/rutas/${ruta.id}/paradas/${orden}`).send(cuerpo);

  it("al iniciar el reparto los pedidos pasan a 'en_ruta' y se guarda la hora de inicio", async () => {
    const p = await crearPedido();
    const ruta = await crearRuta([p]);
    expect(ruta.paradas[0].estado).toBe("pendiente");
    const iniciada = (await iniciar(ruta).expect(200)).body;
    expect(iniciada).toMatchObject({ estado: "en_reparto", iniciada_at: "2026-09-28T15:00:00.000Z" });
    expect((await pedido(p.id)).estado).toBe("en_ruta");
  });

  it("registra la entrega con fecha y hora, marca el pedido y completa la ruta al resolver la última parada", async () => {
    const p1 = await crearPedido();
    const p2 = await crearPedido({ cliente_id: "CLI-0002", cliente_nombre: "Farmacia Chilca", ventana_entrega_inicio: "13:00", ventana_entrega_fin: "17:00" });
    const ruta = await crearRuta([p1, p2], { ajustar_salida: false });
    await iniciar(ruta).expect(200);

    const tras1 = (await registrar(ruta, 1, { resultado: "entregada" }).expect(200)).body;
    expect(tras1.estado).toBe("en_reparto");
    const parada1 = tras1.paradas[0];
    expect(parada1).toMatchObject({ estado: "entregada", entregado_at: "2026-09-28T15:00:00.000Z", registrado_por: "operador" });
    // 10:00 en Lima: dentro de 08:00-12:00 (p1) y fuera de 13:00-17:00 (p2)
    expect(parada1.dentro_ventana).toBe(parada1.pedido_id === p1.id);
    expect(await pedido(parada1.pedido_id)).toMatchObject({ estado: "entregado", fecha_entrega: "2026-09-28T15:00:00.000Z" });

    const tras2 = (await registrar(ruta, 2, { resultado: "entregada" }).expect(200)).body;
    expect(tras2).toMatchObject({ estado: "completada", completada_at: "2026-09-28T15:00:00.000Z" });
  });

  it("una no entrega exige motivo y devuelve el pedido a 'pendiente' para otra ruta", async () => {
    const p = await crearPedido();
    const ruta = await crearRuta([p]);
    await registrar(ruta, 1, { resultado: "entregada" }).expect(409); // la ruta aún no está en reparto
    await iniciar(ruta).expect(200);
    await registrar(ruta, 1, { resultado: "no_entregada" }).expect(422);
    const final = (await registrar(ruta, 1, { resultado: "no_entregada", motivo: "Cliente ausente" }).expect(200)).body;
    expect(final.paradas[0]).toMatchObject({ estado: "no_entregada", motivo_no_entrega: "Cliente ausente", entregado_at: null });
    expect(final.estado).toBe("completada");
    expect((await pedido(p.id)).estado).toBe("pendiente");
    await registrar(ruta, 1, { resultado: "entregada" }).expect(409);
    await crearRuta([p]); // ya puede planificarse de nuevo
  });

  it("valida las transiciones de la ruta", async () => {
    const p = await crearPedido();
    const ruta = await crearRuta([p]);
    await api.patch(`/api/v1/rutas/${ruta.id}/estado`).send({ estado: "completada" }).expect(409); // sin iniciar
    await iniciar(ruta).expect(200);
    const res = await api.patch(`/api/v1/rutas/${ruta.id}/estado`).send({ estado: "completada" }).expect(409);
    expect(res.body.detail).toMatch(/Faltan 1 parada/);
    await registrar(ruta, 9, { resultado: "entregada" }).expect(404);
    await registrar(ruta, 1, { resultado: "entregada" }).expect(200);
    await iniciar(ruta).expect(409); // completada no vuelve a reparto
    await api.delete(`/api/v1/rutas/${ruta.id}`).expect(409);
  });

  it("cancelar una ruta en reparto devuelve sus pedidos sin resolver a 'pendiente'", async () => {
    const p1 = await crearPedido();
    const p2 = await crearPedido({ cliente_id: "CLI-0002", cliente_nombre: "Farmacia Chilca" });
    const ruta = await crearRuta([p1, p2]);
    await iniciar(ruta).expect(200);
    const entregado = (await registrar(ruta, 1, { resultado: "entregada" }).expect(200)).body.paradas[0].pedido_id;
    await api.delete(`/api/v1/rutas/${ruta.id}`).expect(200);
    const otro = entregado === p1.id ? p2.id : p1.id;
    expect((await pedido(entregado)).estado).toBe("entregado");
    expect((await pedido(otro)).estado).toBe("pendiente");
  });

  it("no permite el mismo pedido en dos rutas activas", async () => {
    const p = await crearPedido();
    const ruta = await crearRuta([p]);
    const v = await crearVehiculo({ placa: "XYZ-999" });
    const res = await api.post("/api/v1/rutas").send({ vehiculo_id: v.id, pedido_ids: [p.id] }).expect(409);
    expect(res.body.detail).toMatch(/otra ruta activa/);
    await api.delete(`/api/v1/rutas/${ruta.id}`).expect(200);
    await api.post("/api/v1/rutas").send({ vehiculo_id: v.id, pedido_ids: [p.id] }).expect(201);
  });

  it("'en_ruta' y 'entregado' no se ponen a mano, y un pedido en reparto no se cancela", async () => {
    const p = await crearPedido({ estado: "entregado" }); // el estado enviado al crear se ignora
    expect(p.estado).toBe("pendiente");
    await api.patch(`/api/v1/pedidos/${p.id}/estado`).send({ estado: "en_ruta" }).expect(409);
    await api.patch(`/api/v1/pedidos/${p.id}/estado`).send({ estado: "entregado" }).expect(409);
    await api.put(`/api/v1/pedidos/${p.id}`).send({ estado: "entregado" }).expect(200);
    expect((await pedido(p.id)).estado).toBe("pendiente");
    const ruta = await crearRuta([p]);
    await iniciar(ruta).expect(200);
    await api.delete(`/api/v1/pedidos/${p.id}`).expect(409);
  });

  it("un pedido cancelado antes de salir queda como no entregado al iniciar", async () => {
    const p = await crearPedido();
    const ruta = await crearRuta([p]);
    await api.delete(`/api/v1/pedidos/${p.id}`).expect(200);
    const iniciada = (await iniciar(ruta).expect(200)).body;
    expect(iniciada.paradas[0]).toMatchObject({ estado: "no_entregada", motivo_no_entrega: "Pedido cancelado antes de salir" });
    expect(iniciada.estado).toBe("completada");
    expect((await pedido(p.id)).estado).toBe("cancelado");
  });

  it("el simulador recorre la ruta y registra cada entrega a su hora estimada (hora de Lima)", async () => {
    const p = await crearPedido();
    const ruta = await crearRuta([p], { hora_salida: "08:00" });
    expect(ruta.paradas[0].hora_estimada_llegada).toBe("08:10");
    const sim = (await api.post(`/api/v1/rutas/${ruta.id}/simular`).send({}).expect(200)).body;
    expect(sim).toMatchObject({ estado: "completada", iniciada_at: "2026-09-28T13:00:00.000Z" }); // salida 08:00
    // llegada 08:10 + 5 min de atención = 08:15 en Lima = 13:15 UTC
    expect(sim.paradas[0]).toMatchObject({ estado: "entregada", entregado_at: "2026-09-28T13:15:00.000Z", dentro_ventana: true, registrado_por: "simulador" });
    expect(await pedido(p.id)).toMatchObject({ estado: "entregado", fecha_entrega: "2026-09-28T13:15:00.000Z" });
    await api.post(`/api/v1/rutas/${ruta.id}/simular`).send({}).expect(409); // ya completada
  });

  it("el simulador puede producir no entregas con motivo", async () => {
    const p = await crearPedido();
    const ruta = await crearRuta([p]);
    const sim = (await api.post(`/api/v1/rutas/${ruta.id}/simular`).send({ probabilidad_no_entrega: 1 }).expect(200)).body;
    expect(sim.paradas[0].estado).toBe("no_entregada");
    expect(sim.paradas[0].motivo_no_entrega).toBeTruthy();
    expect((await pedido(p.id)).estado).toBe("pendiente");
  });
});
