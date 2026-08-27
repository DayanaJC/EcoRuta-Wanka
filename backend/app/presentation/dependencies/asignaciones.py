"""Dependencias FastAPI del modulo de asignaciones (RF-03).

Composicion de dependencias: cliente Firestore -> repositorios -> servicio.
El controller solo conoce el servicio; el resto se inyecta aqui.
"""

from typing import Any

from fastapi import Depends

from app.business.services.asignacion_service import AsignacionService
from app.data.repositories.firebase.asignacion_repository import (
    FirestoreAsignacionRepository,
)
from app.data.repositories.firebase.pedido_repository import (
    FirestorePedidoRepository,
)
from app.data.repositories.firebase.vehiculo_repository import (
    FirestoreVehiculoRepository,
)
from app.presentation.dependencies.database import get_db


def get_asignacion_service(db: Any = Depends(get_db)) -> AsignacionService:
    """Compone el servicio de asignaciones con Firestore real."""
    return AsignacionService(
        FirestoreAsignacionRepository(db),
        FirestorePedidoRepository(db),
        FirestoreVehiculoRepository(db),
    )