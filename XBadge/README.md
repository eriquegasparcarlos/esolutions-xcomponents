# XBadge

Componente de etiqueta/badge que envuelve `QBadge` de Quasar con estilos y variantes personalizadas.

## Instalacion

```vue
<script setup>
import XBadge from '@/components/XBadge/XBadge.vue'
</script>
```

## Props

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `label` | `String` | `''` | Texto del badge |
| `color` | `String` | `null` | Color personalizado (hex o rgb) |
| `isLightenColor` | `Boolean` | `false` | Aclarar el color de fondo |
| `type` | `String` | `null` | Tipo predefinido de estilo |

### Tipos Disponibles

- `success` - Verde para estados exitosos
- `danger` / `error` - Rojo para errores
- `warning` - Amarillo para advertencias
- `info` - Celeste para informacion
- `primary` - Color primario de la app
- `secondary` - Color secundario
- `neutral` / `default` - Gris neutro

## Uso Basico

```vue
<template>
  <XBadge label="Activo" type="success" />
</template>
```

## Ejemplos

### Tipos predefinidos

```vue
<XBadge label="Completado" type="success" />
<XBadge label="Error" type="danger" />
<XBadge label="Pendiente" type="warning" />
<XBadge label="Informacion" type="info" />
<XBadge label="Principal" type="primary" />
<XBadge label="Inactivo" type="neutral" />
```

### Color personalizado

```vue
<XBadge label="Custom" color="#9c27b0" />
```

### Color aclarado para fondo

```vue
<!-- Texto con color, fondo aclarado -->
<XBadge label="Soft" color="#1976d2" is-lighten-color />
```

### En una tabla

```vue
<template>
  <q-table :rows="users" :columns="columns">
    <template #body-cell-status="props">
      <q-td :props="props">
        <XBadge
          :label="props.row.status"
          :type="getStatusType(props.row.status)"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
function getStatusType(status) {
  const types = {
    'Activo': 'success',
    'Inactivo': 'neutral',
    'Pendiente': 'warning',
    'Rechazado': 'danger'
  }
  return types[status] || 'default'
}
</script>
```

### Con clases adicionales

```vue
<!-- Tamanios -->
<XBadge label="Small" type="success" class="x-badge-sm" />
<XBadge label="Medium" type="success" class="x-badge-md" />
<XBadge label="Large" type="success" class="x-badge-lg" />

<!-- Outlined -->
<XBadge label="Outlined" type="primary" class="x-badge-outlined" />

<!-- Pill (bordes redondeados) -->
<XBadge label="Pill" type="info" class="x-badge-pill" />

<!-- Dot (solo circulo) -->
<XBadge type="success" class="x-badge-dot" />
```

## Personalizacion CSS

El componente expone variables CSS para personalizacion:

```scss
.x-badge {
  --x-badge-padding: 4px 8px;
  --x-badge-font-size: 12px;
  --x-badge-border-radius: 4px;
  --x-badge-font-weight: 500;
  --x-badge-line-height: 1.4;
}
```

### Ejemplo de personalizacion

```vue
<template>
  <XBadge label="Custom" type="success" class="custom-badge" />
</template>

<style scoped>
.custom-badge {
  --x-badge-padding: 6px 16px;
  --x-badge-border-radius: 20px;
  --x-badge-font-size: 14px;
}
</style>
```

### Personalizacion global via SCSS

Modifica las variables en `_variables.scss`:

```scss
$x-badge-padding: 6px 10px;
$x-badge-font-size: 13px;
$x-badge-border-radius: 6px;
```

## Clases Auxiliares

| Clase | Descripcion |
|-------|-------------|
| `x-badge-sm` | Tamanio pequenio |
| `x-badge-md` | Tamanio mediano (default) |
| `x-badge-lg` | Tamanio grande |
| `x-badge-outlined` | Solo borde, sin fondo |
| `x-badge-pill` | Bordes completamente redondeados |
| `x-badge-dot` | Solo circulo indicador |
| `x-badge-with-icon` | Para badges con iconos |

## Uso con Iconos

```vue
<XBadge type="success" class="x-badge-with-icon">
  <template #default>
    <q-icon name="check" />
    Verificado
  </template>
</XBadge>
```

## Notas

- El prop `isLightenColor` usa la funcion `lightenColor` del mixin `lib.js` para aclarar colores hex
- Los tipos predefinidos usan los colores de Quasar (`$x-positive`, `$x-negative`, etc.)
- El badge aplica `margin: 0 !important` para evitar espaciados no deseados
