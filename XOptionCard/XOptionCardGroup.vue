<script setup>
import { provide, toRef } from 'vue'

defineOptions({
  name: 'XOptionCardGroup',
})

const props = defineProps({
  modelValue: {
    default: null,
  },
  cols: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

provide('xOptionCardGroup', {
  modelValue: toRef(props, 'modelValue'),
  select: (val) => emit('update:modelValue', val),
})
</script>

<template>
  <div
    class="x-option-card-group"
    :style="cols ? `grid-template-columns: repeat(${cols}, 1fr)` : undefined"
  >
    <slot />
  </div>
</template>

<style scoped>
.x-option-card-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
}
</style>
