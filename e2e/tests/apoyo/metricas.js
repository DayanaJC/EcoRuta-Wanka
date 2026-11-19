// Utilidades para medir rendimiento en el navegador y guardar los resultados en JSON.
import fs from 'node:fs'
import path from 'node:path'

// Lee TTFB, FCP, LCP, CLS y tiempos de carga con las APIs estándar del navegador
export async function leerWebVitals(page) {
  return page.evaluate(async () => {
    const nav = performance.getEntriesByType('navigation')[0]
    const fcp = performance.getEntriesByName('first-contentful-paint')[0]
    const observar = (tipo) =>
      new Promise((resolver) => {
        try {
          const entradas = []
          const obs = new PerformanceObserver((lista) => entradas.push(...lista.getEntries()))
          obs.observe({ type: tipo, buffered: true })
          setTimeout(() => { obs.disconnect(); resolver(entradas) }, 300)
        } catch {
          resolver(null) // el navegador no soporta esta métrica
        }
      })
    const lcp = await observar('largest-contentful-paint')
    const cls = await observar('layout-shift')
    const redondear = (v) => (v == null ? null : Math.round(v))
    return {
      ttfb_ms: redondear(nav.responseStart - nav.startTime),
      fcp_ms: redondear(fcp?.startTime),
      lcp_ms: lcp && lcp.length ? redondear(lcp.at(-1).startTime) : null,
      cls: cls ? Number(cls.filter((e) => !e.hadRecentInput).reduce((s, e) => s + e.value, 0).toFixed(3)) : null,
      dom_listo_ms: redondear(nav.domContentLoadedEventEnd - nav.startTime),
      carga_completa_ms: redondear(nav.loadEventEnd - nav.startTime),
      peso_transferido_kb: Math.round(
        performance.getEntriesByType('resource').reduce((s, r) => s + (r.transferSize || 0), nav.transferSize || 0) / 1024,
      ),
      solicitudes: performance.getEntriesByType('resource').length + 1,
    }
  })
}

export const mediana = (valores) => {
  const v = [...valores].sort((a, b) => a - b)
  return v.length ? v[Math.floor(v.length / 2)] : null
}

// Guarda un resultado en reportes/metricas/<nombre>.json y lo adjunta al reporte HTML
export async function guardarMetricas(testInfo, nombre, datos) {
  const carpeta = path.resolve('reportes/metricas')
  fs.mkdirSync(carpeta, { recursive: true })
  const archivo = path.join(carpeta, `${nombre}-${testInfo.project.name}.json`)
  fs.writeFileSync(archivo, JSON.stringify({ fecha: new Date().toISOString(), navegador: testInfo.project.name, ...datos }, null, 2))
  await testInfo.attach(nombre, { body: JSON.stringify(datos, null, 2), contentType: 'application/json' })
}
