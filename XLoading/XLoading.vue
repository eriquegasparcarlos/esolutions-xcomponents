<script setup>
import { useAttrs } from 'vue';

defineOptions({
  name: 'XLoading',
  inheritAttrs: false,
});

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: 'primary'
  },
  size: {
    type: String,
    default: '50px'
  },
  spinner: {
    type: String,
    default: 'dots' // Opciones: 'dots', 'bars', 'cube', etc.
  },
  dark: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  }
});

const attrs = useAttrs();
</script>

<template>
  <q-inner-loading v-bind="{ ...attrs }" :showing="loading" :dark="dark" class="x-loading">
    <component :is="`q-spinner-${spinner}`" :color="color" :size="size" />

    <!-- Slot de mensaje opcional -->
    <div v-if="message" class="q-mt-sm text-subtitle2 text-center text-italic">{{ message }}</div>
  </q-inner-loading>
</template>
