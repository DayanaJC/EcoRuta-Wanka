// Monitoreo de rendimiento: Web Vitals (TTFB, FCP, LCP, CLS) y tiempos de respuesta de la API.
// Umbrales: se exige al menos el nivel "necesita mejorar" de Google (no "pobre");
// el valor real queda guardado en reportes/metricas para el informe.
import { test, expect } from '../apoyo/fixtures.js'
import { API_URL } from '../../playwright.config.js'
import { leerWebVitals, guardarMetricas, mediana } from '../apoyo/metricas.js'

const UMBRAL = { ttfb_ms: 1800, fcp_ms: 3000, lcp_ms: 4000, cls: 0.25 }

const PAGINAS = [
  { nombre: 'inicio-pedidos', url: '/', listo: (page) => page.locator('main table tbody tr').first() },
  { nombre: 'seguimiento', url: null, listo: (page) => page.getByText('Avisos que te enviamos') },
]

test.describe('Web Vitals de las páginas principales', () => {
  for (const pagina of PAGINAS) {
    test(`métricas de carga: ${pagina.nombre}`, async ({ page, request }, testInfo) => {
      let url = pagina.url
      if (!url) {
        const pedidos = await (await request.get(`${API_URL}/pedidos`)).json()
        url = `/seguimiento/${pedidos.find((p) => p.token_seguimiento).token_seguimiento}`
      }
      // Tiempos de la API vistos por el navegador durante la carga
      const api = []
      page.on('requestfinished', async (req) => {
        if (!req.url().includes('/api/v1/')) return
        const t = req.timing()
        api.push({ url: new URL(req.url()).pathname, ms: Math.round(t.responseEnd) })
      })

      await page.goto(url, { waitUntil: 'load' })
      await expect(pagina.listo(page)).toBeVisible()
      await page.waitForTimeout(500)
      const vitals = await leerWebVitals(page)
      await guardarMetricas(testInfo, `web-vitals-${pagina.nombre}`, { url, ...vitals, api })

      expect(vitals.ttfb_ms).toBeLessThan(UMBRAL.ttfb_ms)
      if (vitals.fcp_ms != null) expect(vitals.fcp_ms).toBeLessThan(UMBRAL.fcp_ms)
      if (vitals.lcp_ms != null) expect(vitals.lcp_ms).toBeLessThan(UMBRAL.lcp_ms)
      if (vitals.cls != null) expect(vitals.cls).toBeLessThan(UMBRAL.cls)
    })
  }
})

test.describe('Tiempo de respuesta de la API', () => {
  const ENDPOINTS = ['/pedidos', '/vehiculos', '/clientes', '/conductores', '/rutas', '/indicadores']

  test('las consultas principales responden en menos de 3 s', async ({ request, browserName }, testInfo) => {
    test.skip(browserName !== 'chromium', 'Prueba de API: se ejecuta una sola vez')
    await request.get(`${API_URL}/pedidos`) // calentamiento: evita medir el arranque en frío de Vercel
    const resultados = []
    for (const ruta of ENDPOINTS) {
      const tiempos = []
      for (let i = 0; i < 5; i++) {
        const inicio = performance.now()
        const r = await request.get(`${API_URL}${ruta}`)
        tiempos.push(Math.round(performance.now() - inicio))
        expect(r.status()).toBe(200)
      }
      resultados.push({ ruta, mediana_ms: mediana(tiempos), min_ms: Math.min(...tiempos), max_ms: Math.max(...tiempos) })
    }
    await guardarMetricas(testInfo, 'api-tiempos', { muestras_por_ruta: 5, resultados })
    for (const r of resultados) expect(r.mediana_ms, r.ruta).toBeLessThan(3000)
  })
})
