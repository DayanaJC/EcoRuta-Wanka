"""Pruebas unitarias del servicio de asignaciones con repositorios en memoria.

El servicio se prueba con repositorios falsos (sin Firestore) para
verificar las reglas de negocio de forma rapida y determinista.
"""

import pytest

from app.business.exceptions.asignacion import (
    AsignacionNotFoundError,
    CapacidadInsuficienteError,
    PedidoNoDisponibleError,
    PedidoYaAsignadoError,
    VehiculoNoDisponibleError,
)
from app.business.exceptions.pedido import PedidoNotFoundError
from app.business.exceptions.vehiculo import VehiculoNotFoundError
from app.business.models.asignacion import Asignacion, EstadoAsignacion
from app.business.models.pedido import (
    EstadoPedido,
    Pedido,
    PrioridadPedido,
    TipoProducto,
)
from app.business.models.vehiculo import (
    EstadoVehiculo,
    TipoVehiculo,
    Vehiculo,
)
from app.business.services.asignacion_service import AsignacionService
from app.data.repositories.asignacion import AsignacionRepository
from app.data.repositories.pedido import PedidoRepository
from app.data.repositories.vehiculo import VehiculoRepository
from app.schemas.asignacion import AsignacionCreate


class RepositorioAsignacionMemoria(AsignacionRepository):
    """Repositorio de asignaciones en memoria que implementa el contrato."""

    _CAMPOS_ENUM = {"estado": EstadoAsignacion}

    def __init__(self) -> None:
        self._asignaciones: dict[str, Asignacion] = {}
        self._contador = 0

    def get_by_id(self, asignacion_id: str) -> Asignacion | None:
        return self._asignaciones.get(asignacion_id)

    def listar(self) -> list[Asignacion]:
        return list(self._asignaciones.values())

    def get_by_pedido_id(self, pedido_id: str) -> list[Asignacion]:
        return [a for a in self._asignaciones.values() if a.pedido_id == pedido_id]

    def get_by_vehiculo_id(self, vehiculo_id: str) -> list[Asignacion]:
        return [a for a in self._asignaciones.values() if a.vehiculo_id == vehiculo_id]

    def crear(self, asignacion: Asignacion) -> Asignacion:
        self._contador += 1
        asignacion.id = f"a{self._contador}"
        self._asignaciones[asignacion.id] = asignacion
        return asignacion

    def actualizar(self, asignacion_id: str, datos: dict) -> Asignacion:
        asignacion = self._asignaciones.get(asignacion_id)
        if asignacion is None:
            raise AsignacionNotFoundError(asignacion_id)
        for clave, valor in datos.items():
            if clave in self._CAMPOS_ENUM and valor is not None:
                valor = self._CAMPOS_ENUM[clave](valor)
            setattr(asignacion, clave, valor)
        return asignacion


class RepositorioPedidoMemoria(PedidoRepository):
    """Repositorio de pedidos en memoria (solo lo que el servicio usa)."""

    def __init__(self, pedidos: list[Pedido] | None = None) -> None:
        self._pedidos = {p.id: p for p in (pedidos or [])}

    def get_by_id(self, pedido_id: str) -> Pedido | None:
        return self._pedidos.get(pedido_id)

    def listar(self) -> list[Pedido]:
        return list(self._pedidos.values())

    def crear(self, pedido: Pedido) -> Pedido:
        self._pedidos[pedido.id] = pedido
        return pedido

    def actualizar(self, pedido_id: str, datos: dict) -> Pedido:
        pedido = self._pedidos.get(pedido_id)
        if pedido is None:
            raise PedidoNotFoundError(pedido_id)
        for clave, valor in datos.items():
            setattr(pedido, clave, valor)
        return pedido


class RepositorioVehiculoMemoria(VehiculoRepository):
    """Repositorio de vehiculos en memoria (solo lo que el servicio usa)."""

    def __init__(self, vehiculos: list[Vehiculo] | None = None) -> None:
        self._vehiculos = {v.id: v for v in (vehiculos or [])}

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
        self._vehiculos[vehiculo.id] = vehiculo
        return vehiculo

    def actualizar(self, vehiculo_id: str, datos: dict) -> Vehiculo:
        vehiculo = self._vehiculos.get(vehiculo_id)
        if vehiculo is None:
            raise VehiculoNotFoundError(vehiculo_id)
        for clave, valor in datos.items():
            if clave in ("tipo", "estado") and valor is not None:
                valor = {"tipo": TipoVehiculo, "estado": EstadoVehiculo}[clave](valor)
            setattr(vehiculo, clave, valor)
        return vehiculo


PEDIDO_POR_DEFECTO = dict(
    cliente_id="CLI-0001",
    cliente_nombre="Comercial Huancayo",
    direccion="Av. Giraldez 1234, El Tambo",
    punto_referencia="Frente al mercado",
    latitud=-12.0664,
    longitud=-75.2089,
    peso_kg=25.0,
    volumen_m3=0.4,
    ventana_entrega_inicio="09:00",
    ventana_entrega_fin="12:00",
)

VEHICULO_POR_DEFECTO = dict(
    placa="ABC-123",
    tipo=TipoVehiculo.CAMIONETA,
    capacidad_carga_kg=1200.0,
    consumo_combustible_l100km=8.5,
    factor_emision_co2_kg_l=2.3,
    anio_fabricacion=2020,
)


def _pedido(**overrides) -> Pedido:
    datos = {**PEDIDO_POR_DEFECTO, "id": "ped-1", "estado": EstadoPedido.PENDIENTE}
    datos.update(overrides)
    return Pedido(
        prioridad=PrioridadPedido.ESTANDAR,
        tipo_producto=TipoProducto.NO_PERECEDERO,
        **datos,
    )


def _vehiculo(**overrides) -> Vehiculo:
    datos = {**VEHICULO_POR_DEFECTO, "id": "veh-1", "estado": EstadoVehiculo.ACTIVO}
    datos.update(overrides)
    return Vehiculo(**datos)


def _servicio(
    pedidos: list[Pedido] | None = None,
    vehiculos: list[Vehiculo] | None = None,
):
    repos = RepositorioAsignacionMemoria()
    servicio = AsignacionService(
        repos,
        RepositorioPedidoMemoria(pedidos or []),
        RepositorioVehiculoMemoria(vehiculos or []),
    )
    return servicio, repos


def _crear_datos(**overrides) -> AsignacionCreate:
    datos = {"pedido_id": "ped-1", "vehiculo_id": "veh-1"}
    datos.update(overrides)
    return AsignacionCreate.model_validate(datos)


def test_asignar_pedido_valido_persiste_asignacion():
    servicio, repos = _servicio(
        pedidos=[_pedido()], vehiculos=[_vehiculo()]
    )
    asignada = servicio.asignar_pedido(_crear_datos())

    assert asignada.id is not None
    assert asignada.estado == EstadoAsignacion.ASIGNADA
    assert asignada.pedido_id == "ped-1"
    assert asignada.vehiculo_id == "veh-1"
    assert asignada.fecha_asignacion
    assert repos.get_by_id(asignada.id) is not None


def test_asignar_pedido_inexistente_lanza_error():
    servicio, _ = _servicio(vehiculos=[_vehiculo()])
    with pytest.raises(PedidoNotFoundError):
        servicio.asignar_pedido(_crear_datos())


def test_asignar_vehiculo_inexistente_lanza_error():
    servicio, _ = _servicio(pedidos=[_pedido()])
    with pytest.raises(VehiculoNotFoundError):
        servicio.asignar_pedido(_crear_datos())


def test_pedido_cancelado_no_es_asignable():
    servicio, _ = _servicio(
        pedidos=[_pedido(estado=EstadoPedido.CANCELADO)],
        vehiculos=[_vehiculo()],
    )
    with pytest.raises(PedidoNoDisponibleError):
        servicio.asignar_pedido(_crear_datos())


def test_pedido_entregado_no_es_asignable():
    servicio, _ = _servicio(
        pedidos=[_pedido(estado=EstadoPedido.ENTREGADO)],
        vehiculos=[_vehiculo()],
    )
    with pytest.raises(PedidoNoDisponibleError):
        servicio.asignar_pedido(_crear_datos())


def test_vehiculo_inactivo_no_es_asignable():
    servicio, _ = _servicio(
        pedidos=[_pedido()],
        vehiculos=[_vehiculo(estado=EstadoVehiculo.INACTIVO)],
    )
    with pytest.raises(VehiculoNoDisponibleError):
        servicio.asignar_pedido(_crear_datos())


def test_peso_que_excede_capacidad_rechaza_asignacion():
    servicio, _ = _servicio(
        pedidos=[_pedido(peso_kg=1300.0)],
        vehiculos=[_vehiculo(capacidad_carga_kg=1200.0)],
    )
    with pytest.raises(CapacidadInsuficienteError):
        servicio.asignar_pedido(_crear_datos())


def test_peso_igual_a_capacidad_es_valido():
    servicio, _ = _servicio(
        pedidos=[_pedido(peso_kg=1200.0)],
        vehiculos=[_vehiculo(capacidad_carga_kg=1200.0)],
    )
    asignada = servicio.asignar_pedido(_crear_datos())
    assert asignada.estado == EstadoAsignacion.ASIGNADA


def test_pedido_con_asignacion_activa_no_se_duplica():
    servicio, _ = _servicio(pedidos=[_pedido()], vehiculos=[_vehiculo()])
    servicio.asignar_pedido(_crear_datos())
    with pytest.raises(PedidoYaAsignadoError):
        servicio.asignar_pedido(_crear_datos())


def test_tras_cancelar_el_pedido_se_puede_reasignar():
    servicio, _ = _servicio(pedidos=[_pedido()], vehiculos=[_vehiculo()])
    primera = servicio.asignar_pedido(_crear_datos())
    servicio.cancelar_asignacion(primera.id)

    segunda = servicio.asignar_pedido(_crear_datos())
    assert segunda.id != primera.id
    assert segunda.estado == EstadoAsignacion.ASIGNADA


def test_cancelar_asignacion_es_logica_e_idempotente():
    servicio, repos = _servicio(pedidos=[_pedido()], vehiculos=[_vehiculo()])
    asignada = servicio.asignar_pedido(_crear_datos())

    cancelada = servicio.cancelar_asignacion(asignada.id)
    assert cancelada.estado == EstadoAsignacion.CANCELADA
    assert repos.get_by_id(asignada.id) is not None  # no se elimina fisicamente

    otra_vez = servicio.cancelar_asignacion(asignada.id)
    assert otra_vez.estado == EstadoAsignacion.CANCELADA


def test_cancelar_asignacion_inexistente_lanza_error():
    servicio, _ = _servicio()
    with pytest.raises(AsignacionNotFoundError):
        servicio.cancelar_asignacion("no-existe")


def test_consultar_asignaciones_por_listado_pedido_y_vehiculo():
    servicio, _ = _servicio(
        pedidos=[_pedido(), _pedido(id="ped-2")],
        vehiculos=[_vehiculo(), _vehiculo(id="veh-2", placa="XYZ-789")],
    )
    servicio.asignar_pedido(_crear_datos())
    servicio.asignar_pedido(_crear_datos(pedido_id="ped-2", vehiculo_id="veh-2"))

    todas = servicio.listar_asignaciones()
    assert len(todas) == 2

    del_pedido_1 = servicio.listar_por_pedido("ped-1")
    assert len(del_pedido_1) == 1 and del_pedido_1[0].vehiculo_id == "veh-1"

    del_vehiculo_2 = servicio.listar_por_vehiculo("veh-2")
    assert len(del_vehiculo_2) == 1 and del_vehiculo_2[0].pedido_id == "ped-2"


def test_listar_asignaciones_ordena_por_fecha_descendente():
    servicio, repos = _servicio(
        pedidos=[_pedido(), _pedido(id="ped-x")],
        vehiculos=[_vehiculo(), _vehiculo(id="veh-y", placa="XYZ-789")],
    )
    primera = servicio.asignar_pedido(_crear_datos())
    segunda = servicio.asignar_pedido(
        _crear_datos(pedido_id="ped-x", vehiculo_id="veh-y")
    )
    # Simula que se registraron en orden (created_at creciente).
    primera.fecha_asignacion = "2026-01-01T00:00:00+00:00"
    segunda.fecha_asignacion = "2026-01-02T00:00:00+00:00"

    ordenadas = servicio.listar_asignaciones()
    assert [a.id for a in ordenadas] == [segunda.id, primera.id]