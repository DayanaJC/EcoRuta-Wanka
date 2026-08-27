"""Servicio de dominio del modulo de vehiculos (RF-01).

Orquesta las reglas de negocio apoyandose en el repositorio inyectado.
No conoce Firestore: recibe un VehiculoRepository en el constructor
(inyeccion de dependencias desde la capa de presentacion).
"""

from datetime import datetime, timezone
from typing import Optional

from app.business.exceptions.vehiculo import (
    VehiculoExistenteError,
    VehiculoNotFoundError,
)
from app.business.models.vehiculo import EstadoVehiculo, Vehiculo, normalizar_placa
from app.data.repositories.vehiculo import VehiculoRepository
from app.schemas.vehiculo import VehiculoCreate, VehiculoUpdate


class VehiculoService:
    """Casos de uso del modulo de vehiculos."""

    def __init__(self, repository: VehiculoRepository) -> None:
        self._repository = repository

    @staticmethod
    def _ahora() -> str:
        return datetime.now(timezone.utc).isoformat()

    def registrar_vehiculo(self, datos: VehiculoCreate) -> Vehiculo:
        placa = normalizar_placa(datos.placa)
        if self._repository.get_by_placa(placa) is not None:
            raise VehiculoExistenteError(
                f"Ya existe un vehiculo registrado con la placa {placa}."
            )
        ahora = self._ahora()
        nuevo = Vehiculo(
            placa=placa,
            tipo=datos.tipo,
            capacidad_carga_kg=datos.capacidad_carga_kg,
            consumo_combustible_l100km=datos.consumo_combustible_l100km,
            factor_emision_co2_kg_l=datos.factor_emision_co2_kg_l,
            anio_fabricacion=datos.anio_fabricacion,
            estado=datos.estado,
            created_at=ahora,
            updated_at=ahora,
        )
        return self._repository.crear(nuevo)

    def obtener_vehiculo(self, vehiculo_id: str) -> Vehiculo:
        vehiculo = self._repository.get_by_id(vehiculo_id)
        if vehiculo is None:
            raise VehiculoNotFoundError(
                f"No existe un vehiculo con id {vehiculo_id}."
            )
        return vehiculo

    def listar_vehiculos(
        self, estado: Optional[EstadoVehiculo] = None
    ) -> list[Vehiculo]:
        return self._repository.listar(estado=estado)

    def actualizar_vehiculo(
        self, vehiculo_id: str, datos: VehiculoUpdate
    ) -> Vehiculo:
        self.obtener_vehiculo(vehiculo_id)  # valida existencia (404)
        campos = datos.model_dump(exclude_unset=True)

        if "placa" in campos:
            if campos["placa"] is None:
                campos.pop("placa")
            else:
                placa = normalizar_placa(campos["placa"])
                duplicado = self._repository.get_by_placa(placa)
                if duplicado is not None and duplicado.id != vehiculo_id:
                    raise VehiculoExistenteError(
                        f"Ya existe un vehiculo registrado con la placa {placa}."
                    )
                campos["placa"] = placa

        if campos.get("tipo") is not None:
            campos["tipo"] = campos["tipo"].value
        if campos.get("estado") is not None:
            campos["estado"] = campos["estado"].value

        campos["updated_at"] = self._ahora()
        return self._repository.actualizar(vehiculo_id, campos)

    def cambiar_estado_vehiculo(
        self, vehiculo_id: str, estado: EstadoVehiculo
    ) -> Vehiculo:
        self.obtener_vehiculo(vehiculo_id)  # valida existencia (404)
        return self._repository.actualizar(
            vehiculo_id,
            {"estado": estado.value, "updated_at": self._ahora()},
        )

    def desactivar_vehiculo(self, vehiculo_id: str) -> Vehiculo:
        self.obtener_vehiculo(vehiculo_id)  # valida existencia (404)
        return self._repository.actualizar(
            vehiculo_id,
            {"estado": EstadoVehiculo.INACTIVO.value, "updated_at": self._ahora()},
        )