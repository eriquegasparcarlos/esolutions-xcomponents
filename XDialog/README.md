# XDialog

Componente de dialogo modal que envuelve `QDialog` de Quasar con estilos personalizados y funcionalidades adicionales.

## Instalacion

```vue
<script setup>
import XDialog from '@/components/XDialog/XDialog.vue'
</script>
```

## Props

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `modelValue` | `Boolean` | `false` | Control de visibilidad (v-model) |
| `title` | `String` | `''` | Titulo del dialogo |
| `width` | `String` | `'600px'` | Ancho del dialogo |
| `position` | `String` | `'standard'` | Posicion: `standard`, `top`, `bottom`, `right`, `left` |
| `small` | `Boolean` | `false` | Tamanio reducido |
| `isFullHeight` | `Boolean` | `false` | Altura completa de la pantalla |
| `alignActionButtons` | `String` | `'right'` | Alineacion de botones: `right`, `between` |
| `showScrollArea` | `Boolean` | `true` | Mostrar area de scroll |
| `showButtonClose` | `Boolean` | `false` | Mostrar boton de cerrar en el header |
| `loading` | `Boolean` | `false` | Mostrar indicador de carga |

## Eventos

| Evento | Payload | Descripcion |
|--------|---------|-------------|
| `update:modelValue` | `Boolean` | Cambio de visibilidad |
| `before-show` | - | Antes de mostrar el dialogo |
| `show` | - | Dialogo visible |
| `confirm` | - | Accion de confirmacion |
| `cancel` | - | Accion de cancelacion/cierre |
| `action-button-close` | - | Click en boton cerrar del header |

## Slots

| Slot | Descripcion |
|------|-------------|
| `content` | Contenido principal del dialogo |
| `content-header` | Header adicional debajo del titulo |
| `action-buttons` | Botones de accion en el footer |

## Uso Basico

```vue
<template>
  <XDialog
    v-model="showDialog"
    title="Titulo del dialogo"
  >
    <template #content>
      <p>Contenido del dialogo</p>
    </template>

    <template #action-buttons>
      <XButton label="Cancelar" variant="flat" @click="showDialog = false" />
      <XButton label="Guardar" @click="handleSave" />
    </template>
  </XDialog>
</template>

<script setup>
import { ref } from 'vue'

const showDialog = ref(false)

function handleSave() {
  // Logica de guardado
  showDialog.value = false
}
</script>
```

## Ejemplos

### Dialogo con boton de cerrar

```vue
<XDialog
  v-model="showDialog"
  title="Configuracion"
  show-button-close
  @action-button-close="showDialog = false"
>
  <template #content>
    <p>Contenido...</p>
  </template>
</XDialog>
```

### Dialogo full-height (lateral)

```vue
<XDialog
  v-model="showPanel"
  title="Panel lateral"
  position="right"
  width="400px"
  is-full-height
>
  <template #content>
    <p>Contenido con scroll automatico</p>
  </template>

  <template #action-buttons>
    <XButton label="Cerrar" @click="showPanel = false" />
  </template>
</XDialog>
```

### Dialogo con loading

```vue
<XDialog
  v-model="showDialog"
  title="Procesando"
  :loading="isLoading"
>
  <template #content>
    <p>Formulario...</p>
  </template>

  <template #action-buttons>
    <XButton
      label="Guardar"
      :loading="isLoading"
      @click="handleSubmit"
    />
  </template>
</XDialog>
```

### Dialogo con header adicional

```vue
<XDialog
  v-model="showDialog"
  title="Nuevo documento"
>
  <template #content-header>
    <div class="flex items-center gap-2">
      <q-icon name="info" />
      <span>Complete todos los campos requeridos</span>
    </div>
  </template>

  <template #content>
    <p>Formulario...</p>
  </template>
</XDialog>
```

### Botones alineados a los extremos

```vue
<XDialog
  v-model="showDialog"
  title="Confirmacion"
  align-action-buttons="between"
>
  <template #content>
    <p>Esta seguro de continuar?</p>
  </template>

  <template #action-buttons>
    <XButton label="Eliminar" color="negative" variant="flat" />
    <div class="flex gap-2">
      <XButton label="Cancelar" variant="flat" @click="showDialog = false" />
      <XButton label="Confirmar" @click="handleConfirm" />
    </div>
  </template>
</XDialog>
```

## Personalizacion CSS

El componente expone variables CSS para personalizacion:

```scss
.x-dialog {
  --x-dialog-border-radius: 8px;
  --x-dialog-header-padding: 16px;
  --x-dialog-content-padding: 16px;
  --x-dialog-footer-padding: 12px 16px;
  --x-dialog-title-font-size: 20px;
  --x-dialog-title-color: #1d1d1d;
  --x-dialog-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  --x-dialog-transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Ejemplo de personalizacion

```vue
<template>
  <XDialog
    v-model="showDialog"
    title="Dialog personalizado"
    class="custom-dialog"
  >
    <template #content>
      <p>Contenido...</p>
    </template>
  </XDialog>
</template>

<style scoped>
.custom-dialog {
  --x-dialog-border-radius: 16px;
  --x-dialog-header-padding: 24px;
  --x-dialog-title-font-size: 24px;
}
</style>
```

### Personalizacion global via SCSS

Modifica las variables en `_variables.scss`:

```scss
$x-dialog-border-radius: 12px;
$x-dialog-header-padding: 20px;
$x-dialog-content-padding: 20px;
$x-dialog-footer-padding: 16px 20px;
```

## Caracteristicas Especiales

### Persistente

El dialogo es persistente por defecto, lo que significa que no se cierra al hacer click fuera de el. El cierre debe ser controlado programaticamente.

### Scroll automatico

Cuando `is-full-height` esta activo, el contenido tiene scroll automatico calculado dinamicamente segun la presencia de slots.

### Posiciones

- `standard`: Centro de la pantalla
- `top`: Parte superior
- `bottom`: Parte inferior
- `right`: Panel lateral derecho (ideal para formularios)
- `left`: Panel lateral izquierdo

### Responsivo

En pantallas pequenas (< 600px), el dialogo ocupa 95% del ancho de la pantalla automaticamente.
