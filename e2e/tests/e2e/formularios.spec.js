// Validaciones de formularios y flujo de registro.
// La escritura se simula con el fixture "escrituras": no se guarda nada en la base de datos.
import { test, expect } from '../apoyo/fixtures.js'

test.describe('Formulario de vehículos', () => {
  test('no envía el formulario vacío (campos obligatorios)', async ({ page, escrituras }) => {
    await page.goto('/?vista=vehiculos&accion=nuevo')
    await page.getByRole('button', { name: 'Registrar vehículo' }).click()
    const placa = page.getByLabel('Placa*')
    expect(await placa.evaluate((el) => el.validity.valueMissing)).toBe(true)
    expect(escrituras).toHaveLength(0)
  })

  test('rechaza una placa con formato incorrecto', async ({ page, escrituras }) => {
    await page.goto('/?vista=vehiculos&accion=nuevo')
    await page.getByLabel('Placa*').fill('AB1234')
    await page.getByLabel('Año de fabricación*').fill('2022')
    await page.getByRole('button', { name: 'Registrar vehículo' }).click()
    await expect(page.getByText('Usa tres letras, guion y tres dígitos (ABC-123).')).toBeVisible()
    await expect(page.getByLabel('Placa*')).toHaveAttribute('aria-invalid', 'true')
    expect(escrituras).toHaveLength(0)
  })

  test('registra un vehículo válido (envío simulado)', async ({ page, escrituras }) => {
    await page.goto('/?vista=vehiculos&accion=nuevo')
    await page.getByRole('button', { name: /^Moto/ }).click()
    // Espera a que React tome el control del formulario (el botón queda marcado)
    await expect(page.getByRole('button', { name: /^Moto/ })).toHaveAttribute('aria-pressed', 'true')
    await page.getByLabel('Placa*').fill('TST-999')
    await page.getByLabel('Año de fabricación*').fill('2024')
    await page.getByLabel('Capacidad de carga*').fill('40')
    await page.getByLabel('Consumo de combustible*').fill('3')
    await page.getByRole('button', { name: 'Registrar vehículo' }).click()
    await expect(page.getByText('Vehículo TST-999 registrado.')).toBeVisible()
    expect(escrituras).toHaveLength(1)
    expect(escrituras[0].metodo).toBe('POST')
    expect(escrituras[0].cuerpo).toMatchObject({ placa: 'TST-999', tipo: 'moto', anio_fabricacion: 2024 })
  })
})

test.describe('Formulario de pedidos', () => {
  test('no envía un pedido sin cliente ni dirección', async ({ page, escrituras }) => {
    await page.goto('/?vista=pedidos&accion=nuevo')
    await expect(page.getByRole('heading', { name: 'Registrar pedido' })).toBeVisible()
    await page.getByRole('button', { name: 'Registrar pedido' }).click()
    expect(await page.getByLabel('Código del cliente*').evaluate((el) => el.validity.valid)).toBe(false)
    expect(escrituras).toHaveLength(0)
  })

  test('avisa que falta el punto de entrega en el mapa', async ({ page }) => {
    await page.goto('/?vista=pedidos&accion=nuevo')
    await expect(page.getByText(/Falta el punto de entrega/)).toBeVisible()
  })
})
