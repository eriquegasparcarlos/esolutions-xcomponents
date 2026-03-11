<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  url: { type: String, default: '' },
  title: { type: String, default: 'Vista previa' },
})
const emit = defineEmits(['update:modelValue'])
const isOpen = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
</script>
<template>
  <q-dialog v-model="isOpen" maximized>
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ title }}</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="isOpen = false" />
      </q-card-section>
      <q-card-section class="q-pa-none" style="height: calc(100vh - 60px)">
        <iframe v-if="url" :src="url" width="100%" height="100%" style="border: none" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
