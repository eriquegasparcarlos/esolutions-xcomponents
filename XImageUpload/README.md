# XImageUpload

Zona de carga de imagen con preview y validación. Sin crop — el padre recibe el `File` y decide cuándo subirlo.

## Uso

```vue
<script setup>
import XImageUpload from 'components/XImageUpload/XImageUpload.vue'
import { ref } from 'vue'

const logoFile   = ref(null)
const logoUrl    = ref('https://...')   // URL actual desde el servidor

async function uploadLogo() {
  if (!logoFile.value) return
  const fd = new FormData()
  fd.append('file', logoFile.value)
  const { data } = await api.post('/system/general/logo', fd)
  logoUrl.value  = data.data.logo_url
  logoFile.value = null
}
</script>

<template>
  <x-image-upload
    v-model="logoFile"
    :preview-url="logoUrl"
    label="Click para subir logo"
    @update:model-value="uploadLogo"
  />
</template>
```

## Props

| Prop         | Tipo     | Default                                          | Descripción                           |
|--------------|----------|--------------------------------------------------|---------------------------------------|
| `modelValue` | `File`   | `null`                                           | Archivo seleccionado (v-model)        |
| `previewUrl` | `String` | `''`                                             | URL de imagen actual (del servidor)   |
| `label`      | `String` | `'Click para subir imagen'`                      | Texto principal de la zona            |
| `hint`       | `String` | `''`                                             | Texto secundario (auto si vacío)      |
| `accept`     | `String` | `'image/png,image/jpeg,image/webp,image/svg+xml'`| MIME types aceptados                  |
| `maxSizeMb`  | `Number` | `2`                                              | Tamaño máximo en MB                   |

## Eventos

| Evento              | Payload | Descripción                         |
|---------------------|---------|-------------------------------------|
| `update:modelValue` | `File`  | Archivo seleccionado y validado     |

## Notas

- Si `modelValue` tiene un archivo, el preview se genera con `URL.createObjectURL`.
- Si no hay archivo, muestra `previewUrl` (URL del servidor).
- Validaciones internas: tipo de archivo y tamaño. Notifica con `$q.notify` tipo `warning`.
- Para subir automáticamente al seleccionar, escuchar `@update:model-value` en el padre.
