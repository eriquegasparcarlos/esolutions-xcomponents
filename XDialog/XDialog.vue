<script setup>
import {ref, computed, watchEffect, useSlots, nextTick, onBeforeUnmount} from 'vue';
import {useQuasar} from 'quasar';
import XLoading from '../XLoading/XLoading.vue';

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
  loadingIcon: {
    type: String,
    default: '',
  },
  contentFlush: {
    type: Boolean,
    default: false,
  },
  fullScreen: {
    type: Boolean,
    default: false,
  },
  autofocus: {
    type: [Boolean, String],
    default: true,
  },
  /**
   * Header sin border-bottom ni background (look "flush", estilo TailAdmin).
   * Por default true para todos los modales. Override con :flat-header="false"
   * si algun modal especifico necesita el header chrome clasico.
   */
  flatHeader: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'before-show', 'show', 'confirm', 'cancel', 'action-button-close']);

// Control interno del estado abierto/cerrado del diálogo
const isOpen = ref(false);
const dialogCardRef = ref(null);
const contentScrollRef = ref(null);
const isContentScrolled = ref(false);
const canScroll = ref(false);
let resizeObserver = null;

/** Listener de scroll del contenedor de contenido — actualiza estado scrolled. */
function onContentScroll(e) {
  isContentScrolled.value = (e.target?.scrollTop || 0) > 0;
}

/** Recalcula si el contenido excede el alto disponible (overflow = puede scrollear). */
function recalcCanScroll() {
  const el = contentScrollRef.value;
  if (!el) {
    canScroll.value = false;
    return;
  }
  canScroll.value = el.scrollHeight > el.clientHeight + 1; // tolerancia 1px
}

/** Se llama después de que el dialog renderiza para detectar overflow inicial. */
function setupScrollDetection() {
  nextTick(() => {
    recalcCanScroll();
    // ResizeObserver para detectar cambios de contenido (load async, expand, etc.)
    if (contentScrollRef.value && typeof ResizeObserver !== 'undefined') {
      resizeObserver?.disconnect();
      resizeObserver = new ResizeObserver(() => recalcCanScroll());
      resizeObserver.observe(contentScrollRef.value);
      // Tambien observar el contenido interno (no solo el contenedor)
      const inner = contentScrollRef.value.firstElementChild;
      if (inner) resizeObserver.observe(inner);
    }
    // Backup: window resize por si el observer no detecta cambios de viewport (vh units)
    window.addEventListener('resize', recalcCanScroll);
  });
}

function teardownScrollDetection() {
  resizeObserver?.disconnect();
  window.removeEventListener('resize', recalcCanScroll);
}

onBeforeUnmount(() => {
  teardownScrollDetection();
});

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

const onShow = () => {
  emit('show')
  // Detectar si el contenido excede el alto y necesita scroll
  setupScrollDetection()
  if (props.autofocus) {
    nextTick(() => {
      const root = dialogCardRef.value?.$el ?? dialogCardRef.value
      if (!root) return

      // Selector custom (si autofocus es string) o lista de candidatos focusables
      let candidates
      if (typeof props.autofocus === 'string' && props.autofocus.length > 0) {
        candidates = root.querySelectorAll(props.autofocus)
      } else {
        candidates = root.querySelectorAll(
          'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea'
        )
      }

      // Filtrar: skip readonly, disabled o no visibles. Toma el primero focusable.
      const el = Array.from(candidates).find(c =>
        !c.readOnly && !c.disabled && c.offsetParent !== null
      )

      if (el) {
        el.focus()
        // Solo .select() en inputs con texto editable
        if (typeof el.select === 'function' && el.type !== 'checkbox' && el.type !== 'radio') {
          el.select()
        }
      }
      // Si no encuentra ningun candidato focusable: no hace nada (silencioso).
    })
  }
};

// Emitir evento de cancelación y cerrar
const onClose = () => {
  // Reset por si se reabre el modal
  isContentScrolled.value = false;
  canScroll.value = false;
  teardownScrollDetection();
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

    <q-card ref="dialogCardRef" class="q-pa-none x-dialog-card"
            :style="fullScreen
              ? { width: '100vw', maxWidth: '100vw', height: '100vh', maxHeight: '100vh' }
              : { width: dialogWidth, maxWidth: dialogWidth }">

      <!-- Título del diálogo -->
      <!-- q--avoid-card-border evita el override de Quasar (box-shadow: none) -->
      <div class="x-dialog-title q--avoid-card-border"
           :class="{
             'x-dialog-title--flat': flatHeader,
             'x-dialog-title--scrolled': flatHeader && isContentScrolled,
           }"
           v-if="title"
           :style="{ height: TITLE_HEIGHT + 'px' }">
        <div class="x-dialog-title__text">{{ title }}</div>
        <q-btn v-if="showButtonClose"
               icon="fa-light fa-xmark"
               flat
               round
               dense
               size="md"
               class="x-dialog-button-close"
               @click="emit('action-button-close')" />
      </div>

      <!-- Header adicional si se define el slot -->
      <!-- q--avoid-card-border: evita override de Quasar que borra border-top -->
      <div v-if="hasContentHeaderSlot"
           class="x-dialog-content-header q--avoid-card-border"
           :style="{ height: CONTENT_HEADER_HEIGHT + 'px' }">
          <slot name="content-header"/>
      </div>

      <!-- Contenido full-view flush: sin scroll-area (el contenido maneja su propio scroll) -->
      <div v-if="isFullView && contentFlush" :style="{ height: `calc(100vh - ${scrollAreaHeight}px)`, overflow: 'hidden' }">
        <q-card-section class="x-dialog-section-full-height content-flush" style="height: 100%;">
          <slot name="content"/>
        </q-card-section>
      </div>

      <!-- Contenido full-view con scroll dinámico -->
      <div v-else-if="isFullView"
           ref="contentScrollRef"
           @scroll="onContentScroll"
           :style="{ height: `calc(100vh - ${scrollAreaHeight}px)`, overflowY: 'auto' }">
        <q-card-section class="q-pa-md">
          <slot name="content"/>
        </q-card-section>
      </div>

      <!-- Contenido fijo si no es scrollable -->
      <div ref="contentScrollRef"
           @scroll="onContentScroll"
           style="max-height:60vh; overflow-y:auto;"
           v-else>
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
      <x-loading :loading="loading" :icon="loadingIcon"/>
    </q-card>
  </q-dialog>
</template>
