<script setup>
import { computed } from 'vue'
import XDnd from 'components/XDnd/XDnd.vue'

defineOptions({ name: 'XNested' })

const props = defineProps({
  list: { type: Array, default: () => [] },

  childrenKey: { type: String, default: 'children' },

  itemKey: { type: [String, Function], default: 'id' },
  group: { type: [String, Object], default: () => ({ name: 'x-tree' }) },
  handle: { type: String, default: '.handle' },
  tag: { type: String, default: 'ul' },
  disabled: { type: Boolean, default: false },

  rules: { type: Object, default: () => ({}) },

  parent: { type: Object, default: null },
  depth: { type: Number, default: 0 },

  rootClass: { type: [String, Array, Object], default: '' },
  childrenWrapClass: { type: [String, Array, Object], default: 'q-pl-lg' },

  renderChildrenIfEmpty: { type: Boolean, default: false },
  dragOverlay: { type: Boolean, default: true },

  showActions: { type: Boolean, default: false },
  showActionNew: { type: Boolean, default: true },
  showActionEdit: { type: Boolean, default: true },
  showActionDelete: { type: Boolean, default: true },

  actionIconNew: { type: String, default: 'fal fa-plus' },
  actionIconEdit: { type: String, default: 'fal fa-pencil' },
  actionIconDelete: { type: String, default: 'fal fa-trash' }
})

const emit = defineEmits([
  'tree-change',
  'dnd-start',
  'dnd-end',
  'click-new',
  'click-edit',
  'click-delete'
])

const hasChildren = (node) =>
  Array.isArray(node?.[props.childrenKey]) && node[props.childrenKey].length > 0

const getChildren = (node) =>
  Array.isArray(node?.[props.childrenKey]) ? node[props.childrenKey] : []

const containerMeta = computed(() => ({
  parent: props.parent,
  depth: props.depth
}))

const onEnd = (evt) => {
  emit('dnd-end', evt)
  emit('tree-change', { evt })
}
const onStart = (evt) => emit('dnd-start', evt)
</script>

<template>
  <div class="x-nested">
    <x-dnd
      :class="rootClass"
      :tag="tag"
      :list="list"
      :item-key="itemKey"
      :group="group"
      :handle="handle"
      :disabled="disabled"
      :rules="rules"
      :container-meta="containerMeta"
      :drag-overlay="dragOverlay"
      @start="onStart"
      @end="onEnd"
    >
      <template #item="{ element, index }">
        <li class="x-nested__item" tabindex="0">
          <!-- ✅ Nodo (slot) + Acciones -->
          <div class="x-nested__row row items-center no-wrap">
            <div class="x-nested__node col">
              <slot
                name="node"
                :node="element"
                :index="index"
                :depth="depth"
                :parent="parent"
              >
                <!-- fallback -->
                <div class="row items-center q-py-xs">
                  <span class="handle cursor-pointer q-mr-sm">⠿</span>
                  <div>{{ element?.label ?? element?.name ?? 'Node' }}</div>
                </div>
              </slot>
            </div>

            <!-- ✅ Acciones reutilizables -->
            <div v-if="showActions" class="x-nested__actions row items-center q-ml-sm">
              <slot name="actions" :node="element" :index="index" :depth="depth" :parent="parent">
                <!-- fallback de acciones -->
                <q-icon
                  v-if="showActionNew"
                  :name="actionIconNew"
                  size="xs"
                  class="x-nested__action-icon cursor-pointer q-ml-sm"
                  @click="emit('click-new', element)"
                />
                <q-icon
                  v-if="showActionEdit"
                  :name="actionIconEdit"
                  size="xs"
                  class="x-nested__action-icon cursor-pointer q-ml-sm"
                  @click="emit('click-edit', element)"
                />
                <q-icon
                  v-if="showActionDelete"
                  :name="actionIconDelete"
                  size="xs"
                  class="x-nested__action-icon cursor-pointer q-ml-sm"
                  color="red"
                  @click="emit('click-delete', element)"
                />
              </slot>
            </div>
          </div>

          <!-- Hijos -->
          <div
            v-if="renderChildrenIfEmpty ? Array.isArray(element?.[childrenKey]) : hasChildren(element)"
            class="x-nested__children"
            :class="childrenWrapClass"
          >
            <XNested
              :list="getChildren(element)"
              :children-key="childrenKey"
              :item-key="itemKey"
              :group="group"
              :handle="handle"
              :tag="tag"
              :disabled="disabled"
              :rules="rules"
              :parent="element"
              :depth="depth + 1"
              :root-class="rootClass"
              :children-wrap-class="childrenWrapClass"
              :render-children-if-empty="renderChildrenIfEmpty"
              :drag-overlay="dragOverlay"

              :show-actions="showActions"
              :show-action-new="showActionNew"
              :show-action-edit="showActionEdit"
              :show-action-delete="showActionDelete"
              :action-icon-new="actionIconNew"
              :action-icon-edit="actionIconEdit"
              :action-icon-delete="actionIconDelete"

              @tree-change="$emit('tree-change', $event)"
              @dnd-start="$emit('dnd-start', $event)"
              @dnd-end="$emit('dnd-end', $event)"
              @click-new="$emit('click-new', $event)"
              @click-edit="$emit('click-edit', $event)"
              @click-delete="$emit('click-delete', $event)"
            >
              <template #node="slotProps">
                <slot name="node" v-bind="slotProps" />
              </template>

              <template #actions="slotProps">
                <slot name="actions" v-bind="slotProps" />
              </template>

              <template #overlay="slotProps">
                <slot name="overlay" v-bind="slotProps" />
              </template>
            </XNested>
          </div>
        </li>
      </template>

      <template #overlay="{ element }">
        <slot name="overlay" :node="element" />
      </template>
    </x-dnd>
  </div>
</template>

<style lang="scss" src="./XNested.scss"></style>
