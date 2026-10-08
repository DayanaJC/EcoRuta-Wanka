import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../services/api.js'
import { ConductorDetalle } from '../ConductorDetalle.jsx'
import { ConductorFormulario } from '../ConductorFormulario.jsx'
import { ConductorLista } from '../ConductorLista.jsx'
import { navegar } from '../navegacion.js'
import { EncabezadoPagina, EstadoVacio } from '../ui.jsx'

const ir = (accion, id) => navegar({ vista: 'conductores', accion, id })

// Conductores (RF-08): registro y consulta; la asignación se hace desde la ruta
export function Conductores({ ubicacion, datos, cargando, recargar, notificar, confirmar }) {
  const [ocupado, setOcupado] = useState(false)
  const { accion, id } = ubicacion
  const conductor = id ? datos.conductores.find((c) => c.id === id) : null
  const vehiculosPorId = Object.fromEntries(datos.vehiculos.map((v) => [v.id, v]))

  const ejecutar = async (tarea, mensaje) => {
    setOcupado(true)
    try {
      const r = await tarea()
      notificar('exito', mensaje)
      await recargar('conductores')
      return r
    } catch (e) {
      notificar('error', e.message)
      return null
    } finally {
      setOcupado(false)
    }
  }

  const guardar = async (datosForm) => {
    const r = conductor
      ? await ejecutar(() => api.actualizarConductor(conductor.id, datosForm), 'Conductor actualizado.')
      : await ejecutar(() => api.crearConductor(datosForm), `Conductor ${datosForm.nombre} registrado.`)
    if (r) navegar({ vista: 'conductores', accion: 'ver', id: r.id }, { reemplazar: true })
  }

  const cambiarEstado = async (estado) => {
    if (estado === 'inactivo') {
      const ok = await confirmar({
        titulo: `Desactivar a ${conductor.nombre}`,
        mensaje: 'No podrá recibir rutas nuevas. Podrás reactivarlo cuando quieras.',
        textoConfirmar: 'Desactivar',
        peligro: true,
      })
      if (!ok) return
    }
    await ejecutar(() => api.cambiarEstadoConductor(conductor.id, estado), estado === 'activo' ? 'Conductor reactivado.' : 'Conductor desactivado.')
  }

  if ((accion === 'ver' || accion === 'editar') && !conductor) {
    return (
      <>
        <EncabezadoPagina titulo="Conductor" onVolver={() => ir()} textoVolver="Conductores" />
        <div className="tarjeta">
          {cargando ? (
            <div className="tarjeta-cuerpo">
              <span className="esqueleto" style={{ width: '40%' }} />
            </div>
          ) : (
            <EstadoVacio titulo="Conductor no encontrado" />
          )}
        </div>
      </>
    )
  }

  if (accion === 'nuevo' || accion === 'editar') {
    return (
      <>
        <EncabezadoPagina
          titulo={conductor ? `Editar a ${conductor.nombre}` : 'Registrar conductor'}
          descripcion="Los campos marcados con * son obligatorios."
          onVolver={() => window.history.back()}
          textoVolver="Volver"
        />
        <ConductorFormulario
          key={conductor?.id ?? 'nuevo'}
          conductorInicial={conductor}
          onGuardar={guardar}
          onCancelar={() => window.history.back()}
          guardando={ocupado}
        />
      </>
    )
  }

  if (accion === 'ver') {
    return (
      <>
        <EncabezadoPagina titulo={conductor.nombre} descripcion={`DNI ${conductor.dni}`} onVolver={() => ir()} textoVolver="Conductores">
          <button type="button" className="boton boton-secundario" onClick={() => ir('editar', conductor.id)}>
            <Pencil size={16} aria-hidden /> Editar
          </button>
        </EncabezadoPagina>
        <ConductorDetalle
          conductor={conductor}
          rutas={datos.rutas.filter((r) => r.conductor_id === conductor.id)}
          vehiculosPorId={vehiculosPorId}
          onCambiarEstado={cambiarEstado}
          gestionando={ocupado}
        />
      </>
    )
  }

  return (
    <>
      <EncabezadoPagina titulo="Conductores" descripcion="Personal de reparto y sus rutas asignadas.">
        <button type="button" className="boton boton-primario" onClick={() => ir('nuevo')}>
          <Plus size={17} aria-hidden /> Registrar conductor
        </button>
      </EncabezadoPagina>
      <ConductorLista
        conductores={datos.conductores}
        rutas={datos.rutas}
        vehiculosPorId={vehiculosPorId}
        cargando={cargando}
        onNuevo={() => ir('nuevo')}
        onVer={(c) => ir('ver', c.id)}
        onEditar={(c) => ir('editar', c.id)}
      />
    </>
  )
}
