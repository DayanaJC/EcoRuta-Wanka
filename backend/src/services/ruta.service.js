// Servicio de rutas (RF-03): valida los datos, aplica el factor de tráfico,
// solicita el orden óptimo a la API de optimización y guarda la ruta.

import {
  CapacidadInsuficienteError,
  PedidoNoDisponibleError,
  PedidoNotFoundError,
  RutaNoOptimizableError,
  RutaNotFoundError,
  RutaSinDatosError,
  VehiculoNoDisponibleError,
  VehiculoNotFoundError,
} from "../errors/errores.js";
import { hoyEn, segundosAHora, tipoDia } from "../utils/tiempo.js";
import { ESTADOS_TERMINALES } from "./pedido.service.js";

export const HORA_SALIDA_POR_DEFECTO = "08:00";
export const FACTOR_SIN_TRAFICO = 1;

export function crearRutaService({ rutas, vehiculos, pedidos, factoresTrafico }, { optimizador, almacen, zonaHoraria }) {
  const obtener = async (id) => {
    const ruta = await rutas.getById(id);
    if (!ruta) throw new RutaNotFoundError(`No existe una ruta con id ${id}.`);
    return ruta;
  };

  const cambiarEstado = async (id, estado) => {
    await obtener(id);
    return rutas.actualizar(id, { estado });
  };

  return {
    obtener,
    cambiarEstado,
    cancelar: (id) => cambiarEstado(id, "cancelada"),

    listar: () => rutas.listar(),
    listarPorVehiculo: (vehiculoId) => rutas.listarPorVehiculo(vehiculoId),

    async generar({ vehiculo_id, pedido_ids, fecha, hora_salida }) {
      const vehiculo = await vehiculos.getById(vehiculo_id);
      if (!vehiculo) throw new VehiculoNotFoundError(`No existe un vehículo con id ${vehiculo_id}.`);
      if (vehiculo.estado !== "activo") throw new VehiculoNoDisponibleError(`El vehículo ${vehiculo.placa} no está activo.`);

      const ids = [...new Set(pedido_ids)];
      if (!ids.length) throw new RutaSinDatosError("No se proporcionaron pedidos para generar la ruta.");

      const encontrados = await pedidos.getMuchos(ids);
      const faltantes = ids.filter((id) => !encontrados.some((p) => p.id === id));
      if (faltantes.length) throw new PedidoNotFoundError(`No existen los pedidos: ${faltantes.join(", ")}.`);
      // Mantener el orden de selección del operador (sirve de referencia)
      const lista = ids.map((id) => encontrados.find((p) => p.id === id));

      const noDisponibles = lista.filter((p) => ESTADOS_TERMINALES.includes(p.estado));
      if (noDisponibles.length) {
        throw new PedidoNoDisponibleError(
          `Estos pedidos están entregados o cancelados y no pueden incluirse: ${noDisponibles.map((p) => p.cliente_nombre).join(", ")}.`,
        );
      }

      // RN-002: la carga total no puede superar la capacidad del vehículo
      const pesoTotal = lista.reduce((suma, p) => suma + p.peso_kg, 0);
      if (pesoTotal > vehiculo.capacidad_carga_kg) {
        throw new CapacidadInsuficienteError(
          `Los pedidos suman ${Number(pesoTotal.toFixed(2))} kg y el vehículo ${vehiculo.placa} soporta ${vehiculo.capacidad_carga_kg} kg.`,
        );
      }

      const dia = fecha ?? hoyEn(zonaHoraria);
      const salida = hora_salida ?? HORA_SALIDA_POR_DEFECTO;
      const factor = (await factoresTrafico.buscar(tipoDia(dia), salida))?.factor ?? FACTOR_SIN_TRAFICO;

      const resultado = await optimizador.optimizarRuta({
        almacen,
        vehiculo,
        pedidos: lista,
        horaSalida: salida,
        factorVelocidad: factor,
      });

      if (resultado.no_asignados.length) {
        const nombres = lista.filter((p) => resultado.no_asignados.includes(p.id)).map((p) => p.cliente_nombre);
        throw new RutaNoOptimizableError(
          `No es posible atender estos pedidos dentro de su ventana de entrega saliendo a las ${salida}: ${nombres.join(", ")}. ` +
            "Revisa las ventanas de entrega o cambia la hora de salida.",
        );
      }

      return rutas.crearConParadas({
        vehiculo_id,
        fecha: dia,
        hora_salida: salida,
        distancia_estimada_km: Number((resultado.distancia_m / 1000).toFixed(2)),
        tiempo_estimado_min: Math.round(resultado.duracion_total_s / 60),
        factor_trafico_aplicado: factor,
        geometria: resultado.geometria,
        estado: "generada",
        paradas: resultado.paradas.map((p, i) => ({
          orden: i + 1,
          pedido_id: p.pedido_id,
          hora_estimada_llegada: segundosAHora(p.llegada_seg),
        })),
      });
    },
  };
}
