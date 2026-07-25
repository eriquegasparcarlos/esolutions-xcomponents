# XSettingToggle

Fila de ajuste tipo "settings": **[ícono] título + descripción** a la izquierda y un **switch** a la derecha. Pensado para interruptores de configuración con contexto legible.

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `modelValue` | Boolean | `false` | v-model del switch. |
| `label` | String | `''` | Título. |
| `description` | String | `''` | Texto de ayuda bajo el título (color legible). |
| `icon` | String | `''` | Ícono estático. |
| `iconOn` / `iconOff` | String | `''` | Íconos que alternan según el estado (tienen prioridad sobre `icon`). |
| `feedbackOff` | String | `''` | Aviso inline mostrado SOLO cuando el switch está apagado. |
| `disable` | Boolean | `false` | Deshabilita el switch. |
| `boxed` | Boolean | `false` | Contenedor sutil para destacar un switch "maestro". |

## Uso

```vue
<XSettingToggle
  v-model="form.is_inventoriable"
  label="Inventariable"
  description="Apágalo para vender sin controlar stock."
  icon-on="fa-solid fa-boxes-stacked"
  icon-off="fa-solid fa-box-open"
  feedback-off="No se validará stock al vender."
  :disable="locked"
  boxed
/>
```
