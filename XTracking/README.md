# XTracking

Componente de linea de tiempo para mostrar el historial de seguimiento de operaciones/eventos.

## Instalacion

```vue
<script setup>
import XTracking from '@/components/XTracking/XTracking.vue'
</script>
```

## Props

| Prop | Tipo | Default | Descripcion |
|------|------|---------|-------------|
| `records` | `Array` | `[]` | Lista de registros de tracking |

### Estructura de un Record

```typescript
interface TrackingRecord {
  title: string       // Titulo del evento
  created_at: string  // Fecha/hora del evento
  status: boolean     // true = positivo (verde), false = negativo (rojo)
  user_name: string   // Nombre del usuario
  description: string // Descripcion detallada
}
```

## Uso Basico

```vue
<template>
  <XTracking :records="historial" />
</template>

<script setup>
import { ref } from 'vue'

const historial = ref([
  {
    title: 'Documento enviado',
    created_at: '2024-01-15 10:30:00',
    status: true,
    user_name: 'Juan Perez',
    description: 'Documento enviado a SUNAT exitosamente'
  },
  {
    title: 'Error de validacion',
    created_at: '2024-01-15 10:25:00',
    status: false,
    user_name: 'Sistema',
    description: 'Error en campo RUC: formato invalido'
  }
])
</script>
```

## Ejemplos

### Tracking de documento

```vue
<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Historial del documento</div>
    </q-card-section>

    <q-card-section>
      <XTracking :records="documentTracking" />
    </q-card-section>
  </q-card>
</template>

<script setup>
const documentTracking = [
  {
    title: 'CDR Recibido',
    created_at: '2024-01-15 10:35:00',
    status: true,
    user_name: 'SUNAT',
    description: 'Constancia de recepcion obtenida correctamente'
  },
  {
    title: 'Documento Firmado',
    created_at: '2024-01-15 10:32:00',
    status: true,
    user_name: 'Sistema',
    description: 'Firma digital aplicada con certificado valido'
  },
  {
    title: 'Documento Creado',
    created_at: '2024-01-15 10:30:00',
    status: true,
    user_name: 'Maria Garcia',
    description: 'Factura F001-00001234 generada'
  }
]
</script>
```

### Tracking con errores

```vue
<template>
  <XTracking :records="trackingConErrores" />
</template>

<script setup>
const trackingConErrores = [
  {
    title: 'Reintento exitoso',
    created_at: '2024-01-15 11:00:00',
    status: true,
    user_name: 'Sistema',
    description: 'Documento enviado correctamente en segundo intento'
  },
  {
    title: 'Error de conexion',
    created_at: '2024-01-15 10:55:00',
    status: false,
    user_name: 'Sistema',
    description: 'Timeout al conectar con servicios de SUNAT'
  },
  {
    title: 'Primer intento',
    created_at: '2024-01-15 10:50:00',
    status: false,
    user_name: 'Sistema',
    description: 'Fallo en la comunicacion SOAP'
  }
]
</script>
```

### En un dialogo

```vue
<template>
  <XDialog v-model="showTracking" title="Historial de operaciones">
    <template #content>
      <XTracking :records="records" />
    </template>
  </XDialog>
</template>
```

## Personalizacion CSS

El componente expone variables CSS para personalizacion:

```scss
.x-tracking {
  --x-tracking-min-height: 100px;
  --x-tracking-line-color: var(--q-secondary);
  --x-tracking-dot-size: 15px;
  --x-tracking-title-font-size: 14px;
  --x-tracking-title-font-weight: 600;
  --x-tracking-subtitle-font-size: 12px;
  --x-tracking-subtitle-color: #757575;
  --x-tracking-content-font-size: 14px;
  --x-tracking-caption-color: #9e9e9e;
  --x-tracking-spacing: 16px;
  --x-tracking-transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Ejemplo de personalizacion

```vue
<template>
  <XTracking :records="records" class="custom-tracking" />
</template>

<style scoped>
.custom-tracking {
  --x-tracking-dot-size: 20px;
  --x-tracking-title-font-size: 16px;
  --x-tracking-spacing: 24px;
}
</style>
```

### Personalizacion global via SCSS

Modifica las variables en `_variables.scss`:

```scss
// No hay variables especificas, usa las globales
$x-font-size-md: 14px;
$x-spacing-md: 16px;
```

## Clases Auxiliares

| Clase | Descripcion |
|-------|-------------|
| `x-tracking-compact` | Version compacta con menos espaciado |
| `x-tracking-with-icons` | Soporte para iconos en los dots |
| `x-tracking-animated` | Animacion de entrada escalonada |

### Ejemplo con animacion

```vue
<XTracking :records="records" class="x-tracking-animated" />
```

## Colores por Status

| Status | Color | Uso |
|--------|-------|-----|
| `true` | Verde (positive) | Operaciones exitosas |
| `false` | Rojo (negative) | Errores o fallos |

## Integracion con Backend

El componente espera datos del modelo `Tracking` de Laravel:

```php
// Ejemplo de respuesta del backend
return [
    'title' => 'Documento enviado',
    'created_at' => $tracking->created_at->format('Y-m-d H:i:s'),
    'status' => $tracking->status,
    'user_name' => $tracking->user->name ?? 'Sistema',
    'description' => $tracking->description
];
```

## Notas

- Los registros se muestran en el orden que vienen del array
- Generalmente se ordenan de mas reciente a mas antiguo
- El color del dot cambia automaticamente segun el `status`
- Usa `q-timeline` de Quasar internamente
