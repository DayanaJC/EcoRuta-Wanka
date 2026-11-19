// Pruebas del Sprint 4: avisos automáticos al cliente (pedido registrado, en camino,
// entregado / no entregado) y la página pública de seguimiento del pedido.

import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { crearApp } from "../src/aplicacion.js";
import { codigoPedido, redactarMensaje } from "../src/services/notificacion.service.js";
import { crearOptimizadorFalso, crearRepositoriosMemoria, pedidoValido, vehiculoValido } from "./helpers/memoria.js";

const ALMACEN = { nombre: "Almacén WankaLogística", latitud: -12.0681, longitud: -75.2104 };
// 10:00 del lunes 28/09/2026 en Lima
const RELOJ = () => new Date("2026-09-28T15:00:00Z");
let api, repos;

beforeEach(() => {
  repos = crearRepositoriosMemoria();
  api = request(
    crearApp({ repos, optimizador: crearOptimizadorFalso(), geocodificador: {}, almacen: ALMACEN, reloj: RELOJ, aleatorio: () => 0.5 }),
  );
});

let n = 0;
const crearPedido = async (extra) =>
  (await api.post("/api/v1/pedidos").send(pedidoValido({ cliente_id: `CLI-${100 + n++}`, ...extra })).expect(201)).body;
const generarRuta = async (pedidos) => {
  const v = (await api.post("/api/v1/vehiculos").send(vehiculoValido({ placa: `ABC-${100 + n++}` })).expect(201)).body;
  return (
    await api
      .post("/api/v1/rutas")
      .send({ vehiculo_id: v.id, pedido_ids: pedidos.map((p) => p.id), fecha: "2026-09-28", hora_salida: "08:00", ajustar_salida: false })
      .expect(201)
  ).body;
};
const avisos = async (pedido) => (await api.get(`/api/v1/pedidos/${pedido.id}/notificaciones`).expect(200)).body;
const seguimiento = async (pedido) => (await api.get(`/api/v1/seguimiento/${pedido.token_seguimiento}`).expect(200)).body;

describe("mensajes", () => {
  it("redacta los avisos con el código corto del pedido", () => {
    const p = { id: "3fa85f64-5717-4562-b3fc-2c963f66afa6", cliente_nombre: "Bodega Rosa", ventana_entrega_inicio: "08:00", ventana_entrega_fin: "12:00" };
    expect(codigoPedido(p.id)).toBe("P-3FA85F");
    expect(redactarMensaje("pedido_creado", p)).toMatch(/Recibimos tu pedido P-3FA85F.*entre las 08:00 y 12:00/);
    expect(redactarMensaje("en_camino", p, { hora: "09:10" })).toMatch(/va en camino\. Llegada estimada: 09:10\./);
    expect(redactarMensaje("entregado", p, { hora: "09:15" })).toMatch(/fue entregado a las 09:15/);
    expect(redactarMensaje("no_entregado", p, { motivo: "Local cerrado" })).toMatch(/\(local cerrado\)\. Lo reprogramaremos/);
  });
});

describe("avisos automáticos al cliente", () => {
  it("al registrar el pedido avisa con el teléfono del cliente", async () => {
    await api
      .post("/api/v1/clientes")
      .send({
        codigo: "CLI-0500", nombre: "Bodega Rosa", telefono: "964123456", direccion: "Jr. Ica 320",
        latitud: -12.06, longitud: -75.2, ventana_inicio: "08:00", ventana_fin: "13:00",
      })
      .expect(201);
    const pedido = await crearPedido({ cliente_id: "CLI-0500" });
    expect(pedido.token_seguimiento).toMatch(/^[0-9a-f-]{36}$/);
    const lista = await avisos(pedido);
    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({ evento: "pedido_creado", canal: "whatsapp", telefono: "964123456" });
  });

  it("sin cliente registrado el aviso queda sin teléfono", async () => {
    const pedido = await crearPedido();
    expect((await avisos(pedido))[0].telefono).toBeNull();
  });

  it("al iniciar la ruta avisa que va en camino (con hora estimada) y al registrar la entrega, el resultado", async () => {
    const a = await crearPedido();
    const b = await crearPedido();
    const ruta = await generarRuta([a, b]);
    // Generar la ruta no envía avisos
    expect(await avisos(a)).toHaveLength(1);

    await api.patch(`/api/v1/rutas/${ruta.id}/estado`).send({ estado: "en_reparto" }).expect(200);
    const enCamino = (await avisos(a)).at(-1);
    const paradaA = ruta.paradas.find((p) => p.pedido_id === a.id);
    expect(enCamino.evento).toBe("en_camino");
    expect(enCamino.mensaje).toContain(`Llegada estimada: ${paradaA.hora_estimada_llegada}`);

    await api.patch(`/api/v1/rutas/${ruta.id}/paradas/${paradaA.orden}`).send({ resultado: "entregada" }).expect(200);
    const paradaB = ruta.paradas.find((p) => p.pedido_id === b.id);
    await api.patch(`/api/v1/rutas/${ruta.id}/paradas/${paradaB.orden}`).send({ resultado: "no_entregada", motivo: "Cliente ausente" }).expect(200);

    expect((await avisos(a)).map((x) => x.evento)).toEqual(["pedido_creado", "en_camino", "entregado"]);
    expect((await avisos(a)).at(-1).mensaje).toContain("fue entregado a las 10:00");
    const ultimoB = (await avisos(b)).at(-1);
    expect(ultimoB.evento).toBe("no_entregado");
    expect(ultimoB.mensaje).toContain("(cliente ausente)");
  });

  it("la simulación genera los avisos con la hora simulada", async () => {
    const a = await crearPedido();
    const ruta = await generarRuta([a]);
    await api.post(`/api/v1/rutas/${ruta.id}/simular`).send({}).expect(200);
    const lista = await avisos(a);
    expect(lista.map((x) => x.evento)).toEqual(["pedido_creado", "en_camino", "entregado"]);
    // La ruta es del 28/09 y el pedido se registró después: el aviso no sale antes que el pedido
    expect(lista.every((x) => x.fecha >= a.created_at)).toBe(true);
    expect(lista[2].mensaje).toMatch(/fue entregado a las \d{2}:\d{2}/);
  });

  it("un pedido cancelado antes de salir no recibe aviso de no entrega", async () => {
    const a = await crearPedido();
    const b = await crearPedido();
    const ruta = await generarRuta([a, b]);
    await api.delete(`/api/v1/pedidos/${b.id}`).expect(200);
    await api.patch(`/api/v1/rutas/${ruta.id}/estado`).send({ estado: "en_reparto" }).expect(200);
    expect((await avisos(b)).map((x) => x.evento)).toEqual(["pedido_creado"]);
  });

  it("si falla el registro del aviso, la operación principal sigue", async () => {
    repos.notificaciones.crearMuchas = async () => {
      throw new Error("sin conexión");
    };
    const original = console.error;
    console.error = () => {};
    try {
      await crearPedido();
    } finally {
      console.error = original;
    }
  });

  it("responde 404 al pedir los avisos de un pedido que no existe", async () => {
    await api.get("/api/v1/pedidos/no-existe/notificaciones").expect(404);
  });
});

describe("seguimiento público del pedido", () => {
  it("muestra la etapa del pedido en cada momento, sin datos internos", async () => {
    const a = await crearPedido();
    const b = await crearPedido();
    let s = await seguimiento(a);
    expect(s.etapa).toBe("registrado");
    expect(s.entrega).toBeNull();
    expect(s.pedido).not.toHaveProperty("id");
    expect(s.pedido).not.toHaveProperty("cliente_id");
    expect(s.pedido.codigo).toBe(codigoPedido(a.id));
    expect(s.almacen.nombre).toBe(ALMACEN.nombre);

    const ruta = await generarRuta([a, b]);
    s = await seguimiento(a);
    expect(s.etapa).toBe("programado");
    expect(s.entrega.hora_estimada).toBe(ruta.paradas.find((p) => p.pedido_id === a.id).hora_estimada_llegada);

    await api.patch(`/api/v1/rutas/${ruta.id}/estado`).send({ estado: "en_reparto" }).expect(200);
    // El optimizador falso visita en orden inverso: b es la primera parada y a la segunda
    s = await seguimiento(a);
    expect(s.etapa).toBe("en_camino");
    expect(s.entrega.entregas_antes).toBe(1);
    expect(s.avisos.map((x) => x.evento)).toEqual(["pedido_creado", "en_camino"]);

    await api.patch(`/api/v1/rutas/${ruta.id}/paradas/1`).send({ resultado: "entregada" }).expect(200);
    expect((await seguimiento(a)).entrega.entregas_antes).toBe(0);
    await api.patch(`/api/v1/rutas/${ruta.id}/paradas/2`).send({ resultado: "no_entregada", motivo: "Local cerrado" }).expect(200);
    s = await seguimiento(a);
    expect(s.etapa).toBe("no_entregado");
    expect(s.entrega.motivo_no_entrega).toBe("Local cerrado");
    expect((await seguimiento(b)).etapa).toBe("entregado");
  });

  it("un enlace inválido responde 404", async () => {
    await api.get("/api/v1/seguimiento/3fa85f64-5717-4562-b3fc-2c963f66afa6").expect(404);
    await api.get("/api/v1/seguimiento/abc").expect(404);
  });
});
