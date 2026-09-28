// Editor de los bultos de un pedido: medidas (cm), peso por bulto y cantidad.
// El peso y el volumen del pedido se calculan a partir de estas filas.

import { Plus, Trash2 } from 'lucide-react'
import { totalesBultos, volumenBultoM3 } from '../utils/carga.js'
import { formatearNumero } from '../utils/formatos.js'

// Atajos con medidas típicas (el operador puede ajustarlas)
const PLANTILLAS = [
  { descripcion: 'Caja pequeña', largo_cm: 30, ancho_cm: 20, alto_cm: 15, peso_kg: 5 },
  { descripcion: 'Caja mediana', largo_cm: 50, ancho_cm: 40, alto_cm: 30, peso_kg: 12 },
  { descripcion: 'Saco', largo_cm: 80, ancho_cm: 50, alto_cm: 20, peso_kg: 50 },
  { descripcion: 'Colchón 2 plazas', largo_cm: 190, ancho_cm: 135, alto_cm: 25, peso_kg: 40, apilable: false },
]

export const bultoVacio = () => ({ descripcion: '', cantidad: 1, largo_cm: '', ancho_cm: '', alto_cm: '', peso_kg: '', apilable: true })

export function EditorBultos({ bultos, onChange }) {
  const cambiar = (i, campo, valor) => onChange(bultos.map((b, j) => (j === i ? { ...b, [campo]: valor } : b)))
  const quitar = (i) => onChange(bultos.filter((_, j) => j !== i))
  const agregar = (plantilla) => {
    const nuevo = { ...bultoVacio(), ...plantilla }
    // Si solo hay una fila vacía, se reemplaza en lugar de acumular filas vacías
    const soloVacia = bultos.length === 1 && !bultos[0].descripcion && !bultos[0].largo_cm
    onChange(soloVacia ? [nuevo] : [...bultos, nuevo])
  }
  const totales = totalesBultos(bultos)

  return (
    <div className="pila">
      <div className="tabla-envoltorio">
        <table className="tabla tabla-bultos">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cant.</th>
              <th>Largo</th>
              <th>Ancho</th>
              <th>Alto</th>
              <th>Peso c/u</th>
              <th title="¿Admite carga encima?">Apilable</th>
              <th>Volumen</th>
              <th>
                <span className="sr-only">Quitar</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {bultos.map((b, i) => {
              const vol = volumenBultoM3(b) * Number(b.cantidad || 0)
              const campo = (nombre, props = {}) => (
                <input
                  className="campo"
                  type="number"
                  step="any"
                  min="0.1"
                  max="2000"
                  value={b[nombre]}
                  onChange={(e) => cambiar(i, nombre, e.target.value)}
                  aria-label={`${nombre.replace('_cm', ' (cm)').replace('_kg', ' (kg)')} del bulto ${i + 1}`}
                  required
                  {...props}
                />
              )
              return (
                <tr key={i}>
                  <td data-etiqueta="Descripción">
                    <input
                      className="campo"
                      placeholder="Caja de clavos"
                      value={b.descripcion}
                      onChange={(e) => cambiar(i, 'descripcion', e.target.value)}
                      aria-label={`Descripción del bulto ${i + 1}`}
                      minLength={2}
                      required
                    />
                  </td>
                  <td data-etiqueta="Cantidad">{campo('cantidad', { step: 1, min: 1, max: 999 })}</td>
                  <td data-etiqueta="Largo (cm)">{campo('largo_cm')}</td>
                  <td data-etiqueta="Ancho (cm)">{campo('ancho_cm')}</td>
                  <td data-etiqueta="Alto (cm)">{campo('alto_cm')}</td>
                  <td data-etiqueta="Peso c/u (kg)">{campo('peso_kg', { max: 5000, min: 0.01 })}</td>
                  <td data-etiqueta="Apilable">
                    <input type="checkbox" checked={b.apilable} onChange={(e) => cambiar(i, 'apilable', e.target.checked)} aria-label={`Bulto ${i + 1} apilable`} />
                  </td>
                  <td data-etiqueta="Volumen" className="num texto-secundario">
                    {vol ? `${formatearNumero(Number(vol.toFixed(3)))} m³` : '—'}
                  </td>
                  <td className="col-acciones">
                    <button
                      type="button"
                      className="boton boton-fantasma boton-icono"
                      onClick={() => quitar(i)}
                      disabled={bultos.length === 1}
                      aria-label={`Quitar bulto ${i + 1}`}
                      title="Quitar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="acciones">
        <button type="button" className="boton boton-secundario boton-sm" onClick={() => agregar()}>
          <Plus size={15} aria-hidden /> Agregar bulto
        </button>
        <span className="ayuda">Atajos:</span>
        {PLANTILLAS.map((p) => (
          <button key={p.descripcion} type="button" className="boton boton-fantasma boton-sm" onClick={() => agregar(p)}>
            {p.descripcion}
          </button>
        ))}
      </div>

      <div className="totales-bultos num">
        <span>
          <strong>{totales.unidades}</strong> bulto(s)
        </span>
        <span>
          Peso total <strong>{formatearNumero(Number(totales.peso_kg.toFixed(2)))} kg</strong>
        </span>
        <span>
          Volumen total <strong>{formatearNumero(Number(totales.volumen_m3.toFixed(3)))} m³</strong>
        </span>
      </div>
    </div>
  )
}
