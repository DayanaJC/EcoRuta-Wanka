# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 03. Revisión del Sprint V_1_0_0

**Versión:** V_1_0_0 | **Fecha:** 25/09/2026 | **Actualizado:** 27/09/2026 (CC-01 – Cambio de stack y arquitectura) | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

**Sprint:** EW Sprint 1 (11/09/2026 – 25/09/2026)

**Sprint Goal:** Implementar la gestión básica de vehículos y pedidos para disponer de información válida que permita generar rutas optimizadas de reparto.

---

## 1. Introducción

La presente revisión constata el avance realizado durante el **Sprint 1** del proyecto **EcoRuta Wanka** y permite verificar el cumplimiento del **Sprint Goal** en función del estado real del código fuente.

> **Actualización 27/09/2026 – CC-01:** el Sprint 1 continúa en curso. Durante el sprint el equipo cambió el stack tecnológico (de Python + FastAPI, React + Vite y Firestore a Node.js + Express, Next.js y Neon) y adoptó la arquitectura cliente-servidor con el patrón MVC con capa de servicios. Lo descrito en este documento corresponde al **prototipo inicial** construido con el stack anterior, que permitió validar las reglas de negocio. Además, la revisión del código mostró que la generación de rutas aún no calcula el orden óptimo de visita. Por ello, el estado de las historias se actualiza a **En progreso**. Ver `docs/04 Seguimiento_control/01 Registro de control de cambios V_1_0_0.md`.

---

## 2. Estado de las Historias de Usuario del Sprint

La siguiente tabla refleja el estado real de cada historia de usuario seleccionada para el Sprint 1, conforme a la evidencia encontrada en el código fuente:

| Historia | Descripción | Estado | Evidencia |
| --- | --- | --- | --- |
| US-001 – Gestión de flota vehicular | Gestión de vehículos de la flota de reparto | **En progreso** | Prototipo (stack anterior): backend con CRUD completo. Frontend con módulo independiente de vehículos (VehiculoLista, VehiculoFormulario, VehiculoDetalle), navegación en App.jsx y métodos de API. |
| US-002 – Gestión de pedidos de reparto | Registro, gestión y seguimiento de pedidos de reparto | **En progreso** | Prototipo (stack anterior): backend con CRUD completo y Frontend con lista, formulario, detalle, cambio de estado y cancelación de pedidos. |
| US-003 – Generación de rutas optimizadas por vehículo | Generación de rutas optimizadas para vehículos | **En progreso** | Prototipo (stack anterior): backend con modelo Ruta, servicio RutaService, controlador rutas, repositorio FirestoreRutaRepository y 10 pruebas unitarias. Frontend con RutaLista, RutaFormulario y navegación en App.jsx. Pendiente: cálculo del orden óptimo con la API de OpenRouteService. |

### 2.1 Análisis detallado por historia

**US-001 se encuentra en progreso.** En el prototipo, tanto el backend como el frontend cuentan con funcionalidad íntegra de gestión de vehículos. El backend proporciona todos los endpoints de CRUD con validación de placa peruana y lógica de desactivación. El frontend presenta un módulo de vehículos completamente funcional accesible desde la navegación principal, con listado, formulario de creación/edición y vista de detalle. Queda pendiente su migración al stack vigente (Node.js + Express, Next.js y Neon) según CC-01.

**US-002 se encuentra en progreso.** En el prototipo, el backend cuenta con la totalidad de los endpoints de pedidos y el frontend presenta los tres componentes necesarios con funcionalidad completa de CRUD y gestión de estados. La API REST está consumida desde el servicio `api.js`. Queda pendiente su migración al stack vigente (Node.js + Express, Next.js y Neon) según CC-01.

**US-003 se encuentra en progreso.** En el prototipo, el backend cuenta con el modelo de dominio `Ruta`, el servicio `RutaService` con lógica de generación de rutas, el controlador `rutas.py` con endpoints REST, el repositorio `FirestoreRutaRepository` para persistencia en Firestore, y 10 pruebas unitarias pasando. El frontend presenta `RutaLista.jsx` para el listado, `RutaFormulario.jsx` con `RutaDetalle` para la generación y consulta de rutas, y la navegación está integrada en `App.jsx`. Sin embargo, `RutaService` guarda los pedidos en el orden en que se seleccionan y no calcula el orden óptimo, la distancia ni el tiempo estimado, por lo que el criterio de *ruta optimizada* aún no se cumple.

---

## 3. Demostración del prototipo inicial

De lo realizado durante el Sprint 1 se puede demostrar:

### 3.1 Gestión completa de pedidos

Se puede mostrar un sistema funcional de gestión de pedidos de reparto que permite registrar, listar, editar, cambiar estado y cancelar pedidos con filtros interactivos.

### 3.2 Gestión completa de vehículos

Se puede mostrar un módulo de vehículos que permite registrar, listar, editar, consultar el detalle y cambiar el estado de vehículos de la flota, con validación de placa peruana.

### 3.3 Asignación de pedidos a vehículos

Se puede mostrar el proceso de asignación de pedidos a vehículos con validación de capacidad de carga.

### 3.4 Registro de rutas

Se puede mostrar la generación de rutas de reparto seleccionando un vehículo activo y uno o más pedidos disponibles, con visualización del estado de la ruta y consulta de detalles. El orden de las paradas aún no se optimiza.

### 3.5 Arquitectura del backend

Se puede demostrar que el backend del prototipo cuenta con una organización en capas bien definida, que se conserva en el patrón MVC adoptado (Controlador y Modelo), con controladores, servicios, modelos, esquemas y repositorios para cuatro módulos completos (vehículos, pedidos, asignaciones, rutas).

### 3.6 Interfaz de usuario funcional

Se puede mostrar la aplicación web con navegación entre los módulos de Pedidos, Vehículos, Asignaciones y Rutas.

---

## 4. Pendientes

Los siguientes ítems requieren trabajo adicional:

### Pendientes para cerrar el Sprint 1 (CC-01)

* Migrar los módulos de vehículos, pedidos y asignaciones (US-001, US-002) a Node.js + Express + Neon y el frontend a Next.js.
* Implementar el cálculo del orden óptimo de visita en US-003 con la API de OpenRouteService, incluyendo distancia, tiempo estimado y factores de tráfico.
* Migrar las pruebas de Pytest a Vitest y Supertest.
* Configurar la base de datos en Neon y la API key de OpenRouteService en cada entorno, sin incorporarlas al repositorio.

### Funcionalidades futuras (fuera del alcance del Sprint 1)

* La autenticación y control por roles (RF-10 / US-010) no ha sido implementada.
* La visualización y seguimiento de rutas en un mapa visual (RF-04 / US-004) no se ha implementado como mapa.
* Los indicadores y reportes de sostenibilidad (RF-05, RF-06 / US-005, US-006) no han sido implementados.
* La re-optimización de rutas (RF-07 / US-007) no ha sido implementada.
* La gestión de conductores (RF-08 / US-008) no ha sido implementada.
* Las preferencias de clientes y bodegas (RF-09 / US-009) no han sido implementadas.

---

## 5. Evaluación del Sprint Goal

El **Sprint Goal** fue: *"Implementar la gestión básica de vehículos y pedidos para disponer de información válida que permita generar rutas optimizadas de reparto."*

**En progreso.** El prototipo permitió validar la gestión de vehículos, pedidos y asignaciones, y el registro de rutas. Para cumplir el Sprint Goal falta migrar estos módulos al stack vigente (CC-01) e implementar el cálculo de rutas optimizadas con la API de OpenRouteService y los factores de tráfico.

---

## 6. Verificación técnica del prototipo inicial

Verificación realizada el 25/09/2026 sobre el stack anterior. Se repetirá con Vitest y Supertest después de la migración.

* **70 pruebas** con Pytest: **60 originales + 10 nuevas** de rutas. **Todas pasaron.**
* El proyecto frontend se compila exitosamente con Vite.
* Los endpoints `/api/v1/vehiculos`, `/api/v1/pedidos`, `/api/v1/asignaciones` y `/api/v1/rutas` están disponibles.
* La organización en capas del prototipo se mantiene en todo el backend y se traslada al patrón MVC con capa de servicios.

---
