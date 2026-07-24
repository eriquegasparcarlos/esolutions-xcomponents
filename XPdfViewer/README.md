# XPdfViewer

Visor de PDF embebido que renderiza el documento con [`pdfjs-dist`](https://github.com/mozilla/pdf.js) (canvas + capa de texto seleccionable) y añade una barra de herramientas propia con zoom, impresión y descarga. No depende de un modal: se estira a su contenedor (`flex: 1`), así que se puede usar suelto o dentro de un `XDialog`.

## Instalación

```vue
<script setup>
import XPdfViewer from '@esolutions/x-components/XPdfViewer/XPdfViewer.vue'
</script>
```

Requiere `pdfjs-dist` como dependencia del proyecto consumidor (el worker se resuelve con `new URL(..., import.meta.url)` para Vite/Rollup).

## Qué recibe

El componente **no descarga metadata ni pagina desde un backend**: solo necesita la **URL de un PDF ya generado**. Toda la información (número de páginas, dimensiones, texto seleccionable) la extrae del propio archivo vía pdf.js en el navegador.

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `src` | `String` | — (**requerido**) | URL del PDF a mostrar. Si cambia, el visor recarga el documento automáticamente (`watch`). Puede ser una URL del backend, un blob URL o un data URI. |
| `filename` | `String` | `'documento.pdf'` | Nombre del archivo. Se muestra en la barra superior (con elipsis) y es el nombre con el que se guarda al **descargar**. |
| `hidePrint` | `Boolean` | `false` | Oculta el botón **Imprimir**. |
| `hideDownload` | `Boolean` | `false` | Oculta el botón **Descargar**. |
| `hideClose` | `Boolean` | `false` | Oculta el botón **Cerrar** (útil si el visor va embebido sin diálogo propio). |

> **Sobre `src` y CORS:** el renderizado funciona con cualquier URL accesible (mismo origen o con CORS habilitado). La **descarga** usa los bytes que pdf.js ya tiene en memoria (`pdfDoc.getData()` → `Blob`), por lo que funciona incluso cross-origin; si el documento aún no cargó, cae a `fetch(src, { credentials: 'include' })` y, como último recurso, abre el PDF en una pestaña nueva.

### Eventos

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `close` | — | Se emite al pulsar el botón **Cerrar** de la barra. El componente no se oculta a sí mismo: el padre decide qué hacer (cerrar el diálogo, cambiar de vista, etc.). |

### Métodos expuestos (`ref`)

Vía `defineExpose`, accesibles con una `ref` al componente para disparar acciones desde fuera de la barra:

| Método | Descripción |
|--------|-------------|
| `printPdf()` | Abre el diálogo de impresión del navegador. |
| `downloadPdf()` | Descarga el PDF con el nombre de `filename`. |
| `zoomIn()` / `zoomOut()` | Acerca / aleja un paso (0.25). |
| `zoomFit()` | Ajusta el documento al ancho del contenedor. |
| `zoomReset()` | Restaura el zoom al 100%. |

```vue
<XPdfViewer ref="viewer" :src="url" />
<!-- viewer.value.printPdf() -->
```

## Opciones y controles de la interfaz

La barra de herramientas (dos filas) ofrece:

**Fila superior** — nombre del archivo, y a la derecha:
- **Imprimir** (`hidePrint` para ocultarlo): rasteriza cada página a imagen de alta resolución y usa `window.print()`. Deshabilitado hasta que el PDF termina de cargar.
- **Descargar** (`hideDownload`): ver nota sobre `src`/CORS arriba.
- **Cerrar** (`hideClose`): emite `close`.

**Fila inferior** — controles de visualización:
- **Zoom**: botones acercar/alejar, etiqueta de porcentaje (clic = volver a 100%) y **ajustar al ancho**. Rango **0.25× – 5×**, paso 0.25. También con **`Ctrl` + rueda del ratón** (muestra un hint si se hace scroll sin `Ctrl`).
- **Modo de interacción**:
  - **Seleccionar texto** (por defecto): la capa de texto queda seleccionable/copiable, alineada al glifo del canvas.
  - **Mover** (pan): arrastrar con el botón izquierdo para desplazar el documento.
- **Contador de páginas**: total de páginas del documento (renderizado multipágina en scroll vertical continuo).

Además muestra un **overlay de carga** con el progreso de renderizado ("Renderizando página N / M…") y maneja el ciclo de vida de pdf.js (destruye el documento al desmontar).

## Uso básico

```vue
<template>
  <XPdfViewer
    :src="pdfUrl"
    :filename="pdfFilename"
    @close="showViewer = false"
  />
</template>

<script setup>
import { ref } from 'vue'
import XPdfViewer from '@esolutions/x-components/XPdfViewer/XPdfViewer.vue'

const pdfUrl = ref('https://mi-api.test/document/download/xml/UUID')
const pdfFilename = ref('B001-123.pdf')
const showViewer = ref(true)
</script>
```

## Ejemplos

### Dentro de un XDialog (patrón de vista previa de comprobante)

```vue
<template>
  <XDialog v-model="show" :show-button-ok="false" is-full-height position="standard">
    <template #content>
      <x-pdf-viewer
        :src="pdfUrl"
        :filename="pdfFilename"
        @close="show = false"
      />
    </template>
  </XDialog>
</template>
```

> El visor pide `flex: 1` y `min-height: 0`: el contenedor padre debe permitir que crezca (por eso encaja bien en `is-full-height` de `XDialog`).

### Embebido sin botón de cerrar

```vue
<x-pdf-viewer :src="pdfUrl" :hide-close="true" />
```

### Solo lectura (sin imprimir ni descargar)

```vue
<x-pdf-viewer
  :src="pdfUrl"
  :hide-print="true"
  :hide-download="true"
/>
```
