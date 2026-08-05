<script setup>
  import { computed, onBeforeUnmount, ref, useAttrs } from 'vue'
  import { VueDraggable } from 'vue-draggable-plus'

  defineOptions({ name: 'XDnd', inheritAttrs: false })

  /**
   * XDnd — wrapper de drag & drop sobre vue-draggable-plus (SortableJS).
   *
   * Migrado desde vuedraggable (UMD, abandonado) manteniendo la MISMA API pública:
   * v-model o :list, slot #item="{ element, index }", slots #header/#footer,
   * props de Sortable (animation, handle, group, ghost/chosen/drag class, …),
   * rules/canMove y el drag overlay flotante. Diferencias internas:
   * - El v-for de los items lo renderiza XDnd (vue-draggable-plus no trae slot #item).
   * - #header/#footer se renderizan FUERA del contenedor sortable (antes eran hijos
   *   no arrastrables dentro de él; ningún consumidor actual los usa dentro del flow).
   * - En onMove ya no existe draggedContext/relatedContext de vuedraggable: el
   *   elemento arrastrado se trackea en start/choose y se inyecta un shim compatible
   *   (evt.draggedContext.element) para rules.lockedKey / canMove / rules.custom.
   *   Para rules.maxItems, la lista destino se aproxima con evt.to.children.length.
   */
  const props = defineProps({
    // v-model o list
    modelValue: { type: Array, default: () => [] },
    list: { type: Array, default: null },

    // Sortable options
    tag: { type: String, default: 'div' },
    group: { type: [String, Object], default: () => ({ name: 'x-dnd' }) },
    itemKey: { type: [String, Function], default: 'id' },
    handle: { type: String, default: null },
    disabled: { type: Boolean, default: false },

    animation: { type: Number, default: 150 },
    ghostClass: { type: String, default: 'x-dnd-ghost' },
    chosenClass: { type: String, default: 'x-dnd-chosen' },
    dragClass: { type: String, default: 'x-dnd-drag' },

    // mejoras para Quasar/touch/navegadores
    forceFallback: { type: Boolean, default: true },
    fallbackOnBody: { type: Boolean, default: true },
    touchStartThreshold: { type: Number, default: 5 },

    /**
     * Drag Overlay (flotante)
     */
    dragOverlay: { type: Boolean, default: true },
    overlayOffsetX: { type: Number, default: 14 },
    overlayOffsetY: { type: Number, default: 14 },
    overlayZIndex: { type: Number, default: 9999 },

    /**
     * Reglas + hook
     */
    canMove: { type: Function, default: null },

    rules: { type: Object, default: () => ({}) },

    /**
     * Meta opcional del contenedor (útil en árboles)
     */
    containerMeta: { type: Object, default: null }
  })

  const emit = defineEmits([
    'update:modelValue',
    'update:list',
    'change',
    'start',
    'end',
    'add',
    'remove',
    'update',
    'choose',
    'unchoose',
    'sort',
    'move'
  ])

  const attrs = useAttrs()
  const isListMode = computed(() => props.list !== null)

  /**
   * Lista efectiva que se renderiza y se le pasa a VueDraggable.
   * - modo list: vue-draggable-plus muta el array en el set; replicamos la
   *   semántica de vuedraggable (mutar props.list in place) + notificar.
   * - modo v-model: emitimos update:modelValue como siempre.
   */
  const internalModel = computed({
    get() {
      return isListMode.value ? (props.list ?? []) : props.modelValue
    },
    set(val) {
      if (isListMode.value) {
        const target = props.list
        if (Array.isArray(target) && target !== val) {
          target.splice(0, target.length, ...val)
        }
        emit('update:list', target ?? [])
      } else {
        emit('update:modelValue', val)
        emit('update:list', val)
      }
    }
  })

  const keyOf = (element, index) => {
    if (typeof props.itemKey === 'function') return props.itemKey(element) ?? index
    return element?.[props.itemKey] ?? index
  }

  /**
   * helper: notificar lista actual
   */
  const notifyList = () => {
    emit('update:list', internalModel.value ?? [])
  }

  /**
   * ============ Drag Overlay ============
   */
  const isDragging = ref(false)
  const draggedElement = ref(null)
  const pointer = ref({ x: 0, y: 0 })

  const updatePointer = (e) => {
    const t = e.touches?.[0]
    pointer.value = {
      x: t?.clientX ?? e.clientX ?? 0,
      y: t?.clientY ?? e.clientY ?? 0
    }
  }

  const addPointerListeners = () => {
    window.addEventListener('mousemove', updatePointer, { passive: true })
    window.addEventListener('touchmove', updatePointer, { passive: true })
  }
  const removePointerListeners = () => {
    window.removeEventListener('mousemove', updatePointer)
    window.removeEventListener('touchmove', updatePointer)
  }

  onBeforeUnmount(() => removePointerListeners())

  const overlayStyle = computed(() => ({
    position: 'fixed',
    left: '0px',
    top: '0px',
    transform: `translate3d(${pointer.value.x + props.overlayOffsetX}px, ${pointer.value.y + props.overlayOffsetY}px, 0)`,
    zIndex: props.overlayZIndex,
    pointerEvents: 'none'
  }))

  /**
   * ============ Reglas ============
   */
  const countContainerDepth = (toEl) => {
    let depth = -1
    let node = toEl
    while (node) {
      if (node?.getAttribute?.('data-x-dnd-container') === '1') depth++
      node = node.parentElement
    }
    return Math.max(depth, 0)
  }

  const applyRules = (evt) => {
    const rules = props.rules || {}
    const dragged = evt?.draggedContext?.element
    const fromEl = evt?.from
    const toEl = evt?.to

    if (rules.lockedKey && dragged && dragged[rules.lockedKey]) return false
    if (rules.disallowCrossList && fromEl && toEl && fromEl !== toEl) return false

    if (rules.maxItems != null && fromEl && toEl && fromEl !== toEl) {
      // Sin relatedContext.list (vuedraggable), el tamaño de la lista destino se
      // aproxima por la cantidad de hijos del contenedor destino.
      const toList = evt?.relatedContext?.list
      const count = Array.isArray(toList) ? toList.length : (toEl?.children?.length ?? 0)
      if (count >= Number(rules.maxItems)) return false
    }

    if (rules.maxDepth != null && toEl) {
      const depth = countContainerDepth(toEl)
      if (depth >= Number(rules.maxDepth)) return false
    }

    if (rules.disallowDropIntoInactiveParent) {
      const meta = props.containerMeta || rules.containerMeta
      const parent = meta?.parent
      const k = rules.parentActiveKey ?? 'is_active'
      const v = rules.parentActiveValue ?? 'is_active'
      if (parent && parent[k] !== v) return false
    }

    if (typeof rules.custom === 'function') {
      const ok = rules.custom(evt, props.containerMeta)
      if (ok === false) return false
    }

    return true
  }

  /**
   * Shim de compatibilidad con la firma de vuedraggable: inyecta
   * draggedContext.element (trackeado en start/choose) sobre el evt nativo
   * de Sortable, para canMove / rules.custom escritos contra la API vieja.
   */
  const withDraggedContext = (evt) => {
    if (evt && !evt.draggedContext) {
      evt.draggedContext = { element: draggedElement.value }
    }
    return evt
  }

  const onMoveInternal = (evt, originalEvent) => {
    if (props.disabled) return false

    const shimmed = withDraggedContext(evt)

    if (typeof props.canMove === 'function') {
      const ok = props.canMove(shimmed, originalEvent)
      if (ok === false) return false
    }

    if (applyRules(shimmed) === false) return false

    emit('move', shimmed, originalEvent)
    return true
  }

  const forward = (name) => (evt) => {
    emit(name, evt)
    // vuedraggable emitía 'change' en add/remove/update; se sintetiza igual.
    if (name === 'add' || name === 'remove' || name === 'update') emit('change', evt)
    notifyList()
  }

  const elementAt = (evt) => internalModel.value?.[evt?.oldIndex] ?? null

  const onStart = (evt) => {
    isDragging.value = true
    draggedElement.value = elementAt(evt) ?? draggedElement.value
    addPointerListeners()
    emit('start', evt)
  }

  const onEnd = (evt) => {
    isDragging.value = false
    draggedElement.value = null
    removePointerListeners()
    emit('end', evt)
    notifyList()
  }
  const onChoose = (evt) => {
    draggedElement.value = elementAt(evt) ?? draggedElement.value
    emit('choose', evt)
    notifyList()
  }
  </script>

  <template>
    <slot name="header" />

    <VueDraggable
      v-bind="attrs"
      v-model="internalModel"
      :tag="tag"
      :group="group"
      :handle="handle"
      :disabled="disabled"
      :animation="animation"
      :ghost-class="ghostClass"
      :chosen-class="chosenClass"
      :drag-class="dragClass"
      :force-fallback="forceFallback"
      :fallback-on-body="fallbackOnBody"
      :touch-start-threshold="touchStartThreshold"
      :on-move="onMoveInternal"
      data-x-dnd-container="1"
      @start="onStart"
      @end="onEnd"
      @add="forward('add')"
      @remove="forward('remove')"
      @update="forward('update')"
      @choose="onChoose"
      @unchoose="forward('unchoose')"
      @sort="forward('sort')"
    >
      <template v-for="(element, index) in internalModel" :key="keyOf(element, index)">
        <slot name="item" :element="element" :index="index" />
      </template>
    </VueDraggable>

    <slot name="footer" />

    <teleport to="body" v-if="dragOverlay && isDragging">
      <div :style="overlayStyle" class="x-dnd-overlay">
        <slot name="overlay" :element="draggedElement">
          <div class="x-dnd-overlay__card">
            <div class="x-dnd-overlay__title">
              {{ draggedElement?.label ?? draggedElement?.name ?? 'Moving…' }}
            </div>
          </div>
        </slot>
      </div>
    </teleport>
  </template>

  <style scoped>
  /* clave para touch y para que el handle siempre sea “arrastrable” */
  :deep(.block-handle) {
    touch-action: none;
    cursor: grab;
  }
  :deep(.block-handle:active) {
    cursor: grabbing;
  }
  </style>
