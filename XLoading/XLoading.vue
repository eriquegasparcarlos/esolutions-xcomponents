<script setup>
import { computed, useAttrs } from 'vue'
import { QSpinnerDots, QSpinnerBars, QSpinnerCube, QSpinnerGears, QSpinnerHourglass, QSpinnerPuff, QSpinnerTail } from 'quasar'

defineOptions({
  name: 'XLoading',
  inheritAttrs: false,
})

const spinnerMap = {
  dots:      QSpinnerDots,
  bars:      QSpinnerBars,
  cube:      QSpinnerCube,
  gears:     QSpinnerGears,
  hourglass: QSpinnerHourglass,
  puff:      QSpinnerPuff,
  tail:      QSpinnerTail,
}

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'primary',
  },
  size: {
    type: String,
    default: '50px',
  },
  spinner: {
    type: String,
    default: 'dots',
  },
  dark: {
    type: Boolean,
    default: false,
  },
  message: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
})

const attrs = useAttrs()
const spinnerComponent = computed(() => spinnerMap[props.spinner] ?? QSpinnerDots)
</script>

<template>
  <q-inner-loading v-bind="{ ...attrs }" :showing="loading" :dark="dark" class="x-loading">
    <template v-if="icon">
      <q-icon :name="icon" :color="color" :style="{ fontSize: size }" class="x-loading-icon" />
    </template>
    <template v-else>
      <component :is="spinnerComponent" :color="color" :size="size" />
    </template>
    <div v-if="message" class="q-mt-sm text-subtitle2 text-center text-italic">{{ message }}</div>
  </q-inner-loading>
</template>

<style scoped>
.x-loading-icon {
  animation: x-loading-pulse 1s ease-in-out infinite;
}

@keyframes x-loading-pulse {
  0%, 100% { opacity: 1;   transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.85); }
}
</style>
