# XStatCard

Tarjeta de **un número** para tableros: ícono, título, valor grande, un chip de contexto o de
variación frente al período anterior, un texto chico y la ayuda "?" con la definición del número.
Se arma sobre `q-card flat bordered`, así que se ve igual que el resto de las tarjetas del tema.

Portado del fork de QuiroSys (`@quirosys/x-components`) y adaptado al paquete: el tono `primary`
sigue la marca del tema (`--x-brand`), los textos usan los roles de texto de los tokens, las
flechas son íconos por rol y hay modo oscuro.

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `title` | String | `''` | Título del número |
| `value` | String \| Number | `null` | Valor ya formateado; `null` se pinta como "—" (sin dato no es lo mismo que cero) |
| `icon` | String | `''` | Ícono de la baldosa: rol del paquete o clase de cualquier set |
| `tone` | String | `'primary'` | Tono del ícono: `primary` (la marca), `purple`, `orange`, `green`, `red`, `amber`, `teal`, `grey` |
| `delta` | String | `''` | Texto del chip ("4 %", "5 de 7") |
| `deltaTone` | String | `'neutral'` | `positive`, `negative`, `warning`, `neutral` |
| `deltaIcon` | String | `''` | `up` o `down`: flecha de tendencia dentro del chip |
| `caption` | String | `''` | Texto chico debajo (o el slot por defecto) |
| `help` | String | `''` | Definición del número, en un `XHelpTip` |
| `loading` | Boolean | `false` | Esqueleto de carga |

## Slots

| Slot | Uso |
|------|-----|
| default | Reemplaza al `caption` cuando hace falta marcado (un enlace, un número en negrita). |

## Uso

```vue
<XStatCard
  icon="chart" tone="primary" title="Ventas de hoy"
  value="S/ 1,240.00" delta="12 %" delta-tone="positive" delta-icon="up"
  caption="18 comprobantes" help="Sin notas de crédito ni comprobantes anulados."
/>

<XStatCard title="Ocupación" :value="null" :loading="cargando" />
```

## Colores

Cada tono es una variable (`--x-stat-purple`, `--x-stat-orange`, …) y `--x-stat-primary` apunta a
`--x-brand`, así que la tarjeta sigue la paleta que elija cada empresa. El fondo tenue del ícono y del
chip sale del mismo color con opacidad (sin `color-mix()`, que no existe en Safari 14).
