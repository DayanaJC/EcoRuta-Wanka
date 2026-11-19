# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 03. Análisis con Playwright: Pruebas E2E y Monitoreo V_1_0_0

**Versión:** V_1_0_0  
**Fecha:** 19/11/2026  
**Organización:** WankaLogística S.A.C.  
**Ubicación:** Huancayo, Junín, Perú  
**Repositorio:** https://github.com/DayanaJC/EcoRuta-Wanka

**Líder del proyecto:** Javier Curi Dayana  
**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

**Herramienta:** Playwright Test 1.56.1 (Node.js 24)

**Entorno evaluado:**
- Frontend: https://ecoruta-frontend.vercel.app
- API: https://ecoruta-backend.vercel.app/api/v1

Las pruebas se realizaron sobre la versión de `main`, correspondiente al commit `cbda2cd` (PR #19 del Sprint 4).

---

## 1. Configuración del entorno de pruebas

### 1.1. Arquitectura de carpetas

Se creó la carpeta `e2e/` para organizar las pruebas automatizadas, sus configuraciones y los reportes generados.

```text
e2e/
├── package.json
├── playwright.config.js
├── .gitignore
├── navegadores/
│   └── firefox/
├── evidencias/
│   └── capturar.mjs
├── tests/
│   ├── apoyo/
│   │   ├── fixtures.js
│   │   └── metricas.js
│   ├── e2e/
│   │   ├── navegacion.spec.js
│   │   ├── formularios.spec.js
│   │   └── notificaciones.spec.js
│   ├── rendimiento/
│   │   └── web-vitals.spec.js
│   └── disponibilidad/
│       └── disponibilidad.spec.js
└── reportes/
    ├── html/
    ├── resultados.json
    ├── metricas/
    └── artefactos/
```

**Descripción de los archivos principales:**

| Archivo o carpeta | Función |
|---|---|
| `playwright.config.js` | Configura los navegadores y la ejecución de las pruebas. |
| `tests/e2e/` | Contiene las pruebas de navegación, formularios y notificaciones. |
| `tests/rendimiento/` | Registra las métricas de rendimiento. |
| `tests/disponibilidad/` | Comprueba las respuestas HTTP y los errores de conexión. |
| `tests/apoyo/` | Contiene funciones de apoyo para las pruebas. |
| `reportes/` | Guarda los resultados y el reporte HTML. |

### 1.2. Navegadores evaluados

Se ejecutaron las pruebas utilizando tres navegadores para comprobar el funcionamiento de la aplicación en diferentes entornos.

| Navegador | Motor | Resultado |
|---|---|---:|
| Chromium | Blink | 31 aprobadas |
| Firefox | Gecko | 24 aprobadas |
| WebKit | WebKit | 24 aprobadas |

Se utilizaron las versiones de escritorio de Chromium, Firefox y WebKit mediante Playwright.

### 1.3. Configuración de `playwright.config.js`

Este archivo define las direcciones de la aplicación, los tiempos de espera, los navegadores y los reportes.

```js
import { defineConfig, devices } from '@playwright/test'

export const BASE_URL = process.env.BASE_URL ?? 'https://ecoruta-frontend.vercel.app'
export const API_URL = process.env.API_URL ?? 'https://ecoruta-backend.vercel.app/api/v1'

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers: 3,
  retries: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reportes/html', open: 'never' }],
    ['json', { outputFile: 'reportes/resultados.json' }],
  ],
  use: {
    baseURL: BASE_URL,
    locale: 'es-PE',
    timezoneId: 'America/Lima',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        ...(process.env.FIREFOX_PATH
          ? { launchOptions: { executablePath: process.env.FIREFOX_PATH } }
          : {}),
      },
    },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  outputDir: 'reportes/artefactos',
})
```

**Configuraciones principales:**

| Configuración | Función |
|---|---|
| `BASE_URL` y `API_URL` | Definen las direcciones del frontend y la API. |
| `timeout` | Establece el tiempo máximo de ejecución de una prueba. |
| `fullyParallel` | Permite ejecutar pruebas en paralelo. |
| `retries` | Permite repetir una prueba cuando falla. |
| `reporter` | Genera reportes en pantalla, HTML y JSON. |
| `projects` | Define los tres navegadores evaluados. |

### 1.4. Protección de datos durante las pruebas

Como las pruebas se realizaron sobre el entorno desplegado, se configuró una protección para evitar modificar los datos reales.

El archivo `fixtures.js` intercepta las operaciones de escritura y devuelve respuestas simuladas.

```js
export const test = base.extend({
  escrituras: [async ({ page }, use) => {
    const interceptadas = []

    await page.route('**/api/v1/**', (ruta) => {
      const req = ruta.request()

      if (req.method() === 'GET') return ruta.continue()

      interceptadas.push({
        metodo: req.method(),
        url: req.url(),
        cuerpo: req.postDataJSON?.() ?? null
      })

      return ruta.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'simulado-e2e',
          ...(req.postDataJSON?.() ?? {})
        }),
      })
    })

    await use(interceptadas)
  }, { auto: true }],
})
```

De esta manera, las consultas GET pueden acceder a la API, mientras que las operaciones POST, PUT, PATCH y DELETE son simuladas y no modifican la información real.

---

## 2. Pruebas End-to-End (E2E)

Las pruebas E2E permiten comprobar que las funciones principales de EcoRuta Wanka trabajen correctamente desde la pantalla del usuario.

### 2.1. Casos de prueba

Se evaluaron los siguientes procesos:

| N.° | Archivo | Caso de prueba | Tipo |
|---|---|---|---|
| 1 | `navegacion.spec.js` | Carga de la página principal y lista de pedidos. | Flujo principal |
| 2–7 | `navegacion.spec.js` | Acceso a Pedidos, Clientes, Vehículos, Conductores, Rutas y Sostenibilidad. | Navegación |
| 8 | `navegacion.spec.js` | Filtro de pedidos entregados. | Filtro |
| 9 | `navegacion.spec.js` | Conservación de la pantalla al recargar la URL. | Navegación |
| 10 | `formularios.spec.js` | Validación del formulario de vehículo vacío. | Validación |
| 11 | `formularios.spec.js` | Rechazo de una placa incorrecta (`AB1234`). | Validación |
| 12 | `formularios.spec.js` | Registro simulado de un vehículo válido. | Flujo de negocio |
| 13 | `formularios.spec.js` | Validación de un pedido sin cliente ni dirección. | Validación |
| 14 | `formularios.spec.js` | Aviso cuando falta el punto de entrega en el mapa. | Validación |
| 15 | `notificaciones.spec.js` | Aviso de pedido entregado y botón de WhatsApp. | Notificaciones |
| 16 | `notificaciones.spec.js` | Consulta de pedido mediante un enlace válido. | Acceso |
| 17 | `notificaciones.spec.js` | Rechazo de un enlace de seguimiento falso. | Acceso |
| 18 | `notificaciones.spec.js` | Verificación de la etiqueta `noindex` en seguimiento. | Acceso |

**Control de acceso al seguimiento:** el sistema utiliza un token único en el enlace público del pedido. Por ello, se comprobó que un enlace válido permita consultar la información y que uno falso no muestre datos.

No se presenta una prueba de inicio de sesión con usuario y contraseña porque esa función no forma parte del sistema implementado.

### 2.2. Código fuente de las pruebas

**Validación de placa incorrecta**

Se comprueba que el formulario rechace una placa que no cumple con el formato establecido.

```js
test('rechaza una placa con formato incorrecto', async ({ page, escrituras }) => {
  await page.goto('/?vista=vehiculos&accion=nuevo')

  await page.getByLabel('Placa*').fill('AB1234')
  await page.getByLabel('Año de fabricación*').fill('2022')

  await page.getByRole('button', { name: 'Registrar vehículo' }).click()

  await expect(
    page.getByText('Usa tres letras, guion y tres dígitos (ABC-123).')
  ).toBeVisible()

  await expect(page.getByLabel('Placa*')).toHaveAttribute('aria-invalid', 'true')

  expect(escrituras).toHaveLength(0)
})
```

**Registro simulado de un vehículo**

Se completan los campos obligatorios y se verifica el mensaje de confirmación.

```js
test('registra un vehículo válido (envío simulado)', async ({ page, escrituras }) => {
  await page.goto('/?vista=vehiculos&accion=nuevo')

  await page.getByRole('button', { name: /^Moto/ }).click()

  await expect(
    page.getByRole('button', { name: /^Moto/ })
  ).toHaveAttribute('aria-pressed', 'true')

  await page.getByLabel('Placa*').fill('TST-999')
  await page.getByLabel('Año de fabricación*').fill('2024')
  await page.getByLabel('Capacidad de carga*').fill('40')
  await page.getByLabel('Consumo de combustible*').fill('3')

  await page.getByRole('button', { name: 'Registrar vehículo' }).click()

  await expect(page.getByText('Vehículo TST-999 registrado.')).toBeVisible()

  expect(escrituras[0].metodo).toBe('POST')
  expect(escrituras[0].cuerpo).toMatchObject({
    placa: 'TST-999',
    tipo: 'moto',
    anio_fabricacion: 2024
  })
})
```

**Notificaciones y seguimiento de pedidos**

Se verifica que el detalle de un pedido entregado muestre el aviso y el enlace de WhatsApp. También se comprueba que un token incorrecto no permita consultar un pedido.

```js
test('el detalle de un pedido entregado muestra el aviso y el botón de WhatsApp', async ({ page, request }) => {
  const pedido = (await obtenerPedidos(request)).find(
    (p) => p.estado === 'entregado'
  )

  await page.goto(`/?vista=pedidos&accion=ver&id=${pedido.id}`)

  await expect(page.getByText('Avisos al cliente')).toBeVisible()
  await expect(page.getByText(/fue entregado/).first()).toBeVisible()

  const whatsapp = page.getByRole('link', {
    name: 'Enviar por WhatsApp'
  }).first()

  await expect(whatsapp).toHaveAttribute('href', /^https:\/\/wa\.me\/\d+\?text=/)
})

test('con un enlace falso no se muestra ningún dato (control de acceso)', async ({ page }) => {
  await page.goto('/seguimiento/enlace-falso-0000')

  await expect(
    page.getByRole('heading', { name: 'No encontramos tu pedido' })
  ).toBeVisible()

  await expect(
    page.getByText(/El enlace de seguimiento no es válido/)
  ).toBeVisible()
})
```

### 2.3. Resultados de ejecución

Se obtuvieron los siguientes resultados en los tres navegadores:

| Grupo de pruebas | Chromium | Firefox | WebKit | Total |
|---|---:|---:|---:|---:|
| Navegación | 9/9 | 9/9 | 9/9 | 27/27 |
| Formularios | 5/5 | 5/5 | 5/5 | 15/15 |
| Notificaciones | 4/4 | 4/4 | 4/4 | 12/12 |
| Rendimiento | 3/3 | 2/2 | 2/2 | 7/7 |
| Disponibilidad y resiliencia | 10/10 | 4/4 | 4/4 | 18/18 |
| **Total aprobado** | **31/31** | **24/24** | **24/24** | **79/79** |

**Resumen:**
- Pruebas aprobadas: 79.
- Pruebas fallidas: 0.
- Pruebas inestables: 0.
- Pruebas omitidas: 14 (7 en Firefox y 7 en WebKit).
- Tiempo de ejecución: 1,4 minutos.

Las 14 pruebas omitidas corresponden a comprobaciones de API que se ejecutan una sola vez en Chromium.

Adicionalmente, las pruebas unitarias del backend con Vitest registraron **125 de 125 pruebas aprobadas**, distribuidas en 9 archivos.

### Evidencias de ejecución

**Evidencia 38: Reporte HTML de Playwright (79 aprobadas, 0 fallidas)**

![Evidencia 38: Reporte HTML de Playwright](../../06%20Otros/evidencias/Evidencia%2038%20Reporte%20HTML%20de%20Playwright.png)

**Evidencia 39: Pruebas E2E de notificaciones en Chromium, Firefox y WebKit**

![Evidencia 39: Pruebas E2E de notificaciones](../../06%20Otros/evidencias/Evidencia%2039%20Pruebas%20E2E%20de%20notificaciones.png)

---

## 3. Monitoreo de rendimiento

Se midió el tiempo que tarda la aplicación en mostrar su contenido y responder a las consultas de la API.

### 3.1. Métricas Web Vitals

| Métrica | Descripción | Límite de referencia |
|---|---|---:|
| **TTFB** | Tiempo hasta recibir el primer dato del servidor. | ≤ 800 ms |
| **FCP** | Tiempo hasta mostrar el primer texto o imagen. | ≤ 1 800 ms |
| **LCP** | Tiempo hasta mostrar el contenido principal. | ≤ 2 500 ms |
| **CLS** | Mide los movimientos inesperados de la pantalla. | ≤ 0,1 |
| **Tiempo de API** | Tiempo de respuesta de las consultas. | Menos de 3 000 ms |

Las métricas se obtuvieron mediante las herramientas de rendimiento del navegador, como `PerformanceNavigationTiming`, `paint` y `PerformanceObserver`.

**Código utilizado para obtener las métricas:**

```js
// tests/apoyo/metricas.js (resumen)

const nav = performance.getEntriesByType('navigation')[0]
const fcp = performance.getEntriesByName('first-contentful-paint')[0]

// LCP y CLS se leen con PerformanceObserver({ type, buffered: true })

return {
  ttfb_ms: nav.responseStart - nav.startTime,
  fcp_ms: fcp?.startTime,
  lcp_ms: ultimaEntradaLCP?.startTime,
  carga_completa_ms: nav.loadEventEnd - nav.startTime,
}
```

### 3.2. Resultados de rendimiento

Se evaluaron la página principal y la página pública de seguimiento.

| Página | Navegador | TTFB | FCP | LCP | CLS |
|---|---|---:|---:|---:|---:|
| Inicio | Chromium | 270 ms | 520 ms | 880 ms | 0,002 |
| Inicio | Firefox | 313 ms | 574 ms | 588 ms | 0 |
| Inicio | WebKit | 283 ms | 518 ms | N/D | 0 |
| Seguimiento público | Chromium | 285 ms | 576 ms | 1 700 ms | 0 |
| Seguimiento público | Firefox | 283 ms | 632 ms | 1 702 ms | 0 |
| Seguimiento público | WebKit | 301 ms | 843 ms | N/D | 0 |

**Análisis de los resultados:**

- La página principal presentó un LCP inferior a un segundo en Chromium y Firefox.
- La página de seguimiento presentó un LCP aproximado de 1,7 segundos en ambos navegadores.
- Los valores de LCP obtenidos se encuentran por debajo del límite de 2,5 segundos.
- Los valores de CLS muestran estabilidad en la presentación de las páginas.
- En WebKit no se obtuvo un valor de LCP.

La página de seguimiento tarda más en mostrar su contenido principal debido a la carga del mapa y sus imágenes.

**Evidencia 40: Métricas Web Vitals guardadas en el reporte de Playwright**

![Evidencia 40: Métricas Web Vitals en Playwright](../../06%20Otros/evidencias/Evidencia%2040%20Metricas%20Web%20Vitals%20en%20Playwright.png)

### 3.3. Tiempo de respuesta de la API

Se realizaron cinco consultas por cada ruta, después de una consulta inicial de calentamiento.

**Resultados de las consultas directas:**

| Ruta | Mediana | Mínimo | Máximo |
|---|---:|---:|---:|
| `GET /pedidos` | 273 ms | 267 ms | 280 ms |
| `GET /vehiculos` | 245 ms | 243 ms | 254 ms |
| `GET /clientes` | 251 ms | 244 ms | 257 ms |
| `GET /conductores` | 248 ms | 246 ms | 260 ms |
| `GET /rutas` | 278 ms | 275 ms | 305 ms |
| `GET /indicadores` | 272 ms | 260 ms | 274 ms |

**Consultas realizadas desde el navegador:**

| Ruta | Chromium | Firefox | WebKit |
|---|---:|---:|---:|
| `/conductores` | 448 ms | 507 ms | 457 ms |
| `/clientes` | 449 ms | 501 ms | 451 ms |
| `/vehiculos` | 466 ms | 487 ms | 468 ms |
| `/pedidos` | 466 ms | 508 ms | 462 ms |
| `/rutas` | 458 ms | 546 ms | 482 ms |

En la consulta de seguimiento `GET /seguimiento/<token>` se obtuvieron estos tiempos:

- Chromium: 598 ms.
- Firefox: 499 ms.
- WebKit: 2 163 ms.

Los resultados muestran que las consultas respondieron por debajo del límite establecido de 3 000 ms.

---

## 4. Disponibilidad y resiliencia

Se comprobó que el frontend y la API respondan correctamente y que la aplicación pueda manejar errores de conexión.

### 4.1. Verificación de códigos HTTP

Se realizaron consultas a las páginas del frontend y a las rutas de la API para verificar sus respuestas.

| Recurso consultado | Código esperado | Código obtenido |
|---|---:|---:|
| Páginas del frontend y favicon | 200 | 200 |
| Estado del backend `/health` | 200 | 200 |
| Conexión con la base de datos | Conectada | `true` |
| Rutas de los módulos de la API | 200 | 200 |
| Ruta inexistente | 404 | 404 |
| Vehículo inexistente | 404 | 404 |
| Seguimiento con token falso | 404 | 404 |
| Filtro con estado incorrecto | 422 | 422 |
| Cabecera de seguridad HSTS | Presente | `max-age=63072000` |

Los resultados confirman que los servicios devuelven los códigos esperados. No se registraron respuestas con error 500 durante estas consultas.

### 4.2. Manejo de errores de red

Se simularon diferentes problemas para comprobar que la aplicación muestre mensajes adecuados y no deje de funcionar.

| Falla simulada | Resultado esperado | Chromium | Firefox | WebKit |
|---|---|---|---|---|
| La API no responde. | Muestra un aviso de conexión. | Aprobado | Aprobado | Aprobado |
| La API responde con error 500. | Muestra un mensaje de error. | Aprobado | Aprobado | Aprobado |
| La API tarda 3 segundos. | Muestra la carga y luego los datos. | Aprobado | Aprobado | Aprobado |
| Se pierde la conexión en seguimiento. | Muestra un mensaje de alerta. | Aprobado | Aprobado | Aprobado |

**Ejemplo de prueba ante una conexión fallida:**

```js
test('si la API no responde, el panel avisa sin romperse', async ({ page }) => {
  await page.route('**/api/v1/**', (ruta) =>
    ruta.abort('connectionrefused')
  )

  await page.goto('/')

  await expect(
    page.getByRole('alert').filter({
      hasText: 'No se pudo conectar con el servidor'
    })
  ).toBeVisible()

  await expect(
    page.getByRole('heading', { name: 'Pedidos', level: 1 })
  ).toBeVisible()
})
```

Esta prueba verifica que, cuando la API no responde, el sistema muestra un mensaje al usuario y mantiene visible la pantalla principal.

### 4.3. Disponibilidad del entorno desplegado

Se realizaron 20 consultas al frontend y 20 al endpoint `/health` del backend para comprobar que ambos servicios estuvieran disponibles.

| Servicio | Consultas | Exitosas | Disponibilidad | Tiempo promedio | Tiempo máximo |
|---|---:|---:|---:|---:|---:|
| Frontend | 20 | 20 | 100 % | 111 ms | 295 ms |
| Backend (`/health`) | 20 | 20 | 100 % | 252 ms | 277 ms |

Ambos servicios respondieron correctamente en todas las consultas realizadas.

**Nota:** El resultado corresponde al muestreo del 19/11/2026, aproximadamente a las 15:35, hora de Lima. Representa la disponibilidad durante la prueba y no un monitoreo continuo de 24 horas.

**Evidencia 41: Muestreo de disponibilidad en el reporte de Playwright**

![Evidencia 41: Muestreo de disponibilidad](../../06%20Otros/evidencias/Evidencia%2041%20Muestreo%20de%20disponibilidad.png)

---

## 5. Conclusión

La implementación de Playwright permitió comprobar el funcionamiento de EcoRuta Wanka mediante pruebas automatizadas en Chromium, Firefox y WebKit.

Los resultados principales fueron:

- Se aprobaron 79 pruebas, sin fallos ni pruebas inestables.
- Se verificaron los procesos de navegación, formularios y notificaciones.
- Se midieron las métricas Web Vitals y los tiempos de respuesta de la API.
- Se comprobaron los códigos HTTP y la disponibilidad del frontend y backend.
- Se verificó que la aplicación responda adecuadamente ante errores de conexión.

Las evidencias 38, 39, 40 y 41 respaldan los resultados de ejecución, las pruebas E2E, las métricas de rendimiento y la disponibilidad del sistema.

Con estas pruebas se verificó el funcionamiento de la aplicación desplegada y se identificaron aspectos que pueden seguir mejorándose en futuras versiones.

---

[Volver al README principal](../../../README.md)