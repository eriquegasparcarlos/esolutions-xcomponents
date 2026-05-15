<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useQuasar } from 'quasar'
import XDialog from '../XDialog/XDialog.vue'
import XButton from '../XButton/XButton.vue'

defineOptions({ name: 'XImageCropperUpload' })

const props = defineProps({
  previewUrl: { type: String,  default: null },
  label:      { type: String,  default: 'Click para subir imagen' },
  hint:       { type: String,  default: null },
  accept:     { type: String,  default: 'image/png,image/jpeg,image/webp,image/svg+xml' },
  maxSizeMb:  { type: Number,  default: 2 },
  withCrop:   { type: Boolean, default: true },
})

const emit = defineEmits(['change', 'remove'])

const $q = useQuasar()

const fileInput        = ref(null)
const cropImageSrc     = ref(null)
const cropImageEl      = ref(null)
const cropperInstance  = ref(null)
const showCropDialog   = ref(false)
const localBlob        = ref(null)
const localPreview     = ref(null)

const displayUrl = computed(() => localPreview.value || props.previewUrl || null)

const hintText = computed(() => {
  if (props.hint) return props.hint
  const exts = props.accept.split(',').map(t => {
    t = t.trim()
    return t.startsWith('image/') ? t.replace('image/', '').toUpperCase() : t.replace('.', '').toUpperCase()
  }).join(', ')
  return `${exts}. Máx. ${props.maxSizeMb}MB.`
})

// ── File selection ──
const triggerFileInput = () => fileInput.value?.click()

const onFileSelected = (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  const accepted = props.accept.split(',').map(t => t.trim())
  const validType = accepted.some(t =>
    t.startsWith('.') ? file.name.toLowerCase().endsWith(t) : file.type === t
  )
  if (!validType) {
    $q.notify({ type: 'warning', message: 'Formato no soportado.' })
    e.target.value = ''
    return
  }
  if (file.size > props.maxSizeMb * 1024 * 1024) {
    $q.notify({ type: 'warning', message: `La imagen no debe superar los ${props.maxSizeMb}MB.` })
    e.target.value = ''
    return
  }

  // SVG o sin crop: usar directo
  if (!props.withCrop || file.type === 'image/svg+xml') {
    localBlob.value    = file
    localPreview.value = URL.createObjectURL(file)
    emit('change', file)
    e.target.value = ''
    return
  }

  // Con crop: abrir diálogo
  const reader = new FileReader()
  reader.onload = (ev) => {
    cropImageSrc.value  = ev.target.result
    showCropDialog.value = true
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}

// ── Cropper ──
const initCropper = () => {
  if (cropperInstance.value) {
    cropperInstance.value.destroy()
    cropperInstance.value = null
  }
  nextTick(async () => {
    if (!cropImageEl.value) return
    const { default: Cropper } = await import('cropperjs')
    await import('cropperjs/dist/cropper.min.css')
    cropperInstance.value = new Cropper(cropImageEl.value, {
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 1,
      background: false,
      guides: true,
    })
  })
}

watch(showCropDialog, (val) => {
  if (val) nextTick(() => nextTick(() => initCropper()))
})

const confirmCrop = () => {
  if (!cropperInstance.value) return
  cropperInstance.value.getCroppedCanvas({
    maxWidth: 600,
    maxHeight: 600,
    imageSmoothingQuality: 'high',
  }).toBlob((blob) => {
    localBlob.value    = blob
    localPreview.value = URL.createObjectURL(blob)
    emit('change', blob)
    cancelCrop()
  }, 'image/png')
}

const cancelCrop = () => {
  if (cropperInstance.value) {
    cropperInstance.value.destroy()
    cropperInstance.value = null
  }
  showCropDialog.value = false
  cropImageSrc.value   = null
}

// ── Remove ──
const onRemove = (e) => {
  e.stopPropagation()
  if (localPreview.value) {
    // Solo preview local, limpiar sin confirmar
    localBlob.value    = null
    localPreview.value = null
    emit('change', null)
  } else {
    // Imagen guardada en servidor — el padre decide qué hacer
    emit('remove')
  }
}

// ── Expose blob para FormData ──
defineExpose({ blob: localBlob })
</script>

<template>
  <div>
    <div class="x-image-cropper-upload" @click="triggerFileInput">
      <!-- Thumbnail -->
      <div class="x-image-cropper-upload__thumb">
        <img v-if="displayUrl" :src="displayUrl" class="x-image-cropper-upload__img" />
        <q-icon v-else name="fa-light fa-image" size="28px" color="grey-5" />
      </div>

      <!-- Texto -->
      <div class="col">
        <div class="x-image-cropper-upload__label">{{ label }}</div>
        <div class="x-image-cropper-upload__hint">{{ hintText }}</div>
      </div>

      <!-- Botón limpiar -->
      <q-btn
        v-if="displayUrl"
        flat round dense
        icon="fa-light fa-xmark"
        size="sm"
        color="grey-6"
        @click="onRemove"
      />
    </div>

    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      style="display: none;"
      @change="onFileSelected"
    />
  </div>

  <!-- Diálogo de recorte -->
  <x-dialog
    v-model="showCropDialog"
    title="Recortar imagen"
    width="550px"
    show-button-close
    @action-button-close="cancelCrop"
  >
    <template #content>
      <div style="max-height: 400px; overflow: hidden; border-radius: 8px; background: #f3f4f6;">
        <img
          v-if="cropImageSrc"
          ref="cropImageEl"
          :src="cropImageSrc"
          style="max-width: 100%; display: block;"
        />
      </div>
    </template>
    <template #action-buttons>
      <x-button flat label="Cancelar" @click="cancelCrop" />
      <x-button variant="primary" label="Recortar" @click="confirmCrop" />
    </template>
  </x-dialog>
</template>

<style scoped>
.x-image-cropper-upload {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.x-image-cropper-upload:hover {
  border-color: var(--q-primary);
}
.x-image-cropper-upload__thumb {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.x-image-cropper-upload__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.x-image-cropper-upload__label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}
.x-image-cropper-upload__hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}
</style>
