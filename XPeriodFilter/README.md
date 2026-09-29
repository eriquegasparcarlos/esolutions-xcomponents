# XPeriodFilterInline

El **filtro de período en línea**, para tablas y reportes: un selector con los modos (por fecha, entre
fechas, por mes, entre meses, todas) y los campos de fecha o de mes que pide el modo elegido.

Es la pieza que comparten `XTableServer` y `XcTable`: antes cada uno tenía su copia del mismo bloque, y
la de `XTableServer` además aplicaba dos veces la clase de columna del filtro, así que quedaba más
angosto de lo que la fila le daba.

Portado del fork de QuiroSys (`@quirosys/x-components`) y adaptado: etiquetas traducibles con respaldo
en español, y la etiqueta de un modo que el servidor ya manda traducida se respeta.

## v-model

El filtro con los nombres que lee el backend (`esolutions/datatable`, `FilterTrait::getFilterDate`):

```js
{ value, dateStart, dateEnd, monthStart, monthEnd }
// value: 'month' | 'date' | 'between_months' | 'between_dates' | 'all'
// dateStart / dateEnd: 'YYYY-MM-DD' · monthStart / monthEnd: 'YYYY-MM'
```

Cada cambio del usuario emite **una vez** `update:modelValue` y `change` con los cinco campos; los que no
cambiaron van tal como llegaron. No emite al montar: quien lo usa decide cuándo consultar.

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `modelValue` | Object | `{}` | El filtro (ver arriba) |
| `options` | Array | los cuatro de siempre | Modos, en su orden: ids (`'month'`) u objetos `{ id, name }` como los manda `Filter::makePeriod` |
| `label` | String | `'Periodo'` | Etiqueta del selector de modo |
| `gutter` | String | `'sm'` | Espaciado entre campos, el de la grilla donde va |
| `stack` | Boolean | `false` | En el teléfono, un campo por fila, como el resto de un formulario |

## Uso

```vue
<XPeriodFilterInline v-model="periodo" @change="consultar" />
```

## Se acomoda a su columna

Se adapta al ancho de **su columna**, no al de la pantalla. Cada campo tiene el ancho mínimo de su
texto más largo y, si no entra al lado del otro, baja a la fila siguiente en vez de cortar la fecha. Las
dos fechas de un rango van agrupadas, así que bajan **juntas**: el modo arriba y el "desde / hasta"
abajo.

El fork de QuiroSys lo resolvía con *container queries*; acá no se usan porque `container-type` le quita
al filtro su ancho propio, y en una columna que se ajusta al contenido (`col-auto`, o XcTable sin clase
en el filtro) colapsaba a unos pocos píxeles.

## Etiquetas

Salen de `components.periodModes.<modo>`, `components.period`, `components.date`,
`components.dateFrom`… si la app cargó esas claves, y si no, del texto en español. Si el servidor manda
el nombre del modo ya traducido, ese gana.
