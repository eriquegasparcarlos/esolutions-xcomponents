# XButton

Componente de botón personalizado basado en `q-btn` de Quasar.

## Uso básico

```vue
<x-button label="Click me" />
<x-button label="Primary" color="primary" />
<x-button label="Guardar" variant="success" />
```

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | String | - | Texto del botón |
| `icon` | String | - | Icono izquierdo |
| `iconRight` | String | - | Icono derecho |
| `color` | String | `'primary'` | Color del botón (colores de Quasar) |
| `textColor` | String | - | Color del texto |
| `variant` | String | - | Variante: `primary`, `secondary`, `success`, `danger`, `warning`, `info` |
| `type` | String | `'button'` | Tipo nativo: `button`, `submit`, `reset` |
| `size` | String | `'md'` | Tamaño: `sm`, `md`, `lg` |
| `outline` | Boolean | `false` | Estilo con borde |
| `flat` | Boolean | `false` | Sin fondo |
| `unelevated` | Boolean | `true` | Sin sombra |
| `round` | Boolean | `false` | Botón redondo |
| `rounded` | Boolean | `false` | Bordes redondeados |
| `loading` | Boolean | `false` | Mostrar spinner de carga |
| `disable` | Boolean | `false` | Deshabilitar botón |
| `tooltipText` | String | - | Texto del tooltip |
| `hasBadge` | Boolean | `false` | Mostrar badge |
| `badgeLabel` | String/Number | - | Contenido del badge |
| `badgeColor` | String | `'blue-grey-8'` | Color del badge |

## Eventos

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `click` | Event | Click en el botón |

## Slots

| Slot | Descripción |
|------|-------------|
| `default` | Contenido adicional dentro del botón |

## Ejemplos

### Variantes de color

```vue
<x-button variant="primary" label="Primary" />
<x-button variant="success" label="Success" />
<x-button variant="danger" label="Danger" />
<x-button variant="warning" label="Warning" />
```

### Con iconos

```vue
<x-button icon="save" label="Guardar" />
<x-button label="Siguiente" icon-right="arrow_forward" />
<x-button icon="delete" round color="negative" />
```

### Estados

```vue
<x-button label="Cargando..." loading />
<x-button label="Deshabilitado" disable />
```

### Con badge

```vue
<x-button 
  label="Notificaciones" 
  has-badge 
  badge-label="5" 
  badge-color="red" 
/>
```

### Submit en formulario

```vue
<form @submit.prevent="onSubmit">
  <x-button type="submit" label="Enviar" />
</form>
```

## Personalización SCSS

Puedes sobrescribir las variables en tu archivo SCSS:

```scss
// Sobrescribir antes de importar
$x-button-height-md: 40px;
$x-button-padding-x: 20px;
$x-button-font-weight: 600;

@import '@/components/XButton/XButton.scss';
```

O usar CSS custom properties:

```css
.my-custom-button {
  --x-button-height: 48px;
  --x-button-padding-x: 24px;
  --x-button-border-radius: 8px;
}
```
