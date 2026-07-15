<script setup>
import { computed, ref, useAttrs, useSlots } from 'vue'
import { formDefaults } from '@esolutions/js-utils'

defineOptions({ name: 'XInputNumeric', inheritAttrs: false })

const props = defineProps({
  modelValue: [Number, String, null],
  isClassic: { type: Boolean, default: formDefaults.isClassic },
  dense: { type: Boolean, default: formDefaults.dense },
  error: { type: String, default: null },
  inputDebounce: { type: [Number, String], default: 0 },
  autofocus: { type: Boolean, default: false },
  isRequired: { type: Boolean, default: false },
  prefix: { type: String, default: null },
  suffix: { type: String, default: null },
  /** Muestra botones −/+ dentro del input para incrementar/decrementar. */
  stepper: { type: Boolean, default: false },
  /** Paso del stepper. */
  step: { type: Number, default: 1 },
  /** Límites del valor (aplican solo vía stepper). */
  min: { type: Number, default: null },
  max: { type: Number, default: null },
})
const emit = defineEmits(['update:modelValue', 'input', 'change'])

const attrs = useAttrs()
const slots = useSlots()
// El q-field outlined trae padding: 0 12px por defecto. Cuando hay botones
// (stepper o un prepend/append custom, ej. segmento %|S/) ese padding sobra
// del lado del botón — se reduce para que quede a distancia pareja del borde.
// El stepper tiene botón en ambos lados; un prepend/append custom (que no
// sea el stepper) solo ajusta su lado correspondiente.
const hasButtonsPrepend = computed(() => props.stepper || !!slots.prepend)
const hasButtonsAppend  = computed(() => props.stepper)
const fallbackId = `app-q-input-${Math.random().toString(36).slice(2, 11)}`
const elementId = computed(() => (attrs.id ? `app-q-input-${attrs.id}` : fallbackId))
const elementLabel = computed(() => (props.isClassic ? attrs.label : undefined))
const label = computed(() => (props.isClassic ? null : attrs.label))

const prefixValue = computed(() => props.prefix || attrs.prefix || null)
const suffixValue = computed(() => props.suffix || attrs.suffix || null)

function toNum(v) {
  if (v === '' || v == null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

// ── Stepper ──────────────────────────────────────────────────────────────────
const isInteractable = computed(() => {
  const disabled = attrs.disable === '' || attrs.disable === true
  const readonly = attrs.readonly === '' || attrs.readonly === true
  return !disabled && !readonly
})

function stepBy(delta) {
  if (!isInteractable.value) return
  const current = toNum(props.modelValue) ?? 0
  let next = Math.round((current + delta) * 1e6) / 1e6
  if (props.min != null && next < props.min) next = props.min
  if (props.max != null && next > props.max) next = props.max
  emit('update:modelValue', next)
  emit('change', next)
}

const canDecrease = computed(() =>
  isInteractable.value && (props.min == null || (toNum(props.modelValue) ?? 0) > props.min)
)
const canIncrease = computed(() =>
  isInteractable.value && (props.max == null || (toNum(props.modelValue) ?? 0) < props.max)
)

const filteredAttrs = computed(() => {
  // eslint-disable-next-line no-unused-vars
  const { class: _c, label: _l, id: _i, required: _r, 'is-required': _ir, prefix: _p, suffix: _s, type: _t, ...rest } = attrs
  return rest
})

const inputRef = ref(null)
function focus() { inputRef.value?.focus?.() }
function select() { inputRef.value?.select?.() }
function focusAndSelect() { focus(); select() }
defineExpose({ focus, select, focusAndSelect })
</script>

<template>
  <div
    class="app-q-input flex-grow-1 x-input-numeric"
    :class="[
      {
        'x-input-numeric--large': !props.dense,
        'x-input-numeric--tight-left': hasButtonsPrepend,
        'x-input-numeric--tight-right': hasButtonsAppend,
      },
      attrs.class,
    ]"
  >
    <!-- Label manual (no classic) -->
    <label
      v-if="label"
      :for="elementId"
      class="q-input__label q-mb-xs"
      style="line-height: 22px"
      :aria-required="props.isRequired ? 'true' : 'false'"
    >
      {{ label }}
      <span v-if="props.isRequired" class="text-negative" aria-hidden="true">*</span>
    </label>

    <q-input
      ref="inputRef"
      v-bind="{
        ...filteredAttrs,
        class: null,
        label: elementLabel,
        outlined: formDefaults.outlined,
        dense: props.dense,
        for: elementId,
        type: 'number',
        debounce: props.inputDebounce,
        autofocus: props.autofocus,
        'aria-required': props.isRequired ? 'true' : null,
      }"
      :model-value="modelValue"
      :error="!!error"
      :error-message="error"
      no-error-icon
      :hide-bottom-space="!error"
      :label-slot="!!elementLabel"
      :input-class="props.stepper ? 'text-center' : null"
      @update:model-value="val => emit('update:modelValue', toNum(val))"
      @input="e => emit('input', e)"
      @change="e => emit('change', e)"
    >
      <template v-if="elementLabel" #label>
        <span>{{ elementLabel }}</span>
        <span v-if="props.isRequired" class="text-negative" aria-hidden="true">*</span>
      </template>

      <template v-if="stepper || prefixValue || $slots.prepend" #prepend>
        <button
          v-if="stepper"
          type="button"
          class="x-input-numeric__step"
          :disabled="!canDecrease"
          aria-label="Disminuir"
          tabindex="-1"
          @click="stepBy(-step)"
        >&minus;</button>
        <span v-if="prefixValue" class="x-input-numeric__affix">{{ prefixValue }}</span>
        <slot name="prepend" />
      </template>

      <template v-if="stepper || suffixValue || $slots.append" #append>
        <span v-if="suffixValue" class="x-input-numeric__affix">{{ suffixValue }}</span>
        <slot name="append" />
        <button
          v-if="stepper"
          type="button"
          class="x-input-numeric__step"
          :disabled="!canIncrease"
          aria-label="Aumentar"
          tabindex="-1"
          @click="stepBy(step)"
        >+</button>
      </template>
    </q-input>
  </div>
</template>

<style scoped>
.x-input-numeric__affix {
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
  line-height: 1;
  user-select: none;
}

/* Botones stepper −/+ integrados — mismo tamaño y fondo que otros grupos
   de botones dentro de XInputNumeric (ej. segmento %|monto). */
.x-input-numeric__step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: #f1f5f9;
  color: var(--q-primary, #2563eb);
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  transition: background 0.12s;
}
.x-input-numeric__step:hover:not(:disabled) {
  background: #e2e8f0;
}
.x-input-numeric__step:disabled {
  background: #f1f5f9;
  color: rgba(0, 0, 0, 0.25);
  cursor: not-allowed;
}

/* El q-field outlined trae padding: 0 12px — cuando el prepend/append son
   botones (no solo texto/prefijo) se reduce ese lado para que el botón
   quede a distancia pareja del borde (igual que arriba/abajo). */
.x-input-numeric--tight-left :deep(.q-field__control) {
  padding-left: 6px !important;
}
.x-input-numeric--tight-right :deep(.q-field__control) {
  padding-right: 6px !important;
}

/* Ocultar flechas nativas del input number */
.x-input-numeric :deep(input[type="number"]::-webkit-inner-spin-button),
.x-input-numeric :deep(input[type="number"]::-webkit-outer-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}
.x-input-numeric :deep(input[type="number"]) {
  -moz-appearance: textfield;
}
</style>
