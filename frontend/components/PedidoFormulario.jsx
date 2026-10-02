import { useState } from 'react'
import { ETIQUETAS_PRIORIDAD } from '../utils/formatos.js'
import { bultoVacio, convertirMedidas, EditorBultos } from './EditorBultos.jsx'
import { SelectorUbicacion } from './SelectorUbicacion.jsx'
import { Cargando, CampoGrupo } from './ui.jsx'

const VACIO = {
  cliente_id: '',
  cliente_nombre: '',
  direccion: '',
  punto_referencia: '',
  latitud: null,
  longitud: null,
  ventana_entrega_inicio: '08:00',
  ventana_entrega_fin: '12:00',
  tiempo_servicio_min: '5',
  prioridad: 'estandar',
}

const desdePedido = (p) =>
  p
    ? {
        ...VACIO,
        ...p,
        bultos: p.bultos?.length ? p.bultos.map(({ id, ...b }) => ({ ...b })) : [bultoVacio()],
        tiempo_servicio_min: String(p.tiempo_servicio_min ?? 5),
      }
    : { ...VACIO, bultos: [bultoVacio()] }

export function PedidoFormulario({ pedidoInicial, onGuardar, onCancelar, guardando }) {
  const [form, setForm] = useState(() => desdePedido(pedidoInicial))
  // Unidad en la que el operador escribe las medidas de los bultos (se guardan en cm)
  const [unidadMedida, setUnidadMedida] = useState('cm')
  const [intentoEnviar, setIntentoEnviar] = useState(false)

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))
  const posicion = form.latitud != null ? [form.latitud, form.longitud] : null
  const fijarPosicion = ([lat, lon]) => setForm((f) => ({ ...f, latitud: Number(lat.toFixed(6)), longitud: Number(lon.toFixed(6)) }))

  const errores = {
    ventana: form.ventana_entrega_fin <= form.ventana_entrega_inicio ? 'El fin de la ventana debe ser posterior al inicio.' : null,
    ubicacion: posicion ? null : 'Falta marcar la ubicación de entrega.',
  }

  const enviar = (e) => {
    e.preventDefault()
    setIntentoEnviar(true)
    if (errores.ventana || errores.ubicacion) return
    onGuardar({
      cliente_id: form.cliente_id.trim(),
      cliente_nombre: form.cliente_nombre.trim(),
      direccion: form.direccion.trim(),
      punto_referencia: form.punto_referencia.trim(),
      latitud: form.latitud,
      longitud: form.longitud,
      bultos: convertirMedidas(form.bultos, unidadMedida, 'cm').map((b) => ({
        descripcion: b.descripcion.trim(),
        cantidad: Number(b.cantidad),
        largo_cm: Number(b.largo_cm),
        ancho_cm: Number(b.ancho_cm),
        alto_cm: Number(b.alto_cm),
        peso_kg: Number(b.peso_kg),
        apilable: Boolean(b.apilable),
      })),
      ventana_entrega_inicio: form.ventana_entrega_inicio,
      ventana_entrega_fin: form.ventana_entrega_fin,
      tiempo_servicio_min: Number(form.tiempo_servicio_min),
      prioridad: form.prioridad,
    })
  }

  return (
    <form className="tarjeta" onSubmit={enviar} noValidate={false}>
      <div className="tarjeta-cuerpo formulario">
        <fieldset className="seccion-form">
          <legend>Cliente</legend>
          <div className="campos">
            <CampoGrupo etiqueta="Código del cliente" requerido htmlFor="cliente_id">
              <input id="cliente_id" className="campo" placeholder="CLI-0001" value={form.cliente_id} onChange={cambiar('cliente_id')} required minLength={3} />
            </CampoGrupo>
            <CampoGrupo etiqueta="Nombre del cliente o bodega" requerido htmlFor="cliente_nombre">
              <input id="cliente_nombre" className="campo" placeholder="Comercial Huancayo" value={form.cliente_nombre} onChange={cambiar('cliente_nombre')} required minLength={3} />
            </CampoGrupo>
          </div>
        </fieldset>

        <fieldset className="seccion-form">
          <legend>
            Ubicación de entrega
            <small>Escribe la dirección y elige una sugerencia, o marca el punto exacto en el mapa.</small>
          </legend>
          <CampoGrupo etiqueta="Dirección" requerido htmlFor="direccion">
            <SelectorUbicacion
              direccion={form.direccion}
              posicion={posicion}
              onDireccion={(direccion) => setForm((f) => ({ ...f, direccion }))}
              onPosicion={fijarPosicion}
              error={intentoEnviar ? errores.ubicacion : null}
            />
          </CampoGrupo>
          <div className="campos">
            <CampoGrupo etiqueta="Punto de referencia" htmlFor="referencia" ayuda="Útil en zonas sin numeración clara.">
              <input id="referencia" className="campo" placeholder="Frente al mercado" value={form.punto_referencia} onChange={cambiar('punto_referencia')} />
            </CampoGrupo>
          </div>
        </fieldset>

        <fieldset className="seccion-form">
          <legend>
            Carga
            <small>Registra cada tipo de bulto con sus medidas: el mismo peso puede ocupar volúmenes muy distintos.</small>
          </legend>
          <EditorBultos
            bultos={form.bultos}
            unidad={unidadMedida}
            onChange={(bultos) => setForm((f) => ({ ...f, bultos }))}
            onCambiarUnidad={(nueva) => {
              setForm((f) => ({ ...f, bultos: convertirMedidas(f.bultos, unidadMedida, nueva) }))
              setUnidadMedida(nueva)
            }}
          />
        </fieldset>

        <fieldset className="seccion-form">
          <legend>
            Entrega
            <small>La ruta optimizada respetará esta ventana horaria.</small>
          </legend>
          <div className="campos">
            <CampoGrupo etiqueta="Desde" requerido htmlFor="ventana_inicio">
              <input id="ventana_inicio" className="campo" type="time" value={form.ventana_entrega_inicio} onChange={cambiar('ventana_entrega_inicio')} required />
            </CampoGrupo>
            <CampoGrupo etiqueta="Hasta" requerido htmlFor="ventana_fin" error={errores.ventana}>
              <input
                id="ventana_fin"
                className="campo"
                type="time"
                value={form.ventana_entrega_fin}
                onChange={cambiar('ventana_entrega_fin')}
                aria-invalid={Boolean(errores.ventana)}
                required
              />
            </CampoGrupo>
            <CampoGrupo etiqueta="Tiempo de entrega" htmlFor="servicio" ayuda="Minutos que toma descargar y entregar.">
              <div className="campo-unidad">
                <input id="servicio" className="campo" type="number" min="0" max="240" value={form.tiempo_servicio_min} onChange={cambiar('tiempo_servicio_min')} />
                <span>min</span>
              </div>
            </CampoGrupo>
            <CampoGrupo etiqueta="Prioridad" htmlFor="prioridad">
              <select id="prioridad" className="campo" value={form.prioridad} onChange={cambiar('prioridad')}>
                {Object.entries(ETIQUETAS_PRIORIDAD).map(([v, e]) => (
                  <option key={v} value={v}>
                    {e}
                  </option>
                ))}
              </select>
            </CampoGrupo>
          </div>
        </fieldset>
      </div>

      <div className="barra-acciones">
        <button type="button" className="boton boton-secundario" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className="boton boton-primario" disabled={guardando}>
          {guardando ? <Cargando texto="Guardando" /> : pedidoInicial ? 'Guardar cambios' : 'Registrar pedido'}
        </button>
      </div>
    </form>
  )
}
