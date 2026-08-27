"""Contrato (interfaz) del repositorio de asignaciones.

La capa de negocio depende de ESTA abstraccion y no de Firestore. De ese
modo las pruebas unitarias pueden inyectar un repositorio de memoria y la
implementacion real (Firestore) solo se usa en la capa de datos.
"""

from abc import ABC, abstractmethod

from app.business.models.asignacion import Asignacion


class AsignacionRepository(ABC):
    """Operaciones de persistencia que el servicio de negocio necesita."""

    @abstractmethod
    def get_by_id(self, asignacion_id: str) -> Asignacion | None:
        """Devuelve una asignacion por id, o None si no existe."""

    @abstractmethod
    def listar(self) -> list[Asignacion]:
        """Devuelve todas las asignaciones (los filtros se aplican en negocio)."""

    @abstractmethod
    def get_by_pedido_id(self, pedido_id: str) -> list[Asignacion]:
        """Devuelve las asignaciones de un pedido dado."""

    @abstractmethod
    def get_by_vehiculo_id(self, vehiculo_id: str) -> list[Asignacion]:
        """Devuelve las asignaciones de un vehiculo dado."""

    @abstractmethod
    def crear(self, asignacion: Asignacion) -> Asignacion:
        """Persiste una asignacion nueva y la devuelve con su id asignado."""

    @abstractmethod
    def actualizar(self, asignacion_id: str, datos: dict) -> Asignacion:
        """Actualiza los campos indicados y devuelve la asignacion resultante."""