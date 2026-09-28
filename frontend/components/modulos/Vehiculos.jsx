import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../services/api.js'
import { ETIQUETAS_TIPO_VEHICULO } from '../../utils/formatos.js'
import { navegar } from '../navegacion.js'
import { EncabezadoPagina, EstadoVacio } from '../ui.jsx'
import { VehiculoDetalle } from '../VehiculoDetalle.jsx'
import { VehiculoFormulario } from '../VehiculoFormulario.jsx'
import { VehiculoLista } from '../VehiculoLista.jsx'

const ir = (accion, id) => navegar({ vista: 'vehiculos', accion, id })

export function Vehiculos({ ubicacion, datos, cargando, recargar, notificar, confirmar }) {
  const [ocupado, setOcupado] = useState(false)
  const { accion, id } = ubicacion
  const vehiculo = id ? datos.vehiculos.find((v) => v.id === id) : null

  const ejecutar = async (tarea, mensaje) => {
    setOcupado(true)
    try {
      const r = await tarea()
      notificar('exito', mensaje)
      await recargar('vehiculos')
      return r
    } catch (e) {
      notificar('error', e.message)
      return null
    } finally {
      setOcupado(false)
    }
  }

  const guardar = async (datosForm) => {
    const r = vehiculo
      ? await ejecutar(() => api.actualizarVehiculo(vehiculo.id, datosForm), 'Vehículo actualizado.')
      : await ejecutar(() => api.crearVehiculo(datosForm), `Vehículo ${datosForm.placa} registrado.`)
    if (r) navegar({ vista: 'vehiculos', accion: 'ver', id: r.id }, { reemplazar: true })
  }

  const cambiarEstado = async (estado) => {
    if (estado === 'inactivo') {
      const ok = await confirmar({
        titulo: `Desactivar ${vehiculo.placa}`,
        mensaje: 'El vehículo dejará de estar disponible para rutas nuevas. Podrás reactivarlo cuando quieras.',
        textoConfirmar: 'Desactivar',
        peligro: true,
      })
      if (!ok) return
    }
    await ejecutar(() => api.cambiarEstadoVehiculo(vehiculo.id, estado), estado === 'activo' ? 'Vehículo reactivado.' : 'Vehículo desactivado.')
  }

  if ((accion === 'ver' || accion === 'editar') && !vehiculo) {
    return (
      <>
        <EncabezadoPagina titulo="Vehículo" onVolver={() => ir()} textoVolver="Vehículos" />
        <div className="tarjeta">
          {cargando ? (
            <div className="tarjeta-cuerpo">
              <span className="esqueleto" style={{ width: '40%' }} />
            </div>
          ) : (
            <EstadoVacio titulo="Vehículo no encontrado" />
          )}
        </div>
      </>
    )
  }

  if (accion === 'nuevo' || accion === 'editar') {
    return (
      <>
        <EncabezadoPagina
          titulo={vehiculo ? `Editar ${vehiculo.placa}` : 'Registrar vehículo'}
          descripcion="Los campos marcados con * son obligatorios."
          onVolver={() => window.history.back()}
          textoVolver="Volver"
        />
        <VehiculoFormulario key={vehiculo?.id ?? 'nuevo'} vehiculoInicial={vehiculo} onGuardar={guardar} onCancelar={() => window.history.back()} guardando={ocupado} />
      </>
    )
  }

  if (accion === 'ver') {
    return (
      <>
        <EncabezadoPagina titulo={vehiculo.placa} descripcion={ETIQUETAS_TIPO_VEHICULO[vehiculo.tipo]} onVolver={() => ir()} textoVolver="Vehículos">
          <button type="button" className="boton boton-secundario" onClick={() => ir('editar', vehiculo.id)}>
            <Pencil size={16} aria-hidden /> Editar
          </button>
        </EncabezadoPagina>
        <VehiculoDetalle
          vehiculo={vehiculo}
          rutas={datos.rutas.filter((r) => r.vehiculo_id === vehiculo.id)}
          onCambiarEstado={cambiarEstado}
          gestionando={ocupado}
        />
      </>
    )
  }

  return (
    <>
      <EncabezadoPagina titulo="Vehículos" descripcion="Flota de reparto: camionetas, furgones y motos.">
        <button type="button" className="boton boton-primario" onClick={() => ir('nuevo')}>
          <Plus size={17} aria-hidden /> Registrar vehículo
        </button>
      </EncabezadoPagina>
      <VehiculoLista
        vehiculos={datos.vehiculos}
        cargando={cargando}
        onNuevo={() => ir('nuevo')}
        onVer={(v) => ir('ver', v.id)}
        onEditar={(v) => ir('editar', v.id)}
      />
    </>
  )
}
