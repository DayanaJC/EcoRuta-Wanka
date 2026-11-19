// Configuración de Playwright para EcoRuta Wanka (Sprint 4).
// Por defecto prueba el entorno desplegado en Vercel (producción).
// Para probar otro entorno: BASE_URL=http://localhost:3000 API_URL=http://localhost:4000/api/v1 npx playwright test
import { defineConfig, devices } from '@playwright/test'

export const BASE_URL = process.env.BASE_URL ?? 'https://ecoruta-frontend.vercel.app'
export const API_URL = process.env.API_URL ?? 'https://ecoruta-backend.vercel.app/api/v1'

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers: 3,
  retries: 1, // un reintento: el backend en Vercel puede tardar en "despertar" (arranque en frío)
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
        // En la PC del equipo, Windows no abre Firefox desde la carpeta de Playwright;
        // se usa una copia en otra carpeta: FIREFOX_PATH=%LOCALAPPDATA%\pw-firefox\firefox.exe
        ...(process.env.FIREFOX_PATH ? { launchOptions: { executablePath: process.env.FIREFOX_PATH } } : {}),
      },
    },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  outputFolder: undefined,
  outputDir: 'reportes/artefactos',
})
