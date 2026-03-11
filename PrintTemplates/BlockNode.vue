<script setup>
  import BlockTree from './BlockTree.vue'
  import { makeId } from 'src/utils/printTemplateDsl.js'

  const props = defineProps({
    block: { type: Object, required: true },
    selectedId: { type: String, default: '' },
    group: { type: [String, Object], default: () => ({ name: 'print-blocks' }) },
  })

  const emit = defineEmits([
    'select',
    'duplicate',
    'remove',       // ✅ NUEVO
    'update:block', // <- important
  ])

  const isSelected = () => props.block?.__id && props.block.__id === props.selectedId

  function selectMe() {
    emit('select', props.block)
  }

  function duplicateMe() {
    emit('duplicate', props.block)
  }

  // ✅ NUEVO
  function removeMe() {
    emit('remove', props.block)
  }

  function updateBlock(patch) {
    // create a new object reference (no prop mutation)
    emit('update:block', { ...props.block, ...patch })
  }

  // ---- helpers to safely add children without mutating props.block
  function addEachChild() {
    const doList = Array.isArray(props.block.do) ? props.block.do : []
    updateBlock({
      do: [...doList, { __id: makeId(), cmd: 'text', value: '\n' }]
    })
  }

  function addThenChild() {
    const thenList = Array.isArray(props.block.then) ? props.block.then : []
    updateBlock({
      then: [...thenList, { __id: makeId(), cmd: 'text', value: '\n' }]
    })
  }

  function addElseChild() {
    const elseList = Array.isArray(props.block.else) ? props.block.else : []
    updateBlock({
      else: [...elseList, { __id: makeId(), cmd: 'text', value: '\n' }]
    })
  }

  // ---- when nested list changes (DnD), emit block update
  function updateEachDo(newList) {
    updateBlock({ do: newList })
  }
  function updateIfThen(newList) {
    updateBlock({ then: newList })
  }
  function updateIfElse(newList) {
    updateBlock({ else: newList })
  }
  </script>

  <template>
    <div
      class="q-pa-sm q-mb-sm"
      :class="isSelected() ? 'bg-blue-1' : 'bg-grey-1'"
      style="border-radius: 12px;"
    >
      <div class="row items-center no-wrap">
        <div class="block-handle q-mr-sm" style="cursor: grab; user-select:none;">
          ⠿
        </div>

        <div class="col" style="cursor:pointer" @click="selectMe">
          <div class="text-weight-medium">{{ block.cmd }}</div>

          <div class="text-caption text-grey-7">
            <template v-if="block.cmd === 'text'">
              {{ block.value }}
            </template>

            <template v-else-if="block.cmd === 'align'">
              align={{ block.value ?? 'left' }}
            </template>

            <template v-else-if="block.cmd === 'bold'">
              bold={{ block.value === true ? 'on' : 'off' }}
            </template>

            <template v-else-if="block.cmd === 'underline'">
              underline={{ block.value === true ? 'on' : 'off' }}
            </template>

            <template v-else-if="block.cmd === 'feed'">
              feed={{ block.value ?? 1 }}
            </template>

            <template v-else-if="block.cmd === 'each'">
              path={{ block.path }}, as={{ block.as }}, do={{ block.do?.length ?? 0 }}
            </template>

            <template v-else-if="block.cmd === 'cols'">
              cols={{ block.value?.length ?? 0 }}
            </template>

            <template v-else-if="block.cmd === 'if'">
              if {{ block.test?.path }} {{ block.test?.op }} {{ block.test?.value }}
            </template>

            <template v-else-if="block.cmd === 'hr' || block.cmd === 'cut'"></template>

            <template v-else>
              <!-- fallback -->
              value={{ block.value }}
            </template>
          </div>

        </div>

        <q-btn dense flat icon="content_copy" @click.stop="duplicateMe" title="Duplicate" />
        <q-btn dense flat icon="delete" color="negative" @click.stop="removeMe" title="Delete" />
      </div>

      <!-- each.do -->
      <div v-if="block.cmd === 'each'" class="q-mt-sm q-ml-md">
        <div class="row items-center q-mb-xs">
          <div class="text-caption text-grey-8">EACH: do</div>
          <q-space />
          <q-btn dense flat icon="add" @click="addEachChild" />
        </div>

        <BlockTree
          :list="Array.isArray(block.do) ? block.do : []"
          @update:list="updateEachDo"
          :group="group"
          :selected-id="selectedId"
          container-type="eachDo"
          @select="b => emit('select', b)"
          @duplicate="b => emit('duplicate', b)"
          @remove="b => emit('remove', b)"
          @update:block="() => {}"
        />
      </div>

      <!-- if.then / if.else -->
      <div v-if="block.cmd === 'if'" class="q-mt-sm q-ml-md">
        <div class="row items-center q-mb-xs">
          <div class="text-caption text-grey-8">IF: then</div>
          <q-space />
          <q-btn dense flat icon="add" @click="addThenChild" />
        </div>

        <BlockTree
          :list="Array.isArray(block.then) ? block.then : []"
          @update:list="updateIfThen"
          :group="group"
          :selected-id="selectedId"
          container-type="ifThen"
          @select="b => emit('select', b)"
          @duplicate="b => emit('duplicate', b)"
          @remove="b => emit('remove', b)"
        />

        <div class="row items-center q-mt-sm q-mb-xs">
          <div class="text-caption text-grey-8">IF: else</div>
          <q-space />
          <q-btn dense flat icon="add" @click="addElseChild" />
        </div>

        <BlockTree
          :list="Array.isArray(block.else) ? block.else : []"
          @update:list="updateIfElse"
          :group="group"
          :selected-id="selectedId"
          container-type="ifElse"
          @select="b => emit('select', b)"
          @duplicate="b => emit('duplicate', b)"
          @remove="b => emit('remove', b)"
        />
      </div>
    </div>
  </template>
