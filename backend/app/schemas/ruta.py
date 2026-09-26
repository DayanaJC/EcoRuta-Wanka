"""Esquemas Pydantic del modulo de rutas.

Definen la forma en que los datos entran y salen de la API.
"""

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.business.models.ruta import EstadoRuta


class RutaCreate(BaseModel):
    """Datos para generar una ruta."""

    vehiculo_id: str = Field(..., examples=["VEH-0001"])
    pedido_ids: list[str] = Field(..., examples=[["PED-0001", "PED-0002"]])


class RutaUpdate(BaseModel):
    """Campos editables de una ruta (todos opcionales)."""

    estado: Optional[EstadoRuta] = None


class CambiarEstadoRutaRequest(BaseModel):
    """Cuerpo de la peticion para cambiar el estado de una ruta."""

    estado: EstadoRuta


class RutaResponse(BaseModel):
    """Representacion de una ruta tal como se devuelve en la API."""

    id: str
    vehiculo_id: str
    pedido_ids: list[str]
    estado: EstadoRuta
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
