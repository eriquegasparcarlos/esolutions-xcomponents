<script setup>
import { ref } from 'vue'
import XDialog from '../XDialog/XDialog.vue'
import XPdfViewer from '../XPdfViewer/XPdfViewer.vue'

/**
 * XPdfPreview — diálogo de previsualización de PDF (right full-height).
 *
 * Envuelve XPdfViewer con todo lo que siempre lo acompaña: el XDialog lateral,
 * la carga del PDF, spinner/error y el CSS de altura (flex:1 + min-height:0).
 * El componente NO hace HTTP por su cuenta: el consumidor entrega un `fetcher`
 * (así cada app usa su axios con Bearer/interceptores).
 *
 * Uso:
 *   const refPdf = ref(null)
 *   refPdf.value.open({
 *     title:    'Traslado T001-25',
 *     filename: 'traslado.pdf',
 *     formats:  [{ value: 'a4', label: 'A4' }, { value: 'ticket', label: 'Ticket' }], // opcional
 *     fetcher:  async (format) => (await axios.get(url, { params: { format }, responseType: 'blob' })).data,
 *   })
 *
 * `fetcher(format)` puede resolver un Blob (se convierte a object URL) o un
 * string (URL directa, p. ej. firmada). Cambiar de formato re-invoca el fetcher.
 */

const visible      = ref(false)
const loading      = ref(false)
const errorMsg     = ref('')
const src          = ref('')
const title        = ref('Documento')
const filename     = ref('documento.pdf')
const formats      = ref([])
const activeFormat = ref(null)

let fetcher = null

async function open(opts = {}) {
  fetcher            = opts.fetcher ?? null
  title.value        = opts.title ?? 'Documento'
  filename.value     = opts.filename ?? 'documento.pdf'
  formats.value      = opts.formats ?? []
  activeFormat.value = formats.value[0]?.value ?? null
  errorMsg.value     = ''
  releaseSrc()
  visible.value = true
  await load()
}

/** Re-pide el PDF con el formato activo (p. ej. tras cambiar parámetros). */
async function reload() {
  await load()
}

defineExpose({ open, reload })

async function load() {
  if (!fetcher) return
  loading.value = true
  errorMsg.value = ''
  releaseSrc()
  try {
    const result = await fetcher(activeFormat.value)
    src.value = typeof result === 'string'
      ? result
      : URL.createObjectURL(result)
  } catch {
    errorMsg.value = 'No se pudo generar el PDF.'
  } finally {
    loading.value = false
  }
}

function onFormatChange(fmt) {
  activeFormat.value = fmt
  load()
}

function releaseSrc() {
  if (src.value && src.value.startsWith('blob:')) URL.revokeObjectURL(src.value)
  src.value = ''
}

function close() {
  visible.value = false
  releaseSrc()
}
</script>

<template>
  <XDialog
    v-model="visible"
    :title="title"
    width="820px"
    position="right"
    is-full-height
    content-flush
    show-button-close
    @action-button-close="close"
    @cancel="close"
  >
    <template #content>
      <div class="x-pdf-preview__content">
        <div v-if="errorMsg" class="x-pdf-preview__fill x-pdf-preview__error">{{ errorMsg }}</div>
        <XPdfViewer
          v-else-if="src"
          :src="src"
          :filename="filename"
          :formats="formats"
          :active-format="activeFormat"
          :show-header="false"
          @update:active-format="onFormatChange"
        />
        <div v-else class="x-pdf-preview__fill">
          <q-spinner size="32px" color="primary" />
        </div>
      </div>
    </template>
  </XDialog>
</template>

<style scoped>
.x-pdf-preview__content {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.x-pdf-preview__fill {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.x-pdf-preview__error {
  color: var(--q-negative, #c10015);
}
/* XPdfViewer no fija altura propia: flex:1 + min-height:0 (requisito documentado) */
.x-pdf-preview__content :deep(.x-pdf-viewer) {
  flex: 1;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
