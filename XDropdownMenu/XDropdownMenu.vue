<script setup>
import { computed, ref, useSlots } from 'vue'

defineOptions({
  name: 'XDropdownMenu',
  inheritAttrs: false,
})

const props = defineProps({
  /** Ancho del dropdown (puede ser px, %, auto). Default 260px */
  width: {
    type: [String, Number],
    default: 260,
  },
  /** Alineacion respecto al trigger: 'right' (default) o 'left' */
  align: {
    type: String,
    default: 'right',
    validator: v => ['left', 'right'].includes(v),
  },
  /** Offset [x, y] del menu respecto al trigger */
  offset: {
    type: Array,
    default: () => [0, 8],
  },
  /** Max alto del menu (con scroll si excede) */
  maxHeight: {
    type: String,
    default: '480px',
  },
  /** Mostrar la flecha de cierre tipica de notifications dropdown */
  showCloseButton: {
    type: Boolean,
    default: false,
  },
  /** Deshabilita el trigger */
  disable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['show', 'hide', 'before-show', 'before-hide'])

const slots = useSlots()
const isOpen = ref(false)

const hasHeader = computed(() => !!slots.header)
const hasFooter = computed(() => !!slots.footer)

// Convertir width a string con unidad
const widthStyle = computed(() => {
  if (typeof props.width === 'number') return `${props.width}px`
  return props.width
})

// Anchor del q-menu segun alineacion
const anchorPosition = computed(() =>
  props.align === 'right' ? 'bottom right' : 'bottom left'
)
const selfPosition = computed(() =>
  props.align === 'right' ? 'top right' : 'top left'
)

function close() {
  isOpen.value = false
}

function open() {
  isOpen.value = true
}

function toggle() {
  isOpen.value = !isOpen.value
}

// Exponer metodos para control externo
defineExpose({ close, open, toggle, isOpen })
</script>

<template>
  <div class="x-dropdown-menu-wrapper" v-bind="$attrs" style="display: inline-block; position: relative;">
    <!-- Trigger: lo que el usuario ve siempre -->
    <slot name="trigger" :is-open="isOpen" :open="open" :close="close" :toggle="toggle" />

    <!-- Menu dropdown -->
    <q-menu
      v-model="isOpen"
      :offset="offset"
      :anchor="anchorPosition"
      :self="selfPosition"
      transition-show="jump-down"
      transition-hide="jump-up"
      :transition-duration="150"
      class="x-dropdown-menu"
      :class="{ 'x-dropdown-menu--has-header': hasHeader, 'x-dropdown-menu--has-footer': hasFooter }"
      :style="{ width: widthStyle }"
      :disable="disable"
      no-parent-event
      @show="$emit('show')"
      @hide="$emit('hide')"
      @before-show="$emit('before-show')"
      @before-hide="$emit('before-hide')"
    >
      <!-- Header opcional -->
      <div v-if="hasHeader" class="x-dropdown-menu__header">
        <div class="x-dropdown-menu__header-content">
          <slot name="header" :close="close" />
        </div>
        <q-btn v-if="showCloseButton"
               flat
               dense
               round
               size="sm"
               icon="close"
               class="x-dropdown-menu__close-btn"
               @click="close" />
      </div>

      <!-- Contenido principal (lista de items) -->
      <div class="x-dropdown-menu__body"
           :style="{ maxHeight: maxHeight, overflowY: 'auto' }">
        <slot :close="close" />
      </div>

      <!-- Footer opcional -->
      <div v-if="hasFooter" class="x-dropdown-menu__footer">
        <slot name="footer" :close="close" />
      </div>
    </q-menu>
  </div>
</template>
