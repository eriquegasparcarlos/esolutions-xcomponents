# XLoading

Componente de indicador de carga que envuelve `QInnerLoading` de Quasar con estilos personalizados.

## Instalacion

```vue
<script setup>
import XLoading from '@/components/XLoading/XLoading.vue'
</script>
```

## Props

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `loading` | `Boolean` | `false` | Mostrar/ocultar el loading |
| `color` | `String` | `'primary'` | Color del spinner |
| `size` | `String` | `'50px'` | Tamanio del spinner |
| `spinner` | `String` | `'dots'` | Tipo de spinner |
| `dark` | `Boolean` | `false` | Modo oscuro (overlay oscuro) |
| `message` | `String` | `''` | Mensaje a mostrar debajo del spinner |

### Tipos de Spinner Disponibles

- `dots` (default)
- `bars`
- `cube`
- `ball`
- `rings`
- `hourglass`
- `hearts`
- `comment`
- `facebook`
- `gears`
- `grid`
- `infinity`
- `ios`
- `orbit`
- `oval`
- `pie`
- `puff`
- `radio`
- `tail`

## Uso Basico

```vue
<template>
  <div class="relative-position" style="height: 200px;">
    <p>Contenido del componente</p>
    <XLoading :loading="isLoading" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isLoading = ref(true)
</script>
```

## Ejemplos

### Loading con mensaje

```vue
<XLoading
  :loading="isLoading"
  message="Cargando datos..."
/>
```

### Loading con spinner personalizado

```vue
<XLoading
  :loading="isLoading"
  spinner="gears"
  color="secondary"
  size="70px"
/>
```

### Loading en modo oscuro

```vue
<XLoading
  :loading="isLoading"
  dark
  color="white"
  message="Procesando..."
/>
```

### En un formulario/card

```vue
<template>
  <q-card class="relative-position">
    <q-card-section>
      <h3>Formulario</h3>
      <XInput v-model="name" label="Nombre" />
      <XInput v-model="email" label="Email" />
    </q-card-section>

    <q-card-actions>
      <XButton label="Guardar" @click="handleSave" />
    </q-card-actions>

    <XLoading :loading="isSaving" message="Guardando..." />
  </q-card>
</template>
```

### En XDialog

```vue
<XDialog v-model="showDialog" title="Editar" :loading="isLoading">
  <template #content>
    <p>Contenido del dialogo...</p>
  </template>

  <template #action-buttons>
    <XButton label="Guardar" :loading="isLoading" @click="save" />
  </template>
</XDialog>
```

## Personalizacion CSS

El componente expone variables CSS para personalizacion:

```scss
.x-loading {
  --x-loading-overlay-bg: rgba(255, 255, 255, 0.7);
  --x-loading-spinner-size: 50px;
  --x-loading-message-color: #757575;
  --x-loading-message-font-size: 14px;
  --x-loading-z-index: 10;
  --x-loading-transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Ejemplo de personalizacion

```vue
<template>
  <div class="custom-loading-container relative-position">
    <p>Contenido...</p>
    <XLoading :loading="isLoading" />
  </div>
</template>

<style scoped>
.custom-loading-container :deep(.x-loading) {
  --x-loading-overlay-bg: rgba(0, 0, 0, 0.5);
  --x-loading-z-index: 100;
}
</style>
```

### Personalizacion global via SCSS

Modifica las variables en `_variables.scss`:

```scss
$x-loading-overlay-bg: rgba(255, 255, 255, 0.9);
$x-loading-spinner-size: 60px;
```

## Clases Auxiliares

El componente incluye clases auxiliares para variantes comunes:

```vue
<!-- Sin fondo -->
<XLoading :loading="true" class="x-loading-transparent" />

<!-- Con blur de fondo -->
<XLoading :loading="true" class="x-loading-blur" />

<!-- Tamanios predefinidos -->
<XLoading :loading="true" class="x-loading-sm" />
<XLoading :loading="true" class="x-loading-md" />
<XLoading :loading="true" class="x-loading-lg" />
<XLoading :loading="true" class="x-loading-xl" />
```

## Notas Importantes

- El contenedor padre debe tener `position: relative` (usar clase `relative-position` de Quasar)
- El XLoading se posiciona de forma absoluta sobre el contenedor padre
- En XDialog, el loading ya esta integrado via prop `loading`
