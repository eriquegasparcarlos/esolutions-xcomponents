<template>
  <div class="x-pdf-viewer">
    <!-- Header custom: filename + acciones (imprimir/descargar/cerrar).
         Los botones equivalentes de embedpdf estan siempre deshabilitados
         (`document-print` + `document-export`) para no duplicarlos. -->
    <div v-if="showHeader" class="x-pdf-header">
      <span v-if="filename" class="x-pdf-header__filename" :title="filename">
        {{ filename }}
      </span>
      <div class="x-pdf-header__spacer"></div>

      <!-- Imprimir -->
      <button
        v-if="!hidePrint"
        class="x-pdf-header__btn"
        :disabled="busy"
        @click="printPdf"
        title="Imprimir"
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 6 2 18 2 18 9"/>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
      </button>

      <!-- Descargar -->
      <button
        v-if="!hideDownload"
        class="x-pdf-header__btn"
        :disabled="busy"
        @click="downloadPdf"
        title="Descargar"
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>

      <!-- Cerrar -->
      <button
        v-if="!hideClose"
        class="x-pdf-header__btn x-pdf-header__btn--close"
        @click="$emit('close')"
        title="Cerrar"
        type="button"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <!-- Motor: PDFium via WebAssembly (embedpdf). Trae UI con toolbar, zoom,
         search, thumbnails, seleccion precisa nativa.
         Los botones de print y download del toolbar interno estan siempre
         deshabilitados: los llevamos al header custom para tener control
         del filename en descarga y del flujo de impresion. -->
    <div class="x-pdf-viewer__viewport">
      <PDFViewer v-if="src" :config="config" style="width: 100%; height: 100%" />
      <div v-else class="x-pdf-viewer__empty">Sin PDF seleccionado</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { PDFViewer } from '@embedpdf/vue-pdf-viewer'

/**
 * XPdfViewer — visor PDF basado en @embedpdf/vue-pdf-viewer (PDFium WASM).
 *
 * v2.4.2 — Print + Download reubicados al header custom del componente:
 *   - Print via iframe oculto (dispara el dialog nativo del browser sin
 *     abrir tab ni pasar por el preview interno de embedpdf).
 *   - Download via fetch(src) → Blob → `<a download>` para respetar el
 *     prop `filename` (embedpdf usaba el nombre original del PDF servido).
 *   - Los botones internos de embedpdf (`document-print`, `document-export`)
 *     quedan siempre off para no duplicar.
 *
 * Defaults del toolbar de embedpdf (categorías activables via `show*`):
 *   Off por default: search, sidebar, annotations, forms, redaction, rotate,
 *                    capture, insert.
 *   On por default:  zoom, selection, navegación de páginas.
 */

const emit = defineEmits(['close'])

const props = defineProps({
  // — Contenido —
  src:          { type: String, required: true },
  filename:     { type: String, default: 'documento.pdf' },

  // — Header custom —
  showHeader:   { type: Boolean, default: true },
  hidePrint:    { type: Boolean, default: false }, // oculta boton print del header
  hideDownload: { type: Boolean, default: false }, // oculta boton descargar del header
  hideClose:    { type: Boolean, default: false },

  // — Toolbar de embedpdf: apagadas por default (opt-in) —
  showSearch:      { type: Boolean, default: false }, // panel-search
  showSidebar:     { type: Boolean, default: false }, // panel-sidebar + panel-comment
  showAnnotations: { type: Boolean, default: false }, // annotation + annotation-shape
  showForms:       { type: Boolean, default: false }, // form
  showRedaction:   { type: Boolean, default: false }, // redaction + security
  showRotate:      { type: Boolean, default: false }, // page-rotate
  showCapture:     { type: Boolean, default: false }, // document-capture + tools-capture
  showInsert:      { type: Boolean, default: false }, // insert
})

// disabledCategories del toolbar interno de embedpdf.
// document-print y document-export van SIEMPRE off (los manejamos en el header).
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
  }
})

const busy = ref(false)

/**
 * Descarga forzando el filename del prop.
 * Hace fetch(src) → Blob → `<a download>`.
 * Funciona con URLs http/s y con blob: URLs.
 */
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

/**
 * Imprime disparando el dialog nativo del browser via iframe oculto.
 * NO se puede saltar el dialog del browser por seguridad; lo mejor
 * posible es que aparezca directamente listo para "Imprimir".
 * El iframe se elimina al minuto por si el usuario cancela.
 */
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
  // Cleanup por si el dialog nunca cierra
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

.x-pdf-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: #1e1e1e;
  color: #f0f0f0;
  border-bottom: 1px solid #000;

  &__filename {
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 55%;
    padding: 0 4px;
  }

  &__spacer {
    flex: 1 1 auto;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: inherit;
    cursor: pointer;
    transition: background 0.15s;

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.12);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &--close:hover:not(:disabled) {
      background: rgba(255, 90, 90, 0.25);
    }
  }
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
</style>
