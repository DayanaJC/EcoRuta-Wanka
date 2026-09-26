"""Servicio de dominio del modulo de rutas (US-003).

Orquesta la generacion de rutas optimizadas utilizando los datos
de vehiculos y pedidos. No conoce Firestore: recibe repositorios
inyectados desde la capa de presentacion.
"""

from datetime import datetime, timezone

from app.business.exceptions.ruta import (
    RutaNotFoundError,
    RutaSinDatosError,
    RutaVehiculoInactivoError,
)
from app.business.models.ruta import EstadoRuta, Ruta
from app.data.repositories.ruta import RutaRepository
from app.data.repositories.vehiculo import VehiculoRepository
from app.schemas.ruta import RutaCreate


class RutaService:
    """Casos de uso del modulo de rutas."""

    def __init__(
        self,
        repository: RutaRepository,
        vehiculo_repository: VehiculoRepository,
    ) -> None:
        self._repository = repository
        self._vehiculo_repository = vehiculo_repository

    @staticmethod
    def _ahora() -> str:
        return datetime.now(timezone.utc).isoformat()

    def generar_ruta(self, datos: RutaCreate) -> Ruta:
        vehiculo = self._vehiculo_repository.get_by_id(datos.vehiculo_id)
        if vehiculo is None:
            raise ValueError(
                f"No existe un vehiculo con id {datos.vehiculo_id}."
            )
        if vehiculo.estado != "activo":
            raise RutaVehiculoInactivoError(
                f"El vehiculo {datos.vehiculo_id} no esta activo."
            )

        if not datos.pedido_ids:
            raise RutaSinDatosError(
                "No se proporcionaron pedidos para generar la ruta."
            )

        ahora = self._ahora()
        nueva = Ruta(
            vehiculo_id=datos.vehiculo_id,
            pedido_ids=datos.pedido_ids,
            estado=EstadoRuta.GENERADA,
            created_at=ahora,
            updated_at=ahora,
        )
        return self._repository.crear(nueva)

    def obtener_ruta(self, ruta_id: str) -> Ruta:
        ruta = self._repository.get_by_id(ruta_id)
        if ruta is None:
            raise RutaNotFoundError(
                f"No existe una ruta con id {ruta_id}."
            )
        return ruta

    def listar_rutas(self) -> list[Ruta]:
        return sorted(
            self._repository.listar(),
            key=lambda r: r.created_at or "",
            reverse=True,
        )

    def listar_por_vehiculo(self, vehiculo_id: str) -> list[Ruta]:
        return sorted(
            self._repository.listar_por_vehiculo(vehiculo_id),
            key=lambda r: r.created_at or "",
            reverse=True,
        )

    def actualizar_estado(self, ruta_id: str, estado: EstadoRuta) -> Ruta:
        ruta = self.obtener_ruta(ruta_id)
        return self._repository.actualizar(
            ruta_id, {"estado": estado.value, "updated_at": self._ahora()}
        )

    def cancelar_ruta(self, ruta_id: str) -> Ruta:
        return self.actualizar_estado(ruta_id, EstadoRuta.CANCELADA)
