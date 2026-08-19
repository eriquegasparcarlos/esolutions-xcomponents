<script setup>
import { computed } from 'vue'
import { ic } from '../icons/index.js'

defineOptions({
  name: 'XVerifiedBadge',
  inheritAttrs: false,
})

const props = defineProps({
  /** Estado de verificacion. true = verde, false = naranja */
  verified: {
    type: Boolean,
    default: false,
  },
  /** Texto cuando esta verificado */
  labelVerified: {
    type: String,
    default: 'Verificado',
  },
  /** Texto cuando NO esta verificado */
  labelNotVerified: {
    type: String,
    default: 'Sin verificar',
  },
  /** Icono cuando verificado */
  iconVerified: {
    type: String,
    default: 'success',
  },
  /** Icono cuando NO verificado */
  iconNotVerified: {
    type: String,
    default: 'warning',
  },
  /** Tamaño del icono interno */
  iconSize: {
    type: String,
    default: '10px',
  },
  /** Solo icono sin texto (compacto) */
  iconOnly: {
    type: Boolean,
    default: false,
  },
})

const color = computed(() => props.verified ? 'positive' : 'warning')
const icon = computed(() => props.verified ? props.iconVerified : props.iconNotVerified)
const label = computed(() => props.verified ? props.labelVerified : props.labelNotVerified)
</script>

<template>
  <q-badge :color="color" v-bind="$attrs">
    <q-icon :name="ic(icon)" :size="iconSize" :class="{ 'q-mr-xs': !iconOnly }" />
    <span v-if="!iconOnly">{{ label }}</span>
  </q-badge>
</template>
