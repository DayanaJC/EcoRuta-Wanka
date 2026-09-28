// Editor de los bultos de un pedido: medidas, peso por bulto y cantidad.
// Las medidas se pueden escribir en cm o en m; el pedido siempre se guarda en cm.
// El peso y el volumen del pedido se calculan a partir de estas filas.

import { Plus, Trash2 } from 'lucide-react'
import { totalesBultos, volumenBultoM3 } from '../utils/carga.js'
import { formatearNumero } from '../utils/formatos.js'

const MEDIDAS = ['largo_cm', 'ancho_cm', 'alto_cm']
const FACTOR_A_CM = { cm: 1, m: 100 }

// Atajos con medidas típicas en cm (el operador puede ajustarlas)
const PLANTILLAS = [
  { descripcion: 'Caja pequeña', largo_cm: 30, ancho_cm: 20, alto_cm: 15, peso_kg: 5 },
  { descripcion: 'Caja mediana', largo_cm: 50, ancho_cm: 40, alto_cm: 30, peso_kg: 12 },
  { descripcion: 'Saco', largo_cm: 80, ancho_cm: 50, alto_cm: 20, peso_kg: 50 },
  { descripcion: 'Colchón 2 plazas', largo_cm: 190, ancho_cm: 135, alto_cm: 25, peso_kg: 40, apilable: false },
]

export const bultoVacio = () => ({ descripcion: '', cantidad: 1, largo_cm: '', ancho_cm: '', alto_cm: '', peso_kg: '', apilable: true })

const redondear = (n, decimales) => Number(Number(n).toFixed(decimales))

/** Convierte las medidas de los bultos de una unidad a otra (los campos vacíos se mantienen vacíos) */
export function convertirMedidas(bultos, de, a) {
  if (de === a) return bultos
  const factor = FACTOR_A_CM[de] / FACTOR_A_CM[a]
  return bultos.map((b) => ({
    ...b,
    ...Object.fromEntries(MEDIDAS.map((m) => [m, b[m] === '' ? '' : String(redondear(b[m] * factor, a === 'm' ? 3 : 1))])),
  }))
}

export function EditorBultos({ bultos, unidad, onChange, onCambiarUnidad }) {
  const enCm = convertirMedidas(bultos, unidad, 'cm') // los cálculos siempre en cm
  const cambiar = (i, campo, valor) => onChange(bultos.map((b, j) => (j === i ? { ...b, [campo]: valor } : b)))
  const quitar = (i) => onChange(bultos.filter((_, j) => j !== i))
  const agregar = (plantilla) => {
    const nuevo = convertirMedidas([{ ...bultoVacio(), ...plantilla }], 'cm', unidad)[0]
    // Si solo hay una fila vacía, se reemplaza en lugar de acumular filas vacías
    const soloVacia = bultos.length === 1 && !bultos[0].descripcion && !bultos[0].largo_cm
    onChange(soloVacia ? [nuevo] : [...bultos, nuevo])
  }
  const totales = totalesBultos(enCm)
  const limites = unidad === 'm' ? { min: 0.001, max: 20 } : { min: 0.1, max: 2000 }

  // Campo numérico con la unidad escrita dentro
  const campo = (i, nombre, sufijo, props = {}) => (
    <div className="campo-unidad">
      <input
        className="campo"
        type="number"
        step="any"
        value={bultos[i][nombre]}
        onChange={(e) => cambiar(i, nombre, e.target.value)}
        required
        {...props}
      />
      <span>{sufijo}</span>
    </div>
  )

  return (
    <div className="pila">
      <div className="acciones" style={{ justifyContent: 'space-between', width: '100%', display: 'flex' }}>
        <span className="ayuda">Medidas de cada bulto; el peso es el de una unidad.</span>
        <div className="segmentos" role="group" aria-label="Unidad de las medidas">
          {['cm', 'm'].map((u) => (
            <button key={u} type="button" className="segmento" aria-pressed={unidad === u} onClick={() => onCambiarUnidad(u)}>
              Medidas en {u === 'cm' ? 'centímetros' : 'metros'}
            </button>
          ))}
        </div>
      </div>

      <div className="tabla-envoltorio">
        <table className="tabla tabla-bultos">
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Cantidad</th>
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
              const vol = volumenBultoM3(enCm[i]) * Number(b.cantidad || 0)
              const n = i + 1
              return (
                <tr key={i}>
                  <td data-etiqueta="Descripción">
                    <input
                      className="campo"
                      placeholder="Caja de clavos"
                      value={b.descripcion}
                      onChange={(e) => cambiar(i, 'descripcion', e.target.value)}
                      aria-label={`Descripción del bulto ${n}`}
                      minLength={2}
                      required
                    />
                  </td>
                  <td data-etiqueta="Cantidad">{campo(i, 'cantidad', 'und.', { step: 1, min: 1, max: 999, 'aria-label': `Cantidad del bulto ${n}` })}</td>
                  <td data-etiqueta="Largo">{campo(i, 'largo_cm', unidad, { ...limites, placeholder: unidad === 'm' ? '1.9' : '190', 'aria-label': `Largo del bulto ${n} en ${unidad}` })}</td>
                  <td data-etiqueta="Ancho">{campo(i, 'ancho_cm', unidad, { ...limites, placeholder: unidad === 'm' ? '1.35' : '135', 'aria-label': `Ancho del bulto ${n} en ${unidad}` })}</td>
                  <td data-etiqueta="Alto">{campo(i, 'alto_cm', unidad, { ...limites, placeholder: unidad === 'm' ? '0.25' : '25', 'aria-label': `Alto del bulto ${n} en ${unidad}` })}</td>
                  <td data-etiqueta="Peso c/u">{campo(i, 'peso_kg', 'kg', { min: 0.01, max: 5000, placeholder: '12', 'aria-label': `Peso de cada bulto ${n} en kg` })}</td>
                  <td data-etiqueta="Apilable">
                    <input type="checkbox" checked={b.apilable} onChange={(e) => cambiar(i, 'apilable', e.target.checked)} aria-label={`Bulto ${n} apilable`} />
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
                      aria-label={`Quitar bulto ${n}`}
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
