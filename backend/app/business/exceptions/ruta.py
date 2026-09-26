"""Excepciones de dominio del modulo de rutas.

Se lanzan desde la capa de negocio cuando se viola una regla
y la capa de presentacion las traduce a codigos HTTP.
"""


class RutaNotFoundError(LookupError):
    """La ruta solicitada no existe en el sistema."""


class RutaSinDatosError(ValueError):
    """No existen datos suficientes para generar una ruta valida."""


class RutaVehiculoInactivoError(ValueError):
    """El vehiculo asignado a la ruta no esta activo."""
