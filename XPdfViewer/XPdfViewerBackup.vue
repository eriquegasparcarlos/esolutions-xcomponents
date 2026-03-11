<script setup>
import { ref, onMounted, watch, getCurrentInstance } from 'vue'
import {
  QBtn,
  QToolbar,
  QToolbarTitle,
  QSpace,
  useQuasar
} from 'quasar'

// import * as pdfjsLib from 'pdfjs-dist'
// import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?worker'

import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?worker'

// pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker()

// ✅ Asignar correctamente el worker para Vite
pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker()

const $q = useQuasar()
const { proxy } = getCurrentInstance()

const props = defineProps({
  src: { type: String, required: true } // URL relativa para proxy.$api
})

// Refs
const canvasRef = ref(null)
const pdfDoc = ref(null)
const currentPage = ref(1)
const totalPages = ref(0)
const scale = ref(1.2)

// Renderiza la página actual del PDF
const renderPage = async () => {
  const page = await pdfDoc.value.getPage(currentPage.value)
  const viewport = page.getViewport({ scale: scale.value })

  const canvas = canvasRef.value
  const context = canvas.getContext('2d')
  canvas.height = viewport.height
  canvas.width = viewport.width

  await page.render({ canvasContext: context, viewport }).promise
}

// Carga el PDF como blob y lo convierte a ArrayBuffer para PDF.js v5
const loadPdfWithBlob = async () => {
  try {
    const response = await proxy.$api.get(props.src, {
      responseType: 'blob'
    })

    const arrayBuffer = await response.data.arrayBuffer()

    pdfDoc.value = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    totalPages.value = pdfDoc.value.numPages
    currentPage.value = 1
    await renderPage()
  } catch (error) {
    console.error('Error al cargar el PDF:', error)
    $q.notify({
      color: 'negative',
      message: 'No se pudo cargar el PDF',
      icon: 'warning'
    })
  }
}

// Navegación y zoom
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    renderPage()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    renderPage()
  }
}

const zoomIn = () => {
  scale.value += 0.2
  renderPage()
}

const zoomOut = () => {
  if (scale.value > 0.4) {
    scale.value -= 0.2
    renderPage()
  }
}

onMounted(loadPdfWithBlob)
watch(() => props.src, loadPdfWithBlob)
</script>

<template>
  <div class="column full-width q-pa-md">
    <!-- Toolbar superior -->
    <q-toolbar class="bg-grey-2 text-primary shadow-1 rounded-borders q-mb-md">
      <q-btn flat icon="chevron_left" @click="prevPage" :disable="currentPage <= 1" />
      <q-btn flat icon="chevron_right" @click="nextPage" :disable="currentPage >= totalPages" />
      <q-btn flat icon="zoom_out" @click="zoomOut" />
      <q-btn flat icon="zoom_in" @click="zoomIn" />
      <q-toolbar-title>
        Página {{ currentPage }} de {{ totalPages }}
      </q-toolbar-title>
      <q-space />
    </q-toolbar>

    <!-- Área del visor -->
    <div style="overflow: auto; text-align: center;">
      <canvas ref="canvasRef" style="max-width: 100%; border: 1px solid #ccc;" />
    </div>
  </div>
</template>
