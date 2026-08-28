"""Controller REST del modulo de rutas (RF-04).

Solo traduce HTTP <-> servicio: no contiene reglas de negocio ni accede
a Firestore directamente. Los errores de dominio se vuelven codigos HTTP.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.business.exceptions.asignacion import VehiculoNoDisponibleError
from app.business.exceptions.ruta import SinPedidosAsignadosError
from app.business.exceptions.vehiculo import VehiculoNotFoundError
from app.business.services.ruta_service import RutaService
from app.presentation.dependencies.rutas import get_ruta_service
from app.schemas.ruta import RutaRequest, RutaResponse

router = APIRouter(prefix="/api/v1/rutas", tags=["rutas"])


@router.post(
    "",
    response_model=RutaResponse,
    status_code=status.HTTP_200_OK,
    summary="Optimizar la ruta de reparto de un vehiculo",
)
def generar_ruta(
    datos: RutaRequest,
    service: RutaService = Depends(get_ruta_service),
) -> RutaResponse:
    """Genera la secuencia optima de entregas del vehiculo con sus metricas."""
    try:
        return service.generar_ruta(datos)
    except VehiculoNotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    except (VehiculoNoDisponibleError, SinPedidosAsignadosError) as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc