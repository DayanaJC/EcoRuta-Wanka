**PROYECTO FINAL DE CARRERA (PFA)**
**EcoRuta Wanka**
*Optimizador de rutas sostenibles de última milla — Huancayo, Junín*

# 04. Presupuesto del proyecto

**Versión:** V_1_0_0   |   **Fecha:** 11/09/2026   |   **Organización:** WankaLogística S.A.C.   |   **Ubicación:** Huancayo, Junín, Perú   |   **Repositorio:** [github.com/DayanaJC/EcoRuta-Wanka](https://github.com/DayanaJC/EcoRuta-Wanka)
**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

---

## 1. Objeto del documento

Este documento presenta el modelado financiero integral del MVP de EcoRuta Wanka, desagregando el costo total proyectado de desarrollo e infraestructura en cuatro componentes: Recursos Humanos (CAPEX), Licenciamiento de software, Infraestructura Cloud (OPEX) y Reserva de Contingencia. El alcance corresponde a las **14 semanas / 4 iteraciones** definidas en el [Acta de Constitución](../01%20Inicio/02.%20Acta%20de%20constituci%C3%B3n%20V_1_0_0.md) (doc. 02, §5) y a los requisitos funcionales RF-01 a RF-10 del [doc. 06](../01%20Inicio/06.%20Requisitos%20funcionales%20V_1_0_0.md).

---

## 2. Metodología y supuestos de cálculo

- **Técnica de estimación:** bottom-up (desglose por rol, hora y tarifa), a diferencia de la estimación tipo orden de magnitud (ROM) presentada en el Acta de Constitución (doc. 02, §6), que agregaba el presupuesto por macro-categorías.
- **Tarifas por hora (USD):** reflejan un escenario de consultoría regional para un equipo simulado de WankaLogística S.A.C., coherente con el rango "S/ 25–50/hora" ya referenciado en el Acta de Constitución para el equipo de desarrollo.
- **Horizonte:** 14 semanas de proyecto (07 sep – 13 dic 2026), con asignación de horas variable por rol según su carga esperada en cada iteración (mayor carga de Arquitectura/UX en la Iteración 1; mayor carga de desarrollo en las Iteraciones 2–4; mayor carga de QA en las Iteraciones 3–4).
- **Stack de costo cero:** las tarifas de licenciamiento e infraestructura parten del stack seleccionado y justificado en el [doc. 10 "Stack tecnológico"](../01%20Inicio/10.%20Stack%20tecnol%C3%B3gico%20V_1_0_0.md) (React + Vite, FastAPI, Firebase Firestore en plan Spark gratuito), por lo que la mayoría de los ítems de licenciamiento e infraestructura tienen costo USD 0.00.
- **Reserva de contingencia:** 12% del subtotal del proyecto, replicando el mismo porcentaje de contingencia (12%) ya utilizado en el Acta de Constitución (doc. 02, §6), dentro del rango sugerido de 10%–15%.

---

## 3. Costo de Recursos Humanos (CAPEX)

| Rol | Horas Asignadas | Tarifa Hora (USD) | Costo (USD) |
| --- | --- | --- | --- |
| Project Manager | 120 h | $ 25.00 | $ 3,000.00 |
| Software Architect | 160 h | $ 40.00 | $ 6,400.00 |
| Senior Developer | 420 h | $ 30.00 | $ 12,600.00 |
| Junior Developer (× 2) | 700 h | $ 15.00 | $ 10,500.00 |
| QA Engineer | 180 h | $ 18.00 | $ 3,240.00 |
| UI/UX Designer | 130 h | $ 20.00 | $ 2,600.00 |
| **TOTAL RECURSOS HUMANOS** | **1,710 h** | — | **$ 38,340.00** |

> En la ejecución académica real, estos seis roles son cubiertos conjuntamente por los dos integrantes del equipo (Arroyo Canchari Henry y Javier Curi Dayana), conforme a la restricción R-13 del [doc. 13](../01%20Inicio/13.%20Restricciones%20V_1_0_0.md) (equipo de 2 integrantes, perfil académico) y al AS-08 del [doc. 04](../01%20Inicio/04.%20Registro%20de%20supuestos%20y%20restricciones%20V_1_0_0.md).

---

## 4. Costo de Licenciamiento y Herramientas

| Herramienta / Licencia | Plan / Descripción | Costo (USD) |
| --- | --- | --- |
| IDE (VS Code / PyCharm CE) | Gratuito / licencia académica | $ 0.00 |
| Jira (Atlassian) | Plan Free, hasta 10 usuarios | $ 0.00 |
| Confluence (Atlassian) | Plan Free | $ 0.00 |
| Figma | Plan Profesional, 1 editor × 3 meses ($15/mes) | $ 45.00 |
| GitHub Copilot | 2 desarrolladores × 3 meses ($10/mes c/u) | $ 60.00 |
| SonarQube Community Edition / SonarCloud | Gratuito para repositorios públicos | $ 0.00 |
| Postman | Plan Free (equipo) | $ 0.00 |
| **TOTAL LICENCIAMIENTO** | | **$ 105.00** |

---

## 5. Costo de Infraestructura Cloud y Servicios (OPEX)

| Servicio | Proveedor / Plan | Costo (USD) |
| --- | --- | --- |
| Firebase Cloud Firestore | Plan Spark (gratuito) | $ 0.00 |
| Firebase Hosting (frontend) | Plan Spark (gratuito) | $ 0.00 |
| Backend hosting (Render / Railway) | Capa gratuita + reserva por excedente puntual (3 meses) | $ 21.00 |
| Dominio web (.app) | Registro anual | $ 18.00 |
| Certificado SSL | Let's Encrypt (incluido, gratuito) | $ 0.00 |
| CI/CD | GitHub Actions, plan gratuito para repositorios públicos | $ 0.00 |
| **TOTAL INFRAESTRUCTURA CLOUD (OPEX)** | | **$ 39.00** |

> El costo casi nulo de licenciamiento e infraestructura (0.4% del subtotal, ver §6) es consecuencia directa de la selección tecnológica justificada en el doc. 10 (criterio "Costo de infraestructura" y "Eficiencia energética / Eco-Design", donde la alternativa seleccionada A4 obtuvo el puntaje máximo) y de las restricciones R-05/R-06/R-07 del doc. 13.

---

## 6. Tabla Resumen Financiera

| Categoría | Costo Subtotal (USD) | Porcentaje del Total |
| --- | --- | --- |
| 1. Recursos Humanos (CAPEX) | $ 38,340.00 | 99.6% |
| 2. Licenciamiento de Software | $ 105.00 | 0.3% |
| 3. Infraestructura Cloud (OPEX) | $ 39.00 | 0.1% |
| **SUBTOTAL DE PROYECTO** | **$ 38,484.00** | **100.0%** |
| 4. Reserva de Contingencia (12%) | $ 4,618.08 | N/A |
| **PRESUPUESTO TOTAL ESTIMADO** | **$ 43,102.08** | **100.0%** |

---

## 7. Nota de conciliación con el Acta de Constitución (doc. 02)

El Acta de Constitución presenta una estimación preliminar de tipo **orden de magnitud (ROM)** de **S/ 500,000** (≈ USD 133,333 a un tipo de cambio referencial de S/ 3.75 por USD), agregada por macro-categorías (desarrollo, infraestructura, campo, UX/UI, documentación, contingencia) y explícitamente documentada como **"línea base simulada"** para el escenario comercial ficticio de WankaLogística S.A.C.

El presente documento refina esa estimación aplicando una técnica **bottom-up** (desglose por rol y hora), acotada estrictamente al alcance del MVP académico (RF-01 a RF-10, 14 semanas) y al stack de costo cero seleccionado en el doc. 10. El resultado —**USD 43,102.08 (≈ S/ 161,633)**— es significativamente menor al ROM inicial del Acta. Esta diferencia es esperable y metodológicamente consistente: refleja el paso de una estimación de orden de magnitud (±50%, propia de la fase de Inicio) a una estimación más definitiva (propia de la fase de Planificación), y confirma en cifras la política de "cero infraestructura propia" ya registrada como restricción CO-07 (doc. 04) y R-05/R-06/R-07 (doc. 13).

Ambos documentos permanecen vigentes, con propósitos distintos y complementarios:

- El **Acta de Constitución** fija el techo presupuestal autorizado para el escenario comercial simulado de WankaLogística S.A.C.
- El **presente documento** traza el costo operativo estimado de la ejecución académica real del PFA, con base en el stack, las horas y las tarifas efectivamente aplicables al equipo del proyecto.

---

## 8. Historial de Control de Cambios

| Versión | Fecha | Descripción del cambio | Autor |
| --- | --- | --- | --- |
| V_1_0_0 | 11/09/2026 | Creación inicial del Presupuesto del proyecto, con desglose bottom-up por rol/hora (CAPEX), licenciamiento y OPEX, y nota de conciliación con la estimación ROM del Acta de Constitución (doc. 02). | Arroyo Canchari Henry, Javier Curi Dayana |
