# XLineageTree

Diagrama de **linaje / flujo** genérico basado en [Vue Flow](https://vueflow.dev/) + [dagre](https://github.com/dagrejs/dagre): recibe un **árbol de datos** (nodos anidados) y lo pinta como un grafo dirigido con layout automático (vertical u horizontal). Pensado para mostrar cómo un elemento deriva en otros — conversiones de documentos, jerarquías, workflows, árboles de estado, etc.

Es **agnóstico al origen de los datos**: **no hace peticiones**. El proyecto consumidor arma el árbol (fetch, mapeo, lo que sea) y se lo pasa por prop. Así el mismo componente sirve en cualquier proyecto.

> Encapsula los *gotchas* de Vue Flow ya resueltos (nodos que quedan ocultos dentro de diálogos/tabs, medición 0×0, layout con dagre) para que no tengas que pelearlos de nuevo.

## Instalación

El componente usa Vue Flow y dagre, declarados como **peer dependencies opcionales**. Instálalas **solo si vas a usar este componente**:

```bash
pnpm add @vue-flow/core @dagrejs/dagre
```

```vue
<script setup>
import XLineageTree from '@esolutions/x-components/XLineageTree/XLineageTree.vue'
</script>
```

> Si no importas `XLineageTree`, no necesitas esas dependencias — no afectan al resto del paquete.

## Qué recibe

Un **árbol**: un nodo raíz (objeto) o varias raíces (array). Cada nodo es un objeto libre con sus hijos en `children` (configurable). El componente lo aplana, calcula posiciones con dagre y lo dibuja.

```js
const tree = {
  id: 1, label: 'Nota de Venta N001-10', current: false,
  children: [
    { id: 2, label: 'Boleta B001-52', badge: 'Registrado', badgeColor: '#ff9800', captions: ['S/ 50.00', '22/07/2026'], children: [] },
    { id: 3, label: 'Boleta B001-51', voided: true, badge: 'Anulado', badgeColor: '#f44336',
      note: 'Anulada por NC BC01-2',
      children: [
        { id: 4, label: 'Nota de crédito BC01-2', badge: 'Aceptado', badgeColor: '#21ba45', children: [] },
      ] },
  ],
}
```

### Campos que lee el **nodo por defecto**
Todos opcionales salvo `label`. Si usas el slot `#node`, este contrato no aplica (tú decides).

| Campo | Tipo | Efecto |
|---|---|---|
| `label` | `string` | Título del nodo |
| `current` | `bool` | Resalta el nodo (borde primario) + arista animada hacia él |
| `voided` | `bool` | Estilo "anulado": fondo rojo claro, título tachado, arista punteada roja |
| `badge` | `string` | Texto de un badge (estado) |
| `badgeColor` | `string` | Color de fondo del badge |
| `captions` | `string[]` | Textos pequeños bajo el título (montos, fechas…) |
| `note` | `string` | Nota inferior (p. ej. motivo de anulación) |
| `children` | `array` | Hijos (configurable con `childrenKey`) |

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `tree` | `Object \| Array` | `null` | Árbol a pintar (una o varias raíces). Si es `null`/vacío, muestra el estado vacío. |
| `nodeKey` | `String \| Function` | `'id'` | Clave única del nodo: nombre de campo o función `(node) => string`. Útil si el `id` se repite entre "tipos" (p. ej. `(n) => \`${n.type}:${n.id}\``). |
| `childrenKey` | `String` | `'children'` | Campo con los hijos. |
| `direction` | `String` | `'TB'` | Dirección del layout dagre: `'TB'` (arriba→abajo), `'BT'`, `'LR'` (izq→der), `'RL'`. |
| `nodeWidth` | `Number` | `210` | Ancho de cada nodo (px). |
| `nodeHeight` | `Number` | `66` | Alto de cada nodo (px). |
| `nodeSep` | `Number` | `30` | Separación entre nodos del mismo nivel. |
| `rankSep` | `Number` | `55` | Separación entre niveles. |
| `height` | `String` | `'420px'` | Alto del contenedor del diagrama. |
| `bordered` | `Boolean` | `true` | Borde + esquinas redondeadas alrededor del lienzo. |
| `active` | `Boolean` | `true` | **Importante en diálogos/tabs:** ponlo en `true` cuando el diagrama se vuelve visible para re-medir y encuadrar. Vue Flow mide 0×0 si monta oculto → sin esto los nodos no aparecen. Si el diagrama siempre está visible, déjalo en `true`. |
| `fitPadding` | `Number` | `0.15` | Margen al encuadrar (`fitView`). |
| `minZoom` / `maxZoom` | `Number` | `0.4` / `1.5` | Límites de zoom. |
| `edgeType` | `String` | `'smoothstep'` | Tipo de arista de Vue Flow (`'default'`, `'straight'`, `'step'`, `'smoothstep'`, `'bezier'`). |
| `edgeStyle` | `Function` | `null` | Override del estilo de arista: `(nodoDestino) => objetoDeEstilo`. Por defecto: gris; roja punteada si el nodo es `voided`. |
| `emptyText` | `String` | `'Sin datos para mostrar.'` | Texto cuando no hay árbol. |

## Qué emite / expone (lo que "devuelve")

### Eventos
| Evento | Payload | Cuándo |
|--------|---------|--------|
| `node-click` | `data` del nodo | Al hacer clic en un nodo. Recibes el objeto original del árbol (no el nodo interno de Vue Flow). |
| `ready` | — | Cuando terminó de aplicar el layout y encuadrar. |

### Métodos expuestos (por `ref`)
| Método | Descripción |
|--------|-------------|
| `relayout()` | Reconstruye el grafo y recalcula posiciones (útil si mutas el árbol en sitio). |
| `fit()` | Reencuadra el diagrama al viewport. |

```vue
<XLineageTree ref="tree" :tree="data" @node-click="ver" @ready="onReady" />
<!-- tree.value.fit() -->
```

## Diseño / personalización

Tres niveles, de menor a mayor control:

**1. Nodo por defecto** — no defines nada; usas los campos del contrato (`label`, `badge`, `voided`, etc.). Estilos con clases `.x-lineage-node*` que puedes sobreescribir con CSS.

**2. Ajustes rápidos** — `direction`, `nodeWidth/Height`, `nodeSep/rankSep`, `edgeType`, `edgeStyle`, `bordered`, `height`. El resaltado del nodo *current* usa `--q-primary` (o `#1976d2` de fallback).

**3. Nodo totalmente custom** — slot `#node="{ data }"`: pintas el nodo como quieras (tu HTML/estilos). Slot `#empty` para el estado vacío.

```vue
<XLineageTree :tree="data" direction="LR">
  <template #node="{ data }">
    <div class="mi-nodo" :class="{ activo: data.current }">
      <b>{{ data.label }}</b>
      <small>{{ data.subtitulo }}</small>
    </div>
  </template>
  <template #empty>Aún no hay flujo.</template>
</XLineageTree>
```

## Uso básico

```vue
<template>
  <XLineageTree :tree="tree" :active="visible" @node-click="abrir" />
</template>

<script setup>
import { ref } from 'vue'
import XLineageTree from '@esolutions/x-components/XLineageTree/XLineageTree.vue'

const visible = ref(true)
const tree = ref(/* … tu árbol … */)
function abrir(node) { console.log('clic en', node) }
</script>
```

## Ejemplo: dentro de un tab de un XDialog

El caso típico (por eso existe `active`): el diagrama vive en un tab de un diálogo y monta oculto.

```vue
<q-tab-panel name="conversiones">
  <XLineageTree :tree="tree" :active="tabActive === 'conversiones'" />
</q-tab-panel>
```

> `active` pasa a `true` cuando el tab se muestra → el componente re-mide y encuadra. Sin eso, Vue Flow habría medido el contenedor oculto (0×0) y los nodos quedarían invisibles.

## Ejemplo: mapear una respuesta de backend

El componente no hace fetch; tú traes y mapeas:

```js
const { data } = await api.get(`/document/lineage/${type}/${id}`)
tree.value = mapLineage(data.data)  // → { label, current, voided, badge, badgeColor, captions, note, children }
```
