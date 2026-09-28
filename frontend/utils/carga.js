// Reglas de carga en la interfaz (mismas que backend/src/services/carga.js),
// para avisar al operador antes de enviar el formulario.

export const volumenBultoM3 = (b) => (Number(b.largo_cm) * Number(b.ancho_cm) * Number(b.alto_cm)) / 1_000_000

export function totalesBultos(bultos) {
  return {
    peso_kg: bultos.reduce((s, b) => s + Number(b.peso_kg || 0) * Number(b.cantidad || 0), 0),
    volumen_m3: bultos.reduce((s, b) => s + (volumenBultoM3(b) || 0) * Number(b.cantidad || 0), 0),
    unidades: bultos.reduce((s, b) => s + Number(b.cantidad || 0), 0),
  }
}

export const capacidadVolumenM3 = (v) =>
  (Number(v.largo_util_cm) * Number(v.ancho_util_cm) * Number(v.alto_util_cm) * Number(v.aprovechamiento_pct ?? 80)) / 100 / 1_000_000

// El bulto se puede rotar: se comparan las medidas ordenadas de mayor a menor
export function cabeBulto(bulto, vehiculo) {
  const b = [bulto.largo_cm, bulto.ancho_cm, bulto.alto_cm].map(Number).sort((x, y) => y - x)
  const v = [vehiculo.largo_util_cm, vehiculo.ancho_util_cm, vehiculo.alto_util_cm].map(Number).sort((x, y) => y - x)
  return b.every((m, i) => m <= v[i])
}

export const bultosQueNoCaben = (pedido, vehiculo) => (pedido.bultos ?? []).filter((b) => !cabeBulto(b, vehiculo))

export const medidasBulto = (b) => `${b.largo_cm}×${b.ancho_cm}×${b.alto_cm} cm`

// Medidas internas de referencia por tipo de vehículo (editables)
export const MEDIDAS_REFERENCIA = {
  camioneta: { largo_util_cm: 220, ancho_util_cm: 150, alto_util_cm: 120 },
  furgon: { largo_util_cm: 300, ancho_util_cm: 170, alto_util_cm: 170 },
  moto: { largo_util_cm: 45, ancho_util_cm: 45, alto_util_cm: 40 },
}
