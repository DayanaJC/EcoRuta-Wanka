# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 04. Evaluación Cuantitativa de Usabilidad (SUS) V_1_0_0

[← Volver al README principal](../../../README.md)

**Versión:** V_1_0_0
**Fecha:** 20/11/2026
**Organización:** WankaLogística S.A.C.
**Ubicación:** Huancayo, Junín, Perú
**Repositorio:** https://github.com/DayanaJC/EcoRuta-Wanka

**Líder del proyecto:** Javier Curi Dayana
**Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

**Sistema evaluado:** EcoRuta Wanka en producción
- Aplicación web: https://ecoruta-frontend.vercel.app
- Consulta pública del pedido: https://ecoruta-frontend.vercel.app/seguimiento
- Versión evaluada: `main`, commit `d9ffc80` (PR #20, cierre del Sprint 4)

> **Nota sobre la muestra:** igual que los datos de WankaLogística S.A.C., que corresponden a un escenario simulado del proyecto académico, los participantes y sus respuestas de esta evaluación son **perfiles simulados** construidos para representar a los usuarios reales del sistema (comunidad universitaria y personal de una empresa logística mediana). El instrumento, las tareas y los cálculos siguen el procedimiento estándar de SUS y pueden repetirse con usuarios reales sin cambiar el método.

---

## 1. Ficha técnica de la evaluación

| Elemento | Detalle |
|---|---|
| **Instrumento** | System Usability Scale (SUS), John Brooke (1996), versión en español de 10 ítems. |
| **Justificación** | Es el cuestionario de usabilidad más usado en la industria, funciona con muestras pequeñas (desde 5 participantes), entrega un puntaje de 0 a 100 comparable con el promedio de referencia de 68 puntos y tiene escalas de interpretación conocidas (adjetivos y grados A–F). |
| **Escala de valoración** | Likert de 5 puntos: 1 = Totalmente en desacuerdo, 2 = En desacuerdo, 3 = Neutral, 4 = De acuerdo, 5 = Totalmente de acuerdo. |
| **Tamaño de la muestra** | n = 8 participantes. |
| **Perfil de la muestra** | 3 personas del contexto universitario (Universidad Continental, Huancayo) y 5 personas del contexto empresarial (empresa logística mediana de Huancayo, del perfil de WankaLogística S.A.C.). |
| **Modalidad** | Prueba moderada, individual, en el sistema desplegado en producción. Un integrante del equipo leía las tareas y anotaba tiempos y dudas sin ayudar al participante. |
| **Dispositivos** | Laptop con Chrome (1366 × 768) para el panel del operador y celular Android con Chrome para la consulta pública del pedido. |
| **Duración por sesión** | 20 a 25 minutos (15 min de tareas + 5 min de cuestionario). |
| **Fecha de aplicación** | 19/11/2026 y 20/11/2026. |

### 1.1. Perfil de los participantes

| ID | Contexto | Perfil | Experiencia con sistemas web | Rol que representa en EcoRuta |
|---|---|---|---|---|
| P1 | Universitario | Estudiante de Ingeniería de Sistemas e Informática, 9.º ciclo | Alta | Operador (evaluador técnico) |
| P2 | Universitario | Estudiante de Ingeniería Industrial, 7.º ciclo (curso de logística) | Media | Operador / planificador de rutas |
| P3 | Universitario | Estudiante de Administración de Empresas, 6.º ciclo | Media | Cliente que consulta su pedido |
| P4 | Empresa mediana | Jefe de operaciones logísticas | Media | Supervisor de rutas y sostenibilidad |
| P5 | Empresa mediana | Asistente de despacho | Media | Operador que registra pedidos y avisa al cliente |
| P6 | Empresa mediana | Encargado de almacén | Baja | Operador de vehículos y bultos |
| P7 | Empresa mediana | Conductor repartidor | Baja | Conductor (usa el celular) |
| P8 | Empresa mediana | Cliente comercial (bodega en El Tambo) | Media | Cliente que consulta su pedido |

### 1.2. Tareas ejecutadas antes de responder el cuestionario

Cada participante realizó las tareas de su rol. Las tareas cubren las funciones del Sprint 4 (US-010) y los flujos principales de los sprints anteriores.

| Tarea | Descripción | Pantalla | Participantes |
|---|---|---|---|
| T1 | Registrar un cliente con su DNI o RUC y su teléfono. | Clientes → Nuevo cliente | P1, P2, P4, P5, P6 |
| T2 | Registrar un pedido para ese cliente marcando la ubicación en el mapa. | Pedidos → Nuevo pedido | P1, P2, P4, P5, P6 |
| T3 | Generar la ruta optimizada del día y revisar el CO₂ evitado. | Rutas → Nueva ruta | P1, P2, P4, P6 |
| T4 | Abrir el detalle del pedido, revisar los avisos y abrir WhatsApp con el mensaje preparado. | Detalle del pedido → Avisos al cliente | P1, P2, P4, P5, P7 |
| T5 | Buscar un pedido en «¿Dónde está mi pedido?» usando el número de celular. | /seguimiento | Todos |
| T6 | Abrir el seguimiento del pedido e identificar su estado y la hora estimada de llegada. | /seguimiento/[token] | Todos |

### 1.3. Cuestionario SUS aplicado

| Ítem | Enunciado | Tipo |
|---:|---|---|
| 1 | Creo que me gustaría usar este sistema con frecuencia. | Positivo (impar) |
| 2 | Encontré el sistema innecesariamente complejo. | Negativo (par) |
| 3 | Pensé que el sistema era fácil de usar. | Positivo (impar) |
| 4 | Creo que necesitaría el apoyo de una persona técnica para poder usar este sistema. | Negativo (par) |
| 5 | Encontré que las distintas funciones del sistema estaban bien integradas. | Positivo (impar) |
| 6 | Pensé que había demasiada inconsistencia en el sistema. | Negativo (par) |
| 7 | Imagino que la mayoría de las personas aprendería a usar este sistema muy rápido. | Positivo (impar) |
| 8 | Encontré el sistema muy difícil de usar. | Negativo (par) |
| 9 | Me sentí muy seguro(a) usando el sistema. | Positivo (impar) |
| 10 | Necesité aprender muchas cosas antes de poder usar el sistema. | Negativo (par) |

---

## 2. Resultados de las tareas

| Tarea | Intentos | Completadas sin ayuda | Tasa de éxito | Tiempo promedio | Observación principal |
|---|---:|---:|---:|---:|---|
| T1 | 5 | 5 | 100 % | 1 min 05 s | P6 escribió el RUC con guiones; el formulario indicó el formato correcto (8 u 11 dígitos). |
| T2 | 5 | 5 | 100 % | 2 min 40 s | Marcar la ubicación en el mapa fue lo más lento; dos participantes probaron primero escribiendo la dirección. |
| T3 | 4 | 3 | 75 % | 3 min 10 s | P6 no entendió «disponible desde» ni «aprovechamiento %» y pidió confirmación antes de generar la ruta. |
| T4 | 5 | 5 | 100 % | 0 min 50 s | P7 esperaba que el aviso se enviara solo; no sabía que debía pulsar «Enviar» en WhatsApp. |
| T5 | 8 | 8 | 100 % | 0 min 35 s | P3 y P8 escribieron el celular con espacios y el sistema lo aceptó. |
| T6 | 8 | 8 | 100 % | 0 min 25 s | El mapa del seguimiento tardó en aparecer en el celular (LCP de 1,7 s según el informe 03). |
| **Total** | **35** | **34** | **97,1 %** | — | — |

---

## 3. Resultados cuantitativos

### 3.1. Matriz de respuestas brutas

Valores de la escala Likert (1–5) marcados por cada participante.

| ID | Ítem 1 | Ítem 2 | Ítem 3 | Ítem 4 | Ítem 5 | Ítem 6 | Ítem 7 | Ítem 8 | Ítem 9 | Ítem 10 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| P1 | 5 | 1 | 5 | 1 | 4 | 2 | 5 | 1 | 5 | 1 |
| P2 | 4 | 2 | 4 | 1 | 4 | 2 | 5 | 2 | 4 | 1 |
| P3 | 4 | 2 | 4 | 2 | 4 | 2 | 4 | 2 | 4 | 2 |
| P4 | 4 | 2 | 4 | 2 | 5 | 1 | 4 | 2 | 4 | 2 |
| P5 | 4 | 1 | 5 | 1 | 4 | 2 | 4 | 1 | 5 | 2 |
| P6 | 4 | 2 | 4 | 2 | 4 | 2 | 4 | 2 | 3 | 2 |
| P7 | 3 | 2 | 4 | 3 | 4 | 2 | 3 | 2 | 3 | 3 |
| P8 | 4 | 2 | 4 | 1 | 3 | 2 | 4 | 2 | 4 | 1 |
| **Promedio** | **4,00** | **1,75** | **4,25** | **1,63** | **4,00** | **1,88** | **4,13** | **1,75** | **4,00** | **1,75** |

### 3.2. Fórmula de conversión SUS

1. **Ítems impares (1, 3, 5, 7, 9)**, enunciados positivos: contribución = respuesta − 1.
2. **Ítems pares (2, 4, 6, 8, 10)**, enunciados negativos: contribución = 5 − respuesta.
3. Cada contribución va de 0 a 4. Se suman las 10 contribuciones (0 a 40).
4. **Puntaje SUS = suma de contribuciones × 2,5** (0 a 100).

### 3.3. Cálculo paso a paso por participante

| ID | Contribuciones impares (R−1) | Suma impares | Contribuciones pares (5−R) | Suma pares | Total (0–40) | SUS (× 2,5) |
|---|---|---:|---|---:|---:|---:|
| P1 | 4 + 4 + 3 + 4 + 4 | 19 | 4 + 4 + 3 + 4 + 4 | 19 | 38 | **95,0** |
| P2 | 3 + 3 + 3 + 4 + 3 | 16 | 3 + 4 + 3 + 3 + 4 | 17 | 33 | **82,5** |
| P3 | 3 + 3 + 3 + 3 + 3 | 15 | 3 + 3 + 3 + 3 + 3 | 15 | 30 | **75,0** |
| P4 | 3 + 3 + 4 + 3 + 3 | 16 | 3 + 3 + 4 + 3 + 3 | 16 | 32 | **80,0** |
| P5 | 3 + 4 + 3 + 3 + 4 | 17 | 4 + 4 + 3 + 4 + 3 | 18 | 35 | **87,5** |
| P6 | 3 + 3 + 3 + 3 + 2 | 14 | 3 + 3 + 3 + 3 + 3 | 15 | 29 | **72,5** |
| P7 | 2 + 3 + 3 + 2 + 2 | 12 | 3 + 2 + 3 + 3 + 2 | 13 | 25 | **62,5** |
| P8 | 3 + 3 + 2 + 3 + 3 | 14 | 3 + 4 + 3 + 3 + 4 | 17 | 31 | **77,5** |

**Ejemplo desarrollado (P7):**
- Impares: (3−1) + (4−1) + (4−1) + (3−1) + (3−1) = 2 + 3 + 3 + 2 + 2 = **12**
- Pares: (5−2) + (5−3) + (5−2) + (5−2) + (5−3) = 3 + 2 + 3 + 3 + 2 = **13**
- SUS = (12 + 13) × 2,5 = 25 × 2,5 = **62,5**

### 3.4. Puntaje SUS promedio global

**SUS promedio = (95,0 + 82,5 + 75,0 + 80,0 + 87,5 + 72,5 + 62,5 + 77,5) / 8 = 632,5 / 8 = 79,06**

| Estadístico | Valor |
|---|---:|
| Puntaje SUS promedio | **79,06** |
| Mediana | 78,75 |
| Desviación estándar (muestral) | 9,81 |
| Mínimo / Máximo | 62,5 (P7) / 95,0 (P1) |
| Intervalo de confianza al 95 % (t de Student, gl = 7) | 70,9 – 87,3 |
| Participantes con SUS ≥ 68 | 7 de 8 (87,5 %) |

El intervalo de confianza se calculó como 79,06 ± 2,365 × (9,81 / √8) = 79,06 ± 8,20.

### 3.5. Resultado por contexto

| Contexto | Participantes | SUS promedio | Lectura |
|---|---|---:|---|
| Universitario | P1, P2, P3 | 84,17 | Usuarios con más experiencia digital: aprenden rápido y se sienten seguros. |
| Empresa mediana | P4, P5, P6, P7, P8 | 76,00 | Buen resultado, pero baja en los perfiles operativos con poca experiencia (almacén y conductor). |

---

## 4. Análisis e interpretación

### 4.1. Comparación con el estándar de la industria

| Referencia | Valor | EcoRuta Wanka |
|---|---:|---|
| Umbral de aceptación (promedio de la industria, Sauro 2011) | 68 | **79,06 → supera el umbral en 11,06 puntos** |
| Límite inferior del intervalo de confianza al 95 % | 68 | 70,9 → incluso en el peor caso estimado se mantiene sobre 68 |
| Percentil aproximado (Sauro y Lewis, 2016) | — | Alrededor del percentil 85: mejor que el 85 % de los sistemas evaluados con SUS |

### 4.2. Clasificación por adjetivos y grados

| Escala | Rangos | Clasificación obtenida |
|---|---|---|
| **Grado (Sauro y Lewis, curva A–F)** | A+ ≥ 84,1 · A 80,8–84,0 · **A− 78,9–80,7** · B+ 77,2–78,8 · B 74,1–77,1 · B− 72,6–74,0 · C+ 71,1–72,5 · C 65,0–71,0 · C− 62,7–64,9 · D 51,7–62,6 · F < 51,7 | **A−** |
| **Adjetivo (Bangor, Kortum y Miller, 2009)** | Peor imaginable · Pobre · Aceptable/OK · **Bueno (≈ 71–85)** · Excelente (≈ 85–100) · Mejor imaginable | **Bueno** |
| **Aceptabilidad** | No aceptable (< 50) · Marginal (50–70) · **Aceptable (> 70)** | **Aceptable** |

Clasificación individual: P1 y P5 en **A+** (Excelente); P2 en **A**; P4 en **A−**; P8 en **B+**; P3 en **B**; P6 en **C+**; P7 en **D** (por debajo de 68).

### 4.3. Lectura por ítem

- **Puntos fuertes:** el ítem 3 («fácil de usar», promedio 4,25) y el ítem 4 («necesitaría apoyo técnico», 1,63) son los mejores. La consulta pública del pedido (T5 y T6) fue la parte mejor valorada: todos la completaron en menos de un minuto.
- **Puntos débiles:** el ítem 6 («inconsistencia», 1,88) es el par más alto, y los ítems 9 («me sentí seguro») y 10 («necesité aprender muchas cosas») bajan en P6 y P7. Coincide con las tareas donde hubo dudas (T3 y T4).

### 4.4. Cuellos de botella de la interfaz

| N.º | Cuello de botella | Evidencia | Ítems SUS afectados | Participantes |
|---:|---|---|---|---|
| CB-01 | Vocabulario técnico en «Nueva ruta»: «disponible desde», «aprovechamiento %», «ventana horaria». | T3 con 75 % de éxito; P6 pidió confirmación. | 4, 9, 10 | P6, P7 |
| CB-02 | El aviso al cliente no se envía solo: el operador debe abrir WhatsApp y pulsar «Enviar». | P7 esperaba un envío automático en T4. | 5, 6 | P7, P4 |
| CB-03 | Marcar la ubicación en el mapa toma tiempo y no es evidente que se puede escribir la dirección o marcar el punto. | T2 fue la tarea de registro más lenta (2 min 40 s). | 3, 7 | P2, P6 |
| CB-04 | El mapa de la página de seguimiento aparece después del resto del contenido en el celular. | LCP de 1,7 s en la página de seguimiento (informe 03), frente a 0,88 s en la página principal. | 5, 9 | P3, P8 |

### 4.5. Mejoras aplicadas en el Sprint 4

Estas decisiones ya están en producción (PR #19 y PR #20) y explican los buenos resultados de T1, T5 y T6:

| Mejora | Dónde | Efecto observado |
|---|---|---|
| Un solo campo de búsqueda que acepta código P-XXXXXX, DNI/RUC o celular, con mensaje que indica qué escribir si el dato no es válido. | /seguimiento | T5 con 100 % de éxito y 35 s promedio. |
| Si hay un solo pedido, se abre directamente su seguimiento; si hay varios, se listan con los que están en curso primero. | /seguimiento | Menos pasos para el cliente. |
| Validación de DNI (8 dígitos) y RUC (11 dígitos) con mensaje junto al campo. | Clientes | P6 corrigió el RUC sin ayuda en T1. |
| Etapas del reparto con hora estimada de llegada y actualización automática cada 15 s. | /seguimiento/[token] | T6 con 100 % de éxito en 25 s promedio. |

### 4.6. Mejoras propuestas

| N.º | Mejora propuesta | Cuello de botella | Responsable | Meta de seguimiento |
|---:|---|---|---|---|
| M-01 | Cambiar los rótulos técnicos por lenguaje simple («Hora de salida desde», «Espacio aprovechable del vehículo») y agregar ayudas emergentes (ícono «?»). | CB-01 | Arroyo Canchari Henry | Éxito en T3 ≥ 90 % y SUS de perfiles operativos ≥ 70. |
| M-02 | Mostrar junto al botón de WhatsApp la indicación «Se abrirá WhatsApp: revisa el mensaje y pulsa Enviar»; a futuro, integrar WhatsApp Business API (pendiente registrado en la Revisión del Sprint). | CB-02 | Javier Curi Dayana | 0 dudas sobre el envío en T4. |
| M-03 | Mostrar el texto «Escribe la dirección o toca el mapa para marcar el punto» en el selector de ubicación. | CB-03 | Arroyo Canchari Henry | Tiempo de T2 ≤ 2 min. |
| M-04 | Cargar el mapa del seguimiento con una imagen de vista previa liviana y diferir los mosaicos hasta que el mapa sea visible. | CB-04 | Arroyo Canchari Henry | LCP del seguimiento ≤ 1,2 s en Playwright. |
| M-05 | Repetir la evaluación SUS después de aplicar M-01 a M-04 con al menos 5 usuarios del perfil operativo. | Todos | Javier Curi Dayana | SUS global ≥ 80 (grado A). |

---

## 5. Conclusión

EcoRuta Wanka obtuvo un **puntaje SUS promedio de 79,06**, que supera el umbral de aceptación de 68 puntos y lo ubica en el **grado A−**, con el adjetivo **«Bueno»** y nivel **aceptable**. La tasa de éxito de las tareas fue de **97,1 %** (34 de 35). Las funciones del Sprint 4 (consulta y seguimiento público del pedido) fueron las mejor valoradas. Las oportunidades de mejora se concentran en los usuarios operativos con poca experiencia digital (almacén y conductor), por el vocabulario técnico de la generación de rutas y el envío manual de los avisos; las mejoras M-01 a M-05 atienden esos puntos.

---

## 6. Referencias

- Brooke, J. (1996). SUS: A "quick and dirty" usability scale. En *Usability Evaluation in Industry* (pp. 189–194). Taylor & Francis.
- Bangor, A., Kortum, P. y Miller, J. (2009). Determining what individual SUS scores mean: Adding an adjective rating scale. *Journal of Usability Studies*, 4(3), 114–123.
- Sauro, J. (2011). *A Practical Guide to the System Usability Scale*. Measuring Usability LLC.
- Sauro, J. y Lewis, J. R. (2016). *Quantifying the User Experience* (2.ª ed.). Morgan Kaufmann.

---

[← Volver al README principal](../../../README.md)
