// Fixture común: protege la base de datos de producción.
// Toda petición a la API que no sea GET (POST, PUT, PATCH, DELETE) se intercepta
// dentro del navegador y NUNCA llega al servidor. Las pruebas solo leen datos reales.
import { test as base, expect } from '@playwright/test'
import { API_URL } from '../../playwright.config.js'

export const test = base.extend({
  // auto: true -> la protección está activa en TODAS las pruebas, aunque no la pidan
  escrituras: [async ({ page }, use) => {
    const interceptadas = []
    await page.route('**/api/v1/**', (ruta) => {
      const req = ruta.request()
      if (req.method() === 'GET') return ruta.continue()
      interceptadas.push({ metodo: req.method(), url: req.url(), cuerpo: req.postDataJSON?.() ?? null })
      // Respuesta simulada de "creado" para poder probar el flujo completo sin guardar nada
      return ruta.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'simulado-e2e', ...(req.postDataJSON?.() ?? {}) }),
      })
    })
    await use(interceptadas)
  }, { auto: true }],
})

// Datos reales de solo lectura desde la API desplegada
export async function obtenerPedidos(request) {
  const r = await request.get(`${API_URL}/pedidos`)
  expect(r.status()).toBe(200)
  return r.json()
}

export { expect, API_URL }
