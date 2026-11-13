# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín**

# 02. Estándares de Ingeniería de Software y Guía de Desarrollo Verde V_1_0_0

**Versión:** V_1_0_0 | **Fecha:** 13/11/2026 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Nombre del proyecto:** EcoRuta Wanka

**Líder del proyecto:** Javier Curi Dayana | **Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

**Tecnologías del proyecto:** Next.js 16 + React 19 (frontend), Node.js + Express 5 (backend), PostgreSQL (Neon) con Prisma 7 (base de datos) y Vercel (publicación).

**Documento relacionado:** [01 Informe de reducción del impacto ambiental V_1_0_0](01%20Informe%20de%20reduccion%20del%20impacto%20ambiental%20V_1_0_0.md)

---

## 2. Estándares de Ingeniería de Software y Guía de Desarrollo Verde

El informe 01 documenta las ocho optimizaciones aplicadas a EcoRuta Wanka y su efecto en el rendimiento y en las emisiones de CO₂. Este documento fundamenta esas optimizaciones en estándares internacionales y las convierte en **reglas permanentes de desarrollo**, de modo que los cambios futuros no vuelvan a aumentar el peso de la aplicación, las solicitudes al servidor ni el consumo de energía.

**Adaptación del stack:** la guía de referencia del curso está planteada para la arquitectura MERN (MongoDB, Express, React, Node.js). EcoRuta Wanka utiliza Express, React y Node.js, pero reemplaza MongoDB por **PostgreSQL con Prisma**. Por ello, las prácticas de MongoDB se aplican con su equivalente directo:

| Práctica MERN (MongoDB / Mongoose) | Equivalente en EcoRuta Wanka (PostgreSQL / Prisma) |
|---|---|
| `.select('campo1 campo2')` | `select: { campo1: true, campo2: true }` |
| `.lean()` (objetos planos sin hidratar) | Prisma devuelve objetos planos por defecto; se transforman con funciones puras (`aPedidoListado`) |
| `schema.index({ a: 1, b: -1 })` | `@@index([a, b(sort: Desc)])` + migración versionada |
| `.skip().limit()` + `countDocuments()` | `skip` / `take` + `count()` dentro de `prisma.$transaction` |
| Middleware `compression` | Compresión Brotli/Gzip automática de Vercel |
| TanStack Query (caché en cliente) | Caché de lecturas de 30 s en `services/api.js` |

---

### 2.1 Relación de Estándares Internacionales Aplicados

#### 2.1.1 ISO/IEC 25010:2023 — Calidad del producto de software

| Característica | Subcaracterística | Cómo la atienden las refactorizaciones |
|---|---|---|
| **Eficiencia de desempeño** | Comportamiento temporal | Las solicitudes al abrir el sistema bajaron de 12 a 5 y se eliminaron las consultas OPTIONS previas, lo que reduce la latencia de la carga inicial. Las consultas repetidas sin cambios responden 304 sin cuerpo. |
| | Utilización de recursos | La página de pedidos pasó de 13 558 a 4 773 bytes (−64,8 %) al seleccionar solo las columnas necesarias. El JavaScript inicial bajó 21,7 KiB con la carga diferida. |
| | Capacidad | La paginación (máximo 50 registros por solicitud) y el índice `(estado, created_at DESC)` mantienen el tiempo de respuesta estable aunque crezca el número de pedidos. |
| **Mantenibilidad** | Modularidad | Arquitectura por capas (rutas → controladores → servicios → repositorios) y módulos de interfaz cargados de forma independiente con `React.lazy`. |
| | Reusabilidad | Un único cliente HTTP (`pedir()`), componentes compartidos (`FilasCargando`, `EstadoVacio`) y esquemas Zod reutilizados para crear y actualizar. |
| | Analizabilidad | Menos dependencias (`dotenv` reemplazado por `process.loadEnvFile()` en el seed), comentarios que explican el porqué de cada decisión y análisis estático con SonarQube Cloud. |
| | Capacidad de ser probado | Inyección de dependencias: las 115 pruebas usan repositorios en memoria y un optimizador simulado, sin depender de la base de datos ni de APIs externas. |

#### 2.1.2 Principios de la Green Software Foundation (GSF)

| Principio GSF | Definición | Aplicación en EcoRuta Wanka |
|---|---|---|
| **1. Eficiencia de carbono** | Emitir la menor cantidad de carbono posible por unidad de trabajo. | Se mide la intensidad de carbono por visita (g CO₂e/visita) con SWDM v4, alineado con la especificación **SCI (ISO/IEC 21031:2024)**, cuya unidad funcional adoptada es "una visita". |
| **2. Eficiencia energética** | Consumir la menor cantidad de energía posible. | Menos bytes transferidos y menos solicitudes reducen la energía usada por el servidor, la red y el dispositivo. La caché evita repetir trabajo ya realizado. |
| **3. Eficiencia de hardware** | Usar la menor cantidad de hardware incorporado posible y prolongar su vida útil. | El navegador procesa menos JavaScript y dibuja 12 filas en lugar de toda la lista, por lo que la aplicación funciona bien en celulares y computadoras de gama baja de los operadores logísticos. |
| **4. Conciencia de carbono** | Hacer más cuando la electricidad es más limpia y menos cuando es más sucia. | El trabajo pesado se ejecuta bajo demanda (la optimización de rutas solo al generar una ruta; los mapas solo al abrirlos) y no hay procesos en segundo plano ni sondeos periódicos. Pendiente: programar tareas por lotes según la intensidad de la red eléctrica cuando existan. |

#### 2.1.3 W3C Web Sustainability Guidelines (WSG 1.0)

| Pauta | Enunciado | Aplicación en EcoRuta Wanka |
|---|---|---|
| **1.2 Optimización de medios (UI & Assets)** | Usar formatos comprimidos de nueva generación y evitar recursos innecesarios. | `images.formats: ["image/avif", "image/webp"]` en `next.config.mjs`. Los íconos son **SVG en línea** generados por componentes (lucide-react), sin solicitudes de imágenes. |
| **2.4 Arquitectura de código y caché** | Dividir el código, cargar solo lo necesario y aplicar una caché determinista. | Code splitting con `React.lazy`/`Suspense`; `Cache-Control` + ETag en la API; factores de tráfico con `max-age=86400`. |
| **3.1 Transferencia de datos en red** | Reducir el tamaño de los datos enviados por la red. | Proyección de columnas en las consultas, paginación de 12 registros y compresión Brotli/Gzip de Vercel. |

Pautas complementarias usadas en la matriz de la sección 2.3: **2.1** eficiencia de la experiencia de usuario, **2.2** código limpio y librerías y **3.2** minimización de solicitudes HTTP.

#### 2.1.4 Otros estándares que sigue el proyecto

| Estándar | Uso |
|---|---|
| ISO/IEC/IEEE 12207:2017 | Procesos del ciclo de vida aplicados con Scrum, control de versiones y documentación versionada. |
| OWASP Top 10:2025 | Seguridad evaluada en `Sprint 3/04 OWASP V_1_0_0.md`. |
| WCAG 2.2 AA | Accesibilidad evaluada en `Sprint 3/05 WCAG V_1_0_0.md` (Lighthouse accesibilidad 100). |
| Conventional Commits 1.0 | Formato de los mensajes de commit (`docs(green-it): …`, `perf(green-it): …`). |
| Versionado V_X_Y_Z | Versión de cada documento en su nombre de archivo. |

---

### 2.2 Buenas Prácticas y Guía de Desarrollo Verde

#### 2.2.1 Principios de código limpio aplicados

| Principio | Qué exige | Ejemplo en EcoRuta Wanka |
|---|---|---|
| **Clean Code** | Nombres que revelan la intención, funciones pequeñas y comentarios que explican el porqué. | `columnasListadoPedido`, `POR_PAGINA`, `CACHE_MS`; el comentario de `api.js` explica que un GET sin `Content-Type` evita la solicitud OPTIONS. |
| **SOLID — S** (responsabilidad única) | Cada módulo tiene un solo motivo de cambio. | Rutas validan, controladores responden HTTP, servicios aplican reglas de negocio y repositorios acceden a datos. |
| **SOLID — O** (abierto/cerrado) | Extender sin modificar. | El optimizador de rutas y el geocodificador se inyectan en `crearApp()`; se pueden reemplazar sin tocar los servicios. |
| **SOLID — L** (sustitución de Liskov) | Una implementación puede reemplazar a otra con el mismo contrato. | Los repositorios en memoria de las pruebas sustituyen a los de Prisma, incluida la nueva respuesta paginada. |
| **SOLID — I** (segregación de interfaces) | No obligar a depender de lo que no se usa. | Cada endpoint valida con su propio esquema Zod (`filtroPedidos`, `cambiarEstadoPedido`, …) y el frontend expone funciones puntuales en `api` (`listarPedidos`, `crearPedido`, …) en lugar de un cliente genérico. |
| **SOLID — D** (inversión de dependencias) | Depender de abstracciones, no de implementaciones. | `crearApp({ repos, optimizador, geocodificador, reloj })` recibe sus dependencias por parámetro. |
| **DRY** | No repetir conocimiento. | Un único `pedir()` para toda la comunicación HTTP; `camposPedido` se reutiliza para crear y, con `.partial()`, para actualizar; `FilasCargando` sirve para todas las tablas. |
| **YAGNI** | No construir lo que aún no se necesita. | No se instaló `compression` (Vercel ya comprime), ni TanStack Query o Redux (basta una caché de 30 s), ni librerías de imágenes (no hay imágenes propias). El tráfico por horario queda desactivado tras una bandera hasta que se necesite. |

#### 2.2.2 Normas Backend (Node.js / Express / PostgreSQL + Prisma)

| Código | Norma | Cómo se verifica |
|---|---|---|
| NB-01 | Prohibido usar `findMany` con `include` completo en listados: seleccionar solo las columnas que muestra la vista (`select`). | Revisión en el Pull Request. |
| NB-02 | Paginación obligatoria en los endpoints de listado que pueden crecer; máximo **50** registros por página, **12** por defecto. | `backend/tests/green-it.test.js` (página < 1 o límite > 50 → 422). |
| NB-03 | Toda consulta frecuente con filtro y orden tiene un índice que la cubre, creado con una migración de Prisma. | Migración `20261112231921_indice_pedidos_estado_fecha`. |
| NB-04 | Las respuestas GET llevan `Cache-Control` y ETag; los catálogos casi estáticos usan `max-age`. | Prueba de 304 y de `max-age=86400`. |
| NB-05 | Compresión Brotli/Gzip activa en todas las respuestas JSON (Vercel); si se publica en un servidor propio, se agrega el middleware `compression`. | Cabecera `content-encoding: br` en producción. |
| NB-06 | Cuerpo JSON de entrada limitado a 100 kB y validado con Zod. | `express.json({ limit: "100kb" })` y esquemas en `schemas/esquemas.js`. |
| NB-07 | Acceso a datos solo con Prisma dentro de `repositories/`; sin SQL escrito a mano. | Revisión en el Pull Request y SonarQube. |
| NB-08 | No agregar una dependencia si Node.js ya ofrece la función (por ejemplo, `process.loadEnvFile()` en lugar de `dotenv`). | Revisión de `package.json` en el Pull Request. |

#### 2.2.3 Normas Frontend (React / Next.js)

| Código | Norma | Cómo se verifica |
|---|---|---|
| NF-01 | Prohibido subir imágenes PNG/JPG mayores a 200 KB; toda imagen se muestra con `next/image` en AVIF/WebP y con `width`/`height` definidos. | `next.config.mjs` y revisión en el Pull Request. |
| NF-02 | Imágenes y mapas fuera de la primera pantalla se cargan de forma diferida (`loading="lazy"` / importación dinámica). | Los mapas de Leaflet se cargan solo al abrirlos. |
| NF-03 | Los módulos secundarios se cargan con `React.lazy()` + `Suspense`; solo la vista inicial (Pedidos) va en el paquete principal. | `frontend/components/App.jsx`. |
| NF-04 | Los íconos se dibujan como SVG en línea (componentes), no como archivos de imagen. | Uso de `lucide-react`. |
| NF-05 | Cada módulo pide sus datos cuando se abre; las lecturas GET no envían cabeceras que obliguen a una solicitud OPTIONS. | Pestaña Network: 5 solicitudes al abrir, 0 OPTIONS. |
| NF-06 | Las lecturas se guardan 30 s en la caché del cliente y cualquier escritura la vacía. | `CACHE_MS` en `services/api.js`. |
| NF-07 | Los esqueletos de carga reservan el espacio final de la vista (CLS ≤ 0,02). | `FilasCargando filas={POR_PAGINA}` y `min-height` en `.resultado-filtros`. |
| NF-08 | Antes de instalar una librería se revisa su peso en Bundlephobia y si existe una alternativa nativa. | Revisión de `package.json` en el Pull Request. |
| NF-09 | La hoja de estilos de una librería se importa en el componente que la usa, no en el `layout` global (los estilos de Leaflet solo llegan con el mapa). | `import 'leaflet/dist/leaflet.css'` en `MapaRuta.jsx` y `MapaSelector.jsx`. |
| NF-10 | La vista inicial no espera datos que no muestra: cada tabla se dibuja cuando llega su propia respuesta y la conexión con la API se abre por adelantado (`preconnect`). | `necesita: ['pedidos']` en `App.jsx` y `preconnect()` en `app/layout.js`. |

#### 2.2.4 Integración en CI/CD Verde (GitHub Actions)

El repositorio incluye el workflow **`.github/workflows/green-audit.yml`**. Se ejecuta en cada push y Pull Request a `main` y consta de dos trabajos:

1. **Pruebas del backend:** instala las dependencias y ejecuta las 115 pruebas de Vitest.
2. **Auditoría Lighthouse CI:** primero "despierta" la API publicada (Neon, en el plan gratuito, se suspende tras unos minutos sin uso) y luego audita la versión publicada (`https://ecoruta-frontend.vercel.app`) tres veces; falla si no se cumplen los límites de la rúbrica definidos en `lighthouserc.json`.

```yaml
# .github/workflows/green-audit.yml
name: Green IT & Performance Audit

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  pruebas:
    name: Pruebas del backend (Vitest)
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    env:
      DATABASE_URL: postgresql://ci:ci@localhost:5432/ci
      DATABASE_URL_UNPOOLED: postgresql://ci:ci@localhost:5432/ci
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: backend/package-lock.json
      - run: npm ci
      - run: npm test

  lighthouse:
    name: Auditoría Lighthouse CI
    needs: pruebas
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Calentar la API publicada
        run: |
          API=https://ecoruta-backend.vercel.app
          curl -s -o /dev/null -w "health %{http_code} %{time_total}s
" --retry 3 "$API/health" || true
          for ruta in pedidos vehiculos conductores clientes rutas; do
            curl -s -o /dev/null -w "$ruta %{http_code} %{time_total}s
" --retry 3 "$API/api/v1/$ruta" || true
          done
      - name: Ejecutar Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.15.1
          lhci autorun --config=./lighthouserc.json
```

**Límites de la auditoría (`lighthouserc.json`):**

| Aserción de Lighthouse CI | Límite | Meta de la rúbrica |
|---|---|---|
| `categories:performance` | `minScore: 0.9` | Score ≥ 90 |
| `first-contentful-paint` | `maxNumericValue: 1000` | FCP ≤ 1,0 s |
| `largest-contentful-paint` | `maxNumericValue: 1400` | LCP ≤ 1,4 s |
| `total-blocking-time` | `maxNumericValue: 85` | TBT ≤ 85 ms |
| `cumulative-layout-shift` | `maxNumericValue: 0.02` | CLS ≤ 0,02 |
| `total-byte-weight` | `maxNumericValue: 1153434` | Peso ≤ 1,1 MB |
| `categories:accessibility` | `minScore: 0.9` | Complemento WCAG |

Los reportes de cada ejecución se publican con `temporary-public-storage` y su enlace aparece en el registro del workflow.

**Resultados de Lighthouse CI (13/11/2026, preset escritorio, desde Huancayo):** con la API en frío la primera auditoría dio LCP 3,9 s y score 74, porque el elemento LCP es una celda de la tabla de pedidos y la tabla esperaba las cinco respuestas de la API. Tras aplicar NF-09 y NF-10 y calentar la API, tres ejecuciones dieron **score 0,95–0,97, FCP 0,27–0,43 s, LCP 1,21–1,36 s, TBT 34–88 ms, CLS 0,0038 y 224–229 KiB**, dentro de los límites de la rúbrica. El TBT queda cerca de su límite (85 ms) en algunas ejecuciones; Lighthouse CI evalúa el mejor valor de las tres.

#### 2.2.5 Flujo de trabajo, pruebas y calidad

- **Ramas:** `main` (estable, se despliega en Vercel), `feature/<tema>` y `docs/<tema>`. Los cambios llegan a `main` mediante **Pull Request**.
- **Commits:** Conventional Commits, `tipo(ámbito): descripción` (`feat`, `fix`, `perf`, `docs`, `test`, `ci`, `refactor`, `chore`).
- **Documentos:** versión V_X_Y_Z en el nombre (X = entrega mayor, Y = contenido nuevo, Z = corrección u observación del docente).
- **Pruebas:** 115 pruebas en verde, incluidas 6 de Green IT; cobertura del backend de **87,22 % de líneas** (mínimo exigido 80 %).
- **Calidad y seguridad:** SonarQube Cloud (perfil "Sonar way") y `npm audit` sin vulnerabilidades altas ni críticas.

**Lista de verificación de cada Pull Request:**

- [ ] Cumple las normas NB-01 a NB-08 y NF-01 a NF-08.
- [ ] Respeta las capas y los principios SOLID, DRY y YAGNI.
- [ ] El workflow `green-audit.yml` termina en verde (pruebas y Lighthouse CI).
- [ ] Incluye capturas de escritorio y celular si cambia la interfaz.
- [ ] Usa Conventional Commits y documentos con versión V_X_Y_Z.

---

### 2.3 Matriz de Mapeo Directo: Estándares vs. Optimizaciones

| # | Optimización técnica aplicada | Estándar ISO/IEC 25010 | Principio Green Software (GSF) | Lineamiento W3C WSG 1.0 | Norma interna |
|:-:|---|---|---|---|---|
| 1 | **Consultas a la base de datos:** `select` de columnas e índice `(estado, created_at DESC)` | Eficiencia de desempeño — Utilización de recursos | Eficiencia de hardware | Pauta 3.1 Transferencia de datos en red | NB-01, NB-03 |
| 2 | **Paginación:** `skip`/`take` en la API (máx. 50) y 12 filas en la tabla | Eficiencia de desempeño — Capacidad | Eficiencia energética | Pauta 2.1 Eficiencia de la experiencia de usuario | NB-02 |
| 3 | **Imágenes:** formatos AVIF/WebP con `next/image` | Eficiencia de desempeño — Comportamiento temporal | Eficiencia de carbono | Pauta 1.2 Optimización de medios | NF-01, NF-02 |
| 4 | **Carga diferida:** `React.lazy` + `Suspense` | Mantenibilidad — Modularidad | Eficiencia de hardware | Pauta 2.4 Arquitectura de código | NF-03 |
| 5 | **Dependencias:** `process.loadEnvFile()` en lugar de `dotenv` | Mantenibilidad — Analizabilidad | Eficiencia energética | Pauta 2.2 Código limpio y librerías | NB-08, NF-08 |
| 6 | **Solicitudes HTTP:** GET sin preflight, carga por módulo y SVG en línea (12 → 5) | Eficiencia de desempeño — Comportamiento temporal | Eficiencia de carbono | Pauta 3.2 Minimización de solicitudes HTTP | NF-04, NF-05 |
| 7 | **Caché:** `Cache-Control`, ETag (304) y caché de cliente de 30 s | Eficiencia de desempeño — Comportamiento temporal | Eficiencia energética | Pauta 2.4 Estrategias de caché | NB-04, NF-06 |
| 8 | **API:** compresión Brotli/Gzip y límite de 100 kB | Eficiencia de desempeño — Capacidad | Eficiencia de carbono | Pauta 3.1 Optimización de red | NB-05, NB-06 |
| + | **Estabilidad visual:** espacio reservado en la tabla (CLS 0,043 → 0,0022) | Usabilidad — Estética de la interfaz | Eficiencia de hardware | Pauta 2.1 Eficiencia de la experiencia de usuario | NF-07 |

---

### 2.4 Verificación de cumplimiento: medición antes y después

Para comprobar las normas con datos reales se midió la carga inicial **antes** (rama `main`, commit `8cbaf93`) y **después** (commit `265aaec`) de las optimizaciones.

**Método:** ambas versiones se compilaron con `next build`, se sirvieron con `next start` y se conectaron al mismo backend y a la misma base de datos (19 pedidos). La carga se registró con Microsoft Edge sin interfaz (Puppeteer + Chrome DevTools Protocol), con la caché del navegador desactivada, una ventana de 1350 × 940 y el CLS medido con `PerformanceObserver`. La versión publicada se midió con el mismo procedimiento el 12/11/2026.

| Indicador | ANTES | DESPUÉS (local) | Producción (Vercel) | Norma |
|---|---:|---:|---:|---|
| Solicitudes a la API al abrir | 12 (6 GET + 6 OPTIONS) | **5** (0 OPTIONS) | **5** (0 OPTIONS) | NF-05 |
| CLS | 0,0469 | **0,0022** | **0,0022** | NF-07 |
| JavaScript transferido | 175,9 KiB | **154,2 KiB** | 156,6 KiB | NF-03 |
| Peso total transferido | 273,0 KiB | **251,6 KiB** | **229,2 KiB** | NB-05, NF-03 |
| Página de pedidos (19 completos → 12 con columnas de tabla) | 13 558 bytes | **4 773 bytes** | 4 773 bytes | NB-01, NB-02 |
| Consulta repetida sin cambios | 200 con datos | **304** sin cuerpo | **304** sin cuerpo | NB-04 |

**Lectura de los resultados:** la reducción de solicitudes (−58,3 %), la página de pedidos (−64,8 %) y la respuesta 304 coinciden con el informe 01, y el CLS (0,0022) mejora la proyección de 0,02. El JavaScript inicial bajó 21,7 KiB, menos que los 84 KiB de "JavaScript sin utilizar" señalados por Lighthouse, porque gran parte de ese código es el propio React/Next.js y el módulo Pedidos, que es la vista inicial. Los valores definitivos de peso y CO₂ del informe 01 se toman de la auditoría de PageSpeed Insights sobre la versión publicada.

**Evidencia 31: Paginación de pedidos (escritorio)**

La tabla muestra 12 de 19 pedidos, con los botones Anterior / Siguiente y el indicador "Página 1 de 2".

![Evidencia 31: Paginación de pedidos](../../06%20Otros/evidencias/Evidencia%2031%20Paginacion%20de%20pedidos.jpg)

**Evidencia 32: Paginación en celular**

La paginación se adapta al ancho del celular sin desplazamiento horizontal.

![Evidencia 32: Paginación en celular](../../06%20Otros/evidencias/Evidencia%2032%20Paginacion%20en%20celular.jpg)

---

## 3. Guía de Comandos Git para el Despliegue de la Documentación

Secuencia ejecutada en el repositorio local para crear la estructura de directorios, guardar ambos informes y sincronizarlos con GitHub:

```bash
# 1. Verificar el estado actual del repositorio
git status

# 2. Crear las carpetas de destino en la ruta exacta
mkdir -p "docs/03 Implementación/reduccion del impacto ambiental"

# 3. Guardar los dos archivos Markdown en la ruta:
# - docs/03 Implementación/reduccion del impacto ambiental/01 Informe de reduccion del impacto ambiental V_1_0_0.md
# - docs/03 Implementación/reduccion del impacto ambiental/02 Estandares Ingeniería de software V_1_0_0.md

# 4. Añadir las carpetas y documentos al Staging
git add "docs/03 Implementación/reduccion del impacto ambiental/"

# 5. Registrar el commit formalizando la documentación
git commit -m "docs(green-it): add MERN performance optimization reports and software engineering standards"

# 6. Sincronizar los cambios con el repositorio remoto
git push origin main
```

El código de las optimizaciones y el workflow de CI se integraron a `main` mediante Pull Request (PR #13 y siguiente), según el flujo de trabajo del proyecto (sección 2.2.5).

---

## 4. Conclusiones

1. Las ocho optimizaciones de EcoRuta Wanka se fundamentan en las subcaracterísticas de **ISO/IEC 25010** (comportamiento temporal, utilización de recursos, capacidad, modularidad y analizabilidad), en los **cuatro principios de la Green Software Foundation** y en las pautas **1.2, 2.4 y 3.1 de W3C WSG 1.0**.
2. La matriz de mapeo directo cubre las ocho optimizaciones, más la mejora de estabilidad visual, y vincula cada una con su estándar y con la norma interna que la mantiene.
3. Las normas Backend (NB-01 a NB-08) y Frontend (NF-01 a NF-08) se apoyan en **Clean Code, SOLID, DRY y YAGNI**, adaptadas de MERN a PostgreSQL con Prisma.
4. El workflow **`green-audit.yml`** ejecuta las pruebas y una auditoría de **Lighthouse CI** con los límites de la rúbrica en cada push y Pull Request, de modo que una regresión de rendimiento se detecta antes de integrarse.
5. La medición antes/después confirma la reducción de solicitudes (12 → 5), la estabilidad visual (CLS 0,0469 → 0,0022) y la página de pedidos más liviana (13 558 → 4 773 bytes), también en la versión publicada.

---

[Volver al README principal](../../../README.md)
