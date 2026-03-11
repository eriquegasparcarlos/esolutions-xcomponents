<script setup>
import {computed, getCurrentInstance, ref} from 'vue'
import {useQuasar} from 'quasar'
import XInput from 'components/XInput/XInput.vue'
import XButton from 'components/XButton/XButton.vue'

defineOptions({
  name: 'XInputSearchPerson',
})

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  identityDocumentTypeId: {
    type: [String, Number],
    default: '6'
  },
  showButton: {
    type: Boolean,
    default: true
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])
const {proxy} = getCurrentInstance()
const $q = useQuasar()

const buttonLoading = ref(false)
const buttonDisable = ref(false)

/** v-model interno: sincroniza con el padre */
const innerValue = computed({
  get: () => (props.modelValue ?? '').toString(),
  set: (val) => emit('update:modelValue', val)
})

const calculatedMaxlength = computed(() => {
  const t = String(props.identityDocumentTypeId)
  if (t === '6') return 11   // RUC
  if (t === '1') return 8    // DNI
  return 20
})

const label = computed(() => {
  const t = String(props.identityDocumentTypeId)
  if (t === '6') return 'RUC'
  if (t === '1') return 'DNI'
  return 'Numero'
})

/** habilita el boton solo si hay largo exacto para RUC/DNI */
const canSearch = computed(() => {
  const t = String(props.identityDocumentTypeId)
  if (t === '6') return innerValue.value.length === 11
  if (t === '1') return innerValue.value.length === 8
  return innerValue.value.length > 0
})

const handleButtonClick = async () => {
  if (!canSearch.value) return
  $q.loading.show()
  buttonLoading.value = true
  buttonDisable.value = true

  try {
    const {data} = await proxy.$api.post('/store/customer-search-service', {
      identity_document_type_id: props.identityDocumentTypeId,
      number: innerValue.value
    })
    if (data.success) {
      emit('success', data.data)
    } else {
      $q.notify({type: 'negative', icon: 'fa-light fa-xmark', message: data?.message || 'No se encontro resultado'})
    }
  } catch (e) {
    $q.notify({type: 'negative', message: e.message})
  } finally {
    buttonDisable.value = false
    buttonLoading.value = false
    $q.loading.hide()
  }
}
</script>

<template>
  <div class="x-input-search-person">
    <x-input v-model="innerValue"
             :label="label"
             :maxlength="calculatedMaxlength"
             :readonly="readonly"
             @keyup.enter="handleButtonClick">
      <template #after v-if="showButton">
        <x-button label="Buscar"
                  @click="handleButtonClick"
                  :loading="buttonLoading"
                  :disable="buttonDisable || !canSearch"
        />
      </template>
    </x-input>
  </div>
</template>
