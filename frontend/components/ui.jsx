// Componentes de interfaz reutilizables.

import { ArrowLeft, CircleCheck, Info, LoaderCircle, TriangleAlert, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

export function EncabezadoPagina({ titulo, descripcion, onVolver, textoVolver = 'Volver', children }) {
  return (
    <header className="encabezado">
      <div>
        {onVolver && (
          <button type="button" className="migas no-imprimir" onClick={onVolver}>
            <ArrowLeft size={15} aria-hidden /> {textoVolver}
          </button>
        )}
        <h1>{titulo}</h1>
        {descripcion && <p className="encabezado-descripcion">{descripcion}</p>}
      </div>
      {children && <div className="encabezado-acciones no-imprimir">{children}</div>}
    </header>
  )
}

export function EstadoVacio({ icono: Icono, titulo, descripcion, children }) {
  return (
    <div className="vacio">
      {Icono && (
        <div className="vacio-icono">
          <Icono size={24} aria-hidden />
        </div>
      )}
      <h3>{titulo}</h3>
      {descripcion && <p>{descripcion}</p>}
      {children}
    </div>
  )
}

// Filas "esqueleto" mientras cargan los datos de una tabla
export function FilasCargando({ columnas, filas = 4 }) {
  return Array.from({ length: filas }, (_, i) => (
    <tr key={i} aria-hidden>
      {Array.from({ length: columnas }, (_, j) => (
        <td key={j}>
          <span className="esqueleto" style={{ width: `${50 + ((i + j) % 3) * 20}%` }} />
        </td>
      ))}
    </tr>
  ))
}

export function Cargando({ texto = 'Cargando…' }) {
  return (
    <span className="acciones">
      <LoaderCircle size={16} className="girando" aria-hidden /> {texto}
    </span>
  )
}

export function Aviso({ tipo = 'info', children }) {
  const Icono = tipo === 'info' ? Info : TriangleAlert
  return (
    <div className={`aviso aviso-${tipo}`} role={tipo === 'error' ? 'alert' : undefined}>
      <Icono size={17} aria-hidden />
      <div>{children}</div>
    </div>
  )
}

export function CampoGrupo({ etiqueta, requerido, ayuda, error, htmlFor, children }) {
  return (
    <div className="campo-grupo">
      <label className="campo-etiqueta" htmlFor={htmlFor}>
        {etiqueta}
        {requerido && (
          <span className="requerido" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {error ? <span className="error-campo">{error}</span> : ayuda && <span className="ayuda">{ayuda}</span>}
    </div>
  )
}

export function MedidorCapacidad({ usado, capacidad, etiqueta = 'Peso', unidad = 'kg', decimales = 2 }) {
  const porcentaje = capacidad ? (usado / capacidad) * 100 : 0
  const clase = porcentaje > 100 ? 'excedido' : porcentaje > 85 ? 'alto' : ''
  const fmt = (n) => Number(n.toFixed(decimales)).toLocaleString('es-PE')
  return (
    <div className={`medidor ${clase}`}>
      <div className="medidor-texto">
        <span>{etiqueta}</span>
        <strong className="num">
          {fmt(usado)} / {fmt(capacidad)} {unidad} ({Math.round(porcentaje)} %)
        </strong>
      </div>
      <div
        className="medidor-barra"
        role="progressbar"
        aria-label={`Uso de ${etiqueta.toLowerCase()} del vehículo`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(100, Math.round(porcentaje))}
      >
        <div className="medidor-relleno" style={{ width: `${Math.min(100, porcentaje)}%` }} />
      </div>
      {porcentaje > 100 && <span className="error-campo">Supera {etiqueta === 'Peso' ? 'el peso máximo' : 'el volumen útil'} del vehículo.</span>}
    </div>
  )
}

// Avisos flotantes: los de éxito se cierran solos; los errores quedan hasta cerrarlos.
// onCerrar(id) debe ser estable (useCallback) para no reiniciar el temporizador.
export function Toasts({ avisos, onCerrar }) {
  return (
    <div className="toasts" aria-live="polite">
      {avisos.map((a) => (
        <Toast key={a.id} aviso={a} onCerrar={onCerrar} />
      ))}
    </div>
  )
}

function Toast({ aviso, onCerrar }) {
  useEffect(() => {
    if (aviso.tipo === 'error') return
    const t = setTimeout(() => onCerrar(aviso.id), 4000)
    return () => clearTimeout(t)
  }, [aviso.id, aviso.tipo, onCerrar])

  return (
    <div className={`toast toast-${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>
      {aviso.tipo === 'error' ? <TriangleAlert size={18} aria-hidden /> : <CircleCheck size={18} aria-hidden />}
      <p>{aviso.texto}</p>
      <button type="button" onClick={() => onCerrar(aviso.id)} aria-label="Cerrar aviso">
        <X size={16} />
      </button>
    </div>
  )
}

// Diálogo de confirmación accesible (<dialog> nativo: foco atrapado y tecla Esc)
export function DialogoConfirmacion({ solicitud, onResponder }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialogo = ref.current
    if (solicitud && !dialogo.open) dialogo.showModal()
    if (!solicitud && dialogo.open) dialogo.close()
  }, [solicitud])

  return (
    <dialog ref={ref} className="dialogo" onCancel={() => onResponder(false)} aria-labelledby="dialogo-titulo">
      {solicitud && (
        <>
          <div className="dialogo-cuerpo">
            <div className={`indicador-icono ${solicitud.peligro ? 'tono-rojo' : 'tono-azul'}`}>
              <TriangleAlert size={20} aria-hidden />
            </div>
            <div>
              <h2 id="dialogo-titulo">{solicitud.titulo}</h2>
              <p>{solicitud.mensaje}</p>
            </div>
          </div>
          <div className="barra-acciones">
            <button type="button" className="boton boton-secundario" onClick={() => onResponder(false)} autoFocus>
              {solicitud.textoCancelar ?? 'Volver'}
            </button>
            <button
              type="button"
              className={`boton ${solicitud.peligro ? 'boton-peligro-solido' : 'boton-primario'}`}
              onClick={() => onResponder(true)}
            >
              {solicitud.textoConfirmar ?? 'Confirmar'}
            </button>
          </div>
        </>
      )}
    </dialog>
  )
}
