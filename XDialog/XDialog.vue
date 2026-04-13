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

// Alturas fijas de las secciones (px)
const TITLE_HEIGHT = 60;
const CONTENT_HEADER_HEIGHT = 52;
const ACTIONS_HEIGHT = 60;

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
  },
  fullScreen: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['update:modelValue', 'before-show', 'show', 'confirm', 'cancel', 'action-button-close']);

// Control interno del estado abierto/cerrado del diálogo
const isOpen = ref(false);

const isFullView = computed(() => props.isFullHeight || props.fullScreen);

// Calcula el ancho y clase del diálogo
const dialogWidth = computed(() => ($q.screen.xs ? '95vw' : props.width));
const dialogPosition = computed(() => props.position);
const classDialog = computed(() => isFullView.value ? 'x-dialog x-dialog-full-height' : 'x-dialog x-dialog-standard');

// Detección de slots
const hasActionButtonsSlot = computed(() => !!slots['action-buttons']);
const hasContentHeaderSlot = computed(() => !!slots['content-header']);

// Altura dinámica del scroll-area: resta las secciones visibles
const scrollAreaHeight = computed(() => {
  let usedHeight = 0;
  if (props.title) usedHeight += TITLE_HEIGHT;
  if (hasContentHeaderSlot.value) usedHeight += CONTENT_HEADER_HEIGHT;
  if (hasActionButtonsSlot.value) usedHeight += ACTIONS_HEIGHT;
  return usedHeight;
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
            :maximized="fullScreen"
            :class="classDialog">

    <q-card class="q-pa-none"
            :style="fullScreen
              ? { width: '100vw', maxWidth: '100vw', height: '100vh', maxHeight: '100vh' }
              : { width: dialogWidth, maxWidth: dialogWidth }">

      <!-- Título del diálogo -->
      <div class="x-dialog-title" v-if="title" :style="{ height: TITLE_HEIGHT + 'px' }">
        <div class="x-dialog-title__text">{{ title }}</div>
        <q-icon v-if="showButtonClose"
                name="fal fa-xmark"
                @click="emit('action-button-close')"
                size="20px"
                class="cursor-pointer x-dialog-button-close"/>
      </div>

      <!-- Header adicional si se define el slot -->
      <div v-if="hasContentHeaderSlot" class="x-dialog-content-header" :style="{ height: CONTENT_HEADER_HEIGHT + 'px' }">
          <slot name="content-header"/>
      </div>

      <!-- Contenido full-view flush: sin scroll-area (el contenido maneja su propio scroll) -->
      <div v-if="isFullView && contentFlush" :style="{ height: `calc(100vh - ${scrollAreaHeight}px)`, overflow: 'hidden' }">
        <q-card-section class="x-dialog-section-full-height content-flush" style="height: 100%;">
          <slot name="content"/>
        </q-card-section>
      </div>

      <!-- Contenido full-view con scroll dinámico -->
      <div v-else-if="isFullView" :style="{ height: `calc(100vh - ${scrollAreaHeight}px)`, overflowY: 'auto' }">
        <q-card-section class="q-pa-md">
          <slot name="content"/>
        </q-card-section>
      </div>

      <!-- Contenido fijo si no es scrollable -->
      <div style="max-height:60vh; overflow-y:auto;" v-else>
        <q-card-section :class="{ 'q-pa-none': contentFlush }">
            <slot name="content"/>
        </q-card-section>
      </div>

      <!-- Botones de acción -->
      <div class="x-dialog-actions"
           :class="{'justify-end': alignActionButtons === 'right', 'justify-between': alignActionButtons === 'between'}"
           :style="{ height: ACTIONS_HEIGHT + 'px' }"
           v-if="hasActionButtonsSlot">
        <slot name="action-buttons"/>
      </div>

      <!-- Componente de loading reutilizable -->
      <x-loading :loading="loading"/>
    </q-card>
  </q-dialog>
</template>
