import { useState } from 'react'
import { ETIQUETAS_PRIORIDAD, ETIQUETAS_TIPO } from '../utils/formatos.js'

const FORM_VACIO = {
  cliente_id: '',
  cliente_nombre: '',
  direccion: '',
  punto_referencia: '',
  latitud: '',
  longitud: '',
  peso_kg: '',
  volumen_m3: '',
  ventana_entrega_inicio: '',
  ventana_entrega_fin: '',
  prioridad: 'estandar',
  tipo_producto: 'no_perecedero',
}

const OPCIONES_PRIORIDAD = Object.entries(ETIQUETAS_PRIORIDAD).map(([valor, etiqueta]) => ({
  valor,
  etiqueta,
}))
const OPCIONES_TIPO = Object.entries(ETIQUETAS_TIPO).map(([valor, etiqueta]) => ({
  valor,
  etiqueta,
}))

function estadoInicial(pedidoInicial) {
  if (!pedidoInicial) return FORM_VACIO
  return {
    cliente_id: pedidoInicial.cliente_id,
    cliente_nombre: pedidoInicial.cliente_nombre,
    direccion: pedidoInicial.direccion,
    punto_referencia: pedidoInicial.punto_referencia || '',
    latitud: String(pedidoInicial.latitud),
    longitud: String(pedidoInicial.longitud),
    peso_kg: String(pedidoInicial.peso_kg),
    volumen_m3: String(pedidoInicial.volumen_m3),
    ventana_entrega_inicio: pedidoInicial.ventana_entrega_inicio,
    ventana_entrega_fin: pedidoInicial.ventana_entrega_fin,
    prioridad: pedidoInicial.prioridad,
    tipo_producto: pedidoInicial.tipo_producto,
  }
}

export function PedidoFormulario({ modo, pedidoInicial, onGuardar, onVolver, guardando }) {
  const [form, setForm] = useState(() => estadoInicial(pedidoInicial))

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const enviar = (e) => {
    e.preventDefault()
    onGuardar({
      cliente_id: form.cliente_id.trim(),
      cliente_nombre: form.cliente_nombre.trim(),
      direccion: form.direccion.trim(),
      punto_referencia: form.punto_referencia.trim(),
      latitud: Number(form.latitud),
      longitud: Number(form.longitud),
      peso_kg: Number(form.peso_kg),
      volumen_m3: Number(form.volumen_m3),
      ventana_entrega_inicio: form.ventana_entrega_inicio,
      ventana_entrega_fin: form.ventana_entrega_fin,
      prioridad: form.prioridad,
      tipo_producto: form.tipo_producto,
    })
  }

  return (
    <section className="panel">
      <div className="panel-cabecera">
        <h2>{modo === 'editar' ? 'Editar pedido' : 'Registrar pedido'}</h2>
        <button className="boton boton-secundario" type="button" onClick={onVolver}>
          ← Volver
        </button>
      </div>

      <form className="formulario" onSubmit={enviar}>
        <div className="grupo-campos">
          <label className="campo-etiqueta">
            Cliente (ID)
            <input
              className="campo"
              type="text"
              placeholder="CLI-0001"
              value={form.cliente_id}
              onChange={cambiar('cliente_id')}
              required
            />
          </label>
          <label className="campo-etiqueta">
            Nombre del cliente
            <input
              className="campo"
              type="text"
              placeholder="Comercial Huancayo"
              value={form.cliente_nombre}
              onChange={cambiar('cliente_nombre')}
              required
            />
          </label>
        </div>

        <label className="campo-etiqueta">
          Dirección de entrega
          <input
            className="campo"
            type="text"
            placeholder="Av. Giraldez 1234, El Tambo"
            value={form.direccion}
            onChange={cambiar('direccion')}
            required
          />
        </label>
        <label className="campo-etiqueta">
          Punto de referencia (opcional)
          <input
            className="campo"
            type="text"
            placeholder="Frente al mercado. útil en zonas de Huancayo sin direcciones estandarizadas"
            value={form.punto_referencia}
            onChange={cambiar('punto_referencia')}
          />
        </label>

        <div className="grupo-campos">
          <label className="campo-etiqueta">
            Latitud (GPS)
            <input
              className="campo"
              type="number"
              step="any"
              placeholder="Ej. -12.0664 (Huancayo)"
              value={form.latitud}
              onChange={cambiar('latitud')}
              required
            />
          </label>
          <label className="campo-etiqueta">
            Longitud (GPS)
            <input
              className="campo"
              type="number"
              step="any"
              placeholder="Ej. -75.2089 (Huancayo)"
              value={form.longitud}
              onChange={cambiar('longitud')}
              required
            />
          </label>
        </div>

        <div className="grupo-campos">
          <label className="campo-etiqueta">
            Peso (kg)
            <input
              className="campo"
              type="number"
              step="any"
              min="0"
              placeholder="25"
              value={form.peso_kg}
              onChange={cambiar('peso_kg')}
              required
            />
          </label>
          <label className="campo-etiqueta">
            Volumen (m³)
            <input
              className="campo"
              type="number"
              step="any"
              min="0"
              placeholder="0.4"
              value={form.volumen_m3}
              onChange={cambiar('volumen_m3')}
              required
            />
          </label>
        </div>

        <div className="grupo-campos">
          <label className="campo-etiqueta">
            Inicio de ventana de entrega
            <input
              className="campo"
              type="time"
              value={form.ventana_entrega_inicio}
              onChange={cambiar('ventana_entrega_inicio')}
              required
            />
          </label>
          <label className="campo-etiqueta">
            Fin de ventana de entrega
            <input
              className="campo"
              type="time"
              value={form.ventana_entrega_fin}
              onChange={cambiar('ventana_entrega_fin')}
              required
            />
          </label>
        </div>

        <div className="grupo-campos">
          <label className="campo-etiqueta">
            Prioridad
            <select className="campo" value={form.prioridad} onChange={cambiar('prioridad')}>
              {OPCIONES_PRIORIDAD.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </option>
              ))}
            </select>
          </label>
          <label className="campo-etiqueta">
            Tipo de producto
            <select className="campo" value={form.tipo_producto} onChange={cambiar('tipo_producto')}>
              {OPCIONES_TIPO.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.etiqueta}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="acciones-formulario">
          <button className="boton boton-primario" type="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : modo === 'editar' ? 'Guardar cambios' : 'Registrar pedido'}
          </button>
          <button className="boton boton-secundario" type="button" onClick={onVolver} disabled={guardando}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}