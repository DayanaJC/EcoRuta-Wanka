"""Pruebas unitarias de los esquemas de rutas (RF-04).

Verifican la forma de los datos de entrada/salida sin tocar Firestore.
"""

import pytest
from pydantic import ValidationError

from app.business.models.ruta import ParadaPlanificada, RutaPlanificada
from app.schemas.ruta import RutaRequest, RutaResponse


def test_request_minimo_solo_vehiculo():
    datos = RutaRequest(vehiculo_id="veh-1")
    assert datos.vehiculo_id == "veh-1"
    assert datos.latitud_inicio is None
    assert datos.hora_inicio is None
    assert datos.velocidad_media_kmh is None


def test_request_con_parametros_opcionales():
    datos = RutaRequest(
        vehiculo_id="veh-1",
        latitud_inicio=-12.0,
        longitud_inicio=-75.2,
        hora_inicio="07:30",
        velocidad_media_kmh=25.0,
        tiempo_servicio_min=15,
    )
    assert datos.hora_inicio == "07:30"
    assert datos.latitud_inicio == -12.0
    assert datos.longitud_inicio == -75.2


def test_id_con_espacios_se_recorta():
    datos = RutaRequest(vehiculo_id="  veh-1  ")
    assert datos.vehiculo_id == "veh-1"


def test_vehiculo_id_vacio_lanza_error():
    with pytest.raises(ValidationError):
        RutaRequest(vehiculo_id="   ")


def test_coordenadas_incompletas_lanzan_error():
    with pytest.raises(ValidationError):
        RutaRequest(vehiculo_id="veh-1", latitud_inicio=-12.0)


def test_hora_inicio_invalida_lanza_error():
    with pytest.raises(ValidationError):
        RutaRequest(vehiculo_id="veh-1", hora_inicio="25:00")


def test_latitud_fuera_de_rango_lanza_error():
    with pytest.raises(ValidationError):
        RutaRequest(vehiculo_id="veh-1", latitud_inicio=95.0, longitud_inicio=-75.0)


def test_velocidad_no_positiva_lanza_error():
    with pytest.raises(ValidationError):
        RutaRequest(vehiculo_id="veh-1", velocidad_media_kmh=2.0)


def test_response_se_construye_desde_el_dominio():
    parada = ParadaPlanificada(
        orden=1,
        pedido_id="ped-1",
        cliente_nombre="Comercial Huancayo",
        direccion="Av. Giraldez 1234, El Tambo",
        latitud=-12.0664,
        longitud=-75.2089,
        peso_kg=25.0,
        ventana_entrega_inicio="09:00",
        ventana_entrega_fin="12:00",
        hora_estimada_llegada="08:12",
        cumple_ventana=True,
        distancia_desde_origen_km=1.2,
    )
    ruta = RutaPlanificada(
        vehiculo_id="veh-1",
        vehiculo_placa="ABC-123",
        punto_partida_latitud=-12.0664,
        punto_partida_longitud=-75.2089,
        hora_inicio="08:00",
        velocidad_media_kmh=30.0,
        tiempo_servicio_min=10,
        paradas=[parada],
        paradas_excluidas=[],
        distancia_total_km=3.4,
        tiempo_estimado_min=26.8,
        cantidad_paradas=1,
        combustible_estimado_l=0.29,
        emisiones_co2_kg=0.67,
        peso_total_kg=25.0,
        cumplimiento_ventanas=True,
    )
    respuesta = RutaResponse.model_validate(ruta)
    assert respuesta.vehiculo_id == "veh-1"
    assert respuesta.vehiculo_placa == "ABC-123"
    assert respuesta.cantidad_paradas == 1
    assert respuesta.distancia_total_km == 3.4
    assert respuesta.paradas[0].orden == 1
    assert respuesta.paradas[0].pedido_id == "ped-1"
    assert respuesta.paradas[0].cumple_ventana is True