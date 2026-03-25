<script setup>
defineOptions({
  name: 'MobileBottomSheet',
})

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  actions: {
    type: Array,
    default: () => [],
    // Each action: { label, icon, color, action }
  },
})

const emit = defineEmits(['update:modelValue', 'action'])

function onHide() {
  emit('update:modelValue', false)
}

function performAction(action) {
  emit('update:modelValue', false)
  emit('action', action)
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
          <!-- Header -->
          <q-item v-if="title || subtitle">
            <q-item-section class="text-black text-weight-bold">
              <div class="flex justify-between">
                <div v-if="title">{{ title }}</div>
                <div v-if="subtitle">{{ subtitle }}</div>
              </div>
            </q-item-section>
          </q-item>

          <!-- Custom content slot -->
          <slot></slot>

          <!-- Actions from prop -->
          <template v-if="actions.length > 0">
            <q-separator/>
            <q-item v-for="(action, idx) in actions"
                    :key="idx"
                    clickable
                    v-ripple
                    @click="performAction(action)">
              <q-item-section avatar style="min-width: 40px">
                <q-icon :name="action.icon" :color="action.color || 'grey-8'"/>
              </q-item-section>
              <q-item-section :class="action.color === 'red' ? 'text-red' : ''">
                {{ action.label }}
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
