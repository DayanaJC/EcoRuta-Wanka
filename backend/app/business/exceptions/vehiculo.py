"""Excepciones de dominio del modulo de vehiculos (RF-01).

Se lanzan desde la capa de negocio cuando se viola una regla y la capa
de presentacion las traduce a codigos HTTP (404, 409, ...).
"""


class VehiculoNotFoundError(LookupError):
    """El vehiculo solicitado no existe en el sistema."""


class VehiculoExistenteError(ValueError):
    """Ya existe un vehiculo registrado con la misma placa."""