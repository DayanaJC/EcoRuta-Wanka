"""Dependencias FastAPI del modulo de vehiculos (RF-01).

Composicion de dependencias: cliente Firestore -> repositorio -> servicio.
El controller solo conoce el servicio; el resto se inyecta aqui.
"""

from typing import Any

from fastapi import Depends

from app.business.services.vehiculo_service import VehiculoService
from app.data.repositories.firebase.vehiculo_repository import (
    FirestoreVehiculoRepository,
)
from app.presentation.dependencies.database import get_db


def get_vehiculo_service(db: Any = Depends(get_db)) -> VehiculoService:
    """Compone el servicio de vehiculos con Firestore real."""
    repositorio = FirestoreVehiculoRepository(db)
    return VehiculoService(repositorio)