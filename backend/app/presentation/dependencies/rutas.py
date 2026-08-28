"""Dependencias FastAPI del modulo de rutas (RF-04).

Composicion de dependencias: cliente Firestore -> repositorios -> servicio.
El controller solo conoce el servicio; el resto se inyecta aqui.
"""

from typing import Any

from fastapi import Depends

from app.business.services.ruta_service import RutaService
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


def get_ruta_service(db: Any = Depends(get_db)) -> RutaService:
    """Compone el servicio de rutas con Firestore real."""
    return RutaService(
        FirestoreAsignacionRepository(db),
        FirestorePedidoRepository(db),
        FirestoreVehiculoRepository(db),
    )