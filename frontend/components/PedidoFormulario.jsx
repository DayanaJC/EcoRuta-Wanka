import { MapPin, Search } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { api } from '../services/api.js'
import { ETIQUETAS_PRIORIDAD, ETIQUETAS_TIPO } from '../utils/formatos.js'
import { Cargando, CampoGrupo } from './ui.jsx'

const MapaSelector = dynamic(() => import('./MapaSelector.jsx'), {
  ssr: false,
  loading: () => <div className="mapa-selector mapa-cargando">Cargando mapa…</div>,
})

const VACIO = {
  cliente_id: '',
  cliente_nombre: '',
  direccion: '',
  punto_referencia: '',
  latitud: null,
  longitud: null,
  peso_kg: '',
  volumen_m3: '',
  ventana_entrega_inicio: '08:00',
  ventana_entrega_fin: '12:00',
  tiempo_servicio_min: '5',
  prioridad: 'estandar',
  tipo_producto: 'no_perecedero',
}

const desdePedido = (p) =>
  p
    ? {
        ...VACIO,
        ...p,
        peso_kg: String(p.peso_kg),
        volumen_m3: String(p.volumen_m3),
        tiempo_servicio_min: String(p.tiempo_servicio_min ?? 5),
      }
    : VACIO

export function PedidoFormulario({ pedidoInicial, onGuardar, onCancelar, guardando }) {
  const [form, setForm] = useState(() => desdePedido(pedidoInicial))
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [sugerencias, setSugerencias] = useState(null)
  const [buscando, setBuscando] = useState(false)

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))
  const posicion = form.latitud != null ? [form.latitud, form.longitud] : null
  const fijarPosicion = ([lat, lon]) => setForm((f) => ({ ...f, latitud: Number(lat.toFixed(6)), longitud: Number(lon.toFixed(6)) }))

  const errores = {
    ventana: form.ventana_entrega_fin <= form.ventana_entrega_inicio ? 'El fin de la ventana debe ser posterior al inicio.' : null,
    ubicacion: posicion ? null : 'Marca la ubicación de entrega en el mapa.',
  }

  const buscarDireccion = async () => {
    const q = (busqueda || form.direccion).trim()
    if (q.length < 3) return
    setBuscando(true)
    try {
      setSugerencias(await api.geocodificar(q))
    } catch {
      setSugerencias([])
    } finally {
      setBuscando(false)
    }
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
      peso_kg: Number(form.peso_kg),
      volumen_m3: Number(form.volumen_m3),
      ventana_entrega_inicio: form.ventana_entrega_inicio,
      ventana_entrega_fin: form.ventana_entrega_fin,
      tiempo_servicio_min: Number(form.tiempo_servicio_min),
      prioridad: form.prioridad,
      tipo_producto: form.tipo_producto,
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
            <small>Busca la calle o haz clic en el mapa; puedes arrastrar el pin para ajustar el punto exacto.</small>
          </legend>
          <div className="campos">
            <CampoGrupo etiqueta="Dirección" requerido htmlFor="direccion">
              <input id="direccion" className="campo" placeholder="Jr. Puno 450, Huancayo" value={form.direccion} onChange={cambiar('direccion')} required minLength={5} />
            </CampoGrupo>
            <CampoGrupo etiqueta="Punto de referencia" htmlFor="referencia" ayuda="Útil en zonas sin numeración clara.">
              <input id="referencia" className="campo" placeholder="Frente al mercado" value={form.punto_referencia} onChange={cambiar('punto_referencia')} />
            </CampoGrupo>
          </div>

          <div className="campo-grupo">
            <label className="campo-etiqueta" htmlFor="buscar-direccion">
              Buscar en el mapa
            </label>
            <div className="acciones" style={{ display: 'flex' }}>
              <div className="buscador">
                <Search size={16} aria-hidden />
                <input
                  id="buscar-direccion"
                  className="campo"
                  type="search"
                  placeholder="Ej.: Jirón Puno, Huancayo"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      buscarDireccion()
                    }
                  }}
                />
              </div>
              <button type="button" className="boton boton-secundario" onClick={buscarDireccion} disabled={buscando}>
                {buscando ? <Cargando texto="Buscando" /> : 'Buscar'}
              </button>
            </div>
            {sugerencias && (
              <ul className="sugerencias">
                {sugerencias.length === 0 && <li className="ayuda" style={{ padding: 8 }}>Sin resultados. Prueba con el nombre de la calle y el distrito, o marca el punto en el mapa.</li>}
                {sugerencias.map((s) => (
                  <li key={`${s.latitud},${s.longitud}`}>
                    <button
                      type="button"
                      onClick={() => {
                        fijarPosicion([s.latitud, s.longitud])
                        setSugerencias(null)
                      }}
                    >
                      <MapPin size={13} aria-hidden /> {s.nombre}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <MapaSelector posicion={posicion} onCambiar={fijarPosicion} />
          {posicion ? (
            <span className="ayuda num">
              Coordenadas: {form.latitud}, {form.longitud}
            </span>
          ) : (
            intentoEnviar && <span className="error-campo">{errores.ubicacion}</span>
          )}
        </fieldset>

        <fieldset className="seccion-form">
          <legend>Carga</legend>
          <div className="campos">
            <CampoGrupo etiqueta="Peso" requerido htmlFor="peso">
              <div className="campo-unidad">
                <input id="peso" className="campo" type="number" step="any" min="0.01" max="10000" placeholder="25" value={form.peso_kg} onChange={cambiar('peso_kg')} required />
                <span>kg</span>
              </div>
            </CampoGrupo>
            <CampoGrupo etiqueta="Volumen" requerido htmlFor="volumen">
              <div className="campo-unidad">
                <input id="volumen" className="campo" type="number" step="any" min="0.001" max="100" placeholder="0.4" value={form.volumen_m3} onChange={cambiar('volumen_m3')} required />
                <span>m³</span>
              </div>
            </CampoGrupo>
            <CampoGrupo etiqueta="Tipo de producto" htmlFor="tipo_producto">
              <select id="tipo_producto" className="campo" value={form.tipo_producto} onChange={cambiar('tipo_producto')}>
                {Object.entries(ETIQUETAS_TIPO).map(([v, e]) => (
                  <option key={v} value={v}>
                    {e}
                  </option>
                ))}
              </select>
            </CampoGrupo>
          </div>
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
