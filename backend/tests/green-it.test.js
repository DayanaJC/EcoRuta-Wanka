// Pruebas de las optimizaciones Green IT: paginación del listado de pedidos
// y cabeceras de caché HTTP (304 cuando la información no cambió).

import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { crearApp } from "../src/aplicacion.js";
import { crearOptimizadorFalso, crearRepositoriosMemoria, pedidoValido } from "./helpers/memoria.js";

const ALMACEN = { nombre: "Almacén", latitud: -12.0681, longitud: -75.2104 };
let api;

beforeEach(async () => {
  api = request(crearApp({ repos: crearRepositoriosMemoria(), optimizador: crearOptimizadorFalso(), geocodificador: {}, almacen: ALMACEN }));
  for (let i = 0; i < 19; i++) {
    await api.post("/api/v1/pedidos").send(pedidoValido({ cliente_id: `CLI-${1000 + i}` })).expect(201);
  }
});

describe("Paginación de pedidos", () => {
  it("sin página devuelve la lista completa (compatibilidad)", async () => {
    const r = await api.get("/api/v1/pedidos").expect(200);
    expect(Array.isArray(r.body)).toBe(true);
    expect(r.body).toHaveLength(19);
  });

  it("devuelve 12 por página por defecto y los 7 restantes en la segunda", async () => {
    const p1 = await api.get("/api/v1/pedidos?pagina=1").expect(200);
    expect(p1.body.datos).toHaveLength(12);
    expect(p1.body.paginacion).toEqual({ pagina: 1, limite: 12, total: 19, paginas: 2 });
    const p2 = await api.get("/api/v1/pedidos?pagina=2").expect(200);
    expect(p2.body.datos).toHaveLength(7);
  });

  it("rechaza página menor a 1 y límite mayor a 50", async () => {
    await api.get("/api/v1/pedidos?pagina=0").expect(422);
    await api.get("/api/v1/pedidos?pagina=1&limite=51").expect(422);
  });
});

describe("Caché HTTP", () => {
  it("los listados se revalidan con ETag y responden 304 sin cambios", async () => {
    const r = await api.get("/api/v1/pedidos").expect(200);
    expect(r.headers["cache-control"]).toBe("private, no-cache");
    expect(r.headers.etag).toBeTruthy();
    await api.get("/api/v1/pedidos").set("If-None-Match", r.headers.etag).expect(304);
  });

  it("los factores de tráfico se guardan un día", async () => {
    const r = await api.get("/api/v1/factores-trafico").expect(200);
    expect(r.headers["cache-control"]).toBe("public, max-age=86400");
  });

  it("las escrituras no llevan cabecera de caché", async () => {
    const r = await api.post("/api/v1/pedidos").send(pedidoValido({ cliente_id: "CLI-2000" })).expect(201);
    expect(r.headers["cache-control"]).toBeUndefined();
  });
});
