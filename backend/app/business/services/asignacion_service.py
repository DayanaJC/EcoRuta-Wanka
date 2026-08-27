"""Servicio de dominio del modulo de asignaciones (RF-03).

Orquesta las reglas de negocio apoyandose en los repositorios inyectados
(asignaciones, pedidos y vehiculos). No conoce Firestore: recibe las
abstracciones en el constructor (inyeccion de dependencias desde la capa
de presentacion).
"""

from datetime import datetime, timezone

from app.business.exceptions.asignacion import (
    AsignacionNotFoundError,
    CapacidadInsuficienteError,
    PedidoYaAsignadoError,
    PedidoNoDisponibleError,
    VehiculoNoDisponibleError,
)
from app.business.exceptions.pedido import PedidoNotFoundError
from app.business.exceptions.vehiculo import VehiculoNotFoundError
from app.business.models.asignacion import Asignacion, EstadoAsignacion
from app.business.models.pedido import EstadoPedido
from app.business.models.vehiculo import EstadoVehiculo
from app.data.repositories.asignacion import AsignacionRepository
from app.data.repositories.pedido import PedidoRepository
from app.data.repositories.vehiculo import VehiculoRepository
from app.schemas.asignacion import AsignacionCreate

_ESTADOS_NO_ASIGNABLES = (EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO)


class AsignacionService:
    """Casos de uso del modulo de asignaciones."""

    def __init__(
        self,
        repository: AsignacionRepository,
        pedido_repository: PedidoRepository,
        vehiculo_repository: VehiculoRepository,
    ) -> None:
        self._repository = repository
        self._pedido_repository = pedido_repository
        self._vehiculo_repository = vehiculo_repository

    @staticmethod
    def _ahora() -> str:
        return datetime.now(timezone.utc).isoformat()

    def asignar_pedido(self, datos: AsignacionCreate) -> Asignacion:
        pedido_id = datos.pedido_id
        vehiculo_id = datos.vehiculo_id

        pedido = self._pedido_repository.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNotFoundError(
                f"No existe un pedido con id {pedido_id}."
            )
        if pedido.estado in _ESTADOS_NO_ASIGNABLES:
            raise PedidoNoDisponibleError(
                f"El pedido {pedido_id} esta '{pedido.estado.value}' y "
                "no puede asignarse a un vehiculo."
            )

        vehiculo = self._vehiculo_repository.get_by_id(vehiculo_id)
        if vehiculo is None:
            raise VehiculoNotFoundError(
                f"No existe un vehiculo con id {vehiculo_id}."
            )
        if vehiculo.estado != EstadoVehiculo.ACTIVO:
            raise VehiculoNoDisponibleError(
                f"El vehiculo {vehiculo_id} no esta activo."
            )

        activas = [
            a
            for a in self._repository.get_by_pedido_id(pedido_id)
            if a.estado == EstadoAsignacion.ASIGNADA
        ]
        if activas:
            raise PedidoYaAsignadoError(
                f"El pedido {pedido_id} ya tiene una asignacion activa."
            )

        if pedido.peso_kg > vehiculo.capacidad_carga_kg:
            raise CapacidadInsuficienteError(
                f"El pedido {pedido_id} pesa {pedido.peso_kg:g} kg y el "
                f"vehiculo {vehiculo_id} soporta {vehiculo.capacidad_carga_kg:g} kg."
            )

        ahora = self._ahora()
        nueva = Asignacion(
            pedido_id=pedido_id,
            vehiculo_id=vehiculo_id,
            fecha_asignacion=ahora,
            estado=EstadoAsignacion.ASIGNADA,
            created_at=ahora,
            updated_at=ahora,
        )
        return self._repository.crear(nueva)

    def obtener_asignacion(self, asignacion_id: str) -> Asignacion:
        asignacion = self._repository.get_by_id(asignacion_id)
        if asignacion is None:
            raise AsignacionNotFoundError(
                f"No existe una asignacion con id {asignacion_id}."
            )
        return asignacion

    def listar_asignaciones(self) -> list[Asignacion]:
        return sorted(
            self._repository.listar(),
            key=lambda a: a.fecha_asignacion or "",
            reverse=True,
        )

    def listar_por_pedido(self, pedido_id: str) -> list[Asignacion]:
        return sorted(
            self._repository.get_by_pedido_id(pedido_id),
            key=lambda a: a.fecha_asignacion or "",
            reverse=True,
        )

    def listar_por_vehiculo(self, vehiculo_id: str) -> list[Asignacion]:
        return sorted(
            self._repository.get_by_vehiculo_id(vehiculo_id),
            key=lambda a: a.fecha_asignacion or "",
            reverse=True,
        )

    def cancelar_asignacion(self, asignacion_id: str) -> Asignacion:
        actual = self.obtener_asignacion(asignacion_id)  # valida existencia (404)
        if actual.estado == EstadoAsignacion.CANCELADA:
            return actual  # idempotente
        return self._repository.actualizar(
            asignacion_id,
            {"estado": EstadoAsignacion.CANCELADA.value, "updated_at": self._ahora()},
        )