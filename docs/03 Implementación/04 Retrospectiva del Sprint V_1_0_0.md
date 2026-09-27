# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 04. Retrospectiva del Sprint V_1_0_0

**Versión:** V_1_0_0 | **Fecha:** 25/09/2026 | **Actualizado:** 27/09/2026 (CC-01 – Cambio de stack y arquitectura) | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

**Sprint:** EW Sprint 1 (11/09/2026 – 25/09/2026)

---

## 1. ¿Qué aprendimos?

### 1.1 Aprendizajes técnicos

La implementación de la generación de rutas demostró que una primera versión funcional puede construirse de forma rápida y clara siguiendo la organización en capas del prototipo. Sin embargo, la revisión del código mostró que esa versión guarda los pedidos en el orden seleccionado y no optimiza la ruta. Se aprendió que calcular rutas óptimas sobre calles reales (capacidad, ventanas de entrega y tiempos de viaje) requiere un motor especializado. Por ello, el equipo decidió utilizar la API de OpenRouteService y concentrar su esfuerzo en las reglas de negocio y en una mejora propia: los factores de tráfico por franja horaria (CC-01).

El uso de repositorios abstractos en el backend permitió que las pruebas unitarias del servicio de rutas funcionaran con repositorios de memoria sin necesidad de conexión real a Firestore. Este patrón de inyección de dependencias facilita enormemente el desarrollo y la prueba de las funcionalidades, y se mantiene en el nuevo stack: los repositorios con Prisma y la API de optimización podrán simularse en las pruebas con Vitest.

Se aprendió que la integración del frontend con el backend requiere una correspondencia exacta entre los endpoints del API y los métodos del servicio de API del frontend. Cualquier discrepancia en las rutas o en los nombres de los métodos genera errores de importación o de ejecución.

Al reevaluar el stack se aprendió que el modelo de datos del proyecto es relacional (pedidos, vehículos, asignaciones y rutas se referencian entre sí), por lo que una base de datos PostgreSQL como Neon garantiza mejor esas relaciones que una base documental. También se valoró que usar un solo lenguaje (JavaScript) en el frontend y el backend facilita que ambos integrantes trabajen en todo el sistema.

### 1.2 Aprendizajes de gestión y organización

La planificación del sprint con 23 Story Points para dos desarrolladores resultó viable cuando el trabajo se distribuyó de forma coordinada. La clave fue que el backend tenía una base sólida previa (vehículos, pedidos, asignaciones) que permitió concentrar el esfuerzo en el desarrollo frontend y la nueva funcionalidad de rutas.

Se aprendió que crear módulos frontend independientes (vehículos, rutas) con su propio componente de lista, formulario y detalle, siguiendo el mismo patrón que los módulos existentes (pedidos), permite una integración limpia en `App.jsx` sin generar código duplicado.

### 1.3 Aprendizajes sobre requisitos

La documentación de requisitos funcionales proporcionó una guía clara para el desarrollo. Los criterios de aceptación en formato Gherkin facilitaron la comprensión de lo que debía implementarse. Se aprendió que la trazabilidad entre requisitos, historias de usuario y código fuente es esencial para mantener la coherencia del proyecto.

---

## 2. ¿Qué estamos haciendo bien?

### 2.1 Calidad del código backend

El código del backend presenta una calidad destacable. La organización en capas se refleja en el directorio `backend/app/` del prototipo, con subcarpetas claras para presentación, negocio, datos, esquemas y configuración. Esta separación se conserva en el patrón MVC con capa de servicios adoptado en CC-01. Los servicios de dominio son independientes de la infraestructura, lo que facilita las pruebas unitarias. El sistema de excepciones de dominio con mapeo a códigos HTTP es un patrón limpio y efectivo.

Las pruebas unitarias y de integración cubren los cuatro módulos principales (vehículos, pedidos, asignaciones, rutas) con **70 pruebas pasando**. La cobertura de pruebas contribuye a la confiabilidad del código y permite detectar regresiones rápidamente.

### 2.2 Coherencia en la interfaz de usuario

El frontend mantiene una interfaz coherente con un sistema de colores, badges, tipografías y espaciado uniformes definidos en `App.css`. Los componentes reutilizables (`Badges.jsx`) facilitan el mantenimiento de la consistencia visual. Los formularios cuentan con validación visible y mensajes de estado claros.

Los módulos de Vehículos y Rutas siguen el mismo patrón visual y de interacción que los módulos de Pedidos y Asignaciones, lo que facilita la navegación para el usuario.

### 2.3 Documentación técnica previa

La documentación inicial del proyecto en `docs/01 Inicio/` es completa y bien organizada. Los requisitos funcionales, requisitos no funcionales, usuarios, reglas de negocio y stack tecnológico están todos documentados y son coherentes entre sí. Esto ha permitido al equipo desarrollar el código con una referencia clara.

### 2.4 Uso de control de versiones

El uso de Git y GitHub con la rama `develop` se mantiene de forma organizada. La estrategia de ramas y Pull Requests se ha seguido, lo que permite la revisión de cambios antes de la integración.

### 2.5 Integración frontend-backend

En el prototipo, la comunicación entre el frontend (React + Vite) y el backend (FastAPI) funciona correctamente a través de los endpoints REST con prefijo `/api/v1/`. El servicio `api.js` centraliza todas las llamadas HTTP con un manejo consistente de errores y respuestas JSON. El contrato de la API (`/api/v1/...`) se mantendrá en el nuevo backend con Express para facilitar la migración del frontend.

---

## 3. ¿Qué podemos hacer mejor?

### 3.1 Personas

#### Distribución de tareas entre backend y frontend

La distribución del trabajo durante el Sprint 1 muestra que la base del backend ya estaba bien establecida antes del sprint, lo que permitió concentrar el esfuerzo en el desarrollo frontend y la nueva funcionalidad de rutas. Para sprints futuros, se recomienda:

* Asignar tareas específicas a cada integrante con claridad sobre qué módulo frontend y qué módulo backend se trabajarán.
* Establecer un esquema de pares donde cada integrante revise el código del otro antes de integrarlo.
* Descomponer las historias grandes en tareas más pequeñas y verificables para facilitar la distribución.

#### Coordinación diaria

Con solo dos integrantes, la coordinación diaria es fundamental. Se recomienda establecer una reunión breve diaria (daily standup) de 15 minutos para sincronizar avances, identificar bloqueos y alinear prioridades. Esto evitaría que un integrante trabaje en una tarea que el otro ya ha comenzado o finalizado.

### 3.2 Relaciones

#### Comunicación entre integrantes

La comunicación entre los dos integrantes del equipo debe intensificarse para evitar solapamientos de trabajo y para asegurar que ambos conocimientos del código sean compartidos. Un posible problema es que un integrante se enfoque exclusivamente en el backend y el otro en el frontend, pero en este sprint se logró que ambos contribuyeran a ambos lados.

Se recomienda que ambos integrantes revisen y comprendan el código de ambas partes para mantener la continuidad del proyecto.

#### Integración de cambios en Git

Dado que el equipo trabaja sobre una sola rama `develop`, es importante que los Pull Requests se revisen antes de ser fusionados para evitar conflictos de integración. La comunicación sobre qué se está trabajando en cada momento es clave para evitar conflictos en archivos compartidos como `App.jsx`.

### 3.3 Procesos

#### Planificación del sprint

El Sprint 1 planificó 23 Story Points para dos desarrolladores en un periodo de 14 días. La estimación fue adecuada dado que la base del backend ya existía. Para el siguiente sprint se recomienda:

* Descomponer las historias grandes en tareas más pequeñas y verificables.
* Priorizar la implementación completa de una historia antes de comenzar otra.
* Considerar que la documentación y las pruebas también requieren tiempo.

#### Seguimiento del avance

Se recomienda utilizar el tablero de Jira de forma más activa durante el sprint para actualizar el estado de las tareas diariamente. Esto permitiría tener una visión más precisa del avance y detectar retrasos a tiempo.

#### Definición de "Hecho"

Se recomienda definir y acordar explícitamente qué significa que una historia está "completa" en el contexto de EcoRuta Wanka. Por ejemplo, ¿una historia está completa solo cuando el backend y el frontend están implementados y probados? ¿O es suficiente con el backend funcional? La retrospectiva de este sprint muestra que la falta de una definición clara puede generar confusión sobre el estado real de las historias: US-003 se registró como completada aunque la ruta aún no se optimiza.

### 3.4 Herramientas

#### Jira Software

El uso de Jira para la planificación del sprint y el seguimiento de historias está implementado, pero su uso activo durante el sprint podría mejorarse. Se recomienda actualizar los estados de las tareas diariamente y utilizar los comentarios para registrar bloqueos e impedimentos.

#### GitHub

GitHub se utiliza para el control de versiones y las revisiones de código. Se recomienda:

* Utilizar ramas feature específicas para cada historia de usuario del sprint (por ejemplo, `feature/us-001-vehiculos`, `feature/us-003-rutas`).
* Agregar más detalles en los mensajes de commit para facilitar la trazabilidad.

#### Neon y API de optimización

Con el cambio de stack (CC-01), Firebase deja de utilizarse. Se recomienda configurar desde el inicio la base de datos en Neon, con una rama separada para pruebas, y la API key de OpenRouteService, controlando el consumo diario de su plan gratuito. La autenticación se implementará con JWT en el backend.

#### Entorno de desarrollo

El uso de VS Code con extensiones apropiadas, Pytest para pruebas y oxlint para linting del frontend fue adecuado para el prototipo; con el nuevo stack se utilizarán Vitest, Supertest y ESLint. Se recomienda documentar las configuraciones de entorno en el README para facilitar la incorporación de nuevos integrantes o la configuración de nuevas máquinas de desarrollo.

### 3.5 Acciones a realizar

| # | Acción | Responsable | Fecha límite | Prioridad |
| --- | --- | --- | --- | --- |
| ACC-01 | Definir y documentar la "Definición de Hecho" para cada historia de usuario. | Ambos integrantes | 02/10/2026 | Alta |
| ACC-02 | Configurar Neon (ramas de desarrollo y pruebas) y la API key de OpenRouteService en el entorno de desarrollo local. | Responsable técnico | 02/10/2026 | Alta |
| ACC-03 | Establecer reuniones diarias (daily standup) de 15 minutos durante el sprint. | Ambos integrantes | Desde EW Sprint 2 | Media |
| ACC-04 | Crear ramas feature para cada historia de usuario del sprint. | Ambos integrantes | Desde EW Sprint 2 | Media |
| ACC-05 | Descomponer US-004 en tareas más pequeñas y verificables para el siguiente sprint. | Ambos integrantes | 02/10/2026 | Alta |
| ACC-06 | Actualizar el tablero de Jira diariamente durante el sprint. | Ambos integrantes | Desde EW Sprint 2 | Media |
| ACC-07 | Implementar la autenticación con JWT y el control de acceso por roles en el backend y el frontend (RF-10). | Ambos integrantes | Desde EW Sprint 2 | Media |
| ACC-08 | Implementar la visualización de rutas en un mapa (Leaflet + OpenStreetMap) para mejorar la usabilidad. | Ambos integrantes | Desde EW Sprint 2 | Media |
| ACC-09 | Documentar el proceso de configuración del entorno de desarrollo en el README. | Ambos integrantes | 02/10/2026 | Baja |
| ACC-10 | Migrar los módulos de vehículos, pedidos y asignaciones a Node.js + Express + Neon, y el frontend a Next.js (CC-01). | Ambos integrantes | Cierre del Sprint 1 | Alta |
| ACC-11 | Implementar el cálculo de rutas optimizadas de US-003 con la API de OpenRouteService y los factores de tráfico. | Ambos integrantes | Cierre del Sprint 1 | Alta |

---


