// Reporte de sostenibilidad en PDF (RF-06). Usa los mismos indicadores que el dashboard
// (indicadoresService), así el PDF y la pantalla nunca muestran cifras distintas.
// Las fuentes estándar del PDF (Helvetica) no tienen subíndices: se escribe "CO2".

import PDFDocument from "pdfkit";
import { SinDatosError } from "../errors/errores.js";

const COLOR = {
  marca: "#15603a",
  marcaClaro: "#dcfce7",
  verde: "#047857",
  rojo: "#b91c1c",
  ambar: "#b45309",
  texto: "#0f172a",
  suave: "#64748b",
  borde: "#e2e8f0",
  fondo: "#f8fafc",
  barraAntes: "#5b6fd6",
  barraDespues: "#16a34a",
};
const MARGEN = 48;
const ESTADO_RUTA = { generada: "Generada", en_reparto: "En reparto", completada: "Completada" };
const TIPO_VEHICULO = { camioneta: "Camioneta", furgon: "Furgón", moto: "Moto" };

const numero = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2 });
const n = (v) => (v == null ? "—" : numero.format(v));
const conPct = (v) => (v == null ? "—" : `${numero.format(v)} %`);
// Cantidad ahorrada; si la ruta optimizada emitió más, se indica
const evitado = (v) => (Math.abs(v) < 0.005 ? "—" : v > 0 ? `${n(v)} kg` : `ninguno (+${n(-v)} kg)`);
const fechaCorta = (yyyymmdd) => yyyymmdd.split("-").reverse().join("/");

// Convierte el documento en un Buffer cuando termina de escribirse
const aBuffer = (doc) =>
  new Promise((resolver, rechazar) => {
    const partes = [];
    doc.on("data", (p) => partes.push(p));
    doc.on("end", () => resolver(Buffer.concat(partes)));
    doc.on("error", rechazar);
    doc.end();
  });

export function crearReporteService({ indicadores, zonaHoraria, reloj = () => new Date() }) {
  return {
    async sostenibilidadPdf(filtros) {
      const datos = await indicadores.calcular(filtros);
      // Escenario 3: sin datos no se genera un reporte con información inexistente
      if (datos.sin_datos) throw new SinDatosError(`${datos.mensaje} No se generó el reporte.`);

      const generado = new Intl.DateTimeFormat("es-PE", {
        timeZone: zonaHoraria, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
      }).format(reloj());
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: MARGEN, bottom: MARGEN, left: MARGEN, right: MARGEN },
        bufferPages: true,
        info: { Title: "Reporte de sostenibilidad - EcoRuta Wanka", Author: "WankaLogística S.A.C.", Subject: "Indicadores de sostenibilidad del reparto" },
      });
      dibujar(doc, datos, generado);
      return { buffer: await aBuffer(doc), nombre: `reporte-sostenibilidad_${datos.periodo.desde}_${datos.periodo.hasta}.pdf` };
    },
  };
}

// ---------------- Dibujo del documento ----------------

function dibujar(doc, datos, generado) {
  const ancho = doc.page.width - MARGEN * 2;
  const { periodo, totales: t, metas, metas_cumplidas: cumple } = datos;

  // Encabezado
  doc.rect(0, 0, doc.page.width, 96).fill(COLOR.marca);
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(20).text("EcoRuta Wanka", MARGEN, 30);
  doc.font("Helvetica").fontSize(12).text("Reporte de sostenibilidad del reparto", MARGEN, 56);
  doc.fontSize(9).text("WankaLogística S.A.C.", MARGEN, 34, { width: ancho, align: "right" });
  doc.text("Huancayo, Junín · Perú", MARGEN, 48, { width: ancho, align: "right" });

  let y = 116;
  const meta = [
    ["Periodo", `${fechaCorta(periodo.desde)} al ${fechaCorta(periodo.hasta)} (${periodo.dias} día${periodo.dias === 1 ? "" : "s"})`],
    ["Vehículo", datos.filtros.placa ?? "Todos los vehículos"],
    ["Generado", `${generado} (hora de Lima)`],
  ];
  doc.fontSize(9);
  for (const [etiqueta, valor] of meta) {
    doc.fillColor(COLOR.suave).font("Helvetica").text(`${etiqueta}:`, MARGEN, y, { continued: true }).fillColor(COLOR.texto).font("Helvetica-Bold").text(` ${valor}`);
    y += 14;
  }

  // Indicadores principales (3 × 2)
  y += 10;
  const estados = t.rutas_por_estado;
  const kpis = [
    ["Distancia planificada", `${n(t.km)} km`, `${n(t.km_sin_optimizar)} km sin optimizar`],
    ["Combustible estimado", `${n(t.litros)} L`, `${n(t.litros_ahorrados)} L ahorrados (${conPct(t.ahorro_combustible_pct)})`],
    ["Emisiones de CO2", `${n(t.co2_kg)} kg`, `${n(t.co2_por_parada_kg)} kg por parada`],
    [
      "CO2 evitado",
      `${n(t.co2_evitado_kg)} kg`,
      // Puede ser negativo: la ruta optimizada se alarga si las ventanas horarias lo exigen
      t.reduccion_co2_pct == null || Math.abs(t.reduccion_co2_pct) < 0.05
        ? "Igual que sin optimizar"
        : `${conPct(Math.abs(t.reduccion_co2_pct))} ${t.reduccion_co2_pct > 0 ? "menos" : "más"} que sin optimizar`,
    ],
    [
      "Entregas a tiempo",
      t.puntualidad_pct == null ? "—" : `${n(t.puntualidad_pct)} %`,
      t.entregadas ? `${t.a_tiempo} de ${t.entregadas} · ${t.no_entregadas} no entregada(s)` : "Aún sin entregas registradas",
    ],
    [
      "Rutas",
      String(t.rutas),
      [[estados.completada, "completada(s)"], [estados.en_reparto, "en reparto"], [estados.generada, "por iniciar"]]
        .filter(([cantidad]) => cantidad)
        .map(([cantidad, texto]) => `${cantidad} ${texto}`)
        .join(" · "),
    ],
  ];
  const gap = 10;
  const anchoKpi = (ancho - gap * 2) / 3;
  const altoKpi = 62;
  kpis.forEach(([etiqueta, valor, extra], i) => {
    const x = MARGEN + (i % 3) * (anchoKpi + gap);
    const yy = y + Math.floor(i / 3) * (altoKpi + gap);
    doc.roundedRect(x, yy, anchoKpi, altoKpi, 6).fillAndStroke(COLOR.fondo, COLOR.borde);
    doc.fillColor(COLOR.suave).font("Helvetica").fontSize(8).text(etiqueta.toUpperCase(), x + 10, yy + 9, { width: anchoKpi - 20 });
    doc.fillColor(COLOR.texto).font("Helvetica-Bold").fontSize(16).text(valor, x + 10, yy + 22, { width: anchoKpi - 20 });
    doc.fillColor(COLOR.suave).font("Helvetica").fontSize(7.5).text(extra, x + 10, yy + 44, { width: anchoKpi - 20 });
  });
  y += altoKpi * 2 + gap + 22;

  // Metas del proyecto
  y = titulo(doc, "Avance respecto a las metas", y);
  const filasMetas = [
    [
      `O1 · Reducir las emisiones de CO2 en ${metas.reduccion_co2_pct} %`,
      `Reducción lograda: ${conPct(t.reduccion_co2_pct)}`,
      cumple.reduccion_co2 ? ["Cumple", COLOR.verde] : ["En progreso", COLOR.ambar],
    ],
    [
      `O2 · Entregas fuera de horario por debajo del ${metas.fuera_de_horario_max_pct} %`,
      t.fuera_de_horario_pct == null ? "Sin entregas registradas en el periodo" : `Fuera de horario: ${conPct(t.fuera_de_horario_pct)}`,
      cumple.fuera_de_horario == null ? ["Sin datos", COLOR.suave] : cumple.fuera_de_horario ? ["Cumple", COLOR.verde] : ["No cumple", COLOR.rojo],
    ],
  ];
  for (const [meta, valor, [estado, color]] of filasMetas) {
    doc.fillColor(COLOR.texto).font("Helvetica-Bold").fontSize(9).text(meta, MARGEN, y, { width: ancho - 90 });
    doc.fillColor(COLOR.suave).font("Helvetica").fontSize(8.5).text(valor, MARGEN, y + 12, { width: ancho - 90 });
    doc.roundedRect(MARGEN + ancho - 76, y + 2, 76, 18, 9).fill(color);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8).text(estado, MARGEN + ancho - 76, y + 7, { width: 76, align: "center" });
    y += 32;
  }

  // Gráfico: CO2 por día, sin optimizar frente a optimizada
  y = graficoPorDia(doc, datos.por_dia, y + 6, ancho);

  // Tablas
  y = titulo(doc, "Indicadores por vehículo", espacio(doc, y, 80));
  y = tabla(doc, y, [
    { titulo: "Vehículo", ancho: 0.16, valor: (f) => f.placa ?? "—" },
    { titulo: "Tipo", ancho: 0.12, valor: (f) => TIPO_VEHICULO[f.tipo] ?? "—" },
    { titulo: "Rutas", ancho: 0.08, valor: (f) => String(f.rutas), derecha: true },
    { titulo: "Km", ancho: 0.11, valor: (f) => n(f.km), derecha: true },
    { titulo: "Litros", ancho: 0.11, valor: (f) => n(f.litros), derecha: true },
    { titulo: "CO2 (kg)", ancho: 0.12, valor: (f) => n(f.co2_kg), derecha: true },
    { titulo: "CO2 evitado", ancho: 0.14, valor: (f) => evitado(f.co2_evitado_kg), derecha: true },
    { titulo: "A tiempo", ancho: 0.16, valor: (f) => (f.entregadas ? `${f.a_tiempo}/${f.entregadas} (${conPct(f.puntualidad_pct)})` : "—"), derecha: true },
  ], datos.por_vehiculo);

  y = titulo(doc, "Detalle de rutas", espacio(doc, y + 14, 80));
  y = tabla(doc, y, [
    { titulo: "Fecha", ancho: 0.11, valor: (f) => fechaCorta(f.fecha) },
    { titulo: "Salida", ancho: 0.07, valor: (f) => f.hora_salida },
    { titulo: "Vehículo", ancho: 0.1, valor: (f) => f.placa ?? "—" },
    { titulo: "Conductor", ancho: 0.18, valor: (f) => f.conductor ?? "Sin asignar" },
    { titulo: "Paradas", ancho: 0.08, valor: (f) => String(f.paradas), derecha: true },
    { titulo: "Km antes/después", ancho: 0.17, valor: (f) => `${n(f.km_sin_optimizar)} / ${n(f.km)}`, derecha: true },
    { titulo: "CO2 (kg)", ancho: 0.09, valor: (f) => n(f.co2_kg), derecha: true },
    { titulo: "Evitado", ancho: 0.08, valor: (f) => n(f.co2_evitado_kg), derecha: true },
    { titulo: "Estado", ancho: 0.12, valor: (f) => ESTADO_RUTA[f.estado] ?? f.estado },
  ], datos.rutas);

  // Metodología
  y = espacio(doc, y + 16, 70);
  doc.fillColor(COLOR.suave).font("Helvetica-Bold").fontSize(8).text("Cómo se calculan", MARGEN, y);
  doc.font("Helvetica").fontSize(7.5).text(
    "Se consideran las rutas del periodo que no fueron canceladas. Distancia = distancia estimada por la API de optimización (OpenRouteService). " +
      "Litros = km × consumo del vehículo (L/100 km) ÷ 100. CO2 (kg) = litros × factor de emisión del vehículo (kg CO2/L). " +
      "\"Sin optimizar\" = el mismo recorrido en el orden en que el operador eligió los pedidos. Entregas a tiempo = entregas registradas " +
      "dentro de la ventana horaria del cliente. Son estimaciones: no incluyen pendientes, carga ni tráfico en tiempo real.",
    MARGEN,
    y + 12,
    { width: ancho, lineGap: 1.5 },
  );

  // Pie de página en todas las hojas (dentro del margen inferior: sin quitarlo, PDFKit crearía otra hoja)
  const rango = doc.bufferedPageRange();
  for (let i = 0; i < rango.count; i++) {
    doc.switchToPage(rango.start + i);
    doc.page.margins.bottom = 0;
    const yPie = doc.page.height - MARGEN + 14;
    doc.fillColor(COLOR.suave).font("Helvetica").fontSize(7.5);
    doc.text("EcoRuta Wanka · Reporte de sostenibilidad", MARGEN, yPie, { width: ancho, lineBreak: false });
    doc.text(`Página ${i + 1} de ${rango.count}`, MARGEN, yPie, { width: ancho, align: "right", lineBreak: false });
  }
}

// Salta de página si no quedan `alto` puntos libres
function espacio(doc, y, alto) {
  if (y + alto <= doc.page.height - MARGEN) return y;
  doc.addPage();
  return MARGEN;
}

function titulo(doc, texto, y) {
  doc.fillColor(COLOR.texto).font("Helvetica-Bold").fontSize(11).text(texto, MARGEN, y);
  return y + 20;
}

// Tabla con encabezado repetido en cada página
function tabla(doc, y, columnas, filas) {
  const ancho = doc.page.width - MARGEN * 2;
  const alto = 18;
  const xs = [];
  let x = MARGEN;
  for (const c of columnas) {
    xs.push(x);
    x += c.ancho * ancho;
  }
  const celda = (texto, i, yy, negrita) => {
    const disponible = columnas[i].ancho * ancho - 10;
    doc.font(negrita ? "Helvetica-Bold" : "Helvetica");
    doc.text(recortar(doc, texto, disponible), xs[i] + 5, yy + 5.5, { width: disponible, align: columnas[i].derecha ? "right" : "left", lineBreak: false });
  };
  const encabezado = (yy) => {
    doc.rect(MARGEN, yy, ancho, alto).fill(COLOR.marcaClaro);
    doc.fillColor(COLOR.marca).fontSize(7.5);
    columnas.forEach((c, i) => celda(c.titulo, i, yy, true));
    return yy + alto;
  };

  y = encabezado(y);
  filas.forEach((fila, j) => {
    if (y + alto > doc.page.height - MARGEN) {
      doc.addPage();
      y = encabezado(MARGEN);
    }
    if (j % 2) doc.rect(MARGEN, y, ancho, alto).fill(COLOR.fondo);
    doc.fillColor(COLOR.texto).fontSize(8);
    columnas.forEach((c, i) => celda(c.valor(fila), i, y, false));
    y += alto;
  });
  doc.moveTo(MARGEN, y).lineTo(MARGEN + ancho, y).lineWidth(0.5).strokeColor(COLOR.borde).stroke();
  return y;
}

// Recorta el texto con "…" para que quepa en una sola línea de la celda
function recortar(doc, texto, ancho) {
  if (doc.widthOfString(texto) <= ancho) return texto;
  let corto = texto;
  while (corto.length > 1 && doc.widthOfString(`${corto}…`) > ancho) corto = corto.slice(0, -1);
  return `${corto.trimEnd()}…`;
}

// Barras agrupadas por día: CO2 sin optimizar (gris) y con la ruta optimizada (verde)
function graficoPorDia(doc, porDia, y, ancho) {
  const alto = 130;
  y = titulo(doc, "Emisiones de CO2 por día (kg)", espacio(doc, y, alto + 60));
  const max = Math.max(...porDia.map((d) => d.co2_sin_optimizar_kg), 0.01);
  const ejeX = MARGEN + 34;
  const anchoUtil = ancho - 34;
  const base = y + alto;

  // Líneas guía y escala
  doc.font("Helvetica").fontSize(7).fillColor(COLOR.suave);
  for (let k = 0; k <= 4; k++) {
    const yy = base - (alto * k) / 4;
    doc.moveTo(ejeX, yy).lineTo(ejeX + anchoUtil, yy).lineWidth(0.5).strokeColor(COLOR.borde).stroke();
    doc.text(n(Math.round(((max * k) / 4) * 10) / 10), MARGEN - 4, yy - 3, { width: 34, align: "right", lineBreak: false });
  }

  const grupo = anchoUtil / porDia.length;
  const barra = Math.min(18, (grupo - 6) / 2);
  porDia.forEach((d, i) => {
    const x0 = ejeX + i * grupo + (grupo - barra * 2 - 2) / 2;
    const hA = (d.co2_sin_optimizar_kg / max) * alto;
    const hD = (d.co2_kg / max) * alto;
    doc.rect(x0, base - hA, barra, hA).fill(COLOR.barraAntes);
    doc.rect(x0 + barra + 2, base - hD, barra, hD).fill(COLOR.barraDespues);
    if (porDia.length <= 16 || i % Math.ceil(porDia.length / 16) === 0) {
      doc.fillColor(COLOR.suave).fontSize(7).text(fechaCorta(d.fecha).slice(0, 5), ejeX + i * grupo, base + 4, { width: grupo, align: "center", lineBreak: false });
    }
  });

  // Leyenda
  const yL = base + 18;
  doc.rect(ejeX, yL, 8, 8).fill(COLOR.barraAntes);
  doc.fillColor(COLOR.texto).fontSize(7.5).text("Sin optimizar (orden elegido)", ejeX + 12, yL + 1, { lineBreak: false });
  doc.rect(ejeX + 150, yL, 8, 8).fill(COLOR.barraDespues);
  doc.fillColor(COLOR.texto).text("Ruta optimizada", ejeX + 162, yL + 1, { lineBreak: false });
  return yL + 26;
}
