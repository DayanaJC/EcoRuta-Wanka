// Ubicación de entrega de un pedido: dirección con autocompletado (texto) o punto marcado
// en un mapa a pantalla completa. Al marcar en el mapa se busca la dirección de ese punto
// (geocodificación inversa) y se propone como dirección del pedido.

import { CircleCheck, LoaderCircle, MapPin, MapPinned, Search, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useId, useRef, useState } from 'react'
import { api } from '../services/api.js'

const MapaSelector = dynamic(() => import('./MapaSelector.jsx'), {
  ssr: false,
  loading: () => <div className="mapa-cargando" style={{ height: '100%' }}>Cargando mapa…</div>,
})

const MIN_CARACTERES = 4
const ESPERA_ESCRITURA_MS = 700

// Sugerencias de direcciones mientras se escribe (con espera para no saturar Nominatim)
function useSugerencias(texto, activo) {
  const [estado, setEstado] = useState({ texto: '', lista: null, cargando: false })
  useEffect(() => {
    const q = texto.trim()
    if (!activo || q.length < MIN_CARACTERES) return
    let vigente = true
    const t = setTimeout(async () => {
      setEstado({ texto: q, lista: null, cargando: true })
      try {
        const lista = await api.geocodificar(q)
        if (vigente) setEstado({ texto: q, lista, cargando: false })
      } catch {
        if (vigente) setEstado({ texto: q, lista: [], cargando: false })
      }
    }, ESPERA_ESCRITURA_MS)
    return () => {
      vigente = false
      clearTimeout(t)
    }
  }, [texto, activo])
  const vigentes = activo && texto.trim().length >= MIN_CARACTERES
  return vigentes ? estado : { lista: null, cargando: false }
}

// Campo de texto con lista de sugerencias accesible (combobox)
function CampoDireccion({ id, valor, onEscribir, onElegir, onMarcarEnMapa, invalido }) {
  const [escribiendo, setEscribiendo] = useState(false)
  const [activa, setActiva] = useState(-1)
  const lista = useId()
  const { lista: sugerencias, cargando } = useSugerencias(valor, escribiendo)
  const abierta = escribiendo && (cargando || sugerencias !== null)

  const elegir = (s) => {
    setEscribiendo(false)
    setActiva(-1)
    onElegir(s)
  }

  const teclas = (e) => {
    if (!abierta || !sugerencias?.length) {
      if (e.key === 'Escape') setEscribiendo(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiva((i) => (i + 1) % sugerencias.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiva((i) => (i <= 0 ? sugerencias.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activa >= 0) {
      e.preventDefault()
      elegir(sugerencias[activa])
    } else if (e.key === 'Escape') {
      setEscribiendo(false)
    }
  }

  return (
    <div className="ubicacion-entrada">
      <div className="buscador ubicacion-combo">
        <Search size={16} aria-hidden />
        <input
          id={id}
          className="campo"
          aria-invalid={invalido || undefined}
          placeholder="Escribe la calle y el distrito, p. ej. Jirón Puno 450, Huancayo"
          value={valor}
          onChange={(e) => {
            onEscribir(e.target.value)
            setEscribiendo(true)
            setActiva(-1)
          }}
          onKeyDown={teclas}
          onBlur={() => setTimeout(() => setEscribiendo(false), 150)}
          role="combobox"
          aria-expanded={abierta}
          aria-controls={lista}
          aria-autocomplete="list"
          aria-activedescendant={activa >= 0 ? `${lista}-${activa}` : undefined}
          autoComplete="off"
          required
          minLength={5}
        />
        {cargando && <LoaderCircle size={16} className="girando ubicacion-cargando" aria-label="Buscando direcciones" />}
        {abierta && (
          <ul id={lista} role="listbox" className="sugerencias ubicacion-sugerencias">
            {cargando && !sugerencias && <li className="ayuda ubicacion-nota">Buscando direcciones…</li>}
            {sugerencias?.length === 0 && <li className="ayuda ubicacion-nota">Sin coincidencias. Prueba con la calle y el distrito.</li>}
            {sugerencias?.map((s, i) => (
              <li key={`${s.latitud},${s.longitud}`} id={`${lista}-${i}`} role="option" aria-selected={i === activa}>
                <button type="button" className={i === activa ? 'activa' : ''} onMouseDown={(e) => e.preventDefault()} onClick={() => elegir(s)}>
                  <MapPin size={14} aria-hidden />
                  <span>
                    <strong>{s.direccion}</strong>
                    <small>{s.nombre}</small>
                  </span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="ubicacion-ir-mapa"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setEscribiendo(false)
                  onMarcarEnMapa()
                }}
              >
                <MapPinned size={14} aria-hidden /> ¿No aparece? Márcala en el mapa
              </button>
            </li>
          </ul>
        )}
      </div>
      <button type="button" className="boton boton-secundario" onClick={onMarcarEnMapa}>
        <MapPinned size={16} aria-hidden /> Marcar en el mapa
      </button>
    </div>
  )
}

// Mapa en primer plano: el punto se marca con un toque o arrastrando el pin
function ModalMapa({ abierto, posicionInicial, onCerrar, onGuardar }) {
  const ref = useRef(null)
  const [punto, setPunto] = useState(posicionInicial)
  const [direccion, setDireccion] = useState({ estado: 'vacio', datos: null })

  useEffect(() => {
    const d = ref.current
    if (abierto && !d.open) d.showModal()
    if (!abierto && d.open) d.close()
  }, [abierto])

  // Dirección del punto marcado (la última consulta gana)
  useEffect(() => {
    if (!abierto || !punto) return
    let vigente = true
    const t = setTimeout(async () => {
      setDireccion({ estado: 'buscando', datos: null })
      try {
        const datos = await api.geocodificarInversa(punto[0], punto[1])
        if (vigente) setDireccion({ estado: datos ? 'ok' : 'sin', datos })
      } catch {
        if (vigente) setDireccion({ estado: 'error', datos: null })
      }
    }, 400)
    return () => {
      vigente = false
      clearTimeout(t)
    }
  }, [abierto, punto])

  const marcar = ([lat, lon]) => setPunto([Number(lat.toFixed(6)), Number(lon.toFixed(6))])

  return (
    <dialog ref={ref} className="dialogo dialogo-mapa" onCancel={onCerrar} aria-labelledby="mapa-titulo">
      <div className="dialogo-mapa-cabecera">
        <div>
          <h2 id="mapa-titulo">Marca el punto de entrega</h2>
          <p className="texto-secundario">Toca el mapa o arrastra el pin hasta la puerta del cliente. Acerca el mapa para más precisión.</p>
        </div>
        <button type="button" className="boton boton-fantasma boton-icono" onClick={onCerrar} aria-label="Cerrar sin guardar">
          <X size={18} />
        </button>
      </div>

      <div className="dialogo-mapa-cuerpo">{abierto && <MapaSelector posicion={punto} onCambiar={marcar} className="mapa-pantalla" />}</div>

      <div className="dialogo-mapa-pie">
        <div className="dialogo-mapa-direccion" aria-live="polite">
          <MapPin size={18} aria-hidden className={punto ? 'texto-verde' : 'texto-secundario'} />
          {!punto && <span className="texto-secundario">Aún no hay punto marcado.</span>}
          {punto && direccion.estado === 'buscando' && <span className="texto-secundario">Buscando la dirección de este punto…</span>}
          {punto && direccion.estado === 'ok' && (
            <span>
              <strong>{direccion.datos.direccion}</strong>
              <small className="texto-secundario num"> · {punto[0]}, {punto[1]}</small>
            </span>
          )}
          {punto && (direccion.estado === 'sin' || direccion.estado === 'error') && (
            <span className="texto-secundario">
              No se encontró una dirección para este punto; podrás escribirla a mano. <span className="num">({punto[0]}, {punto[1]})</span>
            </span>
          )}
        </div>
        <div className="acciones">
          <button type="button" className="boton boton-secundario" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className="boton boton-primario"
            disabled={!punto}
            onClick={() => onGuardar({ posicion: punto, direccion: direccion.estado === 'ok' ? direccion.datos.direccion : null })}
          >
            <CircleCheck size={16} aria-hidden /> Guardar ubicación
          </button>
        </div>
      </div>
    </dialog>
  )
}

/**
 * @param {{ direccion: string, posicion: [number, number] | null, onDireccion: (texto: string) => void,
 *           onPosicion: (p: [number, number]) => void, error?: string | null }} props
 */
export function SelectorUbicacion({ direccion, posicion, onDireccion, onPosicion, error }) {
  const [modal, setModal] = useState(0) // > 0: abierto (la clave reinicia el estado del mapa)
  // La dirección vino de una sugerencia o del mapa (se puede reemplazar sin preguntar)
  const [automatica, setAutomatica] = useState(false)
  const [propuesta, setPropuesta] = useState(null)

  const elegirSugerencia = (s) => {
    onDireccion(s.direccion)
    onPosicion([s.latitud, s.longitud])
    setAutomatica(true)
    setPropuesta(null)
  }

  const guardarMapa = ({ posicion: p, direccion: d }) => {
    onPosicion(p)
    setModal(0)
    if (!d) return
    // No se pisa una dirección escrita a mano: se ofrece reemplazarla
    if (!direccion.trim() || automatica) {
      onDireccion(d)
      setAutomatica(true)
      setPropuesta(null)
    } else if (d !== direccion.trim()) {
      setPropuesta(d)
    }
  }

  return (
    <div className="pila" style={{ gap: 10 }}>
      <CampoDireccion
        id="direccion"
        valor={direccion}
        onEscribir={(t) => {
          onDireccion(t)
          setAutomatica(false)
        }}
        onElegir={elegirSugerencia}
        onMarcarEnMapa={() => setModal((n) => n + 1)}
        invalido={Boolean(error)}
      />

      {propuesta && (
        <div className="ubicacion-propuesta">
          <span>
            Dirección del punto marcado: <strong>{propuesta}</strong>
          </span>
          <span className="acciones">
            <button
              type="button"
              className="boton boton-secundario boton-sm"
              onClick={() => {
                onDireccion(propuesta)
                setAutomatica(true)
                setPropuesta(null)
              }}
            >
              Usar esta
            </button>
            <button type="button" className="boton boton-fantasma boton-sm" onClick={() => setPropuesta(null)}>
              Mantener la mía
            </button>
          </span>
        </div>
      )}

      {posicion ? (
        <div className="ubicacion-confirmada">
          <div className="ubicacion-mini-mapa">
            <MapaSelector posicion={posicion} soloLectura estatico className="mapa-mini" />
          </div>
          <div className="pila" style={{ gap: 6 }}>
            <span className="texto-verde acciones">
              <CircleCheck size={16} aria-hidden /> Ubicación marcada
            </span>
            <span className="ayuda num">
              {posicion[0]}, {posicion[1]}
            </span>
            <button type="button" className="boton boton-secundario boton-sm" onClick={() => setModal((n) => n + 1)} style={{ alignSelf: 'flex-start' }}>
              <MapPinned size={15} aria-hidden /> Ajustar en el mapa
            </button>
          </div>
        </div>
      ) : (
        <div className={`ubicacion-vacia${error ? ' ubicacion-vacia-error' : ''}`}>
          <MapPinned size={18} aria-hidden />
          <span>
            {error ?? 'Falta el punto de entrega.'} Elige una sugerencia al escribir la dirección o usa <strong>Marcar en el mapa</strong>.
          </span>
        </div>
      )}

      <ModalMapa key={modal} abierto={modal > 0} posicionInicial={posicion} onCerrar={() => setModal(0)} onGuardar={guardarMapa} />
    </div>
  )
}
