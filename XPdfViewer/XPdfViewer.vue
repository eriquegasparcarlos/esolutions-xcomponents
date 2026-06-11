<template>
  <div class="x-pdf-viewer">
    <!-- Toolbar fila 1: nombre + acciones -->
    <div class="x-pdf-toolbar x-pdf-toolbar--top">
      <span v-if="filename" class="x-pdf-toolbar__filename" :title="filename">{{ filename }}</span>
      <div class="x-pdf-toolbar__sep"></div>
      <div class="x-pdf-toolbar__group">
        <button
          v-if="!hidePrint"
          class="x-pdf-tb-btn"
          @click="printPdf"
          :disabled="!pdfReady || printing"
          :title="printing ? 'Preparando...' : 'Imprimir'"
        >
          <svg v-if="!printing" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          <span v-else class="x-pdf-tb-spinner"></span>
        </button>
        <button v-if="!hideDownload" class="x-pdf-tb-btn" @click="downloadPdf" :disabled="!pdfReady" title="Descargar PDF">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
        <template v-if="!hideClose">
          <div class="x-pdf-tb-divider"></div>
          <button class="x-pdf-tb-btn x-pdf-tb-btn--close" @click="$emit('close')" title="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </template>
      </div>
    </div>

    <!-- Toolbar fila 2: zoom + modo + páginas -->
    <div class="x-pdf-toolbar x-pdf-toolbar--bottom">
      <div class="x-pdf-toolbar__group">
        <button class="x-pdf-tb-btn" @click="zoomOut" :disabled="scale <= MIN_SCALE" title="Alejar (Ctrl+-)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button class="x-pdf-zoom-label" @click="zoomReset" title="Restaurar zoom (100%)">
          {{ zoomLabel }}
        </button>
        <button class="x-pdf-tb-btn" @click="zoomIn" :disabled="scale >= MAX_SCALE" title="Acercar (Ctrl++)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
        <button class="x-pdf-tb-btn" @click="zoomFit" title="Ajustar al ancho">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
            <path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
          </svg>
        </button>
      </div>
      <div class="x-pdf-tb-divider"></div>
      <div class="x-pdf-toolbar__group">
        <button
          class="x-pdf-tb-btn"
          :class="{ 'x-pdf-tb-btn--active': interactionMode === 'select' }"
          @click="interactionMode = 'select'"
          title="Seleccionar texto"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="3" x2="12" y2="21"/>
            <path d="M9 6h6M9 18h6M7 12h10"/>
          </svg>
        </button>
        <button
          class="x-pdf-tb-btn"
          :class="{ 'x-pdf-tb-btn--active': interactionMode === 'pan' }"
          @click="interactionMode = 'pan'"
          title="Mover (arrastrar)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 11V8a2 2 0 0 0-4 0v3"/>
            <path d="M14 11V7a2 2 0 0 0-4 0v4"/>
            <path d="M10 11V9a2 2 0 0 0-4 0v5a7 7 0 0 0 14 0v-3a2 2 0 0 0-4 0v0"/>
          </svg>
        </button>
      </div>
      <div class="x-pdf-toolbar__sep"></div>
      <div class="x-pdf-toolbar__group">
        <span class="x-pdf-page-info" v-if="totalPages > 0">
          {{ totalPages }} {{ totalPages === 1 ? 'página' : 'páginas' }}
        </span>
      </div>
    </div>

    <!-- Área de páginas -->
    <div
      class="x-pdf-pages-container"
      ref="containerRef"
      :class="{ 'is-dragging': isDragging, 'is-loading': loading, 'is-select': interactionMode === 'select' }"
      @mousedown="startDrag"
    >
      <div class="x-pdf-pages-inner" ref="pagesRef"></div>
    </div>

    <!-- Overlay de carga -->
    <Transition name="x-pdf-fade">
      <div v-if="loading" class="x-pdf-loading-overlay">
        <div class="x-pdf-spinner"></div>
        <span>{{ loadingMsg }}</span>
      </div>
    </Transition>

    <!-- Hint Ctrl+Scroll -->
    <Transition name="x-pdf-fade">
      <div v-if="showHint" class="x-pdf-hint">Ctrl + rueda del ratón para hacer zoom</div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'

// Worker usando new URL para compatibilidad con Vite/Rollup en proyectos consumidores
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).href

const emit = defineEmits(['close'])

const props = defineProps({
  src:          { type: String, required: true },
  filename:     { type: String, default: 'documento.pdf' },
  hidePrint:    { type: Boolean, default: false },
  hideDownload: { type: Boolean, default: false },
  hideClose:    { type: Boolean, default: false },
})

// --- Estado ---
const containerRef = ref(null)
const pagesRef     = ref(null)
const loading      = ref(false)
const loadingMsg   = ref('Cargando PDF...')
const printing     = ref(false)
const pdfReady     = ref(false)
const totalPages   = ref(0)
const scale        = ref(1.0)
const isDragging      = ref(false)
const showHint        = ref(false)
const interactionMode = ref('select') // 'select' | 'pan'

const MIN_SCALE  = 0.25
const MAX_SCALE  = 5.0
const SCALE_STEP = 0.25

let pdfDoc      = null
let renderGen   = 0
let hintTimeout = null

// --- Computed ---
const zoomLabel = computed(() => `${Math.round(scale.value * 100)}%`)

// --- Carga del PDF ---
async function loadPdf(src) {
  loading.value    = true
  loadingMsg.value = 'Cargando PDF...'
  pdfReady.value   = false
  totalPages.value = 0

  try {
    if (pdfDoc) {
      pdfDoc.destroy()
      pdfDoc = null
    }

    const task = pdfjsLib.getDocument({ url: src, cMapUrl: null })
    pdfDoc = await task.promise
    totalPages.value = pdfDoc.numPages

    await fitToWidth()
    await renderAll()
    pdfReady.value = true
  } catch (e) {
    console.error('[XPdfViewer] Error cargando PDF:', e)
    loadingMsg.value = 'Error al cargar el PDF'
  } finally {
    loading.value = false
  }
}

// --- Fit al ancho del contenedor ---
async function fitToWidth() {
  if (!pdfDoc || !containerRef.value) return
  const page      = await pdfDoc.getPage(1)
  const vp        = page.getViewport({ scale: 1.0 })
  const padding   = 48
  const available = containerRef.value.clientWidth - padding
  scale.value = Math.max(MIN_SCALE, Math.min(MAX_SCALE, available / vp.width))
}

// --- Renderizado ---
async function renderAll() {
  if (!pdfDoc || !pagesRef.value) return

  const gen = ++renderGen
  pagesRef.value.innerHTML = ''

  for (let i = 1; i <= totalPages.value; i++) {
    if (gen !== renderGen) return
    loadingMsg.value = `Renderizando página ${i} / ${totalPages.value}...`
    await renderPage(i, gen)
  }
  loadingMsg.value = ''
}

async function renderPage(pageNum, gen) {
  const page     = await pdfDoc.getPage(pageNum)
  const dpr      = window.devicePixelRatio || 1
  const viewport = page.getViewport({ scale: scale.value })

  const wrapper = document.createElement('div')
  wrapper.className = 'x-pdf-page-wrapper'
  wrapper.style.width  = `${viewport.width}px`
  wrapper.style.height = `${viewport.height}px`

  const canvas = document.createElement('canvas')
  const ctx    = canvas.getContext('2d')

  canvas.width  = Math.floor(viewport.width  * dpr)
  canvas.height = Math.floor(viewport.height * dpr)
  canvas.style.width  = `${viewport.width}px`
  canvas.style.height = `${viewport.height}px`
  ctx.scale(dpr, dpr)

  // Capa de texto para selección
  const textLayerDiv = document.createElement('div')
  textLayerDiv.className = 'x-pdf-text-layer'
  textLayerDiv.style.width  = `${viewport.width}px`
  textLayerDiv.style.height = `${viewport.height}px`
  // pdfjs 5+ usa `round(down, var(--total-scale-factor) * ...px, var(--scale-round-x))`
  // para posicionar los spans del text layer. Sin estas variables CSS, los spans
  // calculan posiciones inválidas y el área seleccionable NO coincide con el
  // texto visible del canvas. La regla equivalente para pdfjs 3.x/4.x es
  // --scale-factor; se setean ambas para compatibilidad.
  textLayerDiv.style.setProperty('--total-scale-factor', String(viewport.scale))
  textLayerDiv.style.setProperty('--scale-factor', String(viewport.scale))
  textLayerDiv.style.setProperty('--scale-round-x', '1px')
  textLayerDiv.style.setProperty('--scale-round-y', '1px')

  wrapper.appendChild(canvas)
  wrapper.appendChild(textLayerDiv)

  if (gen !== renderGen) return
  pagesRef.value.appendChild(wrapper)

  await page.render({ canvasContext: ctx, viewport }).promise

  // Renderizar texto encima del canvas
  // - pdfjs 5+: usa la clase TextLayer (la API renderTextLayer fue removida)
  // - pdfjs 3.x / 4.x: fallback a pdfjsLib.renderTextLayer({...}).promise
  try {
    const textContent = await page.getTextContent()
    if (pdfjsLib.TextLayer) {
      const tl = new pdfjsLib.TextLayer({
        textContentSource: textContent,
        container: textLayerDiv,
        viewport,
      })
      await tl.render()
    } else if (pdfjsLib.renderTextLayer) {
      const task = pdfjsLib.renderTextLayer({
        textContentSource: textContent,
        container: textLayerDiv,
        viewport,
      })
      await task.promise
    }
  } catch (e) {
    console.warn('[XPdfViewer] text layer render failed:', e)
  }
}

// --- Zoom ---
function zoomIn() {
  scale.value = parseFloat(Math.min(MAX_SCALE, scale.value + SCALE_STEP).toFixed(2))
  renderAll()
}

function zoomOut() {
  scale.value = parseFloat(Math.max(MIN_SCALE, scale.value - SCALE_STEP).toFixed(2))
  renderAll()
}

function zoomReset() {
  scale.value = 1.0
  renderAll()
}

async function zoomFit() {
  await fitToWidth()
  renderAll()
}

// --- Drag to pan ---
let drag = { active: false, x: 0, y: 0, sl: 0, st: 0 }

function startDrag(e) {
  if (e.button !== 0) return
  if (interactionMode.value !== 'pan') return
  const c = containerRef.value
  drag = { active: true, x: e.clientX, y: e.clientY, sl: c.scrollLeft, st: c.scrollTop }
  isDragging.value = true
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup',   endDrag)
}

function onDrag(e) {
  if (!drag.active) return
  const dx = e.clientX - drag.x
  const dy = e.clientY - drag.y
  containerRef.value.scrollLeft = drag.sl - dx
  containerRef.value.scrollTop  = drag.st - dy
}

function endDrag() {
  drag.active = false
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup',   endDrag)
}

// --- Ctrl + Rueda → Zoom ---
let wheelDebounce = null

function onWheel(e) {
  if (!e.ctrlKey) return
  e.preventDefault()

  const delta = e.deltaY < 0 ? SCALE_STEP : -SCALE_STEP
  scale.value = parseFloat(
    Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value + delta)).toFixed(2)
  )

  clearTimeout(wheelDebounce)
  wheelDebounce = setTimeout(renderAll, 150)
}

function onWheelNoCtrl(e) {
  if (e.ctrlKey) return
  showHint.value = true
  clearTimeout(hintTimeout)
  hintTimeout = setTimeout(() => { showHint.value = false }, 2000)
}

// --- Imprimir ---
async function printPdf() {
  if (!pdfDoc || printing.value) return
  printing.value = true

  const style = document.createElement('style')
  style.textContent = `
    @media print {
      body > *:not(#__pdf-print-area__) { display: none !important; }
      #__pdf-print-area__ {
        display: block !important;
        position: fixed; inset: 0; background: white; z-index: 99999;
      }
      #__pdf-print-area__ img {
        display: block; width: 100%; height: auto;
        page-break-after: always; page-break-inside: avoid;
      }
      #__pdf-print-area__ img:last-child { page-break-after: auto; }
    }
  `
  const area = document.createElement('div')
  area.id = '__pdf-print-area__'
  area.style.display = 'none'

  try {
    for (let i = 1; i <= totalPages.value; i++) {
      const page     = await pdfDoc.getPage(i)
      const viewport = page.getViewport({ scale: 2.5 })
      const canvas   = document.createElement('canvas')
      canvas.width   = viewport.width
      canvas.height  = viewport.height
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
      const img = document.createElement('img')
      img.src = canvas.toDataURL('image/jpeg', 0.92)
      area.appendChild(img)
    }

    document.head.appendChild(style)
    document.body.appendChild(area)
    await new Promise(r => setTimeout(r, 150))

    // Liberar el botón ANTES del diálogo (window.print es bloqueante en escritorio)
    printing.value = false
    window.print()
  } finally {
    printing.value = false
    document.head.contains(style) && document.head.removeChild(style)
    document.body.contains(area)  && document.body.removeChild(area)
  }
}

// --- Descargar ---
function downloadPdf() {
  const a    = document.createElement('a')
  a.href     = props.src
  a.download = props.filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// --- Ciclo de vida ---
onMounted(() => {
  containerRef.value.addEventListener('wheel', onWheel,       { passive: false })
  containerRef.value.addEventListener('wheel', onWheelNoCtrl, { passive: true  })
  if (props.src) loadPdf(props.src)
})

onBeforeUnmount(() => {
  containerRef.value?.removeEventListener('wheel', onWheel)
  containerRef.value?.removeEventListener('wheel', onWheelNoCtrl)
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup',   endDrag)
  clearTimeout(wheelDebounce)
  clearTimeout(hintTimeout)
  if (pdfDoc) pdfDoc.destroy()
})

watch(() => props.src, (src) => { if (src) loadPdf(src) })

defineExpose({ printPdf, downloadPdf, zoomIn, zoomOut, zoomFit, zoomReset })
</script>

<style scoped>
.x-pdf-viewer {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: #525659;
}

/* ── Toolbar ── */
.x-pdf-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 12px;
  background: #ffffff;
  flex-shrink: 0;
  user-select: none;
  font-family: 'Public Sans', 'Inter', sans-serif;
}

.x-pdf-toolbar--top {
  height: 50px;
  border-bottom: 1px solid #e5e7eb;
}

.x-pdf-toolbar--bottom {
  height: 40px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.x-pdf-toolbar--bottom .x-pdf-tb-btn {
  width: 32px;
  height: 32px;
}

.x-pdf-toolbar__group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.x-pdf-toolbar__sep {
  flex: 1;
}

.x-pdf-tb-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #4B5563;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.x-pdf-tb-btn:hover:not(:disabled) {
  background: rgba(26, 86, 219, 0.08);
  color: #1A56DB;
}

.x-pdf-tb-btn:active:not(:disabled) {
  background: rgba(26, 86, 219, 0.15);
}

.x-pdf-tb-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.x-pdf-tb-divider {
  width: 1px;
  height: 20px;
  background: #e5e7eb;
  margin: 0 6px;
  flex-shrink: 0;
}

.x-pdf-tb-btn--close:hover:not(:disabled) {
  background: #fee2e2;
  color: #E7000B;
}

.x-pdf-tb-btn--active {
  background: rgba(26, 86, 219, 0.10);
  color: #1A56DB;
}

.x-pdf-toolbar__filename {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  padding-left: 2px;
  flex-shrink: 1;
  min-width: 0;
}

.x-pdf-tb-spinner {
  display: inline-block;
  width: 15px;
  height: 15px;
  border: 2px solid #d1d5db;
  border-top-color: #1A56DB;
  border-radius: 50%;
  animation: x-pdf-spin 0.7s linear infinite;
  flex-shrink: 0;
}

.x-pdf-zoom-label {
  min-width: 52px;
  text-align: center;
  padding: 4px 8px;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 13px;
  font-family: 'Public Sans', 'Inter', sans-serif;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.x-pdf-zoom-label:hover {
  background: rgba(26, 86, 219, 0.05);
  border-color: #1A56DB;
  color: #1A56DB;
}

.x-pdf-page-info {
  font-size: 13px;
  color: #9ca3af;
  padding: 0 6px;
}

/* ── Área de páginas ── */
.x-pdf-pages-container {
  flex: 1;
  overflow: auto;
  cursor: grab;
  min-height: 0;
}

.x-pdf-pages-container.is-select {
  cursor: default;
  user-select: text;
}

.x-pdf-pages-container.is-dragging {
  cursor: grabbing;
}

.x-pdf-pages-container.is-loading {
  overflow: hidden;
}

.x-pdf-pages-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  gap: 16px;
  min-height: 100%;
}

/* ── Página individual ── */
:deep(.x-pdf-page-wrapper) {
  position: relative;
  flex-shrink: 0;
  border-radius: 2px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  background: white;
  overflow: hidden;
  line-height: 0;
}

:deep(.x-pdf-page-wrapper canvas) {
  display: block;
}

:deep(.x-pdf-text-layer) {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  line-height: 1;
  pointer-events: none;
  user-select: none;
  /* Defaults: el JS sobreescribe estos valores con viewport.scale por página */
  --scale-factor: 1;
  --total-scale-factor: 1;
  --scale-round-x: 1px;
  --scale-round-y: 1px;
}

.is-select :deep(.x-pdf-text-layer) {
  pointer-events: auto;
  user-select: text;
}

:deep(.x-pdf-text-layer span),
:deep(.x-pdf-text-layer br) {
  color: transparent;
  position: absolute;
  white-space: pre;
  cursor: text;
  transform-origin: 0% 0%;
  user-select: text;
}

:deep(.x-pdf-text-layer ::selection) {
  background: rgba(26, 86, 219, 0.25);
  color: transparent;
}

/* ── Loading overlay ── */
.x-pdf-loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(30, 30, 30, 0.85);
  color: #ccc;
  font-size: 14px;
  z-index: 10;
  pointer-events: none;
}

.x-pdf-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #444;
  border-top-color: #4a90e2;
  border-radius: 50%;
  animation: x-pdf-spin 0.8s linear infinite;
}

@keyframes x-pdf-spin {
  to { transform: rotate(360deg); }
}

/* ── Hint Ctrl+Scroll ── */
.x-pdf-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: #eee;
  font-size: 12px;
  padding: 7px 14px;
  border-radius: 20px;
  pointer-events: none;
  white-space: nowrap;
  z-index: 20;
}

/* ── Transiciones ── */
.x-pdf-fade-enter-active,
.x-pdf-fade-leave-active {
  transition: opacity 0.25s;
}

.x-pdf-fade-enter-from,
.x-pdf-fade-leave-to {
  opacity: 0;
}
</style>
