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

    <!-- Motor: PDFium via WebAssembly (embedpdf). Corre dentro de shadow DOM,
         por eso ocultamos elementos del toolbar interno via `disabledCategories`
         del config — el CSS externo no penetra el shadow. -->
    <div class="x-pdf-viewer__viewport">
      <PDFViewer v-if="src" :config="config" style="width: 100%; height: 100%" @init="onEmbedInit" />
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
 * v2.4.7 —
 *   - Se apagan `document-menu`, `page-settings`, `ui-menu`, `mode` via
 *     disabledCategories (el shadow DOM del componente respeta data-epdf-dis
 *     y las reglas CSS auto-generadas ocultan cada `[data-epdf-cat~="..."]`).
 *   - Botones Print/Download: 32×32, padding 5px, alineados a `top: 8px`
 *     para coincidir vertical con la fila del toolbar interno.
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
  showDocumentMenu: { type: Boolean, default: false }, // hamburger izquierdo
  showPageSettings: { type: Boolean, default: false }, // page-settings icon
  showModeTabs:     { type: Boolean, default: false }, // View / Annotate / Shapes...
  showOverflowMenu: { type: Boolean, default: false }, // 3 dots overflow
  showSearch:       { type: Boolean, default: false }, // panel-search
  showSidebar:      { type: Boolean, default: false }, // panel-sidebar + panel-comment
  showAnnotations:  { type: Boolean, default: false }, // annotation + annotation-shape
  showForms:        { type: Boolean, default: false }, // form
  showRedaction:    { type: Boolean, default: false }, // redaction + security
  showRotate:       { type: Boolean, default: false }, // page-rotate
  showCapture:      { type: Boolean, default: false }, // document-capture + tools-capture
  showInsert:       { type: Boolean, default: false }, // insert
})

const config = computed(() => {
  // Print + Export SIEMPRE off (los reemplazamos con nuestros botones custom).
  const off = ['document-print', 'document-export']

  // Elementos del main-toolbar sin categoria oficial de negocio pero
  // agrupables por su data-epdf-cat.
  if (!props.showDocumentMenu) off.push('document-menu')
  if (!props.showPageSettings) off.push('page-settings')
  if (!props.showModeTabs)     off.push('mode')            // View/Annotate/...
  if (!props.showOverflowMenu) off.push('ui-menu')         // 3 dots

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

/**
 * Al inicializar el <embedpdf-container>, inyectamos un <style> dentro de su
 * shadowRoot para ocultar bloques del toolbar interno que no tienen
 * data-epdf-cat propia (o cuyo comportamiento es "medio" apagado, como
 * botones deshabilitados que siguen ocupando espacio).
 *
 * Estrategia: ocultar el CONTENEDOR completo (left-group, right-group, etc.)
 * cuando ninguno de sus items esta activado por props. Mas robusto que
 * targetear item por item.
 *
 * Estructura del main-toolbar de embedpdf:
 *   left-group  → document-menu, sidebar, overflow-menu, page-settings
 *   divider-2   → separador entre left y center
 *   center-group → zoom + pan + pointer (SIEMPRE visible)
 *   spacer-1
 *   mode-select-button + mode-tabs → View/Annotate/Shapes/Insert/Form/Redact
 *   spacer-2
 *   right-group → search + comment
 */
function onEmbedInit(container) {
  const el = container?.$el ?? container
  const shadow = el?.shadowRoot
  if (!shadow) return

  const rules = []

  // Si TODOS los botones del left-group estan off → ocultar el grupo entero
  // (incluye los dividers y el sidebar-button deshabilitado).
  if (!props.showDocumentMenu && !props.showPageSettings
      && !props.showSidebar && !props.showOverflowMenu) {
    rules.push('[data-epdf-i="left-group"]{display:none!important;}')
    rules.push('[data-epdf-i="divider-2"]{display:none!important;}')
  }

  // right-group tiene search + comment (ambos disabled cuando sus categorias
  // estan off). Si el consumidor no activo ninguno, no aporta nada visual.
  if (!props.showSearch && !props.showSidebar) {
    rules.push('[data-epdf-i="right-group"]{display:none!important;}')
  }

  // mode-tabs + mode-select-button ya se apagan via categoria "mode", pero
  // pueden dejar huella visual en algunos breakpoints. Reforzarlo.
  if (!props.showModeTabs) {
    rules.push('[data-epdf-i="mode-tabs"]{display:none!important;}')
    rules.push('[data-epdf-i="mode-select-button"]{display:none!important;}')
  }

  if (!rules.length) return

  const style = document.createElement('style')
  style.setAttribute('data-x-pdf-viewer', 'overrides')
  style.textContent = rules.join('\n')
  shadow.appendChild(style)
}

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
  background: #f3f4f6; /* --ep-background-app: coincide con fondo del visor embedpdf */
  overflow: hidden;
}

/* Header claro con filename + close — mismos tokens que usa embedpdf
   (--ep-background-surface, --ep-foreground-primary, --ep-border-default). */
.x-pdf-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffffff;
  color: #111827;
  border-bottom: 1px solid #d1d5db;

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
    border-radius: 6px;
    background: transparent;
    color: inherit;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;

    &:hover:not(:disabled) { background: #f3f4f6; } /* --ep-interactive-hover */

    &--close:hover:not(:disabled) {
      background: #fef2f2; /* --ep-state-error-light */
      color: #dc2626;
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

/* Overlay Print/Download — mismos tamanos y estilo del toolbar embedpdf
   (32x32, radius 6px, hover #f3f4f6). El toolbar interno usa `py-2 px-4`
   (padding vertical 8px) + botones 32px, altura total 48px. Nuestro overlay
   con top: 8px alinea centro vertical con los botones internos. */
.x-pdf-actions {
  position: absolute;
  top: 8px;
  right: 16px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;

  &__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    min-width: 32px;
    padding: 5px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #111827; /* --ep-foreground-primary */
    cursor: pointer;
    transition: background 0.12s, box-shadow 0.12s;

    &:hover:not(:disabled) {
      background: #f3f4f6; /* --ep-interactive-hover */
      box-shadow: 0 0 0 1px #3b82f6; /* ring-accent */
    }

    &:active:not(:disabled) {
      background: #e5e7eb; /* --ep-interactive-active */
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    svg {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
