# XConfirmAction

Diálogo de confirmación con el diseño de `XDialogAction` (ícono en círculo de color, título, descripción, botones), pero **desacoplado del backend**: el contenido viene por `open(config)` y al confirmar ejecuta un callback del padre — así se hace **una sola request** (la acción real), sin los endpoints `record-*`/`{action}` que exige `XDialogAction`.

Pensado para eliminar/desactivar/confirmar acciones desde tablas (`XTableServer`) reusando la fila ya cargada (`_raw`), sin llamadas extra.

## Uso

```vue
<script setup>
import XConfirmAction from 'components/XConfirmAction/XConfirmAction.vue'
import { ref } from 'vue'
import { api } from 'boot/axios'

const confirmRef = ref(null)

function confirmDelete(id) {
  confirmRef.value.open({
    variant: 'danger',
    title: 'Eliminar tarea',
    message: '¿Eliminar esta tarea programada del servidor?',
    confirmLabel: 'Eliminar',
    // UNA sola llamada al back; el diálogo maneja el loading y se cierra al terminar:
    onConfirm: async () => {
      await api.delete(`/servers/1/cron-jobs/${id}`)
      refreshTable()
    },
  })
}
</script>

<template>
  <x-confirm-action ref="confirmRef" />
</template>
```

## `open(config)`

| Campo | Tipo | Descripción |
|---|---|---|
| `variant` | `'danger'\|'warning'\|'success'\|'info'\|'primary'` | Color + ícono por defecto. |
| `icon` | `string` | Rol del icono (`delete`, `warning`, `info`…). Opcional; deriva del variant. Ver [icons/README.md](../icons/README.md). |
| `title` | `string` | Título. |
| `message` | `string` | Descripción (acepta HTML). |
| `confirmLabel` / `cancelLabel` | `string` | Textos de los botones. |
| `requireText` | `string` | **Escribir-para-confirmar**: el botón se habilita solo si el usuario escribe este texto (estilo GitHub). Gate 100% frontend. |
| `requirePassword` | `boolean` | Muestra input de contraseña; su valor va en `onConfirm({ password })` para enviarlo en la misma request. |
| `passwordLabel` | `string` | Label del input de password. |
| `onConfirm` | `async ({ password }) => void` | Callback del padre. Si se pasa, el diálogo muestra loading mientras corre y se cierra al terminar bien (si lanza, queda abierto). |

## Niveles de fricción

- **Simple**: solo `variant` + `title` + `message`.
- **Escribir-para-confirmar**: agrega `requireText` (para borrados irreversibles).
- **Password**: agrega `requirePassword` (para acciones sensibles; se valida en el backend con la misma request).

## Config desde el backend (sin llamada extra)

El config puede venir embebido en el botón/fila del `XTableServer` (ej. `row._raw.confirm`), de modo que **el backend controla la fricción por recurso** sin un GET aparte:

```js
function handleAction({ action, id, _raw }) {
  if (action === 'remove') {
    confirmRef.value.open({
      ..._raw.confirm,  // { variant, title, message, requireText?, requirePassword? } del backend
      onConfirm: async () => { await api.delete(`.../${id}`); refresh() },
    })
  }
}
```

## Diferencia con `XDialogAction`

| | `XDialogAction` | `XConfirmAction` |
|---|---|---|
| Llamadas al back | 2 (GET config + POST acción) | **1** (solo la acción) |
| Endpoints requeridos | `record-{action}` + `{action}` por recurso | Ninguno |
| Contenido del diálogo | backend-driven | props / `open(config)` / `_raw` |
| Fricción | password (backend) | simple / escribir-para-confirmar / password |
| Ejecuta la acción | el componente | el padre (`onConfirm`) |
