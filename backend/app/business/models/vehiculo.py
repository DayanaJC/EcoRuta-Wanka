"""Modelo de dominio del vehiculo y enumeraciones de RF-01.

El modelo de dominio es agnostico de la infraestructura: no conoce
Firestore, FastAPI ni Pydantic. Las demas capas lo usan como la
representacion central de un vehiculo dentro del sistema.
"""

import re
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class TipoVehiculo(str, Enum):
    CAMIONETA = "camioneta"
    FURGON = "furgon"
    MOTO = "moto"


class EstadoVehiculo(str, Enum):
    ACTIVO = "activo"
    INACTIVO = "inactivo"


_PATRON_PLACA = re.compile(r"^[A-Z]{3}-\d{3}$")


def normalizar_placa(placa: str) -> str:
    """Normaliza y valida una placa peruana (ej: 'abc-123' -> 'ABC-123').

    Las placas de Huancayo siguen el sistema peruano clasico: tres letras,
    guion y tres digitos (ejemplo: ABC-123). La validacion aqui es la regla
    de negocio autoritativa; los esquemas la aplican antes de llegar aqui.
    """
    if not placa or not placa.strip():
        raise ValueError("La placa no puede estar vacia.")
    normalizada = placa.strip().upper()
    if not _PATRON_PLACA.match(normalizada):
        raise ValueError(
            "Formato de placa invalido: use tres letras, guion y tres "
            "digitos (ejemplo: ABC-123)."
        )
    return normalizada


@dataclass
class Vehiculo:
    """Vehiculo de la flota de reparto de EcoRuta Wanka."""

    placa: str
    tipo: TipoVehiculo
    capacidad_carga_kg: float
    consumo_combustible_l100km: float
    factor_emision_co2_kg_l: float
    anio_fabricacion: int
    estado: EstadoVehiculo = EstadoVehiculo.ACTIVO
    id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None