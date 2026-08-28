"""Excepciones de dominio del modulo de rutas (RF-04).

Se lanzan desde la capa de negocio cuando no se puede planificar la ruta
y la capa de presentacion las traduce a codigos HTTP (404, 409, ...).
"""


class SinPedidosAsignadosError(ValueError):
    """El vehiculo no tiene pedidos asignados activos para planificar."""