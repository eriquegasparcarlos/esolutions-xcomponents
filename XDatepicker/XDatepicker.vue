<!-- src/components/XDatepicker/XDatepicker.vue -->
<script setup>
import { computed, ref, useAttrs, watch } from 'vue'
import { date as DateUtils } from 'quasar'
import { formDefaults } from '@esolutions/js-utils'
import { ic } from '../icons/index.js'

defineOptions({ name: 'XDatepicker', inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [String, null], default: '' }, // puede venir null desde el padre
  isClassic: { type: Boolean, default: formDefaults.isClassic },

  dense: { type: Boolean, default: formDefaults.dense },
  outlined: { type: Boolean, default: formDefaults.outlined },
  clearable: { type: Boolean, default: false },

  // El campo de texto nunca se escribe a mano (la fecha se elige en el
  // calendario), así que readonly es lo que apaga el calendario: el icono sigue
  // visible para no alterar el layout, pero no abre el popup ni deja limpiar.
  readonly: { type: Boolean, default: false },

  // String o el array de Laravel 422, igual que XInput y XSelect: pasarle
  // `errors.campo` tal cual no tenia por que fallar solo en este componente.
  error: { type: [String, Array], default: null },

  /** Solo muestra el asterisco, no activa validacion nativa */
  isRequired: { type: Boolean, default: false },

  valueMask: { type: String, default: 'YYYY-MM-DD' },   // lo que guardas (v-model)
  displayMask: { type: String, default: 'DD/MM/YYYY' }, // lo que muestras

  // QDate options(dateString 'YYYY/MM/DD') => boolean
  options: { type: Function, default: null },

  autoClose: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'change'])

const attrs = useAttrs()
const popupRef = ref(null)

const fallbackId = Math.random().toString(36).substring(2, 9)

const elementId = computed(() => {
  const token = attrs.id
  return token ? `app-q-input-${token}` : `app-q-input-${fallbackId}`
})

const elementLabel = computed(() => (props.isClassic ? attrs.label : undefined))
const label = computed(() => (props.isClassic ? null : attrs.label))

// El error deja de verse en cuanto se elige una fecha, y vuelve si el servidor
// manda uno nuevo. Mismo criterio que XInput y XSelect.
const errorSilenciado = ref(false)

watch(() => props.error, () => { errorSilenciado.value = false })

const errorMessage = computed(() => {
  if (errorSilenciado.value) return null

  const e = props.error
  if (!e) return null

  return Array.isArray(e) ? e[0] : e
})

const hasError = computed(() => !!errorMessage.value)

// normaliza null -> ''
const normalizedValue = computed(() => (props.modelValue ?? ''))

const displayValue = computed(() => {
  const v = normalizedValue.value
  if (!v) return ''

  const d = DateUtils.extractDate(v, props.valueMask)
  if (!d) return v

  return DateUtils.formatDate(d, props.displayMask)
})

function updateFromPicker(val) {
  const next = val ?? ''
  errorSilenciado.value = true
  emit('update:modelValue', next)
  emit('change', next)
  if (props.autoClose) {
    popupRef.value?.hide()
  }
}

function clear() {
  emit('update:modelValue', '')
  emit('change', '')
}
</script>

<template>
  <div class="app-q-input flex-grow-1 x-input-datepicker" :class="[{ 'x-input-datepicker-large': !props.dense }, attrs.class]">
    <label
      v-if="label"
      :for="elementId"
      class="q-input__label mb-1"
      style="line-height: 15px;"
    >
      {{ label }} <span v-if="props.isRequired" class="text-negative" aria-hidden="true">*</span>
    </label>

    <q-input
      v-bind="{
        ...attrs,
        id: elementId,
        class: null,
        label: elementLabel,
        modelValue: displayValue,
        dense: props.dense,
        outlined: props.outlined,
        readonly: true,
        clearable: props.clearable && !props.readonly,
        error: hasError,
        errorMessage: errorMessage || undefined,
        noErrorIcon: true,
        hideBottomSpace: !hasError
      }"
      @clear="clear"
    >
      <template #append>
        <q-icon :name="ic('calendar')" :class="props.readonly ? 'cursor-not-allowed' : 'cursor-pointer'">
          <q-popup-proxy
            v-if="!props.readonly"
            ref="popupRef"
            cover
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date
              :model-value="normalizedValue"
              :mask="props.valueMask"
              :options="props.options || undefined"
              @update:model-value="updateFromPicker"
            >
              <div v-if="!autoClose" class="row items-center justify-end q-gutter-sm">
                <q-btn v-close-popup label="OK" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>

      <!-- reenvía slots -->
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}" />
      </template>
    </q-input>
  </div>
</template>
