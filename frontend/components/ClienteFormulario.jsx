import { useState } from 'react'
import { DIAS_SEMANA, ETIQUETAS_TIPO_CLIENTE } from '../utils/formatos.js'
import { SelectorUbicacion } from './SelectorUbicacion.jsx'
import { Cargando, CampoGrupo } from './ui.jsx'

// Mismas reglas que la API (backend/src/schemas/esquemas.js)
const PATRON_CODIGO = /^[A-Z0-9-]{3,50}$/
const PATRON_TELEFONO = /^\+?\d{6,14}$/
// Lunes primero, como se lee en Perú
const ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0]

const desdeCliente = (c) => ({
  codigo: c?.codigo ?? '',
  nombre: c?.nombre ?? '',
  tipo: c?.tipo ?? 'bodega',
  telefono: c?.telefono ?? '',
  direccion: c?.direccion ?? '',
  punto_referencia: c?.punto_referencia ?? '',
  latitud: c?.latitud ?? null,
  longitud: c?.longitud ?? null,
  ventana_inicio: c?.ventana_inicio ?? '08:00',
  ventana_fin: c?.ventana_fin ?? '13:00',
  dias_recepcion: c?.dias_recepcion ?? [1, 2, 3, 4, 5, 6],
  tiempo_atencion_min: String(c?.tiempo_atencion_min ?? 5),
  indicaciones: c?.indicaciones ?? '',
})

export function ClienteFormulario({ clienteInicial, onGuardar, onCancelar, guardando }) {
  const [form, setForm] = useState(() => desdeCliente(clienteInicial))
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))
  const posicion = form.latitud != null ? [form.latitud, form.longitud] : null
  const fijarPosicion = ([lat, lon]) => setForm((f) => ({ ...f, latitud: Number(lat.toFixed(6)), longitud: Number(lon.toFixed(6)) }))
  const alternarDia = (dia) =>
    setForm((f) => ({ ...f, dias_recepcion: f.dias_recepcion.includes(dia) ? f.dias_recepcion.filter((d) => d !== dia) : [...f.dias_recepcion, dia] }))

  const codigo = form.codigo.trim().toUpperCase()
  const telefono = form.telefono.replace(/\s/g, '')
  const errores = {
    codigo: !PATRON_CODIGO.test(codigo) ? 'De 3 a 50 letras, dígitos o guiones (ej. CLI-0001).' : null,
    nombre: form.nombre.trim().length < 3 ? 'Escribe el nombre (al menos 3 caracteres).' : null,
    telefono: telefono && !PATRON_TELEFONO.test(telefono) ? 'Solo dígitos (6 a 14), con + opcional al inicio.' : null,
    ventana: form.ventana_fin <= form.ventana_inicio ? 'El fin del horario debe ser posterior al inicio.' : null,
    dias: form.dias_recepcion.length === 0 ? 'Elige al menos un día.' : null,
    ubicacion: posicion ? null : 'Falta marcar la ubicación de entrega.',
  }
  const error = (campo) => (intentoEnviar ? errores[campo] : null)

  const enviar = (e) => {
    e.preventDefault()
    setIntentoEnviar(true)
    if (Object.values(errores).some(Boolean)) return
    onGuardar({
      ...(clienteInicial ? {} : { codigo }),
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      telefono: telefono || null,
      direccion: form.direccion.trim(),
      punto_referencia: form.punto_referencia.trim(),
      latitud: form.latitud,
      longitud: form.longitud,
      ventana_inicio: form.ventana_inicio,
      ventana_fin: form.ventana_fin,
      dias_recepcion: form.dias_recepcion,
      tiempo_atencion_min: Number(form.tiempo_atencion_min),
      indicaciones: form.indicaciones.trim(),
    })
  }

  return (
    <form className="tarjeta" onSubmit={enviar} noValidate>
      <div className="tarjeta-cuerpo formulario">
        <fieldset className="seccion-form">
          <legend>Datos del cliente</legend>
          <div className="campos">
            <CampoGrupo
              etiqueta="Código del cliente"
              requerido
              htmlFor="codigo"
              error={error('codigo')}
              ayuda={clienteInicial ? 'El código no se cambia: enlaza al cliente con sus pedidos.' : 'El mismo código que usarás en sus pedidos.'}
            >
              <input
                id="codigo"
                className="campo num"
                placeholder="CLI-0001"
                value={form.codigo}
                onChange={cambiar('codigo')}
                disabled={Boolean(clienteInicial)}
                maxLength={50}
                style={{ textTransform: 'uppercase' }}
                autoComplete="off"
              />
            </CampoGrupo>
            <CampoGrupo etiqueta="Nombre del cliente o bodega" requerido htmlFor="nombre" error={error('nombre')}>
              <input id="nombre" className="campo" placeholder="Bodega Doña Rosa" value={form.nombre} onChange={cambiar('nombre')} maxLength={100} autoComplete="off" />
            </CampoGrupo>
            <CampoGrupo etiqueta="Tipo de negocio" htmlFor="tipo">
              <select id="tipo" className="campo" value={form.tipo} onChange={cambiar('tipo')}>
                {Object.entries(ETIQUETAS_TIPO_CLIENTE).map(([v, e]) => (
                  <option key={v} value={v}>
                    {e}
                  </option>
                ))}
              </select>
            </CampoGrupo>
            <CampoGrupo etiqueta="Teléfono" htmlFor="telefono" error={error('telefono')} ayuda="Opcional. Para avisar la llegada.">
              <input id="telefono" className="campo num" type="tel" placeholder="964 123 456" value={form.telefono} onChange={cambiar('telefono')} maxLength={18} />
            </CampoGrupo>
          </div>
        </fieldset>

        <fieldset className="seccion-form">
          <legend>
            Ubicación de entrega
            <small>Se copia a cada pedido nuevo del cliente.</small>
          </legend>
          <CampoGrupo etiqueta="Dirección" requerido htmlFor="direccion">
            <SelectorUbicacion
              direccion={form.direccion}
              posicion={posicion}
              onDireccion={(direccion) => setForm((f) => ({ ...f, direccion }))}
              onPosicion={fijarPosicion}
              error={error('ubicacion')}
            />
          </CampoGrupo>
          <div className="campos">
            <CampoGrupo etiqueta="Punto de referencia" htmlFor="referencia">
              <input id="referencia" className="campo" placeholder="Frente al mercado" value={form.punto_referencia} onChange={cambiar('punto_referencia')} maxLength={200} />
            </CampoGrupo>
          </div>
        </fieldset>

        <fieldset className="seccion-form">
          <legend>
            Preferencias de entrega
            <small>La ruta solo se planifica en los días que recibe y dentro de su horario preferido.</small>
          </legend>
          <CampoGrupo etiqueta="Días en que recibe mercadería" requerido error={error('dias')}>
            <div className="segmentos" role="group" aria-label="Días de recepción">
              {ORDEN_DIAS.map((d) => (
                <button key={d} type="button" className="segmento" aria-pressed={form.dias_recepcion.includes(d)} onClick={() => alternarDia(d)}>
                  {DIAS_SEMANA[d]}
                </button>
              ))}
            </div>
          </CampoGrupo>
          <div className="campos">
            <CampoGrupo etiqueta="Recibe desde" requerido htmlFor="ventana_inicio">
              <input id="ventana_inicio" className="campo" type="time" value={form.ventana_inicio} onChange={cambiar('ventana_inicio')} />
            </CampoGrupo>
            <CampoGrupo etiqueta="Hasta" requerido htmlFor="ventana_fin" error={error('ventana')}>
              <input id="ventana_fin" className="campo" type="time" value={form.ventana_fin} onChange={cambiar('ventana_fin')} aria-invalid={Boolean(error('ventana'))} />
            </CampoGrupo>
            <CampoGrupo etiqueta="Tiempo de atención" htmlFor="atencion" ayuda="Minutos que toma descargar y entregar.">
              <div className="campo-unidad">
                <input id="atencion" className="campo" type="number" min="0" max="240" value={form.tiempo_atencion_min} onChange={cambiar('tiempo_atencion_min')} />
                <span>min</span>
              </div>
            </CampoGrupo>
          </div>
          <CampoGrupo etiqueta="Indicaciones para el conductor" htmlFor="indicaciones" ayuda="Aparecen en la hoja de ruta. Ej.: entrar por el pasaje lateral, entregar a la Sra. Rosa.">
            <textarea id="indicaciones" className="campo" rows={2} value={form.indicaciones} onChange={cambiar('indicaciones')} maxLength={300} />
          </CampoGrupo>
        </fieldset>
      </div>
      <div className="barra-acciones">
        <button type="button" className="boton boton-secundario" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className="boton boton-primario" disabled={guardando}>
          {guardando ? <Cargando texto="Guardando…" /> : clienteInicial ? 'Guardar cambios' : 'Registrar cliente'}
        </button>
      </div>
    </form>
  )
}
