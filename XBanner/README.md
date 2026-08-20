# XBanner Component

A flexible wrapper for Quasar's `QBanner` with predefined semantic styles for success, error, warning, and information messages.

---

## ✅ Features

- Automatically applies color schemes based on `type`
- Supports semantic types: `success`, `error`, `warning`, `information`
- Dynamic `text-*` and `bg-*` class bindings
- Optional custom attributes passed via `v-bind="attrs"`
- Supports label via prop and custom content via slot

---

## 🔧 Props

| Prop        | Type   | Default     | Description                                             |
|-------------|--------|-------------|---------------------------------------------------------|
| `label`     | String | `''`        | Text content displayed in the banner                    |
| `type`      | String | `'success'` | Semantic type that defines the color scheme             |
| `bgColor`   | String | `null`      | Fondo propio; pisa al del `type`                        |
| `textColor` | String | `null`      | Color de texto propio; pisa al del `type`               |

---

## 🎨 Color Scheme Map

| Type         | Text Color   | Background Color |
|--------------|--------------|------------------|
| `success`    | `green-10`   | `green-11`       |
| `error`      | `red-10`     | `red-2`          |
| `information`| `blue-10`    | `blue-3`         |
| `warning`    | `orange-10`  | `orange-2`       |

> `warning` usaba `yellow-7` (#FBC02D), un amarillo de señalización mucho más
> saturado que el resto de la escala — gritaba más que un `error`, que es el estado
> más grave. Desde v2.19.0 sigue el mismo patrón que los demás: fondo claro, texto
> oscuro.

### Colores propios

Para el caso puntual que no entra en ningún `type`, sin tocar el paquete:

```vue
<!-- nombre de la paleta de Quasar -->
<XBanner bg-color="grey-3" text-color="grey-9">Aviso neutro</XBanner>

<!-- color CSS: hexadecimal, rgb() o una variable de tema -->
<XBanner bg-color="#FFF8E1" text-color="#8D6E63">Con hexa</XBanner>
<XBanner bg-color="var(--x-brand-light)" text-color="var(--x-brand)">Del tema</XBanner>
```

Los helpers `bg-*` / `text-*` de Quasar son clases generadas para SU paleta y **no
aceptan un hexadecimal**, así que el componente distingue: si el valor arranca con
`#`, `rgb`, `hsl` o `var(`, lo aplica como estilo inline; si no, como clase.

---

## 🧠 Inherits

Any native props or attributes supported by `QBanner` can be passed via `v-bind="attrs"`.

---

## 🚀 Usage Examples

### Basic success banner

```vue
<XBanner label="Operación realizada con éxito" type="success" />
```

### Warning with custom slot content

```vue
<XBanner type="warning">
  <div class="row items-center">
    <q-icon name="warning" class="q-mr-sm" />
    <span>Se requiere atención inmediata.</span>
  </div>
</XBanner>
```

### Error banner with Quasar attributes

```vue
<XBanner label="Error de validación" type="error" class="q-mb-md" dense />
```

---

## 📌 Notes

- The component applies both `text-{color}` and `bg-{color}` classes dynamically.
- Extend the scoped style in the `.vue` file to customize padding, radius, or typography.

---