<script setup>
import { computed, useSlots } from 'vue'

defineOptions({
  name: 'XDropdownItem',
  inheritAttrs: false,
})

const props = defineProps({
  /** Texto del item */
  label: {
    type: String,
    default: '',
  },
  /** Icono opcional (nombre del icono Quasar/FontAwesome) */
  icon: {
    type: String,
    default: '',
  },
  /** Variante visual: default | danger | success | warning | info */
  variant: {
    type: String,
    default: 'default',
    validator: v => ['default', 'danger', 'success', 'warning', 'info'].includes(v),
  },
  /** Si se pasa, navega con vue-router */
  to: {
    type: [String, Object],
    default: null,
  },
  /** Si se pasa, abre como link */
  href: {
    type: String,
    default: '',
  },
  /** Target del link */
  target: {
    type: String,
    default: '',
  },
  /** Deshabilita el item */
  disable: {
    type: Boolean,
    default: false,
  },
  /** Cierra el menu automaticamente al hacer click */
  closeOnClick: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['click'])

const slots = useSlots()

const variantClass = computed(() => `x-dropdown-item--${props.variant}`)
</script>

<template>
  <q-item
    v-bind="$attrs"
    clickable
    :v-close-popup="closeOnClick"
    :to="to"
    :href="href"
    :target="target"
    :disable="disable"
    class="x-dropdown-item"
    :class="[variantClass, { 'x-dropdown-item--disabled': disable }]"
    @click="$emit('click', $event)"
  >
    <!-- Icono (opcional) -->
    <q-item-section v-if="icon || slots.icon" avatar class="x-dropdown-item__icon">
      <slot name="icon">
        <q-icon :name="icon" size="18px" />
      </slot>
    </q-item-section>

    <!-- Label / contenido -->
    <q-item-section class="x-dropdown-item__label">
      <slot>{{ label }}</slot>
    </q-item-section>

    <!-- Side derecho (badge, atajo, chevron, etc.) -->
    <q-item-section v-if="slots.side" side>
      <slot name="side" />
    </q-item-section>
  </q-item>
</template>
