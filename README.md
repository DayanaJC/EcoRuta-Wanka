# EcoRuta Wanka

Plataforma web para apoyar la gestión logística de **WankaLogística S.A.C.**, empresa de distribución de Huancayo (Junín, Perú), orientada a bodegas, restaurantes, farmacias, minimarkets y pequeños comercios de la región.

## Tabla de contenido

1. [Descripción del proyecto](#descripción-del-proyecto)
2. [Problemática](#problemática)
3. [Objetivo](#objetivo)
4. [Tecnologías](#tecnologías)
5. [Arquitectura](#arquitectura)
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

## Arquitectura

EcoRuta Wanka implementa una **Arquitectura Hexagonal (Puertos y Adaptadores)** sobre una API REST, conforme al stack documentado (`docs/01 Inicio/10. Stack tecnológico`) y al modelo de solución de referencia:

```
Frontend React (SPA)
      ↓ HTTP/JSON
API REST / FastAPI          (adaptador de entrada → puerto)
      ↓
Capa de presentación        (presentation/controllers, dependencies)
      ↓
Capa de dominio             (business/models, business/services: reglas de negocio)
      ↓
Puertos / contratos         (data/repositories: interfaces de repositorio)
      ↓
Adaptadores de salida       (data/repositories/firebase: repositorios Firestore)
      ↓
Firebase Cloud Firestore
```

La estructura interna `schemas → presentation → business → data` define la separación de responsabilidades de la implementación; los `schemas` de Pydantic validan la entrada/salida. Reglas de la arquitectura:

- los adaptadores de entrada (controllers) NO contienen lógica de negocio;
- los servicios del dominio dependen SOLO de puertos (interfaces de repositorio);
- los adaptadores de salida (repositorios Firestore) implementan los puertos;
- la capa de dominio es pura y se prueba con repositorios en memoria (Pytest);
- la configuración de Firebase está separada (`app/config`) y se carga por variables de entorno.

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
│   ├── 01 Inicio/           # Requisitos, actores y documentos de inicio
│   ├── 02 Planificacion/    # Transformación a ágil y artefactos de Jira
│   ├── 03 Ejecucion/        # Ejecución del desarrollo
│   ├── 04 Seguimiento_control/  # Seguimiento y control
│   ├── 05 Cierre/           # Cierre del proyecto
│   └── 06 Otros/            # Otros recursos
│       └── evidencias/      # Capturas reales de Jira (evidencias)
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
- `v1.0.0` — MVP EcoRuta Wanka: release objetivo gestionada en Jira (EW Sprint 1). Ver `docs/02 Planificacion/02 Artefactos Jira V_1_0_0.md`.

## Documentación

- [docs/01 Inicio](docs/01%20Inicio/) — descripción, problemática, objetivo, actores, requisitos y alcance.
- [docs/02 Planificacion](docs/02%20Planificacion/) — transformación a ágil, artefactos de Jira y planificación.
- [docs/03 Ejecucion](docs/03%20Ejecucion/) — desarrollo implementado.
- [docs/04 Seguimiento_control](docs/04%20Seguimiento_control/) — evolución, commits, ramas y PRs.
- [docs/05 Cierre](docs/05%20Cierre/) — resultados y conclusiones.
- [docs/06 Otros](docs/06%20Otros/) — evidencias y recursos complementarios.

> La documentación formal se agregará progresivamente en cada fase del proyecto.

---

*Proyecto académico — Proyecto de Fin de Asignatura. Datos de empresas ficticios.*