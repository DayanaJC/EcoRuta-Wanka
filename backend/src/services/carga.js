// Reglas de carga: peso, volumen y dimensiones de bultos y vehículos.
// Un pedido tiene N bultos; su peso y su volumen se calculan a partir de ellos.

const redondear = (n, decimales) => Number(n.toFixed(decimales));

// Volumen de UN bulto en m³ (medidas en cm)
export const volumenBultoM3 = (b) => (b.largo_cm * b.ancho_cm * b.alto_cm) / 1_000_000;

/** Totales del pedido a partir de sus bultos */
export function totalesBultos(bultos) {
  return {
    peso_kg: redondear(
      bultos.reduce((s, b) => s + b.peso_kg * b.cantidad, 0),
      2,
    ),
    volumen_m3: redondear(
      bultos.reduce((s, b) => s + volumenBultoM3(b) * b.cantidad, 0),
      3,
    ),
  };
}

/** Volumen útil del vehículo en m³ (medidas internas × aprovechamiento) */
export const capacidadVolumenM3 = (v) =>
  redondear((v.largo_util_cm * v.ancho_util_cm * v.alto_util_cm * (v.aprovechamiento_pct ?? 80)) / 100 / 1_000_000, 3);

/**
 * ¿Cabe físicamente el bulto en la caja del vehículo?
 * Se permite rotarlo: se comparan las medidas ordenadas de mayor a menor.
 */
export function cabeBulto(bulto, vehiculo) {
  const b = [bulto.largo_cm, bulto.ancho_cm, bulto.alto_cm].sort((x, y) => y - x);
  const v = [vehiculo.largo_util_cm, vehiculo.ancho_util_cm, vehiculo.alto_util_cm].sort((x, y) => y - x);
  return b.every((medida, i) => medida <= v[i]);
}

/** Bultos del pedido que no caben en el vehículo */
export const bultosQueNoCaben = (pedido, vehiculo) => (pedido.bultos ?? []).filter((b) => !cabeBulto(b, vehiculo));

export const describirBulto = (b) => `${b.descripcion} (${b.largo_cm}×${b.ancho_cm}×${b.alto_cm} cm)`;
