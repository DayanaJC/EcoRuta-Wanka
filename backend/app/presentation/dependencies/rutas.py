"""Dependencias FastAPI del modulo de rutas (US-003)."""

from typing import Any

from fastapi import Depends

from app.business.services.ruta_service import RutaService
from app.data.repositories.firebase.ruta_repository import (
    FirestoreRutaRepository,
)
from app.data.repositories.firebase.vehiculo_repository import (
    FirestoreVehiculoRepository,
)
from app.presentation.dependencies.database import get_db


def get_ruta_service(db: Any = Depends(get_db)) -> RutaService:
    """Compone el servicio de rutas con Firestore real."""
    return RutaService(
        FirestoreRutaRepository(db),
        FirestoreVehiculoRepository(db),
    )
