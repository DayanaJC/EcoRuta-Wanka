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

> **Cambio de stack (CC-01, 27/09/2026):** el proyecto migró de Python + FastAPI, React + Vite y Firebase a **Node.js + Express, Next.js y Neon (PostgreSQL)**. El prototipo inicial puede consultarse en el historial de Git (commit `846a165` de `main`). Detalle en [Registro de control de cambios](docs/04%20Seguimiento_control/01%20Registro%20de%20control%20de%20cambios%20V_1_2_0.md).

| Componente               | Tecnología                                   |
| ------------------------ | -------------------------------------------- |
| Arquitectura             | Cliente-servidor + patrón MVC con capa de servicios |
| Comunicación             | API REST (JSON)                              |
| Frontend (Vista)         | Next.js (React) + JavaScript                 |
| Mapas                    | Leaflet + OpenStreetMap                      |
| Backend (Controlador y Modelo) | Node.js + Express                      |
| Validación de datos      | Zod                                          |
| Acceso a datos           | Prisma ORM                                   |
| Base de datos            | Neon (PostgreSQL)                            |
| Optimización de rutas    | API de OpenRouteService (VROOM) + factores de tráfico |
| Geocodificación          | Nominatim (OpenStreetMap)                    |
| Autenticación            | JWT + bcrypt                                 |
| Pruebas                  | Vitest + Supertest                           |
| Control de versiones     | Git + GitHub                                 |
| Gestión del proyecto     | Jira Software                                |
| Documentación de API     | OpenAPI                                      |

### Justificación

* **API de optimización en lugar de un algoritmo propio:** OpenRouteService calcula el orden óptimo de visita sobre calles reales (capacidad, ventanas de entrega y tiempos). El backend prepara los datos, llama a la API e interpreta la respuesta.
* **Factores de tráfico:** la API no considera el tráfico en tiempo real; EcoRuta Wanka ajusta los tiempos con factores configurables por franja horaria.
* **Node.js + Express:** adecuado para orquestar llamadas HTTP asíncronas con JSON y permite usar un solo lenguaje (JavaScript) en todo el sistema.
* **Next.js:** construido sobre React, permite reutilizar los componentes del prototipo.
* **Neon (PostgreSQL):** base de datos relacional con plan gratuito; garantiza las relaciones entre pedidos, vehículos, asignaciones y rutas mediante claves foráneas.
* **Zod y Prisma:** validación de datos y acceso tipado a la base de datos con migraciones.
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
                                             ↓                  (orden óptimo + factores de tráfico)
                                          Modelo: Repositorios (Prisma)
                                             ↓
                                          Neon (PostgreSQL)
```

### Partes del sistema

| Parte del MVC            | Responsabilidad                                                              |
| ------------------------ | ---------------------------------------------------------------------------- |
| Vista                    | Pantallas y mapa con los que interactúa el usuario (Next.js).                |
| Controlador              | Recibe las solicitudes de la API, valida la entrada y devuelve la respuesta. |
| Modelo – Servicios       | Reglas de negocio e integración con la API de optimización de rutas.         |
| Modelo – Repositorios    | Acceso a la información almacenada en Neon.                                  |

Esta organización permite separar responsabilidades y facilita el mantenimiento y evolución del proyecto.

---

## Estructura del proyecto

```text
EcoRuta-Wanka/
│
├── backend/                 # API REST con Node.js + Express
│   ├── src/
│   │   ├── routes/          # Definición de endpoints /api/v1/...
│   │   ├── controllers/     # Controlador (MVC)
│   │   ├── services/        # Modelo: reglas de negocio y APIs externas
│   │   ├── repositories/    # Modelo: acceso a datos con Prisma
│   │   ├── schemas/         # Validación con Zod
│   │   ├── middlewares/     # Validación y manejo de errores
│   │   ├── errors/          # Errores de dominio
│   │   ├── utils/           # Conversión de horas y fechas (zona horaria de Lima)
│   │   ├── aplicacion.js    # Ensamblaje de la aplicación (inyección de dependencias)
│   │   └── server.js        # Arranque local y exportación para Vercel
│   ├── prisma/
│   │   ├── schema.prisma    # Modelo de datos de Neon
│   │   ├── migrations/
│   │   └── seed.js          # Datos iniciales
│   ├── tests/               # Vitest + Supertest (71 pruebas)
│   ├── vitest.config.js     # Configuración de pruebas y cobertura
│   ├── .env.example
│   └── package.json
│
├── frontend/                # Vista con Next.js
│   ├── app/                 # Layout y página (App Router)
│   ├── components/          # Pantallas, formularios y mapa
│   ├── services/            # Cliente de la API
│   ├── utils/
│   ├── .env.example
│   └── package.json
│
├── docs/
│   ├── 01 Inicio/
│   ├── 02 Planificacion/
│   ├── 03 Implementación/
│   ├── 04 Seguimiento_control/
│   ├── 05 Cierre/
│   └── 06 Otros/
│       └── evidencias/
│
├── .github/
│   └── pull_request_template.md   # Lista de verificación de la Definition of Done
│
├── .gitignore
└── README.md
```

### Descripción de las principales carpetas

* **backend/**: contiene la API REST desarrollada con Node.js + Express.
* **frontend/**: contiene la interfaz web desarrollada con Next.js.
* **backend/prisma/**: modelo de datos, migraciones y datos iniciales de la base de datos (el diseño se documenta en `docs/01 Inicio/11. Base de datos`).
* **docs/**: contiene la documentación académica del proyecto.
* **backend/tests/**: contiene las pruebas del backend (`npm test` y `npm run test:coverage`).
* **.github/**: plantilla de Pull Request con la Definition of Done.

---

## Configuración de servicios

### Base de datos (Neon)

1. Crear un proyecto en [Neon](https://neon.tech) (plan gratuito).
2. Crear una rama de base de datos para desarrollo y otra para pruebas.
3. En **Connect**, copiar la cadena con pooling en `DATABASE_URL` y la directa en `DATABASE_URL_UNPOOLED` (backend).
   Con Prisma 7 la conexión se configura en `backend/prisma.config.ts`, no en `schema.prisma`.
4. Aplicar el modelo de datos con las migraciones de Prisma.

### Optimización de rutas (OpenRouteService)

1. Crear una cuenta en [account.heigit.org](https://account.heigit.org) (sin tarjeta).
2. Solicitar un token del plan *Standard* (o el plan *Collaborative* con el correo institucional).
3. Copiar el token en la variable `ORS_API_KEY` del backend.

Las credenciales reales deben mantenerse fuera del repositorio.

---

## Variables de entorno

Copiar `backend/.env.example` como `backend/.env` y completar los valores:

```env
# Con pooling (host "-pooler"): la usa la aplicación
DATABASE_URL="postgresql://usuario:contraseña@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
# Directa (sin "-pooler"): la usa Prisma para las migraciones
DATABASE_URL_UNPOOLED="postgresql://usuario:contraseña@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require"
ORS_API_KEY=
PORT=4000
FRONTEND_URL=http://localhost:3000
# Opcional: almacén de salida (por defecto, Plaza de la Constitución de Huancayo)
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
npm install                 # instala dependencias y genera el cliente de Prisma
npm run db:deploy           # crea las tablas en Neon (migraciones de Prisma)
npm run db:seed             # factores de tráfico y datos de prueba de Huancayo
npm run dev                 # http://localhost:4000
npm test                    # pruebas con Vitest + Supertest
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev                 # http://localhost:3000
```

### Endpoints principales

| Método | Endpoint                          | Descripción                                        |
| ------ | --------------------------------- | -------------------------------------------------- |
| GET    | `/health`                         | Estado de la base de datos y de la optimización    |
| CRUD   | `/api/v1/vehiculos`               | Gestión de flota (RF-01)                           |
| CRUD   | `/api/v1/pedidos`                 | Gestión de pedidos (RF-02)                         |
| CRUD   | `/api/v1/asignaciones`            | Asignación de pedidos a vehículos                  |
| POST   | `/api/v1/rutas`                   | Genera una ruta optimizada (RF-03)                 |
| GET    | `/api/v1/rutas/:id`               | Detalle con orden de entrega, horarios y trazado   |
| PATCH  | `/api/v1/rutas/:id/estado`        | Inicia (`en_reparto`) o cancela la ruta            |
| PATCH  | `/api/v1/rutas/:id/paradas/:orden`| Registra una parada: `entregada` o `no_entregada` + motivo |
| POST   | `/api/v1/rutas/:id/simular`       | Simula el reparto tramo a tramo (`imprevistos`, `probabilidad_no_entrega`) |
| GET    | `/api/v1/geocodificar?q=`         | Sugerencias de direcciones (Nominatim)             |
| GET    | `/api/v1/geocodificar/inversa?lat=&lon=` | Dirección de un punto marcado en el mapa |
| GET    | `/api/v1/factores-trafico`        | Factores de tráfico por franja horaria             |

### Flujo de entregas

Los estados del pedido los mueve la ruta; a mano solo se puede **cancelar** un pedido pendiente.

```text
Ruta:    generada ──Iniciar reparto──▶ en_reparto ──(última parada registrada)──▶ completada
Pedido:  pendiente ─────────────────▶ en_ruta ──Entregada──▶ entregado (con fecha y hora)
                                              └─No entregada (motivo)─▶ pendiente (se vuelve a planificar)
```

- Cada entrega guarda la **hora real** y si cayó **dentro de la ventana** del cliente: con eso se calcula el indicador O2 (entregas fuera de horario).
- Cancelar una ruta devuelve a `pendiente` los pedidos que aún no se resolvieron.
- Un pedido no puede estar en dos rutas activas a la vez.
- El **simulador** recorre la ruta tramo a tramo: sale del almacén (0–2 min de carga), maneja cada tramo con el tiempo planificado afectado por el tráfico (×0,95–1,25; con imprevistos ×1,0–1,6), espera si llega antes de la ventana, atiende al cliente (tiempo de servicio ×0,8–1,4) y registra la entrega al terminar la atención. Los retrasos se acumulan; la ruta se completa con la última parada y `regreso_at` guarda la llegada al almacén (tramo de regreso con tráfico). Usa las mismas reglas que el registro manual (y que la futura app del conductor).

Ejemplo de generación de ruta:

```json
POST /api/v1/rutas
{ "vehiculo_id": "…", "pedido_ids": ["…", "…"], "fecha": "2026-09-28", "hora_salida": "08:00" }
```

La respuesta incluye el orden de entrega (`paradas`), la hora estimada de cada entrega, la distancia, el tiempo total, el factor de tráfico aplicado y la geometría para el mapa.

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

## Documentación

La documentación del proyecto está en `docs/`, organizada por fases. Todos los enlaces son relativos y cada documento tiene un enlace de regreso a este README.

### Entregables del Sprint 1 (`docs/03 Implementación/`)

| # | Documento | Contenido |
| --- | --- | --- |
| 1 | [01 Informe de estado del proyecto V_1_0_0](docs/03%20Implementaci%C3%B3n/01%20Informe%20de%20estado%20del%20proyecto%20V_1_0_0.md) | Estado del Sprint 1: historias, indicadores, Definition of Done y pendientes |
| 2 | [02 Registro de Impedimentos V_1_0_0](docs/03%20Implementaci%C3%B3n/02%20Registro%20de%20Impedimentos%20V_1_0_0.md) | Impedimentos técnicos, operativos y organizativos con prioridad, estado y resolución |
| 3 | [03 Revisión del Sprint V_1_0_0](docs/03%20Implementaci%C3%B3n/03%20Revisi%C3%B3n%20del%20Sprint%20V_1_0_0.md) | Historias completadas con trazabilidad a pruebas, guion y evidencias de la demostración |
| 4 | [04 Retrospectiva del Sprint V_1_0_0](docs/03%20Implementaci%C3%B3n/04%20Retrospectiva%20del%20Sprint%20V_1_0_0.md) | Aprendizajes, aciertos, mejoras por eje y plan de acción |

Evidencias de la demostración (capturas del sistema en producción): `docs/06 Otros/evidencias/` (Evidencias 6 a 12).

### Inicio (`docs/01 Inicio/`)

* [01. Selección del enfoque del proyecto V_1_0_0](docs/01%20Inicio/01.%20Selecci%C3%B3n%20del%20enfoque%20del%20proyecto%20V_1_0_0.md)
* [02. Acta de constitución V_1_0_0](docs/01%20Inicio/02.%20Acta%20de%20constituci%C3%B3n%20V_1_0_0.md)
* [03. Declaración de la visión V_1_0_0](docs/01%20Inicio/03.%20Declaraci%C3%B3n%20de%20la%20visi%C3%B3n%20V_1_0_0.md)
* [04. Registro de supuestos y restricciones V_1_0_0](docs/01%20Inicio/04.%20Registro%20de%20supuestos%20y%20restricciones%20V_1_0_0.md)
* [05. Registro de interesados V_1_0_0](docs/01%20Inicio/05.%20Registro%20de%20interesados%20V_1_0_0.md)
* [06. Requisitos funcionales V_1_0_0](docs/01%20Inicio/06.%20Requisitos%20funcionales%20V_1_0_0.md)
* [07. Requisitos no funcionales V_1_0_0](docs/01%20Inicio/07.%20Requisitos%20no%20funcionales%20V_1_0_0.md)
* [08. Usuarios V_1_0_0](docs/01%20Inicio/08.%20Usuarios%20V_1_0_0.md)
* [09. Reglas de negocio V_1_0_0](docs/01%20Inicio/09.%20Reglas%20de%20negocio%20V_1_0_0.md)
* [10. Stack tecnológico V_1_0_0](docs/01%20Inicio/10.%20Stack%20tecnol%C3%B3gico%20V_1_0_0.md)
* [11. Base de datos V_1_0_0](docs/01%20Inicio/11.%20Base%20de%20datos%20V_1_0_0.md)
* [12. Modelo C4 V_1_0_0](docs/01%20Inicio/12.%20Modelo%20C4%20V_1_0_0.md)
* [13. Restricciones V_1_0_0](docs/01%20Inicio/13.%20Restricciones%20V_1_0_0.md)

### Planificación (`docs/02 Planificacion/`)

* [01 Transformando a ágil V_1_0_0](docs/02%20Planificacion/01%20Transformando%20a%20%C3%A1gil%20V_1_0_0.md)
* [02 Artefactos Jira V_1_0_0](docs/02%20Planificacion/02%20Artefactos%20Jira%20V_1_0_0.md)
* [03 Registro de riesgos V_1_0_0](docs/02%20Planificacion/03%20Registro%20de%20riesgos%20V_1_0_0.md)
* [04 Presupuesto del proyecto V_1_0_0](docs/02%20Planificacion/04%20Presupuesto%20del%20proyecto%20V_1_0_0.md)

Evidencias de Jira: `docs/06 Otros/evidencias/` (Evidencias 1 a 5).

### Cierre (`docs/05 Cierre/`)

Se completará al finalizar el proyecto.

---

## Estado del proyecto

**EW Sprint 1 cerrado el 02/10/2026:** 3 de 3 historias completadas (US-001, US-002 y US-003; 23 SP), 29,5 % del MVP v1.0.0 (78 SP).

| Componente | URL |
| --- | --- |
| Aplicación web (Vista) | https://ecoruta-frontend.vercel.app |
| API REST | https://ecoruta-backend.vercel.app/health |

El detalle está en el [Informe de estado del proyecto](docs/03%20Implementaci%C3%B3n/01%20Informe%20de%20estado%20del%20proyecto%20V_1_0_0.md).

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
