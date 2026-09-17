# EcoRuta Wanka

*Optimizador de rutas sostenibles de última milla — Huancayo, Junín*

# 01. Transformando a ágil

**Versión:** V_1_0_0 | **Fecha:** 11/09/2026 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

---

## 1. Introducción

EcoRuta Wanka transforma los requisitos definidos durante la etapa inicial del proyecto en elementos de planificación ágil para organizar el desarrollo del producto.

La transformación considera:

* **Requisitos funcionales (RF-01 a RF-10):** se organizan en seis épicas y diez Historias de Usuario.
* **Requisitos no funcionales (RNF-01 a RNF-09):** se convierten en Enablers, criterios de aceptación o criterios transversales del Definition of Done.
* **Reglas de negocio:** se utilizan como condiciones de aceptación de las historias relacionadas.
* **Arquitectura:** las historias técnicas consideran la **Arquitectura por Capas** definida para el proyecto.
* **Restricciones:** se consideran para establecer prioridades, dependencias y esfuerzo.

La transformación mantiene la trazabilidad entre los requisitos iniciales y los elementos utilizados para la planificación en Jira.

---

## 2. Metodología de transformación

### 2.1 De requisitos funcionales a épicas

Los diez requisitos funcionales se agrupan en seis épicas de acuerdo con la relación entre sus funcionalidades.

| Épica                                                   | Requisitos relacionados |
| ------------------------------------------------------- | ----------------------- |
| **EP-01 – Operación y gestión de recursos de reparto**  | RF-01, RF-08            |
| **EP-02 – Gestión de pedidos y preferencias**           | RF-02, RF-09            |
| **EP-03 – Motor de optimización y generación de rutas** | RF-03, RF-07            |
| **EP-04 – Seguimiento y visualización de rutas**        | RF-04                   |
| **EP-05 – Sostenibilidad, indicadores y reportes**      | RF-05, RF-06            |
| **EP-06 – Acceso seguro y control por roles**           | RF-10                   |

---

### 2.2 De épicas a Historias de Usuario

Cada requisito funcional se transforma en una Historia de Usuario que representa una necesidad concreta del sistema.

Las historias utilizan la estructura:

> **Como [rol], quiero [acción], para [beneficio].**

Cada historia conserva la referencia al requisito funcional de origen y contiene criterios de aceptación en formato Gherkin.

---

### 2.3 Tratamiento de los requisitos no funcionales

Los requisitos no funcionales se distribuyen de acuerdo con su naturaleza:

| RNF                                      | Tratamiento             |
| ---------------------------------------- | ----------------------- |
| RNF-01 Desempeño                         | Enabler                 |
| RNF-02 Seguridad                         | Enabler                 |
| RNF-03 Usabilidad y accesibilidad        | Enabler                 |
| RNF-04 Adecuación funcional y exactitud  | Enabler                 |
| RNF-05 Usabilidad y satisfacción         | Definition of Done      |
| RNF-06 Fiabilidad y disponibilidad       | Enabler                 |
| RNF-07 Cumplimiento de reglas de negocio | Criterios de aceptación |
| RNF-08 Mantenibilidad                    | Enabler                 |
| RNF-09 Compatibilidad                    | Definition of Done      |

---

### 2.4 Tratamiento de las reglas de negocio

Las reglas de negocio se incorporan a las historias relacionadas cuando establecen una condición que debe cumplirse para realizar una operación.

Las principales relaciones son:

| Regla                                   | Historia relacionada |
| --------------------------------------- | -------------------- |
| RN-001 Acceso seguro al sistema         | US-010               |
| RN-002 Capacidad del vehículo           | US-003               |
| RN-003 Datos válidos para generar rutas | US-002, US-003       |
| RN-004 Vehículos disponibles            | US-001, US-003       |
| RN-005 Asignación de pedidos            | US-002, US-003       |
| RN-006 Ventana horaria de entrega       | US-003, US-009       |
| RN-007 Generación de rutas              | US-003               |
| RN-008 Re-optimización de rutas         | US-007               |
| RN-009 Asignación de conductores        | US-008               |
| RN-010 Preferencias de entrega          | US-009               |
| RN-011 Indicadores de sostenibilidad    | US-005, US-006       |
| RN-012 Control de información según rol | US-010               |

---

## 3. Mapa de trazabilidad RF → Épica → Historia de Usuario

| RF    | Épica | ID Historia | Historia de Usuario                                  | Prioridad | Story Points |
| ----- | ----- | ----------- | ---------------------------------------------------- | --------- | -----------: |
| RF-01 | EP-01 | US-001      | Gestión de flota vehicular                           | Alta      |            5 |
| RF-02 | EP-02 | US-002      | Gestión de pedidos de reparto                        | Alta      |            5 |
| RF-03 | EP-03 | US-003      | Generación de rutas optimizadas por vehículo         | Alta      |           13 |
| RF-04 | EP-04 | US-004      | Visualización de rutas en mapa interactivo           | Alta      |            8 |
| RF-05 | EP-05 | US-005      | Dashboard de indicadores de sostenibilidad           | Media     |            8 |
| RF-06 | EP-05 | US-006      | Reporte de sostenibilidad en PDF                     | Media     |            5 |
| RF-07 | EP-03 | US-007      | Re-optimización dinámica ante incidentes de tránsito | Alta      |           13 |
| RF-08 | EP-01 | US-008      | Registro y asignación de conductores a rutas         | Alta      |            8 |
| RF-09 | EP-02 | US-009      | Preferencias de entrega de clientes/bodegas          | Media     |            5 |
| RF-10 | EP-06 | US-010      | Autenticación y control de acceso por roles          | Alta      |            8 |

---

## 4. Épicas identificadas

### EP-01 – Operación y gestión de recursos de reparto

**Descripción:**
Agrupa las funcionalidades relacionadas con la gestión de vehículos, conductores y asignaciones necesarias para organizar las operaciones de reparto.

**Requisitos relacionados:** RF-01, RF-08.

**Valor de negocio:**
Permite mantener organizada la información de los recursos utilizados para realizar las entregas.

---

### EP-02 – Gestión de pedidos y preferencias

**Descripción:**
Agrupa la gestión de pedidos y las preferencias relacionadas con las condiciones de entrega de clientes y bodegas.

**Requisitos relacionados:** RF-02, RF-09.

**Valor de negocio:**
Permite disponer de información organizada sobre los pedidos y las condiciones que deben considerarse durante la planificación de las entregas.

---

### EP-03 – Motor de optimización y generación de rutas

**Descripción:**
Agrupa las funcionalidades relacionadas con la generación y re-optimización de rutas de reparto considerando los datos de pedidos, vehículos y condiciones de entrega.

**Requisitos relacionados:** RF-03, RF-07.

**Valor de negocio:**
Permite organizar las rutas de reparto y apoyar la reducción de distancias, tiempos y consumo estimado.

---

### EP-04 – Seguimiento y visualización de rutas

**Descripción:**
Agrupa las funcionalidades relacionadas con la visualización y seguimiento de las rutas de reparto.

**Requisito relacionado:** RF-04.

**Valor de negocio:**
Permite consultar de manera visual la información de las rutas y sus puntos de entrega.

---

### EP-05 – Sostenibilidad, indicadores y reportes

**Descripción:**
Agrupa las funcionalidades relacionadas con los indicadores de sostenibilidad y la generación de reportes.

**Requisitos relacionados:** RF-05, RF-06.

**Valor de negocio:**
Permite consultar información sobre distancia recorrida, consumo estimado y emisiones de CO₂ para evaluar el comportamiento sostenible de las operaciones.

---

### EP-06 – Acceso seguro y control por roles

**Descripción:**
Agrupa las funcionalidades relacionadas con la autenticación y el acceso a las funciones del sistema según el rol del usuario.

**Requisito relacionado:** RF-10.

**Roles considerados:** Administrador, Operador, Conductor y Cliente/Bodega.

**Valor de negocio:**
Permite proteger la información y controlar las funciones disponibles para cada tipo de usuario.

---

# 5. Historias de Usuario

## US-001 – Gestión de flota vehicular

**ID:** US-001
**Título:** Gestión de flota vehicular
**Épica:** EP-01 – Operación y gestión de recursos de reparto
**Requisito fuente:** RF-01
**Prioridad:** Alta
**Story Points:** 5

**Historia:**

> Como **Administrador**,
> quiero **registrar, consultar, actualizar y desactivar los vehículos de la flota**,
> para **mantener organizada la información de los vehículos disponibles para el reparto**.

### Criterios de aceptación

```gherkin
Escenario: Registrar un vehículo válido
  Dado un vehículo con placa, tipo y capacidad de carga válidos
  Cuando el Administrador registra el vehículo
  Entonces el sistema guarda la información y lo muestra en el listado de vehículos

Escenario: Registrar un vehículo con placa existente
  Dado un vehículo cuya placa ya está registrada
  Cuando el Administrador intenta registrar el vehículo
  Entonces el sistema rechaza el registro y muestra un mensaje indicando que la placa ya existe

Escenario: Desactivar un vehículo
  Dado un vehículo registrado
  Cuando el Administrador cambia su estado a inactivo
  Entonces el vehículo deja de estar disponible para nuevas asignaciones
```

---

## US-002 – Gestión de pedidos de reparto

**ID:** US-002
**Título:** Gestión de pedidos de reparto
**Épica:** EP-02 – Gestión de pedidos y preferencias
**Requisito fuente:** RF-02
**Prioridad:** Alta
**Story Points:** 5

**Historia:**

> Como **Operador**,
> quiero **registrar y gestionar pedidos de reparto**,
> para **disponer de información válida para la planificación de las entregas**.

### Criterios de aceptación

```gherkin
Escenario: Registrar un pedido válido
  Dado un pedido con la información necesaria para la entrega
  Cuando el Operador registra el pedido
  Entonces el sistema guarda el pedido y lo deja disponible para su gestión

Escenario: Registrar un pedido con ubicación válida
  Dado un pedido con dirección y coordenadas geográficas válidas
  Cuando el Operador registra el pedido
  Entonces el sistema guarda la ubicación y permite considerar el pedido para la generación de rutas

Escenario: Registrar un pedido sin ubicación válida
  Dado un pedido que no tiene una ubicación válida
  Cuando el Operador intenta registrarlo para ruteo
  Entonces el sistema informa que se requiere una ubicación válida
```

---

## US-003 – Generación de rutas optimizadas por vehículo

**ID:** US-003
**Título:** Generación de rutas optimizadas por vehículo
**Épica:** EP-03 – Motor de optimización y generación de rutas
**Requisito fuente:** RF-03
**Prioridad:** Alta
**Story Points:** 13

**Historia:**

> Como **Operador**,
> quiero **generar rutas optimizadas para los vehículos**,
> para **organizar las entregas considerando la capacidad del vehículo y las condiciones de entrega**.

### Criterios de aceptación

```gherkin
Escenario: Generar una ruta con información válida
  Dado un vehículo disponible y pedidos con información válida para el reparto
  Cuando el Operador solicita generar una ruta
  Entonces el sistema genera una propuesta de ruta para el vehículo

Escenario: Validar la capacidad del vehículo
  Dado un conjunto de pedidos cuya carga supera la capacidad disponible del vehículo
  Cuando el Operador solicita generar la ruta
  Entonces el sistema informa que la capacidad del vehículo es insuficiente

Escenario: Considerar las condiciones de entrega
  Dado un conjunto de pedidos con condiciones de entrega registradas
  Cuando el Operador genera la ruta
  Entonces el sistema considera dichas condiciones durante la planificación
```

---

## US-004 – Visualización de rutas en mapa interactivo

**ID:** US-004
**Título:** Visualización de rutas en mapa interactivo
**Épica:** EP-04 – Seguimiento y visualización de rutas
**Requisito fuente:** RF-04
**Prioridad:** Alta
**Story Points:** 8

**Historia:**

> Como **Conductor o Operador**,
> quiero **visualizar la ruta y sus puntos de entrega en un mapa**,
> para **consultar de forma clara el recorrido planificado**.

### Criterios de aceptación

```gherkin
Escenario: Visualizar una ruta generada
  Dado una ruta generada para un vehículo
  Cuando el usuario consulta la ruta
  Entonces el sistema muestra el recorrido y sus puntos de entrega

Escenario: Consultar los puntos de entrega
  Dado una ruta con varios pedidos
  Cuando el usuario visualiza la ruta
  Entonces el sistema muestra los puntos correspondientes a las entregas

Escenario: Consultar una ruta sin información disponible
  Dado que no existe una ruta disponible para el vehículo seleccionado
  Cuando el usuario intenta consultar la ruta
  Entonces el sistema informa que no existe una ruta disponible
```

---

## US-005 – Dashboard de indicadores de sostenibilidad

**ID:** US-005
**Título:** Dashboard de indicadores de sostenibilidad
**Épica:** EP-05 – Sostenibilidad, indicadores y reportes
**Requisito fuente:** RF-05
**Prioridad:** Media
**Story Points:** 8

**Historia:**

> Como **Administrador**,
> quiero **consultar indicadores de sostenibilidad**,
> para **conocer el comportamiento ambiental de las operaciones de reparto**.

### Criterios de aceptación

```gherkin
Escenario: Consultar indicadores
  Dado que existen datos de rutas y vehículos
  Cuando el Administrador consulta los indicadores
  Entonces el sistema muestra información de distancia, consumo estimado y emisiones de CO₂

Escenario: Consultar indicadores por periodo
  Dado que existen registros correspondientes a diferentes periodos
  Cuando el Administrador selecciona un periodo
  Entonces el sistema muestra los indicadores correspondientes al periodo seleccionado
```

---

## US-006 – Reporte de sostenibilidad en PDF

**ID:** US-006
**Título:** Reporte de sostenibilidad en PDF
**Épica:** EP-05 – Sostenibilidad, indicadores y reportes
**Requisito fuente:** RF-06
**Prioridad:** Media
**Story Points:** 5

**Historia:**

> Como **Administrador**,
> quiero **generar reportes de sostenibilidad**,
> para **disponer de información documentada sobre los resultados de las operaciones**.

### Criterios de aceptación

```gherkin
Escenario: Generar un reporte
  Dado que existen indicadores de sostenibilidad registrados
  Cuando el Administrador solicita un reporte
  Entonces el sistema genera un documento con los indicadores seleccionados

Escenario: Generar un reporte por periodo
  Dado un periodo con información disponible
  Cuando el Administrador selecciona el periodo
  Entonces el reporte contiene únicamente la información correspondiente al periodo seleccionado
```

---

## US-007 – Re-optimización dinámica ante incidentes de tránsito

**ID:** US-007
**Título:** Re-optimización dinámica ante incidentes de tránsito
**Épica:** EP-03 – Motor de optimización y generación de rutas
**Requisito fuente:** RF-07
**Prioridad:** Alta
**Story Points:** 13

**Historia:**

> Como **Operador**,
> quiero **actualizar una ruta cuando cambien las condiciones del reparto**,
> para **mantener una planificación adecuada de las entregas pendientes**.

### Criterios de aceptación

```gherkin
Escenario: Actualizar una ruta ante un cambio
  Dado una ruta activa con entregas pendientes
  Cuando una condición del reparto afecta la planificación
  Entonces el sistema permite actualizar la ruta restante

Escenario: Mantener una ruta cuando no existe afectación
  Dado una ruta activa sin cambios que afecten las entregas pendientes
  Cuando el sistema revisa las condiciones de la ruta
  Entonces mantiene la planificación existente

Escenario: Informar una actualización de ruta
  Dado que una ruta activa requiere una nueva planificación
  Cuando el sistema actualiza la ruta
  Entonces informa al usuario que la ruta fue actualizada
```

---

## US-008 – Registro y asignación de conductores a rutas

**ID:** US-008
**Título:** Registro y asignación de conductores a rutas
**Épica:** EP-01 – Operación y gestión de recursos de reparto
**Requisito fuente:** RF-08
**Prioridad:** Alta
**Story Points:** 8

**Historia:**

> Como **Administrador u Operador**,
> quiero **gestionar conductores y asignarlos a las rutas correspondientes**,
> para **organizar los recursos responsables de realizar las entregas**.

### Criterios de aceptación

```gherkin
Escenario: Registrar un conductor
  Dado un conductor con la información requerida
  Cuando el Administrador registra al conductor
  Entonces el sistema guarda su información y lo muestra en el registro correspondiente

Escenario: Asignar un conductor a una ruta
  Dado un conductor disponible y una ruta disponible
  Cuando el Operador realiza la asignación
  Entonces el sistema relaciona el conductor con la ruta correspondiente

Escenario: Evitar una asignación inválida
  Dado un conductor que no está disponible
  Cuando el Operador intenta asignarlo a una ruta
  Entonces el sistema rechaza la asignación
```

---

## US-009 – Preferencias de entrega de clientes/bodegas

**ID:** US-009
**Título:** Preferencias de entrega de clientes/bodegas
**Épica:** EP-02 – Gestión de pedidos y preferencias
**Requisito fuente:** RF-09
**Prioridad:** Media
**Story Points:** 5

**Historia:**

> Como **Cliente/Bodega**,
> quiero **registrar mis preferencias de entrega**,
> para **que las condiciones registradas sean consideradas durante la planificación**.

### Criterios de aceptación

```gherkin
Escenario: Registrar una preferencia
  Dado un Cliente/Bodega registrado
  Cuando registra una preferencia de entrega válida
  Entonces el sistema guarda la preferencia asociada al cliente o bodega

Escenario: Actualizar una preferencia
  Dado un Cliente/Bodega con una preferencia registrada
  Cuando modifica la preferencia
  Entonces el sistema actualiza la información

Escenario: Considerar una preferencia en una ruta
  Dado un pedido asociado a una preferencia de entrega
  Cuando se genera una ruta
  Entonces el sistema considera la preferencia registrada durante la planificación
```

---

## US-010 – Autenticación y control de acceso por roles

**ID:** US-010
**Título:** Autenticación y control de acceso por roles
**Épica:** EP-06 – Acceso seguro y control por roles
**Requisito fuente:** RF-10
**Prioridad:** Alta
**Story Points:** 8

**Historia:**

> Como **usuario del sistema**,
> quiero **autenticarme y acceder a las funciones correspondientes a mi rol**,
> para **utilizar el sistema de forma segura**.

### Roles

* Administrador.
* Operador.
* Conductor.
* Cliente/Bodega.

### Criterios de aceptación

```gherkin
Escenario: Iniciar sesión con credenciales válidas
  Dado un usuario registrado con credenciales válidas
  Cuando ingresa sus credenciales
  Entonces el sistema permite el acceso y muestra las funciones correspondientes a su rol

Escenario: Rechazar credenciales inválidas
  Dado un usuario que ingresa credenciales incorrectas
  Cuando intenta iniciar sesión
  Entonces el sistema rechaza el acceso

Escenario: Denegar una función no autorizada
  Dado un usuario autenticado con un rol determinado
  Cuando intenta acceder a una función que no corresponde a su rol
  Entonces el sistema deniega el acceso a dicha función
```

---

# 6. Historias Técnicas — Enablers

Los Enablers representan actividades técnicas necesarias para cumplir los requisitos no funcionales y mantener la calidad del producto.

## EN-001 – Cumplimiento del rendimiento

**Requisito fuente:** RNF-01
**Tipo:** Enabler / Historia técnica
**Story Points:** 8

**Objetivo:**
Garantizar que las operaciones principales del sistema respondan dentro de los tiempos establecidos en el RNF-01.

### Criterios de aceptación

```gherkin
Escenario: Verificar tiempo de respuesta
  Dado una operación principal del sistema
  Cuando se ejecuta bajo condiciones normales
  Entonces el tiempo de respuesta cumple el límite establecido por RNF-01

Escenario: Verificar generación de rutas
  Dado un conjunto de datos de prueba para generación de rutas
  Cuando se ejecuta la operación
  Entonces el tiempo de respuesta se encuentra dentro del valor establecido en RNF-01
```

---

## EN-002 – Seguridad de la información

**Requisito fuente:** RNF-02
**Tipo:** Enabler / Historia técnica
**Story Points:** 8

**Objetivo:**
Proteger el acceso al sistema y la información administrada por la aplicación.

### Criterios de aceptación

```gherkin
Escenario: Proteger una función restringida
  Dado un usuario que no tiene autorización para una función
  Cuando intenta acceder a ella
  Entonces el sistema deniega el acceso

Escenario: Proteger información sensible
  Dado información que requiere protección
  Cuando el sistema la almacena o transmite
  Entonces se aplican los mecanismos de seguridad definidos para el sistema
```

---

## EN-003 – Usabilidad y accesibilidad

**Requisito fuente:** RNF-03
**Tipo:** Enabler / Historia técnica
**Story Points:** 5

**Objetivo:**
Garantizar que las principales funciones puedan utilizarse de manera clara y accesible.

### Criterios de aceptación

```gherkin
Escenario: Utilizar las funciones principales
  Dado un usuario de prueba
  Cuando realiza las tareas principales del sistema
  Entonces puede completarlas sin asistencia directa

Escenario: Visualizar el sistema en diferentes tamaños de pantalla
  Dado un usuario que accede desde diferentes tamaños de pantalla
  Cuando utiliza las funciones principales
  Entonces la interfaz mantiene una presentación legible y operativa
```

---

## EN-004 – Exactitud funcional e indicadores

**Requisito fuente:** RNF-04
**Tipo:** Enabler / Historia técnica
**Story Points:** 5

**Objetivo:**
Verificar que los resultados generados por el sistema mantengan el nivel de exactitud establecido.

### Criterios de aceptación

```gherkin
Escenario: Validar resultados calculados
  Dado un conjunto de datos de referencia
  Cuando el sistema realiza el cálculo correspondiente
  Entonces el resultado se encuentra dentro de la tolerancia establecida por RNF-04

Escenario: Repetir un cálculo
  Dado el mismo conjunto de datos de entrada
  Cuando se ejecuta nuevamente el cálculo
  Entonces el sistema produce resultados consistentes
```

---

## EN-005 – Fiabilidad y disponibilidad

**Requisito fuente:** RNF-06
**Tipo:** Enabler / Historia técnica
**Story Points:** 8

**Objetivo:**
Mantener disponible el sistema durante las condiciones de operación definidas.

### Criterios de aceptación

```gherkin
Escenario: Consultar el sistema durante el horario de operación
  Dado el sistema disponible
  Cuando un usuario realiza una operación permitida
  Entonces el sistema responde correctamente

Escenario: Recuperar el servicio después de una interrupción
  Dado que ocurre una interrupción temporal del servicio
  Cuando el servicio vuelve a estar disponible
  Entonces los usuarios pueden continuar utilizando el sistema
```

---

## EN-006 – Arquitectura por capas y mantenibilidad

**Requisito fuente:** RNF-08
**Tipo:** Enabler / Historia técnica
**Story Points:** 8

**Objetivo:**
Mantener organizada la solución mediante la **Arquitectura por Capas**.

La estructura principal es:

```text
Frontend
   ↓
Capa de Presentación
   ↓
Capa de Negocio
   ↓
Capa de Datos
   ↓
Firebase Cloud Firestore
```

### Criterios de aceptación

```gherkin
Escenario: Mantener separación de responsabilidades
  Dado una nueva funcionalidad del Backend
  Cuando se incorpora al sistema
  Entonces sus responsabilidades se mantienen separadas entre presentación, negocio y datos

Escenario: Verificar las pruebas de calidad
  Dado un cambio incorporado al proyecto
  Cuando se ejecutan las pruebas correspondientes
  Entonces el cambio cumple los criterios de calidad definidos para el proyecto
```

---

# 7. Matriz RNF → Enabler / Historia / DoD

| RNF    | Elemento ágil                   | Tratamiento                              |
| ------ | ------------------------------- | ---------------------------------------- |
| RNF-01 | EN-001                          | Enabler de rendimiento                   |
| RNF-02 | EN-002                          | Enabler de seguridad                     |
| RNF-03 | EN-003                          | Enabler de usabilidad y accesibilidad    |
| RNF-04 | EN-004                          | Enabler de exactitud                     |
| RNF-05 | DoD                             | Criterio transversal de satisfacción     |
| RNF-06 | EN-005                          | Enabler de fiabilidad y disponibilidad   |
| RNF-07 | US-008 y criterios relacionados | Criterios de aceptación                  |
| RNF-08 | EN-006                          | Enabler de mantenibilidad y arquitectura |
| RNF-09 | DoD                             | Pruebas transversales de compatibilidad  |

---

# 8. Definition of Done (DoD)

Una Historia de Usuario o Enabler se considera terminado cuando cumple los siguientes criterios:

1. El desarrollo se realiza mediante una rama de trabajo y se integra mediante **Pull Request**.

2. El cambio cuenta con **revisión por otro integrante del equipo**.

3. Se ejecutan las pruebas correspondientes y se obtiene una **cobertura mínima del 80 %** como criterio global de la consigna del PFA.

4. No existen vulnerabilidades críticas conocidas en las verificaciones de seguridad establecidas para el proyecto.

5. Se verifican todos los criterios de aceptación definidos para la Historia de Usuario o Enabler.

6. La funcionalidad se valida en un ambiente de **staging** antes de considerarse terminada.

7. Los contratos de la API relacionados con el cambio se mantienen documentados.

8. La documentación del proyecto se actualiza cuando el cambio modifica requisitos, arquitectura, datos o procesos documentados.

9. Se realizan las pruebas de compatibilidad establecidas en RNF-09.

10. Se considera la evaluación de usabilidad y satisfacción establecida en RNF-05.

---

# 9. Trazabilidad con los objetivos del proyecto

| Objetivo                                                   | Épicas relacionadas | Historias / Enablers                   |
| ---------------------------------------------------------- | ------------------- | -------------------------------------- |
| **O1 – Reducción de emisiones**                            | EP-03, EP-05        | US-003, US-005, US-006, EN-004         |
| **O2 – Cumplimiento de entregas y condiciones de reparto** | EP-02, EP-03, EP-04 | US-002, US-003, US-004, US-007, US-009 |
| **O3 – Reducción de costos de operación**                  | EP-03, EP-05        | US-003, US-005                         |
| **O4 – Desarrollo de las funcionalidades principales**     | EP-01, EP-02, EP-03 | US-001, US-002, US-003, US-008         |
| **O5 – Usabilidad y calidad del sistema**                  | EP-04, EP-06        | US-004, US-009, US-010, EN-003         |

---

# 10. Relación con Jira

Los elementos definidos en este documento se utilizan como base para la configuración del proyecto **EcoRuta-Wanka** en Jira.

### Épicas

| ID    | Nombre                                      |
| ----- | ------------------------------------------- |
| EP-01 | Operación y gestión de recursos de reparto  |
| EP-02 | Gestión de pedidos y preferencias           |
| EP-03 | Motor de optimización y generación de rutas |
| EP-04 | Seguimiento y visualización de rutas        |
| EP-05 | Sostenibilidad, indicadores y reportes      |
| EP-06 | Acceso seguro y control por roles           |

### Historias de Usuario

| ID     | Nombre                                               | Story Points |
| ------ | ---------------------------------------------------- | -----------: |
| US-001 | Gestión de flota vehicular                           |            5 |
| US-002 | Gestión de pedidos de reparto                        |            5 |
| US-003 | Generación de rutas optimizadas por vehículo         |           13 |
| US-004 | Visualización de rutas en mapa interactivo           |            8 |
| US-005 | Dashboard de indicadores de sostenibilidad           |            8 |
| US-006 | Reporte de sostenibilidad en PDF                     |            5 |
| US-007 | Re-optimización dinámica ante incidentes de tránsito |           13 |
| US-008 | Registro y asignación de conductores a rutas         |            8 |
| US-009 | Preferencias de entrega de clientes/bodegas          |            5 |
| US-010 | Autenticación y control de acceso por roles          |            8 |

---

# 11. Priorización inicial para Sprint 1

De acuerdo con la planificación realizada en Jira, el primer Sprint utiliza las tres historias principales del flujo inicial de operación.

**Sprint:** EW Sprint 1

**Periodo:** 11/09/2026 – 25/09/2026

**Sprint Goal:**

> **“Implementar la gestión básica de vehículos y pedidos para disponer de información válida que permita generar rutas optimizadas de reparto.”**

| Historia                                              | Épica | Story Points |
| ----------------------------------------------------- | ----- | -----------: |
| US-001 – Gestión de flota vehicular                   | EP-01 |            5 |
| US-002 – Gestión de pedidos de reparto                | EP-02 |            5 |
| US-003 – Generación de rutas optimizadas por vehículo | EP-03 |           13 |
| **Total**                                             |       |       **23** |

Estas tres historias conforman **23 Story Points** para el Sprint 1.

---

# 12. Relación con la Arquitectura por Capas

Las historias técnicas y funcionales se desarrollan considerando la arquitectura seleccionada para el proyecto.

```text
Frontend
   ↓
Capa de Presentación
   ↓
Capa de Negocio
   ↓
Capa de Datos
   ↓
Firebase Cloud Firestore
```

La separación de responsabilidades permite organizar el desarrollo de la siguiente manera:

| Capa             | Responsabilidad                                        |
| ---------------- | ------------------------------------------------------ |
| **Presentación** | Recibir solicitudes y validar información de entrada.  |
| **Negocio**      | Aplicar reglas y procesar las operaciones del sistema. |
| **Datos**        | Consultar y almacenar información en Firestore.        |

Esta estructura se considera especialmente en **EN-006**, relacionado con RNF-08.

---

# 13. Relación con las restricciones del proyecto

Las principales restricciones consideradas durante la transformación ágil son:

| Restricción                    | Efecto en la planificación                                              |
| ------------------------------ | ----------------------------------------------------------------------- |
| Tiempo académico               | Se priorizan las funcionalidades principales.                           |
| Equipo de dos integrantes      | Se distribuye el trabajo según prioridad y complejidad.                 |
| Presupuesto académico limitado | Se priorizan tecnologías y servicios de bajo costo.                     |
| Dependencia de Firebase        | Las funcionalidades de datos consideran la disponibilidad del servicio. |
| Calidad de los datos           | Las historias relacionadas con pedidos y rutas incluyen validaciones.   |
| Alcance geográfico en Huancayo | La planificación se orienta al escenario definido para el proyecto.     |
| Cambios en requisitos          | Las modificaciones deben evaluarse antes de incorporarse al Sprint.     |

---

# 14. Conclusión

La transformación ágil permite pasar de los requisitos definidos en la etapa inicial a una estructura organizada de **Épicas, Historias de Usuario y Enablers**.

Los diez requisitos funcionales se relacionan con seis épicas y diez Historias de Usuario. Los requisitos no funcionales se incorporan mediante Enablers, criterios de aceptación y criterios transversales del Definition of Done.

La planificación mantiene la trazabilidad con las reglas de negocio, objetivos del proyecto, arquitectura por capas y restricciones identificadas.

Los elementos resultantes sirven como base para la configuración de **Jira Software**, donde las Historias de Usuario son priorizadas y estimadas mediante Story Points de Fibonacci.

El Sprint 1 queda conformado por **US-001, US-002 y US-003**, con un total de **23 Story Points**, y tiene como objetivo disponer de la información básica de vehículos y pedidos necesaria para generar rutas optimizadas de reparto.

---

