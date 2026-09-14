<script setup>
import { ref, watch, computed, getCurrentInstance } from 'vue'
import { useQuasar } from 'quasar'

import XCellRenderer from './XCellRenderer.vue'
import XConfirmAction from '../XConfirmAction/XConfirmAction.vue'

// registra aquí tus componentes interactivos
import XToggle from '../XToggle/XToggle.vue'
import XCheckbox from '../XCheckbox/XCheckbox.vue'
import XInput from '../XInput/XInput.vue'
import XSelect from '../XSelect/XSelect.vue'

defineOptions({ name: 'XCellColumnRenderer' })

const props = defineProps({
  cell: { type: [Object, String, Number, Boolean], default: null },
  row: { type: Object, default: null },
})

const emit = defineEmits(['refresh', 'loading', 'cell-action'])

const { proxy } = getCurrentInstance()
const $q = useQuasar()

const componentsMap = {
  XToggle,
  XCheckbox,
  XInput,
  XSelect,
}

const isComponentCell = computed(() =>
  props.cell && typeof props.cell === 'object' && props.cell.type_input === 'component'
)

const hasConfirm = computed(() => {
  const confirm = props.cell?.action?.confirm
  return !!(confirm && (confirm.title || confirm.message))
})

// Lo que muestra el componente.
const localValue = ref(null)
// El último valor que el servidor aceptó (o el que llegó con la celda).
//
// Va aparte porque `v-model` escribe `localValue` ANTES de que corra
// `@update:modelValue`: leer ahí `localValue` como "valor anterior" devolvía el
// nuevo, y deshacer un cambio cancelado o rechazado no hacía nada.
const committedValue = ref(null)
const saving = ref(false)
const confirmRef = ref(null)
let debounceTimer = null

watch(
  () => props.cell,
  (c) => {
    if (c && typeof c === 'object' && c.type_input === 'component') {
      localValue.value = c.modelValue
      committedValue.value = c.modelValue
    }
  },
  { immediate: true }
)

const t = (key, fallback) => (typeof proxy.$t === 'function' ? proxy.$t(key) : fallback)

function resolveUrl(url) {
  if (!url) return url
  const id = props.row?.id ?? ''
  return String(url).replaceAll('{id}', id)
}

/**
 * Reemplaza '$value' en data plano (suficiente para 90% de casos).
 * Si quieres soportar nested arrays/objects, se puede hacer recursivo.
 */
function buildData(template, value) {
  if (!template || typeof template !== 'object') return {}
  const out = {}
  for (const k in template) {
    out[k] = template[k] === '$value' ? value : template[k]
  }
  return out
}

function escapeHtml(text) {
  return String(text ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

/** Texto visible de un valor: la etiqueta de su opción si la celda tiene `options`. */
function labelOf(value) {
  const p = props.cell?.props || {}
  const options = Array.isArray(p.options) ? p.options : []
  const keyValue = p.optionValue || 'id'
  const keyLabel = p.optionLabel || 'name'

  const option = options.find((o) => (o && typeof o === 'object' ? o[keyValue] === value : o === value))
  if (option === undefined) return value ?? ''

  return typeof option === 'object' ? (option[keyLabel] ?? value) : option
}

/**
 * `{label}` y `{value}` en el título o el mensaje de la confirmación se cambian
 * por lo que el usuario eligió ("¿Cambiar a {label}?"). Se escapan: el mensaje
 * se pinta como HTML.
 */
function fillConfirmText(text, nextValue) {
  return String(text)
    .replaceAll('{label}', escapeHtml(labelOf(nextValue)))
    .replaceAll('{value}', escapeHtml(nextValue))
}

/** Envía el cambio. No lanza: los errores se avisan aquí mismo. */
async function sendAction(nextValue) {
  const action = props.cell.action
  const method = (action.method || 'post').toLowerCase()
  const url = resolveUrl(action.url)
  const data = buildData(action.data, nextValue)
  const refresh = action.refresh !== false
  const optimistic = action.optimistic !== false

  if (optimistic) localValue.value = nextValue

  try {
    saving.value = true
    emit('loading', true)
    const res = await proxy.$api.request({ method, url, data })
    const success = res?.data?.success !== false

    // notify: showNotify lee el mensaje del backend; notify.success usa texto fijo
    if (action.showNotify) {
      const msg = res?.data?.message
      if (msg) $q.notify({ type: success ? 'positive' : 'negative', message: msg })
    } else if (success && action.notify?.success) {
      $q.notify({ type: 'positive', message: action.notify.success })
    }

    // Un 200 con success=false también es un "no": el componente vuelve atrás.
    if (success) {
      committedValue.value = nextValue
      localValue.value = nextValue
    } else {
      localValue.value = committedValue.value
    }

    if (refresh) emit('refresh')
  } catch (err) {
    localValue.value = committedValue.value

    const msg =
      err?.response?.data?.message ||
      err?.message ||
      t('common.actionError', 'No se pudo completar la acción')

    $q.notify({ type: 'negative', message: msg })
  } finally {
    saving.value = false
    emit('loading', false)
  }
}

async function runAction(nextValue) {
  const action = props.cell?.action
  if (!action || action.type !== 'api') return

  if (!hasConfirm.value) {
    await sendAction(nextValue)
    return
  }

  // Con confirmación, NADA se envía hasta que el usuario confirma. El componente
  // muestra el valor vigente mientras el diálogo está abierto, así que cancelar o
  // cerrar el diálogo no deja un valor que no se guardó.
  //
  // (Antes se hacía `await $q.dialog(...)`, pero $q.dialog no devuelve una
  // promesa: el await terminaba al instante y el cambio se guardaba sin esperar.)
  localValue.value = committedValue.value

  const confirm = action.confirm
  confirmRef.value?.open({
    variant: confirm.variant || 'primary',
    icon: confirm.icon,
    title: fillConfirmText(confirm.title || t('common.confirm', 'Confirmar'), nextValue),
    message: fillConfirmText(confirm.message || t('common.wantToContinue', '¿Desea continuar?'), nextValue),
    confirmLabel: confirm.confirmLabel,
    cancelLabel: confirm.cancelLabel,
    onConfirm: () => sendAction(nextValue),
  })
}

function onUpdateModelValue(val) {
  if (val === committedValue.value) return

  const action = props.cell?.action
  const debounceMs = Number(action?.debounce || 0)

  if (debounceMs > 0) {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => runAction(val), debounceMs)
    return
  }
  runAction(val)
}
</script>

<template>
  <!-- 1) Celda interactiva -->
  <template v-if="isComponentCell">
    <component
      :is="componentsMap[cell.component]"
      v-model="localValue"
      v-bind="cell.props"
      :disable="(cell.props?.disable ?? false) || saving"
      @update:modelValue="onUpdateModelValue"
    />

    <!-- Confirmación con el diseño de XDialogAction; solo se monta si la acción la pide. -->
    <x-confirm-action v-if="hasConfirm" ref="confirmRef" />
  </template>

  <!-- 2) Celda normal (tu renderer actual) -->
  <template v-else>
    <x-cell-renderer :cell="cell" @cell-action="emit('cell-action', $event)" />
  </template>
</template>
