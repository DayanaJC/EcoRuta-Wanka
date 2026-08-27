"""Contrato (interfaz) del repositorio de vehiculos.

La capa de negocio depende de ESTA abstraccion y no de Firestore. De ese
modo las pruebas unitarias pueden inyectar un repositorio de memoria y la
implementacion real (Firestore) solo se usa en la capa de datos.
"""

from abc import ABC, abstractmethod
from typing import Optional

from app.business.models.vehiculo import EstadoVehiculo, Vehiculo


class VehiculoRepository(ABC):
    """Operaciones de persistencia que el servicio de negocio necesita."""

    @abstractmethod
    def get_by_id(self, vehiculo_id: str) -> Optional[Vehiculo]:
        """Devuelve un vehiculo por id, o None si no existe."""

    @abstractmethod
    def get_by_placa(self, placa: str) -> Optional[Vehiculo]:
        """Devuelve un vehiculo por placa (ya normalizada), o None."""

    @abstractmethod
    def listar(self, estado: Optional[EstadoVehiculo] = None) -> list[Vehiculo]:
        """Lista vehiculos, opcionalmente filtrados por estado."""

    @abstractmethod
    def crear(self, vehiculo: Vehiculo) -> Vehiculo:
        """Persiste un vehiculo nuevo y lo devuelve con su id asignado."""

    @abstractmethod
    def actualizar(self, vehiculo_id: str, datos: dict) -> Vehiculo:
        """Actualiza los campos indicados y devuelve el vehiculo resultante."""