<template>
  <div class="x-pdf-viewer">
    <!-- Motor: PDFium via WebAssembly (embedpdf). Trae UI con toolbar,
         zoom, search, thumbnails, seleccion precisa nativa.
         Los botones de print y download del toolbar interno estan siempre
         apagados: los proveemos como overlay sobre el toolbar. -->
    <div class="x-pdf-viewer__viewport">
      <PDFViewer v-if="src" :config="config" style="width: 100%; height: 100%" />
      <div v-else class="x-pdf-viewer__empty">Sin PDF seleccionado</div>

      <!-- Botonera flotante a la derecha del toolbar interno de embedpdf.
           Print + Download + Close comparten linea visual con los controles
           de zoom/pan del toolbar. -->
      <div v-if="showActions" class="x-pdf-actions">
        <button
          v-if="!hidePrint"
          class="x-pdf-actions__btn"
          :disabled="busy"
          :title="filename ? `Imprimir ${filename}` : 'Imprimir'"
          type="button"
          @click="printPdf"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
        </button>

        <button
          v-if="!hideDownload"
          class="x-pdf-actions__btn"
          :disabled="busy"
          :title="filename ? `Descargar ${filename}` : 'Descargar'"
          type="button"
          @click="downloadPdf"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>

        <button
          v-if="!hideClose"
          class="x-pdf-actions__btn x-pdf-actions__btn--close"
          title="Cerrar"
          type="button"
          @click="$emit('close')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { PDFViewer } from '@embedpdf/vue-pdf-viewer'

/**
 * XPdfViewer — visor PDF basado en @embedpdf/vue-pdf-viewer (PDFium WASM).
 *
 * v2.4.3 —
 *   - Botones Print / Download / Close ahora son overlay flotante a la
 *     derecha del toolbar interno (`x-pdf-actions`, position:absolute).
 *   - Se ocultan los botones del hamburger izquierdo y del "documento"
 *     (left-action-menu + document-menu-button) via CSS attribute selectors.
 *   - Default zoom: 'fit-width' — el PDF abre ocupando el ancho del contenedor.
 *   - `filename` ya no se muestra en pantalla (queda solo como default para
 *     la descarga). Se puede mostrar via `showActions=false` + overlay propio.
 *
 * Props publicos:
 *   src, filename, showActions, hidePrint, hideDownload, hideClose
 *   show*: search, sidebar, annotations, forms, redaction, rotate, capture,
 *          insert (todos default false — visor read-only minimalista)
 *
 * Emit: close
 */

const emit = defineEmits(['close'])

const props = defineProps({
  // — Contenido —
  src:          { type: String, required: true },
  filename:     { type: String, default: 'documento.pdf' },

  // — Overlay de acciones (Print/Download/Close) —
  showActions:  { type: Boolean, default: true },
  hidePrint:    { type: Boolean, default: false },
  hideDownload: { type: Boolean, default: false },
  hideClose:    { type: Boolean, default: false },

  // — Toolbar de embedpdf: features apagadas por default (opt-in) —
  showSearch:      { type: Boolean, default: false }, // panel-search
  showSidebar:     { type: Boolean, default: false }, // panel-sidebar + panel-comment
  showAnnotations: { type: Boolean, default: false }, // annotation + annotation-shape
  showForms:       { type: Boolean, default: false }, // form
  showRedaction:   { type: Boolean, default: false }, // redaction + security
  showRotate:      { type: Boolean, default: false }, // page-rotate
  showCapture:     { type: Boolean, default: false }, // document-capture + tools-capture
  showInsert:      { type: Boolean, default: false }, // insert
})

const config = computed(() => {
  const off = ['document-print', 'document-export']

  if (!props.showSearch)       off.push('panel-search')
  if (!props.showSidebar)      off.push('panel-sidebar', 'panel-comment')
  if (!props.showAnnotations)  off.push('annotation', 'annotation-shape')
  if (!props.showForms)        off.push('form')
  if (!props.showRedaction)    off.push('redaction', 'security')
  if (!props.showRotate)       off.push('page-rotate')
  if (!props.showCapture)      off.push('document-capture', 'tools-capture')
  if (!props.showInsert)       off.push('insert')

  return {
    src: props.src,
    disabledCategories: off,
    // Abre en fit-width para que el reporte sea legible sin tener que ajustar
    // manualmente el zoom (embedpdf: 'fit-width' | 'fit-page' | 'automatic').
    zoom: {
      defaultZoomLevel: 'fit-width',
    },
  }
})

const busy = ref(false)

async function downloadPdf() {
  if (!props.src) return
  busy.value = true
  let objUrl = null
  try {
    const res = await fetch(props.src, { credentials: 'include' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    objUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objUrl
    a.download = props.filename || 'documento.pdf'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    a.remove()
  } catch (e) {
    console.error('[XPdfViewer] download failed:', e)
  } finally {
    busy.value = false
    if (objUrl) setTimeout(() => URL.revokeObjectURL(objUrl), 5000)
  }
}

function printPdf() {
  if (!props.src) return
  busy.value = true
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.setAttribute('aria-hidden', 'true')
  iframe.src = props.src
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    } catch (e) {
      console.warn('[XPdfViewer] print failed:', e)
    } finally {
      busy.value = false
    }
  }
  iframe.onerror = () => {
    busy.value = false
    console.error('[XPdfViewer] iframe error for print')
    iframe.remove()
  }
  document.body.appendChild(iframe)
  setTimeout(() => iframe.remove(), 60000)
}
</script>

<style lang="scss">
.x-pdf-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #2d2d2d;
  overflow: hidden;
}

.x-pdf-viewer__viewport {
  flex: 1 1 auto;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

.x-pdf-viewer__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #aaa;
  font-size: 14px;
}

/* Overlay de acciones: flota a la derecha, alineado con el toolbar interno
   de embedpdf. Posicionado absoluto sobre el viewport para que quede en
   la MISMA fila visual que los botones de zoom / pan. */
.x-pdf-actions {
  position: absolute;
  top: 6px;
  right: 12px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  border-radius: 6px;
  background: rgba(30, 30, 30, 0.55);
  backdrop-filter: blur(2px);

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: #f0f0f0;
    cursor: pointer;
    transition: background 0.15s;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &--close:hover:not(:disabled) {
      background: rgba(255, 90, 90, 0.3);
    }
  }
}

/* Oculta los botones que embedpdf muestra en el toolbar secundario pero que
   no aportan al caso "visor read-only" (hamburger de la izquierda, botón de
   apertura de documento). No hay props oficiales para apagarlos: los IDs se
   confirmaron leyendo el bundle del paquete. */
.x-pdf-viewer .embedpdf-container [data-item-id="left-action-menu"],
.x-pdf-viewer .embedpdf-container [data-item-id="document-menu-button"],
.x-pdf-viewer .embedpdf-container [data-item-id="document-menu"],
.x-pdf-viewer .embedpdf-container [data-item-id="overflow-left-action-menu-button"] {
  display: none !important;
}
</style>
