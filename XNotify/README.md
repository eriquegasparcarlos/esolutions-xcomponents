# useNotify

Composable para notificaciones con diseño **x-toast** (estilo Flowbite).

Encapsula `$q.notify` de Quasar con los iconos FA Pro, clases CSS y timeouts correctos.
No requiere configuración adicional — las clases `x-toast` ya están definidas en `themes/shadcn.overrides.scss`.

## Requisitos

- `Notify` registrado en `plugins` de `quasar.config.js`
- `src/boot/notify.js` para cubrir `positive`/`negative` de componentes nativos Quasar

## Uso

```js
import { useNotify } from 'components/XNotify/useNotify'

const notify = useNotify()

notify.success('Guardado correctamente.')
notify.error('Error al procesar.')
notify.warning('Verifica los datos antes de continuar.')
notify.info('Ten en cuenta que los cambios aplican al instante.')
```

## Opciones adicionales (segundo argumento)

```js
notify.success('Operación completada.', { timeout: 8000 })
notify.error('Error crítico.', { caption: 'Contacta al administrador.' })
```

Cualquier opción de [QNotify](https://quasar.dev/quasar-plugins/notify) puede pasarse como segundo argumento y sobreescribirá los defaults.

## Tipos y sus defaults

| Método     | Icono FA                        | Clase CSS             | Timeout |
|------------|---------------------------------|-----------------------|---------|
| `success`  | `fa-light fa-check`             | `x-toast--success`    | 3000ms  |
| `error`    | `fa-light fa-xmark`             | `x-toast--error`      | 5000ms  |
| `warning`  | `fa-light fa-triangle-exclamation` | `x-toast--warning` | 4000ms  |
| `info`     | `fa-light fa-circle-info`       | `x-toast--info`       | 3000ms  |
