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
7. [Configuración de Firebase](#configuración-de-firebase)
8. [Variables de entorno](#variables-de-entorno)
9. [Estrategia Git](#estrategia-git)
10. [Versionamiento](#versionamiento)
11. [Documentación](#documentación)

---

## Descripción del proyecto

**EcoRuta Wanka** es un proyecto académico del Proyecto de Fin de Asignatura (PFA) que busca apoyar la gestión logística de **WankaLogística S.A.C.**

El sistema permitirá organizar información relacionada con vehículos, pedidos, conductores, asignaciones y rutas de reparto. También contempla indicadores relacionados con distancia, consumo estimado y sostenibilidad.

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

| Componente           | Tecnología               |
| -------------------- | ------------------------ |
| Frontend             | React 19 + Vite          |
| Backend              | Python 3.13 + FastAPI    |
| Validación de datos  | Pydantic                 |
| Base de datos        | Firebase Cloud Firestore |
| Servicios Firebase   | Firebase Admin SDK       |
| Autenticación        | Firebase Authentication  |
| Pruebas              | Pytest                   |
| Control de versiones | Git + GitHub             |
| Gestión del proyecto | Jira Software            |
| Documentación de API | OpenAPI / Swagger        |

### Justificación

* **Python:** permite desarrollar el backend con una sintaxis clara y cuenta con herramientas para procesamiento de datos y futuras funcionalidades de optimización.
* **FastAPI:** permite construir la API REST del sistema y facilita la validación de datos y documentación mediante OpenAPI/Swagger.
* **Pydantic:** permite validar los datos utilizados por los servicios del sistema.
* **Firebase Firestore:** proporciona una base de datos en la nube adecuada para el proyecto.
* **Firebase Authentication:** permite gestionar el acceso de los usuarios.
* **React:** permite construir una interfaz mediante componentes reutilizables.
* **Vite:** proporciona un entorno rápido para el desarrollo del frontend.
* **Pytest:** permite realizar pruebas sobre las funcionalidades y reglas del sistema.
* **Git y GitHub:** permiten controlar las versiones del código y trabajar mediante ramas y Pull Requests.
* **Jira Software:** permite organizar épicas, historias de usuario, tareas, sprints y releases.

---

## Arquitectura

EcoRuta Wanka utiliza **Arquitectura por Capas** para organizar las responsabilidades del sistema.

La solución está formada por un frontend y un backend. El backend se organiza en las capas de presentación, negocio y datos.

```text
Frontend React
      ↓
API REST / FastAPI
      ↓
Capa de Presentación
      ↓
Capa de Negocio
      ↓
Capa de Datos
      ↓
Firebase Cloud Firestore
```

### Capas del sistema

| Capa          | Responsabilidad                                                                |
| ------------- | ------------------------------------------------------------------------------ |
| Presentación  | Recibe las solicitudes y comunica las operaciones del sistema mediante la API. |
| Negocio       | Contiene las reglas y procesos principales del proyecto.                       |
| Datos         | Gestiona el acceso y almacenamiento de información.                            |
| Base de datos | Firestore almacena la información del sistema.                                 |

Esta organización permite separar responsabilidades y facilita el mantenimiento y evolución del proyecto.

---

## Estructura del proyecto

```text
EcoRuta-Wanka/
│
├── backend/
│   ├── app/
│   │   ├── presentation/
│   │   ├── business/
│   │   ├── data/
│   │   ├── schemas/
│   │   └── config/
│   │
│   ├── credentials/
│   ├── tests/
│   ├── .env.example
│   ├── requirements.txt
│   └── pytest.ini
│
├── frontend/
│   ├── src/
│   └── ...
│
├── database/
│
├── docs/
│   ├── 01 Inicio/
│   ├── 02 Planificacion/
│   ├── 03 Ejecucion/
│   ├── 04 Seguimiento_control/
│   ├── 05 Cierre/
│   └── 06 Otros/
│       └── evidencias/
│
├── .gitignore
└── README.md
```

### Descripción de las principales carpetas

* **backend/**: contiene la API REST desarrollada con FastAPI.
* **frontend/**: contiene la interfaz web desarrollada con React y Vite.
* **database/**: contiene documentación relacionada con el modelo de datos.
* **docs/**: contiene la documentación académica del proyecto.
* **credentials/**: contiene archivos locales de credenciales que no deben ser publicados.
* **tests/**: contiene las pruebas del backend.

---

## Configuración de Firebase

Para configurar Firebase en el backend:

1. Crear o seleccionar el proyecto de Firebase.
2. Configurar **Cloud Firestore**.
3. Configurar **Firebase Authentication** según los roles definidos para el sistema.
4. Generar las credenciales necesarias para el Firebase Admin SDK.
5. Guardar las credenciales en:

```text
backend/credentials/serviceAccountKey.json
```

6. Configurar la ruta de las credenciales mediante el archivo `.env`.

Las credenciales reales deben mantenerse fuera del repositorio.

---

## Variables de entorno

Copiar:

```text
backend/.env.example
```

como:

```text
backend/.env
```

y completar los valores necesarios.

Ejemplo:

```env
FIREBASE_CREDENTIALS_PATH=credentials/serviceAccountKey.json
```

El archivo `backend/.env` y las credenciales de Firebase deben permanecer excluidos mediante `.gitignore`.

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
* base de datos.

### Planificación

`docs/02 Planificacion/`

Contiene la planificación del proyecto y los artefactos relacionados con Jira:

* transformación a metodología ágil;
* configuración y evidencias de Jira;
* registro de riesgos;
* presupuesto del proyecto.

### Ejecución

`docs/03 Ejecucion/`

Contiene la documentación correspondiente al desarrollo del sistema.

### Seguimiento y control

`docs/04 Seguimiento_control/`

Contiene información relacionada con el seguimiento del proyecto, control de cambios, commits, ramas y Pull Requests.

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
**Arquitectura:** Arquitectura por Capas
**Tipo:** Proyecto académico — PFA

---

*Proyecto académico — Proyecto de Fin de Asignatura. Los datos de WankaLogística S.A.C. corresponden a un escenario simulado.*
