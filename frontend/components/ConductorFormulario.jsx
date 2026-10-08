import { useState } from 'react'
import { Cargando, CampoGrupo } from './ui.jsx'

// Mismas reglas que la API (backend/src/schemas/esquemas.js)
const PATRON_DNI = /^\d{8}$/
const PATRON_TELEFONO = /^\+?\d{6,14}$/
const PATRON_LICENCIA = /^[A-Z0-9-]{5,15}$/

const desdeConductor = (c) => ({
  nombre: c?.nombre ?? '',
  dni: c?.dni ?? '',
  telefono: c?.telefono ?? '',
  licencia: c?.licencia ?? '',
})

export function ConductorFormulario({ conductorInicial, onGuardar, onCancelar, guardando }) {
  const [form, setForm] = useState(() => desdeConductor(conductorInicial))
  const [tocado, setTocado] = useState({})
  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))
  const tocar = (campo) => () => setTocado((t) => ({ ...t, [campo]: true }))

  const limpio = {
    nombre: form.nombre.trim(),
    dni: form.dni.trim(),
    telefono: form.telefono.replace(/\s/g, ''),
    licencia: form.licencia.trim().toUpperCase(),
  }
  const errores = {
    nombre: limpio.nombre.length < 3 ? 'Escribe el nombre completo (al menos 3 caracteres).' : null,
    dni: !PATRON_DNI.test(limpio.dni) ? 'El DNI debe tener 8 dígitos.' : null,
    telefono: limpio.telefono && !PATRON_TELEFONO.test(limpio.telefono) ? 'Solo dígitos (6 a 14), con + opcional al inicio.' : null,
    licencia: limpio.licencia && !PATRON_LICENCIA.test(limpio.licencia) ? 'De 5 a 15 letras, dígitos o guiones (ej. Q45678912).' : null,
  }
  const error = (campo) => (tocado[campo] ? errores[campo] : null)

  const enviar = (e) => {
    e.preventDefault()
    setTocado({ nombre: true, dni: true, telefono: true, licencia: true })
    if (Object.values(errores).some(Boolean)) return
    onGuardar({ ...limpio, telefono: limpio.telefono || null, licencia: limpio.licencia || null })
  }

  return (
    <form className="tarjeta" onSubmit={enviar} noValidate>
      <div className="tarjeta-cuerpo formulario">
        <fieldset className="seccion-form">
          <legend>
            Datos del conductor
            <small>Solo un conductor activo y sin otra ruta en el mismo horario puede recibir una ruta.</small>
          </legend>
          <div className="campos">
            <CampoGrupo etiqueta="Nombre completo" requerido htmlFor="nombre" error={error('nombre')}>
              <input
                id="nombre"
                className="campo"
                placeholder="Juan Quispe Huamán"
                value={form.nombre}
                onChange={cambiar('nombre')}
                onBlur={tocar('nombre')}
                aria-invalid={Boolean(error('nombre'))}
                maxLength={120}
                autoComplete="off"
                required
              />
            </CampoGrupo>
            <CampoGrupo etiqueta="DNI" requerido htmlFor="dni" error={error('dni')} ayuda="8 dígitos">
              <input
                id="dni"
                className="campo num"
                inputMode="numeric"
                placeholder="45678912"
                value={form.dni}
                onChange={cambiar('dni')}
                onBlur={tocar('dni')}
                aria-invalid={Boolean(error('dni'))}
                maxLength={8}
                required
              />
            </CampoGrupo>
            <CampoGrupo etiqueta="Teléfono" htmlFor="telefono" error={error('telefono')} ayuda="Opcional. Para coordinar el reparto.">
              <input
                id="telefono"
                className="campo num"
                type="tel"
                placeholder="964 123 456"
                value={form.telefono}
                onChange={cambiar('telefono')}
                onBlur={tocar('telefono')}
                aria-invalid={Boolean(error('telefono'))}
                maxLength={18}
              />
            </CampoGrupo>
            <CampoGrupo etiqueta="Licencia de conducir" htmlFor="licencia" error={error('licencia')} ayuda="Opcional. Número del brevete.">
              <input
                id="licencia"
                className="campo num"
                placeholder="Q45678912"
                value={form.licencia}
                onChange={cambiar('licencia')}
                onBlur={tocar('licencia')}
                aria-invalid={Boolean(error('licencia'))}
                maxLength={15}
                style={{ textTransform: 'uppercase' }}
              />
            </CampoGrupo>
          </div>
        </fieldset>
      </div>
      <div className="barra-acciones">
        <button type="button" className="boton boton-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="boton boton-primario" disabled={guardando}>
          {guardando ? <Cargando texto="Guardando…" /> : conductorInicial ? 'Guardar cambios' : 'Registrar conductor'}
        </button>
      </div>
    </form>
  )
}
