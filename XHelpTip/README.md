# XHelpTip

Ícono **"?"** de ayuda con tooltip informativo. Sustituye las descripciones inline largas por un ícono discreto junto al label.

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `text` | String | `''` | Texto del tooltip (o usar el slot por defecto). |
| `icon` | String | `help` | Rol del ícono a mostrar. |
| `size` | String | `15px` | Tamaño del ícono. |
| `maxWidth` | String | `260px` | Ancho máximo del globo. |

## Uso

```vue
<XHelpTip text="El precio ya trae el IGV incluido." />

<!-- Contenido enriquecido por slot -->
<XHelpTip><b>Nota:</b> solo aplica a ventas gravadas.</XHelpTip>
```

Los componentes de formulario **XInput**, **XSelect** y **XCheckbox** lo montan automáticamente mediante su prop `help`, por lo que normalmente no hace falta usarlo suelto.
