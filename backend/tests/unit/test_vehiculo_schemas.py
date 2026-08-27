"""Pruebas unitarias de los esquemas Pydantic del modulo de vehiculos."""

import pytest
from pydantic import ValidationError

from app.business.models.vehiculo import EstadoVehiculo
from app.schemas.vehiculo import VehiculoCreate, VehiculoUpdate


def _datos(**overrides):
    base = {
        "placa": "abc-123",
        "tipo": "camioneta",
        "capacidad_carga_kg": 1200.0,
        "consumo_combustible_l100km": 8.5,
        "factor_emision_co2_kg_l": 2.3,
        "anio_fabricacion": 2020,
    }
    base.update(overrides)
    return base


def test_placa_se_normaliza_a_mayusculas_y_sin_espacios():
    vehiculo = VehiculoCreate.model_validate(_datos(placa=" abc-123 "))
    assert vehiculo.placa == "ABC-123"


def test_placa_con_formato_invalido_es_rechazada():
    with pytest.raises(ValidationError):
        VehiculoCreate.model_validate(_datos(placa="AB1234"))


def test_tipo_invalido_es_rechazado():
    with pytest.raises(ValidationError):
        VehiculoCreate.model_validate(_datos(tipo="avion"))


def test_capacidad_cero_o_negativa_es_rechazada():
    with pytest.raises(ValidationError):
        VehiculoCreate.model_validate(_datos(capacidad_carga_kg=0))
    with pytest.raises(ValidationError):
        VehiculoCreate.model_validate(_datos(capacidad_carga_kg=-5))


def test_anio_fabricacion_anterior_a_1980_es_rechazado():
    with pytest.raises(ValidationError):
        VehiculoCreate.model_validate(_datos(anio_fabricacion=1970))


def test_vehiculo_update_permite_actualizacion_parcial():
    actualizacion = VehiculoUpdate.model_validate({"estado": "inactivo"})
    assert actualizacion.placa is None
    assert actualizacion.estado == EstadoVehiculo.INACTIVO