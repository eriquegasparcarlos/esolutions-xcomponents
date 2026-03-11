<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { api } from 'src/services/api'
import VuePdfEmbed from 'vue-pdf-embed'
import XDialog from 'components/XDialog/XDialog.vue'

const props = defineProps({
  src: { type: String, default: '' },
  title: { type: String, default: 'Documento PDF' },
  width: { type: String, default: '50vw' },
})

const isDialogOpen = ref(false)
const isLoading = ref(false)
const isRendering = ref(false)
const pdfSource = ref(null)
const currentPage = ref(1)
const totalPages = ref(0)
const zoom = ref(1)
const scrollRef = ref(null)

const showOverlay = computed(() => isLoading.value || isRendering.value)

const pdfWidth = computed(() => {
  const el = scrollRef.value?.$el || scrollRef.value
  if (!el) return 800
  const available = el.clientWidth - 8
  return Math.round(available * zoom.value)
})

const openDialog = () => {
  isDialogOpen.value = true
}

const closeDialog = () => {
  isDialogOpen.value = false
}

const handleOpen = async () => {
  if (!props.src) return
  isLoading.value = true
  isRendering.value = true
  currentPage.value = 1
  totalPages.value = 0
  zoom.value = 1

  try {
    const response = await api.get(props.src, { responseType: 'arraybuffer' })
    await nextTick()
    pdfSource.value = new Uint8Array(response.data)
  } catch {
    pdfSource.value = null
    isRendering.value = false
  } finally {
    isLoading.value = false
  }
}

const onLoaded = (pdf) => {
  if (pdf?.numPages) {
    totalPages.value = pdf.numPages
  }
}

const onRendered = () => {
  isRendering.value = false
}

const prevPage = () => {
  if (currentPage.value > 1) {
    isRendering.value = true
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    isRendering.value = true
    currentPage.value++
  }
}

const zoomIn = () => {
  if (zoom.value < 2) zoom.value = Math.round((zoom.value + 0.25) * 100) / 100
}

const zoomOut = () => {
  if (zoom.value > 0.5) zoom.value = Math.round((zoom.value - 0.25) * 100) / 100
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

defineExpose({ openDialog })
</script>

<template>
  <x-dialog
    v-model="isDialogOpen"
    :title="title"
    :width="width"
    :loading="showOverlay"
    is-full-height
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
          <q-tooltip>Imprimir</q-tooltip>
        </q-btn>
        <q-btn flat dense round icon="fal fa-download" size="sm" @click="downloadPdf">
          <q-tooltip>Descargar</q-tooltip>
        </q-btn>
      </div>
    </template>

    <template #content>
      <div ref="scrollRef" class="x-pdf-scroll" :class="{ 'x-pdf-scroll--zoomed': zoom > 1 }">
        <!-- PDF -->
        <div v-if="pdfSource" class="x-pdf-viewer__container" :class="{ 'x-pdf-viewer__container--ready': !showOverlay }">
          <vue-pdf-embed
            :source="pdfSource"
            :page="currentPage"
            :width="pdfWidth"
            @loaded="onLoaded"
            @rendered="onRendered"
          />
        </div>

        <!-- Sin PDF -->
        <div v-else-if="!isLoading" class="x-pdf-viewer__empty">
          <q-icon name="fal fa-file-pdf" size="48px" color="grey-5" />
          <div class="text-grey-6 q-mt-sm">No se pudo cargar el PDF</div>
        </div>
      </div>
    </template>
  </x-dialog>
</template>
