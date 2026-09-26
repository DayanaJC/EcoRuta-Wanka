"""Controller REST del modulo de rutas (US-003).

Solo traduce HTTP <-> servicio: no contiene reglas de negocio.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app.business.exceptions.ruta import (
    RutaNotFoundError,
    RutaSinDatosError,
    RutaVehiculoInactivoError,
)
from app.business.services.ruta_service import RutaService
from app.presentation.dependencies.rutas import get_ruta_service
from app.schemas.ruta import (
    CambiarEstadoRutaRequest,
    RutaCreate,
    RutaResponse,
    RutaUpdate,
)

router = APIRouter(prefix="/api/v1/rutas", tags=["rutas"])


def _map_error(exc: Exception) -> HTTPException:
    if isinstance(exc, RutaNotFoundError):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(exc))
    if isinstance(exc, RutaSinDatosError):
        return HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc))
    if isinstance(exc, RutaVehiculoInactivoError):
        return HTTPException(status.HTTP_409_CONFLICT, str(exc))
    return HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(exc))


@router.post(
    "",
    response_model=RutaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generar una ruta de reparto",
)
def generar_ruta(
    datos: RutaCreate,
    service: RutaService = Depends(get_ruta_service),
) -> RutaResponse:
    try:
        return service.generar_ruta(datos)
    except (RutaSinDatosError, RutaVehiculoInactivoError) as exc:
        raise _map_error(exc) from exc
    except ValueError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc


@router.get("", response_model=list[RutaResponse], summary="Listar rutas")
def listar_rutas(
    service: RutaService = Depends(get_ruta_service),
) -> list[RutaResponse]:
    return service.listar_rutas()


@router.get("/{ruta_id}", response_model=RutaResponse, summary="Obtener una ruta")
def obtener_ruta(
    ruta_id: str,
    service: RutaService = Depends(get_ruta_service),
) -> RutaResponse:
    try:
        return service.obtener_ruta(ruta_id)
    except RutaNotFoundError as exc:
        raise _map_error(exc) from exc


@router.get(
    "/vehiculo/{vehiculo_id}",
    response_model=list[RutaResponse],
    summary="Listar rutas de un vehiculo",
)
def listar_por_vehiculo(
    vehiculo_id: str,
    service: RutaService = Depends(get_ruta_service),
) -> list[RutaResponse]:
    return service.listar_por_vehiculo(vehiculo_id)


@router.patch(
    "/{ruta_id}/estado",
    response_model=RutaResponse,
    summary="Cambiar el estado de una ruta",
)
def cambiar_estado_ruta(
    ruta_id: str,
    datos: CambiarEstadoRutaRequest,
    service: RutaService = Depends(get_ruta_service),
) -> RutaResponse:
    try:
        return service.actualizar_estado(ruta_id, datos.estado)
    except RutaNotFoundError as exc:
        raise _map_error(exc) from exc


@router.delete(
    "/{ruta_id}",
    response_model=RutaResponse,
    summary="Cancelar una ruta",
)
def cancelar_ruta(
    ruta_id: str,
    service: RutaService = Depends(get_ruta_service),
) -> RutaResponse:
    try:
        return service.cancelar_ruta(ruta_id)
    except RutaNotFoundError as exc:
        raise _map_error(exc) from exc
