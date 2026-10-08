// Esquemas de validación (Zod) de la API. Validan el FORMATO de los datos;
// las reglas de negocio (duplicados, estados, capacidad) viven en los servicios.

import { z } from "zod";
import { PATRON_FECHA, PATRON_HORA } from "../utils/tiempo.js";

export const TIPOS_VEHICULO = ["camioneta", "furgon", "moto"];
export const ESTADOS_VEHICULO = ["activo", "inactivo"];
export const PRIORIDADES = ["express", "estandar", "economico"];
export const TIPOS_PRODUCTO = ["perecedero", "no_perecedero"];
export const ESTADOS_PEDIDO = ["pendiente", "en_ruta", "entregado", "cancelado"];
export const ESTADOS_RUTA = ["generada", "en_reparto", "completada", "cancelada"];

const PATRON_PLACA = /^[A-Z]{3}-\d{3}$/;

const placa = z
  .string({ error: "La placa es obligatoria." })
  .transform((v) => v.trim().toUpperCase())
  .refine((v) => PATRON_PLACA.test(v), "Placa inválida: use tres letras, guion y tres dígitos (ejemplo: ABC-123).");

const hora = z
  .string()
  .transform((v) => v.trim())
  .refine((v) => PATRON_HORA.test(v), "Hora inválida: use el formato HH:MM (ejemplo 09:30).");

const texto = (min, max) => z.string().trim().min(min, `Debe tener al menos ${min} caracteres.`).max(max, `Debe tener como máximo ${max} caracteres.`);
const positivo = (max) => z.number().gt(0, "Debe ser mayor que 0.").lte(max, `Debe ser como máximo ${max}.`);

// ---------- Vehículos ----------

const camposVehiculo = {
  placa,
  tipo: z.enum(TIPOS_VEHICULO),
  capacidad_carga_kg: positivo(10_000),
  consumo_combustible_l100km: positivo(100),
  factor_emision_co2_kg_l: positivo(100),
  anio_fabricacion: z.number().int().gte(1980, "Debe ser 1980 o posterior."),
  // Medidas internas útiles de la caja de carga (cm)
  largo_util_cm: positivo(2000),
  ancho_util_cm: positivo(2000),
  alto_util_cm: positivo(2000),
  aprovechamiento_pct: z.number().int().gte(30, "Debe ser al menos 30 %.").lte(100, "Debe ser como máximo 100 %."),
  estado: z.enum(ESTADOS_VEHICULO),
};

export const vehiculoCrear = z.object({
  ...camposVehiculo,
  aprovechamiento_pct: camposVehiculo.aprovechamiento_pct.default(80),
  estado: camposVehiculo.estado.default("activo"),
});
export const vehiculoActualizar = z.object(camposVehiculo).partial();
export const cambiarEstadoVehiculo = z.object({ estado: z.enum(ESTADOS_VEHICULO) });
export const filtroVehiculos = z.object({ estado: z.enum(ESTADOS_VEHICULO).optional() });

// ---------- Conductores ----------

export const ESTADOS_CONDUCTOR = ["activo", "inactivo"];

const camposConductor = {
  nombre: texto(3, 120),
  dni: z
    .string({ error: "El DNI es obligatorio." })
    .trim()
    .regex(/^\d{8}$/, "DNI inválido: debe tener 8 dígitos."),
  telefono: z
    .string()
    .trim()
    .regex(/^\+?\d{6,14}$/, "Teléfono inválido: solo dígitos (6 a 14), opcionalmente con + al inicio.")
    .nullable(),
  licencia: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase())
    .refine((v) => /^[A-Z0-9-]{5,15}$/.test(v), "Licencia inválida: use de 5 a 15 letras, dígitos o guiones (ejemplo: Q12345678).")
    .nullable(),
  estado: z.enum(ESTADOS_CONDUCTOR),
};

// Un texto vacío en los campos opcionales equivale a "sin dato"
const vacioANull = (v) => (typeof v === "string" && v.trim() === "" ? null : v);
const opcional = (esquema) => z.preprocess(vacioANull, esquema);

export const conductorCrear = z.object({
  nombre: camposConductor.nombre,
  dni: camposConductor.dni,
  telefono: opcional(camposConductor.telefono.default(null)),
  licencia: opcional(camposConductor.licencia.default(null)),
  estado: camposConductor.estado.default("activo"),
});
export const conductorActualizar = z
  .object({ ...camposConductor, telefono: opcional(camposConductor.telefono), licencia: opcional(camposConductor.licencia) })
  .partial();
export const cambiarEstadoConductor = z.object({ estado: z.enum(ESTADOS_CONDUCTOR) });
export const filtroConductores = z.object({ estado: z.enum(ESTADOS_CONDUCTOR).optional() });

// ---------- Pedidos ----------

const camposPedido = {
  cliente_id: texto(3, 50),
  cliente_nombre: texto(3, 100),
  direccion: texto(5, 200),
  punto_referencia: z.string().trim().max(200),
  latitud: z.number().gte(-90).lte(90),
  longitud: z.number().gte(-180).lte(180),
  // El peso y el volumen del pedido se calculan a partir de sus bultos
  bultos: z
    .array(
      z.object({
        descripcion: texto(2, 100),
        cantidad: z.number().int().gte(1, "Debe ser al menos 1.").lte(999),
        largo_cm: positivo(2000),
        ancho_cm: positivo(2000),
        alto_cm: positivo(2000),
        peso_kg: positivo(5000),
        apilable: z.boolean().default(true),
      }),
    )
    .min(1, "Agrega al menos un bulto.")
    .max(50, "Un pedido admite como máximo 50 tipos de bulto."),
  ventana_entrega_inicio: hora,
  ventana_entrega_fin: hora,
  tiempo_servicio_min: z.number().int().gte(0).lte(240),
  prioridad: z.enum(PRIORIDADES),
  // Por ahora no se contempla en la operación: es opcional y se guarda como 'no_perecedero'
  tipo_producto: z.enum(TIPOS_PRODUCTO),
};

export const pedidoCrear = z.object({
  ...camposPedido,
  punto_referencia: camposPedido.punto_referencia.default(""),
  tiempo_servicio_min: camposPedido.tiempo_servicio_min.default(5),
  tipo_producto: camposPedido.tipo_producto.default("no_perecedero"),
});
export const pedidoActualizar = z.object(camposPedido).partial();
export const cambiarEstadoPedido = z.object({ estado: z.enum(ESTADOS_PEDIDO) });
export const filtroPedidos = z.object({
  estado: z.enum(ESTADOS_PEDIDO).optional(),
  prioridad: z.enum(PRIORIDADES).optional(),
  busqueda: z.string().optional(),
});

// ---------- Asignaciones ----------

const id = z.string().trim().min(1, "El id no puede estar vacío.").max(100);
export const asignacionCrear = z.object({ pedido_id: id, vehiculo_id: id });

// ---------- Rutas ----------

export const rutaCrear = z.object({
  vehiculo_id: id,
  pedido_ids: z.array(id).max(48, "Una ruta admite como máximo 48 pedidos."),
  fecha: z.string().regex(PATRON_FECHA, "Fecha inválida: use el formato YYYY-MM-DD.").optional(),
  hora_salida: hora.optional(),
  // false = salir exactamente a hora_salida (p. ej. por el turno del conductor)
  ajustar_salida: z.boolean().default(true),
  // Conductor opcional: también puede asignarse después (RF-08)
  conductor_id: id.nullable().optional(),
});
export const cambiarEstadoRuta = z.object({ estado: z.enum(ESTADOS_RUTA) });
// null = quitar el conductor de la ruta
export const asignarConductor = z.object({ conductor_id: id.nullable() });

const fecha = z.string().regex(PATRON_FECHA, "Fecha inválida: use el formato YYYY-MM-DD.");
export const filtroRutas = z.object({
  desde: fecha.optional(),
  hasta: fecha.optional(),
  vehiculo_id: id.optional(),
  conductor_id: id.optional(),
  // "true" = incluir el trazado de cada ruta (mapa general del día)
  geometria: z.enum(["true", "false"]).optional(),
});

// ---------- Indicadores y reportes (RF-05, RF-06) ----------

// Sin fechas: los últimos 7 días (ver indicadoresService)
export const filtroIndicadores = z.object({
  desde: fecha.optional(),
  hasta: fecha.optional(),
  vehiculo_id: id.optional(),
});

// ---------- Entregas ----------

export const RESULTADOS_ENTREGA = ["entregada", "no_entregada"];
export const registrarEntrega = z
  .object({
    resultado: z.enum(RESULTADOS_ENTREGA),
    motivo: z.string().trim().max(200).optional(),
  })
  .refine((v) => v.resultado === "entregada" || (v.motivo && v.motivo.length >= 3), {
    message: "Indica el motivo de la no entrega (al menos 3 caracteres).",
    path: ["motivo"],
  });
// Simulación del reparto tramo a tramo (ver rutaService.simular)
export const simularReparto = z.object({
  // true = más tráfico y atenciones más largas
  imprevistos: z.boolean().default(false),
  // Probabilidad (0 a 1) de que una parada no se pueda entregar
  probabilidad_no_entrega: z.number().gte(0).lte(1).default(0),
});

// ---------- Geocodificación ----------

export const busquedaDireccion = z.object({ q: z.string().trim().min(3, "Escribe al menos 3 caracteres.").max(200) });
export const puntoMapa = z.object({ lat: z.coerce.number().gte(-90).lte(90), lon: z.coerce.number().gte(-180).lte(180) });
