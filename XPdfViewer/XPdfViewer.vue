<template>
  <div class="x-pdf-viewer">
    <!-- Header custom: filename + boton cerrar. -->
    <div v-if="showHeader" class="x-pdf-header">
      <span v-if="filename" class="x-pdf-header__filename" :title="filename">
        {{ filename }}
      </span>
      <div class="x-pdf-header__spacer"></div>
      <button
        v-if="!hideClose"
        class="x-pdf-header__btn x-pdf-header__btn--close"
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

    <!-- Motor: PDFium via WebAssembly (embedpdf). Los botones Print / Download
         internos estan apagados; los proveemos como overlay sobre el toolbar
         de embedpdf con estilo identico al resto (icono cuadrado 36px,
         transparente, hover gris suave). -->
    <div class="x-pdf-viewer__viewport">
      <PDFViewer v-if="src" :config="config" style="width: 100%; height: 100%" />
      <div v-else class="x-pdf-viewer__empty">Sin PDF seleccionado</div>

      <div v-if="showActions" class="x-pdf-actions">
        <button
          v-if="!hidePrint"
          class="x-pdf-actions__btn"
          :disabled="busy"
          :title="filename ? `Imprimir ${filename}` : 'Imprimir'"
          type="button"
          @click="printPdf"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
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
 * v2.4.5 —
 *   - Header conservado con filename + boton cerrar.
 *   - Botones Print / Download con el MISMO estilo del toolbar de embedpdf
 *     (36×36, iconos linea 1.75px, color #4b5563, hover rgba(0,0,0,0.06)).
 *   - Se ocultan tambien page-settings + submenus + document-menu completo
 *     (antes solo document-menu-button). Los strings salen del bundle de
 *     @embedpdf/snippet.
 */

const emit = defineEmits(['close'])

const props = defineProps({
  // — Contenido —
  src:          { type: String, required: true },
  filename:     { type: String, default: 'documento.pdf' },

  // — Header —
  showHeader:   { type: Boolean, default: true },
  hideClose:    { type: Boolean, default: false },

  // — Overlay Print/Download —
  showActions:  { type: Boolean, default: true },
  hidePrint:    { type: Boolean, default: false },
  hideDownload: { type: Boolean, default: false },

  // — Toolbar embedpdf (features off por default, opt-in) —
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

/* Header oscuro con filename + close */
.x-pdf-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #1e1e1e;
  color: #f0f0f0;
  border-bottom: 1px solid #000;

  &__filename {
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 80%;
  }

  &__spacer { flex: 1 1 auto; }

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

    &:hover:not(:disabled) { background: rgba(255, 255, 255, 0.12); }
    &--close:hover:not(:disabled) { background: rgba(255, 90, 90, 0.28); }
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

/* Overlay Print/Download — mismos tamanos y colores del toolbar embedpdf
   (button 36×36, icono trazo fino, color #4b5563, hover rgba(0,0,0,0.06)). */
.x-pdf-actions {
  position: absolute;
  top: 6px;
  right: 12px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 2px;

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #4b5563;
    cursor: pointer;
    transition: background 0.12s;

    &:hover:not(:disabled) { background: rgba(0, 0, 0, 0.06); }
    &:active:not(:disabled) { background: rgba(0, 0, 0, 0.1); }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}

/* Oculta botones del toolbar interno de embedpdf que no tienen categoria
   oficial en `disabledCategories`. embedpdf marca cada item con el atributo
   `data-epdf-i="<id>"` — los IDs se leyeron del bundle @embedpdf/snippet.
   (En v2.4.5 use `data-item-id`, atributo inexistente — no matcheaba nada.) */
.x-pdf-viewer [data-epdf-i="left-action-menu"],
.x-pdf-viewer [data-epdf-i="overflow-left-action-menu-button"],
.x-pdf-viewer [data-epdf-i="document-menu"],
.x-pdf-viewer [data-epdf-i="document-menu-button"],
.x-pdf-viewer [data-epdf-i="page-settings"],
.x-pdf-viewer [data-epdf-i="page-settings-menu"],
.x-pdf-viewer [data-epdf-i="page-settings-submenu"],
.x-pdf-viewer [data-epdf-i="page-settings-button"] {
  display: none !important;
}
</style>
