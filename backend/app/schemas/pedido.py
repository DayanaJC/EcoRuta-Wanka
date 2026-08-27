"""Esquemas Pydantic del modulo de pedidos (RF-02).

Definen la forma en que los datos entran y salen de la API. La capa de
negocio decide las reglas (como el orden de la ventana de entrega);
aqui solo se valida el formato del dato.
"""

import re
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.business.models.pedido import EstadoPedido, PrioridadPedido, TipoProducto

_PATRON_HORA = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def _validar_formato_hora(valor: object) -> Optional[str]:
    """Valida y normaliza el formato HH:MM de una hora de entrega."""
    if valor is None:
        return None
    hora = str(valor).strip()
    if not _PATRON_HORA.match(hora):
        raise ValueError(
            "Hora invalida: use el formato HH:MM (ejemplo 09:30)."
        )
    return hora


class PedidoBase(BaseModel):
    cliente_id: str = Field(..., min_length=3, max_length=50, examples=["CLI-0001"])
    cliente_nombre: str = Field(..., min_length=3, max_length=100, examples=["Comercial Huancayo"])
    direccion: str = Field(..., min_length=5, max_length=200, examples=["Av. Giraldez 1234, El Tambo"])
    punto_referencia: str = Field(default="", max_length=200, examples=["Frente al mercado"])
    latitud: float = Field(ge=-90, le=90, examples=[-12.0664])
    longitud: float = Field(ge=-180, le=180, examples=[-75.2089])
    peso_kg: float = Field(gt=0, le=10_000, description="Peso del pedido en kg.")
    volumen_m3: float = Field(gt=0, le=100, description="Volumen del pedido en m3.")
    ventana_entrega_inicio: str = Field(..., examples=["09:00"])
    ventana_entrega_fin: str = Field(..., examples=["12:00"])
    prioridad: PrioridadPedido
    tipo_producto: TipoProducto
    estado: EstadoPedido = EstadoPedido.PENDIENTE

    @field_validator("ventana_entrega_inicio", "ventana_entrega_fin")
    @classmethod
    def _validar_hora(cls, valor: object) -> object:
        return _validar_formato_hora(valor)


class PedidoCreate(PedidoBase):
    """Datos requeridos para registrar un pedido nuevo."""


class PedidoUpdate(BaseModel):
    """Campos editables de un pedido (todos opcionales: actualizacion parcial)."""

    cliente_id: Optional[str] = Field(default=None, min_length=3, max_length=50)
    cliente_nombre: Optional[str] = Field(default=None, min_length=3, max_length=100)
    direccion: Optional[str] = Field(default=None, min_length=5, max_length=200)
    punto_referencia: Optional[str] = Field(default=None, max_length=200)
    latitud: Optional[float] = Field(default=None, ge=-90, le=90)
    longitud: Optional[float] = Field(default=None, ge=-180, le=180)
    peso_kg: Optional[float] = Field(default=None, gt=0, le=10_000)
    volumen_m3: Optional[float] = Field(default=None, gt=0, le=100)
    ventana_entrega_inicio: Optional[str] = None
    ventana_entrega_fin: Optional[str] = None
    prioridad: Optional[PrioridadPedido] = None
    tipo_producto: Optional[TipoProducto] = None
    estado: Optional[EstadoPedido] = None

    @field_validator("ventana_entrega_inicio", "ventana_entrega_fin")
    @classmethod
    def _validar_hora(cls, valor: object) -> object:
        return _validar_formato_hora(valor)


class CambiarEstadoPedidoRequest(BaseModel):
    """Cuerpo de la peticion para cambiar el estado de un pedido."""

    estado: EstadoPedido


class PedidoResponse(PedidoBase):
    """Representacion de un pedido tal como se devuelve en la API."""

    id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)