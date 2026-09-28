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
9. [Estrategia Git](#estrategia-git)
10. [Versionamiento](#versionamiento)
11. [Documentación](#documentación)

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

> **Cambio de stack (CC-01, 27/09/2026):** el proyecto migra de Python + FastAPI, React + Vite y Firebase a **Node.js + Express, Next.js y Neon (PostgreSQL)**. El código actual de `backend/` y `frontend/` corresponde al **prototipo inicial** y se migrará por módulos. Detalle en [Registro de control de cambios](docs/04%20Seguimiento_control/01%20Registro%20de%20control%20de%20cambios%20V_1_1_0.md).

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

Estructura objetivo después de la migración (CC-01):

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
│   │   └── config/
│   ├── prisma/
│   │   └── schema.prisma    # Modelo de datos de Neon
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── frontend/                # Vista con Next.js
│   ├── app/
│   ├── components/
│   ├── services/
│   └── package.json
│
├── database/
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
├── .gitignore
└── README.md
```

> Mientras dure la migración, `backend/app/` (FastAPI) y `frontend/src/` (Vite) contienen el prototipo inicial.

### Descripción de las principales carpetas

* **backend/**: contiene la API REST desarrollada con Node.js + Express.
* **frontend/**: contiene la interfaz web desarrollada con Next.js.
* **database/**: contiene documentación relacionada con el modelo de datos.
* **docs/**: contiene la documentación académica del proyecto.
* **tests/**: contiene las pruebas del backend.

---

## Configuración de servicios

### Base de datos (Neon)

1. Crear un proyecto en [Neon](https://neon.tech) (plan gratuito).
2. Crear una rama de base de datos para desarrollo y otra para pruebas.
3. Copiar la cadena de conexión en la variable `DATABASE_URL` del backend.
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
DATABASE_URL=postgresql://usuario:contraseña@host.neon.tech/ecoruta?sslmode=require
ORS_API_KEY=
JWT_SECRET=
FRONTEND_URL=http://localhost:3000
```

En el frontend, crear `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Los archivos `.env` deben permanecer excluidos mediante `.gitignore`.

**Nunca se deben publicar credenciales privadas en GitHub.**

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

La documentación del proyecto se encuentra organizada por fases:

### Inicio

`docs/01 Inicio/`

Contiene la documentación relacionada con el inicio y definición del proyecto:

* enfoque del proyecto;
* acta de constitución;
* visión;
* supuestos y restricciones;
* interesados;
* requisitos funcionales;
* requisitos no funcionales;
* usuarios;
* reglas de negocio;
* stack tecnológico;
* base de datos;
* modelo C4;
* restricciones.

### Planificación

`docs/02 Planificacion/`

Contiene la planificación del proyecto y los artefactos relacionados con Jira:

* transformación a metodología ágil;
* configuración y evidencias de Jira;
* registro de riesgos;
* presupuesto del proyecto.

### Implementación

`docs/03 Implementación/`

Contiene los documentos de seguimiento y cierre del Sprint 1:

* [01 Informe de estado del proyecto V_1_1_0.md](docs/03 Implementación/01 Informe de estado del proyecto V_1_1_0.md)
* [02 Registro de Impedimentos V_1_1_0.md](docs/03 Implementación/02 Registro de Impedimentos V_1_1_0.md)
* [03 Revisión del Sprint V_1_1_0.md](docs/03 Implementación/03 Revisión del Sprint V_1_1_0.md)
* [04 Retrospectiva del Sprint V_1_1_0.md](docs/03 Implementación/04 Retrospectiva del Sprint V_1_1_0.md)

> **Volver al [README](../README.md)**

### Seguimiento y control

`docs/04 Seguimiento_control/`

Contiene información relacionada con el seguimiento del proyecto, control de cambios, commits, ramas y Pull Requests.

* [01 Registro de control de cambios V_1_1_0.md](docs/04%20Seguimiento_control/01%20Registro%20de%20control%20de%20cambios%20V_1_1_0.md)

### Cierre

`docs/05 Cierre/`

Contiene la documentación correspondiente al cierre del proyecto, resultados y conclusiones.

### Otros

`docs/06 Otros/`

Contiene recursos complementarios y evidencias del proyecto.

Las evidencias de Jira se encuentran en:

```text
docs/06 Otros/evidencias/
```

---

## Estado del proyecto

**EcoRuta Wanka** se encuentra en desarrollo dentro del Proyecto de Fin de Asignatura.

El proyecto tiene como objetivo alcanzar el **MVP v1.0.0**, de acuerdo con los requisitos, planificación y entregables definidos en la documentación.

---

## Información del proyecto

**Proyecto:** EcoRuta Wanka
**Organización:** WankaLogística S.A.C.
**Ubicación:** Huancayo, Junín, Perú
**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana
**Arquitectura:** Cliente-servidor + MVC con capa de servicios
**Tipo:** Proyecto académico — PFA

---

*Proyecto académico — Proyecto de Fin de Asignatura. Los datos de WankaLogística S.A.C. corresponden a un escenario simulado.*
