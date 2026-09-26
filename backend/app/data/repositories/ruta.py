"""Contrato (interfaz) del repositorio de rutas.

La capa de negocio depende de ESTA abstraccion y no de Firestore.
"""

from abc import ABC, abstractmethod
from typing import Optional

from app.business.models.ruta import EstadoRuta, Ruta


class RutaRepository(ABC):
    """Operaciones de persistencia que el servicio de rutas necesita."""

    @abstractmethod
    def get_by_id(self, ruta_id: str) -> Optional[Ruta]:
        """Devuelve una ruta por id, o None si no existe."""

    @abstractmethod
    def listar(self) -> list[Ruta]:
        """Devuelve todas las rutas."""

    @abstractmethod
    def listar_por_vehiculo(self, vehiculo_id: str) -> list[Ruta]:
        """Devuelve las rutas de un vehiculo dado."""

    @abstractmethod
    def crear(self, ruta: Ruta) -> Ruta:
        """Persiste una ruta nueva y la devuelve con su id asignado."""

    @abstractmethod
    def actualizar(self, ruta_id: str, datos: dict) -> Ruta:
        """Actualiza los campos indicados y devuelve la ruta resultante."""
