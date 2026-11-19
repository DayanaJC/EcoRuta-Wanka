// Sprint 4: avisos al cliente y seguimiento público del pedido.
// Incluye el control de acceso del enlace público (el sistema no tiene inicio de sesión).
import { test, expect, obtenerPedidos } from '../apoyo/fixtures.js'

test.describe('Avisos al cliente (Sprint 4)', () => {
  test('el detalle de un pedido entregado muestra el aviso y el botón de WhatsApp', async ({ page, request, escrituras }) => {
    const pedido = (await obtenerPedidos(request)).find((p) => p.estado === 'entregado')
    test.skip(!pedido, 'No hay pedidos entregados en el entorno')
    await page.goto(`/?vista=pedidos&accion=ver&id=${pedido.id}`)
    await expect(page.getByText('Avisos al cliente')).toBeVisible()
    await expect(page.getByText(/fue entregado/).first()).toBeVisible()
    const whatsapp = page.getByRole('link', { name: 'Enviar por WhatsApp' }).first()
    await expect(whatsapp).toHaveAttribute('href', /^https:\/\/wa\.me\/\d*\?text=/)
    expect(escrituras).toHaveLength(0)
  })
})

test.describe('Seguimiento público del pedido', () => {
  test('con un enlace válido el cliente ve su pedido y los avisos', async ({ page, request }) => {
    const pedido = (await obtenerPedidos(request)).find((p) => p.token_seguimiento)
    await page.goto(`/seguimiento/${pedido.token_seguimiento}`)
    await expect(page).toHaveTitle(/Seguimiento de tu pedido/)
    await expect(page.getByText(/Pedido P-/).first()).toBeVisible()
    await expect(page.getByText(`Hola, ${pedido.cliente_nombre}`).first()).toBeVisible()
    await expect(page.getByText('Avisos que te enviamos')).toBeVisible()
  })

  test('con un enlace falso no se muestra ningún dato (control de acceso)', async ({ page }) => {
    await page.goto('/seguimiento/enlace-falso-0000')
    await expect(page.getByRole('heading', { name: 'No encontramos tu pedido' })).toBeVisible()
    await expect(page.getByText(/El enlace de seguimiento no es válido/)).toBeVisible()
  })

  test('la página de seguimiento no se indexa en buscadores', async ({ page }) => {
    await page.goto('/seguimiento/enlace-falso-0000')
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  })
})
