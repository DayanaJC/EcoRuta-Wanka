"""Pruebas unitarias de los esquemas de asignaciones (RF-03).

Verifican la forma de los datos de entrada/salida sin tocar Firestore.
"""

import pytest
from pydantic import ValidationError

from app.business.models.asignacion import Asignacion, EstadoAsignacion
from app.schemas.asignacion import AsignacionCreate, AsignacionResponse


def test_asignacion_create_valido():
    datos = AsignacionCreate(pedido_id="ped-1", vehiculo_id="veh-1")
    assert datos.pedido_id == "ped-1"
    assert datos.vehiculo_id == "veh-1"


def test_ids_con_espacios_se_recortan():
    datos = AsignacionCreate(pedido_id="  ped-1  ", vehiculo_id=" veh-1 ")
    assert datos.pedido_id == "ped-1"
    assert datos.vehiculo_id == "veh-1"


def test_pedido_id_vacio_lanza_error():
    with pytest.raises(ValidationError):
        AsignacionCreate(pedido_id="   ", vehiculo_id="veh-1")


def test_falta_vehiculo_id_lanza_error():
    with pytest.raises(ValidationError):
        AsignacionCreate(pedido_id="ped-1")


def test_response_se_construye_desde_el_dominio():
    asignacion = Asignacion(
        id="a1",
        pedido_id="ped-1",
        vehiculo_id="veh-1",
        fecha_asignacion="2026-01-01T00:00:00+00:00",
        estado=EstadoAsignacion.ASIGNADA,
    )
    respuesta = AsignacionResponse.model_validate(asignacion)
    assert respuesta.id == "a1"
    assert respuesta.pedido_id == "ped-1"
    assert respuesta.vehiculo_id == "veh-1"
    assert respuesta.estado == EstadoAsignacion.ASIGNADA
    assert respuesta.fecha_asignacion == "2026-01-01T00:00:00+00:00"