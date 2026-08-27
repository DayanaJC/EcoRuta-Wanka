"""Controller REST del modulo de asignaciones (RF-03).

Solo traduce HTTP <-> servicio: no contiene reglas de negocio ni accede
a Firestore directamente. Los errores de dominio se vuelven codigos HTTP.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.business.exceptions.asignacion import (
    AsignacionNotFoundError,
    CapacidadInsuficienteError,
    PedidoYaAsignadoError,
    PedidoNoDisponibleError,
    VehiculoNoDisponibleError,
)
from app.business.exceptions.pedido import PedidoNotFoundError
from app.business.exceptions.vehiculo import VehiculoNotFoundError
from app.business.services.asignacion_service import AsignacionService
from app.presentation.dependencies.asignaciones import get_asignacion_service
from app.schemas.asignacion import AsignacionCreate, AsignacionResponse

router = APIRouter(prefix="/api/v1/asignaciones", tags=["asignaciones"])


def _map_error(exc: Exception) -> HTTPException:
    """Traduce una excepcion de dominio a una respuesta HTTP."""
    if isinstance(
        exc,
        (AsignacionNotFoundError, PedidoNotFoundError, VehiculoNotFoundError),
    ):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(exc))
    if isinstance(
        exc,
        (
            PedidoNoDisponibleError,
            VehiculoNoDisponibleError,
            CapacidadInsuficienteError,
            PedidoYaAsignadoError,
        ),
    ):
        return HTTPException(status.HTTP_409_CONFLICT, str(exc))
    return HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(exc))


@router.post(
    "",
    response_model=AsignacionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Asignar un pedido a un vehiculo",
)
def asignar_pedido(
    datos: AsignacionCreate,
    service: AsignacionService = Depends(get_asignacion_service),
) -> AsignacionResponse:
    try:
        return service.asignar_pedido(datos)
    except (
        PedidoNotFoundError,
        VehiculoNotFoundError,
        PedidoNoDisponibleError,
        VehiculoNoDisponibleError,
        CapacidadInsuficienteError,
        PedidoYaAsignadoError,
    ) as exc:
        raise _map_error(exc) from exc


@router.get(
    "",
    response_model=list[AsignacionResponse],
    summary="Listar asignaciones",
)
def listar_asignaciones(
    service: AsignacionService = Depends(get_asignacion_service),
) -> list[AsignacionResponse]:
    return service.listar_asignaciones()


@router.get(
    "/pedido/{pedido_id}",
    response_model=list[AsignacionResponse],
    summary="Listar asignaciones de un pedido",
)
def listar_por_pedido(
    pedido_id: str,
    service: AsignacionService = Depends(get_asignacion_service),
) -> list[AsignacionResponse]:
    return service.listar_por_pedido(pedido_id)


@router.get(
    "/vehiculo/{vehiculo_id}",
    response_model=list[AsignacionResponse],
    summary="Listar asignaciones de un vehiculo",
)
def listar_por_vehiculo(
    vehiculo_id: str,
    service: AsignacionService = Depends(get_asignacion_service),
) -> list[AsignacionResponse]:
    return service.listar_por_vehiculo(vehiculo_id)


@router.get(
    "/{asignacion_id}",
    response_model=AsignacionResponse,
    summary="Obtener una asignacion",
)
def obtener_asignacion(
    asignacion_id: str,
    service: AsignacionService = Depends(get_asignacion_service),
) -> AsignacionResponse:
    try:
        return service.obtener_asignacion(asignacion_id)
    except AsignacionNotFoundError as exc:
        raise _map_error(exc) from exc


@router.delete(
    "/{asignacion_id}",
    response_model=AsignacionResponse,
    summary="Cancelar una asignacion (cancelacion logica)",
)
def cancelar_asignacion(
    asignacion_id: str,
    service: AsignacionService = Depends(get_asignacion_service),
) -> AsignacionResponse:
    try:
        return service.cancelar_asignacion(asignacion_id)
    except AsignacionNotFoundError as exc:
        raise _map_error(exc) from exc