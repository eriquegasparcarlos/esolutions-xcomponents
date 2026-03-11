<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Eliminar registro' },
  message: { type: String, default: '¿Está seguro que desea eliminar este registro?' },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'confirm'])
const isOpen = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
</script>
<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 350px">
      <q-card-section><div class="text-h6">{{ title }}</div></q-card-section>
      <q-card-section>{{ message }}</q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="isOpen = false" />
        <q-btn flat label="Eliminar" color="negative" :loading="loading" @click="emit('confirm')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
