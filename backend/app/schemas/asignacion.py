"""Esquemas Pydantic del modulo de asignaciones (RF-03).

Definen la forma en que los datos entran y salen de la API. La capa de
negocio decide las reglas (disponibilidad, capacidad, duplicados); aqui
solo se valida el formato del dato.
"""

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.business.models.asignacion import EstadoAsignacion


def _validar_id(valor: object) -> Optional[str]:
    """Recorta espacios y exige un id no vacio."""
    if valor is None:
        return None
    texto = str(valor).strip()
    if not texto:
        raise ValueError("El id no puede estar vacio.")
    return texto


class AsignacionCreate(BaseModel):
    """Datos requeridos para asignar un pedido a un vehiculo."""

    pedido_id: str = Field(..., min_length=1, max_length=100, examples=["PED-0001"])
    vehiculo_id: str = Field(..., min_length=1, max_length=100, examples=["VEH-0001"])

    @field_validator("pedido_id", "vehiculo_id", mode="before")
    @classmethod
    def _normalizar_id(cls, valor: object) -> object:
        return _validar_id(valor)


class AsignacionResponse(BaseModel):
    """Representacion de una asignacion tal como se devuelve en la API."""

    id: str
    pedido_id: str
    vehiculo_id: str
    fecha_asignacion: str
    estado: EstadoAsignacion
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)