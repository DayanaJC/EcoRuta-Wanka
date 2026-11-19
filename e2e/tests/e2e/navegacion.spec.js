// Flujo principal: el operador abre el sistema y recorre los módulos.
import { test, expect } from '../apoyo/fixtures.js'

const MODULOS = ['Pedidos', 'Clientes', 'Vehículos', 'Conductores', 'Rutas', 'Sostenibilidad']

test.describe('Navegación del panel', () => {
  test('la página principal carga con la lista de pedidos', async ({ page, escrituras }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/EcoRuta Wanka/)
    await expect(page.getByRole('heading', { name: 'Pedidos', level: 1 })).toBeVisible()
    await expect(page.getByText(/\d+ de \d+ pedidos/)).toBeVisible()
    await expect(page.locator('main table tbody tr').first()).toBeVisible()
    expect(escrituras).toHaveLength(0)
  })

  for (const modulo of MODULOS) {
    test(`abre el módulo ${modulo} desde el menú lateral`, async ({ page }) => {
      await page.goto('/')
      await page.locator('aside nav').getByRole('button', { name: new RegExp(modulo) }).click()
      await expect(page.getByRole('heading', { name: modulo, level: 1 })).toBeVisible()
    })
  }

  test('el filtro "Entregado" muestra solo pedidos entregados', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('main table tbody tr').first()).toBeVisible()
    await page.getByRole('button', { name: 'Entregado', exact: true }).click()
    const estados = page.locator('main table tbody tr td:nth-child(6)')
    await expect(estados.first()).toHaveText(/Entregado/)
    for (const texto of await estados.allInnerTexts()) expect(texto).toMatch(/Entregado/)
  })

  test('la URL conserva la pantalla al recargar (enlace directo)', async ({ page }) => {
    await page.goto('/?vista=vehiculos')
    await expect(page.getByRole('heading', { name: 'Vehículos', level: 1 })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Vehículos', level: 1 })).toBeVisible()
  })
})
