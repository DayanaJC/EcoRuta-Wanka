// Pruebas del Sprint 2: conductores y asignación (RF-08), filtros de rutas para el mapa (RF-04),
// indicadores de sostenibilidad (RF-05) y reporte en PDF (RF-06).

import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { crearApp } from "../src/aplicacion.js";
import { crearOptimizadorFalso, crearRepositoriosMemoria, pedidoValido, vehiculoValido } from "./helpers/memoria.js";

const ALMACEN = { nombre: "Almacén", latitud: -12.0681, longitud: -75.2104 };
// 10:00 del 28/09/2026 en Lima
const RELOJ = () => new Date("2026-09-28T15:00:00Z");
let api, placas, clientes;

beforeEach(() => {
  placas = 100;
  clientes = 100;
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
});

const conductorValido = (extra = {}) => ({ nombre: "Juan Quispe Huamán", dni: "45678912", telefono: "964123456", licencia: "q45678912", ...extra });
const crearConductor = async (extra) => (await api.post("/api/v1/conductores").send(conductorValido(extra)).expect(201)).body;
const crearVehiculo = async (extra) => (await api.post("/api/v1/vehiculos").send(vehiculoValido({ placa: `ABC-${placas++}`, ...extra })).expect(201)).body;
const crearPedido = async (extra) =>
  (await api.post("/api/v1/pedidos").send(pedidoValido({ cliente_id: `CLI-${clientes++}`, ...extra })).expect(201)).body;
// Ruta de un pedido con el optimizador falso: 10 min de ida, 5 de atención y 10 de regreso (25 min)
const crearRuta = async (extra = {}, estado = 201) => {
  const v = await crearVehiculo();
  const p = await crearPedido();
  const res = await api
    .post("/api/v1/rutas")
    .send({ vehiculo_id: v.id, pedido_ids: [p.id], fecha: "2026-09-28", hora_salida: "08:00", ajustar_salida: false, ...extra })
    .expect(estado);
  return res.body;
};
const asignar = (ruta, conductor_id) => api.patch(`/api/v1/rutas/${ruta.id}/conductor`).send({ conductor_id });

describe("conductores (RF-08)", () => {
  it("registra un conductor con los datos obligatorios y lo muestra en la lista", async () => {
    const c = await crearConductor();
    expect(c).toMatchObject({ nombre: "Juan Quispe Huamán", dni: "45678912", licencia: "Q45678912", estado: "activo" });
    const lista = (await api.get("/api/v1/conductores").expect(200)).body;
    expect(lista.map((x) => x.id)).toContain(c.id);
  });

  it("teléfono y licencia son opcionales (vacíos se guardan como null)", async () => {
    const c = await crearConductor({ telefono: "", licencia: undefined });
    expect(c).toMatchObject({ telefono: null, licencia: null });
  });

  it("valida el DNI y no permite DNI duplicados", async () => {
    await api.post("/api/v1/conductores").send(conductorValido({ dni: "1234" })).expect(422);
    await api.post("/api/v1/conductores").send(conductorValido({ nombre: "" })).expect(422);
    await crearConductor();
    const res = await api.post("/api/v1/conductores").send(conductorValido({ nombre: "Otro" })).expect(409);
    expect(res.body.detail).toMatch(/DNI 45678912/);
  });

  it("actualiza, filtra por estado y desactiva", async () => {
    const c = await crearConductor();
    const editado = (await api.put(`/api/v1/conductores/${c.id}`).send({ telefono: "+51964000111" }).expect(200)).body;
    expect(editado.telefono).toBe("+51964000111");
    await api.delete(`/api/v1/conductores/${c.id}`).expect(200);
    expect((await api.get("/api/v1/conductores?estado=inactivo").expect(200)).body).toHaveLength(1);
    expect((await api.get("/api/v1/conductores?estado=activo").expect(200)).body).toHaveLength(0);
    await api.get("/api/v1/conductores/no-existe").expect(404);
  });
});

describe("asignación de conductores a rutas (RF-08, RN-009)", () => {
  it("asigna un conductor disponible y muestra la asignación en la ruta", async () => {
    const c = await crearConductor();
    const ruta = await crearRuta();
    expect(ruta.conductor_id).toBeNull();
    const asignada = (await asignar(ruta, c.id).expect(200)).body;
    expect(asignada.conductor_id).toBe(c.id);
    expect((await api.get(`/api/v1/rutas/${ruta.id}`).expect(200)).body.conductor_id).toBe(c.id);
  });

  it("permite asignar el conductor al generar la ruta", async () => {
    const c = await crearConductor();
    const ruta = await crearRuta({ conductor_id: c.id });
    expect(ruta.conductor_id).toBe(c.id);
  });

  it("informa que un conductor inactivo no está disponible y no realiza la asignación", async () => {
    const c = await crearConductor();
    await api.patch(`/api/v1/conductores/${c.id}/estado`).send({ estado: "inactivo" }).expect(200);
    const ruta = await crearRuta();
    const res = await asignar(ruta, c.id).expect(409);
    expect(res.body.detail).toMatch(/no está disponible/);
    expect((await api.get(`/api/v1/rutas/${ruta.id}`).expect(200)).body.conductor_id).toBeNull();
    await crearRuta({ conductor_id: c.id }, 409);
  });

  it("no asigna un conductor que ya tiene otra ruta en un horario que se cruza el mismo día", async () => {
    const c = await crearConductor();
    await crearRuta({ conductor_id: c.id }); // 08:00 a 08:25
    const cruzada = await crearRuta({ hora_salida: "08:15" });
    const res = await asignar(cruzada, c.id).expect(409);
    expect(res.body.detail).toMatch(/08:00 a 08:25/);
    // Otra ruta más tarde ese día u otro día sí se puede
    const tarde = await crearRuta({ hora_salida: "09:00" });
    await asignar(tarde, c.id).expect(200);
    const otroDia = await crearRuta({ fecha: "2026-09-29" });
    await asignar(otroDia, c.id).expect(200);
  });

  it("una ruta cancelada libera al conductor", async () => {
    const c = await crearConductor();
    const primera = await crearRuta({ conductor_id: c.id });
    await api.delete(`/api/v1/rutas/${primera.id}`).expect(200);
    await crearRuta({ conductor_id: c.id });
  });

  it("solo cambia el conductor de rutas activas y una ruta en reparto no queda sin conductor", async () => {
    const [a, b] = [await crearConductor(), await crearConductor({ dni: "40000001", nombre: "Rosa Pérez" })];
    const ruta = await crearRuta({ conductor_id: a.id });
    await api.patch(`/api/v1/rutas/${ruta.id}/estado`).send({ estado: "en_reparto" }).expect(200);
    await asignar(ruta, null).expect(409);
    expect((await asignar(ruta, b.id).expect(200)).body.conductor_id).toBe(b.id);
    await api.patch(`/api/v1/rutas/${ruta.id}/estado`).send({ estado: "cancelada" }).expect(200);
    await asignar(ruta, a.id).expect(409);
  });

  it("quita el conductor de una ruta generada", async () => {
    const c = await crearConductor();
    const ruta = await crearRuta({ conductor_id: c.id });
    expect((await asignar(ruta, null).expect(200)).body.conductor_id).toBeNull();
  });

  it("no desactiva a un conductor con rutas por hacer", async () => {
    const c = await crearConductor();
    await crearRuta({ conductor_id: c.id });
    const res = await api.delete(`/api/v1/conductores/${c.id}`).expect(409);
    expect(res.body.detail).toMatch(/Asigna otro conductor/);
  });

  it("valida que el conductor exista", async () => {
    const ruta = await crearRuta();
    await asignar(ruta, "00000000-0000-0000-0000-000000000000").expect(404);
    await api.patch(`/api/v1/rutas/${ruta.id}/conductor`).send({}).expect(422);
  });
});

describe("listado de rutas con filtros (mapa del día, RF-04)", () => {
  it("filtra por fecha y vehículo e incluye el trazado solo si se pide", async () => {
    const r1 = await crearRuta();
    await crearRuta({ fecha: "2026-09-29" });
    const delDia = (await api.get("/api/v1/rutas?desde=2026-09-28&hasta=2026-09-28&geometria=true").expect(200)).body;
    expect(delDia.map((r) => r.id)).toEqual([r1.id]);
    expect(delDia[0].geometria).toHaveLength(2);
    const porVehiculo = (await api.get(`/api/v1/rutas?vehiculo_id=${r1.vehiculo_id}`).expect(200)).body;
    expect(porVehiculo).toHaveLength(1);
    await api.get("/api/v1/rutas?desde=28-09-2026").expect(422);
  });

  it("informa que una ruta inexistente no está disponible", async () => {
    const res = await api.get("/api/v1/rutas/00000000-0000-0000-0000-000000000000").expect(404);
    expect(res.body.detail).toMatch(/No existe una ruta/);
  });
});

describe("indicadores de sostenibilidad (RF-05)", () => {
  // Optimizador falso: ruta optimizada 12,35 km y sin optimizar 20 km. Vehículo: 12 L/100 km y 2,31 kg CO₂/L
  it("calcula distancia, combustible, CO₂ y ahorro del periodo seleccionado", async () => {
    await crearRuta();
    const ind = (await api.get("/api/v1/indicadores?desde=2026-09-28&hasta=2026-09-28").expect(200)).body;
    expect(ind.sin_datos).toBe(false);
    expect(ind.periodo).toEqual({ desde: "2026-09-28", hasta: "2026-09-28", dias: 1 });
    expect(ind.totales).toMatchObject({ rutas: 1, paradas: 1, km: 12.35, km_sin_optimizar: 20, km_ahorrados: 7.65, litros: 1.48, co2_kg: 3.42, co2_evitado_kg: 2.12 });
    expect(ind.totales.reduccion_co2_pct).toBeCloseTo(38.25, 0);
    expect(ind.metas_cumplidas).toEqual({ reduccion_co2: true, fuera_de_horario: null });
    expect(ind.por_dia).toHaveLength(1);
    expect(ind.por_vehiculo[0]).toMatchObject({ rutas: 1, km: 12.35 });
  });

  it("cuenta la puntualidad de las entregas registradas (O2) y excluye rutas canceladas", async () => {
    const ruta = await crearRuta();
    await api.post(`/api/v1/rutas/${ruta.id}/simular`).send({}).expect(200);
    const cancelada = await crearRuta();
    await api.delete(`/api/v1/rutas/${cancelada.id}`).expect(200);
    const ind = (await api.get("/api/v1/indicadores?desde=2026-09-28&hasta=2026-09-28").expect(200)).body;
    expect(ind.totales).toMatchObject({ rutas: 1, entregadas: 1, a_tiempo: 1, puntualidad_pct: 100, fuera_de_horario_pct: 0 });
    expect(ind.totales.rutas_por_estado).toEqual({ generada: 0, en_reparto: 0, completada: 1 });
    expect(ind.metas_cumplidas.fuera_de_horario).toBe(true);
  });

  it("solo considera las rutas del periodo y del vehículo filtrado", async () => {
    const r1 = await crearRuta();
    await crearRuta();
    await crearRuta({ fecha: "2026-10-05" });
    const semana = (await api.get("/api/v1/indicadores?desde=2026-09-22&hasta=2026-09-28").expect(200)).body;
    expect(semana.totales.rutas).toBe(2);
    const unVehiculo = (await api.get(`/api/v1/indicadores?desde=2026-09-22&hasta=2026-09-28&vehiculo_id=${r1.vehiculo_id}`).expect(200)).body;
    expect(unVehiculo.totales.rutas).toBe(1);
    expect(unVehiculo.filtros.placa).toMatch(/^ABC-/);
  });

  it("sin fechas usa los últimos 7 días", async () => {
    const ind = (await api.get("/api/v1/indicadores").expect(200)).body;
    expect(ind.periodo.dias).toBe(7);
  });

  it("informa que no existen datos y no devuelve valores inventados", async () => {
    const ind = (await api.get("/api/v1/indicadores?desde=2026-01-01&hasta=2026-01-31").expect(200)).body;
    expect(ind.sin_datos).toBe(true);
    expect(ind.mensaje).toMatch(/No existen rutas/);
    expect(ind.totales).toBeUndefined();
  });

  it("rechaza periodos inválidos", async () => {
    await api.get("/api/v1/indicadores?desde=2026-10-10&hasta=2026-10-01").expect(422);
    await api.get("/api/v1/indicadores?desde=2024-01-01&hasta=2026-01-01").expect(422);
    await api.get("/api/v1/indicadores?desde=ayer").expect(422);
  });
});

describe("reporte de sostenibilidad en PDF (RF-06)", () => {
  it("genera el PDF del periodo con los filtros aplicados", async () => {
    const c = await crearConductor();
    await crearRuta({ conductor_id: c.id });
    const res = await api
      .get("/api/v1/reportes/sostenibilidad.pdf?desde=2026-09-28&hasta=2026-09-28")
      .buffer(true)
      .parse((r, fin) => {
        const partes = [];
        r.on("data", (p) => partes.push(p));
        r.on("end", () => fin(null, Buffer.concat(partes)));
      })
      .expect(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
    expect(res.headers["content-disposition"]).toContain("reporte-sostenibilidad_2026-09-28_2026-09-28.pdf");
    expect(res.body.subarray(0, 5).toString()).toBe("%PDF-");
    expect(res.body.length).toBeGreaterThan(2000);
  });

  it("no genera el reporte si no hay datos para los criterios seleccionados", async () => {
    const res = await api.get("/api/v1/reportes/sostenibilidad.pdf?desde=2026-01-01&hasta=2026-01-31").expect(404);
    expect(res.body.detail).toMatch(/No se generó el reporte/);
  });
});
