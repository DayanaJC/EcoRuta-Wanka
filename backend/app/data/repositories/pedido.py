"""Contrato (interfaz) del repositorio de pedidos.

La capa de negocio depende de ESTA abstraccion y no de Firestore. De ese
modo las pruebas unitarias pueden inyectar un repositorio de memoria y la
implementacion real (Firestore) solo se usa en la capa de datos.
"""

from abc import ABC, abstractmethod

from app.business.models.pedido import Pedido


class PedidoRepository(ABC):
    """Operaciones de persistencia que el servicio de negocio necesita."""

    @abstractmethod
    def get_by_id(self, pedido_id: str) -> Pedido | None:
        """Devuelve un pedido por id, o None si no existe."""

    @abstractmethod
    def listar(self) -> list[Pedido]:
        """Devuelve todos los pedidos (los filtros se aplican en negocio)."""

    @abstractmethod
    def crear(self, pedido: Pedido) -> Pedido:
        """Persiste un pedido nuevo y lo devuelve con su id asignado."""

    @abstractmethod
    def actualizar(self, pedido_id: str, datos: dict) -> Pedido:
        """Actualiza los campos indicados y devuelve el pedido resultante."""