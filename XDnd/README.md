# XDnd

Componente de drag & drop (reordenar listas, mover entre listas, árboles) construido sobre **`vue-draggable-plus`** (SortableJS, ESM) desde **v2.5.0**. Lo usan internamente `XTableServer` (orden de columnas del diálogo de exportación), `XNested` (árboles) y `PrintTemplates`.

> Hasta v2.4.x estaba construido sobre `vuedraggable@4` (UMD, abandonado), que exigía configuración especial en el consumidor (`optimizeDeps.include` o alias a un stub). **Desde v2.5.0 no se requiere NINGUNA configuración de Vite** — ver "Historial / legacy" abajo si consumes un tag viejo.

## Instalacion

```vue
<script setup>
import XDnd from '@esolutions/x-components/XDnd/XDnd.vue'
</script>
```

## Props

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `modelValue` | `Array` | `[]` | Lista (v-model, inmutable: emite `update:modelValue`) |
| `list` | `Array` | `null` | Modo alternativo: lista mutada in place (emite `update:list`) |
| `tag` | `String` | `'div'` | Elemento raíz del contenedor |
| `group` | `String \| Object` | `{ name: 'x-dnd' }` | Grupo Sortable (mismo nombre = arrastre entre listas) |
| `itemKey` | `String \| Function` | `'id'` | Key de cada item (campo o función) |
| `handle` | `String` | `null` | Selector CSS del agarre (ej. `.block-handle`) |
| `disabled` | `Boolean` | `false` | Desactiva el drag |
| `animation` | `Number` | `150` | Duración de la animación (ms) |
| `ghostClass` / `chosenClass` / `dragClass` | `String` | `x-dnd-*` | Clases de estado de Sortable |
| `forceFallback` | `Boolean` | `true` | Fallback no-nativo (mejor en Quasar/touch) |
| `fallbackOnBody` | `Boolean` | `true` | El clon del drag se monta en `<body>` |
| `touchStartThreshold` | `Number` | `5` | Píxeles antes de iniciar drag táctil |
| `dragOverlay` | `Boolean` | `true` | Overlay flotante junto al cursor durante el drag |
| `overlayOffsetX/Y` | `Number` | `14` | Offset del overlay |
| `overlayZIndex` | `Number` | `9999` | z-index del overlay |
| `canMove` | `Function` | `null` | Hook `(evt, originalEvent) => boolean` — `false` cancela el movimiento |
| `rules` | `Object` | `{}` | Reglas declarativas (ver abajo) |
| `containerMeta` | `Object` | `null` | Meta del contenedor (útil en árboles; la recibe `rules.custom`) |

### `rules`

| Regla | Descripcion |
|------|-------------|
| `lockedKey` | Si el elemento arrastrado tiene ese campo truthy, no se mueve |
| `disallowCrossList` | Prohíbe mover a otra lista |
| `maxItems` | Máximo de items en la lista destino (aprox. por hijos del contenedor destino) |
| `maxDepth` | Profundidad máxima de anidamiento (contenedores `data-x-dnd-container`) |
| `disallowDropIntoInactiveParent` | Bloquea drop en padres inactivos (`parentActiveKey`/`parentActiveValue`) |
| `custom` | `(evt, containerMeta) => boolean` |

## Eventos

`update:modelValue`, `update:list`, `change` (sintetizado en add/remove/update), `start`, `end`, `add`, `remove`, `update`, `choose`, `unchoose`, `sort`, `move`.

## Slots

| Slot | Descripcion |
|------|-------------|
| `item` (`{ element, index }`) | Render de cada item (el `v-for` lo hace XDnd) |
| `header` / `footer` | Contenido antes/después del contenedor sortable (NO arrastrable) |
| `overlay` (`{ element }`) | Contenido del overlay flotante (default: card con `label`/`name`) |

## Uso Basico

```vue
<x-dnd v-model="columns" item-key="value" handle=".drag-grip">
  <template #item="{ element }">
    <div class="row items-center">
      <q-icon name="drag_indicator" class="drag-grip" />
      <span>{{ element.label }}</span>
    </div>
  </template>
</x-dnd>
```

### Entre listas (kanban / árbol)

```vue
<x-dnd :list="colA" group="board" item-key="id">…</x-dnd>
<x-dnd :list="colB" group="board" item-key="id">…</x-dnd>
```

### Con reglas

```vue
<x-dnd
  v-model="nodes"
  :rules="{ lockedKey: 'is_locked', maxDepth: 2 }"
  :can-move="(evt) => evt.draggedContext?.element?.type !== 'system'"
>…</x-dnd>
```

## Notas de la migración a vue-draggable-plus (v2.5.0)

API pública sin cambios. Diferencias internas que conviene conocer:

- El `v-for` de items lo renderiza XDnd (vue-draggable-plus no trae slot `#item`).
- `#header`/`#footer` se renderizan **fuera** del contenedor sortable (antes eran hijos no arrastrables dentro de él).
- En `canMove`/`rules.custom`, `evt.draggedContext.element` es un **shim**: el elemento se trackea en `start`/`choose` (Sortable nativo no trae contexto del elemento). `evt.relatedContext` ya no existe; `rules.maxItems` aproxima la lista destino con `evt.to.children.length`.
- El evento `change` se sintetiza a partir de `add`/`remove`/`update` (payload = evt nativo de Sortable, no el `{added|removed|moved}` de vuedraggable).

## Historial / legacy (tags ≤ v2.4.x)

Versiones anteriores usaban `vuedraggable@4` (solo build UMD). El consumidor necesitaba en `extendViteConf`:

```js
viteConf.optimizeDeps.include = [...(viteConf.optimizeDeps.include || []), 'vuedraggable']
```

(o, en setups más viejos, un alias de `vuedraggable` a un stub ESM propio). Sin eso, al invalidarse `node_modules/.vite` el dev server fallaba con `does not provide an export named 'default'` en todos los listados. Si consumes un tag viejo, mantén esa configuración; desde v2.5.0 elimínala.
