import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../services/api.js'
import { ESTADOS_TERMINALES_PEDIDO } from '../../utils/formatos.js'
import { navegar } from '../navegacion.js'
import { PedidoDetalle } from '../PedidoDetalle.jsx'
import { PedidoFormulario } from '../PedidoFormulario.jsx'
import { PedidoLista } from '../PedidoLista.jsx'
import { EncabezadoPagina, EstadoVacio } from '../ui.jsx'

const ir = (accion, id) => navegar({ vista: 'pedidos', accion, id })

export function Pedidos({ ubicacion, datos, cargando, recargar, notificar, confirmar }) {
  const [ocupado, setOcupado] = useState(false)
  const { accion, id } = ubicacion
  const pedido = id ? datos.pedidos.find((p) => p.id === id) : null

  const ejecutar = async (tarea, mensaje) => {
    setOcupado(true)
    try {
      const resultado = await tarea()
      notificar('exito', mensaje)
      await recargar('pedidos', 'asignaciones')
      return resultado
    } catch (e) {
      notificar('error', e.message)
      return null
    } finally {
      setOcupado(false)
    }
  }

  const guardar = async (datosForm) => {
    const r = pedido
      ? await ejecutar(() => api.actualizarPedido(pedido.id, datosForm), 'Pedido actualizado.')
      : await ejecutar(() => api.crearPedido(datosForm), 'Pedido registrado.')
    if (r) navegar({ vista: 'pedidos', accion: 'ver', id: r.id }, { reemplazar: true })
  }


  const cancelar = async (p) => {
    const ok = await confirmar({
      titulo: 'Cancelar pedido',
      mensaje: `El pedido de ${p.cliente_nombre} quedará cancelado y no podrá incluirse en rutas. Esta acción no se puede deshacer.`,
      textoConfirmar: 'Cancelar pedido',
      textoCancelar: 'Mantener',
      peligro: true,
    })
    if (ok) await ejecutar(() => api.cancelarPedido(p.id), 'Pedido cancelado.')
  }

  if ((accion === 'ver' || accion === 'editar') && !pedido) {
    return (
      <>
        <EncabezadoPagina titulo="Pedido" onVolver={() => ir()} textoVolver="Pedidos" />
        <div className="tarjeta">
          {cargando ? (
            <div className="tarjeta-cuerpo">
              <span className="esqueleto" style={{ width: '40%' }} />
            </div>
          ) : (
            <EstadoVacio titulo="Pedido no encontrado" descripcion="Es posible que el enlace sea antiguo o que el pedido se haya eliminado." />
          )}
        </div>
      </>
    )
  }

  if (accion === 'nuevo' || accion === 'editar') {
    return (
      <>
        <EncabezadoPagina
          titulo={pedido ? 'Editar pedido' : 'Registrar pedido'}
          descripcion={pedido ? pedido.cliente_nombre : 'Los campos marcados con * son obligatorios.'}
          onVolver={() => (pedido ? ir('ver', pedido.id) : ir())}
          textoVolver={pedido ? 'Detalle del pedido' : 'Pedidos'}
        />
        <PedidoFormulario
          key={pedido?.id ?? 'nuevo'}
          pedidoInicial={pedido}
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
        <EncabezadoPagina titulo={pedido.cliente_nombre} descripcion={pedido.direccion} onVolver={() => ir()} textoVolver="Pedidos">
          {!ESTADOS_TERMINALES_PEDIDO.includes(pedido.estado) && (
            <button type="button" className="boton boton-secundario" onClick={() => ir('editar', pedido.id)}>
              <Pencil size={16} aria-hidden /> Editar
            </button>
          )}
        </EncabezadoPagina>
        <PedidoDetalle
          pedido={pedido}
          onCancelar={cancelar}
          gestionando={ocupado}
        />
      </>
    )
  }

  return (
    <>
      <EncabezadoPagina titulo="Pedidos" descripcion="Pedidos de reparto de bodegas, restaurantes, farmacias y comercios.">
        <button type="button" className="boton boton-primario" onClick={() => ir('nuevo')}>
          <Plus size={17} aria-hidden /> Nuevo pedido
        </button>
      </EncabezadoPagina>
      <PedidoLista
        pedidos={datos.pedidos}
        cargando={cargando}
        onNuevo={() => ir('nuevo')}
        onVer={(p) => ir('ver', p.id)}
        onEditar={(p) => ir('editar', p.id)}
        onCancelar={cancelar}
      />
    </>
  )
}
