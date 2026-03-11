<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { api } from 'src/services/api'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs'
import XDialog from 'components/XDialog/XDialog.vue'

// Configurar worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).href

const props = defineProps({
  src: { type: String, default: '' },
  title: { type: String, default: 'Documento PDF' },
  width: { type: String, default: '50vw' },
})

const isDialogOpen = ref(false)
const isLoading = ref(false)
const isRendering = ref(false)
const currentPage = ref(1)
const totalPages = ref(0)
const zoom = ref(1)
const scrollRef = ref(null)
const canvasRef = ref(null)
const hasPdf = ref(false)

let pdfDoc = null
let renderTask = null
let baseWidth = 800 // Ancho base capturado al abrir (no cambia con zoom)
let loadId = 0 // Evita ejecuciones duplicadas de handleOpen

const showOverlay = computed(() => isLoading.value || isRendering.value)

const openDialog = () => {
  isLoading.value = true
  isRendering.value = true
  hasPdf.value = false
  currentPage.value = 1
  totalPages.value = 0
  zoom.value = 1
  isDialogOpen.value = true
}

const closeDialog = () => {
  isDialogOpen.value = false
}

const captureBaseWidth = () => {
  const el = scrollRef.value?.$el || scrollRef.value
  if (el) baseWidth = el.clientWidth - 8
}

const renderPage = async (pageNum) => {
  if (!pdfDoc || !canvasRef.value) return

  // Cancelar render previo
  if (renderTask) {
    renderTask.cancel()
    renderTask = null
  }

  isRendering.value = true

  try {
    const page = await pdfDoc.getPage(pageNum)
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')

    // Calcular escala para llenar el ancho disponible
    const baseViewport = page.getViewport({ scale: 1 })
    const baseScale = (baseWidth * zoom.value) / baseViewport.width

    // Multiplicar por devicePixelRatio para nitidez
    const dpr = window.devicePixelRatio || 1
    const scale = baseScale * dpr
    const viewport = page.getViewport({ scale })

    // Canvas interno a alta resolucion
    canvas.width = viewport.width
    canvas.height = viewport.height

    // CSS al tamaño visual
    canvas.style.width = Math.round(viewport.width / dpr) + 'px'
    canvas.style.height = Math.round(viewport.height / dpr) + 'px'

    renderTask = page.render({ canvasContext: ctx, viewport })
    await renderTask.promise
    renderTask = null
  } catch (e) {
    if (e?.name !== 'RenderingCancelledException') {
      console.error('Error rendering PDF page:', e)
    }
  } finally {
    isRendering.value = false
  }
}

const handleOpen = async () => {
  if (!props.src) return
  const myId = ++loadId

  isLoading.value = true
  isRendering.value = true
  currentPage.value = 1
  totalPages.value = 0
  zoom.value = 1

  // Limpiar documento previo
  if (pdfDoc) {
    pdfDoc.destroy()
    pdfDoc = null
  }

  try {
    const response = await api.get(props.src, { responseType: 'arraybuffer' })
    if (myId !== loadId) return // Otra llamada lo reemplazo

    const data = new Uint8Array(response.data)
    pdfDoc = await pdfjsLib.getDocument({ data }).promise
    if (myId !== loadId) return

    totalPages.value = pdfDoc.numPages
    hasPdf.value = true
    isLoading.value = false

    await nextTick()
    captureBaseWidth()
    await renderPage(1)
  } catch {
    if (myId !== loadId) return
    pdfDoc = null
    hasPdf.value = false
    isRendering.value = false
    isLoading.value = false
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    renderPage(currentPage.value)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    renderPage(currentPage.value)
  }
}

const zoomIn = () => {
  if (zoom.value < 2) {
    zoom.value = Math.round((zoom.value + 0.25) * 100) / 100
    renderPage(currentPage.value)
  }
}

const zoomOut = () => {
  if (zoom.value > 0.5) {
    zoom.value = Math.round((zoom.value - 0.25) * 100) / 100
    renderPage(currentPage.value)
  }
}

const zoomPercent = () => Math.round(zoom.value * 100)

const downloadPdf = () => {
  if (!props.src) return
  api
    .get(props.src, { responseType: 'blob' })
    .then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${props.title || 'documento'}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    })
    .catch(() => {})
}

const printPdf = () => {
  if (!props.src) return
  api
    .get(props.src, { responseType: 'blob' })
    .then((response) => {
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = url
      document.body.appendChild(iframe)
      iframe.onload = () => {
        iframe.contentWindow.print()
        setTimeout(() => {
          document.body.removeChild(iframe)
          window.URL.revokeObjectURL(url)
        }, 1000)
      }
    })
    .catch(() => {})
}

watch(
  () => props.src,
  (newSrc) => {
    if (newSrc && isDialogOpen.value) handleOpen()
  },
)

onBeforeUnmount(() => {
  if (renderTask) renderTask.cancel()
  if (pdfDoc) pdfDoc.destroy()
})

defineExpose({ openDialog })
</script>

<template>
  <x-dialog
    v-model="isDialogOpen"
    :title="title"
    :width="width"
    :loading="showOverlay"
    show-button-close
    @action-button-close="closeDialog"
    @before-show="handleOpen"
  >
    <template #content-header>
      <div class="x-pdf-toolbar">
        <div class="x-pdf-toolbar__nav">
          <q-btn flat dense round icon="fal fa-chevron-left" size="sm" :disable="currentPage <= 1 || showOverlay" @click="prevPage" />
          <span class="x-pdf-toolbar__page-info">{{ currentPage }} / {{ totalPages || '...' }}</span>
          <q-btn flat dense round icon="fal fa-chevron-right" size="sm" :disable="currentPage >= totalPages || showOverlay" @click="nextPage" />
        </div>
        <q-separator vertical class="q-mx-sm" />
        <div class="x-pdf-toolbar__zoom">
          <q-btn flat dense round icon="fal fa-minus" size="sm" :disable="zoom <= 0.5" @click="zoomOut" />
          <span class="x-pdf-toolbar__zoom-info">{{ zoomPercent() }}%</span>
          <q-btn flat dense round icon="fal fa-plus" size="sm" :disable="zoom >= 2" @click="zoomIn" />
        </div>
        <q-space />
        <q-btn flat dense round icon="fal fa-print" size="sm" @click="printPdf">
          <q-tooltip>{{ $t('common.print') }}</q-tooltip>
        </q-btn>
        <q-btn flat dense round icon="fal fa-download" size="sm" @click="downloadPdf">
          <q-tooltip>{{ $t('common.download') }}</q-tooltip>
        </q-btn>
      </div>
    </template>

    <template #content>
      <div ref="scrollRef" class="x-pdf-scroll">
        <!-- Canvas del PDF -->
        <div v-if="hasPdf || isLoading" class="x-pdf-viewer__container">
          <canvas ref="canvasRef" />
        </div>

        <!-- Sin PDF -->
        <div v-else class="x-pdf-viewer__empty">
          <q-icon name="fal fa-file-pdf" size="48px" color="grey-5" />
          <div class="text-grey-6 q-mt-sm">{{ $t('components.pdfLoadError') }}</div>
        </div>
      </div>
    </template>
  </x-dialog>
</template>
