"""Controller REST del modulo de pedidos (RF-02).

Solo traduce HTTP <-> servicio: no contiene reglas de negocio ni accede
a Firestore directamente. Los errores de dominio se vuelven codigos HTTP.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app.business.exceptions.pedido import (
    PedidoEstadoInvalidoError,
    PedidoNotFoundError,
    VentanaEntregaInvalidaError,
)
from app.business.models.pedido import EstadoPedido, PrioridadPedido
from app.business.services.pedido_service import PedidoService
from app.presentation.dependencies.pedidos import get_pedido_service
from app.schemas.pedido import (
    CambiarEstadoPedidoRequest,
    PedidoCreate,
    PedidoResponse,
    PedidoUpdate,
)

router = APIRouter(prefix="/api/v1/pedidos", tags=["pedidos"])


def _map_error(exc: Exception) -> HTTPException:
    """Traduce una excepcion de dominio a una respuesta HTTP."""
    if isinstance(exc, PedidoNotFoundError):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(exc))
    if isinstance(exc, PedidoEstadoInvalidoError):
        return HTTPException(status.HTTP_409_CONFLICT, str(exc))
    if isinstance(exc, VentanaEntregaInvalidaError):
        return HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, str(exc))
    return HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(exc))


@router.post(
    "",
    response_model=PedidoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un pedido",
)
def crear_pedido(
    datos: PedidoCreate,
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoResponse:
    try:
        return service.registrar_pedido(datos)
    except VentanaEntregaInvalidaError as exc:
        raise _map_error(exc) from exc


@router.get("", response_model=list[PedidoResponse], summary="Listar pedidos")
def listar_pedidos(
    estado: Optional[EstadoPedido] = None,
    prioridad: Optional[PrioridadPedido] = None,
    busqueda: Optional[str] = None,
    service: PedidoService = Depends(get_pedido_service),
) -> list[PedidoResponse]:
    return service.listar_pedidos(estado=estado, prioridad=prioridad, busqueda=busqueda)


@router.get("/{pedido_id}", response_model=PedidoResponse, summary="Obtener un pedido")
def obtener_pedido(
    pedido_id: str,
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoResponse:
    try:
        return service.obtener_pedido(pedido_id)
    except PedidoNotFoundError as exc:
        raise _map_error(exc) from exc


@router.put("/{pedido_id}", response_model=PedidoResponse, summary="Editar un pedido")
def actualizar_pedido(
    pedido_id: str,
    datos: PedidoUpdate,
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoResponse:
    try:
        return service.actualizar_pedido(pedido_id, datos)
    except (PedidoNotFoundError, PedidoEstadoInvalidoError, VentanaEntregaInvalidaError) as exc:
        raise _map_error(exc) from exc


@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoResponse,
    summary="Cambiar el estado de un pedido",
)
def cambiar_estado_pedido(
    pedido_id: str,
    datos: CambiarEstadoPedidoRequest,
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoResponse:
    try:
        return service.cambiar_estado_pedido(pedido_id, datos.estado)
    except (PedidoNotFoundError, PedidoEstadoInvalidoError) as exc:
        raise _map_error(exc) from exc


@router.delete(
    "/{pedido_id}",
    response_model=PedidoResponse,
    summary="Cancelar un pedido (eliminacion logica)",
)
def cancelar_pedido(
    pedido_id: str,
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoResponse:
    try:
        return service.cancelar_pedido(pedido_id)
    except (PedidoNotFoundError, PedidoEstadoInvalidoError) as exc:
        raise _map_error(exc) from exc