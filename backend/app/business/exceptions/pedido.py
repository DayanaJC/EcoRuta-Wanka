"""Excepciones de dominio del modulo de pedidos (RF-02).

Se lanzan desde la capa de negocio cuando se viola una regla y la capa
de presentacion las traduce a codigos HTTP (404, 409, 422, ...).
"""


class PedidoNotFoundError(LookupError):
    """El pedido solicitado no existe en el sistema."""


class PedidoEstadoInvalidoError(ValueError):
    """Operacion no permitida sobre el estado actual del pedido
    (por ejemplo, editar o cancelar un pedido entregado)."""


class VentanaEntregaInvalidaError(ValueError):
    """La ventana de entrega no cumple el formato o el orden de horas."""