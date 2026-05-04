<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/services/api'
import XDialog from '../XDialog/XDialog.vue'
import XInput from '../XInput/XInput.vue'
import XButton from '../XButton/XButton.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  table: { type: String, required: true },
  resource: { type: String, required: true },
  recordId: { type: [Number, String], default: null },
})

const emit = defineEmits(['update:modelValue', 'success'])

const $q = useQuasar()
const loading = ref(false)
const loadingSubmit = ref(false)
const email = ref('')
const errors = ref({})

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const handleOpen = async () => {
  email.value = ''
  errors.value = {}
  loading.value = true
  try {
    const response = await api.get(`/${props.resource}/info_mail/${props.recordId}`)
    if (response.data?.data?.email) {
      email.value = response.data.data.email
    }
  } catch {
    // info_mail endpoint may not exist yet
  } finally {
    loading.value = false
  }
}

const onSubmit = async () => {
  if (!email.value) {
    errors.value = { email: 'El correo es obligatorio' }
    return
  }
  loadingSubmit.value = true
  try {
    const response = await api.post(`/${props.resource}/send_mail`, {
      id: props.recordId,
      email: email.value,
      table: props.table,
    })
    if (response.data.success) {
      $q.notify({ type: 'positive', message: response.data.message || 'Correo enviado' })
      emit('success')
      isOpen.value = false
    } else {
      $q.notify({ type: 'negative', message: response.data.message || 'Error al enviar' })
    }
  } catch (error) {
    if (error.status === 422) {
      errors.value = error.errors || {}
    } else {
      $q.notify({ type: 'negative', message: 'Error al enviar correo' })
    }
  } finally {
    loadingSubmit.value = false
  }
}

const closeDialog = () => {
  isOpen.value = false
}
</script>

<template>
  <x-dialog
    v-model="isOpen"
    title="Enviar por correo"
    :loading="loading"
    show-button-close
    @action-button-close="closeDialog"
    @before-show="handleOpen"
  >
    <template #content>
      <div class="row q-col-gutter-y-sm">
        <div class="col-24">
          <x-input
            label="Correo electrónico"
            v-model="email"
            type="email"
            :error="errors.email"
          />
        </div>
      </div>
    </template>
    <template #action-buttons>
      <x-button
        flat
        class="q-mr-sm"
        @click="closeDialog"
        :disable="loadingSubmit"
        label="Cancelar"
      />
      <x-button
        @click="onSubmit"
        :loading="loadingSubmit"
        :disable="loadingSubmit"
        label="Enviar"
        icon="fal fa-paper-plane"
      />
    </template>
  </x-dialog>
</template>
