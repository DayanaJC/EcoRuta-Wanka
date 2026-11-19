// Consulta pública del cliente con un solo campo: código del pedido, DNI/RUC o teléfono.

import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { crearApp } from "../src/aplicacion.js";
import { codigoPedido, interpretarConsulta } from "../src/services/notificacion.service.js";
import { crearOptimizadorFalso, crearRepositoriosMemoria, pedidoValido } from "./helpers/memoria.js";

const ALMACEN = { nombre: "Almacén WankaLogística", latitud: -12.0681, longitud: -75.2104 };
const RELOJ = () => new Date("2026-09-28T15:00:00Z");
let api;

beforeEach(async () => {
  api = request(
    crearApp({
      repos: crearRepositoriosMemoria(),
      optimizador: crearOptimizadorFalso(),
      geocodificador: {},
      almacen: ALMACEN,
      reloj: RELOJ,
      aleatorio: () => 0.5,
    }),
  );
  await api
    .post("/api/v1/clientes")
    .send({
      codigo: "CLI-0700", nombre: "Bodega Rosa", telefono: "+51 964123456".replace(/\s/g, ""), documento: "45678912",
      direccion: "Jr. Ica 320", latitud: -12.06, longitud: -75.2, ventana_inicio: "08:00", ventana_fin: "13:00",
    })
    .expect(201);
});

const consultar = (q) => api.get("/api/v1/seguimiento").query({ q });

describe("interpretarConsulta", () => {
  it("reconoce cada tipo de dato", () => {
    expect(interpretarConsulta("p-3fa85f")).toEqual({ prefijo: "3fa85f" });
    expect(interpretarConsulta("P3FA85F")).toEqual({ prefijo: "3fa85f" });
    expect(interpretarConsulta("964 123 456")).toEqual({ telefono: "964123456" });
    expect(interpretarConsulta("+51964123456")).toEqual({ telefono: "964123456", documento: "51964123456" });
    expect(interpretarConsulta("45678912")).toEqual({ documento: "45678912" });
    expect(interpretarConsulta("20123456789")).toEqual({ documento: "20123456789" });
    expect(interpretarConsulta("cli-0700")).toEqual({ codigo: "CLI-0700" });
    expect(() => interpretarConsulta("12345")).toThrow();
  });
});

describe("GET /seguimiento?q=", () => {
  it("encuentra el pedido por su código, el DNI o el teléfono del cliente", async () => {
    const pedido = (await api.post("/api/v1/pedidos").send(pedidoValido({ cliente_id: "CLI-0700" })).expect(201)).body;
    const codigo = codigoPedido(pedido.id);

    for (const q of [codigo, codigo.toLowerCase(), "45678912", "964123456", "964 123 456", "+51 964 123 456", "CLI-0700"]) {
      const { body } = await consultar(q).expect(200);
      expect(body).toHaveLength(1);
      expect(body[0]).toMatchObject({ codigo, cliente_nombre: pedido.cliente_nombre, etapa: "registrado", token: pedido.token_seguimiento });
      // Sin datos sensibles en la lista
      expect(body[0]).not.toHaveProperty("direccion");
    }
  });

  it("lista todos los pedidos del cliente, el más reciente primero", async () => {
    await api.post("/api/v1/pedidos").send(pedidoValido({ cliente_id: "CLI-0700" })).expect(201);
    await api.post("/api/v1/pedidos").send(pedidoValido({ cliente_id: "CLI-0700" })).expect(201);
    await api.post("/api/v1/pedidos").send(pedidoValido({ cliente_id: "CLI-9999" })).expect(201);
    const { body } = await consultar("45678912").expect(200);
    expect(body).toHaveLength(2);
  });

  it("responde 404 si no hay pedidos y 422 si el dato no se entiende", async () => {
    await consultar("P-ABCDEF").expect(404);
    await consultar("999888777").expect(404);
    expect((await consultar("12345").expect(422)).body.detail).toMatch(/código de tu pedido/);
    await api.get("/api/v1/seguimiento").expect(422);
  });

  it("limita las consultas seguidas desde la misma IP", async () => {
    for (let i = 0; i < 20; i++) await consultar("999888777");
    await consultar("999888777").expect(429);
  });

  it("el cliente guarda y valida el DNI o RUC", async () => {
    const { body } = await api.get("/api/v1/clientes").expect(200);
    const cliente = (body.datos ?? body).find((c) => c.codigo === "CLI-0700");
    expect(cliente.documento).toBe("45678912");
    await api.put(`/api/v1/clientes/${cliente.id}`).send({ documento: "123" }).expect(422);
    await api.put(`/api/v1/clientes/${cliente.id}`).send({ documento: "20123456789" }).expect(200);
    await api.put(`/api/v1/clientes/${cliente.id}`).send({ documento: "" }).expect(200);
  });
});
