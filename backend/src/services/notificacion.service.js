// Notificaciones al cliente (Sprint 4): avisos automáticos en tres momentos del pedido
// (registrado, en camino, entregado / no entregado) y la página pública de seguimiento.
// El envío es simulado: el aviso queda registrado con el teléfono del cliente y el panel
// lo abre en WhatsApp (wa.me) con el mensaje ya escrito.

import { PedidoNotFoundError } from "../errors/errores.js";
import { horaLocal } from "../utils/tiempo.js";

export const EVENTOS_NOTIFICACION = ["pedido_creado", "en_camino", "entregado", "no_entregado"];

// Código corto y legible del pedido para el cliente
export const codigoPedido = (id) => `P-${String(id).slice(0, 6).toUpperCase()}`;

const ventana = (p) => `${p.ventana_entrega_inicio} y ${p.ventana_entrega_fin}`;

// Textos de los avisos (sin emojis, en el tono de una empresa local)
export function redactarMensaje(evento, pedido, { hora, motivo } = {}) {
  const saludo = `Hola, ${pedido.cliente_nombre}.`;
  const codigo = codigoPedido(pedido.id);
  switch (evento) {
    case "pedido_creado":
      return `${saludo} Recibimos tu pedido ${codigo} en WankaLogística. Lo entregaremos entre las ${ventana(pedido)} y te avisaremos cuando salga a reparto.`;
    case "en_camino":
      return `${saludo} Tu pedido ${codigo} ya salió del almacén y va en camino.${hora ? ` Llegada estimada: ${hora}.` : ""}`;
    case "entregado":
      return `${saludo} Tu pedido ${codigo} fue entregado${hora ? ` a las ${hora}` : ""}. Gracias por confiar en WankaLogística.`;
    case "no_entregado":
      return `${saludo} No pudimos entregar tu pedido ${codigo}${motivo ? ` (${motivo.toLowerCase()})` : ""}. Lo reprogramaremos y te avisaremos la nueva fecha.`;
    default:
      throw new Error(`Evento de notificación desconocido: ${evento}`);
  }
}

// Etapa visible para el cliente según el pedido y su última ruta
function etapaSeguimiento(pedido, ruta, parada) {
  if (pedido.estado === "cancelado") return "cancelado";
  if (pedido.estado === "entregado") return "entregado";
  if (pedido.estado === "en_ruta") return "en_camino";
  if (parada?.estado === "no_entregada") return "no_entregado";
  if (ruta?.estado === "generada") return "programado";
  return "registrado";
}

export function crearNotificacionService({ notificaciones, pedidos, clientes, rutas }, { zonaHoraria, almacen }) {
  const hora = (instante) => horaLocal(new Date(instante), zonaHoraria);

  // eventos: [{ pedido, evento, fecha, hora?, motivo? }]. Nunca interrumpe la operación
  // principal: si el aviso falla, la entrega o el pedido ya quedaron registrados.
  const registrar = async (eventos) => {
    if (!eventos.length) return [];
    try {
      const codigos = [...new Set(eventos.map((e) => e.pedido.cliente_id))];
      const telefonos = Object.fromEntries((await clientes.getPorCodigos(codigos)).map((c) => [c.codigo, c.telefono]));
      return await notificaciones.crearMuchas(
        eventos.map(({ pedido, evento, fecha, ...datos }) => {
          const instante = new Date(fecha ?? Date.now());
          // Un aviso no puede salir antes de que exista el pedido (p. ej., al simular una
          // ruta de hoy con una salida anterior a la hora en que se registró el pedido)
          const creado = pedido.created_at ? new Date(pedido.created_at) : instante;
          return {
            pedido_id: pedido.id,
            evento,
            canal: "whatsapp",
            telefono: telefonos[pedido.cliente_id] ?? null,
            mensaje: redactarMensaje(evento, pedido, { hora: evento === "entregado" ? hora(instante) : undefined, ...datos }),
            fecha: new Date(Math.max(instante.getTime(), creado.getTime())).toISOString(),
          };
        }),
      );
    } catch (e) {
      console.error("[notificaciones]", e);
      return [];
    }
  };

  return {
    registrar,

    async listarPorPedido(pedidoId) {
      const pedido = await pedidos.getById(pedidoId);
      if (!pedido) throw new PedidoNotFoundError(`No existe un pedido con id ${pedidoId}.`);
      return notificaciones.listarPorPedido(pedidoId);
    },

    // Vista pública del pedido para el cliente: solo sus propios datos (sin teléfono,
    // sin otros clientes de la ruta ni el recorrido del vehículo).
    async seguimiento(token) {
      const pedido = await pedidos.getByToken(token);
      if (!pedido) throw new PedidoNotFoundError("El enlace de seguimiento no es válido.");
      const ruta = await rutas.ultimaDePedido(pedido.id);
      const parada = ruta?.paradas.find((p) => p.pedido_id === pedido.id) ?? null;
      const enCurso = ruta && ["generada", "en_reparto"].includes(ruta.estado);
      const entregasAntes =
        enCurso && parada?.estado === "pendiente"
          ? ruta.paradas.filter((p) => p.orden < parada.orden && p.estado === "pendiente").length
          : null;
      const avisos = await notificaciones.listarPorPedido(pedido.id);
      return {
        pedido: {
          codigo: codigoPedido(pedido.id),
          cliente_nombre: pedido.cliente_nombre,
          direccion: pedido.direccion,
          punto_referencia: pedido.punto_referencia,
          latitud: pedido.latitud,
          longitud: pedido.longitud,
          ventana_entrega_inicio: pedido.ventana_entrega_inicio,
          ventana_entrega_fin: pedido.ventana_entrega_fin,
          estado: pedido.estado,
          fecha_entrega: pedido.fecha_entrega,
          created_at: pedido.created_at,
        },
        etapa: etapaSeguimiento(pedido, ruta, parada),
        entrega: ruta
          ? {
              fecha: ruta.fecha,
              hora_estimada: parada?.hora_estimada_llegada ?? null,
              entregas_antes: entregasAntes,
              salida_at: ruta.iniciada_at,
              motivo_no_entrega: parada?.estado === "no_entregada" ? parada.motivo_no_entrega : null,
            }
          : null,
        almacen: { nombre: almacen.nombre, latitud: almacen.latitud, longitud: almacen.longitud },
        avisos: avisos.map(({ evento, mensaje, fecha }) => ({ evento, mensaje, fecha })),
      };
    },
  };
}
