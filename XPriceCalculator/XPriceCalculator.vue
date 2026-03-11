<script setup>
import {computed} from 'vue'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: ''
  },
  total: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'S/'
  },
  placeholder: {
    type: String,
    default: 'Ingrese el precio'
  }
})
const emit = defineEmits(['update:modelValue', 'focus'])

const display = computed({
  get() {
    return String(props.modelValue ?? '')
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

// Billetes estándar
const bills = [1, 2, 5, 10, 20, 50, 100];

// Filtra los billetes superiores o iguales al precio actual
const quickCashFiltered = computed(() => {
  const amount = parseFloat(props.total) || 0;
  return bills.filter(bill => bill >= amount);
});

const keys = [
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '.', '0', '←'
];

function isAction(key) {
  return key === '.' || key === '←';
}

function pressKey(key) {
  if (key === null) return;

  if (key === '←') {
    display.value = display.value.slice(0, -1)
  } else if (key === '.') {
    if (!display.value.includes('.')) {
      display.value += '.'
    }
  } else {
    if (display.value === '0') {
      display.value = key
    } else if (display.value === '' && key === '0') {
      display.value = '0'
    } else {
      display.value += key
    }
  }
  normalizeDisplay()
}

function quickCashSet(amount) {
  display.value = parseFloat(amount).toFixed(2)
}

function validateInput(e) {
  let value = e.target.value

  value = value.replace(/[^0-9.]/g, '')
  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }
  if (parts[1]?.length > 2) {
    value = parts[0] + '.' + parts[1].slice(0, 2)
  }
  if (value.startsWith('0') && !value.startsWith('0.')) {
    value = value.replace(/^0+/, '')
    if (value === '') value = '0'
  }
  display.value = value
}

function normalizeDisplay() {
  if ((display.value.match(/\./g) || []).length > 1) {
    const parts = display.value.split('.')
    display.value = parts[0] + '.' + parts.slice(1).join('')
  }
  const parts = display.value.split('.')
  if (parts[1]?.length > 2) {
    display.value = parts[0] + '.' + parts[1].slice(0, 2)
  }
  if (/^0[0-9]+$/.test(display.value)) {
    display.value = display.value.replace(/^0+/, '')
  }
}
</script>

<template>
  <div class="price-calc">
    <div class="input-wrapper">
      <span class="currency">{{ currency}} </span>
      <input
        type="text"
        v-model="display"
        class="price-calc-input"
        :placeholder="placeholder"
        @focus="$emit('focus')"
        @input="validateInput"
        inputmode="decimal"
        autocomplete="off"
      />
    </div>

    <!-- Quick cash buttons: SOLO los mayores al monto actual, máx 4 visibles y scroll horizontal -->
    <div class="quick-cash-viewport" v-if="quickCashFiltered.length">
      <div class="quick-cash-row">
        <button
          v-for="(amount, idx) in quickCashFiltered"
          :key="idx"
          class="quick-cash-btn"
          @click="quickCashSet(amount)"
        >
          {{ currency}} {{ amount }}
        </button>
      </div>
    </div>

    <div class="price-calc-keypad">
      <button
        v-for="(key, idx) in keys"
        :key="idx"
        @click="pressKey(key)"
        :class="['key', { action: isAction(key) }]"
        :disabled="key === null">
        <i v-if="key === '←'" class="fa-solid fa-backspace"></i>
        <span v-else>{{ key }}</span>
      </button>
    </div>
  </div>
</template>
