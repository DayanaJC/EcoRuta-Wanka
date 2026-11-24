# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 04. Tableros de Control Híbridos (Hybrid Dashboards)

**Proyecto:** EcoRuta Wanka — Optimizador de rutas sostenibles de última milla para WankaLogística S.A.C. | **Frecuencia de Actualización:** al terminar cada sprint (cada 2 a 3 semanas) y en cada fecha de corte; el estado de las pruebas se actualiza solo en cada cambio subido a GitHub | **Versión:** 1.0.0

**Fecha de corte:** 26/11/2026 (cierre del proyecto) | **Líder del proyecto:** Javier Curi Dayana | **Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

Un tablero híbrido junta en una sola vista dos tipos de control:

- **predictivo:** presupuesto, cronograma y valor ganado;
- **ágil:** historias de usuario, Story Points y pruebas en cada sprint.

---

## 1. Justificación de Métricas (Principio Less is More)

- **Necesidades de los interesados:**
  - **Docente / director del proyecto:** saber si el proyecto llega a tiempo, si está dentro del presupuesto y si la calidad es suficiente.
  - **WankaLogística S.A.C. (cliente):** saber qué funciones ya puede usar y si el sistema es fácil de manejar.
  - **Equipo de desarrollo:** saber qué entregable sigue y si algo se está rompiendo.
- **Criterios de selección de KPIs:** usamos **pocas métricas, cada una para una sola pregunta**, en vez de llenar el tablero de datos:

| Pregunta | Métrica elegida | Meta (verde) |
|---|---|---|
| ¿Vamos a tiempo? | SPI | ≥ 1,00 |
| ¿Estamos en presupuesto? | CPI | ≥ 0,95 |
| ¿Cuánto del alcance está listo? | Story Points terminados / alcance total | 100 % al cierre |
| ¿Funciona bien? | Pruebas aprobadas y cobertura | 100 % aprobadas, cobertura ≥ 80 % |
| ¿Es fácil de usar? | Puntaje SUS | ≥ 68 |
| ¿Responde rápido? | Tiempo de respuesta de la API | < 500 ms |

## 2. Tabla Semáforo (RAG Chart) por Componente

Umbrales generales: 🟢 la meta se cumple; 🟡 hay una desviación pequeña o depende de algo externo; 🔴 la meta no se cumple y afecta la entrega.

| Componente / Entregable | Enfoque (Predictivo/Adaptativo) | Estado (🟢 Verde / 🟡 Ámbar / 🔴 Rojo) | Observación / Umbral |
|---|---|---|---|
| Alcance: 10 historias de usuario (78 SP) | Adaptativo | 🟢 Verde | 78 de 78 SP aceptados en las Sprint Reviews. US-010 se agregó en el Sprint 4. |
| Cronograma general (16 semanas) | Predictivo | 🟢 Verde | SPI 1,077 (verde ≥ 1,00). Terminó el 26/11, 10 días antes de lo planificado. El retraso del Sprint 1 (+7 días) se recuperó en el Sprint 2. |
| Costos y presupuesto | Predictivo | 🟡 Ámbar | CPI 0,939 (ámbar entre 0,90 y 0,95). Costo final de S/ 61,884.25: usa el 54,6 % de la reserva y queda dentro del total aprobado. |
| Calidad del software (pruebas) | Adaptativo | 🟢 Verde | 131/131 pruebas del backend y 79/79 pruebas E2E. Cobertura de 86,1 % (meta ≥ 80 %). |
| Usabilidad | Adaptativo | 🟢 Verde | SUS de 79,06 (meta ≥ 68), grado A−. |
| Rendimiento y disponibilidad | Adaptativo | 🟢 Verde | API entre 245 y 278 ms (meta < 500 ms). Disponibilidad del 100 % en la prueba. |
| Automatización CI/CD | Adaptativo | 🟢 Verde | Los 4 workflows de GitHub Actions están en verde. |
| Publicación en producción | Predictivo | 🟢 Verde | Versión final publicada en Vercel con Next.js 16.4.6. Aplicación y API operativas, con la base de datos conectada. |
| Documentación de cierre y video | Predictivo | 🟢 Verde | Los 7 documentos de `docs/04 Cierre` y el video de `docs/05 Video proyecto` están entregados (26/11/2026). |

## 3. Gráficos de Desempeño Predictivo y Ágil

### 3.1 Tendencias de Variación y Valor Ganado (Líneas)

![Gráfico EVM](../06%20Otros/evidencias/Evidencia%2046%20Curva%20S%20de%20valor%20ganado.png)

**Interpretación:**

- **PV y EV:** la línea verde (EV) va sobre la azul (PV) hasta el Sprint 4, por eso la azul casi no se ve. En el cierre, EV llega al **BAC (S/ 58,080)** mientras PV solo llega a S/ 53,166: el proyecto terminó **antes de lo planificado**.
- **Costo real (AC):** la línea roja está siempre un poco por encima. La separación nace en el **Sprint 1** (cambio de tecnología) y crece un poco en el Sprint 4 (historia nueva US-010).
- **Presupuesto:** el costo final (S/ 61,884) supera el BAC (línea punteada) en S/ 3,804, un monto que cubre la reserva de contingencia. Por eso el costo está en ámbar y no en rojo.

### 3.2 Flujo Acumulado / Áreas Apiladas

![Flujo Acumulado](../06%20Otros/evidencias/Evidencia%2047%20Flujo%20acumulado%20del%20backlog.png)

**Interpretación:**

- **Verde (terminado):** crece de forma constante: 23, 52, 70 y 78 SP.
- **Gris (pendiente):** se reduce a cero al final del Sprint 3.
- **Cambio de alcance:** en el Sprint 4 el total sube de 70 a 78 SP por la historia US-010, y ese mismo sprint se termina.
- **Sin cuellos de botella:** no hay tramos planos en el área verde, así que el trabajo nunca se quedó estancado.

### 3.3 Relación Costo-Cronograma (SPI vs. CPI con tamaño CSI)

![Gráfico de Burbujas](../06%20Otros/evidencias/Evidencia%2048%20Burbujas%20SPI%20vs%20CPI.png)

**Interpretación:**

- **Qué es cada burbuja:** un momento del proyecto (fin de cada sprint y el cierre).
- **Qué indica su tamaño:** el **CSI** (índice de satisfacción del cliente):
  - en los sprints es el porcentaje de historias aceptadas en la Review (100 % en todos);
  - en el cierre es el puntaje de usabilidad SUS (79/100).
- **Lectura:** todas las burbujas están sobre o a la derecha de SPI = 1 (a tiempo o adelantado) y bajo CPI = 1 (algo de sobrecosto). El peor punto fue el **Sprint 1** (CPI 0,896). El costo mejoró en los sprints 2 y 3 y se mantuvo estable en el cierre (CPI 0,939).
- **Al cierre:** el proyecto quedó en la zona «adelantado pero con sobrecosto» (SPI 1,077), con el cliente satisfecho.

### 3.4 Medidores de Estado (Gauges) / Gráficos de Barras

![Medidores y Barras](../06%20Otros/evidencias/Evidencia%2049%20Barras%20y%20medidores%20de%20estado.png)

**Interpretación:**

- **Barras:** cada sprint completó todos los Story Points que planificó (23, 29 y 18). El Sprint 4 no tenía historias planificadas, porque estaba reservado para integración y pruebas, y aun así completó las 8 SP de US-010.
- **Medidores en verde:**
  - SPI: 1,077;
  - usabilidad SUS: 79,06;
  - cobertura de pruebas: 86,1 %.
- **Medidor en ámbar:** el **CPI** (0,939) es el único indicador por debajo de su meta. El exceso de costo quedó cubierto por la reserva de contingencia.

---

Los cálculos de PV, EV, AC, SPI, CPI y EAC están en el [03 Reporte de Análisis de Valor Ganado](03%20Reporte%20de%20An%C3%A1lisis%20de%20Valor%20Ganado%20-%20EVM%20V_1_0_0.md).

[⬅️ Volver al README Principal](../../README.md)
