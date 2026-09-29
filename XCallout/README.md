# XCallout

Aviso al estilo de las **alertas de GitHub**: barra de color a la izquierda, título con ícono y el
texto debajo. Sirve para explicar un dato junto a él (qué mide, cómo va, qué hacer), sin el peso de
un `XBanner`, que es un aviso de pantalla.

Portado del fork de QuiroSys (`@quirosys/x-components`) y adaptado al paquete: íconos por rol,
títulos traducibles y modo oscuro.

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `type` | String | `note` | `note` (azul), `tip` (verde), `important` (morado), `warning` (ámbar), `caution` (rojo). Un tipo desconocido cae a `note`: nunca pinta de verde un aviso cuyo tipo se escribió mal. |
| `title` | String | el del tipo | Título. Vacío = Nota, Consejo, Importante, Advertencia o Cuidado. |
| `icon` | String | el del tipo | Ícono propio: un rol del paquete (`ic()`) o una clase de cualquier set. |
| `dense` | Boolean | `false` | Compacto: menos relleno y letra más chica, para usarlo dentro de tarjetas. |

## Slots

| Slot | Uso |
|------|-----|
| default | El texto del aviso (admite varios `<p>`). |
| `title` | Título con marcado propio (reemplaza a la prop `title`). |

## Uso

```vue
<XCallout type="tip" title="Buen ritmo">
  Esta semana ya llevas 10 ventas más que la semana pasada a esta misma altura.
</XCallout>

<!-- Dentro de una tarjeta -->
<XCallout type="warning" dense>
  <p>El certificado digital vence en 12 días.</p>
  <p>Sin él no se puede firmar ningún comprobante.</p>
</XCallout>
```

## Títulos traducibles

El título por defecto sale de `components.callout.<tipo>` si la app cargó esas claves
(`xComponentsMessages`), y si no, del texto en español. No hace falta configurar nada para que
funcione.

## Colores

Los tonos son los de las alertas de GitHub, elegidos para que el **título**, que va en el color del
tipo, pase contraste AA sobre fondo claro. Los semánticos del tema no sirven para eso: el `warning`
de Quasar es un amarillo ilegible como texto. El fondo tenue sale del mismo color con opacidad, así
que cambiar un tipo es cambiar una variable:

```css
.x-callout {
  --x-callout-note: #0969da;
  --x-callout-tip: #1a7f37;
  --x-callout-important: #8250df;
  --x-callout-warning: #9a6700;
  --x-callout-caution: #cf222e;
}
```

En modo oscuro (`body.body--dark`) pasan a los tonos claros equivalentes.
