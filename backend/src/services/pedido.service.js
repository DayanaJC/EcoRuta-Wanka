// Servicio de pedidos (RF-02): ventana de entrega y estados terminales.

import { PedidoEstadoInvalidoError, PedidoNotFoundError, VentanaEntregaInvalidaError } from "../errors/errores.js";
import { totalesBultos } from "./carga.js";

export const ESTADOS_TERMINALES = ["entregado", "cancelado"];

// Regla de negocio: la ventana de entrega debe terminar después de empezar ("HH:MM" se compara como texto)
export function validarVentanaEntrega(inicio, fin) {
  if (inicio >= fin) {
    throw new VentanaEntregaInvalidaError("Ventana de entrega inválida: la hora de inicio debe ser anterior a la hora de fin.");
  }
}

export function crearPedidoService({ pedidos }) {
  const obtener = async (id) => {
    const pedido = await pedidos.getById(id);
    if (!pedido) throw new PedidoNotFoundError(`No existe un pedido con id ${id}.`);
    return pedido;
  };

  const verificarModificable = (pedido, accion) => {
    if (ESTADOS_TERMINALES.includes(pedido.estado)) {
      throw new PedidoEstadoInvalidoError(`No se puede ${accion} un pedido con estado '${pedido.estado}'.`);
    }
  };

  return {
    obtener,

    listar: (filtros) => pedidos.listar(filtros),

    async registrar(datos) {
      validarVentanaEntrega(datos.ventana_entrega_inicio, datos.ventana_entrega_fin);
      return pedidos.crear({ ...datos, ...totalesBultos(datos.bultos) });
    },

    async actualizar(id, campos) {
      const actual = await obtener(id);
      verificarModificable(actual, "modificar");
      if (campos.ventana_entrega_inicio || campos.ventana_entrega_fin) {
        validarVentanaEntrega(
          campos.ventana_entrega_inicio ?? actual.ventana_entrega_inicio,
          campos.ventana_entrega_fin ?? actual.ventana_entrega_fin,
        );
      }
      return pedidos.actualizar(id, campos.bultos ? { ...campos, ...totalesBultos(campos.bultos) } : campos);
    },

    async cambiarEstado(id, estado) {
      const actual = await obtener(id);
      verificarModificable(actual, "cambiar el estado de");
      return pedidos.actualizar(id, { estado });
    },

    // Eliminación lógica: el pedido queda cancelado (idempotente)
    async cancelar(id) {
      const actual = await obtener(id);
      if (actual.estado === "entregado") {
        throw new PedidoEstadoInvalidoError("No se puede cancelar un pedido que ya fue entregado.");
      }
      if (actual.estado === "cancelado") return actual;
      return pedidos.actualizar(id, { estado: "cancelado" });
    },
  };
}
