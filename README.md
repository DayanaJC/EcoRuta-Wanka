# EcoRuta Wanka

**Plataforma web para apoyar la gestión logística de WankaLogística S.A.C.**, empresa de distribución ubicada en Huancayo, Junín, Perú, orientada a la atención de bodegas, restaurantes, farmacias, minimarkets y pequeños comercios.

---

## Tabla de contenido

1. [Descripción del proyecto](#descripción-del-proyecto)
2. [Problemática](#problemática)
3. [Objetivo](#objetivo)
4. [Tecnologías](#tecnologías)
5. [Arquitectura](#arquitectura)
6. [Estructura del proyecto](#estructura-del-proyecto)
7. [Configuración de servicios](#configuración-de-servicios)
8. [Variables de entorno](#variables-de-entorno)
9. [Ejecución local](#ejecución-local)
10. [Pruebas y CI/CD](#pruebas-y-cicd)
11. [Estrategia Git](#estrategia-git)
12. [Versionamiento](#versionamiento)
13. [Documentación](#documentación)
14. [Estado del proyecto](#estado-del-proyecto)

---

## Descripción del proyecto

**EcoRuta Wanka** es un proyecto académico del Proyecto de Fin de Asignatura (PFA) que busca apoyar la gestión logística de **WankaLogística S.A.C.**

El sistema permitirá organizar información relacionada con vehículos, pedidos, conductores, asignaciones y rutas de reparto optimizadas mediante una API de optimización de rutas. También contempla indicadores relacionados con distancia, consumo estimado y sostenibilidad.

El proyecto está orientado al contexto de distribución de **Huancayo, El Tambo, Chilca, Pilcomayo y zonas del valle del Mantaro**.

El desarrollo se organiza mediante entregas incrementales hasta alcanzar el **MVP v1.0.0**.

---

## Problemática

La gestión manual de pedidos y rutas puede generar dificultades como:

* recorridos innecesarios;
* retrasos en las entregas;
* dificultades para organizar los pedidos;
* poca información centralizada sobre los vehículos;
* problemas para asignar pedidos y conductores;
* dificultad para conocer indicadores de distancia, consumo y sostenibilidad.

EcoRuta Wanka busca centralizar esta información en una plataforma web para facilitar la planificación y gestión de las operaciones de reparto.

---

## Objetivo

Desarrollar una plataforma web que permita apoyar la gestión logística de WankaLogística S.A.C., organizando vehículos, pedidos, conductores, asignaciones y rutas, además de proporcionar información para el seguimiento y evaluación de la operación.

---

## Tecnologías

> **Cambio de stack (CC-01, 27/09/2026):** el proyecto migró de Python + FastAPI, React + Vite y Firebase a **Node.js + Express, Next.js y Neon (PostgreSQL)**.

| Componente                     | Tecnología                                            |
| ------------------------------ | ----------------------------------------------------- |
| Arquitectura                   | Cliente-servidor + patrón MVC con capa de servicios   |
| Comunicación                   | API REST (JSON)                                       |
| Frontend (Vista)               | Next.js (React) + JavaScript                          |
| Mapas                          | Leaflet + OpenStreetMap                               |
| Backend (Controlador y Modelo) | Node.js + Express                                     |
| Validación de datos            | Zod                                                   |
| Acceso a datos                 | Prisma ORM                                            |
| Base de datos                  | Neon (PostgreSQL)                                     |
| Optimización de rutas          | API de OpenRouteService (VROOM) + factores de tráfico |
| Geocodificación                | Nominatim (OpenStreetMap)                             |
| Autenticación                  | JWT + bcrypt                                          |
| Pruebas                        | Vitest + Supertest                                    |
| Pruebas E2E y monitoreo        | Playwright (Chromium, Firefox y WebKit)               |
| Integración y despliegue (CI/CD) | GitHub Actions + Vercel                             |
| Control de versiones           | Git + GitHub                                          |
| Gestión del proyecto           | Jira Software                                         |
| Documentación de API           | OpenAPI                                               |

### Justificación

* **API de optimización en lugar de un algoritmo propio:** OpenRouteService calcula el orden óptimo de visita sobre calles reales. El backend prepara los datos, llama a la API e interpreta la respuesta.
* **Factores de tráfico:** la API no considera el tráfico en tiempo real; EcoRuta Wanka ajusta los tiempos con factores configurables por franja horaria.
* **Node.js + Express:** adecuado para orquestar llamadas HTTP asíncronas con JSON y permite usar un solo lenguaje (JavaScript) en todo el sistema.
* **Next.js:** construido sobre React, permite reutilizar los componentes del prototipo.
* **Neon (PostgreSQL):** base de datos relacional con plan gratuito.
* **Zod y Prisma:** validación de datos y acceso a la base de datos con migraciones.
* **Vitest + Supertest:** pruebas de reglas de negocio y de los endpoints de la API.
* **Git y GitHub:** permiten controlar las versiones del código y trabajar mediante ramas y Pull Requests.
* **Jira Software:** permite organizar épicas, historias de usuario, tareas, sprints y releases.

---

## Arquitectura

EcoRuta Wanka utiliza una **arquitectura cliente-servidor**: el frontend (cliente) consume la **API REST** del backend (servidor). Internamente se aplica el patrón **MVC con capa de servicios**.

```text
CLIENTE                                   SERVIDOR
Vista (Next.js)  ── API REST (JSON) ──►   Controlador (Express)
                                             ↓
                                           Modelo: Servicios ──► API de OpenRouteService
                                             ↓
                                           Modelo: Repositorios (Prisma)
                                             ↓
                                           Neon (PostgreSQL)
```

### Partes del sistema

| Parte del MVC         | Responsabilidad                                                              |
| --------------------- | ---------------------------------------------------------------------------- |
| Vista                 | Pantallas y mapa con los que interactúa el usuario (Next.js).                |
| Controlador           | Recibe las solicitudes de la API, valida la entrada y devuelve la respuesta. |
| Modelo – Servicios    | Reglas de negocio e integración con la API de optimización de rutas.         |
| Modelo – Repositorios | Acceso a la información almacenada en Neon.                                  |

Esta organización permite separar responsabilidades y facilita el mantenimiento y evolución del proyecto.

---

## Estructura del proyecto

```text
EcoRuta-Wanka/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── middlewares/
│   │   ├── errors/
│   │   ├── utils/
│   │   ├── aplicacion.js
│   │   └── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.js
│   ├── tests/
│   ├── vitest.config.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── utils/
│   ├── .env.example
│   └── package.json
│
├── e2e/
│   ├── tests/
│   │   ├── e2e/
│   │   ├── rendimiento/
│   │   ├── disponibilidad/
│   │   └── apoyo/
│   ├── playwright.config.js
│   └── package.json
│
├── docs/
│   ├── 01 Inicio/
│   ├── 02 Planificacion/
│   ├── 03 Implementación/
│   │   ├── Sprint 1/
│   │   ├── Sprint 2/
│   │   ├── Sprint 3/
│   │   ├── Sprint 4/
│   │   └── reduccion del impacto ambiental/
│   ├── 04 Cierre/
│   ├── 05 Video proyecto/
│   └── 06 Otros/
│       └── evidencias/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── tests.yml
│   │   ├── deploy-production.yml
│   │   └── green-audit.yml
│   └── pull_request_template.md
│
├── lighthouserc.json
├── .gitignore
└── README.md
```

### Descripción de las principales carpetas

* **backend/**: contiene la API REST desarrollada con Node.js + Express.
* **frontend/**: contiene la interfaz web desarrollada con Next.js.
* **backend/prisma/**: contiene el modelo de datos, migraciones y datos iniciales.
* **docs/**: contiene la documentación académica del proyecto.
* **backend/tests/**: contiene las pruebas del backend.
* **e2e/**: contiene la suite de pruebas End-to-End, rendimiento y disponibilidad con Playwright.
* **.github/**: contiene la plantilla de Pull Request y los workflows de GitHub Actions (CI/CD).

---

## Configuración de servicios

### Base de datos (Neon)

1. Crear un proyecto en Neon.
2. Crear una rama de base de datos para desarrollo y otra para pruebas.
3. En **Connect**, copiar la cadena con pooling en `DATABASE_URL` y la directa en `DATABASE_URL_UNPOOLED`.
4. Aplicar el modelo de datos con las migraciones de Prisma.

### Optimización de rutas (OpenRouteService)

1. Crear una cuenta en OpenRouteService.
2. Solicitar un token.
3. Copiar el token en la variable `ORS_API_KEY` del backend.

Desde el 24/11/2026 el backend usa el dominio `api.heigit.org` (optimización VROOM en `/vroom/v0` y direcciones en `/openrouteservice/v2/directions/driving-car`), porque OpenRouteService retiró `api.openrouteservice.org`.

Las credenciales reales deben mantenerse fuera del repositorio.

---

## Variables de entorno

Copiar `backend/.env.example` como `backend/.env` y completar los valores:

```env
DATABASE_URL="postgresql://usuario:contraseña@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://usuario:contraseña@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require"
ORS_API_KEY=
PORT=4000
FRONTEND_URL=http://localhost:3000
ALMACEN_LATITUD=-12.0681
ALMACEN_LONGITUD=-75.2104
```

En el frontend, copiar `frontend/.env.example` como `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Los archivos `.env` deben permanecer excluidos mediante `.gitignore`.

**Nunca se deben publicar credenciales privadas en GitHub.**

---

## Ejecución local

Requisitos: Node.js 20 o superior.

### Backend (API REST)

```bash
cd backend
npm install
npm run db:deploy
npm run db:seed
npm run dev
npm test
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

### Endpoints principales

| Método | Endpoint                                 | Descripción                                      |
| ------ | ---------------------------------------- | ------------------------------------------------ |
| GET    | `/health`                                | Estado de la base de datos y de la optimización  |
| CRUD   | `/api/v1/vehiculos`                      | Gestión de flota (RF-01)                         |
| CRUD   | `/api/v1/pedidos`                        | Gestión de pedidos (RF-02)                       |
| CRUD   | `/api/v1/asignaciones`                   | Asignación de pedidos a vehículos                |
| POST   | `/api/v1/rutas`                          | Genera una ruta optimizada (RF-03)               |
| GET    | `/api/v1/rutas/:id`                      | Detalle con orden de entrega, horarios y trazado |
| PATCH  | `/api/v1/rutas/:id/estado`               | Inicia o cancela la ruta                         |
| PATCH  | `/api/v1/rutas/:id/paradas/:orden`       | Registra una parada                              |
| POST   | `/api/v1/rutas/:id/simular`              | Simula el reparto                                |
| GET    | `/api/v1/geocodificar?q=`                | Sugerencias de direcciones                       |
| GET    | `/api/v1/geocodificar/inversa?lat=&lon=` | Dirección de un punto                            |
| GET    | `/api/v1/factores-trafico`               | Factores de tráfico                              |
| CRUD   | `/api/v1/conductores`                    | Gestión de conductores (RF-08)                   |
| PATCH  | `/api/v1/rutas/:id/conductor`            | Asigna, cambia o quita el conductor (RN-009)     |
| GET    | `/api/v1/rutas?desde=&hasta=&geometria=` | Rutas de un periodo; con trazado para el mapa del día (RF-04) |
| GET    | `/api/v1/indicadores?desde=&hasta=&vehiculo_id=` | Indicadores de sostenibilidad del periodo (RF-05) |
| GET    | `/api/v1/reportes/sostenibilidad.pdf?desde=&hasta=&vehiculo_id=` | Reporte de sostenibilidad en PDF (RF-06) |
| CRUD   | `/api/v1/clientes`                       | Clientes y preferencias de entrega (RF-09)       |
| POST   | `/api/v1/rutas/:id/incidentes`           | Registra un incidente y reoptimiza la ruta (RF-07) |
| GET    | `/api/v1/pedidos/:id/notificaciones`     | Avisos enviados al cliente del pedido (US-010)   |
| GET    | `/api/v1/seguimiento/:token`             | Seguimiento público del pedido (US-010)          |
| GET    | `/api/v1/seguimiento?q=`                 | Consulta pública por código, DNI/RUC o teléfono (US-010) |

---

## Pruebas y CI/CD

### Pruebas locales

```bash
# Pruebas unitarias y de integración del backend
cd backend
npm test

# Suite E2E, rendimiento y disponibilidad con Playwright
cd e2e
npm install
npx playwright install chromium firefox webkit
npx playwright test
npx playwright show-report reportes/html
```

### Workflows de GitHub Actions

| Workflow | Archivo | Qué hace | Se ejecuta |
| -------- | ------- | -------- | ---------- |
| CI | [`ci.yml`](.github/workflows/ci.yml) | Instala y valida dependencias, auditoría de seguridad, lint (ESLint), análisis estático, validación del esquema Prisma y compilación del frontend y backend. | `push` y `pull_request` a `main` y `develop` |
| Tests | [`tests.yml`](.github/workflows/tests.yml) | Pruebas unitarias e integración (Vitest) con cobertura y suite E2E de Playwright en modo headless en Chromium, Firefox y WebKit. Guarda los reportes como artefactos. | `push` y `pull_request` a `main` y `develop` |
| Deploy Production | [`deploy-production.yml`](.github/workflows/deploy-production.yml) | Vuelve a probar el backend, ordena el despliegue en Vercel (Deploy Hooks) y comprueba que la API (con base de datos conectada) y el sitio web respondan en producción. | `push` a `main` o tag `v*` |
| Green IT & Performance Audit | [`green-audit.yml`](.github/workflows/green-audit.yml) | Auditoría Lighthouse CI con los límites de rendimiento del proyecto. | `push` y `pull_request` a `main` |

Para que el workflow ordene el despliegue en Vercel se usan dos secretos en **Settings → Secrets and variables → Actions**: `VERCEL_DEPLOY_HOOK_BACKEND` y `VERCEL_DEPLOY_HOOK_FRONTEND` (Deploy Hooks de cada proyecto en Vercel → Settings → Git). Mientras no existan, el workflow solo comprueba que la versión publicada en producción funciona.

Las credenciales de la base de datos y de OpenRouteService se guardan como variables de entorno en Vercel y nunca en el repositorio.

---

## Estrategia Git

El proyecto utiliza **Git y GitHub** para controlar las versiones y coordinar el desarrollo.

Se trabaja mediante ramas para separar los cambios y Pull Requests para revisar las modificaciones antes de integrarlas.

Flujo general:

```text
Rama de trabajo
      ↓
Pull Request
      ↓
Revisión
      ↓
Integración
      ↓
Versión estable
```

La integración del código debe realizarse manteniendo el historial del proyecto y evitando subir credenciales o información sensible.

---

## Versionamiento

El proyecto utiliza **Semantic Versioning**:

```text
MAJOR.MINOR.PATCH
```

Ejemplo:

```text
v1.0.0
```

La versión objetivo del proyecto es:

**v1.0.0 — MVP EcoRuta Wanka**

Durante el desarrollo se pueden generar versiones intermedias para registrar avances y cambios importantes.

---

# Documentación

La documentación del proyecto se encuentra organizada de acuerdo con las etapas del proyecto:

```text
docs/
│
├── 01 Inicio/
├── 02 Planificacion/
├── 03 Implementación/
│   ├── Sprint 1/
│   ├── Sprint 2/
│   ├── Sprint 3/
│   ├── Sprint 4/
│   └── reduccion del impacto ambiental/
├── 04 Cierre/
├── 05 Video proyecto/
└── 06 Otros/
    └── evidencias/
```

---

## 01. Inicio

Documentos relacionados con la definición, alcance, requisitos, usuarios, reglas de negocio, tecnologías y restricciones del proyecto.

| #  | Documento                                                                                                                  |
| -- | -------------------------------------------------------------------------------------------------------------------------- |
| 1  | [Selección del enfoque del proyecto](docs/01%20Inicio/01.%20Selecci%C3%B3n%20del%20enfoque%20del%20proyecto%20V_1_0_0.md)  |
| 2  | [Acta de constitución](docs/01%20Inicio/02.%20Acta%20de%20constituci%C3%B3n%20V_1_0_0.md)                                  |
| 3  | [Declaración de la visión](docs/01%20Inicio/03.%20Declaraci%C3%B3n%20de%20la%20visi%C3%B3n%20V_1_0_0.md)                   |
| 4  | [Registro de supuestos y restricciones](docs/01%20Inicio/04.%20Registro%20de%20supuestos%20y%20restricciones%20V_1_0_0.md) |
| 5  | [Registro de interesados](docs/01%20Inicio/05.%20Registro%20de%20interesados%20V_1_0_0.md)                                 |
| 6  | [Requisitos funcionales](docs/01%20Inicio/06.%20Requisitos%20funcionales%20V_1_0_0.md)                                     |
| 7  | [Requisitos no funcionales](docs/01%20Inicio/07.%20Requisitos%20no%20funcionales%20V_1_0_0.md)                             |
| 8  | [Usuarios](docs/01%20Inicio/08.%20Usuarios%20V_1_0_0.md)                                                                   |
| 9  | [Reglas de negocio](docs/01%20Inicio/09.%20Reglas%20de%20negocio%20V_1_0_0.md)                                             |
| 10 | [Stack tecnológico](docs/01%20Inicio/10.%20Stack%20tecnol%C3%B3gico%20V_1_0_0.md)                                          |
| 11 | [Base de datos](docs/01%20Inicio/11.%20Base%20de%20datos%20V_1_0_0.md)                                                     |
| 12 | [Modelo C4](docs/01%20Inicio/12.%20Modelo%20C4%20V_1_0_0.md)                                                               |
| 13 | [Restricciones](docs/01%20Inicio/13.%20Restricciones%20V_1_0_0.md)                                                         |

---

## 02. Planificación

Documentos relacionados con la planificación ágil, Jira, riesgos y presupuesto.

| # | Documento                                                                                               |
| - | ------------------------------------------------------------------------------------------------------- |
| 1 | [Transformando a ágil](docs/02%20Planificacion/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md)    |
| 2 | [Artefactos Jira](docs/02%20Planificacion/02%20Artefactos%20Jira%20V_1_0_0.md)                     |
| 3 | [Registro de riesgos](docs/02%20Planificacion/03%20Registro%20de%20riesgos%20V_1_0_0.md)           |
| 4 | [Presupuesto del proyecto](docs/02%20Planificacion/04%20Presupuesto%20del%20proyecto%20V_1_0_0.md) |

---

## 03. Implementación

La documentación de implementación está organizada por Sprint.

### Sprint 1

**Periodo:** 10/09/2026 – 25/09/2026

**Historias completadas:** US-001, US-002 y US-003

**Story Points:** 23 SP

| # | Documento                                                                                                                            |
| - | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1 | [Informe de estado del proyecto](docs/03%20Implementaci%C3%B3n/Sprint%201/01.%20Informe%20de%20estado%20del%20proyecto%20V_1_0_0.md) |
| 2 | [Registro de Impedimentos](docs/03%20Implementaci%C3%B3n/Sprint%201/02.%20Registro%20de%20Impedimentos%20V_1_0_0.md)                 |
| 3 | [Revisión del Sprint](docs/03%20Implementaci%C3%B3n/Sprint%201/03.%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md)                      |
| 4 | [Retrospectiva del Sprint](docs/03%20Implementaci%C3%B3n/Sprint%201/04.%20Retrospectiva%20del%20Sprint%20V_1_0_0.md)                 |

### Sprint 2

**Periodo:** 28/09/2026 – 08/10/2026

**Historias completadas:** US-004, US-005, US-006 y US-008

**Story Points:** 29 SP

| # | Documento                                                                                                                            |
| - | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1 | [Informe de estado del proyecto](docs/03%20Implementaci%C3%B3n/Sprint%202/01.%20Informe%20de%20estado%20del%20proyecto%20V_1_0_0.md) |
| 2 | [Registro de Impedimentos](docs/03%20Implementaci%C3%B3n/Sprint%202/02.%20Registro%20de%20Impedimentos%20V_1_0_0.md)                 |
| 3 | [Revisión del Sprint](docs/03%20Implementaci%C3%B3n/Sprint%202/03.%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md)                      |
| 4 | [Retrospectiva del Sprint](docs/03%20Implementaci%C3%B3n/Sprint%202/04.%20Retrospectiva%20del%20Sprint%20V_1_0_0.md)                 |

### Sprint 3

**Periodo:** 23/10/2026 – 29/10/2026

**Historias completadas:** US-007 y US-009

**Story Points:** 18 SP

| # | Documento |
| - | --------- |
| 1 | [Revisión del Sprint](docs/03%20Implementaci%C3%B3n/Sprint%203/01%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md) |
| 2 | [Retrospectiva del Sprint](docs/03%20Implementaci%C3%B3n/Sprint%203/02%20Retrospectiva%20del%20Sprint%20V_1_0_0.md) |
| 3 | [Calidad de código (SonarQube)](docs/03%20Implementaci%C3%B3n/Sprint%203/03%20Calidad%20de%20c%C3%B3digo%20V_1_0_0.md) |
| 4 | [Seguridad OWASP Top 10](docs/03%20Implementaci%C3%B3n/Sprint%203/04%20OWASP%20V_1_0_0.md) |
| 5 | [Accesibilidad WCAG 2.2](docs/03%20Implementaci%C3%B3n/Sprint%203/05%20WCAG%20V_1_0_0.md) |

### Sprint 4

**Periodo:** 14/11/2026 – 19/11/2026

**Historias completadas:** US-010

**Story Points:** 8 SP

| # | Documento |
| - | --------- |
| 1 | [Revisión del Sprint](docs/03%20Implementaci%C3%B3n/Sprint%204/01%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md) |
| 2 | [Retrospectiva del Sprint](docs/03%20Implementaci%C3%B3n/Sprint%204/02%20Retrospectiva%20del%20Sprint%20V_1_0_0.md) |
| 3 | [Análisis con Playwright (E2E, rendimiento y disponibilidad)](docs/03%20Implementaci%C3%B3n/Sprint%204/03%20Analisis%20PlayWrigth%20V_1_0_0.md) |
| 4 | [Evaluación de usabilidad (SUS)](docs/03%20Implementaci%C3%B3n/Sprint%204/04%20Usabilidad%20V_1_0_0.md) |

**Estado de los workflows del Sprint 4:**

[![CI](https://github.com/DayanaJC/EcoRuta-Wanka/actions/workflows/ci.yml/badge.svg)](https://github.com/DayanaJC/EcoRuta-Wanka/actions/workflows/ci.yml)
[![Tests](https://github.com/DayanaJC/EcoRuta-Wanka/actions/workflows/tests.yml/badge.svg)](https://github.com/DayanaJC/EcoRuta-Wanka/actions/workflows/tests.yml)
[![Deploy Production](https://github.com/DayanaJC/EcoRuta-Wanka/actions/workflows/deploy-production.yml/badge.svg)](https://github.com/DayanaJC/EcoRuta-Wanka/actions/workflows/deploy-production.yml)

### Reducción del impacto ambiental (Green IT)

| # | Documento |
| - | --------- |
| 1 | [Informe de reducción del impacto ambiental](docs/03%20Implementaci%C3%B3n/reduccion%20del%20impacto%20ambiental/01%20Informe%20de%20reduccion%20del%20impacto%20ambiental%20V_1_0_0.md) |
| 2 | [Estándares de ingeniería de software](docs/03%20Implementaci%C3%B3n/reduccion%20del%20impacto%20ambiental/02%20Estandares%20Ingenier%C3%ADa%20de%20software%20V_1_0_0.md) |

---

## 04. Cierre

Documentos de gestión y cierre del proyecto (estado, variaciones, valor ganado, tableros, radiadores, reporte final y lecciones aprendidas).

| # | Documento |
| - | --------- |
| 1 | [Reporte de Estado](docs/04%20Cierre/01%20Reporte%20de%20Estado%20V_1_0_0.md) |
| 2 | [Reporte de Variación](docs/04%20Cierre/02%20Reporte%20de%20Variaci%C3%B3n%20V_1_0_0.md) |
| 3 | [Reporte de Análisis de Valor Ganado - EVM](docs/04%20Cierre/03%20Reporte%20de%20An%C3%A1lisis%20de%20Valor%20Ganado%20-%20EVM%20V_1_0_0.md) |
| 4 | [Tableros de Control - Híbridos](docs/04%20Cierre/04%20Tableros%20de%20Control%20-%20H%C3%ADbridos%20V_1_0_0.md) |
| 5 | [Radiadores de Información](docs/04%20Cierre/05%20Radiadores%20de%20Informaci%C3%B3n%20V_1_0_0.md) |
| 6 | [Reporte Final del Proyecto](docs/04%20Cierre/06%20Reporte%20Final%20del%20Proyecto%20V_1_0_0.md) |
| 7 | [Reporte Final de Lecciones Aprendidas](docs/04%20Cierre/07%20Reporte%20Final%20de%20Lecciones%20Aprendidas%20V_1_0_0.md) |

---

## 05. Video del proyecto

Video en formato `.mp4` (elevator pitch y demostración funcional) ubicado en `docs/05 Video proyecto/`.

| Video | Duración | Calidad | Contenido |
| ----- | -------- | ------- | --------- |
| [EcoRuta Wanka - Video del Proyecto V_1_0_0.mp4](docs/05%20Video%20proyecto/EcoRuta%20Wanka%20-%20Video%20del%20Proyecto%20V_1_0_0.mp4) | 5 min 12 s | Full HD (1920 × 1080, 30 fps) | Elevator pitch (problema, solución, propuesta de valor y público objetivo) y demostración funcional del sistema desplegado |

---

## 06. Otros

### Evidencias

Las evidencias del proyecto se encuentran organizadas en:

`docs/06 Otros/evidencias/`

Incluyen las evidencias relacionadas con:

* Jira y planificación.
* Sprint 1.
* Sprint 2.
* Sprint 3 (evidencias 17 a 26).
* Reducción del impacto ambiental (evidencias 27 a 34).
* Sprint 4 (evidencias 35 a 45).
* Tableros de control del cierre (evidencias 46 a 49).
* Radiadores de información del cierre (evidencias 50 a 54).
* Demostraciones y avances del proyecto.

---

## Estado del proyecto

### Sprint 1

**EW Sprint 1:** 3 de 3 historias completadas:

* **US-001** – Gestión de flota vehicular – 5 SP
* **US-002** – Gestión de pedidos de reparto – 5 SP
* **US-003** – Generación de rutas optimizadas por vehículo – 13 SP

**Total:** 23 SP.

### Sprint 2

**EW Sprint 2:** 4 de 4 historias completadas:

* **US-004** – Visualización de rutas en mapa interactivo – 8 SP
* **US-005** – Dashboard de indicadores de sostenibilidad – 8 SP
* **US-006** – Reporte de sostenibilidad en PDF – 5 SP
* **US-008** – Registro y asignación de conductores a rutas – 8 SP

**Total:** 29 SP.

### Sprint 3

**EW Sprint 3:** 2 de 2 historias completadas:

* **US-007** – Reoptimización dinámica de rutas ante incidentes – 13 SP
* **US-009** – Preferencias de entrega de clientes y bodegas – 5 SP

**Total:** 18 SP.

### Sprint 4

**EW Sprint 4:** 1 de 1 historia completada:

* **US-010** – Avisos al cliente y seguimiento público del pedido – 8 SP

**Total:** 8 SP.

### Avance acumulado

| Sprint    | Historias completadas | Story Points |
| --------- | --------------------: | -----------: |
| Sprint 1  |                     3 |        23 SP |
| Sprint 2  |                     4 |        29 SP |
| Sprint 3  |                     2 |        18 SP |
| Sprint 4  |                     1 |         8 SP |
| **Total** |                **10** |    **78 SP** |

Todas las historias planificadas se encuentran completadas.

### Cierre del proyecto

El proyecto se cerró el **26/11/2026**, antes de la fecha planificada (06/12/2026), con todos sus entregables:

| Indicador | Resultado |
| --------- | --------- |
| Alcance | 10 de 10 historias (78 SP) y 7 documentos de cierre |
| Cronograma | SPI 1,077: terminó 10 días antes de lo planificado |
| Costo | CPI 0,939; costo final S/ 61,884.25, dentro del presupuesto aprobado (S/ 65,049.60) |
| Calidad | 131 pruebas del backend y 79 pruebas E2E aprobadas; cobertura de 86,1 % |
| Usabilidad | SUS 79,06 (grado A−) |
| Video | Elevator pitch y demostración funcional (5 min 12 s) |

El detalle está en los [documentos de cierre](#04-cierre) y en el [video del proyecto](#05-video-del-proyecto).

| Componente             | URL                                       |
| ---------------------- | ----------------------------------------- |
| Aplicación web (Vista) | https://ecoruta-frontend.vercel.app       |
| API REST               | https://ecoruta-backend.vercel.app/health |

El detalle de los avances se encuentra en la documentación correspondiente a cada Sprint:

* [Documentación Sprint 1](docs/03%20Implementaci%C3%B3n/Sprint%201/)
* [Documentación Sprint 2](docs/03%20Implementaci%C3%B3n/Sprint%202/)
* [Documentación Sprint 3](docs/03%20Implementaci%C3%B3n/Sprint%203/)
* [Documentación Sprint 4](docs/03%20Implementaci%C3%B3n/Sprint%204/)
* [Documentación de Cierre](docs/04%20Cierre/)
* [Video del proyecto](docs/05%20Video%20proyecto/)

---

## Información del proyecto

**Proyecto:** EcoRuta Wanka

**Organización:** WankaLogística S.A.C.

**Ubicación:** Huancayo, Junín, Perú

**Líder del proyecto:** Javier Curi Dayana

**Integrantes:** Javier Curi Dayana, Arroyo Canchari Henry

**Arquitectura:** Cliente-servidor + MVC con capa de servicios

**Tipo:** Proyecto académico — PFA

---

*Proyecto académico — Proyecto de Fin de Asignatura. Los datos de WankaLogística S.A.C. corresponden a un escenario simulado.*
