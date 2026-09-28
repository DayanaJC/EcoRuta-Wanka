// Datos iniciales: factores de tráfico (estimaciones configurables) y datos de
// prueba de Huancayo. Las ubicaciones de los pedidos son aproximadas y
// corresponden al escenario simulado de WankaLogística S.A.C.
// Es idempotente: solo inserta en tablas vacías.

import "dotenv/config";
import { obtenerPrisma } from "../src/db/prisma.js";
import { horaADate } from "../src/utils/tiempo.js";

const prisma = obtenerPrisma();

const FACTORES = [
  // factor = multiplicador de velocidad (1.0 = vías libres; 0.7 = 30 % más lento)
  { tipo_dia: "laborable", hora_inicio: "06:30", hora_fin: "09:00", factor: 0.7, descripcion: "Hora punta mañana" },
  { tipo_dia: "laborable", hora_inicio: "12:00", hora_fin: "14:30", factor: 0.8, descripcion: "Hora punta mediodía" },
  { tipo_dia: "laborable", hora_inicio: "17:30", hora_fin: "20:00", factor: 0.7, descripcion: "Hora punta tarde" },
  { tipo_dia: "fin_semana", hora_inicio: "10:00", hora_fin: "14:00", factor: 0.85, descripcion: "Mercados y ferias de fin de semana" },
];

const VEHICULOS = [
  { placa: "ABC-123", tipo: "camioneta", capacidad_carga_kg: 1000, consumo_combustible_l100km: 12, factor_emision_co2_kg_l: 2.31, anio_fabricacion: 2020 },
  { placa: "DEF-456", tipo: "furgon", capacidad_carga_kg: 1500, consumo_combustible_l100km: 14, factor_emision_co2_kg_l: 2.68, anio_fabricacion: 2019 },
  { placa: "GHI-789", tipo: "moto", capacidad_carga_kg: 40, consumo_combustible_l100km: 3, factor_emision_co2_kg_l: 2.31, anio_fabricacion: 2022 },
];

const pedido = (cliente_id, cliente_nombre, direccion, latitud, longitud, peso_kg, inicio, fin, prioridad, tipo_producto) => ({
  cliente_id, cliente_nombre, direccion, latitud, longitud, peso_kg, volumen_m3: Number((peso_kg / 250).toFixed(3)),
  ventana_entrega_inicio: horaADate(inicio), ventana_entrega_fin: horaADate(fin), prioridad, tipo_producto,
});

const PEDIDOS = [
  pedido("CLI-0001", "Bodega San Carlos", "Jr. Puno 450, Huancayo", -12.0668, -75.206, 120, "08:00", "12:00", "estandar", "no_perecedero"),
  pedido("CLI-0002", "Minimarket El Tambo", "Av. Huancavelica 1200, El Tambo", -12.052, -75.215, 85, "09:00", "13:00", "express", "perecedero"),
  pedido("CLI-0003", "Farmacia Chilca", "Av. Leoncio Prado 300, Chilca", -12.085, -75.2, 15, "08:00", "18:00", "express", "no_perecedero"),
  pedido("CLI-0004", "Restaurante La Huancaína", "Calle Real 800, Huancayo", -12.062, -75.211, 60, "10:00", "12:30", "estandar", "perecedero"),
  pedido("CLI-0005", "Comercial Pilcomayo", "Av. Mariscal Castilla 500, Pilcomayo", -12.048, -75.25, 200, "08:00", "17:00", "economico", "no_perecedero"),
  pedido("CLI-0006", "Bodega Ocopilla", "Jr. Ica 1500, Huancayo", -12.059, -75.195, 45, "13:00", "17:00", "estandar", "no_perecedero"),
];

async function sembrar(nombre, modelo, filas) {
  if ((await modelo.count()) > 0) return console.log(`- ${nombre}: ya tiene datos, se omite`);
  await modelo.createMany({ data: filas });
  console.log(`- ${nombre}: ${filas.length} registros`);
}

await sembrar(
  "factores_trafico",
  prisma.factorTrafico,
  FACTORES.map((f) => ({ ...f, hora_inicio: horaADate(f.hora_inicio), hora_fin: horaADate(f.hora_fin) })),
);
await sembrar("vehiculos", prisma.vehiculo, VEHICULOS);
await sembrar("pedidos", prisma.pedido, PEDIDOS);
await prisma.$disconnect();
