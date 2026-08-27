"""Controller REST del modulo de vehiculos (RF-01).

Solo traduce HTTP <-> servicio: no contiene reglas de negocio ni accede
a Firestore directamente. Los errores de dominio se vuelven codigos HTTP.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app.business.exceptions.vehiculo import (
    VehiculoExistenteError,
    VehiculoNotFoundError,
)
from app.business.models.vehiculo import EstadoVehiculo
from app.business.services.vehiculo_service import VehiculoService
from app.presentation.dependencies.vehiculos import get_vehiculo_service
from app.schemas.vehiculo import (
    CambiarEstadoRequest,
    VehiculoCreate,
    VehiculoResponse,
    VehiculoUpdate,
)

router = APIRouter(prefix="/api/v1/vehiculos", tags=["vehiculos"])


@router.post(
    "",
    response_model=VehiculoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un vehiculo",
)
def crear_vehiculo(
    datos: VehiculoCreate,
    service: VehiculoService = Depends(get_vehiculo_service),
) -> VehiculoResponse:
    try:
        return service.registrar_vehiculo(datos)
    except VehiculoExistenteError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc


@router.get("", response_model=list[VehiculoResponse], summary="Listar vehiculos")
def listar_vehiculos(
    estado: Optional[EstadoVehiculo] = None,
    service: VehiculoService = Depends(get_vehiculo_service),
) -> list[VehiculoResponse]:
    return service.listar_vehiculos(estado=estado)


@router.get("/{vehiculo_id}", response_model=VehiculoResponse, summary="Obtener un vehiculo")
def obtener_vehiculo(
    vehiculo_id: str,
    service: VehiculoService = Depends(get_vehiculo_service),
) -> VehiculoResponse:
    try:
        return service.obtener_vehiculo(vehiculo_id)
    except VehiculoNotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc


@router.put("/{vehiculo_id}", response_model=VehiculoResponse, summary="Editar un vehiculo")
def actualizar_vehiculo(
    vehiculo_id: str,
    datos: VehiculoUpdate,
    service: VehiculoService = Depends(get_vehiculo_service),
) -> VehiculoResponse:
    try:
        return service.actualizar_vehiculo(vehiculo_id, datos)
    except VehiculoNotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    except VehiculoExistenteError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc


@router.patch(
    "/{vehiculo_id}/estado",
    response_model=VehiculoResponse,
    summary="Cambiar el estado de un vehiculo",
)
def cambiar_estado_vehiculo(
    vehiculo_id: str,
    datos: CambiarEstadoRequest,
    service: VehiculoService = Depends(get_vehiculo_service),
) -> VehiculoResponse:
    try:
        return service.cambiar_estado_vehiculo(vehiculo_id, datos.estado)
    except VehiculoNotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc


@router.delete(
    "/{vehiculo_id}",
    response_model=VehiculoResponse,
    summary="Desactivar un vehiculo (eliminacion logica)",
)
def desactivar_vehiculo(
    vehiculo_id: str,
    service: VehiculoService = Depends(get_vehiculo_service),
) -> VehiculoResponse:
    try:
        return service.desactivar_vehiculo(vehiculo_id)
    except VehiculoNotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc