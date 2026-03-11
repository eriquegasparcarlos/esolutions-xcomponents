# XInputSearchPerson

Componente de busqueda de personas/empresas por RUC o DNI con integracion a servicios externos (SUNAT/RENIEC).

## Instalacion

```vue
<script setup>
import XInputSearchPerson from '@/components/XInputSearchPerson/XInputSearchPerson.vue'
</script>
```

## Props

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `modelValue` | `String \| Number` | `''` | Numero de documento (v-model) |
| `identityDocumentTypeId` | `String \| Number` | `'6'` | Tipo de documento |
| `showButton` | `Boolean` | `true` | Mostrar boton de busqueda |
| `readonly` | `Boolean` | `false` | Campo de solo lectura |

### Tipos de Documento

| ID | Tipo | Longitud |
|----|------|----------|
| `'6'` | RUC | 11 digitos |
| `'1'` | DNI | 8 digitos |
| Otro | Generico | 20 caracteres max |

## Eventos

| Evento | Payload | Descripcion |
|--------|---------|-------------|
| `update:modelValue` | `String` | Cambio del numero de documento |
| `success` | `Object` | Datos de la persona/empresa encontrada |

## Uso Basico

```vue
<template>
  <XInputSearchPerson
    v-model="ruc"
    @success="handlePersonFound"
  />
</template>

<script setup>
import { ref } from 'vue'

const ruc = ref('')

function handlePersonFound(data) {
  console.log('Persona encontrada:', data)
  // data contiene: nombre, direccion, etc.
}
</script>
```

## Ejemplos

### Busqueda por RUC (default)

```vue
<XInputSearchPerson
  v-model="ruc"
  identity-document-type-id="6"
  @success="onRucFound"
/>
```

### Busqueda por DNI

```vue
<XInputSearchPerson
  v-model="dni"
  identity-document-type-id="1"
  @success="onDniFound"
/>
```

### Sin boton (solo input)

```vue
<XInputSearchPerson
  v-model="documento"
  :show-button="false"
/>
```

### Solo lectura

```vue
<XInputSearchPerson
  v-model="rucCliente"
  readonly
/>
```

### Formulario de cliente completo

```vue
<template>
  <q-form @submit="handleSubmit">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <XSelect
          v-model="form.identity_document_type_id"
          label="Tipo de documento"
          :options="tiposDocumento"
        />
      </div>

      <div class="col-12 col-md-8">
        <XInputSearchPerson
          v-model="form.number"
          :identity-document-type-id="form.identity_document_type_id"
          @success="fillFormWithData"
        />
      </div>

      <div class="col-12">
        <XInput
          v-model="form.name"
          label="Razon social / Nombre"
        />
      </div>

      <div class="col-12">
        <XInput
          v-model="form.address"
          label="Direccion"
        />
      </div>
    </div>

    <XButton type="submit" label="Guardar" class="q-mt-md" />
  </q-form>
</template>

<script setup>
import { ref } from 'vue'

const tiposDocumento = [
  { id: '6', name: 'RUC' },
  { id: '1', name: 'DNI' }
]

const form = ref({
  identity_document_type_id: '6',
  number: '',
  name: '',
  address: ''
})

function fillFormWithData(data) {
  form.value.name = data.name || data.razonSocial || ''
  form.value.address = data.address || data.direccion || ''
}
</script>
```

### Con validacion de formulario

```vue
<template>
  <XInputSearchPerson
    v-model="ruc"
    :error="errors.ruc"
    @success="handleSuccess"
    @update:model-value="errors.ruc = ''"
  />
</template>

<script setup>
import { ref } from 'vue'

const ruc = ref('')
const errors = ref({ ruc: '' })

function validate() {
  if (!ruc.value) {
    errors.value.ruc = 'RUC es requerido'
    return false
  }
  if (ruc.value.length !== 11) {
    errors.value.ruc = 'RUC debe tener 11 digitos'
    return false
  }
  return true
}
</script>
```

## Personalizacion CSS

El componente expone variables CSS para personalizacion:

```scss
.x-input-search-person {
  --x-search-person-gap: 8px;
  --x-search-person-button-min-width: 80px;
  --x-search-person-transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Ejemplo de personalizacion

```vue
<template>
  <XInputSearchPerson
    v-model="ruc"
    class="custom-search"
  />
</template>

<style scoped>
.custom-search {
  --x-search-person-gap: 16px;
  --x-search-person-button-min-width: 100px;
}
</style>
```

## Clases Auxiliares

| Clase | Descripcion |
|-------|-------------|
| `x-input-search-person-no-label` | Alinea boton cuando no hay label |
| `x-input-search-person-inline` | Layout horizontal compacto |
| `x-input-search-person-compact` | Version reducida |
| `x-input-search-person-loading` | Estado de carga |

## Respuesta del Servicio

El evento `success` devuelve un objeto con la informacion encontrada:

```typescript
// Para RUC
interface RucResponse {
  ruc: string
  razonSocial: string
  direccion: string
  estado: string
  condicion: string
  // ... otros campos de SUNAT
}

// Para DNI
interface DniResponse {
  dni: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  // ... otros campos de RENIEC
}
```

## Endpoint Backend

El componente hace POST a `/store/customer-search-service`:

```php
// Request
{
    "identity_document_type_id": "6",
    "number": "20123456789"
}

// Response exitoso
{
    "success": true,
    "data": {
        "name": "EMPRESA SAC",
        "address": "AV. EJEMPLO 123"
    }
}

// Response error
{
    "success": false,
    "message": "No se encontro resultado"
}
```

## Comportamiento

- **Enter**: Ejecuta la busqueda si el documento tiene la longitud correcta
- **Boton deshabilitado**: Hasta que el documento tenga la longitud esperada
- **Loading**: Muestra indicador de carga durante la peticion
- **Notificacion**: Muestra error si no se encuentra resultado

## Notas

- Usa internamente XInput y XButton
- El label cambia automaticamente segun el tipo de documento
- La longitud maxima se ajusta al tipo de documento
- El boton solo se habilita cuando la longitud es correcta
