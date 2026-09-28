# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 01. Informe de estado del proyecto V_1_1_0

**Versión:** V_1_1_0 | **Fecha:** 27/09/2026 | **Versión anterior:** V_1_0_0 (25/09/2026) – cambio CC-01 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

**Sprint:** EW Sprint 1 (11/09/2026 – 25/09/2026)

**Sprint Goal:** Implementar la gestión básica de vehículos y pedidos para disponer de información válida que permita generar rutas optimizadas de reparto.

---

## 1. Introducción

El presente documento reporta el estado del proyecto **EcoRuta Wanka** durante el **Sprint 1**, correspondiente a la primera entrega incremental del MVP v1.0.0.

> **Actualización 27/09/2026 – CC-01:** el Sprint 1 continúa en curso. Durante el sprint el equipo cambió el stack tecnológico (de Python + FastAPI, React + Vite y Firestore a Node.js + Express, Next.js y Neon) y adoptó la arquitectura cliente-servidor con el patrón MVC con capa de servicios. Lo descrito en este documento corresponde al **prototipo inicial** construido con el stack anterior, que permitió validar las reglas de negocio. Además, la revisión del código mostró que la generación de rutas aún no calcula el orden óptimo de visita. Por ello, el estado de las historias se actualiza a **En progreso**. Ver `docs/04 Seguimiento_control/01 Registro de control de cambios V_1_1_0.md`.

El sprint contempló la implementación de tres historias de usuario seleccionadas del backlog, con un total de **23 Story Points**:

| Historia | Épica | Story Points |
| --- | --- | ---: |
| US-001 – Gestión de flota vehicular | EP-01 | 5 |
| US-002 – Gestión de pedidos de reparto | EP-02 | 5 |
| US-003 – Generación de rutas optimizadas por vehículo | EP-03 | 13 |
| **Total** | | **23** |

---

## 2. Revisión del sprint

### 2.1 Avance de las Historias de Usuario (prototipo inicial)

#### US-002 – Gestión de pedidos de reparto — **EN PROGRESO**

La gestión de pedidos de reparto se implementó en el prototipo inicial. Queda pendiente su migración al stack vigente (Node.js + Express, Next.js y Neon) según CC-01.

**Backend (prototipo):**

* El controlador `pedidos.py` expone endpoints REST para crear, listar, obtener, actualizar, cambiar estado y cancelar pedidos.
* El servicio `pedido_service.py` aplica reglas de negocio como la validación de ventana de entrega y la prohibición de modificar pedidos en estados terminales (entregado o cancelado).
* El repositorio `FirestorePedidoRepository` persiste y consulta pedidos en Firebase Cloud Firestore.
* Los esquemas Pydantic (`PedidoCreate`, `PedidoUpdate`, `PedidoResponse`, `CambiarEstadoPedidoRequest`) validan la entrada de datos.
* Las pruebas unitarias y de integración cubren esquemas, servicio y repositorio.

**Frontend (prototipo):**

* `PedidoLista.jsx` muestra el listado con filtros por estado, prioridad y búsqueda de texto.
* `PedidoFormulario.jsx` permite registrar y editar pedidos con todos los campos obligatorios.
* `PedidoDetalle.jsx` muestra la información completa del pedido con opciones de cambiar estado, editar y cancelar.
* El servicio `api.js` consume los endpoints del backend con métodos CRUD completos.
* Los componentes de interfaz utilizan badges de estado y prioridad, formateo de fechas y ventanas de entrega.

#### US-001 – Gestión de flota vehicular — **EN PROGRESO**

La gestión de flota vehicular se implementó en el prototipo inicial. Queda pendiente su migración al stack vigente (Node.js + Express, Next.js y Neon) según CC-01.

**Backend (prototipo):**

* El controlador `vehiculos.py` expone endpoints REST para registrar, listar, obtener, actualizar, cambiar estado y desactivar vehículos.
* El servicio `vehiculo_service.py` aplica reglas de negocio como la validación de placa peruana (formato ABC-123), detección de vehículos duplicados y la lógica de desactivación.
* El repositorio `FirestoreVehiculoRepository` persiste y consulta vehículos en Firestore.
* Los esquemas Pydantic (`VehiculoCreate`, `VehiculoUpdate`, `VehiculoResponse`, `CambiarEstadoRequest`) validan los datos.
* El modelo de dominio `Vehiculo` incluye validación de placa y enumeraciones de tipo y estado.
* Las pruebas unitarias y de integración cubren esquemas, servicio y repositorio (13 pruebas unitarias pasando).

**Frontend (prototipo):**

* `VehiculoLista.jsx` muestra el listado de vehículos con placa, tipo, capacidad y estado.
* `VehiculoFormulario.jsx` permite registrar y editar vehículos con todos los campos requeridos.
* `VehiculoDetalle.jsx` muestra la información completa del vehículo con opciones de cambiar estado y editar.
* El módulo de **Vehículos** está accesible desde la navegación principal de `App.jsx`.
* El servicio `api.js` consume los endpoints `/vehiculos` del backend.

#### US-003 – Generación de rutas optimizadas por vehículo — **EN PROGRESO**

El prototipo inicial permite registrar y consultar rutas con el vehículo y los pedidos seleccionados. Sin embargo, **aún no calcula el orden óptimo de visita** ni la distancia o el tiempo estimados: `ruta_service.py` guarda los pedidos en el orden en que el operador los selecciona. El cálculo se implementará con la API de OpenRouteService y los factores de tráfico definidos en CC-01.

**Backend (prototipo):**

* Se creó el modelo de dominio `Ruta` con enumeración `EstadoRuta` (generada, en_reparto, completada, cancelada).
* El controlador `rutas.py` expone endpoints REST para generar, listar, obtener, cambiar estado y cancelar rutas.
* El servicio `ruta_service.py` implementa la lógica de negocio para generar rutas considerando la disponibilidad del vehículo y la validez de los datos.
* El repositorio `FirestoreRutaRepository` persiste y consulta rutas en Firestore.
* Los esquemas Pydantic (`RutaCreate`, `RutaUpdate`, `RutaResponse`) validan la entrada de datos.
* El repositorio abstracto `RutaRepository` define el contrato de persistencia.
* Se agregaron excepciones de dominio: `RutaNotFoundError`, `RutaSinDatosError`, `RutaVehiculoInactivoError`.
* Se registraron **10 pruebas unitarias** para el servicio de rutas.
* El router de rutas se integró en `main.py`.

**Frontend (prototipo):**

* `RutaLista.jsx` muestra el listado de rutas generadas con ID, vehículo, pedidos, estado y fecha.
* `RutaFormulario.jsx` permite generar nuevas rutas seleccionando un vehículo activo y pedidos disponibles, incluye `RutaDetalle` para consultar el estado de una ruta.
* El módulo de **Rutas** está accesible desde la navegación principal de `App.jsx`.
* El servicio `api.js` consume los endpoints `/rutas` del backend.
* Se agregaron `BadgeEstadoRuta`, `ETIQUETAS_ESTADO_RUTA` y `COLORES_ESTADO_RUTA` en el frontend.

---

## 3. Demostración del prototipo inicial

Durante la revisión del Sprint 1 se puede demostrar lo siguiente:

### Gestión de pedidos de reparto

El sistema permite a un operador:

* Registrar nuevos pedidos con datos del cliente, dirección, coordenadas GPS, peso, volumen, ventana de entrega, prioridad y tipo de producto.
* Visualizar un listado de pedidos con filtros por estado, prioridad y búsqueda de texto.
* Editar pedidos que no se encuentren en estados terminales (entregado o cancelado).
* Cambiar el estado de un pedido (pendiente → en ruta → entregado) mediante un selector desplegable.
* Cancelar pedidos que no hayan sido entregados.
* Consultar el detalle completo de cada pedido con toda su información asociada.

### Gestión de flota vehicular

El sistema permite a un operador:

* Registrar vehículos con placa, tipo, capacidad de carga, consumo de combustible, factor de emisión de CO₂ y año de fabricación.
* Listar vehículos con filtros por estado (activo/inactivo).
* Editar la información de cualquier vehículo.
* Consultar el detalle completo de cada vehículo.
* Cambiar el estado de un vehículo (activo ↔ inactivo).
* Desactivar vehículos que no se encuentren en uso.

### Asignación de pedidos a vehículos

El sistema permite a un operador:

* Asignar un pedido disponible a un vehículo activo, verificando que el vehículo tenga capacidad suficiente.
* Ver las asignaciones existentes con información del pedido, vehículo asignado y estado.
* Cancelar una asignación, dejando el pedido sin vehículo asignado.

### Generación de rutas optimizadas

El sistema permite a un operador:

* Seleccionar un vehículo activo y uno o más pedidos disponibles.
* Generar una ruta de reparto asociada al vehículo seleccionado.
* Visualizar la lista de rutas generadas con su estado actual.
* Consultar el detalle de cada ruta incluyendo los pedidos incluidos y el vehículo asignado.
* Cambiar el estado de una ruta (generada → en reparto → completada → cancelada).
* Cancelar una ruta generada.
* **Limitación:** el orden de las paradas corresponde al orden de selección; la ruta aún no se optimiza.

### Arquitectura del backend del prototipo

El prototipo organiza el backend en capas (presentación, negocio y datos). Esta separación se conserva en el stack vigente como el Controlador y el Modelo (servicios y repositorios) del patrón MVC:

* Capa de presentación con controladores REST para cuatro módulos (vehículos, pedidos, asignaciones, rutas).
* Capa de negocio con servicios que aplican reglas de negocio validadas.
* Capa de datos con repositorios que abstraen el acceso a Firestore.
* Modelos de dominio independientes de la infraestructura.
* Esquemas de validación con Pydantic.
* Sistema de excepciones de dominio con mapeo a códigos HTTP.
* Pruebas unitarias y de integración para los cuatro módulos (70 pruebas pasando).

### Interfaz de usuario funcional

Se puede mostrar la aplicación web con navegación entre los módulos de Pedidos, Vehículos, Asignaciones y Rutas, con diseño responsivo, badges de estado con colores, formularios validados y mensajes de confirmación.

---

## 4. Pendientes

Los siguientes ítems permanecen pendientes:

### Pendientes para cerrar el Sprint 1 (CC-01)

* Migrar los módulos de vehículos, pedidos y asignaciones (US-001, US-002) a Node.js + Express + Neon y el frontend a Next.js.
* Implementar el cálculo del orden óptimo de visita en US-003 con la API de OpenRouteService, incluyendo distancia, tiempo estimado y factores de tráfico.
* Migrar las pruebas de Pytest a Vitest y Supertest.
* Configurar la base de datos en Neon y la API key de OpenRouteService en cada entorno, sin incorporarlas al repositorio.

### Funcionalidades futuras (fuera del alcance del Sprint 1)

* La autenticación y control por roles (RF-10 / US-010) no ha sido implementada. No existe sistema de inicio de sesión ni de control de acceso por roles.
* La visualización y seguimiento de rutas en un mapa (RF-04 / US-004) no se ha implementado como mapa visual, aunque la ruta se puede consultar en texto.
* Los indicadores y reportes de sostenibilidad (RF-05, RF-06 / US-005, US-006) no han sido implementados.
* La re-optimización de rutas (RF-07 / US-007) no ha sido implementada.
* La gestión de conductores (RF-08 / US-008) no ha sido implementada.
* Las preferencias de clientes y bodegas (RF-09 / US-009) no han sido implementadas.

Estas funcionalidades forman parte de entregas futuras del proyecto y no afectan el cumplimiento del Sprint Goal del Sprint 1.

---

## 5. Resumen de estado

| Historia | Descripción | Estado |
| --- | --- | --- |
| US-001 | Gestión de flota vehicular | **En progreso** – validada en el prototipo; pendiente de migración |
| US-002 | Gestión de pedidos de reparto | **En progreso** – validada en el prototipo; pendiente de migración |
| US-003 | Generación de rutas optimizadas por vehículo | **En progreso** – registra rutas; pendiente el cálculo del orden óptimo |

**Story Points completados:** 0 de 23 (ninguna historia cumple todavía la Definición de Hecho con el stack vigente)  
**Sprint Goal:** En progreso. El prototipo permitió validar las reglas de negocio de vehículos, pedidos y asignaciones. Para cumplir el objetivo falta migrar los módulos al stack vigente e implementar el cálculo de rutas optimizadas.

---

## 6. Verificación técnica del prototipo inicial

Verificación realizada el 25/09/2026 sobre el stack anterior (FastAPI + Firestore + React/Vite). Se repetirá con Vitest y Supertest después de la migración.

### Backend

* Se ejecutaron **70 pruebas** con Pytest: **60 originales + 10 nuevas** de rutas. **Todas pasaron.**
* La aplicación FastAPI se inicia correctamente y registra todos los routers.
* Los endpoints `/api/v1/vehiculos`, `/api/v1/pedidos`, `/api/v1/asignaciones` y `/api/v1/rutas` están disponibles.
* La conexión con Firestore se verifica a través del endpoint `/health`.

### Frontend

* El proyecto se compila exitosamente con `npm run build` (Vite).
* La aplicación carga correctamente con los 4 módulos de navegación.
* Los componentes de vehículos y rutas se integran correctamente con el estado global de `App.jsx`.
* El servicio `api.js` consume correctamente todos los endpoints del backend.

