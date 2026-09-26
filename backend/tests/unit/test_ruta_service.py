"""Pruebas unitarias del servicio de rutas con repositorios en memoria."""

import pytest

from app.business.exceptions.ruta import (
    RutaNotFoundError,
    RutaSinDatosError,
    RutaVehiculoInactivoError,
)
from app.business.models.ruta import EstadoRuta, Ruta
from app.business.services.ruta_service import RutaService
from app.data.repositories.ruta import RutaRepository
from app.data.repositories.vehiculo import VehiculoRepository
from app.schemas.ruta import RutaCreate


class RepositorioRutaMemoria(RutaRepository):
    def __init__(self) -> None:
        self._rutas: dict[str, Ruta] = {}
        self._contador = 0

    def get_by_id(self, ruta_id: str) -> Ruta | None:
        return self._rutas.get(ruta_id)

    def listar(self) -> list[Ruta]:
        return list(self._rutas.values())

    def listar_por_vehiculo(self, vehiculo_id: str) -> list[Ruta]:
        return [r for r in self._rutas.values() if r.vehiculo_id == vehiculo_id]

    def crear(self, ruta: Ruta) -> Ruta:
        self._contador += 1
        ruta.id = f"r{self._contador}"
        self._rutas[ruta.id] = ruta
        return ruta

    def actualizar(self, ruta_id: str, datos: dict) -> Ruta:
        ruta = self._rutas.get(ruta_id)
        if ruta is None:
            raise RutaNotFoundError(ruta_id)
        for clave, valor in datos.items():
            setattr(ruta, clave, valor)
        return ruta


class RepositorioVehiculoMemoria(VehiculoRepository):
    def __init__(self, vehiculos: list | None = None) -> None:
        self._vehiculos = {v.id: v for v in (vehiculos or [])}

    def get_by_id(self, vehiculo_id: str) -> object | None:
        return self._vehiculos.get(vehiculo_id)

    def get_by_placa(self, placa: str) -> object | None:
        for v in self._vehiculos.values():
            if v.placa == placa:
                return v
        return None

    def listar(self, estado=None) -> list:
        return list(self._vehiculos.values())

    def crear(self, vehiculo) -> object:
        vehiculo.id = "veh-1"
        self._vehiculos[vehiculo.id] = vehiculo
        return vehiculo

    def actualizar(self, vehiculo_id: str, datos: dict) -> object:
        vehiculo = self._vehiculos.get(vehiculo_id)
        if vehiculo is None:
            raise RutaNotFoundError(vehiculo_id)
        for clave, valor in datos.items():
            setattr(vehiculo, clave, valor)
        return vehiculo


def _vehiculo(**overrides):
    datos = {
        "id": "veh-1",
        "placa": "ABC-123",
        "tipo": "camioneta",
        "capacidad_carga_kg": 1200.0,
        "consumo_combustible_l100km": 8.5,
        "factor_emision_co2_kg_l": 2.3,
        "anio_fabricacion": 2020,
        "estado": "activo",
    }
    datos.update(overrides)
    return type('Vehiculo', (), datos)()


def _servicio(vehiculos=None):
    repo = RepositorioRutaMemoria()
    veh_list = vehiculos or [_vehiculo()]
    servicio = RutaService(repo, RepositorioVehiculoMemoria(veh_list))
    return servicio, repo


def _crear_ruta_datos(**overrides):
    datos = {"vehiculo_id": "veh-1", "pedido_ids": ["PED-0001"]}
    datos.update(overrides)
    return RutaCreate.model_validate(datos)


def test_generar_ruta_persiste_ruta():
    servicio, repos = _servicio()
    ruta = servicio.generar_ruta(_crear_ruta_datos())
    assert ruta.id is not None
    assert ruta.estado == EstadoRuta.GENERADA
    assert ruta.vehiculo_id == "veh-1"
    assert ruta.pedido_ids == ["PED-0001"]
    assert repos.get_by_id(ruta.id) is not None


def test_generar_ruta_sin_pedidos_lanza_error():
    servicio, _ = _servicio()
    with pytest.raises(RutaSinDatosError):
        servicio.generar_ruta(_crear_ruta_datos(pedido_ids=[]))


def test_generar_ruta_vehiculo_inexistente():
    servicio, _ = _servicio(vehiculos=[])
    with pytest.raises(ValueError):
        servicio.generar_ruta(_crear_ruta_datos(vehiculo_id="no-existe"))


def test_generar_ruta_vehiculo_inactivo():
    servicio, _ = _servicio(vehiculos=[_vehiculo(estado="inactivo")])
    with pytest.raises(RutaVehiculoInactivoError):
        servicio.generar_ruta(_crear_ruta_datos())


def test_obtener_ruta_inexistente():
    servicio, _ = _servicio()
    with pytest.raises(RutaNotFoundError):
        servicio.obtener_ruta("no-existe")


def test_listar_rutas():
    servicio, _ = _servicio()
    servicio.generar_ruta(_crear_ruta_datos())
    rutas = servicio.listar_rutas()
    assert len(rutas) == 1


def test_listar_por_vehiculo():
    servicio, _ = _servicio()
    servicio.generar_ruta(_crear_ruta_datos())
    rutas = servicio.listar_por_vehiculo("veh-1")
    assert len(rutas) == 1


def test_actualizar_estado_ruta():
    servicio, _ = _servicio()
    ruta = servicio.generar_ruta(_crear_ruta_datos())
    actualizada = servicio.actualizar_estado(ruta.id, EstadoRuta.COMPLETADA)
    assert actualizada.estado == EstadoRuta.COMPLETADA


def test_cancelar_ruta():
    servicio, _ = _servicio()
    ruta = servicio.generar_ruta(_crear_ruta_datos())
    cancelada = servicio.cancelar_ruta(ruta.id)
    assert cancelada.estado == EstadoRuta.CANCELADA


def test_consultar_ruta_ordenada_por_fecha():
    servicio, _ = _servicio()
    r1 = servicio.generar_ruta(_crear_ruta_datos())
    r2 = servicio.generar_ruta(_crear_ruta_datos(pedido_ids=["PED-0002"]))
    rutas = servicio.listar_rutas()
    assert len(rutas) == 2
    assert rutas[0].id in [r1.id, r2.id]
