
# XDialogAction

Componente de estilo para acciones dentro de un `XDialog`, pensado para mantener coherencia visual y control en botones como "Aceptar", "Cancelar", "Guardar", etc.

## Estructura del SCSS

Este archivo SCSS define estilos para:

- `.x-dialog-actions`: el contenedor de los botones de acción.
- `.x-button`: botón genérico usado dentro del diálogo.
- `.x-button.cancel`: botón de cancelación, con fondo blanco y borde gris.
- `.x-button.confirm`: botón de confirmación con fondo primario.

## Uso

Asegúrate de importar el archivo SCSS si estás usando configuración global:

```scss
@import 'path/to/XDialogAction.scss';
```

Si prefieres usarlo como `scoped`, colócalo dentro del componente `XDialog` o `XDialogWrapper`.

## Ejemplo

```vue
<template>
  <q-card-actions class="x-dialog-actions">
    <x-button class="x-button cancel" label="Cancelar" />
    <x-button class="x-button confirm" label="Aceptar" />
  </q-card-actions>
</template>
```

## Personalización

Puedes modificar los colores, tamaños y animaciones directamente en el archivo SCSS para que coincidan con tu branding.
