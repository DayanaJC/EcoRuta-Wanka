// Servicio de clientes/bodegas (RF-09): registro de sus preferencias de entrega y
// aplicación de esas preferencias al planificar una ruta.

import { ClienteExistenteError, ClienteNotFoundError, PreferenciaEntregaError } from "../errors/errores.js";
import { fechaADate } from "../utils/tiempo.js";
import { validarVentanaEntrega } from "./pedido.service.js";

export const NOMBRES_DIA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

// Ventana con la que se planifica un pedido: la del pedido recortada por la preferencia
// vigente del cliente (si el cliente cambió su horario después de registrar el pedido,
// manda el horario nuevo). Devuelve null si no se cruzan.
export function ventanaEfectiva(pedido, cliente) {
  if (!cliente) return { inicio: pedido.ventana_entrega_inicio, fin: pedido.ventana_entrega_fin };
  const inicio = pedido.ventana_entrega_inicio > cliente.ventana_inicio ? pedido.ventana_entrega_inicio : cliente.ventana_inicio;
  const fin = pedido.ventana_entrega_fin < cliente.ventana_fin ? pedido.ventana_entrega_fin : cliente.ventana_fin;
  return inicio < fin ? { inicio, fin } : null;
}

// Ventanas de planificación por pedido sin lanzar errores (re-optimización de una ruta en curso):
// si la preferencia ya no se cruza con el pedido, se usa la ventana del pedido.
export async function ventanasConPreferencias({ clientes }, pedidos) {
  const registrados = await clientes.getPorCodigos([...new Set(pedidos.map((p) => p.cliente_id))]);
  const porCodigo = Object.fromEntries(registrados.filter((c) => c.estado === "activo").map((c) => [c.codigo, c]));
  return Object.fromEntries(pedidos.map((p) => [p.id, ventanaEfectiva(p, porCodigo[p.cliente_id]) ?? ventanaEfectiva(p, null)]));
}

/**
 * RN de preferencias: un pedido de un cliente registrado y activo solo se planifica en un
 * día en que el cliente recibe mercadería y dentro de su horario preferido.
 * Devuelve los pedidos con la ventana que debe usar la optimización.
 */
export async function aplicarPreferencias({ clientes }, pedidos, fecha) {
  const registrados = await clientes.getPorCodigos([...new Set(pedidos.map((p) => p.cliente_id))]);
  const porCodigo = Object.fromEntries(registrados.filter((c) => c.estado === "activo").map((c) => [c.codigo, c]));
  const dia = fechaADate(fecha).getUTCDay();

  const noRecibe = pedidos.filter((p) => porCodigo[p.cliente_id] && !porCodigo[p.cliente_id].dias_recepcion.includes(dia));
  if (noRecibe.length) {
    throw new PreferenciaEntregaError(
      `Según sus preferencias, estos clientes no reciben pedidos los ${NOMBRES_DIA[dia]}: ${noRecibe.map((p) => p.cliente_nombre).join(", ")}. ` +
        "Planifica la ruta para otro día o quítalos de la ruta.",
    );
  }

  const sinCruce = pedidos.filter((p) => !ventanaEfectiva(p, porCodigo[p.cliente_id]));
  if (sinCruce.length) {
    throw new PreferenciaEntregaError(
      `La ventana del pedido no coincide con el horario preferido del cliente: ${sinCruce
        .map((p) => `${p.cliente_nombre} (pedido ${p.ventana_entrega_inicio}-${p.ventana_entrega_fin}, prefiere ${porCodigo[p.cliente_id].ventana_inicio}-${porCodigo[p.cliente_id].ventana_fin})`)
        .join(", ")}. Corrige la ventana del pedido o la preferencia del cliente.`,
    );
  }

  return pedidos.map((p) => {
    const { inicio, fin } = ventanaEfectiva(p, porCodigo[p.cliente_id]);
    return { ...p, ventana_entrega_inicio: inicio, ventana_entrega_fin: fin };
  });
}

export function crearClienteService({ clientes }) {
  const obtener = async (id) => {
    const cliente = await clientes.getById(id);
    if (!cliente) throw new ClienteNotFoundError(`No existe un cliente con id ${id}.`);
    return cliente;
  };

  const verificarCodigoLibre = async (codigo) => {
    if (await clientes.getByCodigo(codigo)) {
      throw new ClienteExistenteError(`Ya existe un cliente registrado con el código ${codigo}.`);
    }
  };

  return {
    obtener,
    listar: (filtros) => clientes.listar(filtros),

    async registrar(datos) {
      validarVentanaEntrega(datos.ventana_inicio, datos.ventana_fin);
      await verificarCodigoLibre(datos.codigo);
      return clientes.crear(datos);
    },

    async actualizar(id, campos) {
      const actual = await obtener(id);
      if (campos.ventana_inicio || campos.ventana_fin) {
        validarVentanaEntrega(campos.ventana_inicio ?? actual.ventana_inicio, campos.ventana_fin ?? actual.ventana_fin);
      }
      return clientes.actualizar(id, campos);
    },

    async cambiarEstado(id, estado) {
      const actual = await obtener(id);
      return actual.estado === estado ? actual : clientes.actualizar(id, { estado });
    },
  };
}
