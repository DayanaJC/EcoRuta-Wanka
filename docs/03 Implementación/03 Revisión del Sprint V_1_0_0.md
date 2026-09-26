# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 03. Revisión del Sprint V_1_0_0

**Versión:** V_1_0_0 | **Fecha:** 25/09/2026 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

**Sprint:** EW Sprint 1 (11/09/2026 – 25/09/2026)

**Sprint Goal:** Implementar la gestión básica de vehículos y pedidos para disponer de información válida que permita generar rutas optimizadas de reparto.

---

## 1. Introducción

La presente revisión constata el avance realizado durante el **Sprint 1** del proyecto **EcoRuta Wanka** y permite verificar el cumplimiento del **Sprint Goal** en función del estado real del código fuente.

---

## 2. Historias de Usuario completadas en este Sprint

La siguiente tabla refleja el estado real de cada historia de usuario seleccionada para el Sprint 1, conforme a la evidencia encontrada en el código fuente:

| Historia | Descripción | Estado | Evidencia |
| --- | --- | --- | --- |
| US-001 – Gestión de flota vehicular | Gestión de vehículos de la flota de reparto | **Completada** | Backend con CRUD completo. Frontend con módulo independiente de vehículos (VehiculoLista, VehiculoFormulario, VehiculoDetalle), navegación en App.jsx y métodos de API. |
| US-002 – Gestión de pedidos de reparto | Registro, gestión y seguimiento de pedidos de reparto | **Completada** | Backend con CRUD completo y Frontend con lista, formulario, detalle, cambio de estado y cancelación de pedidos. |
| US-003 – Generación de rutas optimizadas por vehículo | Generación de rutas optimizadas para vehículos | **Completada** | Backend con modelo Ruta, servicio RutaService, controlador rutas, repositorio FirestoreRutaRepository y 10 pruebas unitarias. Frontend con RutaLista, RutaFormulario y navegación en App.jsx. |

### 2.1 Análisis detallado por historia

**US-001 se considera completada** porque tanto el backend como el frontend cuentan con funcionalidad íntegra de gestión de vehículos. El backend proporciona todos los endpoints de CRUD con validación de placa peruana y lógica de desactivación. El frontend presenta un módulo de vehículos completamente funcional accesible desde la navegación principal, con listado, formulario de creación/edición y vista de detalle.

**US-002 se considera completada** porque el backend cuenta con la totalidad de los endpoints de pedidos y el frontend presenta los tres componentes necesarios con funcionalidad completa de CRUD y gestión de estados. La API REST está consumida desde el servicio `api.js`.

**US-003 se considera completada** porque el backend cuenta con el modelo de dominio `Ruta`, el servicio `RutaService` con lógica de generación de rutas, el controlador `rutas.py` con endpoints REST, el repositorio `FirestoreRutaRepository` para persistencia en Firestore, y 10 pruebas unitarias pasando. El frontend presenta `RutaLista.jsx` para el listado, `RutaFormulario.jsx` con `RutaDetalle` para la generación y consulta de rutas, y la navegación está integrada en `App.jsx`.

---

## 3. Demostración del trabajo completado

De lo realizado durante el Sprint 1 se puede demostrar:

### 3.1 Gestión completa de pedidos

Se puede mostrar un sistema funcional de gestión de pedidos de reparto que permite registrar, listar, editar, cambiar estado y cancelar pedidos con filtros interactivos.

### 3.2 Gestión completa de vehículos

Se puede mostrar un módulo de vehículos que permite registrar, listar, editar, consultar el detalle y cambiar el estado de vehículos de la flota, con validación de placa peruana.

### 3.3 Asignación de pedidos a vehículos

Se puede mostrar el proceso de asignación de pedidos a vehículos con validación de capacidad de carga.

### 3.4 Generación de rutas optimizadas

Se puede mostrar la generación de rutas de reparto seleccionando un vehículo activo y uno o más pedidos disponibles, con visualización del estado de la ruta y consulta de detalles.

### 3.5 Arquitectura backend robusta

Se puede demostrar que el backend cuenta con una arquitectura por capas bien definida con controladores, servicios, modelos, esquemas y repositorios para cuatro módulos completos (vehículos, pedidos, asignaciones, rutas).

### 3.6 Interfaz de usuario funcional

Se puede mostrar la aplicación web con navegación entre los módulos de Pedidos, Vehículos, Asignaciones y Rutas.

---

## 4. Pendientes

Los siguientes items requieren trabajo adicional y se encuentran pendientes para entregas futuras:

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

**Cumple.** La gestión de vehículos está completamente implementada y disponible en el frontend. La gestión de pedidos está completamente implementada. La generación de rutas optimizadas está implementada como primera versión funcional y demostrable, utilizando los datos existentes de vehículos y pedidos. El Sprint Goal se cumple en su totalidad.

---

## 6. Verificación técnica

* **70 pruebas** con Pytest: **60 originales + 10 nuevas** de rutas. **Todas pasaron.**
* El proyecto frontend se compila exitosamente con Vite.
* Los endpoints `/api/v1/vehiculos`, `/api/v1/pedidos`, `/api/v1/asignaciones` y `/api/v1/rutas` están disponibles.
* La arquitectura por capas se mantiene correctamente en todo el backend.

---
