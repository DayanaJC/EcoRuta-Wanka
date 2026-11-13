# EcoRuta Wanka

**Optimizador de rutas sostenibles de última milla — Huancayo, Junín** 

# 01. Informe de reducción del impacto ambiental V_1_0_0

**Versión:** V_1_0_0 | **Fecha:** 11/11/2026 | **Organización:** WankaLogística S.A.C. | **Ubicación:** Huancayo, Junín, Perú | **Repositorio:** github.com/DayanaJC/EcoRuta-Wanka

**Nombre del proyecto:** EcoRuta Wanka

**Líder del proyecto:** Javier Curi Dayana | **Integrantes:** Arroyo Canchari Henry, Javier Curi Dayana

**Tecnologías del proyecto:** Next.js 16 + React 19 (frontend), Node.js + Express 5 (backend), PostgreSQL con Prisma (base de datos) y Vercel (publicación).

---

## 1. Informe de Reducción del Impacto Ambiental y Optimización de EcoRuta Wanka

### 1.1 Introducción y Propósito del Informe

EcoRuta Wanka es un sistema que ayuda a WankaLogística S.A.C. a organizar sus entregas en Huancayo, El Tambo y Chilca. Su objetivo es encontrar mejores rutas para reducir los kilómetros recorridos, el consumo de combustible y la contaminación.

Sin embargo, el uso de una página web también consume energía, ya que necesita servidores, conexión a internet y dispositivos como computadoras o celulares. Por eso, es importante buscar formas de hacer que el sistema funcione utilizando menos recursos.

A esto se le conoce como **Green IT**, que consiste en utilizar la tecnología de manera más eficiente para reducir su impacto ambiental.

El propósito de este informe es:

1. Revisar el sistema e identificar qué partes podían mejorarse.
2. Aplicar mejoras para reducir el uso de datos y recursos.
3. Comparar los resultados antes y después de las optimizaciones.
4. Estimar la reducción de emisiones de CO₂ generadas por el uso de la página web.
5. Comprobar que las mejoras no afecten el funcionamiento del sistema.

**Adaptación a las tecnologías del proyecto:** Las mejoras se realizaron teniendo en cuenta las tecnologías que utiliza EcoRuta Wanka. Por ejemplo, se trabajó con Prisma y PostgreSQL en lugar de MongoDB, ya que son las tecnologías utilizadas en nuestro proyecto.

**Nota sobre los resultados:** Los valores de ANTES corresponden a las mediciones realizadas sobre el sistema publicado. Los valores de DESPUÉS se identifican como medidos, calculados o proyectados, según corresponda. Los resultados proyectados deberán comprobarse nuevamente cuando se publique la versión optimizada.

---

### 1.2 Diagnóstico Inicial del Proyecto (Métricas Previas)

Para conocer el estado inicial del sistema, se realizó una prueba con **PageSpeed Insights**, utilizando Lighthouse 13.6.0, el día **11/11/2026 a las 6:03 p. m.**

Se evaluó la página publicada:

https://ecoruta-frontend.vercel.app

Los resultados mostraron que el sistema ya tenía un buen rendimiento, pero todavía había algunos aspectos que podían mejorarse:

- La lista de pedidos enviaba más información de la necesaria.
- Al ingresar al sistema se realizaban 12 solicitudes al servidor.
- Los seis módulos se cargaban al inicio, aunque el usuario no los utilizara todos.
- Algunas listas se volvían a solicitar aunque no hubieran cambiado.
- La tabla de pedidos cambiaba de tamaño mientras cargaba la información.

**Resumen de métricas iniciales (ANTES, escritorio):**

| Medida | Descripción | Valor ANTES | Meta |
|---|---|---:|---:|
| Rendimiento (Lighthouse) | Puntaje general de la página | **100/100** | 90 o más |
| First Contentful Paint (FCP) | Tiempo hasta mostrar el primer contenido | **0.2 s** | 1.0 s o menos |
| Largest Contentful Paint (LCP) | Tiempo hasta mostrar el contenido principal | **0.5 s** | 1.4 s o menos |
| Total Blocking Time (TBT) | Tiempo en que la página no responde | **0 ms** | 85 ms o menos |
| Cumulative Layout Shift (CLS) | Cambios de posición de los elementos | **0.043** | 0.02 o menos |
| Peso total de la página | Cantidad de datos descargados | **258 KiB** | 1.1 MB o menos |
| Solicitudes al servidor al abrir | Consultas realizadas al servidor | **12** | Reducir |
| Tamaño de la lista de pedidos | Datos de los 19 pedidos | **13 558 bytes** | Reducir |
| Tiempo de respuesta del servidor | Tiempo de respuesta observado | **250 a 380 ms** | Reducir |
| CO₂ por visita (SWDM v4) | Emisiones estimadas por visita | **0.0392 g** | Reducir |

En la prueba desde un celular también se obtuvo un puntaje de **100/100**, con FCP de 0.9 s, LCP de 0.9 s, TBT de 20 ms y CLS de 0.02.

**Aspectos que ya funcionaban correctamente:**

- La base de datos ya contaba con índices.
- Vercel comprimía las respuestas utilizando Brotli.
- Las respuestas del servidor utilizaban ETag.
- Los mapas se cargaban cuando el usuario abría ese módulo.
- Los íconos se mostraban mediante código, sin descargar imágenes.
- El proyecto utilizaba pocas librerías adicionales.

---

### 1.3 Detalle Técnico de las 8 Optimizaciones

Se revisaron ocho aspectos del sistema y se realizaron cambios en el código para mejorar su funcionamiento. No fue necesario instalar nuevas librerías.

#### 1. Optimización de Consultas a la Base de Datos

**Diagnóstico:** La lista de pedidos obtenía todos los datos de cada registro, aunque la tabla solamente necesitaba mostrar información como el cliente, dirección, peso, fecha, prioridad y estado.

**Implementación:** Se modificó la consulta de Prisma para obtener solamente los campos necesarios. También se agregó un índice que permite buscar los pedidos por estado y ordenarlos por fecha.

**ANTES — `backend/src/repositories/prisma.repositories.js`**

```js
return (
  await prisma.pedido.findMany({
    where,
    include: conBultos,
    orderBy: { created_at: "desc" }
  })
).map(aPedido);
```

**DESPUÉS — `backend/src/repositories/prisma.repositories.js`**

```js
const columnasListadoPedido = {
  id: true,
  cliente_id: true,
  cliente_nombre: true,
  direccion: true,
  punto_referencia: true,
  peso_kg: true,
  volumen_m3: true,
  ventana_entrega_inicio: true,
  ventana_entrega_fin: true,
  prioridad: true,
  estado: true,
  created_at: true,
  bultos: {
    select: { cantidad: true }
  }
};
```

**DESPUÉS — `backend/prisma/schema.prisma`**

```prisma
@@index([estado, created_at(sort: Desc)])
```

**Resultado:** El tamaño de la lista de pedidos pasó de **13 558 a 4 773 bytes**, lo que representa una reducción del **64.8 %**.

#### 2. Paginación de Datos en Backend y Frontend (12 registros)

**Diagnóstico:** El sistema mostraba todos los pedidos en una sola lista. Esto podía afectar el rendimiento si la cantidad de registros aumentaba.

**Implementación:** Se agregó la paginación para mostrar los pedidos de 12 en 12. El usuario puede cambiar de página utilizando los botones Anterior y Siguiente.

**ANTES — `backend/src/schemas/esquemas.js`**

```js
export const filtroPedidos = z.object({
  estado: z.enum(ESTADOS_PEDIDO).optional(),
  prioridad: z.enum(PRIORIDADES).optional(),
  busqueda: z.string().optional(),
});
```

**DESPUÉS — `backend/src/schemas/esquemas.js`**

```js
export const filtroPedidos = z.object({
  estado: z.enum(ESTADOS_PEDIDO).optional(),
  prioridad: z.enum(PRIORIDADES).optional(),
  busqueda: z.string().optional(),
  pagina: z.coerce.number().int().min(1).optional(),
  limite: z.coerce.number().int().min(1).max(50).default(12),
});
```

**DESPUÉS — `backend/src/repositories/prisma.repositories.js`**

```js
const [filas, total] = await prisma.$transaction([
  prisma.pedido.findMany({
    where,
    select: columnasListadoPedido,
    orderBy: { created_at: "desc" },
    skip: (pagina - 1) * limite,
    take: limite,
  }),
  prisma.pedido.count({ where }),
]);

return {
  datos: filas.map(aPedido),
  paginacion: {
    pagina,
    limite,
    total,
    paginas: Math.max(1, Math.ceil(total / limite))
  },
};
```

**DESPUÉS — `frontend/components/PedidoLista.jsx`**

```jsx
const POR_PAGINA = 12;

const visibles = filtrados.slice(
  (pagina - 1) * POR_PAGINA,
  pagina * POR_PAGINA
);
```

La tabla también cuenta con los botones para cambiar de página.

**Prueba realizada con 19 pedidos:** La primera página muestra 12 pedidos y la segunda muestra los 7 restantes. También se verificó que no se acepten números de página menores a 1 ni límites mayores a 50.

#### 3. Optimización de Imágenes (WebP / AVIF)

**Diagnóstico:** El sistema no utiliza fotografías propias en sus pantallas. Los íconos se muestran mediante código y el mapa utiliza información de OpenStreetMap. Por eso, no se encontraron imágenes pesadas que necesitaran ser reemplazadas.

**Implementación:** Se configuró Next.js para permitir el uso de los formatos AVIF y WebP cuando se agreguen imágenes al proyecto.

**ANTES — `frontend/next.config.mjs`**

```js
const nextConfig = {
  /* config options here */
};
```

**DESPUÉS — `frontend/next.config.mjs`**

```js
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
};
```

Esta configuración permitirá utilizar imágenes de menor tamaño en caso de que posteriormente se agreguen logotipos o fotografías.

**Resultado:** Se dejó preparada la configuración para optimizar las imágenes futuras. Esta mejora no representa una reducción actual del peso de la página, porque el sistema no utiliza imágenes propias.

#### 4. Carga Diferida (Lazy Loading) y Code Splitting

**Diagnóstico:** Los seis módulos del sistema (Pedidos, Clientes, Vehículos, Conductores, Rutas y Sostenibilidad) se cargaban al ingresar, aunque el usuario solamente necesitara uno. Lighthouse identificó **84 KiB de JavaScript sin utilizar**.

**Implementación:** Se modificó la carga de los módulos utilizando `lazy` y `Suspense` de React. Ahora los módulos secundarios se cargan cuando el usuario los abre.

**ANTES — `frontend/components/App.jsx`**

```jsx
import { Clientes } from './modulos/Clientes.jsx'
import { Conductores } from './modulos/Conductores.jsx'
import { Pedidos } from './modulos/Pedidos.jsx'
import { Sostenibilidad } from './modulos/Sostenibilidad.jsx'
import { Rutas } from './modulos/Rutas.jsx'
import { Vehiculos } from './modulos/Vehiculos.jsx'
```

**DESPUÉS — `frontend/components/App.jsx`**

```jsx
import { lazy, Suspense } from 'react'
import { Pedidos } from './modulos/Pedidos.jsx'

const Clientes = lazy(() =>
  import('./modulos/Clientes.jsx').then(
    (m) => ({ default: m.Clientes })
  )
);

const Vehiculos = lazy(() =>
  import('./modulos/Vehiculos.jsx').then(
    (m) => ({ default: m.Vehiculos })
  )
);

const Conductores = lazy(() =>
  import('./modulos/Conductores.jsx').then(
    (m) => ({ default: m.Conductores })
  )
);

const Rutas = lazy(() =>
  import('./modulos/Rutas.jsx').then(
    (m) => ({ default: m.Rutas })
  )
);

const Sostenibilidad = lazy(() =>
  import('./modulos/Sostenibilidad.jsx').then(
    (m) => ({ default: m.Sostenibilidad })
  )
);
```

También se agregó `Suspense` para mostrar un indicador mientras se carga el módulo.

**Resultado:** Se evita descargar todos los módulos al inicio, lo que permite reducir el código que necesita cargar el navegador.

#### 5. Depuración y Eliminación de Dependencias Innecesarias

**Diagnóstico:** Se revisaron las librerías utilizadas en el proyecto. Se encontró que el archivo de datos de prueba utilizaba `dotenv` para leer las variables del archivo `.env`, aunque Node.js ya cuenta con una función para realizar esta tarea.

También se encontraron archivos que ya no se utilizaban: `frontend/public/icons.svg` y la carpeta antigua `frontend/dist`.

**Implementación:** Se reemplazó el uso de `dotenv` por la función disponible en Node.js.

**ANTES — `backend/prisma/seed.js`**

```js
import "dotenv/config";
```

**DESPUÉS — `backend/prisma/seed.js`**

```js
try {
  process.loadEnvFile();
} catch {
  // Se utilizan las variables del entorno disponibles.
}
```

Los archivos que ya no se utilizan quedaron identificados para su revisión y posible eliminación.

**Resultado:** Se evita utilizar una dependencia adicional para una tarea que Node.js puede realizar directamente. No se eliminaron archivos sin autorización.

#### 6. Reducción de Solicitudes HTTP

**Diagnóstico:** Al abrir el sistema se realizaban **12 solicitudes al servidor**. Esto ocurría porque se cargaban las seis listas y, además, el navegador realizaba solicitudes OPTIONS antes de algunas consultas. También se solicitaban las asignaciones de rutas desde el inicio.

**Implementación:** Se modificó el envío de la cabecera `Content-Type` para utilizarla solamente cuando se envían datos. También se cambió la carga de asignaciones para que se realice al ingresar al módulo Rutas.

**ANTES — `frontend/services/api.js`**

```js
headers: {
  'Content-Type': 'application/json'
},
```

**DESPUÉS — `frontend/services/api.js`**

```js
headers: opciones.body
  ? { 'Content-Type': 'application/json' }
  : {},
```

**DESPUÉS — `frontend/components/App.jsx`**

```js
const claves = Object.keys(CARGADORES)
  .filter((c) => c !== 'asignaciones');

useEffect(() => {
  if (modulo.id === 'rutas') {
    recargar('asignaciones');
  }
}, [modulo.id, recargar]);
```

**Resultado:** Las solicitudes al abrir el sistema pasan de **12 a 5**, lo que representa una reducción del **58.3 %**.

#### 7. Estrategia de Caché de Recursos

**Diagnóstico:** El servidor ya utilizaba ETag para identificar si una respuesta había cambiado, pero el navegador volvía a solicitar algunas listas aunque sus datos siguieran siendo los mismos.

**Implementación:** Se configuró la caché para evitar descargar nuevamente información que no ha cambiado.

También se realizaron estos ajustes:

- Los factores de tráfico se guardan durante un día.
- Las listas se guardan durante 30 segundos.
- Cuando se realiza una modificación, se limpia la información guardada para obtener los datos actualizados.

**DESPUÉS — `backend/src/aplicacion.js`**

```js
app.use("/api/v1", (req, res, next) => {
  if (req.method === "GET") {
    res.set(
      "Cache-Control",
      req.path.startsWith("/factores-trafico")
        ? "public, max-age=86400"
        : "private, no-cache"
    );
  }

  next();
});
```

**DESPUÉS — `frontend/services/api.js`**

```js
const CACHE_MS = 30_000;
const cache = new Map();

const lectura =
  (opciones.method ?? 'GET').toUpperCase() === 'GET';

if (!lectura) cache.clear();

const guardado = lectura ? cache.get(ruta) : null;

if (guardado && Date.now() - guardado.hora < CACHE_MS) {
  return guardado.datos;
}
```

**Prueba realizada:** Se repitió una consulta de pedidos y se obtuvo una respuesta **304**, lo que indica que la información no había cambiado y no era necesario volver a enviarla.

#### 8. Optimización de APIs (Compresión)

**Diagnóstico:** Se comprobó que Vercel ya comprime las respuestas del servidor utilizando Brotli. Por ejemplo, la lista de pedidos pasa de 13 558 a 2 877 bytes después de la compresión.

**Implementación:** No fue necesario instalar la librería `compression`, porque Vercel ya realiza esta tarea automáticamente.

También se mantuvo un límite de 100 kB para los datos recibidos por el servidor.

**Código actual — `backend/src/aplicacion.js`**

```js
app.use(express.json({ limit: "100kb" }));
```

**Resultado:** Se aprovecha la compresión que ofrece Vercel sin agregar otra librería al proyecto. Si en el futuro el sistema se publica en un servidor propio que no tenga compresión, se podrá agregar una configuración adicional.

---

#### Mejora adicional: evitar que la tabla cambie de tamaño (CLS)

**Diagnóstico:** Lighthouse identificó que la tabla de pedidos era la principal causa del CLS de **0.043** (Evidencia 30). Mientras cargaban los datos, se mostraban cuatro filas de espera y después aparecían los pedidos, haciendo que la tabla cambiara de tamaño.

**Implementación:** Se modificó la cantidad de filas de espera para que coincida con los 12 pedidos que se muestran por página. También se reservó espacio para el texto que indica la cantidad de resultados.

**DESPUÉS — Componente de pedidos**

```jsx
<FilasCargando
  columnas={7}
  filas={POR_PAGINA}
/>
```

**DESPUÉS — CSS**

```css
.resultado-filtros {
  min-height: 2.6rem;
}
```

**Resultado:** La tabla mantiene un espacio más estable mientras carga la información. El valor de CLS de 0.02 se considera una proyección que debe verificarse nuevamente con Lighthouse después de publicar los cambios.

---

### 1.4 Tabla Comparativa de Métricas ANTES vs. DESPUÉS

En la siguiente tabla se comparan los resultados iniciales con los valores obtenidos mediante las mejoras, pruebas y cálculos realizados.

| Métrica / Indicador | ANTES | DESPUÉS | Variación | Mejora (%) | Origen |
|---|---:|---:|---:|---:|---|
| Rendimiento (Lighthouse) | 100/100 | 100/100 | 0 pts | Se mantiene | Proyectado |
| FCP | 0.2 s | 0.2 s | 0 s | Se mantiene | Proyectado |
| LCP | 0.5 s | 0.5 s | 0 s | Se mantiene | Proyectado |
| TBT | 0 ms | 0 ms | 0 ms | Se mantiene | Proyectado |
| CLS | 0.043 | 0.02 | -0.023 | -53.5 % | Proyectado |
| Peso total de la página | 258 KiB | 174 KiB | -84 KiB | -32.6 % | Proyectado |
| Solicitudes al servidor al abrir | 12 | 5 | -7 | -58.3 % | Calculado |
| Tamaño de una lista de pedidos | 13 558 bytes | 4 773 bytes | -8 785 bytes | -64.8 % | Calculado |
| Lista de pedidos comprimida | 2 934 bytes | 1 245 bytes | -1 689 bytes | -57.6 % | Calculado |
| Pedidos mostrados por página | 19 | 12 | -7 | -36.8 % | Medido en prueba |
| Consulta sin cambios | Se volvía a enviar | Respuesta 304 | — | — | Medido en prueba |
| CO₂ por visita | 0.0392 g | 0.0264 g | -0.0128 g | -32.6 % | Proyectado |

**Fórmula para calcular la mejora:**

`Mejora (%) = (DESPUÉS - ANTES) / ANTES × 100`

En el caso del peso, tiempo y solicitudes, una reducción representa una mejora.

**Resultado:** Los valores de rendimiento proyectados se encuentran dentro de las metas establecidas: puntaje de 90 o más, FCP de 1 segundo o menos, LCP de 1.4 segundos o menos, TBT de 85 ms o menos, CLS de 0.02 o menos y peso de 1.1 MB o menos.

Estos resultados todavía deben comprobarse con una nueva auditoría de Lighthouse sobre la versión optimizada publicada.

#### 1.4.1 Cómo se obtuvieron los resultados proyectados

Para calcular los valores posteriores se tomaron como referencia las mediciones iniciales y los cambios realizados en el sistema.

| Medida | Cómo se obtuvo |
|---|---|
| Peso total: 174 KiB | Se restaron los 84 KiB de JavaScript sin utilizar identificados por Lighthouse a los 258 KiB iniciales. |
| CLS: 0.02 | Se tomó como referencia el CLS de la versión móvil y la mejora realizada en la tabla de pedidos. |
| Rendimiento, FCP, LCP y TBT | Se mantienen los valores iniciales como referencia, ya que el sistema ya tenía buenos resultados. |
| CO₂ por visita: 0.0264 g | Se calculó utilizando el peso proyectado de 174 KiB y la fórmula SWDM v4. |

Los valores proyectados no reemplazan una medición real. Para confirmar los resultados será necesario ejecutar nuevamente PageSpeed Insights después de publicar las mejoras.

---

### 1.5 Análisis de Impacto Ambiental y Eficiencia Energética

Para calcular las emisiones de CO₂ generadas por el uso de EcoRuta Wanka se utilizó el **Sustainable Web Design Model, versión 4 (SWDM v4)**.

Este modelo considera la energía que utilizan tres partes:

- Los servidores donde se almacena la información.
- Las redes que permiten enviar los datos por internet.
- Las computadoras y celulares que utilizan los usuarios.

**Valores utilizados en el cálculo:**

| Lugar donde se consume energía | Durante el uso (kWh/GB) | Fabricación de equipos (kWh/GB) | Total (kWh/GB) |
|---|---:|---:|---:|
| Servidores | 0.055 | 0.012 | 0.067 |
| Redes de internet | 0.059 | 0.013 | 0.072 |
| Computadoras y celulares | 0.080 | 0.081 | 0.161 |
| **Total** | **0.194** | **0.106** | **0.300** |

**Fórmula utilizada:**

```text
E (g CO₂e) = Datos descargados (GB) ×
             0.300 kWh/GB ×
             494 g CO₂e/kWh
```

Para el cálculo se utilizó un valor de 494 gramos de CO₂e por cada kWh de electricidad.

**Comparación de emisiones por visita:**

- **ANTES:** La página tenía un peso de 258 KiB, equivalente a aproximadamente 0.000264 GB. El resultado fue de **0.0392 g de CO₂e por visita**.
- **DESPUÉS:** Con el peso proyectado de 174 KiB, equivalente a aproximadamente 0.000178 GB, las emisiones serían de **0.0264 g de CO₂e por visita**.

Esto representa una reducción aproximada del **32.6 %**.

**Comparación con la meta de la rúbrica:**

Una página de 1.1 MB generaría aproximadamente 0.163 g de CO₂e por visita, utilizando los mismos valores del modelo.

Con los resultados calculados, EcoRuta Wanka genera aproximadamente cuatro veces menos emisiones antes de las mejoras y seis veces menos después de las mejoras.

**Proyección anual (18 000 visitas):**

Para realizar una estimación anual se consideró el siguiente uso:

3 personas × 20 visitas diarias × 300 días de trabajo = **18 000 visitas al año**.

Este número es una estimación y deberá confirmarse con WankaLogística S.A.C.

| Escenario | Emisiones anuales |
|---|---:|
| Antes de las mejoras | 0.705 kg CO₂e |
| Después de las mejoras | 0.475 kg CO₂e |
| **Ahorro anual estimado** | **0.229 kg CO₂e** |

El ahorro es pequeño porque el sistema ya tenía un peso reducido y un buen rendimiento.

Además, es importante considerar que el mayor aporte ambiental de EcoRuta Wanka está en la organización de las rutas de reparto. Al reducir los kilómetros recorridos, también se puede reducir el consumo de combustible y las emisiones de los vehículos.

Por lo tanto, este informe evalúa las emisiones relacionadas con el uso de la página web, mientras que el módulo Sostenibilidad permite revisar el impacto de los vehículos de reparto.

---

### 1.6 Evidencias Visuales de Validación (Auditoría Lighthouse)

Se realizó una auditoría del sistema publicado mediante PageSpeed Insights, utilizando Lighthouse 13.6.0, el día 11/11/2026.

**Resultados iniciales (ANTES):**

```text
========================================
AUDITORÍA LIGHTHOUSE - ESTADO INICIAL
Fecha: 11/11/2026
========================================

ESCRITORIO:
Rendimiento:       100/100
Accesibilidad:    100/100
Recomendaciones:  100/100
SEO:              100/100

FCP:  0.2 s
LCP:  0.5 s
TBT:  0 ms
CLS:  0.043
Peso: 258 KiB

CELULAR:
Rendimiento: 100/100
FCP:  0.9 s
LCP:  0.9 s
TBT:  20 ms
CLS:  0.02
```

**Resultados posteriores (DESPUÉS):**

Los siguientes valores son proyecciones que deberán comprobarse con una nueva auditoría:

```text
========================================
ESTADO OPTIMIZADO - RESULTADOS PROYECTADOS
========================================

Rendimiento: 100/100 (se espera mantenerlo)
CLS: 0.02
Peso: 174 KiB
Solicitudes al servidor: 5
CO₂ por visita: 0.0264 g
```

**Evidencia 27: Puntajes en escritorio**

Se muestran los resultados de rendimiento, accesibilidad, recomendaciones y SEO, todos con un puntaje de 100/100.

![Evidencia 27: PageSpeed escritorio puntajes](../../06%20Otros/evidencias/Evidencia%2027%20PageSpeed%20escritorio%20puntajes.jpg)

**Evidencia 28: Métricas en escritorio**

Se muestran los resultados de FCP 0.2 s, LCP 0.5 s, TBT 0 ms, CLS 0.043 e índice de velocidad de 0.6 s.

![Evidencia 28: PageSpeed escritorio métricas](../../06%20Otros/evidencias/Evidencia%2028%20PageSpeed%20escritorio%20metricas.jpg)

**Evidencia 29: Métricas en celular**

Se muestran los resultados de rendimiento 100/100, FCP 0.9 s, LCP 0.9 s, TBT 20 ms y CLS 0.02.

![Evidencia 29: PageSpeed celular métricas](../../06%20Otros/evidencias/Evidencia%2029%20PageSpeed%20celular%20metricas.jpg)

**Evidencia 30: Causa del cambio de diseño (CLS)**

Lighthouse identifica la tabla de pedidos (`tabla-envoltorio`) como el elemento que genera el CLS de 0.043. Este problema se tomó como referencia para realizar la mejora de las filas de carga.

![Evidencia 30: Causante del cambio de diseño](../../06%20Otros/evidencias/Evidencia%2030%20Causante%20del%20cambio%20de%20diseno.jpg)

---

### 1.7 Conclusiones

1. EcoRuta Wanka ya contaba con un buen rendimiento, obteniendo 100/100 en Lighthouse tanto en escritorio como en celular.

2. Se revisaron ocho aspectos del sistema y se realizaron mejoras en las consultas a la base de datos, paginación, carga de módulos, solicitudes al servidor, caché y configuración de recursos.

3. Se identificó que la tabla de pedidos generaba cambios de posición mientras cargaba. Por ello, se modificaron las filas de espera para mantener un espacio más estable.

4. Las solicitudes al servidor al abrir el sistema se redujeron de 12 a 5, lo que representa una disminución del 58.3 %.

5. La lista de pedidos pasó de 13 558 a 4 773 bytes, reduciendo su tamaño en un 64.8 %.

6. La paginación de 12 pedidos por página permite organizar mejor la información y evita mostrar todos los registros al mismo tiempo.

7. Según el cálculo realizado con SWDM v4, las emisiones podrían pasar de 0.0392 g a 0.0264 g de CO₂e por visita, lo que representa una reducción estimada del 32.6 %.

8. Finalmente, estas mejoras ayudan a que EcoRuta Wanka utilice menos recursos al funcionar. Sin embargo, el principal aporte ambiental del proyecto sigue siendo la optimización de las rutas de reparto, ya que permite reducir los kilómetros recorridos y el combustible utilizado por los vehículos.

---

[Volver al README principal](../../../README.md)
