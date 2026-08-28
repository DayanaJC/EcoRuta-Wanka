"""Pruebas unitarias del servicio de rutas con repositorios en memoria.

Se prueba el algoritmo de optimizacion (orden de paradas, metricas y
casos borde) sin depender de Firestore: se inyectan repositorios falsos.
"""

import pytest

from app.business.exceptions.asignacion import VehiculoNoDisponibleError
from app.business.exceptions.ruta import SinPedidosAsignadosError
from app.business.exceptions.vehiculo import VehiculoNotFoundError
from app.business.models.asignacion import Asignacion, EstadoAsignacion
from app.business.models.pedido import (
    EstadoPedido,
    Pedido,
    PrioridadPedido,
    TipoProducto,
)
from app.business.models.ruta import (
    MOTIVO_ESTADO_NO_ENTREGABLE,
    MOTIVO_PEDIDO_NO_ENCONTRADO,
    MOTIVO_SIN_COORDENADAS,
)
from app.business.models.vehiculo import EstadoVehiculo, TipoVehiculo, Vehiculo
from app.business.services.ruta_service import (
    RutaService,
    distancia_haversine_km,
)
from app.data.repositories.asignacion import AsignacionRepository
from app.data.repositories.pedido import PedidoRepository
from app.data.repositories.vehiculo import VehiculoRepository
from app.schemas.ruta import RutaRequest


class RepositorioAsignacionMemoria(AsignacionRepository):
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
        asignacion = self._asignaciones[asignacion_id]
        for clave, valor in datos.items():
            setattr(asignacion, clave, valor)
        return asignacion


class RepositorioPedidoMemoria(PedidoRepository):
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
        pedido = self._pedidos[pedido_id]
        for clave, valor in datos.items():
            setattr(pedido, clave, valor)
        return pedido


class RepositorioVehiculoMemoria(VehiculoRepository):
    def __init__(self, vehiculos: list[Vehiculo] | None = None) -> None:
        self._vehiculos = {v.id: v for v in (vehiculos or [])}

    def get_by_id(self, vehiculo_id: str) -> Vehiculo | None:
        return self._vehiculos.get(vehiculo_id)

    def get_by_placa(self, placa: str) -> Vehiculo | None:
        return next((v for v in self._vehiculos.values() if v.placa == placa), None)

    def listar(self, estado: EstadoVehiculo | None = None) -> list[Vehiculo]:
        if estado is None:
            return list(self._vehiculos.values())
        return [v for v in self._vehiculos.values() if v.estado == estado]

    def crear(self, vehiculo: Vehiculo) -> Vehiculo:
        self._vehiculos[vehiculo.id] = vehiculo
        return vehiculo

    def actualizar(self, vehiculo_id: str, datos: dict) -> Vehiculo:
        vehiculo = self._vehiculos[vehiculo_id]
        for clave, valor in datos.items():
            setattr(vehiculo, clave, valor)
        return vehiculo


VEHICULO_BASE = dict(
    placa="ABC-123",
    tipo=TipoVehiculo.CAMIONETA,
    capacidad_carga_kg=1200.0,
    consumo_combustible_l100km=8.5,
    factor_emision_co2_kg_l=2.3,
    anio_fabricacion=2020,
)


def _vehiculo(**overrides) -> Vehiculo:
    datos = {**VEHICULO_BASE, "id": "veh-1", "estado": EstadoVehiculo.ACTIVO}
    datos.update(overrides)
    return Vehiculo(**datos)


def _pedido(pedido_id: str, lat: float, lon: float, **overrides) -> Pedido:
    """Pedido con coordenadas en la escala de Huancayo (grados)."""
    datos = dict(
        cliente_id="CLI-0001",
        cliente_nombre=f"Cliente {pedido_id}",
        direccion=f"Av. Giraldez {pedido_id}",
        punto_referencia="",
        latitud=lat,
        longitud=lon,
        peso_kg=25.0,
        volumen_m3=0.4,
        ventana_entrega_inicio="09:00",
        ventana_entrega_fin="17:00",
        estado=EstadoPedido.PENDIENTE,
    )
    datos.update(overrides)
    return Pedido(
        id=pedido_id,
        prioridad=PrioridadPedido.ESTANDAR,
        tipo_producto=TipoProducto.NO_PERECEDERO,
        **datos,
    )


def _asignacion(pedido_id: str, vehiculo_id: str = "veh-1") -> Asignacion:
    return Asignacion(
        pedido_id=pedido_id,
        vehiculo_id=vehiculo_id,
        fecha_asignacion="2026-01-01T00:00:00+00:00",
        estado=EstadoAsignacion.ASIGNADA,
    )


def _servicio(pedidos=None, vehiculos=None, asignaciones=None):
    repos_asignacion = RepositorioAsignacionMemoria()
    for a in asignaciones or []:
        repos_asignacion.crear(a)
    return RutaService(
        repos_asignacion,
        RepositorioPedidoMemoria(pedidos or []),
        RepositorioVehiculoMemoria(vehiculos or []),
    )


def _request(**overrides) -> RutaRequest:
    datos = {"vehiculo_id": "veh-1"}
    datos.update(overrides)
    return RutaRequest.model_validate(datos)


def test_distancia_haversine_referencia_conocida():
    cos = distancia_haversine_km(-12.0464, -77.0428, -12.0664, -75.2089)
    assert 199.0 <= cos <= 201.0


def test_vehiculo_inexistente_lanza_error():
    servicio = _servicio()
    with pytest.raises(VehiculoNotFoundError):
        servicio.generar_ruta(_request())


def test_vehiculo_inactivo_lanza_error():
    servicio = _servicio(vehiculos=[_vehiculo(estado=EstadoVehiculo.INACTIVO)])
    with pytest.raises(VehiculoNoDisponibleError):
        servicio.generar_ruta(_request())


def test_sin_pedidos_asignados_lanza_error():
    servicio = _servicio(vehiculos=[_vehiculo()])
    with pytest.raises(SinPedidosAsignadosError):
        servicio.generar_ruta(_request())


def test_un_unico_pedido_produce_una_parada():
    pedido = _pedido("ped-1", -12.0670, -75.2090)
    servicio = _servicio(
        pedidos=[pedido],
        vehiculos=[_vehiculo()],
        asignaciones=[_asignacion("ped-1")],
    )
    ruta = servicio.generar_ruta(_request())

    assert ruta.cantidad_paradas == 1
    assert len(ruta.paradas) == 1
    assert ruta.paradas[0].pedido_id == "ped-1"
    assert ruta.paradas[0].orden == 1
    assert ruta.paradas_excluidas == []
    assert ruta.peso_total_kg == 25.0
    assert ruta.cumplimiento_ventanas is True

    esperada = round(
        2 * distancia_haversine_km(-12.0664, -75.2089, -12.0670, -75.2090), 2
    )
    assert ruta.distancia_total_km == pytest.approx(esperada)


def test_metricas_combustible_y_co2_usan_el_vehiculo():
    vehiculo = _vehiculo(consumo_combustible_l100km=12.0, factor_emision_co2_kg_l=3.0)
    servicio = _servicio(
        pedidos=[_pedido("ped-1", -12.0670, -75.2090)],
        vehiculos=[vehiculo],
        asignaciones=[_asignacion("ped-1")],
    )
    ruta = servicio.generar_ruta(_request())

    esperada = round(
        2 * distancia_haversine_km(-12.0664, -75.2089, -12.0670, -75.2090), 2
    )
    assert ruta.combustible_estimado_l == pytest.approx(
        round(esperada * 12.0 / 100, 2)
    )
    assert ruta.emisiones_co2_kg == pytest.approx(
        round(esperada * 12.0 / 100 * 3.0, 2)
    )


def test_orden_optimizado_visita_mas_cercano_primero():
    # El deposito esta en (0,0); A es el mas cercano y B/C los lejanos.
    servicio = _servicio(
        pedidos=[
            _pedido("ped-A", 0.001, 0.0),
            _pedido("ped-B", 0.02, 0.0),
            _pedido("ped-C", 0.0012, 0.001),
        ],
        vehiculos=[_vehiculo()],
        asignaciones=[
            _asignacion("ped-A"),
            _asignacion("ped-B"),
            _asignacion("ped-C"),
        ],
    )
    ruta = servicio.generar_ruta(_request(latitud_inicio=0.0, longitud_inicio=0.0))

    # A,B,C (o su espejo C,B,A) es el recorrido cerrado de longitud minima.
    assert [p.pedido_id for p in ruta.paradas] == ["ped-A", "ped-B", "ped-C"]
    assert ruta.paradas[0].orden == 1
    # El recorrido optimizado es mas corto que salir hacia el lejano primero.
    lejano_primero = (
        distancia_haversine_km(0, 0, 0.02, 0)
        + distancia_haversine_km(0.02, 0, 0.001, 0)
        + distancia_haversine_km(0.001, 0, 0.0012, 0.001)
        + distancia_haversine_km(0.0012, 0.001, 0, 0)
    )
    assert ruta.distancia_total_km < round(lejano_primero, 2)


def test_ventanas_reordenan_para_cumplir_la_entrega():
    # C esta mas lejos que A pero su ventana vence a las 08:05: debe irse primero.
    servicio = _servicio(
        pedidos=[
            _pedido("ped-A", 0.002, 0.0, ventana_entrega_inicio="10:00", ventana_entrega_fin="12:00"),
            _pedido("ped-C", 0.01, 0.0, ventana_entrega_inicio="08:03", ventana_entrega_fin="08:05"),
        ],
        vehiculos=[_vehiculo()],
        asignaciones=[_asignacion("ped-A"), _asignacion("ped-C")],
    )
    ruta = servicio.generar_ruta(
        _request(latitud_inicio=0.0, longitud_inicio=0.0, hora_inicio="08:00")
    )

    assert [p.pedido_id for p in ruta.paradas] == ["ped-C", "ped-A"]
    assert ruta.cumplimiento_ventanas is True
    assert ruta.paradas[0].cumple_ventana is True


def test_ventana_vencida_se_reporta_como_incumplida():
    # Unica parada a las 08:30 con ventana que ya vencio a las 08:00.
    servicio = _servicio(
        pedidos=[_pedido("ped-1", 0.01, 0.0, ventana_entrega_inicio="07:00", ventana_entrega_fin="08:00")],
        vehiculos=[_vehiculo()],
        asignaciones=[_asignacion("ped-1")],
    )
    ruta = servicio.generar_ruta(
        _request(latitud_inicio=0.0, longitud_inicio=0.0, hora_inicio="08:00")
    )

    assert ruta.cantidad_paradas == 1
    assert ruta.paradas[0].cumple_ventana is False
    assert ruta.cumplimiento_ventanas is False


def test_pedidos_sin_coordenadas_se_excluyen():
    servicio = _servicio(
        pedidos=[
            _pedido("ped-1", -12.0670, -75.2090),
            Pedido(
                id="ped-sin1",
                cliente_id="CLI-X",
                cliente_nombre="Sin coords None",
                direccion="Direccion X",
                punto_referencia="",
                latitud=None,
                longitud=None,
                peso_kg=10.0,
                volumen_m3=0.1,
                ventana_entrega_inicio="09:00",
                ventana_entrega_fin="12:00",
                prioridad=PrioridadPedido.ESTANDAR,
                tipo_producto=TipoProducto.NO_PERECEDERO,
            ),
            _pedido("ped-sin2", 0.0, 0.0),
        ],
        vehiculos=[_vehiculo()],
        asignaciones=[
            _asignacion("ped-1"),
            _asignacion("ped-sin1"),
            _asignacion("ped-sin2"),
        ],
    )
    ruta = servicio.generar_ruta(_request())

    assert ruta.cantidad_paradas == 1
    assert ruta.paradas[0].pedido_id == "ped-1"
    excluidos = {e.pedido_id: e.motivo for e in ruta.paradas_excluidas}
    assert excluidos["ped-sin1"] == MOTIVO_SIN_COORDENADAS
    assert excluidos["ped-sin2"] == MOTIVO_SIN_COORDENADAS


def test_pedido_no_encontrado_se_excluye():
    servicio = _servicio(
        pedidos=[_pedido("ped-1", -12.0670, -75.2090)],
        vehiculos=[_vehiculo()],
        asignaciones=[_asignacion("ped-1"), _asignacion("ped-fantasma")],
    )
    ruta = servicio.generar_ruta(_request())

    assert ruta.cantidad_paradas == 1
    assert any(
        e.pedido_id == "ped-fantasma"
        and e.motivo == MOTIVO_PEDIDO_NO_ENCONTRADO
        for e in ruta.paradas_excluidas
    )


def test_pedido_entregado_se_excluye():
    entregado = _pedido("ped-1", -12.0670, -75.2090, estado=EstadoPedido.ENTREGADO)
    servicio = _servicio(
        pedidos=[entregado],
        vehiculos=[_vehiculo()],
        asignaciones=[_asignacion("ped-1")],
    )
    ruta = servicio.generar_ruta(_request())

    assert ruta.cantidad_paradas == 0
    assert any(
        e.pedido_id == "ped-1" and e.motivo == MOTIVO_ESTADO_NO_ENTREGABLE
        for e in ruta.paradas_excluidas
    )


def test_todos_sin_coordenadas_devuelve_ruta_vacia():
    servicio = _servicio(
        pedidos=[_pedido("ped-1", 0.0, 0.0)],
        vehiculos=[_vehiculo()],
        asignaciones=[_asignacion("ped-1")],
    )
    ruta = servicio.generar_ruta(_request())

    assert ruta.cantidad_paradas == 0
    assert ruta.paradas == []
    assert ruta.distancia_total_km == 0.0
    assert len(ruta.paradas_excluidas) == 1


def test_punto_de_partida_personalizado():
    servicio = _servicio(
        pedidos=[_pedido("ped-1", -12.0670, -75.2090)],
        vehiculos=[_vehiculo()],
        asignaciones=[_asignacion("ped-1")],
    )
    ruta = servicio.generar_ruta(
        _request(latitud_inicio=-12.1, longitud_inicio=-75.3)
    )

    assert ruta.punto_partida_latitud == -12.1
    assert ruta.punto_partida_longitud == -75.3


def test_parametros_personalizados_afectan_el_tiempo():
    servicio = _servicio(
        pedidos=[_pedido("ped-1", -12.0670, -75.2090)],
        vehiculos=[_vehiculo()],
        asignaciones=[_asignacion("ped-1")],
    )
    ruta = servicio.generar_ruta(
        _request(hora_inicio="07:00", velocidad_media_kmh=20.0, tiempo_servicio_min=5)
    )

    assert ruta.hora_inicio == "07:00"
    assert ruta.velocidad_media_kmh == 20.0
    assert ruta.tiempo_servicio_min == 5
    # tiempo = viaje (dist/vel*60) + servicio (tolerancia por redondeo a 1 decimal)
    viaje = ruta.distancia_total_km / 20.0 * 60.0
    assert ruta.tiempo_estimado_min == pytest.approx(viaje + 5.0, abs=0.06)


def test_peso_total_suma_las_paradas_incluidas():
    servicio = _servicio(
        pedidos=[
            _pedido("ped-A", 0.001, 0.0, peso_kg=30.0),
            _pedido("ped-B", 0.002, 0.0, peso_kg=45.5),
        ],
        vehiculos=[_vehiculo()],
        asignaciones=[_asignacion("ped-A"), _asignacion("ped-B")],
    )
    ruta = servicio.generar_ruta(_request(latitud_inicio=0.0, longitud_inicio=0.0))

    assert ruta.peso_total_kg == pytest.approx(75.5)