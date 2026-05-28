<script setup>
import { computed, ref } from 'vue'
import { copyToClipboard, useQuasar } from 'quasar'

defineOptions({
  name: 'XTokenDisplay',
  inheritAttrs: false,
})

const props = defineProps({
  /** El token / api key / secret a mostrar */
  token: {
    type: String,
    default: '',
  },
  /** Tamano de cada chunk (caracteres por bloque separado por espacio) */
  chunkSize: {
    type: Number,
    default: 8,
  },
  /** Mostrar boton de ojo (toggle visible/oculto) */
  showToggle: {
    type: Boolean,
    default: false,
  },
  /** Mostrar boton de copia */
  copyButton: {
    type: Boolean,
    default: true,
  },
  /** Caracter usado cuando esta oculto */
  hiddenChar: {
    type: String,
    default: '•',
  },
  /** Estado inicial: visible o no */
  initiallyVisible: {
    type: Boolean,
    default: false,
  },
  /** Label opcional arriba del display */
  label: {
    type: String,
    default: '',
  },
  /** Mensaje al copiar (notify success) */
  copyMessage: {
    type: String,
    default: 'Copiado al portapapeles',
  },
  /** Mensaje al fallar el copy */
  copyErrorMessage: {
    type: String,
    default: 'No se pudo copiar',
  },
})

const emit = defineEmits(['copy', 'copy-error', 'toggle-visibility'])

const $q = useQuasar()
const visible = ref(props.initiallyVisible)

/**
 * Token formateado con chunks de N chars + espacios.
 * Wrap garantizado en mobile real (espacios reales = puntos de break).
 */
const formattedToken = computed(() => {
  const t = visible.value
    ? (props.token || '')
    : props.hiddenChar.repeat(props.token?.length || 64)
  const regex = new RegExp(`.{1,${props.chunkSize}}`, 'g')
  return t.match(regex)?.join(' ') ?? t
})

function toggleVisibility() {
  visible.value = !visible.value
  emit('toggle-visibility', visible.value)
}

function copy() {
  if (!props.token) return
  copyToClipboard(props.token)
    .then(() => {
      $q.notify({ type: 'positive', message: props.copyMessage })
      emit('copy')
    })
    .catch(() => {
      $q.notify({ type: 'negative', message: props.copyErrorMessage })
      emit('copy-error')
    })
}

const hasHeader = computed(() => props.label || props.copyButton || props.showToggle)
</script>

<template>
  <div class="x-token-display" v-bind="$attrs">
    <div v-if="hasHeader" class="x-token-display__header">
      <span v-if="label" class="x-token-display__label">{{ label }}</span>
      <div class="x-token-display__actions">
        <q-icon
          v-if="showToggle"
          :name="visible ? 'fa-light fa-eye-slash' : 'fa-light fa-eye'"
          size="16px"
          class="x-token-display__btn cursor-pointer"
          @click="toggleVisibility"
        >
          <q-tooltip>{{ visible ? 'Ocultar' : 'Mostrar' }}</q-tooltip>
        </q-icon>
        <q-icon
          v-if="copyButton"
          name="fa-light fa-copy"
          size="16px"
          class="x-token-display__btn cursor-pointer"
          @click="copy"
        >
          <q-tooltip>Copiar</q-tooltip>
        </q-icon>
      </div>
    </div>
    <div class="x-token-display__value">{{ formattedToken }}</div>
  </div>
</template>
