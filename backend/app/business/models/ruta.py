"""Modelo de dominio de la ruta de reparto (RF-03 / US-003).

La ruta representa una secuencia de entregas asociada a un vehiculo.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Optional


class EstadoRuta(str, Enum):
    GENERADA = "generada"
    EN_REPARTO = "en_reparto"
    COMPLETADA = "completada"
    CANCELADA = "cancelada"


@dataclass
class Ruta:
    """Ruta de reparto de EcoRuta Wanka."""

    vehiculo_id: str
    pedido_ids: list[str]
    estado: EstadoRuta = EstadoRuta.GENERADA
    id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
