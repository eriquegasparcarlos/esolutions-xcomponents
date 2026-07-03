<template>
  <div class="x-pdf-viewer">
    <!-- Header custom: filename + boton cerrar (embedpdf no expone cerrar) -->
    <div v-if="showHeader" class="x-pdf-header">
      <span v-if="filename" class="x-pdf-header__filename" :title="filename">
        {{ filename }}
      </span>
      <div class="x-pdf-header__spacer"></div>
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
         search, thumbnails, print, download, seleccion precisa nativa. -->
    <div class="x-pdf-viewer__viewport">
      <PDFViewer v-if="src" :config="config" style="width: 100%; height: 100%" />
      <div v-else class="x-pdf-viewer__empty">Sin PDF seleccionado</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { PDFViewer } from '@embedpdf/vue-pdf-viewer'

/**
 * XPdfViewer — visor PDF basado en @embedpdf/vue-pdf-viewer (PDFium WASM).
 *
 * v2.4.x — motor PDFium via WebAssembly. Selección de texto nativa,
 *          sin worker JS externo, sin problemas de MIME .mjs.
 *
 * Defaults: visor minimalista (zoom + print + download + selección + navegación).
 * Todas las features "editables" (annotations, forms, redaction, sidebar,
 * search, rotate) están apagadas por default y se habilitan por props.
 *
 * Retrocompatibilidad v2.3.x: `hidePrint`, `hideDownload`, `hideClose`,
 * `filename`, `showHeader` mantienen su semántica original.
 */

const emit = defineEmits(['close'])

const props = defineProps({
  // — Contenido —
  src:          { type: String, required: true },
  filename:     { type: String, default: 'documento.pdf' },

  // — Header custom (no proviene de embedpdf) —
  showHeader:   { type: Boolean, default: true },
  hideClose:    { type: Boolean, default: false },

  // — Toolbar de embedpdf: categorías visibles por default —
  //   Se pueden apagar puntualmente.
  hidePrint:    { type: Boolean, default: false }, // apaga document-print
  hideDownload: { type: Boolean, default: false }, // apaga document-export

  // — Toolbar de embedpdf: categorías apagadas por default —
  //   Se activan opt-in (visor "read-only" minimalista es el escenario común).
  showSearch:      { type: Boolean, default: false }, // panel-search
  showSidebar:     { type: Boolean, default: false }, // panel-sidebar + panel-comment
  showAnnotations: { type: Boolean, default: false }, // annotation + annotation-shape
  showForms:       { type: Boolean, default: false }, // form
  showRedaction:   { type: Boolean, default: false }, // redaction + security
  showRotate:      { type: Boolean, default: false }, // page-rotate
  showCapture:     { type: Boolean, default: false }, // document-capture + tools-capture
  showInsert:      { type: Boolean, default: false }, // insert
})

// Construye disabledCategories desde los props.
// Cada rama agrega las categorías/subcategorías correspondientes de embedpdf.
const config = computed(() => {
  const off = []

  if (props.hidePrint)         off.push('document-print')
  if (props.hideDownload)      off.push('document-export')

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
    max-width: 60%;
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

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &--close:hover {
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
