
# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 03. Evaluación de Calidad de Código — SonarQube V_1_0_0

**Versión:** V_1_0_0 | **Fecha:** 28/10/2026 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Herramienta:** SonarQube Cloud (versión en línea y gratuita de SonarQube), con las reglas estándar "Sonar way".

**Qué se revisó:** todo el código del repositorio github.com/DayanaJC/EcoRuta-Wanka, rama principal (`main`), versión `e8e117f` (cierre del Sprint 3). Son 93 archivos y unas 11 000 líneas de código.

---

## 1. Resumen Ejecutivo de Quality Gate

El **Quality Gate** es la "nota de aprobado o desaprobado" que SonarQube le pone al código.

- **Estado del Quality Gate:** **No calculado todavía.** SonarQube Cloud solo lo calcula a partir del segundo análisis, y este fue el primero. Según sus reglas, con los resultados de hoy **no aprobaría**, por el único error de funcionamiento encontrado (nota D en confiabilidad). Una vez corregido, debería aprobar.
- **Porcentaje de Cobertura de Pruebas (Coverage):** **87,55 %**. Es la parte del código que las pruebas automáticas revisan. Se midió ejecutando las 109 pruebas del proyecto en GitHub, y **las 109 pasaron**. La meta del proyecto es al menos 80 %, así que se cumple.
- **Duplicación de Código:** **0,3 %**. Casi no hay código repetido; el máximo aceptado es 3 %.

**Notas por tema** (de A = muy bien a E = muy mal):

| Tema | Nota | Qué significa |
| ---- | :--: | ------------- |
| Confiabilidad (¿falla el programa?) | **D** | Hay 1 error que conviene corregir. |
| Seguridad | **B** | Hay 1 detalle menor de seguridad. |
| Mantenibilidad (¿es fácil de cambiar?) | **A** | El código está ordenado y es fácil de mantener. |
| Puntos sensibles de seguridad revisados | **A** | No se encontró ninguno. |

![Evidencia 24: Resumen de SonarQube Cloud](../../06%20Otros/evidencias/Evidencia%2024%20Resumen%20de%20SonarQube%20Cloud.jpg)

![Evidencia 26: Pruebas y cobertura](../../06%20Otros/evidencias/Evidencia%2026%20Pruebas%20y%20cobertura.jpg)

---

## 2. Métricas Principales

| Categoría | Cantidad Detectada | Severidad (Bloqueante / Alta / Media / Baja) |
| :-------- | :----------------- | :------------------------------------------- |
| **Bugs** (errores que pueden hacer fallar el programa) | 1 | 1 Alta |
| **Vulnerabilidades** (puntos débiles de seguridad) | 1 | 1 Baja |
| **Code Smells** (código que funciona, pero se puede escribir mejor) | 16 | 13 Bloqueantes y 3 Medias |
| **Security Hotspots** (partes sensibles que hay que revisar a mano) | 0 | — |
| **Total** | **18 observaciones** | |

![Evidencia 25: Observaciones de SonarQube Cloud](../../06%20Otros/evidencias/Evidencia%2025%20Observaciones%20de%20SonarQube%20Cloud.jpg)

---

## 3. Plan de Remediación y Deuda Técnica

- **Deuda Técnica Estimada:** **2h 40min.** Es el tiempo que, según SonarQube, tomaría corregir las 18 observaciones.
- **Principales hallazgos y acciones correctivas:**

  1. **Error al ordenar las horas** (Bug – Alta), en `ruta.service.js`, línea 411. Para elegir la hora de un incidente, el sistema ordena una lista de horas como si fueran texto. Hoy funciona porque las horas tienen el formato "08:05", pero podría fallar si el formato cambia. **Corrección:** indicar de forma explícita cómo comparar las horas. *Responsable: Henry · 10 min.*
  2. **Pruebas sin verificación visible** (13 Code Smells – Bloqueante), en los archivos de pruebas. SonarQube no reconoce la forma corta de verificar el resultado (`.expect(422)`) y cree que esas 13 pruebas no comprueban nada. En realidad sí lo hacen y pasan. **Corrección:** escribir la verificación de forma explícita, por ejemplo `expect(respuesta.status).toBe(422)`, para que la herramienta la reconozca. *Responsable: Henry · 2h 10min.*
  3. **Detalles de accesibilidad en pantallas** (3 Code Smells – Media). Dos campos se seleccionan solos al abrir la pantalla (`autoFocus` en `ConductorRuta.jsx` y `RutaDetalle.jsx`), lo que confunde a quien usa lector de pantalla. Además, en `ui.jsx`, las filas grises que aparecen mientras cargan las tablas están ocultas para el lector de pantalla, pero SonarQube las marca como elementos que se pueden seleccionar. **Corrección:** quitar la selección automática y ajustar esas filas de carga. *Responsable: Dayana · 15 min.*
  4. **El servidor revela qué tecnología usa** (Vulnerabilidad – Baja), en `server.js`. Cada respuesta indica que el servidor usa Express, lo que le da pistas a un atacante. **Corrección:** ocultar ese dato con `app.disable("x-powered-by")`. *Responsable: Henry · 5 min.*

**Orden de trabajo:** primero el error de las horas (punto 1), porque es lo único que impide aprobar el Quality Gate. Después, la seguridad (punto 4), la accesibilidad (punto 3) y las pruebas (punto 2). Cuando se suban las correcciones a la rama principal, SonarQube Cloud volverá a analizar el código solo y calculará el Quality Gate.

---

[Volver al README principal](../../../README.md)
