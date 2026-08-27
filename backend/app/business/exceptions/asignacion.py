"""Excepciones de dominio del modulo de asignaciones (RF-03).

Se lanzan desde la capa de negocio cuando se viola una regla y la capa
de presentacion las traduce a codigos HTTP (404, 409, ...).
"""


class AsignacionNotFoundError(LookupError):
    """La asignacion solicitada no existe en el sistema."""


class PedidoNoDisponibleError(ValueError):
    """El pedido no puede asignarse: no existe o esta en un estado terminal
    (entregado o cancelado)."""


class VehiculoNoDisponibleError(ValueError):
    """El vehiculo no puede recibir la asignacion: no existe o no esta activo."""


class CapacidadInsuficienteError(ValueError):
    """El peso del pedido supera la capacidad de carga del vehiculo."""


class PedidoYaAsignadoError(ValueError):
    """El pedido ya tiene una asignacion activa en el sistema."""