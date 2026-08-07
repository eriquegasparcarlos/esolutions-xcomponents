<script setup>
import { computed, useSlots } from 'vue'
import XLoading from '../XLoading/XLoading.vue'

defineOptions({
  name: 'XCard',
})

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  flat: {
    type: Boolean,
    default: true,
  },
  /**
   * Look "plano + borde fino, sin sombra" (equivalente al `q-card flat bordered`
   * crudo que se usaba antes de existir XCard). Sin esta prop, XCard SIEMPRE
   * lleva `box-shadow` — no hay forma de quitarlo por CSS del consumidor porque
   * está en `.x-card` sin variante. `bordered` es la variante oficial.
   */
  bordered: {
    type: Boolean,
    default: false,
  },
  fullHeight: {
    type: Boolean,
    default: false,
  },
  contentPadding: {
    type: Boolean,
    default: false,
  },
  /**
   * Tamaño del padding del contenido: '' (default, hereda de `contentPadding`
   * — none/md) | 'none' | 'xs' | 'sm' | 'md' | 'lg'. Usar cuando `contentPadding`
   * (fijo en md=16px) no encaja — p. ej. mini-cards de resumen con `sm`=8px.
   * Si se pasa, tiene prioridad sobre `contentPadding`.
   */
  padding: {
    type: String,
    default: '',
    validator: (v) => ['', 'none', 'xs', 'sm', 'md', 'lg'].includes(v),
  },
  /** Alineación del slot #actions (footer de botones tipo q-card-actions). */
  actionsAlign: {
    type: String,
    default: 'right',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingIcon: {
    type: String,
    default: '',
  },
})

const slots = useSlots()
const hasHeaderButtons = computed(() => !!slots['header-buttons'])
const hasHeader = computed(() => props.title || props.subtitle || props.icon || hasHeaderButtons.value)
const hasActions = computed(() => !!slots['actions'])

// `padding` (si se pasa) manda; si no, cae al booleano `contentPadding` (md/none).
const paddingClass = computed(() => {
  const p = props.padding || (props.contentPadding ? 'md' : 'none')
  return `q-pa-${p}`
})
</script>

<template>
  <q-card :flat="flat" :bordered="bordered" class="x-card" :class="{ 'full-height': fullHeight, 'x-card--bordered': bordered }">
    <q-card-section v-if="hasHeader" class="q-py-none x-card-section-title" :class="{ 'x-card-section-title--with-subtitle': subtitle }">
      <div class="row items-center no-wrap col">
        <q-icon v-if="icon" :name="icon" size="20px" class="q-mr-md flex-shrink-0"/>
        <div>
          <div class="text-h6" style="margin-bottom: 0; line-height: 1.2">{{ title }}</div>
          <div v-if="subtitle" class="text-caption text-grey-5">{{ subtitle }}</div>
        </div>
      </div>
      <div v-if="hasHeaderButtons" class="flex-shrink-0">
        <slot name="header-buttons"/>
      </div>
    </q-card-section>
    <q-card-section class="x-form-section-content" :class="paddingClass">
      <slot/>
    </q-card-section>
    <q-card-actions v-if="hasActions" :align="actionsAlign">
      <slot name="actions"/>
    </q-card-actions>
    <x-loading :loading="loading" :icon="loadingIcon"/>
  </q-card>
</template>
