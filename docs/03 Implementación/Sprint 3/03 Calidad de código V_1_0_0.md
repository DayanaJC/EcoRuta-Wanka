# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 03. Evaluación de Calidad de Código — SonarQube V_1_0_0

**Versión:** V_1_0_0 | **Fecha:** 28/10/2026 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Herramienta:** SonarQube Cloud (versión en línea y gratuita de SonarQube), con las reglas estándar "Sonar way".

**Qué se revisó:** el código del repositorio github.com/DayanaJC/EcoRuta-Wanka, rama principal (`main`), correspondiente al análisis identificado con el commit `9680f63d`. Se analizaron aproximadamente 9 700 líneas de código.

---

## 1. Resumen Ejecutivo de Quality Gate

El análisis de SonarQube Cloud permitió evaluar la calidad del código fuente de EcoRuta Wanka mediante métricas de cobertura, duplicación, confiabilidad, seguridad y mantenibilidad.

- **Estado del Quality Gate:** **PASSED (Aprobado)**. El proyecto superó las condiciones establecidas por SonarQube Cloud para la aprobación de la puerta de calidad.
- **Porcentaje de cobertura de pruebas (Coverage):** **77,4 %**.
- **Duplicación de código:** **0,3 %**.
- **Cuestiones abiertas de seguridad:** 1 (calificación B).
- **Cuestiones abiertas de fiabilidad:** 4 (calificación D).
- **Cuestiones abiertas de mantenibilidad:** 15 (calificación A).
- **Problemas aceptados:** 0.
- **Puntos críticos de seguridad:** 0 (indicador obsoleto).

Los resultados muestran una duplicación de código de 0,3 %, inferior al límite de referencia del 3 %. Asimismo, la cobertura alcanzó el 77,4 %, aunque todavía se encuentra por debajo del objetivo mínimo del 80 % establecido para el proyecto.

En cuanto a las calificaciones, la seguridad obtuvo una B, la fiabilidad una D y la mantenibilidad una A. Esto evidencia que, aunque el Quality Gate fue aprobado, todavía existen observaciones que deben revisarse y corregirse para mejorar la calidad general del código.

**Evidencias:**

![Evidencia 24: Resumen de SonarQube Cloud](../../06%20Otros/evidencias/Evidencia%2024%20Resumen%20de%20SonarQube%20Cloud.png)

![Evidencia 26: Pruebas y cobertura](../../06%20Otros/evidencias/Evidencia%2026%20Pruebas%20y%20cobertura.jpg)

---

## 2. Métricas Principales

Los resultados del análisis se resumen en la siguiente tabla:

| Categoría | Cantidad detectada | Severidad |
|---|:---:|---|
| **Bugs** | 1 | Alta |
| **Vulnerabilidades** | 1 | Baja |
| **Code Smells** | 16 | 13 bloqueantes y 3 medias, según el registro inicial |
| **Security Hotspots** | 0 | Sin observaciones |
| **Total de observaciones** | **18** | |

### Interpretación de los resultados

- **Bugs:** Se detectó un posible error en la comparación y ordenamiento de horas en el archivo `ruta.service.js`, línea 411.
- **Vulnerabilidades:** Se identificó la exposición de información tecnológica del servidor mediante la cabecera `X-Powered-By` en `server.js`.
- **Code Smells:** Se encontraron observaciones relacionadas con las aserciones de las pruebas automatizadas y la accesibilidad de algunos componentes de la interfaz.
- **Security Hotspots:** No se registraron puntos sensibles pendientes de revisión en el análisis realizado.

Adicionalmente, SonarQube Cloud presenta 1 cuestión abierta en seguridad, 4 en fiabilidad y 15 en mantenibilidad. Estas cantidades corresponden a las categorías de evaluación mostradas en el resumen de la herramienta.

Las observaciones identificadas deben revisarse y atenderse para continuar mejorando la calidad del proyecto.

**Evidencia:**

![Evidencia 25: Observaciones de SonarQube Cloud](../../06%20Otros/evidencias/Evidencia%2025%20Observaciones%20de%20SonarQube%20Cloud.jpg)

---

## 3. Plan de Remediación y Deuda Técnica

**Deuda técnica estimada:** 2 horas y 40 minutos.

La deuda técnica representa el tiempo estimado para corregir las observaciones detectadas durante el análisis. Para atenderlas, se establece el siguiente plan de remediación:

### 3.1. Principales hallazgos y acciones correctivas

**1. Error en la comparación de horas**

- **Hallazgo:** Posible error al ordenar las horas de los incidentes.
- **Ubicación:** `ruta.service.js`, línea 411.
- **Severidad:** Alta.
- **Acción correctiva:** Implementar una comparación explícita que permita ordenar las horas cronológicamente y validar el resultado mediante pruebas.
- **Responsable:** Henry.
- **Tiempo estimado:** 10 minutos.
- **Estado:** Pendiente de corrección y validación.

**2. Verificación de resultados en las pruebas automatizadas**

- **Hallazgo:** SonarQube no reconoce determinadas aserciones abreviadas y registra 13 observaciones en los archivos de pruebas.
- **Acción correctiva:** Revisar las verificaciones y utilizar aserciones explícitas, como `expect(respuesta.status).toBe(422)`, cuando corresponda. Ejecutar nuevamente las pruebas para comprobar los resultados.
- **Responsable:** Henry.
- **Tiempo estimado:** 2 horas y 10 minutos.
- **Estado:** Pendiente de revisión y validación.

**3. Accesibilidad de los componentes de la interfaz**

- **Hallazgo:** Se detectaron tres observaciones relacionadas con la selección automática de campos y los elementos de carga.
- **Ubicación:** `ConductorRuta.jsx`, `RutaDetalle.jsx` y `ui.jsx`.
- **Acción correctiva:** Revisar el uso de `autoFocus` y ajustar los elementos de carga para mejorar su comportamiento y accesibilidad.
- **Responsable:** Dayana.
- **Tiempo estimado:** 15 minutos.
- **Estado:** Pendiente de corrección y validación.

**4. Exposición de información tecnológica del servidor**

- **Hallazgo:** La cabecera `X-Powered-By` puede revelar el uso de Express.
- **Ubicación:** `server.js`.
- **Severidad:** Baja.
- **Acción correctiva:** Incorporar `app.disable("x-powered-by")` y verificar que la cabecera ya no se incluya en las respuestas del servidor.
- **Responsable:** Henry.
- **Tiempo estimado:** 5 minutos.
- **Estado:** Pendiente de corrección y validación.

### 3.2. Verificación final

Una vez implementadas las correcciones, se deberá:

1. Ejecutar las pruebas automatizadas y confirmar que todas finalicen correctamente.
2. Verificar que la cobertura alcance como mínimo el 80 % establecido para el proyecto.
3. Comprobar que la duplicación de código permanezca por debajo del 3 %.
4. Confirmar que los hallazgos corregidos ya no aparezcan como incidencias abiertas.
5. Ejecutar un nuevo análisis de SonarQube Cloud en la rama `main`.
6. Verificar que el Quality Gate mantenga el estado **PASSED** y guardar la evidencia del resultado final.

### Conclusión

La evaluación de calidad de código de EcoRuta Wanka obtuvo un resultado **PASSED (Aprobado)** en el Quality Gate de SonarQube Cloud. Entre los resultados obtenidos destacan una duplicación de código de 0,3 % y una cobertura de pruebas de 77,4 %.

Asimismo, se identificaron observaciones relacionadas con la seguridad, la fiabilidad y la mantenibilidad que requieren atención. Por ello, se establece un plan de remediación orientado a corregir los hallazgos y mejorar la cobertura hasta alcanzar el objetivo del 80 %.

De esta manera, se cuenta con una evaluación favorable de la puerta de calidad y con acciones definidas para continuar fortaleciendo la calidad y el mantenimiento del código fuente de EcoRuta Wanka.

---

[Volver al README principal](../../../README.md)