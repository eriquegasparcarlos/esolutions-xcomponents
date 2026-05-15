<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useQuasar } from 'quasar'
import Cropper from 'cropperjs/dist/cropper.esm.js'
import 'cropperjs/dist/cropper.min.css'
import XDialog from '../XDialog/XDialog.vue'
import XButton from '../XButton/XButton.vue'
import XLoading from '../XLoading/XLoading.vue'

defineOptions({ name: 'XImageCropperUpload' })

const props = defineProps({
  previewUrl: { type: String,  default: null },
  label:      { type: String,  default: 'Click para subir imagen' },
  hint:       { type: String,  default: null },
  accept:     { type: String,  default: 'image/png,image/jpeg,image/webp,image/svg+xml' },
  maxSizeMb:  { type: Number,  default: 2 },
  withCrop:   { type: Boolean, default: true },
  /**
   * 'inline' — fila con thumbnail + texto + botón limpiar (default)
   * 'card'   — imagen completa con overlay Cambiar / Eliminar
   */
  variant:    { type: String,  default: 'inline' },
  /** Solo para variant="card": mostrar spinner sobre la imagen */
  loading:    { type: Boolean, default: false },
  /** Solo para variant="card": altura del contenedor */
  height:     { type: String,  default: '200px' },
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
  nextTick(() => {
    if (!cropImageEl.value) return
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
  e?.stopPropagation()
  if (localPreview.value) {
    localBlob.value    = null
    localPreview.value = null
    emit('change', null)
  } else {
    emit('remove')
  }
}

// ── Expose ──
defineExpose({ blob: localBlob, triggerFileInput })
</script>

<template>
  <div>
    <!-- ═══════════════════════════════════════
         VARIANT: inline (fila con thumbnail)
    ═══════════════════════════════════════ -->
    <template v-if="variant === 'inline'">
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
    </template>

    <!-- ═══════════════════════════════════════
         VARIANT: card (imagen completa + overlay)
    ═══════════════════════════════════════ -->
    <template v-else-if="variant === 'card'">
      <!-- Con imagen: overlay Cambiar / Eliminar -->
      <div v-if="displayUrl" class="x-icu-card" :style="{ height }">
        <img :src="displayUrl" class="x-icu-card__img" />
        <div class="x-icu-card__overlay">
          <div class="x-icu-card__actions">
            <div class="x-icu-card__action" @click="triggerFileInput">
              <q-icon name="fal fa-pen" size="18px" color="white" />
              <span>Cambiar</span>
            </div>
            <div class="x-icu-card__action x-icu-card__action--delete" @click="onRemove">
              <q-icon name="fal fa-trash" size="18px" color="white" />
              <span>Eliminar</span>
            </div>
          </div>
        </div>
        <x-loading :loading="loading" />
      </div>

      <!-- Sin imagen: zona de upload centrada -->
      <div v-else class="x-icu-card x-icu-card--empty" :style="{ height }" @click="triggerFileInput">
        <q-icon name="fa-light fa-image" size="36px" color="grey-5" />
        <div class="x-icu-card__empty-label">{{ label }}</div>
        <div class="x-icu-card__empty-hint">{{ hintText }}</div>
      </div>
    </template>

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
/* ─── Variant: inline ─── */
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

/* ─── Variant: card ─── */
.x-icu-card {
  position: relative;
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  background: #f3f4f6;
}
.x-icu-card__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.x-icu-card__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}
.x-icu-card:hover .x-icu-card__overlay {
  opacity: 1;
}
.x-icu-card__actions {
  display: flex;
  gap: 16px;
}
.x-icu-card__action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: white;
  font-size: 13px;
  font-weight: 500;
  padding: 10px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  transition: background 0.15s;
}
.x-icu-card__action:hover {
  background: rgba(255, 255, 255, 0.28);
}
.x-icu-card__action--delete:hover {
  background: rgba(220, 38, 38, 0.7);
}

/* Sin imagen */
.x-icu-card--empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  border: 2px dashed #d1d5db;
  transition: border-color 0.2s;
}
.x-icu-card--empty:hover {
  border-color: var(--q-primary);
}
.x-icu-card__empty-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}
.x-icu-card__empty-hint {
  font-size: 12px;
  color: #9ca3af;
}
</style>
