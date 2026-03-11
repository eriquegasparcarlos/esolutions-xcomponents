<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue'
import { api } from 'src/services/api'

defineOptions({ name: 'XModulesTreePicker' })

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  nodes: { type: Array, default: null },
  endpoint: { type: String, default: '/modules/options' },
  label: { type: String, default: 'Módulos' },
  selectAllLabel: { type: String, default: 'Seleccionar todos' },
  nodeKey: { type: String, default: 'id' },
  labelKey: { type: String, default: 'label' },
  tickStrategy: { type: String, default: 'leaf' },
  accordion: { type: Boolean, default: true },
  showHeader: { type: Boolean, default: true },
  showCounter: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'loaded'])

const internalNodes = ref([])
const loading = ref(false)

const ticked = computed({
  get: () => (props.modelValue || []).map((v) => Number(v)),
  set: (val) => emit('update:modelValue', (val || []).map((v) => Number(v))),
})

function flattenNodes(nodes, out = []) {
  for (const n of nodes || []) {
    out.push(n)
    if (Array.isArray(n.children) && n.children.length) flattenNodes(n.children, out)
  }
  return out
}

const leafValues = computed(() => {
  const all = flattenNodes(internalNodes.value)
  return all.filter((n) => !n.children || n.children.length === 0).map((n) => Number(n[props.nodeKey]))
})

const allSelected = computed(() => {
  const leaf = leafValues.value
  if (!leaf.length) return false
  const current = new Set(ticked.value.map((v) => Number(v)))
  return leaf.every((v) => current.has(v))
})

const someSelected = computed(() => {
  const leaf = leafValues.value
  if (!leaf.length) return false
  const current = new Set(ticked.value.map((v) => Number(v)))
  const count = leaf.filter((v) => current.has(v)).length
  return count > 0 && count < leaf.length
})

const toggleSelectAll = () => {
  if (allSelected.value) {
    ticked.value = []
  } else {
    ticked.value = [...leafValues.value]
  }
}

async function loadNodes() {
  if (props.nodes && Array.isArray(props.nodes)) {
    internalNodes.value = props.nodes
    emit('loaded', internalNodes.value)
    return
  }

  loading.value = true
  try {
    const res = await api.get(props.endpoint)
    internalNodes.value = Array.isArray(res.data) ? res.data : res.data.data || []
    emit('loaded', internalNodes.value)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.nodes,
  (v) => {
    if (Array.isArray(v)) internalNodes.value = v
  },
)

onBeforeMount(loadNodes)
</script>

<template>
  <div>
    <div v-if="showHeader" class="row items-center q-mb-sm">
      <q-checkbox
        :model-value="allSelected"
        :indeterminate="someSelected"
        :label="selectAllLabel"
        :disable="loading"
        @update:model-value="toggleSelectAll"
      />
      <q-space />
      <div v-if="showCounter" class="text-caption text-grey-7">
        Seleccionados: {{ ticked.length }}
      </div>
    </div>

    <q-tree
      :nodes="internalNodes"
      :node-key="nodeKey"
      :label-key="labelKey"
      :tick-strategy="tickStrategy"
      :accordion="accordion"
      v-model:ticked="ticked"
      default-expand-all
    />
  </div>
</template>
