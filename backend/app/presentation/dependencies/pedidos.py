"""Dependencias FastAPI del modulo de pedidos (RF-02).

Composicion de dependencias: cliente Firestore -> repositorio -> servicio.
El controller solo conoce el servicio; el resto se inyecta aqui.
"""

from typing import Any

from fastapi import Depends

from app.business.services.pedido_service import PedidoService
from app.data.repositories.firebase.pedido_repository import (
    FirestorePedidoRepository,
)
from app.presentation.dependencies.database import get_db


def get_pedido_service(db: Any = Depends(get_db)) -> PedidoService:
    """Compone el servicio de pedidos con Firestore real."""
    repositorio = FirestorePedidoRepository(db)
    return PedidoService(repositorio)