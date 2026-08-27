"""Pruebas unitarias del servicio de vehiculos con repositorio en memoria.

El servicio se prueba con UN repositorio falso (sin Firestore) para
verificar las reglas de negocio de forma rapida y determinista.
"""

import pytest

from app.business.exceptions.vehiculo import (
    VehiculoExistenteError,
    VehiculoNotFoundError,
)
from app.business.models.vehiculo import (
    EstadoVehiculo,
    TipoVehiculo,
    Vehiculo,
)
from app.business.services.vehiculo_service import VehiculoService
from app.data.repositories.vehiculo import VehiculoRepository
from app.schemas.vehiculo import VehiculoCreate, VehiculoUpdate


class RepositorioMemoria(VehiculoRepository):
    """Repositorio en memoria que implementa el mismo contrato."""

    _CAMPOS_ENUM = {
        "tipo": TipoVehiculo,
        "estado": EstadoVehiculo,
    }

    def __init__(self) -> None:
        self._vehiculos: dict[str, Vehiculo] = {}
        self._contador = 0

    def get_by_id(self, vehiculo_id: str) -> Vehiculo | None:
        return self._vehiculos.get(vehiculo_id)

    def get_by_placa(self, placa: str) -> Vehiculo | None:
        for vehiculo in self._vehiculos.values():
            if vehiculo.placa == placa:
                return vehiculo
        return None

    def listar(self, estado: EstadoVehiculo | None = None) -> list[Vehiculo]:
        if estado is None:
            return list(self._vehiculos.values())
        return [v for v in self._vehiculos.values() if v.estado == estado]

    def crear(self, vehiculo: Vehiculo) -> Vehiculo:
        self._contador += 1
        vehiculo.id = f"v{self._contador}"
        self._vehiculos[vehiculo.id] = vehiculo
        return vehiculo

    def actualizar(self, vehiculo_id: str, datos: dict) -> Vehiculo:
        vehiculo = self._vehiculos.get(vehiculo_id)
        if vehiculo is None:
            raise VehiculoNotFoundError(vehiculo_id)
        for clave, valor in datos.items():
            if clave in self._CAMPOS_ENUM and valor is not None:
                valor = self._CAMPOS_ENUM[clave](valor)
            setattr(vehiculo, clave, valor)
        return vehiculo


def _crear_datos(**overrides) -> VehiculoCreate:
    datos = {
        "placa": "abc-123",
        "tipo": "camioneta",
        "capacidad_carga_kg": 1200.0,
        "consumo_combustible_l100km": 8.5,
        "factor_emision_co2_kg_l": 2.3,
        "anio_fabricacion": 2020,
    }
    datos.update(overrides)
    return VehiculoCreate.model_validate(datos)


def _servicio_con_un_vehiculo():
    repo = RepositorioMemoria()
    servicio = VehiculoService(repo)
    vehiculo = servicio.registrar_vehiculo(_crear_datos())
    return servicio, repo, vehiculo


def test_registrar_vehiculo_asigna_id_y_normaliza_placa():
    servicio = VehiculoService(RepositorioMemoria())
    creado = servicio.registrar_vehiculo(_crear_datos())
    assert creado.id is not None
    assert creado.placa == "ABC-123"
    assert creado.estado == EstadoVehiculo.ACTIVO


def test_registrar_placa_duplicada_lanza_error():
    servicio = VehiculoService(RepositorioMemoria())
    servicio.registrar_vehiculo(_crear_datos(placa="ABC-123"))
    with pytest.raises(VehiculoExistenteError):
        servicio.registrar_vehiculo(_crear_datos(placa=" abc-123 "))


def test_obtener_vehiculo_inexistente_lanza_not_found():
    servicio = VehiculoService(RepositorioMemoria())
    with pytest.raises(VehiculoNotFoundError):
        servicio.obtener_vehiculo("no-existe")


def test_listar_filtra_por_estado():
    servicio, _, _ = _servicio_con_un_vehiculo()
    servicio.registrar_vehiculo(
        _crear_datos(placa="XYZ-789", estado="inactivo")
    )
    activos = servicio.listar_vehiculos(estado=EstadoVehiculo.ACTIVO)
    inactivos = servicio.listar_vehiculos(estado=EstadoVehiculo.INACTIVO)
    assert len(activos) == 1 and activos[0].placa == "ABC-123"
    assert len(inactivos) == 1 and inactivos[0].placa == "XYZ-789"


def test_actualizar_campos_parciales_sin_tocar_el_resto():
    servicio, _, vehiculo = _servicio_con_un_vehiculo()
    resultado = servicio.actualizar_vehiculo(
        vehiculo.id, VehiculoUpdate.model_validate({"capacidad_carga_kg": 1500.0})
    )
    assert resultado.capacidad_carga_kg == 1500.0
    assert resultado.placa == "ABC-123"
    assert resultado.anio_fabricacion == 2020


def test_actualizar_vehiculo_inexistente_lanza_not_found():
    servicio = VehiculoService(RepositorioMemoria())
    with pytest.raises(VehiculoNotFoundError):
        servicio.actualizar_vehiculo(
            "no-existe", VehiculoUpdate.model_validate({"estado": "inactivo"})
        )


def test_actualizar_placa_duplicada_lanza_error():
    servicio, _, primero = _servicio_con_un_vehiculo()
    segundo = servicio.registrar_vehiculo(_crear_datos(placa="XYZ-789"))
    with pytest.raises(VehiculoExistenteError):
        servicio.actualizar_vehiculo(
            segundo.id, VehiculoUpdate.model_validate({"placa": "ABC-123"})
        )


def test_cambiar_estado_y_desactivar():
    servicio, _, vehiculo = _servicio_con_un_vehiculo()
    activo = servicio.cambiar_estado_vehiculo(
        vehiculo.id, EstadoVehiculo.INACTIVO
    )
    assert activo.estado == EstadoVehiculo.INACTIVO
    inactivo = servicio.desactivar_vehiculo(vehiculo.id)
    assert inactivo.estado == EstadoVehiculo.INACTIVO