import { useState } from 'react'
import { capacidadVolumenM3, MEDIDAS_REFERENCIA } from '../utils/carga.js'
import { ETIQUETAS_TIPO_VEHICULO, formatearNumero } from '../utils/formatos.js'
import { Cargando, CampoGrupo } from './ui.jsx'
import { IconoVehiculo } from './VehiculoLista.jsx'

const PATRON_PLACA = /^[A-Z]{3}-\d{3}$/
const ANIO_ACTUAL = new Date().getFullYear()

// Valores de referencia para ayudar al operador (factor de emisión por tipo de combustible)
const SUGERENCIAS = {
  camioneta: { capacidad: 1000, consumo: 12 },
  furgon: { capacidad: 1500, consumo: 14 },
  moto: { capacidad: 40, consumo: 3 },
}

const desdeVehiculo = (v) => ({
  placa: v?.placa ?? '',
  tipo: v?.tipo ?? 'camioneta',
  capacidad_carga_kg: v?.capacidad_carga_kg?.toString() ?? '',
  consumo_combustible_l100km: v?.consumo_combustible_l100km?.toString() ?? '',
  factor_emision_co2_kg_l: v?.factor_emision_co2_kg_l?.toString() ?? '2.31',
  anio_fabricacion: v?.anio_fabricacion?.toString() ?? '',
  largo_util_cm: v?.largo_util_cm?.toString() ?? String(MEDIDAS_REFERENCIA.camioneta.largo_util_cm),
  ancho_util_cm: v?.ancho_util_cm?.toString() ?? String(MEDIDAS_REFERENCIA.camioneta.ancho_util_cm),
  alto_util_cm: v?.alto_util_cm?.toString() ?? String(MEDIDAS_REFERENCIA.camioneta.alto_util_cm),
  aprovechamiento_pct: v?.aprovechamiento_pct?.toString() ?? '80',
})

export function VehiculoFormulario({ vehiculoInicial, onGuardar, onCancelar, guardando }) {
  const [form, setForm] = useState(() => desdeVehiculo(vehiculoInicial))
  // En un vehículo nuevo, las medidas siguen al tipo elegido hasta que el operador las edite
  const [medidasEditadas, setMedidasEditadas] = useState(Boolean(vehiculoInicial))
  const [tocado, setTocado] = useState(false)
  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  const placa = form.placa.trim().toUpperCase()
  const volumenUtil = capacidadVolumenM3(form) || 0

  const elegirTipo = (tipo) =>
    setForm((f) => ({ ...f, tipo, ...(medidasEditadas ? {} : Object.fromEntries(Object.entries(MEDIDAS_REFERENCIA[tipo]).map(([k, v]) => [k, String(v)]))) }))
  const cambiarMedida = (campo) => (e) => {
    setMedidasEditadas(true)
    cambiar(campo)(e)
  }
  const usarReferencia = () => {
    setMedidasEditadas(false)
    setForm((f) => ({ ...f, ...Object.fromEntries(Object.entries(MEDIDAS_REFERENCIA[f.tipo]).map(([k, v]) => [k, String(v)])) }))
  }
  const errorPlaca = tocado && placa && !PATRON_PLACA.test(placa) ? 'Usa tres letras, guion y tres dígitos (ABC-123).' : null
  const sugerencia = SUGERENCIAS[form.tipo]

  const enviar = (e) => {
    e.preventDefault()
    setTocado(true)
    if (!PATRON_PLACA.test(placa)) return
    onGuardar({
      placa,
      tipo: form.tipo,
      capacidad_carga_kg: Number(form.capacidad_carga_kg),
      consumo_combustible_l100km: Number(form.consumo_combustible_l100km),
      factor_emision_co2_kg_l: Number(form.factor_emision_co2_kg_l),
      anio_fabricacion: Number(form.anio_fabricacion),
      largo_util_cm: Number(form.largo_util_cm),
      ancho_util_cm: Number(form.ancho_util_cm),
      alto_util_cm: Number(form.alto_util_cm),
      aprovechamiento_pct: Number(form.aprovechamiento_pct),
    })
  }

  return (
    <form className="tarjeta" onSubmit={enviar}>
      <div className="tarjeta-cuerpo formulario">
        <fieldset className="seccion-form">
          <legend>Identificación</legend>
          <div className="campos">
            <CampoGrupo etiqueta="Placa" requerido htmlFor="placa" error={errorPlaca} ayuda="Formato peruano: ABC-123">
              <input
                id="placa"
                className="campo num"
                placeholder="ABC-123"
                value={form.placa}
                onChange={cambiar('placa')}
                onBlur={() => setTocado(true)}
                aria-invalid={Boolean(errorPlaca)}
                maxLength={7}
                style={{ textTransform: 'uppercase' }}
                required
              />
            </CampoGrupo>
            <CampoGrupo etiqueta="Año de fabricación" requerido htmlFor="anio">
              <input id="anio" className="campo" type="number" min="1980" max={ANIO_ACTUAL + 1} placeholder="2020" value={form.anio_fabricacion} onChange={cambiar('anio_fabricacion')} required />
            </CampoGrupo>
          </div>
          <div className="campo-grupo">
            <span className="campo-etiqueta">
              Tipo de vehículo<span className="requerido" aria-hidden>*</span>
            </span>
            <div className="opciones-tarjeta" role="group" aria-label="Tipo de vehículo">
              {Object.entries(ETIQUETAS_TIPO_VEHICULO).map(([valor, etiqueta]) => (
                <button key={valor} type="button" className="opcion-tarjeta" aria-pressed={form.tipo === valor} onClick={() => elegirTipo(valor)}>
                  <strong>
                    <IconoVehiculo tipo={valor} /> {etiqueta}
                  </strong>
                  <span>Aprox. {SUGERENCIAS[valor].capacidad.toLocaleString('es-PE')} kg</span>
                </button>
              ))}
            </div>
          </div>
        </fieldset>

        <fieldset className="seccion-form">
          <legend>
            Capacidad y consumo
            <small>Se usan para validar la carga de las rutas y estimar el consumo y las emisiones de CO₂.</small>
          </legend>
          <div className="campos">
            <CampoGrupo etiqueta="Capacidad de carga" requerido htmlFor="capacidad" ayuda={`Referencia para ${ETIQUETAS_TIPO_VEHICULO[form.tipo].toLowerCase()}: ${sugerencia.capacidad.toLocaleString('es-PE')} kg`}>
              <div className="campo-unidad">
                <input id="capacidad" className="campo" type="number" step="any" min="1" max="10000" value={form.capacidad_carga_kg} onChange={cambiar('capacidad_carga_kg')} required />
                <span>kg</span>
              </div>
            </CampoGrupo>
            <CampoGrupo etiqueta="Consumo de combustible" requerido htmlFor="consumo" ayuda={`Referencia: ${sugerencia.consumo} L/100 km`}>
              <div className="campo-unidad">
                <input id="consumo" className="campo" type="number" step="any" min="0.1" max="100" value={form.consumo_combustible_l100km} onChange={cambiar('consumo_combustible_l100km')} required />
                <span style={{ right: 10 }}>L/100</span>
              </div>
            </CampoGrupo>
            <CampoGrupo etiqueta="Factor de emisión CO₂" requerido htmlFor="factor" ayuda="Gasolina ≈ 2,31 · Diésel ≈ 2,68 kg CO₂/L">
              <div className="campo-unidad">
                <input id="factor" className="campo" type="number" step="any" min="0.01" max="100" value={form.factor_emision_co2_kg_l} onChange={cambiar('factor_emision_co2_kg_l')} required />
                <span>kg/L</span>
              </div>
            </CampoGrupo>
          </div>
        </fieldset>

        <fieldset className="seccion-form">
          <legend>
            Espacio de carga
            <small>Medidas internas útiles de la tolva o caja. Se usan para comprobar que los bultos caben y para calcular el volumen disponible.</small>
          </legend>
          <div className="campos">
            {[
              ['largo_util_cm', 'Largo útil'],
              ['ancho_util_cm', 'Ancho útil'],
              ['alto_util_cm', 'Alto útil'],
            ].map(([campo, etiqueta]) => (
              <CampoGrupo key={campo} etiqueta={etiqueta} requerido htmlFor={campo}>
                <div className="campo-unidad">
                  <input id={campo} className="campo" type="number" step="any" min="1" max="2000" value={form[campo]} onChange={cambiarMedida(campo)} required />
                  <span>cm</span>
                </div>
              </CampoGrupo>
            ))}
            <CampoGrupo etiqueta="Aprovechamiento" requerido htmlFor="aprovechamiento" ayuda="Los bultos no llenan el 100 % del espacio (80 % es un valor habitual).">
              <div className="campo-unidad">
                <input id="aprovechamiento" className="campo" type="number" min="30" max="100" value={form.aprovechamiento_pct} onChange={cambiar('aprovechamiento_pct')} required />
                <span>%</span>
              </div>
            </CampoGrupo>
          </div>
          <div className="totales-bultos num">
            <span>
              Volumen útil <strong>{formatearNumero(Number(volumenUtil.toFixed(3)))} m³</strong>
            </span>
            <button type="button" className="boton boton-fantasma boton-sm" onClick={usarReferencia}>
              Usar medidas de referencia para {ETIQUETAS_TIPO_VEHICULO[form.tipo].toLowerCase()}
            </button>
          </div>
        </fieldset>
      </div>

      <div className="barra-acciones">
        <button type="button" className="boton boton-secundario" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className="boton boton-primario" disabled={guardando}>
          {guardando ? <Cargando texto="Guardando" /> : vehiculoInicial ? 'Guardar cambios' : 'Registrar vehículo'}
        </button>
      </div>
    </form>
  )
}
