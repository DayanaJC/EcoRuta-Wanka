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
  estado: z.enum(ESTADOS_VEHICULO),
};

export const vehiculoCrear = z.object({ ...camposVehiculo, estado: camposVehiculo.estado.default("activo") });
export const vehiculoActualizar = z.object(camposVehiculo).partial();
export const cambiarEstadoVehiculo = z.object({ estado: z.enum(ESTADOS_VEHICULO) });
export const filtroVehiculos = z.object({ estado: z.enum(ESTADOS_VEHICULO).optional() });

// ---------- Pedidos ----------

const camposPedido = {
  cliente_id: texto(3, 50),
  cliente_nombre: texto(3, 100),
  direccion: texto(5, 200),
  punto_referencia: z.string().trim().max(200),
  latitud: z.number().gte(-90).lte(90),
  longitud: z.number().gte(-180).lte(180),
  peso_kg: positivo(10_000),
  volumen_m3: positivo(100),
  ventana_entrega_inicio: hora,
  ventana_entrega_fin: hora,
  tiempo_servicio_min: z.number().int().gte(0).lte(240),
  prioridad: z.enum(PRIORIDADES),
  tipo_producto: z.enum(TIPOS_PRODUCTO),
  estado: z.enum(ESTADOS_PEDIDO),
};

export const pedidoCrear = z.object({
  ...camposPedido,
  punto_referencia: camposPedido.punto_referencia.default(""),
  tiempo_servicio_min: camposPedido.tiempo_servicio_min.default(5),
  estado: camposPedido.estado.default("pendiente"),
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
});
export const cambiarEstadoRuta = z.object({ estado: z.enum(ESTADOS_RUTA) });

// ---------- Geocodificación ----------

export const busquedaDireccion = z.object({ q: z.string().trim().min(3, "Escribe al menos 3 caracteres.").max(200) });
