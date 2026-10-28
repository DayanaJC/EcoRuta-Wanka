import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../services/api.js'
import { ClienteDetalle } from '../ClienteDetalle.jsx'
import { ClienteFormulario } from '../ClienteFormulario.jsx'
import { ClienteLista } from '../ClienteLista.jsx'
import { navegar } from '../navegacion.js'
import { EncabezadoPagina, EstadoVacio } from '../ui.jsx'

const ir = (accion, id) => navegar({ vista: 'clientes', accion, id })

// Clientes/bodegas (RF-09): registro de sus preferencias de entrega
export function Clientes({ ubicacion, datos, cargando, recargar, notificar, confirmar }) {
  const [ocupado, setOcupado] = useState(false)
  const { accion, id } = ubicacion
  const cliente = id ? datos.clientes.find((c) => c.id === id) : null

  const ejecutar = async (tarea, mensaje) => {
    setOcupado(true)
    try {
      const r = await tarea()
      notificar('exito', mensaje)
      await recargar('clientes')
      return r
    } catch (e) {
      notificar('error', e.message)
      return null
    } finally {
      setOcupado(false)
    }
  }

  const guardar = async (datosForm) => {
    const r = cliente
      ? await ejecutar(() => api.actualizarCliente(cliente.id, datosForm), 'Preferencias del cliente actualizadas.')
      : await ejecutar(() => api.crearCliente(datosForm), `Cliente ${datosForm.nombre} registrado.`)
    if (r) navegar({ vista: 'clientes', accion: 'ver', id: r.id }, { reemplazar: true })
  }

  const cambiarEstado = async (estado) => {
    if (estado === 'inactivo') {
      const ok = await confirmar({
        titulo: `Desactivar a ${cliente.nombre}`,
        mensaje: 'Sus preferencias dejarán de aplicarse al planificar rutas. Podrás reactivarlo cuando quieras.',
        textoConfirmar: 'Desactivar',
        peligro: true,
      })
      if (!ok) return
    }
    await ejecutar(() => api.cambiarEstadoCliente(cliente.id, estado), estado === 'activo' ? 'Cliente reactivado.' : 'Cliente desactivado.')
  }

  if ((accion === 'ver' || accion === 'editar') && !cliente) {
    return (
      <>
        <EncabezadoPagina titulo="Cliente" onVolver={() => ir()} textoVolver="Clientes" />
        <div className="tarjeta">
          {cargando ? (
            <div className="tarjeta-cuerpo">
              <span className="esqueleto" style={{ width: '40%' }} />
            </div>
          ) : (
            <EstadoVacio titulo="Cliente no encontrado" />
          )}
        </div>
      </>
    )
  }

  if (accion === 'nuevo' || accion === 'editar') {
    return (
      <>
        <EncabezadoPagina
          titulo={cliente ? `Editar a ${cliente.nombre}` : 'Registrar cliente'}
          descripcion="Los campos marcados con * son obligatorios."
          onVolver={() => window.history.back()}
          textoVolver="Volver"
        />
        <ClienteFormulario
          key={cliente?.id ?? 'nuevo'}
          clienteInicial={cliente}
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
        <EncabezadoPagina titulo={cliente.nombre} descripcion={`${cliente.codigo} · ${cliente.direccion}`} onVolver={() => ir()} textoVolver="Clientes">
          <button type="button" className="boton boton-secundario" onClick={() => ir('editar', cliente.id)}>
            <Pencil size={16} aria-hidden /> Editar preferencias
          </button>
        </EncabezadoPagina>
        <ClienteDetalle
          cliente={cliente}
          pedidos={datos.pedidos.filter((p) => p.cliente_id === cliente.codigo)}
          onCambiarEstado={cambiarEstado}
          gestionando={ocupado}
        />
      </>
    )
  }

  return (
    <>
      <EncabezadoPagina titulo="Clientes" descripcion="Bodegas y comercios con sus días y horario de recepción.">
        <button type="button" className="boton boton-primario" onClick={() => ir('nuevo')}>
          <Plus size={17} aria-hidden /> Registrar cliente
        </button>
      </EncabezadoPagina>
      <ClienteLista
        clientes={datos.clientes}
        pedidos={datos.pedidos}
        cargando={cargando}
        onNuevo={() => ir('nuevo')}
        onVer={(c) => ir('ver', c.id)}
        onEditar={(c) => ir('editar', c.id)}
      />
    </>
  )
}
