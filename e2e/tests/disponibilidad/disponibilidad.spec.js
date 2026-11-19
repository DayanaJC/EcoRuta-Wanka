// Disponibilidad y resiliencia: códigos HTTP, errores de red simulados y muestreo de uptime.
import { test, expect } from '../apoyo/fixtures.js'
import { API_URL, BASE_URL } from '../../playwright.config.js'
import { guardarMetricas } from '../apoyo/metricas.js'

const ORIGEN_API = new URL(API_URL).origin

test.describe('Códigos de estado HTTP', () => {
  test.beforeEach(({ browserName }) => test.skip(browserName !== 'chromium', 'Prueba HTTP: se ejecuta una sola vez'))

  test('las páginas del frontend responden 200', async ({ request }) => {
    for (const ruta of ['/', '/?vista=rutas', '/?vista=sostenibilidad', '/seguimiento/cualquier-token', '/favicon.svg']) {
      const r = await request.get(`${BASE_URL}${ruta}`)
      expect(r.status(), ruta).toBe(200)
    }
  })

  test('el backend está sano y conectado a la base de datos', async ({ request }) => {
    const r = await request.get(`${ORIGEN_API}/health`)
    expect(r.status()).toBe(200)
    const cuerpo = await r.json()
    expect(cuerpo.status).toBe('ok')
    expect(cuerpo.database.connected).toBe(true)
  })

  test('la API responde 200 en las consultas de cada módulo', async ({ request }) => {
    for (const ruta of ['/vehiculos', '/conductores', '/clientes', '/pedidos', '/asignaciones', '/rutas', '/indicadores', '/factores-trafico']) {
      const r = await request.get(`${API_URL}${ruta}`)
      expect(r.status(), ruta).toBe(200)
      expect(r.headers()['content-type']).toContain('application/json')
    }
  })

  test('la API responde errores claros (404 y 422) en vez de fallar', async ({ request }) => {
    const casos = [
      { ruta: '/ruta-inexistente', estado: 404 },
      { ruta: '/vehiculos/no-existe', estado: 404 },
      { ruta: '/seguimiento/token-falso', estado: 404 },
      { ruta: '/pedidos?estado=desconocido', estado: 422 },
    ]
    for (const c of casos) {
      const r = await request.get(`${API_URL}${c.ruta}`)
      expect(r.status(), c.ruta).toBe(c.estado)
      expect((await r.json()).detail, c.ruta).toBeTruthy()
    }
  })

  test('el frontend usa HTTPS con HSTS', async ({ request }) => {
    const r = await request.get(BASE_URL)
    expect(BASE_URL.startsWith('https://')).toBe(true)
    expect(r.headers()['strict-transport-security']).toContain('max-age')
  })
})

test.describe('Resiliencia ante errores de red', () => {
  test('si la API no responde, el panel avisa sin romperse', async ({ page }) => {
    await page.route('**/api/v1/**', (ruta) => ruta.abort('connectionrefused'))
    await page.goto('/')
    await expect(page.getByRole('alert').filter({ hasText: 'No se pudo conectar con el servidor' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pedidos', level: 1 })).toBeVisible()
    await expect(page.locator('aside nav')).toBeVisible()
  })

  test('si la API devuelve error 500, el panel lo informa', async ({ page }) => {
    await page.route('**/api/v1/**', (ruta) =>
      ruta.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ detail: 'Error interno simulado.' }) }),
    )
    await page.goto('/')
    await expect(page.getByRole('alert').first()).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pedidos', level: 1 })).toBeVisible()
  })

  test('con una API lenta (3 s) los datos llegan igual', async ({ page }) => {
    await page.route('**/api/v1/pedidos', async (ruta) => {
      await new Promise((r) => setTimeout(r, 3000))
      await ruta.continue()
    })
    await page.goto('/')
    await expect(page.locator('main table tbody tr').first()).toBeVisible({ timeout: 20_000 })
  })

  test('el seguimiento muestra un mensaje si se corta la conexión', async ({ page }) => {
    await page.route('**/api/v1/seguimiento/**', (ruta) => ruta.abort('internetdisconnected'))
    await page.goto('/seguimiento/token-cualquiera')
    await expect(page.getByRole('heading', { name: 'No encontramos tu pedido' })).toBeVisible()
    await expect(page.getByRole('alert').first()).toBeVisible()
  })
})

test.describe('Uptime del entorno desplegado', () => {
  test('muestreo de disponibilidad: 20 consultas al frontend y al backend', async ({ request, browserName }, testInfo) => {
    test.skip(browserName !== 'chromium', 'Muestreo: se ejecuta una sola vez')
    test.setTimeout(120_000)
    const objetivos = { frontend: BASE_URL, backend_health: `${ORIGEN_API}/health` }
    const resumen = {}
    for (const [nombre, url] of Object.entries(objetivos)) {
      let exitos = 0
      const tiempos = []
      for (let i = 0; i < 20; i++) {
        const inicio = performance.now()
        try {
          const r = await request.get(url, { timeout: 10_000 })
          if (r.status() === 200) exitos++
        } catch {
          /* cuenta como caída */
        }
        tiempos.push(Math.round(performance.now() - inicio))
        await new Promise((r) => setTimeout(r, 1000))
      }
      resumen[nombre] = {
        consultas: 20,
        exitosas: exitos,
        disponibilidad_pct: (exitos / 20) * 100,
        promedio_ms: Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length),
        max_ms: Math.max(...tiempos),
      }
    }
    await guardarMetricas(testInfo, 'uptime', resumen)
    for (const [nombre, r] of Object.entries(resumen)) expect(r.disponibilidad_pct, nombre).toBeGreaterThanOrEqual(95)
  })
})
