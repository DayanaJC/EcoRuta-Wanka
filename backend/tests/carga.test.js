// Pruebas de las reglas de carga (peso, volumen y dimensiones).

import { describe, expect, it } from "vitest";
import { bultosQueNoCaben, cabeBulto, capacidadVolumenM3, totalesBultos, volumenBultoM3 } from "../src/services/carga.js";

const colchon = { descripcion: "Colchón 2 plazas", cantidad: 1, largo_cm: 190, ancho_cm: 135, alto_cm: 25, peso_kg: 40 };
const clavos = { descripcion: "Caja de clavos", cantidad: 1, largo_cm: 30, ancho_cm: 20, alto_cm: 15, peso_kg: 40 };
const camioneta = { largo_util_cm: 220, ancho_util_cm: 150, alto_util_cm: 120, aprovechamiento_pct: 80 };
const moto = { largo_util_cm: 45, ancho_util_cm: 45, alto_util_cm: 40, aprovechamiento_pct: 80 };

describe("carga", () => {
  it("el mismo peso puede ocupar volúmenes muy distintos", () => {
    expect(volumenBultoM3(clavos)).toBeCloseTo(0.009, 3);
    expect(volumenBultoM3(colchon)).toBeCloseTo(0.641, 3);
  });

  it("suma peso y volumen considerando la cantidad de bultos", () => {
    const cajas = { ...clavos, cantidad: 5 };
    expect(totalesBultos([cajas, colchon])).toEqual({ peso_kg: 240, volumen_m3: 0.686 });
  });

  it("calcula el volumen útil del vehículo con el aprovechamiento", () => {
    expect(capacidadVolumenM3(camioneta)).toBe(3.168); // 220×150×120 cm = 3,96 m³ × 80 %
    expect(capacidadVolumenM3(moto)).toBe(0.065);
  });

  it("comprueba si el bulto cabe físicamente, permitiendo rotarlo", () => {
    expect(cabeBulto(colchon, camioneta)).toBe(true);
    expect(cabeBulto(colchon, moto)).toBe(false);
    expect(cabeBulto(clavos, moto)).toBe(true);
    // Un tubo de 40×40×44: cabe rotado (44 ≤ 45, 40 ≤ 45, 40 ≤ 40)
    expect(cabeBulto({ largo_cm: 40, ancho_cm: 44, alto_cm: 40 }, moto)).toBe(true);
  });

  it("lista los bultos de un pedido que no caben", () => {
    const pedido = { bultos: [clavos, colchon] };
    expect(bultosQueNoCaben(pedido, moto)).toEqual([colchon]);
    expect(bultosQueNoCaben(pedido, camioneta)).toEqual([]);
  });
});
