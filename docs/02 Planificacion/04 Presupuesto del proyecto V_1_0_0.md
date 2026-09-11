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
- **Moneda de referencia:** Soles peruanos (S/), consistente con la moneda utilizada en el Acta de Constitución (doc. 02, §6) y en el Registro de Supuestos y Restricciones (doc. 04, CO-07).
- **Tarifas por hora (S/):** fijadas dentro del rango **"S/ 25–50/hora"** ya referenciado explícitamente en el Acta de Constitución (doc. 02, §6) para el equipo de desarrollo, y extendido de forma proporcional a roles de mayor o menor responsabilidad dentro de ese mismo orden de magnitud (Software Architect en el techo del rango; Junior Developer en el piso del rango).
- **Costos en moneda extranjera (SaaS/hosting):** los ítems de licenciamiento e infraestructura facturados internacionalmente en USD (Figma, GitHub Copilot, hosting) se convierten a soles a un tipo de cambio referencial de **S/ 3.75 por USD**, por ser el monto que efectivamente asumiría el equipo al pagarlos desde Perú.
- **Horizonte:** 14 semanas de proyecto (07 sep – 13 dic 2026), con asignación de horas variable por rol según su carga esperada en cada iteración (mayor carga de Arquitectura/UX en la Iteración 1; mayor carga de desarrollo en las Iteraciones 2–4; mayor carga de QA en las Iteraciones 3–4).
- **Stack de costo cero:** las tarifas de licenciamiento e infraestructura parten del stack seleccionado y justificado en el [doc. 10 "Stack tecnológico"](../01%20Inicio/10.%20Stack%20tecnol%C3%B3gico%20V_1_0_0.md) (React + Vite, FastAPI, Firebase Firestore en plan Spark gratuito), por lo que la mayoría de los ítems de licenciamiento e infraestructura tienen costo S/ 0.00.
- **Reserva de contingencia:** 12% del subtotal del proyecto, replicando el mismo porcentaje de contingencia (12%) ya utilizado en el Acta de Constitución (doc. 02, §6), dentro del rango sugerido de 10%–15%.

---

## 3. Costo de Recursos Humanos (CAPEX)

| Rol | Horas Asignadas | Tarifa Hora (S/) | Costo (S/) |
| --- | --- | --- | --- |
| Project Manager | 120 h | S/ 35.00 | S/ 4,200.00 |
| Software Architect | 160 h | S/ 50.00 | S/ 8,000.00 |
| Senior Developer | 420 h | S/ 45.00 | S/ 18,900.00 |
| Junior Developer (× 2) | 700 h | S/ 25.00 | S/ 17,500.00 |
| QA Engineer | 180 h | S/ 28.00 | S/ 5,040.00 |
| UI/UX Designer | 130 h | S/ 30.00 | S/ 3,900.00 |
| **TOTAL RECURSOS HUMANOS** | **1,710 h** | — | **S/ 57,540.00** |

> En la ejecución académica real, estos seis roles son cubiertos conjuntamente por los dos integrantes del equipo (Arroyo Canchari Henry y Javier Curi Dayana), conforme a la restricción R-13 del [doc. 13](../01%20Inicio/13.%20Restricciones%20V_1_0_0.md) (equipo de 2 integrantes, perfil académico) y al AS-08 del [doc. 04](../01%20Inicio/04.%20Registro%20de%20supuestos%20y%20restricciones%20V_1_0_0.md).

---

## 4. Costo de Licenciamiento y Herramientas

| Herramienta / Licencia | Plan / Descripción | Costo (S/) |
| --- | --- | --- |
| IDE (VS Code / PyCharm CE) | Gratuito / licencia académica | S/ 0.00 |
| Jira (Atlassian) | Plan Free, hasta 10 usuarios | S/ 0.00 |
| Confluence (Atlassian) | Plan Free | S/ 0.00 |
| Figma | Plan Profesional, 1 editor × 3 meses (USD 15/mes) | S/ 168.75 |
| GitHub Copilot | 2 desarrolladores × 3 meses (USD 10/mes c/u) | S/ 225.00 |
| SonarQube Community Edition / SonarCloud | Gratuito para repositorios públicos | S/ 0.00 |
| Postman | Plan Free (equipo) | S/ 0.00 |
| **TOTAL LICENCIAMIENTO** | | **S/ 393.75** |

---

## 5. Costo de Infraestructura Cloud y Servicios (OPEX)

| Servicio | Proveedor / Plan | Costo (S/) |
| --- | --- | --- |
| Firebase Cloud Firestore | Plan Spark (gratuito) | S/ 0.00 |
| Firebase Hosting (frontend) | Plan Spark (gratuito) | S/ 0.00 |
| Backend hosting (Render / Railway) | Capa gratuita + reserva por excedente puntual (3 meses, USD 21) | S/ 78.75 |
| Dominio web (.app) | Registro anual (USD 18) | S/ 67.50 |
| Certificado SSL | Let's Encrypt (incluido, gratuito) | S/ 0.00 |
| CI/CD | GitHub Actions, plan gratuito para repositorios públicos | S/ 0.00 |
| **TOTAL INFRAESTRUCTURA CLOUD (OPEX)** | | **S/ 146.25** |

> El costo casi nulo de licenciamiento e infraestructura (0.9% del subtotal, ver §6) es consecuencia directa de la selección tecnológica justificada en el doc. 10 (criterio "Costo de infraestructura" y "Eficiencia energética / Eco-Design", donde la alternativa seleccionada A4 obtuvo el puntaje máximo) y de las restricciones R-05/R-06/R-07 del doc. 13.

---

## 6. Tabla Resumen Financiera

| Categoría | Costo Subtotal (S/) | Porcentaje del Total |
| --- | --- | --- |
| 1. Recursos Humanos (CAPEX) | S/ 57,540.00 | 99.0% |
| 2. Licenciamiento de Software | S/ 393.75 | 0.7% |
| 3. Infraestructura Cloud (OPEX) | S/ 146.25 | 0.3% |
| **SUBTOTAL DE PROYECTO** | **S/ 58,080.00** | **100.0%** |
| 4. Reserva de Contingencia (12%) | S/ 6,969.60 | N/A |
| **PRESUPUESTO TOTAL ESTIMADO** | **S/ 65,049.60** | **100.0%** |

---

## 7. Nota de conciliación con el Acta de Constitución (doc. 02)

El Acta de Constitución presenta una estimación preliminar de tipo **orden de magnitud (ROM)** de **S/ 500,000**, agregada por macro-categorías (desarrollo, infraestructura, campo, UX/UI, documentación, contingencia) y explícitamente documentada como **"línea base simulada"** para el escenario comercial ficticio de WankaLogística S.A.C. a escala de una distribuidora en operación plena.

El presente documento refina esa estimación aplicando una técnica **bottom-up** (desglose por rol y hora, con tarifas ancladas al rango S/ 25–50/hora ya declarado en la propia Acta), acotada estrictamente al alcance del MVP académico (RF-01 a RF-10, 14 semanas, equipo de 2 integrantes) y al stack de costo cero seleccionado en el doc. 10. El resultado —**S/ 65,049.60**— es sustancialmente menor al ROM inicial del Acta (aproximadamente 13% de este). Esta diferencia es esperable y metodológicamente consistente por dos razones: (a) refleja el paso de una estimación de orden de magnitud (±50% o más, propia de la fase de Inicio) a una estimación más definitiva (propia de la fase de Planificación); y (b) el ROM del Acta dimensiona una operación comercial completa de WankaLogística S.A.C. (incluyendo, por ejemplo, S/ 60,000 de infraestructura en la nube a escala de producción), mientras que este documento costea únicamente el esfuerzo de construcción del MVP dentro del stack de costo cero ya justificado en el doc. 10, confirmando en cifras la política de "cero infraestructura propia" registrada como restricción CO-07 (doc. 04) y R-05/R-06/R-07 (doc. 13).

Ambos documentos permanecen vigentes, con propósitos distintos y complementarios:

- El **Acta de Constitución** fija el techo presupuestal autorizado para el escenario comercial simulado de WankaLogística S.A.C.
- El **presente documento** traza el costo operativo estimado de la ejecución académica real del PFA, con base en el stack, las horas y las tarifas efectivamente aplicables al equipo del proyecto.

---

## 8. Historial de Control de Cambios

| Versión | Fecha | Descripción del cambio | Autor |
| --- | --- | --- | --- |
| V_1_0_0 | 11/09/2026 | Creación inicial del Presupuesto del proyecto, con desglose bottom-up por rol/hora (CAPEX), licenciamiento y OPEX, y nota de conciliación con la estimación ROM del Acta de Constitución (doc. 02). | Arroyo Canchari Henry, Javier Curi Dayana |
| V_1_0_0 | 11/09/2026 | Corrección de moneda: se reemplaza el dólar estadounidense (USD) por el sol peruano (S/) como moneda de referencia del documento. Las tarifas de Recursos Humanos se re-anclan directamente al rango "S/ 25–50/hora" del Acta de Constitución (en vez de una conversión cambiaria de las tarifas en USD); los ítems de licenciamiento e infraestructura facturados internacionalmente se convierten a S/ 3.75 por USD. Se actualiza la Tabla Resumen y la Nota de conciliación con el Acta de Constitución. | Arroyo Canchari Henry, Javier Curi Dayana |
