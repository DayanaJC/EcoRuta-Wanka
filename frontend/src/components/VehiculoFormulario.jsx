import { useState } from 'react'
import { ETIQUETAS_TIPO_VEHICULO } from '../utils/formatos.js'

const FORM_VACIO = {
  placa: '',
  tipo: 'camioneta',
  capacidad_carga_kg: '',
  consumo_combustible_l100km: '',
  factor_emision_co2_kg_l: '',
  anio_fabricacion: '',
}

export function VehiculoFormulario({ vehiculoInicial, onGuardar, onVolver, guardando }) {
  const [form, setForm] = useState(() => {
    if (!vehiculoInicial) return FORM_VACIO
    return {
      placa: vehiculoInicial.placa || '',
      tipo: vehiculoInicial.tipo || 'camioneta',
      capacidad_carga_kg: vehiculoInicial.capacidad_carga_kg || '',
      consumo_combustible_l100km: vehiculoInicial.consumo_combustible_l100km || '',
      factor_emision_co2_kg_l: vehiculoInicial.factor_emision_co2_kg_l || '',
      anio_fabricacion: vehiculoInicial.anio_fabricacion || '',
    }
  })

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const enviar = (e) => {
    e.preventDefault()
    onGuardar({
      placa: form.placa.trim(),
      tipo: form.tipo,
      capacidad_carga_kg: Number(form.capacidad_carga_kg),
      consumo_combustible_l100km: Number(form.consumo_combustible_l100km),
      factor_emision_co2_kg_l: Number(form.factor_emision_co2_kg_l),
      anio_fabricacion: Number(form.anio_fabricacion),
    })
  }

  return (
    <section className="panel">
      <div className="panel-cabecera">
        <h2>
          {vehiculoInicial?.id ? 'Editar vehículo' : 'Registrar vehículo'}
        </h2>
        <button className="boton boton-secundario" type="button" onClick={onVolver}>
          ← Volver
        </button>
      </div>

      <form className="formulario" onSubmit={enviar}>
        <div className="grupo-campos">
          <label className="campo-etiqueta">
            Placa
            <input
              className="campo"
              type="text"
              placeholder="ABC-123"
              value={form.placa}
              onChange={cambiar('placa')}
              required
            />
          </label>
          <label className="campo-etiqueta">
            Tipo
            <select className="campo" value={form.tipo} onChange={cambiar('tipo')}>
              {Object.entries(ETIQUETAS_TIPO_VEHICULO).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>
                  {etiqueta}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grupo-campos">
          <label className="campo-etiqueta">
            Capacidad de carga (kg)
            <input
              className="campo"
              type="number"
              step="any"
              min="0"
              placeholder="1200"
              value={form.capacidad_carga_kg}
              onChange={cambiar('capacidad_carga_kg')}
              required
            />
          </label>
          <label className="campo-etiqueta">
            Consumo (L/100km)
            <input
              className="campo"
              type="number"
              step="any"
              min="0"
              placeholder="8.5"
              value={form.consumo_combustible_l100km}
              onChange={cambiar('consumo_combustible_l100km')}
              required
            />
          </label>
        </div>

        <div className="grupo-campos">
          <label className="campo-etiqueta">
            Factor emisión CO₂ (kg/L)
            <input
              className="campo"
              type="number"
              step="any"
              min="0"
              placeholder="2.3"
              value={form.factor_emision_co2_kg_l}
              onChange={cambiar('factor_emision_co2_kg_l')}
              required
            />
          </label>
          <label className="campo-etiqueta">
            Año de fabricación
            <input
              className="campo"
              type="number"
              placeholder="2020"
              value={form.anio_fabricacion}
              onChange={cambiar('anio_fabricacion')}
              required
            />
          </label>
        </div>

        <div className="acciones-formulario">
          <button className="boton boton-primario" type="submit" disabled={guardando}>
            {guardando
              ? 'Guardando…'
              : vehiculoInicial?.id
              ? 'Guardar cambios'
              : 'Registrar vehículo'}
          </button>
          <button className="boton boton-secundario" type="button" onClick={onVolver} disabled={guardando}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}
