# XDnd

Componente de drag & drop (reordenar listas) usado internamente por el diálogo de exportación de **XTableServer**. Está construido sobre `vuedraggable@4`.

## ⚠️ Requisito del proyecto CONSUMIDOR: alias de `vuedraggable`

`vuedraggable@4.x` **solo distribuye un build UMD que importa Vue internamente**. Al pre-bundlearse con Vite/esbuild junto con Vue, revienta con:

```
init_runtime_dom_esm_bundler is not defined
```

Esto afecta a **cualquier proyecto que consuma `@quirosys/x-components`** y use `XDnd` (o `XTableServer`, cuyo diálogo de export usa XDnd). La causa raíz es del paquete `vuedraggable`, así que la solución vive en la **configuración del consumidor**.

### Solución: aliasar `vuedraggable` a un stub ESM propio

1. Copia el stub `src/stubs/vuedraggable.js` a tu proyecto (implementación de referencia abajo). Reimplementa el subconjunto de la API que usa XDnd con **drag & drop nativo HTML5** (sin `sortablejs`): `v-model` / `:list`, `item-key`, `handle`, `tag`, slots `#header` / `#item="{ element, index }"` / `#footer`, y emite `change` / `start` / `end`.

2. Agrega el alias en tu `vite.config.js` (o `extendViteConf` de Quasar):

```js
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// dentro de extendViteConf(viteConf) { ... } o vite.config resolve
const projectRoot = path.dirname(fileURLToPath(import.meta.url))
viteConf.resolve.alias['vuedraggable'] =
  path.resolve(projectRoot, 'src/stubs/vuedraggable.js')
```

3. Listo — no requiere `vuedraggable` real instalado; el alias lo intercepta.

> Si tu proyecto NO usa `XDnd` ni `XTableServer`, el stub puede ser uno vacío mínimo. Si usas `XTableServer` (export dialog), usa el stub completo.

### Stub de referencia (`src/stubs/vuedraggable.js`)

Contrato mínimo que consume XDnd, con drag&drop nativo:

```js
import { defineComponent, h, ref } from 'vue'

export default defineComponent({
  name: 'VueDraggableStub',
  inheritAttrs: false,
  props: {
    modelValue: { type: Array, default: null },
    list: { type: Array, default: null },
    tag: { type: String, default: 'div' },
    itemKey: { type: [String, Function], default: 'id' },
    handle: { type: String, default: null },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'update:list', 'change', 'start', 'end', 'sort'],
  setup (props, { slots, emit, attrs }) {
    const dragIndex = ref(-1)
    const handleActive = ref(false)
    const currentList = () => (props.list !== null ? props.list : (props.modelValue || []))
    const keyOf = (el, i) => {
      if (typeof props.itemKey === 'function') return props.itemKey(el)
      if (props.itemKey && el && typeof el === 'object') return el[props.itemKey] ?? i
      return i
    }
    const commit = (next) => {
      if (props.list !== null) { props.list.splice(0, props.list.length, ...next); emit('update:list', props.list) }
      else emit('update:modelValue', next)
      emit('change', { moved: true }); emit('sort', { moved: true })
    }
    const reorder = (from, to) => {
      if (from === to || from < 0 || to < 0) return
      const next = currentList().slice(); const [m] = next.splice(from, 1); next.splice(to, 0, m); commit(next)
    }
    const onPointerDown = (e) => {
      if (!props.handle) { handleActive.value = true; return }
      const t = e.target; handleActive.value = !!(t && t.closest && t.closest(props.handle))
    }
    const onDragStart = (i, e) => {
      if (props.disabled || (props.handle && !handleActive.value)) { e.preventDefault(); return }
      dragIndex.value = i
      if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', String(i)) } catch (x) {} }
      emit('start', { oldIndex: i })
    }
    const onDragOver = (i, e) => {
      if (dragIndex.value === -1) return
      e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
      if (i !== dragIndex.value) { reorder(dragIndex.value, i); dragIndex.value = i }
    }
    const onDragEnd = () => { const o = dragIndex.value; dragIndex.value = -1; handleActive.value = false; emit('end', { newIndex: o }) }
    return () => {
      const rows = currentList().map((element, index) =>
        h('div', {
          key: keyOf(element, index), draggable: !props.disabled,
          style: dragIndex.value === index ? 'opacity:0.5;' : null,
          onMousedown: onPointerDown, onTouchstart: onPointerDown,
          onDragstart: (e) => onDragStart(index, e), onDragover: (e) => onDragOver(index, e),
          onDragend: onDragEnd, onDrop: (e) => e.preventDefault(),
        }, slots.item ? slots.item({ element, index }) : null))
      return h(props.tag || 'div', { ...attrs }, [
        slots.header ? slots.header() : null, rows, slots.footer ? slots.footer() : null,
      ])
    }
  },
})
```
