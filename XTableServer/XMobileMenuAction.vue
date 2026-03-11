<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

function onHide() {
  emit('update:modelValue', false)
}
</script>

<template>
  <q-dialog
    :model-value="modelValue"
    @hide="onHide"
    position="bottom"
  >
    <q-card style="width: 100%">
      <q-card-section class="q-pa-none">
        <q-list class="rounded-borders">
          <slot></slot>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
