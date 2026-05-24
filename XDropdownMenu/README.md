# XDropdownMenu

Menu dropdown estilo TailAdmin con composición flexible.

## Componentes

- **XDropdownMenu** — contenedor principal con trigger + menu
- **XDropdownItem** — item del menu (con icono, label, variantes)
- **XDropdownDivider** — separador (con label opcional)

## Ejemplo básico

```vue
<x-dropdown-menu>
  <template #trigger="{ open }">
    <x-button label="Opciones" icon="more_vert" @click="open" />
  </template>

  <x-dropdown-item icon="edit" label="Editar" @click="onEdit" />
  <x-dropdown-item icon="content_copy" label="Duplicar" @click="onCopy" />
  <x-dropdown-divider />
  <x-dropdown-item icon="delete" label="Eliminar" variant="danger" @click="onDelete" />
</x-dropdown-menu>
```

## Con header (dropdown de usuario)

```vue
<x-dropdown-menu width="260">
  <template #trigger>
    <button>
      <q-avatar>...</q-avatar>
      <span>Carlos Erique</span>
    </button>
  </template>

  <template #header>
    <div class="text-weight-semibold">Carlos Erique</div>
    <div class="text-caption text-grey-6">carlos@apiperu.dev</div>
  </template>

  <x-dropdown-item icon="user" label="Mi perfil" to="/profile" />
  <x-dropdown-item icon="settings" label="Configuración" to="/settings" />
  <x-dropdown-divider />
  <x-dropdown-item icon="logout" label="Cerrar sesión" variant="danger" @click="logout" />
</x-dropdown-menu>
```

## Con header + footer (dropdown de notificaciones)

```vue
<x-dropdown-menu width="380" show-close-button max-height="400px">
  <template #trigger>
    <q-btn icon="notifications" flat round>
      <q-badge color="red" floating>3</q-badge>
    </q-btn>
  </template>

  <template #header>
    <h5 class="text-h6">Notificaciones</h5>
  </template>

  <x-dropdown-item v-for="n in notifications" :key="n.id">
    <div>
      <div class="text-weight-medium">{{ n.title }}</div>
      <div class="text-caption text-grey-6">{{ n.timeAgo }}</div>
    </div>
  </x-dropdown-item>

  <template #footer>
    <x-button label="Ver todas" color="primary" flat class="full-width" />
  </template>
</x-dropdown-menu>
```

## Props de XDropdownMenu

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `width` | String/Number | `260` | Ancho del menu (px o cualquier unidad CSS) |
| `align` | String | `'right'` | `'left'` o `'right'` |
| `offset` | Array | `[0, 8]` | Offset [x, y] del menu respecto al trigger |
| `maxHeight` | String | `'480px'` | Max alto del cuerpo (scroll si excede) |
| `showCloseButton` | Boolean | `false` | Muestra botón X en el header |
| `disable` | Boolean | `false` | Deshabilita el trigger |

## Props de XDropdownItem

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | String | `''` | Texto del item |
| `icon` | String | `''` | Nombre del icono (Quasar/FontAwesome) |
| `variant` | String | `'default'` | `default` / `danger` / `success` / `warning` / `info` |
| `to` | String/Object | `null` | Ruta vue-router |
| `href` | String | `''` | URL externa |
| `target` | String | `''` | Target del link |
| `disable` | Boolean | `false` | Deshabilita |
| `closeOnClick` | Boolean | `true` | Cierra el menu al hacer click |

## Slots

### XDropdownMenu
- `trigger` (scope: `{ isOpen, open, close }`) — elemento que abre el menu
- `header` (scope: `{ close }`) — header opcional
- `default` (scope: `{ close }`) — items del menu
- `footer` (scope: `{ close }`) — footer opcional

### XDropdownItem
- `default` — contenido (sobreescribe `label`)
- `icon` — slot para el icono custom
- `side` — slot derecho (badge, atajo, etc.)

## Eventos

### XDropdownMenu
- `show` — al abrir el menu
- `hide` — al cerrar
- `before-show`, `before-hide`

### XDropdownItem
- `click` — al hacer click

## Métodos expuestos (XDropdownMenu)

```vue
<x-dropdown-menu ref="dropdownRef">
  ...
</x-dropdown-menu>

<script setup>
const dropdownRef = ref()
dropdownRef.value.open()   // abrir programáticamente
dropdownRef.value.close()  // cerrar programáticamente
</script>
```
