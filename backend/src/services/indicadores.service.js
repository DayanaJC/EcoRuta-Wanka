// Indicadores de sostenibilidad (RF-05). Se calculan a partir de las rutas del periodo
// (no canceladas) y de los datos de consumo y emisión de cada vehículo:
//   litros = km × consumo (L/100 km) ÷ 100 · CO₂ (kg) = litros × factor de emisión (kg CO₂/L)
// "Sin optimizar" = el mismo recorrido en el orden elegido por el operador (antes de optimizar).

import { PeriodoInvalidoError } from "../errors/errores.js";
import { fechaADate, hoyEn } from "../utils/tiempo.js";

export const DIAS_POR_DEFECTO = 7;
export const MAX_DIAS_PERIODO = 366;
// Metas del proyecto: O1 (reducir el CO₂ un 20 %) y O2 (fuera de horario menos del 10 %)
export const METAS = { reduccion_co2_pct: 20, fuera_de_horario_max_pct: 10 };

const DIA_MS = 86400000;
export const sumarDias = (yyyymmdd, dias) => new Date(fechaADate(yyyymmdd).getTime() + dias * DIA_MS).toISOString().slice(0, 10);
const diasEntre = (desde, hasta) => Math.round((fechaADate(hasta) - fechaADate(desde)) / DIA_MS) + 1;

const r2 = (n) => Math.round(n * 100) / 100;
const pct = (parte, total) => (total > 0 ? Math.round((parte / total) * 1000) / 10 : null);

// Distancia, combustible y CO₂ de una ruta (planificada y sin optimizar)
export function consumoRuta(ruta, vehiculo) {
  const km = ruta.distancia_estimada_km ?? 0;
  // Sin el dato "antes" se asume que no hubo ahorro (no se inventa una mejora)
  const kmAntes = ruta.distancia_sin_optimizar_km ?? km;
  const litros = (k) => (k * (vehiculo?.consumo_combustible_l100km ?? 0)) / 100;
  const co2 = (k) => litros(k) * (vehiculo?.factor_emision_co2_kg_l ?? 0);
  return { km, km_sin_optimizar: kmAntes, litros: litros(km), litros_sin_optimizar: litros(kmAntes), co2_kg: co2(km), co2_sin_optimizar_kg: co2(kmAntes) };
}

const vacio = () => ({
  rutas: 0, paradas: 0, entregadas: 0, a_tiempo: 0, no_entregadas: 0,
  km: 0, km_sin_optimizar: 0, litros: 0, litros_sin_optimizar: 0, co2_kg: 0, co2_sin_optimizar_kg: 0,
});

function acumular(acc, ruta, c) {
  const paradas = ruta.paradas ?? [];
  acc.rutas += 1;
  acc.paradas += paradas.length;
  acc.entregadas += paradas.filter((p) => p.estado === "entregada").length;
  acc.a_tiempo += paradas.filter((p) => p.estado === "entregada" && p.dentro_ventana).length;
  acc.no_entregadas += paradas.filter((p) => p.estado === "no_entregada").length;
  for (const k of ["km", "km_sin_optimizar", "litros", "litros_sin_optimizar", "co2_kg", "co2_sin_optimizar_kg"]) acc[k] += c[k];
  return acc;
}

// Totales redondeados con los ahorros y porcentajes derivados
function cerrar(acc) {
  const medidas = acc.entregadas; // toda entrega registrada tiene hora y dentro_ventana
  return {
    rutas: acc.rutas,
    paradas: acc.paradas,
    entregadas: acc.entregadas,
    a_tiempo: acc.a_tiempo,
    fuera_de_horario: acc.entregadas - acc.a_tiempo,
    no_entregadas: acc.no_entregadas,
    puntualidad_pct: pct(acc.a_tiempo, medidas),
    fuera_de_horario_pct: pct(acc.entregadas - acc.a_tiempo, medidas),
    km: r2(acc.km),
    km_sin_optimizar: r2(acc.km_sin_optimizar),
    km_ahorrados: r2(acc.km_sin_optimizar - acc.km),
    litros: r2(acc.litros),
    litros_ahorrados: r2(acc.litros_sin_optimizar - acc.litros),
    ahorro_combustible_pct: pct(acc.litros_sin_optimizar - acc.litros, acc.litros_sin_optimizar),
    co2_kg: r2(acc.co2_kg),
    co2_sin_optimizar_kg: r2(acc.co2_sin_optimizar_kg),
    co2_evitado_kg: r2(acc.co2_sin_optimizar_kg - acc.co2_kg),
    reduccion_co2_pct: pct(acc.co2_sin_optimizar_kg - acc.co2_kg, acc.co2_sin_optimizar_kg),
    co2_por_parada_kg: acc.paradas ? r2(acc.co2_kg / acc.paradas) : null,
  };
}

export function crearIndicadoresService({ rutas, vehiculos, conductores }, { zonaHoraria }) {
  // Periodo válido: por defecto los últimos 7 días (incluido hoy)
  const resolverPeriodo = ({ desde, hasta } = {}) => {
    const fin = hasta ?? (desde ? sumarDias(desde, DIAS_POR_DEFECTO - 1) : hoyEn(zonaHoraria));
    const inicio = desde ?? sumarDias(fin, -(DIAS_POR_DEFECTO - 1));
    if (inicio > fin) throw new PeriodoInvalidoError("Periodo inválido: la fecha inicial debe ser anterior o igual a la final.");
    if (diasEntre(inicio, fin) > MAX_DIAS_PERIODO) {
      throw new PeriodoInvalidoError(`Periodo inválido: consulta como máximo ${MAX_DIAS_PERIODO} días.`);
    }
    return { desde: inicio, hasta: fin, dias: diasEntre(inicio, fin) };
  };

  return {
    resolverPeriodo,

    // Indicadores del periodo. Si no hay rutas, sin_datos = true y no se devuelven valores (escenario 3).
    async calcular(filtros = {}) {
      const periodo = resolverPeriodo(filtros);
      const vehiculoFiltrado = filtros.vehiculo_id ? await vehiculos.getById(filtros.vehiculo_id) : null;
      const base = { periodo, filtros: { vehiculo_id: filtros.vehiculo_id ?? null, placa: vehiculoFiltrado?.placa ?? null }, metas: METAS };

      const lista = (await rutas.listar({ desde: periodo.desde, hasta: periodo.hasta, vehiculo_id: filtros.vehiculo_id }))
        .filter((r) => r.estado !== "cancelada")
        .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora_salida.localeCompare(b.hora_salida));
      if (!lista.length) {
        return { ...base, sin_datos: true, mensaje: "No existen rutas registradas para el periodo y los filtros seleccionados." };
      }

      const vehiculosPorId = Object.fromEntries((await vehiculos.listar()).map((v) => [v.id, v]));
      const conductoresPorId = Object.fromEntries((await conductores.listar()).map((c) => [c.id, c]));

      const total = vacio();
      const porDia = {};
      const porVehiculo = {};
      const detalle = [];
      for (const ruta of lista) {
        const vehiculo = vehiculosPorId[ruta.vehiculo_id];
        const c = consumoRuta(ruta, vehiculo);
        acumular(total, ruta, c);
        acumular((porDia[ruta.fecha] ??= vacio()), ruta, c);
        acumular((porVehiculo[ruta.vehiculo_id] ??= vacio()), ruta, c);
        const fila = cerrar(acumular(vacio(), ruta, c));
        detalle.push({
          id: ruta.id,
          fecha: ruta.fecha,
          hora_salida: ruta.hora_salida,
          estado: ruta.estado,
          placa: vehiculo?.placa ?? null,
          conductor: conductoresPorId[ruta.conductor_id]?.nombre ?? null,
          paradas: fila.paradas,
          entregadas: fila.entregadas,
          a_tiempo: fila.a_tiempo,
          no_entregadas: fila.no_entregadas,
          km: fila.km,
          km_sin_optimizar: fila.km_sin_optimizar,
          co2_kg: fila.co2_kg,
          co2_evitado_kg: fila.co2_evitado_kg,
        });
      }

      const totales = cerrar(total);
      const estados = Object.fromEntries(["generada", "en_reparto", "completada"].map((e) => [e, lista.filter((r) => r.estado === e).length]));
      return {
        ...base,
        sin_datos: false,
        totales: { ...totales, rutas_por_estado: estados },
        metas_cumplidas: {
          reduccion_co2: totales.reduccion_co2_pct != null && totales.reduccion_co2_pct >= METAS.reduccion_co2_pct,
          // Sin entregas registradas aún no se puede medir O2
          fuera_de_horario: totales.fuera_de_horario_pct == null ? null : totales.fuera_de_horario_pct < METAS.fuera_de_horario_max_pct,
        },
        por_dia: Object.entries(porDia).map(([fecha, acc]) => ({ fecha, ...cerrar(acc) })),
        por_vehiculo: Object.entries(porVehiculo)
          .map(([id, acc]) => ({ vehiculo_id: id, placa: vehiculosPorId[id]?.placa ?? null, tipo: vehiculosPorId[id]?.tipo ?? null, ...cerrar(acc) }))
          .sort((a, b) => b.co2_kg - a.co2_kg),
        rutas: detalle,
      };
    },
  };
}
