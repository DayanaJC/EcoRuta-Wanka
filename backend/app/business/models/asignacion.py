"""Modelo de dominio de la asignacion de pedidos a vehiculos (RF-03).

El modelo de dominio es agnostico de la infraestructura: no conoce
Firestore, FastAPI ni Pydantic. Las demas capas lo usan como la
representacion central de una asignacion dentro del sistema.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Optional


class EstadoAsignacion(str, Enum):
    ASIGNADA = "asignada"
    CANCELADA = "cancelada"


@dataclass
class Asignacion:
    """Asignacion de un pedido a un vehiculo (relacion N-1 entre RF-02 y RF-01)."""

    pedido_id: str
    vehiculo_id: str
    fecha_asignacion: str
    estado: EstadoAsignacion = EstadoAsignacion.ASIGNADA
    id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None