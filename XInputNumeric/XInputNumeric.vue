<script setup>
import { computed, ref, useAttrs } from 'vue'
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
})
const emit = defineEmits(['update:modelValue', 'input', 'change'])

const attrs = useAttrs()
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
  <div class="app-q-input flex-grow-1 x-input-numeric" :class="attrs.class">
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
      @update:model-value="val => emit('update:modelValue', toNum(val))"
      @input="e => emit('input', e)"
      @change="e => emit('change', e)"
    >
      <template v-if="elementLabel" #label>
        <span>{{ elementLabel }}</span>
        <span v-if="props.isRequired" class="text-negative" aria-hidden="true">*</span>
      </template>

      <template v-if="prefixValue" #prepend>
        <span class="x-input-numeric__affix">{{ prefixValue }}</span>
      </template>

      <template v-if="suffixValue" #append>
        <span class="x-input-numeric__affix">{{ suffixValue }}</span>
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
