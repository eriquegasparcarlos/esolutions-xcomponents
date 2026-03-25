<script setup>
import {ref, computed, watchEffect, useSlots} from 'vue';
import {useQuasar} from 'quasar';
import XLoading from 'components/XLoading/XLoading.vue';

// Define las opciones del componente
defineOptions({
  name: 'XDialog',
  inheritAttrs: false,
});

// Instancia de Quasar y acceso a slots
const $q = useQuasar();
const slots = useSlots();

// Props del componente
const props = defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: '600px',
  },
  position: {
    default: 'standard',
    validator: (value) => ['standard', 'top', 'bottom', 'right', 'left'].includes(value),
  },
  small: {
    type: Boolean,
    default: false,
  },
  isFullHeight: {
    type: Boolean,
    default: false,
  },
  alignActionButtons: {
    default: 'right',
  },
  showScrollArea: {
    type: Boolean,
    default: true,
  },
  showButtonClose: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  contentFlush: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['update:modelValue', 'before-show', 'show', 'confirm', 'cancel', 'action-button-close']);

// Control interno del estado abierto/cerrado del diálogo
const isOpen = ref(false);

// Calcula el ancho y clase del diálogo
const dialogWidth = computed(() => ($q.screen.xs ? '95vw' : props.width));
const dialogPosition = computed(() => props.position);
const classDialog = computed(() => props.isFullHeight ? 'x-dialog x-dialog-full-height' : 'x-dialog x-dialog-standard');

// Detección de slots
const hasActionButtonsSlot = computed(() => !!slots['action-buttons']);
const hasContentHeaderSlot = computed(() => !!slots['content-header']);

// Altura dinámica del scroll-area
const scrollAreaHeight = computed(() => {
  return 51 + (hasActionButtonsSlot.value ? 60 : 0) + (hasContentHeaderSlot.value ? 50 : 0);
});

// Sincroniza la visibilidad con modelValue
watchEffect(() => {
  isOpen.value = props.modelValue;
});

// Emitir evento antes de mostrar
const onBeforeShow = () => {
  emit('before-show');
};

const onShow = () => { emit('show') };

// Emitir evento de cancelación y cerrar
const onClose = () => {
  emit('cancel');
  emit('update:modelValue', false);
};
</script>

<template>
  <q-dialog v-model="isOpen"
            @before-show="onBeforeShow"
            @show="onShow"
            @hide="onClose"
            persistent
            transition-show="scale"
            transition-hide="scale"
            :position="dialogPosition"
            :full-height="isFullHeight"
            :class="classDialog">

    <q-card class="q-pa-none" :style="{ width: dialogWidth, 'max-width': dialogWidth }">

      <!-- Título del diálogo -->
      <q-card-section class="q-py-none x-dialog-title" v-if="title">
        <div class="text-h6">{{ title }}</div>
        <q-icon v-if="showButtonClose"
                name="fal fa-xmark"
                @click="emit('action-button-close')"
                size="28px"
                class="cursor-pointer x-dialog-button-close"/>
      </q-card-section>

      <!-- Header adicional si se define el slot -->
      <q-card-section v-if="hasContentHeaderSlot" class="q-py-none x-dialog-content-header">
          <slot name="content-header"/>
      </q-card-section>

      <!-- Contenido con scroll dinámico si isFullHeight -->
      <q-scroll-area :style="{ height: `calc(100vh - ${scrollAreaHeight}px)` }" v-if="isFullHeight">
        <q-card-section :class="contentFlush ? 'q-pa-none' : 'q-pa-md'" class="x-dialog-section-full-height">
          <slot name="content"/>
        </q-card-section>
      </q-scroll-area>

      <!-- Contenido fijo si no es scrollable -->
      <div style="max-height:60vh; overflow-y:auto;" v-else>
        <q-card-section :class="{ 'q-pa-none': contentFlush }">
            <slot name="content"/>
        </q-card-section>
      </div>

      <!-- Botones de acción -->
      <q-card-section class="q-py-none x-dialog-actions"
                      :class="{'justify-end': alignActionButtons === 'right', 'justify-between': alignActionButtons=== 'between'}"
                      v-if="hasActionButtonsSlot">
        <slot name="action-buttons"/>
      </q-card-section>

      <!-- Componente de loading reutilizable -->
      <x-loading :loading="loading"/>
    </q-card>
  </q-dialog>
</template>
