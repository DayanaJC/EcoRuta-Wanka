// Repositorios (Modelo – acceso a datos) implementados con Prisma sobre Neon.
// Devuelven objetos planos con el mismo formato que la API (snake_case,
// números en lugar de Decimal, horas "HH:MM" y fechas ISO).

import { PedidoYaAsignadoError } from "../errors/errores.js";
import { capacidadVolumenM3 } from "../services/carga.js";
import { dateAFecha, dateAHora, fechaADate, horaADate } from "../utils/tiempo.js";

const PATRON_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Prisma lanza error con ids que no son UUID; para la API equivale a "no existe".
const esUuid = (id) => typeof id === "string" && PATRON_UUID.test(id);

const num = (d) => (d === null || d === undefined ? null : Number(d));
const iso = (d) => (d ? d.toISOString() : null);

// ---------- Mapeos fila -> objeto de la API ----------

const aVehiculo = (v) =>
  v && {
    id: v.id,
    placa: v.placa,
    tipo: v.tipo,
    capacidad_carga_kg: num(v.capacidad_carga_kg),
    consumo_combustible_l100km: num(v.consumo_combustible_l100km),
    factor_emision_co2_kg_l: num(v.factor_emision_co2_kg_l),
    anio_fabricacion: v.anio_fabricacion,
    largo_util_cm: num(v.largo_util_cm),
    ancho_util_cm: num(v.ancho_util_cm),
    alto_util_cm: num(v.alto_util_cm),
    aprovechamiento_pct: v.aprovechamiento_pct,
    capacidad_volumen_m3: capacidadVolumenM3({
      largo_util_cm: num(v.largo_util_cm),
      ancho_util_cm: num(v.ancho_util_cm),
      alto_util_cm: num(v.alto_util_cm),
      aprovechamiento_pct: v.aprovechamiento_pct,
    }),
    estado: v.estado,
    created_at: iso(v.created_at),
    updated_at: iso(v.updated_at),
  };

const aConductor = (c) =>
  c && {
    id: c.id,
    nombre: c.nombre,
    dni: c.dni,
    telefono: c.telefono,
    licencia: c.licencia,
    estado: c.estado,
    created_at: iso(c.created_at),
    updated_at: iso(c.updated_at),
  };

const aPedido = (p) =>
  p && {
    id: p.id,
    cliente_id: p.cliente_id,
    cliente_nombre: p.cliente_nombre,
    direccion: p.direccion,
    punto_referencia: p.punto_referencia,
    latitud: num(p.latitud),
    longitud: num(p.longitud),
    peso_kg: num(p.peso_kg),
    volumen_m3: num(p.volumen_m3),
    bultos: (p.bultos ?? []).map((b) => ({
      id: b.id,
      descripcion: b.descripcion,
      cantidad: b.cantidad,
      largo_cm: num(b.largo_cm),
      ancho_cm: num(b.ancho_cm),
      alto_cm: num(b.alto_cm),
      peso_kg: num(b.peso_kg),
      apilable: b.apilable,
    })),
    ventana_entrega_inicio: dateAHora(p.ventana_entrega_inicio),
    ventana_entrega_fin: dateAHora(p.ventana_entrega_fin),
    tiempo_servicio_min: p.tiempo_servicio_min,
    prioridad: p.prioridad,
    tipo_producto: p.tipo_producto,
    estado: p.estado,
    fecha_entrega: iso(p.fecha_entrega),
    created_at: iso(p.created_at),
    updated_at: iso(p.updated_at),
  };

const aAsignacion = (a) =>
  a && {
    id: a.id,
    pedido_id: a.pedido_id,
    vehiculo_id: a.vehiculo_id,
    fecha_asignacion: iso(a.fecha_asignacion),
    estado: a.estado,
    created_at: iso(a.created_at),
    updated_at: iso(a.updated_at),
  };

const aRuta = (r, { conGeometria = true } = {}) => {
  if (!r) return r;
  const paradas = [...(r.paradas ?? [])].sort((a, b) => a.orden - b.orden);
  return {
    id: r.id,
    vehiculo_id: r.vehiculo_id,
    conductor_id: r.conductor_id ?? null,
    pedido_ids: paradas.map((p) => p.pedido_id),
    paradas: paradas.map((p) => ({
      orden: p.orden,
      pedido_id: p.pedido_id,
      hora_estimada_llegada: dateAHora(p.hora_estimada_llegada),
      espera_min: p.espera_min ?? 0,
      estado: p.estado,
      entregado_at: iso(p.entregado_at),
      dentro_ventana: p.dentro_ventana,
      motivo_no_entrega: p.motivo_no_entrega,
      registrado_por: p.registrado_por,
    })),
    fecha: dateAFecha(r.fecha),
    hora_disponible: dateAHora(r.hora_disponible),
    hora_salida: dateAHora(r.hora_salida),
    distancia_estimada_km: num(r.distancia_estimada_km),
    distancia_sin_optimizar_km: num(r.distancia_sin_optimizar_km),
    tiempo_estimado_min: r.tiempo_estimado_min,
    factor_trafico_aplicado: num(r.factor_trafico_aplicado),
    ...(conGeometria ? { geometria: r.geometria ?? null } : {}),
    estado: r.estado,
    iniciada_at: iso(r.iniciada_at),
    completada_at: iso(r.completada_at),
    regreso_at: iso(r.regreso_at),
    created_at: iso(r.created_at),
    updated_at: iso(r.updated_at),
  };
};

const aFactor = (f) =>
  f && {
    id: f.id,
    tipo_dia: f.tipo_dia,
    hora_inicio: dateAHora(f.hora_inicio),
    hora_fin: dateAHora(f.hora_fin),
    factor: num(f.factor),
    descripcion: f.descripcion,
  };

// Campos de la API -> columnas de Prisma (convierte las horas; los bultos se tratan aparte)
const aFilaPedido = (campos) => {
  const { bultos, ...fila } = campos;
  for (const c of ["ventana_entrega_inicio", "ventana_entrega_fin"]) {
    if (fila[c] !== undefined) fila[c] = horaADate(fila[c]);
  }
  return fila;
};

// ---------- Repositorios ----------

const conBultos = { bultos: { orderBy: { descripcion: "asc" } } };

export function crearRepositorios(prisma) {
  const vehiculos = {
    getById: async (id) => (esUuid(id) ? aVehiculo(await prisma.vehiculo.findUnique({ where: { id } })) : null),
    getByPlaca: async (placa) => aVehiculo(await prisma.vehiculo.findUnique({ where: { placa } })),
    listar: async ({ estado } = {}) =>
      (await prisma.vehiculo.findMany({ where: estado ? { estado } : {}, orderBy: { created_at: "desc" } })).map(aVehiculo),
    crear: async (datos) => aVehiculo(await prisma.vehiculo.create({ data: datos })),
    actualizar: async (id, campos) => aVehiculo(await prisma.vehiculo.update({ where: { id }, data: campos })),
  };

  const conductores = {
    getById: async (id) => (esUuid(id) ? aConductor(await prisma.conductor.findUnique({ where: { id } })) : null),
    getByDni: async (dni) => aConductor(await prisma.conductor.findUnique({ where: { dni } })),
    listar: async ({ estado } = {}) =>
      (await prisma.conductor.findMany({ where: estado ? { estado } : {}, orderBy: { nombre: "asc" } })).map(aConductor),
    crear: async (datos) => aConductor(await prisma.conductor.create({ data: datos })),
    actualizar: async (id, campos) => aConductor(await prisma.conductor.update({ where: { id }, data: campos })),
  };

  const pedidos = {
    getById: async (id) => (esUuid(id) ? aPedido(await prisma.pedido.findUnique({ where: { id }, include: conBultos })) : null),
    getMuchos: async (ids) =>
      (await prisma.pedido.findMany({ where: { id: { in: ids.filter(esUuid) } }, include: conBultos })).map(aPedido),
    listar: async ({ estado, prioridad, busqueda } = {}) => {
      const texto = busqueda?.trim();
      const where = {
        ...(estado ? { estado } : {}),
        ...(prioridad ? { prioridad } : {}),
        ...(texto
          ? {
              OR: ["cliente_id", "cliente_nombre", "direccion", "punto_referencia"].map((campo) => ({
                [campo]: { contains: texto, mode: "insensitive" },
              })),
            }
          : {}),
      };
      return (await prisma.pedido.findMany({ where, include: conBultos, orderBy: { created_at: "desc" } })).map(aPedido);
    },
    crear: async (datos) =>
      aPedido(
        await prisma.pedido.create({
          data: { ...aFilaPedido(datos), bultos: { create: datos.bultos } },
          include: conBultos,
        }),
      ),
    // Si llegan bultos, reemplazan a los anteriores en la misma operación
    actualizar: async (id, campos) =>
      aPedido(
        await prisma.pedido.update({
          where: { id },
          data: { ...aFilaPedido(campos), ...(campos.bultos ? { bultos: { deleteMany: {}, create: campos.bultos } } : {}) },
          include: conBultos,
        }),
      ),
  };

  const asignaciones = {
    getById: async (id) => (esUuid(id) ? aAsignacion(await prisma.asignacion.findUnique({ where: { id } })) : null),
    listar: async () => (await prisma.asignacion.findMany({ orderBy: { fecha_asignacion: "desc" } })).map(aAsignacion),
    getByPedidoId: async (pedidoId) =>
      esUuid(pedidoId)
        ? (await prisma.asignacion.findMany({ where: { pedido_id: pedidoId }, orderBy: { fecha_asignacion: "desc" } })).map(aAsignacion)
        : [],
    getByVehiculoId: async (vehiculoId) =>
      esUuid(vehiculoId)
        ? (await prisma.asignacion.findMany({ where: { vehiculo_id: vehiculoId }, orderBy: { fecha_asignacion: "desc" } })).map(aAsignacion)
        : [],
    crear: async (datos) => {
      try {
        return aAsignacion(await prisma.asignacion.create({ data: datos }));
      } catch (e) {
        // Índice único parcial: otra petición asignó el pedido al mismo tiempo
        if (e?.code === "P2002") throw new PedidoYaAsignadoError(`El pedido ${datos.pedido_id} ya tiene una asignación activa.`);
        throw e;
      }
    },
    actualizar: async (id, campos) => aAsignacion(await prisma.asignacion.update({ where: { id }, data: campos })),
  };

  const incluirParadas = { paradas: { orderBy: { orden: "asc" } } };
  const rutas = {
    getById: async (id) => (esUuid(id) ? aRuta(await prisma.ruta.findUnique({ where: { id }, include: incluirParadas })) : null),
    // Filtros opcionales: periodo (fecha de la ruta), vehículo y conductor
    listar: async ({ desde, hasta, vehiculo_id, conductor_id, conGeometria = false } = {}) => {
      if ((vehiculo_id && !esUuid(vehiculo_id)) || (conductor_id && !esUuid(conductor_id))) return [];
      const where = {
        ...(desde || hasta ? { fecha: { ...(desde ? { gte: fechaADate(desde) } : {}), ...(hasta ? { lte: fechaADate(hasta) } : {}) } } : {}),
        ...(vehiculo_id ? { vehiculo_id } : {}),
        ...(conductor_id ? { conductor_id } : {}),
      };
      return (await prisma.ruta.findMany({ where, include: incluirParadas, orderBy: { created_at: "desc" } })).map((r) => aRuta(r, { conGeometria }));
    },
    listarPorVehiculo: async (vehiculoId) =>
      esUuid(vehiculoId)
        ? (
            await prisma.ruta.findMany({ where: { vehiculo_id: vehiculoId }, include: incluirParadas, orderBy: { created_at: "desc" } })
          ).map((r) => aRuta(r, { conGeometria: false }))
        : [],
    // La ruta y sus paradas se crean en una sola operación (transacción implícita de Prisma)
    crearConParadas: async ({ paradas, fecha, hora_salida, hora_disponible, ...datos }) =>
      aRuta(
        await prisma.ruta.create({
          data: {
            ...datos,
            fecha: fechaADate(fecha),
            hora_salida: horaADate(hora_salida),
            hora_disponible: hora_disponible ? horaADate(hora_disponible) : null,
            paradas: {
              create: paradas.map((p) => ({
                pedido_id: p.pedido_id,
                orden: p.orden,
                hora_estimada_llegada: p.hora_estimada_llegada ? horaADate(p.hora_estimada_llegada) : null,
                espera_min: p.espera_min ?? 0,
              })),
            },
          },
          include: incluirParadas,
        }),
      ),
    actualizar: async (id, campos) => aRuta(await prisma.ruta.update({ where: { id }, data: campos, include: incluirParadas })),
    // Aplica en UNA transacción los cambios de un evento de reparto: paradas (por orden),
    // pedidos y la propia ruta. Así nunca quedan una parada entregada y su pedido sin entregar.
    aplicarCambios: async (id, { ruta = {}, paradas = [], pedidos: cambiosPedidos = [] }) => {
      await prisma.$transaction([
        ...paradas.map(({ orden, ...data }) => prisma.rutaParada.update({ where: { ruta_id_orden: { ruta_id: id, orden } }, data })),
        ...cambiosPedidos.map(({ id: pedidoId, ...data }) => prisma.pedido.update({ where: { id: pedidoId }, data })),
        ...(Object.keys(ruta).length ? [prisma.ruta.update({ where: { id }, data: ruta })] : []),
      ]);
      return aRuta(await prisma.ruta.findUnique({ where: { id }, include: incluirParadas }));
    },
  };

  const factoresTrafico = {
    listar: async () =>
      (await prisma.factorTrafico.findMany({ orderBy: [{ tipo_dia: "asc" }, { hora_inicio: "asc" }] })).map(aFactor),
    // Factor cuya franja [hora_inicio, hora_fin) contiene la hora indicada
    buscar: async (tipo_dia, hhmm) => {
      const h = horaADate(hhmm);
      return aFactor(
        await prisma.factorTrafico.findFirst({ where: { tipo_dia, hora_inicio: { lte: h }, hora_fin: { gt: h } } }),
      );
    },
  };

  const salud = { ping: async () => prisma.$queryRaw`SELECT 1` };

  return { vehiculos, conductores, pedidos, asignaciones, rutas, factoresTrafico, salud };
}
