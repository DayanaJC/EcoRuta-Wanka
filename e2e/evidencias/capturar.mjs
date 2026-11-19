// Captura evidencias (solo lectura) del Sprint 4 y del reporte HTML de Playwright.
import { chromium } from '@playwright/test'
import path from 'node:path'
const DESTINO = path.resolve('../docs/06 Otros/evidencias')
const U = 'https://ecoruta-frontend.vercel.app'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1366, height: 860 }, locale: 'es-PE', timezoneId: 'America/Lima' })
const p = await ctx.newPage()
await p.route('**/api/v1/**', (r) => (r.request().method() === 'GET' ? r.continue() : r.abort()))
const peds = await (await fetch('https://ecoruta-backend.vercel.app/api/v1/pedidos')).json()
const ped = peds.find((x) => x.estado === 'entregado')
const foto = (n) => path.join(DESTINO, n)

await p.goto(`${U}/?vista=pedidos&accion=ver&id=${ped.id}`)
await p.getByText('Enviar por WhatsApp').first().waitFor(); await p.waitForTimeout(1000)
await p.locator('section, .tarjeta').filter({ has: p.getByText('Avisos al cliente', { exact: true }) }).last()
  .screenshot({ path: foto('Evidencia 35 Avisos al cliente en el detalle del pedido.png') })

const movil = await b.newContext({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2, locale: 'es-PE', timezoneId: 'America/Lima' })
const pm = await movil.newPage()
await pm.goto(`${U}/seguimiento/${ped.token_seguimiento}`); await pm.getByText('Avisos que te enviamos').waitFor(); await pm.waitForTimeout(1500)
await pm.screenshot({ path: foto('Evidencia 36 Seguimiento publico del pedido.png'), fullPage: true })
await pm.goto(`${U}/seguimiento/enlace-falso-0000`); await pm.getByText('No encontramos tu pedido').waitFor(); await pm.waitForTimeout(500)
await pm.screenshot({ path: foto('Evidencia 37 Enlace de seguimiento no valido.png') })

const r = await ctx.newPage()
const rep = 'file:///' + path.resolve('reportes/html/index.html').split(path.sep).join('/')
await r.goto(rep); await r.waitForTimeout(1500)
await r.screenshot({ path: foto('Evidencia 38 Reporte HTML de Playwright.png'), fullPage: false })
await r.goto(rep + '#?q=notificaciones'); await r.waitForTimeout(1500)
await r.screenshot({ path: foto('Evidencia 39 Pruebas E2E de notificaciones.png') })
for (const [q, n, adj] of [['métricas de carga: inicio', 'Evidencia 40 Metricas Web Vitals en Playwright.png', 'web-vitals-inicio-pedidos'], ['muestreo de disponibilidad', 'Evidencia 41 Muestreo de disponibilidad.png', 'uptime']]) {
  await r.goto(rep + '#?q=' + encodeURIComponent(q)); await r.waitForTimeout(1000)
  await r.locator('.test-file-test a').first().click(); await r.waitForTimeout(1000)
  const a = r.getByText(adj, { exact: true }).first(); await a.click(); await r.waitForTimeout(800)
  await r.screenshot({ path: foto(n), fullPage: true })
}
await b.close(); console.log('ok')
