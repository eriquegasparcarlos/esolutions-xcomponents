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

    <!-- Motor: PDFium via WebAssembly (embedpdf). Trae su propia UI con zoom,
         search, thumbnails, print, download, selección precisa. -->
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
 * Historia:
 *  - Hasta v2.3.x usaba pdfjs-dist con render manual (canvas + text layer).
 *    La selección de texto era imprecisa y el worker .mjs daba issues de MIME
 *    en nginx sin config extra.
 *  - Desde v2.4.0 delega a @embedpdf/vue-pdf-viewer (motor PDFium via WASM,
 *    el mismo motor de Chrome). Selección nativa, sin worker JS, toolbar
 *    interno con zoom/search/print/download/thumbnails.
 *
 * API pública (retro-compatible con llamantes v2.3.x):
 *   Props: src, filename, hidePrint, hideDownload, hideClose, showHeader
 *   Emits: close
 */

const emit = defineEmits(['close'])

const props = defineProps({
  src:          { type: String, required: true },
  filename:     { type: String, default: 'documento.pdf' },
  hidePrint:    { type: Boolean, default: false },
  hideDownload: { type: Boolean, default: false },
  hideClose:    { type: Boolean, default: false },
  showHeader:   { type: Boolean, default: true },
})

// Ocultar categorias del toolbar interno de embedpdf según los flags.
// disabledCategories corta features enteras: 'print', 'export' (download),
// 'annotation' (siempre off para visor de comprobantes), 'redaction' (idem).
const config = computed(() => {
  const disabled = ['annotation', 'redaction']
  if (props.hidePrint) disabled.push('print')
  if (props.hideDownload) disabled.push('export')
  return {
    src: props.src,
    disabledCategories: disabled,
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
