<script setup>
import { ref } from 'vue'
import { api } from 'src/services/api'
import { Notify } from 'quasar'
import XDialog from './XDialog.vue'
import XButton from 'components/XButton/XButton.vue'

defineOptions({ name: 'XDeleteDialog' })

const props = defineProps({
  message: { type: String, default: '¿Estás seguro de eliminar este registro?' },
  description: { type: String, default: '' },
  icon: { type: String, default: 'fal fa-trash-can' },
  confirmLabel: { type: String, default: 'Sí, eliminar' },
  cancelLabel: { type: String, default: 'No, cancelar' },
  successMessage: { type: String, default: 'Registro eliminado.' },
  width: { type: String, default: '400px' },
})

const emit = defineEmits(['success'])

const visible = ref(false)
const loading = ref(false)
const endpoint = ref('')

function open(url) {
  endpoint.value = url
  visible.value = true
}

async function confirm() {
  loading.value = true
  try {
    await api.delete(endpoint.value)
    Notify.create({ type: 'positive', message: props.successMessage })
    visible.value = false
    emit('success')
  } catch {
    /* */
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<template>
  <x-dialog v-model="visible" :width="width">
    <template #content>
      <div class="text-center q-py-md">
        <q-icon :name="icon" size="48px" color="grey-6" />
        <div class="text-subtitle1 q-mt-md">{{ message }}</div>
        <div v-if="description" class="text-caption text-grey-7 q-mt-xs">{{ description }}</div>
      </div>
    </template>
    <template #action-buttons>
      <x-button :label="cancelLabel" outline color="grey-8" @click="visible = false" :disable="loading" />
      <x-button :label="confirmLabel" color="negative" :loading="loading" @click="confirm" />
    </template>
  </x-dialog>
</template>
