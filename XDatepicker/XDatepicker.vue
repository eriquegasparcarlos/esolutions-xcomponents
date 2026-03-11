<!-- src/components/XDatepicker/XDatepicker.vue -->
<script setup>
import { computed, useAttrs } from 'vue'
import { date as DateUtils } from 'quasar'
import { formDefaults } from 'src/config/form'

defineOptions({ name: 'XDatepicker', inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [String, null], default: '' }, // puede venir null desde el padre
  isClassic: { type: Boolean, default: formDefaults.isClassic },

  dense: { type: Boolean, default: true },
  outlined: { type: Boolean, default: formDefaults.outlined },
  clearable: { type: Boolean, default: false },

  error: { type: String, default: null },

  valueMask: { type: String, default: 'YYYY-MM-DD' },   // lo que guardas (v-model)
  displayMask: { type: String, default: 'DD/MM/YYYY' }, // lo que muestras

  // QDate options(dateString 'YYYY/MM/DD') => boolean
  options: { type: Function, default: null },
})

const emit = defineEmits(['update:modelValue', 'change'])

const attrs = useAttrs()

const fallbackId = Math.random().toString(36).substring(2, 9)

const elementId = computed(() => {
  const token = attrs.id
  return token ? `app-q-input-${token}` : `app-q-input-${fallbackId}`
})

const elementLabel = computed(() => (props.isClassic ? attrs.label : undefined))
const label = computed(() => (props.isClassic ? null : attrs.label))

const hasError = computed(() => !!props.error)

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
  emit('update:modelValue', next)
  emit('change', next)
}

function clear() {
  emit('update:modelValue', '')
  emit('change', '')
}
</script>

<template>
  <div class="app-q-input flex-grow-1 x-input-datepicker" :class="attrs.class">
    <label
      v-if="label"
      :for="elementId"
      class="q-input__label mb-1"
      style="line-height: 15px;"
    >
      {{ label }}
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
        clearable: props.clearable,
        error: hasError,
        errorMessage: props.error || undefined,
        noErrorIcon: true,
        hideBottomSpace: !hasError
      }"
      @clear="clear"
    >
      <template #append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date
              :model-value="normalizedValue"
              :mask="props.valueMask"
              :options="props.options || undefined"
              @update:model-value="updateFromPicker"
            >
              <div class="row items-center justify-end q-gutter-sm">
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
