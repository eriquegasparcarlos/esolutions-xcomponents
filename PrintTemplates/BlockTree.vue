<script setup>
  import { ref, watch } from 'vue'
  import draggable from 'vuedraggable'
  import BlockNode from './BlockNode.vue'
  import { ensureBlockIds } from 'src/utils/printTemplateDsl.js'
  
  const props = defineProps({
    list: { type: Array, default: () => [] },
    group: { type: [String, Object], default: () => ({ name: 'print-blocks' }) },
    itemKey: { type: [String, Function], default: '__id' },
    handle: { type: String, default: '.block-handle' },
    tag: { type: String, default: 'div' },
  
    selectedId: { type: String, default: '' },
  
    // root | eachDo | ifThen | ifElse
    containerType: { type: String, default: 'root' },
  })
  
  const emit = defineEmits([
    'update:list',
    'select',
    'duplicate',
    'remove', // ✅ NUEVO (propagar hacia arriba)
  ])
  
  /**
   * ✅ No clonamos para DnD.
   */
  const localList = ref(props.list)
  
  watch(
    () => props.list,
    (v) => {
      localList.value = v
      ensureBlockIds(localList.value)
    },
    { immediate: true }
  )
  
  /**
   * ✅ Bloquear “cut” dentro de contenedores anidados
   */
  function onMove(evt) {
    if (props.containerType === 'root') return true
    const dragged = evt?.draggedContext?.element
    if (dragged?.cmd === 'cut') return false
    return true
  }
  
  /**
   * Cuando termina un cambio (drop)
   */
  function onChange() {
    emit('update:list', localList.value)
  }
  
  /**
   * Reemplaza un bloque actualizado dentro del array
   */
  function onChildUpdateBlock(updatedBlock) {
    const id = updatedBlock?.__id
    if (!id) return
    const idx = localList.value.findIndex(b => b?.__id === id)
    if (idx === -1) return
    localList.value[idx] = updatedBlock
    emit('update:list', localList.value)
  }
  
  /**
   * ✅ Eliminar bloque (desde botón)
   */
  function onRemoveBlock(block) {
    const id = block?.__id
    if (!id) return
    const idx = localList.value.findIndex(b => b?.__id === id)
    if (idx === -1) return
    localList.value.splice(idx, 1)
    emit('update:list', localList.value)
    emit('remove', block) // por si el padre quiere limpiar selected
  }
  </script>
  
  <template>
    <draggable
      :list="localList"
      :tag="props.tag"
      :group="props.group"
      :item-key="props.itemKey"
      :handle="props.handle"
      :animation="150"
      :force-fallback="true"
      :fallback-on-body="true"
      :touch-start-threshold="5"
      :move="onMove"
      @change="onChange"
    >
      <template #item="{ element }">
        <div class="x-dnd-item">
          <BlockNode
            :block="element"
            :selected-id="selectedId"
            :group="props.group"
            @select="b => emit('select', b)"
            @duplicate="b => emit('duplicate', b)"
            @remove="onRemoveBlock"
            @update:block="onChildUpdateBlock"
          />
        </div>
      </template>
    </draggable>
  </template>
  
  <style scoped>
  .x-dnd-item { width: 100%; }
  :deep(.block-handle) {
    touch-action: none;
    cursor: grab;
    user-select: none;
  }
  :deep(.block-handle:active) {
    cursor: grabbing;
  }
  </style>
  