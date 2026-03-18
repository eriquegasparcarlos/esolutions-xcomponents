<script setup>
import {computed} from 'vue'
import {useAttrs} from 'vue'
import VueDatepicker from "@vuepic/vue-datepicker"
import { formDefaults } from '@esolutions/js-utils'
import '@vuepic/vue-datepicker/dist/main.css'

const props = defineProps({
  isClassic: {
    type: Boolean,
    default: formDefaults.isClassic,
  }
})

defineOptions({
  name: 'XTimepicker',
  inheritAttrs: false,
})

// Obtenemos todos los atributos pasados al componente
const attrs = useAttrs();

// Generamos un ID de respaldo de forma única en el setup.
// Este ID se usará en caso de que no se proporcione un atributo "id".
const fallbackId = `${Math.random().toString(36).substring(2, 9)}`;

// Computamos el ID del elemento: si se recibe un "id" lo usamos con prefijo,
// de lo contrario, se utiliza el ID generado en fallback.
const elementId = computed(() => {
  const _elementIdToken = attrs.id;
  return _elementIdToken ? `app-q-input-${_elementIdToken}` : fallbackId;
})

const elementLabel = computed(() => {
  const _elementLabel = attrs.label;
  return props.isClassic ? _elementLabel : undefined;
})

// Extraemos la propiedad "label" de los atributos
const label = computed(() => {
  return props.isClassic ? null : attrs.label;
})
</script>

<template>
  <div class="app-q-input flex-grow-1" :class="attrs.class">
    <!-- Mostramos el label de forma personalizada si se ha definido -->
    <label v-if="label"
           :for="`dp-input-${elementId}`"
           class="q-input__label mb-1"
           style="line-height: 15px;">
      {{ label }}
    </label>
    <VueDatepicker v-bind="{
        ...attrs,
        class: null,        // Removemos la clase para evitar duplicidad
        label: elementLabel,   // Eliminamos el label para que no lo procese internamente q-input
        uid: elementId,      // Asignamos el ID calculado para asociar el label con el input
        locale:'es',
        timePicker:true,
        teleport:true,
        clearable:false
      }">
      <!-- Se renderizan dinámicamente todos los slots pasados al componente -->
      <template v-for="(_, name) in $slots"
                #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}"/>
      </template>
      <template #input-icon>
        <i class="fal fa-clock"></i>
      </template>
    </VueDatepicker>
  </div>
</template>
