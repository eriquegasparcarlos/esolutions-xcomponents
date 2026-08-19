<script setup>
import { ref, computed } from 'vue'
import XDialog from '../XDialog/XDialog.vue'
import XInput from '../XInput/XInput.vue'
import XButton from '../XButton/XButton.vue'
import { ic } from '../icons/index.js'

/**
 * Diálogo de confirmación con el diseño de XDialogAction, pero SIN acoplarse al
 * backend: el contenido viene por `open(config)` (o del propio botón del backend),
 * y al confirmar NO llama al servidor — ejecuta el callback `onConfirm` del padre,
 * de modo que se hace UNA sola request (el delete/toggle real).
 *
 * Soporta 3 niveles de fricción:
 *  - simple: solo confirmar.
 *  - escribir-para-confirmar (`requireText`): el botón se habilita al escribir el texto.
 *  - password (`requirePassword`): input de contraseña; su valor va en el callback
 *    (el padre lo manda en el mismo POST → el backend valida y ejecuta a la vez).
 *
 * Config (por `open(config)` o props):
 *  { variant, icon, title, message, confirmLabel, cancelLabel,
 *    requireText, requirePassword, passwordLabel, onConfirm({ password }) }
 */
defineOptions({ name: 'XConfirmAction', inheritAttrs: false })

const emit = defineEmits(['confirm', 'cancel'])

const isOpen = ref(false)
const loading = ref(false)
const typedText = ref('')
const password = ref('')
const cfg = ref({})

const DEFAULT_ICONS = {
  danger: 'trash-can', warning: 'triangle-exclamation',
  success: 'circle-check', info: 'circle-info', primary: 'circle-question',
}
const BTN_COLORS = {
  danger: 'negative', warning: 'orange',
  success: 'positive', info: 'info', primary: 'primary',
}

const variant = computed(() => cfg.value.variant || 'primary')
const icon = computed(() => cfg.value.icon || DEFAULT_ICONS[variant.value] || 'circle-question')
const btnColor = computed(() => cfg.value.buttonColor || BTN_COLORS[variant.value] || 'primary')

const needsText = computed(() => !!cfg.value.requireText)
const needsPassword = computed(() => !!cfg.value.requirePassword)

const canConfirm = computed(() => {
  if (needsText.value && typedText.value.trim() !== String(cfg.value.requireText)) return false
  if (needsPassword.value && !password.value) return false
  return true
})

function open(config = {}) {
  cfg.value = config || {}
  typedText.value = ''
  password.value = ''
  loading.value = false
  isOpen.value = true
}
function close() {
  isOpen.value = false
}

async function onConfirm() {
  if (!canConfirm.value || loading.value) return
  const payload = { password: password.value }

  // Si el padre pasó un callback, lo ejecutamos aquí (mostrando loading) y cerramos
  // al terminar bien. Si lanza, el diálogo queda abierto (el error lo maneja el padre).
  if (typeof cfg.value.onConfirm === 'function') {
    loading.value = true
    try {
      await cfg.value.onConfirm(payload)
      close()
    } catch { /* padre maneja el error (ej. interceptor axios) */ } finally {
      loading.value = false
    }
    return
  }

  // Sin callback: emitimos y el padre decide (debe llamar close() al terminar).
  emit('confirm', payload)
}

function onCancel() {
  emit('cancel')
  close()
}

defineExpose({ open, close })
</script>

<template>
  <x-dialog v-model="isOpen" width="440px">
    <template #content>
      <div class="x-dialog-action">
        <div class="x-dialog-action__icon-wrap" :class="`x-dialog-action__icon-wrap--${variant}`">
          <q-icon :name="ic(icon)" size="28px" />
        </div>

        <div class="x-dialog-action__title">{{ cfg.title }}</div>
        <div class="x-dialog-action__description" v-html="cfg.message"></div>

        <!-- Escribir-para-confirmar -->
        <div v-if="needsText" class="x-dialog-action__password">
          <div class="text-caption text-grey q-mb-xs" style="text-align:center">
            Escribe <b>{{ cfg.requireText }}</b> para confirmar
          </div>
          <x-input v-model="typedText" :dense="false" @keyup.enter="onConfirm" />
        </div>

        <!-- Password -->
        <div v-if="needsPassword" class="x-dialog-action__password">
          <x-input
            v-model="password"
            type="password"
            :label="cfg.passwordLabel || 'Contraseña'"
            :dense="false"
            @keyup.enter="onConfirm"
          />
        </div>
      </div>
    </template>

    <template #action-buttons>
      <div class="x-dialog-action__buttons">
        <x-button
          outline
          color="grey-8"
          class="x-dialog-action__btn"
          :disable="loading"
          :label="cfg.cancelLabel || 'Cancelar'"
          @click="onCancel"
        />
        <x-button
          :color="btnColor"
          unelevated
          class="x-dialog-action__btn"
          :loading="loading"
          :disable="loading || !canConfirm"
          :label="cfg.confirmLabel || 'Confirmar'"
          @click="onConfirm"
        />
      </div>
    </template>
  </x-dialog>
</template>
