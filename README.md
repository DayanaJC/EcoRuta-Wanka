# EcoRuta Wanka

Plataforma web para apoyar la gestión logística de **WankaLogística S.A.C.**, empresa de distribución de Huancayo (Junín, Perú), orientada a bodegas, restaurantes, farmacias, minimarkets y pequeños comercios de la región.

## Tabla de contenido

1. [Descripción del proyecto](#descripción-del-proyecto)
2. [Problemática](#problemática)
3. [Objetivo](#objetivo)
4. [Tecnologías](#tecnologías)
5. [Arquitectura por capas](#arquitectura-por-capas)
6. [Estructura del proyecto](#estructura-del-proyecto)
7. [Configuración de Firebase](#configuración-de-firebase)
8. [Variables de entorno](#variables-de-entorno)
9. [Estrategia Git](#estrategia-git)
10. [Versionamiento](#versionamiento)
11. [Documentación](#documentación)

---

## Descripción del proyecto

EcoRuta Wanka es un proyecto académico (Proyecto de Fin de Asignatura) que busca digitalizar la gestión logística de WankaLogística S.A.C. La empresa organiza actualmente sus pedidos y rutas de manera manual, lo que genera recorridos innecesarios, mayor consumo de combustible y retrasos en las entregas.

El proyecto evolucionará en versiones incrementales hasta llegar al **PMV `v1.0.0`**. La versión actual:

- **`v0.1.0`** — Fundamentos: estructura, arquitectura por capas, configuración del backend con FastAPI, frontend con React + Vite, Firebase Firestore y estrategia Git.

## Problemática

La organización manual de pedidos y rutas ocasiona:

- recorridos innecesarios;
- consumo elevado de combustible;
- retrasos en las entregas;
- poca información sobre los vehículos;
- dificultad para controlar entregas y medir costos.

## Objetivo

Desarrollar una plataforma web para apoyar la gestión logística de WankaLogística S.A.C., permitiendo organizar los pedidos de distribución y, posteriormente, optimizar rutas considerando distancia, tiempo, combustible y sostenibilidad.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Python 3.12+, FastAPI, Pydantic |
| Base de datos | Firebase Firestore (Firebase Admin SDK) |
| Frontend | React, Vite, react-router-dom |
| Pruebas | Pytest |
| Control de versiones | Git + GitHub (Git Flow) |

### Justificación

- **Python**: sintaxis sencilla y ecosistema amplio para futuras funcionalidades de optimización y análisis de datos.
- **FastAPI**: APIs REST rápidas, validación con Pydantic y documentación OpenAPI/Swagger automática.
- **Pydantic**: validación de datos de entrada para garantizar pedidos correctos.
- **Firebase Firestore**: base NoSQL administrada en la nube, sin configuración de infraestructura; ideal para un proyecto académico.
- **React**: interfaces mediante componentes reutilizables, facilitando incorporar módulos futuros (vehículos, rutas, dashboards).
- **Vite**: entorno de desarrollo rápido y ligero para React.
- **Pytest**: pruebas unitarias de las reglas de negocio.
- **Git/GitHub**: control de versiones, ramas y colaboración mediante Pull Requests (exigido por la consigna).

## Arquitectura por capas

```
Frontend React
      ↓
API REST / FastAPI
      ↓
Capa de presentación  (presentation/controllers)
      ↓
Capa de negocio       (business/services)
      ↓
Capa de datos         (data/repositories)
      ↓
Firebase Firestore
```

Reglas de la arquitectura:

- los controllers NO contienen lógica de negocio;
- los servicios acceden a datos SOLO mediante repositorios;
- los repositorios implementan Firestore;
- la configuración de Firebase está separada.

## Estructura del proyecto

```
EcoRuta-Wanka/
├── backend/                 # API REST (FastAPI, arquitectura por capas)
│   ├── app/                 # presentación, negocio, datos, schemas, config
│   ├── credentials/         # .gitkeep (el JSON real NO se versiona)
│   ├── tests/               # unit/ e integration/
│   ├── .env.example
│   ├── requirements.txt
│   └── pytest.ini
├── frontend/                # Interfaz de usuario (React + Vite)
├── database/                # Documentación de la base de datos (Firestore)
├── docs/                    # Documentación del proyecto por fases
│   ├── inicio/
│   ├── planificacion/
│   ├── ejecucion/
│   ├── seguimiento_control/
│   ├── cierre/
│   └── otros/
├── .gitignore
└── README.md
```

## Configuración de Firebase

1. Crear un proyecto en la [Firebase Console](https://console.firebase.google.com).
2. En **Configuración del proyecto → Cuentas de servicio**, generar una clave (service account) en JSON.
3. Guardar el JSON en `backend/credentials/serviceAccountKey.json` (carpeta excluida por `.gitignore`).
4. Indicar su ruta en `backend/.env` mediante `FIREBASE_CREDENTIALS_PATH=credentials/serviceAccountKey.json`.

## Variables de entorno

Copiar `backend/.env.example` a `backend/.env` y completar el valor:

- `FIREBASE_CREDENTIALS_PATH` — ruta relativa (a `backend/`) o absoluta del JSON de Firestore.

> `backend/.env` y `backend/credentials/*` están excluidos por `.gitignore`. Nunca subir credenciales a GitHub.

## Estrategia Git

Se utiliza **Git Flow**:

- rama `main`: versiones estables (etiquetadas).
- rama `develop`: integración del desarrollo.
- ramas `feature/*`: funcionalidades o tareas.

Flujo:

```
feature/*  → Pull Request →  develop  → Pull Request →  main  → tag vX.Y.Z
```

## Versionamiento

Se utiliza **Semantic Versioning** (`MAJOR.MINOR.PATCH`). El PMV final será **`v1.0.0`**.

- `v0.1.0` — Fundamentos del proyecto.

## Documentación

- [docs/inicio](docs/inicio/) — descripción, problemática, objetivo, actores, alcance.
- [docs/planificacion](docs/planificacion/) — alcance de cada versión, arquitectura, riesgos.
- [docs/ejecucion](docs/ejecucion/) — desarrollo implementado.
- [docs/seguimiento_control](docs/seguimiento_control/) — evolución, commits, ramas, PRs.
- [docs/cierre](docs/cierre/) — resultados y conclusiones.

> La documentación formal se agregará progresivamente en cada fase del proyecto.

---

*Proyecto académico — Proyecto de Fin de Asignatura. Datos de empresas ficticios.*