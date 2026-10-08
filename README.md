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
10. [Estrategia Git](#estrategia-git)
11. [Versionamiento](#versionamiento)
12. [Documentación](#documentación)

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
├── docs/
│   ├── 01 Inicio/
│   ├── 02 Planificación/
│   ├── 03 Implementación/
│   │   ├── Sprint 1/
│   │   └── Sprint 2/
│   ├── 04 Seguimiento_control/
│   ├── 05 Cierre/
│   └── 06 Otros/
│       └── evidencias/
│
├── .github/
│   └── pull_request_template.md
│
├── .gitignore
└── README.md
```

### Descripción de las principales carpetas

* **backend/**: contiene la API REST desarrollada con Node.js + Express.
* **frontend/**: contiene la interfaz web desarrollada con Next.js.
* **backend/prisma/**: contiene el modelo de datos, migraciones y datos iniciales.
* **docs/**: contiene la documentación académica del proyecto.
* **backend/tests/**: contiene las pruebas del backend.
* **.github/**: contiene la plantilla de Pull Request.

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
├── 02 Planificación/
├── 03 Implementación/
│   ├── Sprint 1/
│   └── Sprint 2/
├── 04 Seguimiento_control/
├── 05 Cierre/
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
| 1 | [Transformando a ágil](docs/02%20Planificaci%C3%B3n/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md)    |
| 2 | [Artefactos Jira](docs/02%20Planificaci%C3%B3n/02%20Artefactos%20Jira%20V_1_0_0.md)                     |
| 3 | [Registro de riesgos](docs/02%20Planificaci%C3%B3n/03%20Registro%20de%20riesgos%20V_1_0_0.md)           |
| 4 | [Presupuesto del proyecto](docs/02%20Planificaci%C3%B3n/04%20Presupuesto%20del%20proyecto%20V_1_0_0.md) |

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

---

## 04. Seguimiento y control

Documentación relacionada con el seguimiento de cambios realizados durante el proyecto.

Actualmente se encuentra pendiente de completar al finalizar el desarrollo del proyecto.

---

## 05. Cierre

Esta sección contiene los documentos correspondientes al cierre del proyecto.

Actualmente se encuentra pendiente de completar al finalizar el desarrollo del proyecto.

---

## 06. Otros

### Evidencias

Las evidencias del proyecto se encuentran organizadas en:

`docs/06 Otros/evidencias/`

Incluyen las evidencias relacionadas con:

* Jira y planificación.
* Sprint 1.
* Sprint 2.
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

### Avance acumulado

| Sprint    | Historias completadas | Story Points |
| --------- | --------------------: | -----------: |
| Sprint 1  |                     3 |        23 SP |
| Sprint 2  |                     4 |        29 SP |
| **Total** |                 **7** |    **52 SP** |

Las historias **US-007** y **US-009** permanecen pendientes para los siguientes Sprints.

| Componente             | URL                                       |
| ---------------------- | ----------------------------------------- |
| Aplicación web (Vista) | https://ecoruta-frontend.vercel.app       |
| API REST               | https://ecoruta-backend.vercel.app/health |

El detalle de los avances se encuentra en la documentación correspondiente a cada Sprint:

* [Documentación Sprint 1](docs/03%20Implementaci%C3%B3n/Sprint%201/)
* [Documentación Sprint 2](docs/03%20Implementaci%C3%B3n/Sprint%202/)

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
