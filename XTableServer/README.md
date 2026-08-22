# XTableServer

Componente de tabla con paginacion del lado del servidor, filtros dinamicos, acciones y soporte responsive para movil.

## Instalacion

```vue
<script setup>
import XTableServer from '@/components/XTableServer/XTableServer.vue'
</script>
```

## Props

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `resource` | `String` | *required* | Ruta base del recurso API (ej: `'users'`, `'documents'`) |

## Eventos

| Evento | Payload | Descripcion |
|--------|---------|-------------|
| `actions` | `{ action, id, url }` | Emitido cuando se ejecuta una accion personalizada |

## Metodos Expuestos

```javascript
const tableRef = ref(null)

// Recargar datos con filtros actuales
tableRef.value.filterData()

// Reconsultar init-data-table completo (titulo, columnas, filtros y headerButtons
// incluidos) ademas de las filas. Usar cuando una accion fuera de la tabla cambia la
// condicion de negocio de un boton del header (ej. activar/desactivar una fila cambia
// cuantas filas activas hay, y eso decide si un boton debe mostrarse).
tableRef.value.fetchColumnsAndData()
```

## Uso Basico

```vue
<template>
  <XTableServer
    ref="tableRef"
    resource="users"
    @actions="handleAction"
  />
</template>

<script setup>
import { ref } from 'vue'

const tableRef = ref(null)

function handleAction({ action, id, url }) {
  if (action === 'edit') {
    // Abrir modal de edicion
  }
}
</script>
```

## Configuracion Backend

El componente espera que el backend implemente los siguientes endpoints:

### GET `/{resource}/init-data-table`

Retorna la configuracion inicial de la tabla.

```json
{
  "pageTitle": "Usuarios",
  "tableTitle": "Lista de usuarios",
  "tableName": "users",
  "pagination": {
    "perPage": 10,
    "sortBy": "created_at",
    "descending": true,
    "pageSizes": [5, 10, 20, 50]
  },
  "columns": [
    {
      "name": "id",
      "label": "ID",
      "align": "left",
      "visible": true,
      "sortable": true,
      "locked": false
    },
    {
      "name": "name",
      "label": "Nombre",
      "align": "left",
      "visible": true,
      "sortable": true,
      "locked": false
    }
  ],
  "visibleColumns": ["id", "name", "email", "actions"],
  "filters": [...],
  "headerButtons": [...],
  "mobileConfig": {...}
}
```

### POST `/{resource}/records`

Retorna los datos paginados.

```json
// Request
{
  "tableName": "users",
  "page": 1,
  "rowsPerPage": 10,
  "sortBy": "created_at",
  "descending": true,
  "filters": [...]
}

// Response
{
  "data": [...],
  "meta": {
    "total": 100,
    "per_page": 10,
    "sort_by": "created_at",
    "descending": true
  }
}
```

## Configuracion Mobile (mobileConfig)

Para personalizar la vista movil desde el backend, incluye `mobileConfig` en la respuesta de `init-data-table`:

```php
// En tu DataTable PHP
public function initDataTable(): array
{
    return [
        // ... otras configuraciones ...
        
        'mobileConfig' => [
            'enabled' => true,
            'titleField' => 'name',      // Campo para titulo del bottom sheet
            'subtitleField' => 'email',  // Campo para subtitulo del bottom sheet
            'primaryFields' => [
                // Campos que se muestran en la fila compacta movil
                [
                    'field' => 'id',
                    'label' => 'ID',
                    'position' => 'left',    // 'left' o 'right'
                ],
                [
                    'field' => 'name',
                    'label' => 'Nombre',
                    'position' => 'left',
                ],
                [
                    'field' => 'email',
                    'label' => 'Email',
                    'position' => 'right',
                    'truncate' => 150,       // Opcional: max-width en px
                ],
                [
                    'field' => 'status',
                    'label' => 'Estado',
                    'position' => 'right',
                ],
            ],
        ],
    ];
}
```

### Estructura de mobileConfig

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `enabled` | `Boolean` | Habilita la configuracion personalizada |
| `titleField` | `String` | Nombre del campo a mostrar como titulo en el bottom sheet |
| `subtitleField` | `String` | Nombre del campo a mostrar como subtitulo en el bottom sheet |
| `primaryFields` | `Array` | Lista de campos a mostrar en la vista compacta (fila izquierda/derecha) |
| `topFields` | `Array` | Opcional: campos a mostrar en una seccion a **ancho completo ARRIBA** de la fila left/right. Util para campos largos (correo, direccion) que en columna desbordarian. Cada item: `{ field, align? }` |
| `bottomFields` | `Array` | Opcional: igual que `topFields` pero en una seccion a ancho completo **DEBAJO**. Cada item: `{ field, align? }` |

Sin `topFields`/`bottomFields`, la tarjeta se ve igual que antes (solo left/right) — el cambio es retrocompatible.

### Estructura de primaryFields

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| `field` | `String` | Nombre del campo (debe coincidir con una columna) |
| `label` | `String` | Etiqueta del campo |
| `position` | `String` | Posicion en la fila: `'left'` o `'right'` |
| `truncate` | `Number` | Opcional: max-width en pixeles para truncar texto |

### Comportamiento Automatico

Si **no** se envia `mobileConfig` desde el backend, el componente genera una configuracion automatica:

- Usa las primeras 2 columnas visibles para el lado izquierdo
- Usa las siguientes 2 columnas para el lado derecho
- El titulo del bottom sheet es la primera columna
- El subtitulo es la segunda columna

## Clase por fila (`_row_class`)

Cada registro puede traer un campo especial **`_row_class`** que XTableServer
aplica como clase CSS a su fila (`<q-tr>`), tanto en escritorio como en móvil.
Sirve para resaltar/atenuar filas según su estado (inhabilitado, vencido, etc.)
sin agregar columnas.

El backend lo incluye en cada record; el valor es el nombre de una clase CSS
que **define el proyecto consumidor** (XTableServer solo la aplica):

```json
{
  "id": 12,
  "name": "Producto X",
  "_row_class": "x-row-inactive"
}
```

```css
/* en el proyecto consumidor */
.x-row-inactive { opacity: .55; }
```

Si un registro no trae `_row_class`, la fila se muestra normal. No colisiona con
el resaltado interno de selección (`x-table-row--selected`).

## Filtros

Los filtros se configuran en el backend:

```php
'filters' => [
    [
        'name' => 'status',
        'label' => 'Estado',
        'type' => 'select',           // 'select', 'input', 'tree-select'
        'options' => [...],
        'default' => 'all',
        'includeAllOption' => true,
        'class' => 'col-12 col-md-3',
    ],
    [
        'name' => 'category',
        'label' => 'Categoria',
        'type' => 'select',
        'dependsOn' => 'status',      // Filtro dependiente
        'remote' => [
            'url' => '/api/categories',
            'method' => 'post',
            'params' => ['status_id' => '$parent'],
        ],
    ],
]
```

## Acciones de Fila

Las acciones se definen por fila en el backend:

```php
// En cada fila de data
'actions' => [
    [
        'action' => 'edit',
        'label' => 'Editar',
        'icon' => 'edit',
        'color' => 'primary',
    ],
    [
        'type' => 'group',
        'icon' => 'menu',
        'buttons' => [
            ['action' => 'view', 'label' => 'Ver', 'icon' => 'view'],
            ['type' => 'separator'],
            ['action' => 'delete', 'label' => 'Eliminar', 'icon' => 'delete', 'color' => 'negative'],
        ],
    ],
]
```

## Botones de Header

```php
'headerButtons' => [
    [
        'action' => 'create',
        'label' => 'Nuevo',
        'icon' => 'add',
        'color' => 'primary',
    ],
    [
        'action' => 'export',
        'icon' => 'download',
    ],
    [
        'action' => 'refresh',
        'icon' => 'refresh',
    ],
]
```

## Slots

| Slot | Ubicación | Uso |
|---|---|---|
| `#header-left` | A la **izquierda del título** de la tabla | Contenido contextual antes del título — típicamente un botón de volver (`← Título`). |
| `#header-buttons` | A la **derecha**, junto a los botones del header (refresh, columnas) | Botones extra del consumidor además de los `headerButtons` del backend. |

Ejemplo — botón de volver a la izquierda del título:

```vue
<script setup>
import { ic } from '@esolutions/x-components/icons'
</script>

<template>
<x-table-server :resource="`servers/${id}/cron-jobs-table`" @actions="handleAction">
  <template #header-left>
    <q-btn flat round dense :icon="ic('prev')" color="primary" @click="goBack">
      <q-tooltip>Volver</q-tooltip>
    </q-btn>
  </template>
</x-table-server>
</template>
```

En vista móvil (sin header de tabla) el slot `#header-left` no se muestra.

## Vista Movil

En dispositivos moviles (`$q.platform.is.mobile || $q.screen.lt.lg`):

1. **Tabla compacta**: Las filas se muestran en formato compacto con campos izquierda/derecha
2. **Bottom Sheet**: Al hacer click en una fila, se abre un menu inferior con todas las acciones
3. **Sin header de tabla**: Se oculta el encabezado para ahorrar espacio

## Componentes Internos

- `XCellColumnRenderer.vue` - Renderiza celdas en vista desktop
- `XCellRenderer.vue` - Renderiza celdas en vista movil
- `XMobileMenuAction.vue` - Bottom sheet para acciones movil
- `MobileLinkAction.vue` - Item de accion en el bottom sheet
- `MobileLinkTitle.vue` - Titulo del bottom sheet

## Evento `loaded` (v2.6.7)

Emitido tras cada carga con la respuesta completa del backend (`{ data, meta }`).
Permite al consumidor leer totales/resúmenes de `meta` (p. ej. `meta.summary` en
el reporte de rentabilidad). Ejemplo: `<XTableServer @loaded="onLoaded" />`.
