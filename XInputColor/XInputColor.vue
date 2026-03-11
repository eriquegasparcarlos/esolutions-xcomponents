<script setup>
import { ref, computed, useAttrs } from 'vue'
import XInput from 'components/XInput/XInput.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  customClass: {
    type: String,
    default: ''
  },
  showCode: {
    type: Boolean,
    default: true
  },
  asButton: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])
const showPopup = ref(false)
const attrs = useAttrs()

const colorAttrs = computed(() => {
  return attrs
})

const modelValueComputed = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const inputValue = computed({
  get() {
    return props.showCode ? props.modelValue : ''
  },
  // set(_) {
  //   // readonly input
  // }
})

const textColor = computed(() => {
  if (!props.showCode) return '#ffffff'

  const color = props.modelValue.replace('#', '')
  if (color.length !== 6) return '#ffffff'

  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)

  const luminance = 0.299 * r + 0.587 * g + 0.114 * b
  return luminance > 186 ? '#000000' : '#ffffff'
})
</script>

<template>
  <div>
    <q-btn
      v-if="asButton"
      :style="{ backgroundColor: modelValueComputed, color: textColor }"
      :label="showCode ? modelValueComputed : ''"
      class="full-color-btn"
      @click="showPopup = true"
      flat
    />
    <x-input
      v-else
      v-model="inputValue"
      :label="label"
      :class="customClass"
      readonly
    >
      <template #prepend>
        <div
          class="color-preview"
          :style="{ backgroundColor: modelValueComputed }"
        ></div>
      </template>

      <template #append>
        <q-icon name="colorize" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-color v-model="modelValueComputed" v-bind="colorAttrs" />
          </q-popup-proxy>
        </q-icon>
      </template>
    </x-input>

    <!-- Popup si es modo botón -->
    <q-popup-proxy v-model="showPopup" transition-show="scale" transition-hide="scale" v-if="asButton">
      <q-color v-model="modelValueComputed" v-bind="colorAttrs" />
    </q-popup-proxy>
  </div>
</template>

<style lang="scss">
.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  //border: 1px solid #ccc;
}

.full-color-btn {
  width: 100%;
}
</style>
