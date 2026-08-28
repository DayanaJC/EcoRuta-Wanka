"""Esquemas Pydantic del modulo de rutas (RF-04).

Definen la forma en que los datos entran y salen de la API. La capa de
negocio decide el algoritmo y las reglas; aqui solo se valida el formato
del dato (coordenadas, hora HH:MM, parametros de estimacion).
"""

import re
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

_PATRON_HORA = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def _validar_id(valor: object) -> Optional[str]:
    """Recorta espacios y exige un id no vacio."""
    if valor is None:
        return None
    texto = str(valor).strip()
    if not texto:
        raise ValueError("El id no puede estar vacio.")
    return texto


def _validar_hora(valor: object) -> Optional[str]:
    """Valida y normaliza el formato HH:MM de una hora del dia."""
    if valor is None:
        return None
    hora = str(valor).strip()
    if not _PATRON_HORA.match(hora):
        raise ValueError("Hora invalida: use el formato HH:MM (ejemplo 08:00).")
    return hora


class RutaRequest(BaseModel):
    """Parametros para generar la ruta optimizada de un vehiculo."""

    vehiculo_id: str = Field(..., min_length=1, max_length=100, examples=["VEH-0001"])
    latitud_inicio: Optional[float] = Field(
        default=None,
        ge=-90,
        le=90,
        description="Opcional: punto de partida. Si falta se usa el de Huancayo.",
        examples=[-12.0664],
    )
    longitud_inicio: Optional[float] = Field(
        default=None,
        ge=-180,
        le=180,
        examples=[-75.2089],
    )
    hora_inicio: Optional[str] = Field(
        default=None,
        description="Opcional: hora de salida (HH:MM). Defecto 08:00.",
        examples=["08:00"],
    )
    velocidad_media_kmh: Optional[float] = Field(
        default=None,
        gt=5,
        le=120,
        description="Opcional: velocidad media urbana. Defecto 30 km/h.",
        examples=[30.0],
    )
    tiempo_servicio_min: Optional[int] = Field(
        default=None,
        ge=0,
        le=120,
        description="Opcional: minutos de atencion por parada. Defecto 10.",
        examples=[10],
    )

    @field_validator("vehiculo_id", mode="before")
    @classmethod
    def _normalizar_id(cls, valor: object) -> object:
        return _validar_id(valor)

    @field_validator("hora_inicio", mode="before")
    @classmethod
    def _validar_hora_inicio(cls, valor: object) -> object:
        return _validar_hora(valor)

    @model_validator(mode="after")
    def _coordenadas_juntas(self) -> "RutaRequest":
        if (self.latitud_inicio is None) != (self.longitud_inicio is None):
            raise ValueError(
                "Debe indicar latitud_inicio y longitud_inicio juntas "
                "(o ninguna, para usar el punto de partida por defecto)."
            )
        return self


class ParadaResponse(BaseModel):
    """Parada de entrega de la ruta tal como se devuelve en la API."""

    orden: int
    pedido_id: str
    cliente_nombre: str
    direccion: str
    latitud: float
    longitud: float
    peso_kg: float
    ventana_entrega_inicio: str
    ventana_entrega_fin: str
    hora_estimada_llegada: str
    cumple_ventana: bool
    distancia_desde_origen_km: float

    model_config = ConfigDict(from_attributes=True)


class PedidoExcluidoResponse(BaseModel):
    """Pedido asignado que no entro en la ruta y el motivo (RF-04)."""

    pedido_id: str
    motivo: str

    model_config = ConfigDict(from_attributes=True)


class RutaResponse(BaseModel):
    """Ruta optimizada tal como se devuelve en la API."""

    vehiculo_id: str
    vehiculo_placa: str
    punto_partida_latitud: float
    punto_partida_longitud: float
    hora_inicio: str
    velocidad_media_kmh: float
    tiempo_servicio_min: int
    paradas: list[ParadaResponse]
    paradas_excluidas: list[PedidoExcluidoResponse]
    distancia_total_km: float
    tiempo_estimado_min: float
    cantidad_paradas: int
    combustible_estimado_l: float
    emisiones_co2_kg: float
    peso_total_kg: float
    cumplimiento_ventanas: bool

    model_config = ConfigDict(from_attributes=True)