<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/services/api'
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  resource: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue', 'success'])
const $q = useQuasar()
const isOpen = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
const file = ref(null)
const loading = ref(false)
const onSubmit = async () => {
  if (!file.value) return $q.notify({ type: 'warning', message: 'Seleccione un archivo' })
  loading.value = true
  const formData = new FormData()
  formData.append('file', file.value)
  try {
    const res = await api.post(`/${props.resource}/import`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    if (res.data.success) { $q.notify({ type: 'positive', message: res.data.message || 'Importado' }); emit('success'); isOpen.value = false }
    else $q.notify({ type: 'negative', message: res.data.message || 'Error' })
  } catch { $q.notify({ type: 'negative', message: 'Error al importar' }) }
  finally { loading.value = false }
}
</script>
<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 400px">
      <q-card-section><div class="text-h6">Importar registros</div></q-card-section>
      <q-card-section><q-file v-model="file" label="Seleccionar archivo" outlined dense /></q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="isOpen = false" />
        <q-btn flat label="Importar" color="primary" :loading="loading" @click="onSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
