// Servicio de asignaciones: un pedido disponible a un vehículo activo con capacidad.

import {
  AsignacionNotFoundError,
  CapacidadInsuficienteError,
  PedidoNoDisponibleError,
  PedidoNotFoundError,
  PedidoYaAsignadoError,
  VehiculoNoDisponibleError,
  VehiculoNotFoundError,
} from "../errors/errores.js";
import { ESTADOS_TERMINALES } from "./pedido.service.js";

export function crearAsignacionService({ asignaciones, pedidos, vehiculos }) {
  const obtener = async (id) => {
    const asignacion = await asignaciones.getById(id);
    if (!asignacion) throw new AsignacionNotFoundError(`No existe una asignación con id ${id}.`);
    return asignacion;
  };

  return {
    obtener,

    listar: () => asignaciones.listar(),
    listarPorPedido: (pedidoId) => asignaciones.getByPedidoId(pedidoId),
    listarPorVehiculo: (vehiculoId) => asignaciones.getByVehiculoId(vehiculoId),

    async asignar({ pedido_id, vehiculo_id }) {
      const pedido = await pedidos.getById(pedido_id);
      if (!pedido) throw new PedidoNotFoundError(`No existe un pedido con id ${pedido_id}.`);
      if (ESTADOS_TERMINALES.includes(pedido.estado)) {
        throw new PedidoNoDisponibleError(`El pedido de ${pedido.cliente_nombre} está '${pedido.estado}' y no puede asignarse a un vehículo.`);
      }

      const vehiculo = await vehiculos.getById(vehiculo_id);
      if (!vehiculo) throw new VehiculoNotFoundError(`No existe un vehículo con id ${vehiculo_id}.`);
      if (vehiculo.estado !== "activo") throw new VehiculoNoDisponibleError(`El vehículo ${vehiculo.placa} no está activo.`);

      const activas = (await asignaciones.getByPedidoId(pedido_id)).filter((a) => a.estado === "asignada");
      if (activas.length) throw new PedidoYaAsignadoError(`El pedido de ${pedido.cliente_nombre} ya tiene una asignación activa.`);

      // RN-002: el peso del pedido no puede superar la capacidad del vehículo
      if (pedido.peso_kg > vehiculo.capacidad_carga_kg) {
        throw new CapacidadInsuficienteError(
          `El pedido de ${pedido.cliente_nombre} pesa ${pedido.peso_kg} kg y el vehículo ${vehiculo.placa} soporta ${vehiculo.capacidad_carga_kg} kg.`,
        );
      }

      return asignaciones.crear({ pedido_id, vehiculo_id, estado: "asignada" });
    },

    // Cancelación lógica (idempotente)
    async cancelar(id) {
      const actual = await obtener(id);
      if (actual.estado === "cancelada") return actual;
      return asignaciones.actualizar(id, { estado: "cancelada" });
    },
  };
}
