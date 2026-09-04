<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { ic } from '../icons/index.js'

defineOptions({ name: 'XImageUpload' })

const props = defineProps({
  modelValue:  { type: File,   default: null },
  previewUrl:  { type: String, default: '' },
  label:       { type: String, default: 'Click para subir imagen' },
  hint:        { type: String, default: '' },
  accept:      { type: String, default: 'image/png,image/jpeg,image/webp,image/svg+xml' },
  maxSizeMb:   { type: Number, default: 2 },

  /*
  | Permite BORRAR la imagen ya guardada (la de `previewUrl`), no solo descartar el archivo
  | recién elegido.
  |
  | Son dos acciones distintas y antes solo existía la primera: el consumidor que necesitaba
  | la segunda —borrarla del servidor— tenía que poner un botón propio al lado, y mientras
  | había un archivo pendiente se veían las dos equis juntas, con significados distintos.
  |
  | El componente no borra nada por su cuenta: emite `remove` y quien lo usa decide (llamar a
  | su API, limpiar el estado). `removeLabel` es el texto del confirm, para que se pueda
  | decir "Quitar el logo" en vez de un genérico.
  */
  deletable:   { type: Boolean, default: false },
  removeLabel: { type: String, default: 'Quitar la imagen guardada' },
})

const emit = defineEmits(['update:modelValue', 'remove'])

const $q      = useQuasar()
const fileInput = ref(null)

const displayUrl = computed(() => {
  if (props.modelValue) return URL.createObjectURL(props.modelValue)
  return props.previewUrl || ''
})

const hintText = computed(() => {
  if (props.hint) return props.hint
  const exts = props.accept.split(',').map(t => {
    t = t.trim()
    return t.startsWith('image/') ? t.replace('image/', '').toUpperCase() : t.replace('.', '').toUpperCase()
  }).join(', ')
  return `${exts}. Máx. ${props.maxSizeMb}MB.`
})

function triggerFileInput() {
  fileInput.value?.click()
}

function onFileSelected(e) {
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

  emit('update:modelValue', file)
  e.target.value = ''
}

/** Descarta el archivo recién elegido; la imagen guardada no se toca. */
function clear(e) {
  e.stopPropagation()
  emit('update:modelValue', null)
}

/**
 * Borra la imagen guardada. Solo se ofrece cuando NO hay un archivo pendiente: con uno
 * elegido, guardar va a reemplazar la anterior de todos modos, y mostrar las dos acciones a
 * la vez son dos equis que significan cosas distintas.
 */
const canRemove = computed(() => props.deletable && !props.modelValue && !!props.previewUrl)

function remove(e) {
  e.stopPropagation()
  emit('remove')
}
</script>

<template>
  <div>
    <div class="x-image-upload" @click="triggerFileInput">
      <!-- Thumbnail -->
      <div class="x-image-upload__thumb">
        <img v-if="displayUrl" :src="displayUrl" class="x-image-upload__img" />
        <q-icon v-else :name="ic('image')" size="28px" color="grey-5" />
      </div>

      <!-- Texto -->
      <div class="col">
        <div class="x-image-upload__label">{{ label }}</div>
        <div class="x-image-upload__hint">{{ hintText }}</div>
      </div>

      <!-- Descartar el archivo recién elegido -->
      <q-btn
        v-if="modelValue"
        flat round dense
        :icon="ic('remove')"
        size="sm"
        color="grey-6"
        @click="clear"
      >
        <q-tooltip>Descartar el archivo elegido</q-tooltip>
      </q-btn>

      <!-- Borrar la imagen ya guardada (opt-in con `deletable`) -->
      <q-btn
        v-if="canRemove"
        flat round dense
        :icon="ic('delete')"
        size="sm"
        color="negative"
        @click="remove"
      >
        <q-tooltip>{{ removeLabel }}</q-tooltip>
      </q-btn>
    </div>

    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      style="display: none;"
      @change="onFileSelected"
    />
  </div>
</template>

<style scoped>
.x-image-upload {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.x-image-upload:hover {
  border-color: var(--q-primary);
}
.x-image-upload__thumb {
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
.x-image-upload__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.x-image-upload__label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}
.x-image-upload__hint {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}
</style>
