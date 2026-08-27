"""Esquemas Pydantic del modulo de vehiculos (RF-01).

Definen la forma en que los datos entran y salen de la API. La capa de
negocio decide las reglas; aqui solo se valida el formato del dato.

Las placas usan el sistema peruano clasico (tres letras, guion y tres
digitos, ej: ABC-123) y se normalizan a mayusculas.
"""

import re
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.business.models.vehiculo import EstadoVehiculo, TipoVehiculo

_PATRON_PLACA = re.compile(r"^[A-Z]{3}-\d{3}$")


def _validar_formato_placa(valor: object) -> Optional[str]:
    """Valida y normaliza el formato de placa recibido.

    Devuelve la placa normalizada en mayusculas, o None si el valor de
    entrada es None (permite actualizaciones parciales).
    """
    if valor is None:
        return None
    placa = str(valor).strip().upper()
    if not _PATRON_PLACA.match(placa):
        raise ValueError(
            "Placa invalida: use el formato peruano de tres letras, guion "
            "y tres digitos (ejemplo: ABC-123)."
        )
    return placa


class VehiculoBase(BaseModel):
    placa: str = Field(..., examples=["ABC-123"])
    tipo: TipoVehiculo
    capacidad_carga_kg: float = Field(gt=0, le=10_000, description="Capacidad de carga en kilogramos.")
    consumo_combustible_l100km: float = Field(gt=0, le=100, description="Consumo de combustible en L/100km.")
    factor_emision_co2_kg_l: float = Field(gt=0, le=100, description="Factor de emision de CO2 en kg por litro.")
    anio_fabricacion: int = Field(ge=1980, description="Anio de fabricacion del vehiculo.")
    estado: EstadoVehiculo = EstadoVehiculo.ACTIVO

    @field_validator("placa", mode="before")
    @classmethod
    def _normalizar_placa(cls, valor: object) -> object:
        return _validar_formato_placa(valor)


class VehiculoCreate(VehiculoBase):
    """Datos requeridos para registrar un vehiculo nuevo."""


class VehiculoUpdate(BaseModel):
    """Campos editables de un vehiculo (todos opcionales: actualizacion parcial)."""

    placa: Optional[str] = None
    tipo: Optional[TipoVehiculo] = None
    capacidad_carga_kg: Optional[float] = Field(default=None, gt=0, le=10_000)
    consumo_combustible_l100km: Optional[float] = Field(default=None, gt=0, le=100)
    factor_emision_co2_kg_l: Optional[float] = Field(default=None, gt=0, le=100)
    anio_fabricacion: Optional[int] = Field(default=None, ge=1980)
    estado: Optional[EstadoVehiculo] = None

    @field_validator("placa", mode="before")
    @classmethod
    def _normalizar_placa(cls, valor: object) -> object:
        return _validar_formato_placa(valor)


class CambiarEstadoRequest(BaseModel):
    """Cuerpo de la peticion para cambiar el estado de un vehiculo."""

    estado: EstadoVehiculo


class VehiculoResponse(VehiculoBase):
    """Representacion de un vehiculo tal como se devuelve en la API."""

    id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)