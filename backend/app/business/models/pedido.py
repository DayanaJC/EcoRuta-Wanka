"""Modelo de dominio del pedido y enumeraciones de RF-02.

El modelo de dominio es agnostico de la infraestructura: no conoce
Firestore, FastAPI ni Pydantic. Las demas capas lo usan como la
representacion central de un pedido dentro del sistema.
"""

import re
from dataclasses import dataclass
from enum import Enum
from typing import Optional

from app.business.exceptions.pedido import VentanaEntregaInvalidaError

_PATRON_HORA = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


class PrioridadPedido(str, Enum):
    EXPRESS = "express"
    ESTANDAR = "estandar"
    ECONOMICO = "economico"


class TipoProducto(str, Enum):
    PERECEDERO = "perecedero"
    NO_PERECEDERO = "no_perecedero"


class EstadoPedido(str, Enum):
    PENDIENTE = "pendiente"
    EN_RUTA = "en_ruta"
    ENTREGADO = "entregado"
    CANCELADO = "cancelado"


def validar_ventana_entrega(inicio: str, fin: str) -> None:
    """Valida el formato HH:MM y que el fin sea posterior al inicio.

    Es la regla de negocio autoritativa de la ventana de entrega
    (RF-02). No retorna nada: lanza VentanaEntregaInvalidaError si
    el formato no es HH:MM o si la ventana es inversa o vacia.
    """
    horas = (inicio, fin)
    if any(not hora or not _PATRON_HORA.match(hora) for hora in horas):
        raise VentanaEntregaInvalidaError(
            "Ventana de entrega invalida: use el formato HH:MM (ejemplo 09:30)."
        )
    if inicio >= fin:
        raise VentanaEntregaInvalidaError(
            "Ventana de entrega invalida: la hora de inicio debe ser anterior "
            "a la hora de fin."
        )


@dataclass
class Pedido:
    """Pedido de reparto de EcoRuta Wanka."""

    cliente_id: str
    cliente_nombre: str
    direccion: str
    punto_referencia: str
    latitud: Optional[float]
    longitud: Optional[float]
    peso_kg: float
    volumen_m3: float
    ventana_entrega_inicio: str
    ventana_entrega_fin: str
    prioridad: PrioridadPedido
    tipo_producto: TipoProducto
    estado: EstadoPedido = EstadoPedido.PENDIENTE
    id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None