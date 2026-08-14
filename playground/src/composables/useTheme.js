import { reactive, watch } from 'vue'

// ==========================================================================
// Motor del generador de temas.
//
// Escribe los tokens --x-* en :root y genera el SCSS equivalente. Funciona en
// RUNTIME (sin compilar Sass en el navegador) porque los componentes derivan
// de tokens CSS — ver _tokens.scss. Con variables Sass esto seria imposible.
// ==========================================================================

/** Los tokens que el panel expone, con su valor por defecto del paquete. */
export const TOKENS = [
  { key: '--x-brand', label: 'Color de marca', type: 'color', def: '#1976d2', group: 'Marca' },

  { key: '--x-radius', label: 'Radio base', type: 'px', def: 4, min: 0, max: 24, group: 'Forma',
    hint: 'input, select, boton, card, checkbox' },
  { key: '--x-radius-md', label: 'Radio medio', type: 'px', def: 8, min: 0, max: 32, group: 'Forma',
    hint: 'dialogos' },
  { key: '--x-radius-lg', label: 'Radio grande', type: 'px', def: 12, min: 0, max: 40, group: 'Forma',
    hint: 'menus desplegables' },

  { key: '--x-surface', label: 'Superficie', type: 'color', def: '#ffffff', group: 'Roles' },
  { key: '--x-surface-hover', label: 'Superficie hover', type: 'color', def: '#f2f4f7', group: 'Roles' },
  { key: '--x-border', label: 'Borde', type: 'color', def: '#e4e7ec', group: 'Roles' },
  { key: '--x-text', label: 'Texto fuerte', type: 'color', def: '#1d2939', group: 'Roles' },
  { key: '--x-text-body', label: 'Texto cuerpo', type: 'color', def: '#344054', group: 'Roles' },
  { key: '--x-text-muted', label: 'Texto atenuado', type: 'color', def: '#667085', group: 'Roles' },

  { key: '--x-success', label: 'Exito', type: 'color', def: '#21ba45', group: 'Semanticos' },
  { key: '--x-danger', label: 'Peligro', type: 'color', def: '#c10015', group: 'Semanticos' },
  { key: '--x-warning', label: 'Advertencia', type: 'color', def: '#f2c037', group: 'Semanticos' },
  { key: '--x-info', label: 'Info', type: 'color', def: '#31ccec', group: 'Semanticos' },

  { key: '--x-duration', label: 'Duracion', type: 'ms', def: 300, min: 0, max: 800, group: 'Movimiento' },
]

const formato = {
  color: (v) => v,
  px: (v) => `${v}px`,
  ms: (v) => `${v / 1000}s`,
}

export function useTheme () {
  const valores = reactive(Object.fromEntries(TOKENS.map((t) => [t.key, t.def])))

  /** Escribe los tokens modificados en :root — efecto instantaneo. */
  function aplicar () {
    const root = document.documentElement
    for (const t of TOKENS) {
      const v = valores[t.key]
      if (v === t.def) root.style.removeProperty(t.key)
      else root.style.setProperty(t.key, formato[t.type](v))
    }
  }

  function reset () {
    for (const t of TOKENS) valores[t.key] = t.def
  }

  /** Solo lo que cambio respecto del default: el tema es un diff, no un volcado. */
  function modificados () {
    return TOKENS.filter((t) => valores[t.key] !== t.def)
  }

  /** SCSS listo para pegar en el app.scss del consumidor. */
  function scss () {
    const difs = modificados()
    if (!difs.length) {
      return '// Sin cambios respecto del tema por defecto.\n' +
             '// Move algun control del panel y el SCSS aparece aca.'
    }
    const grupos = [...new Set(difs.map((t) => t.group))]
    const cuerpo = grupos.map((g) => {
      const items = difs.filter((t) => t.group === g)
      const ancho = Math.max(...items.map((t) => t.key.length))
      return `  // ${g}\n` + items
        .map((t) => `  ${t.key.padEnd(ancho)}: ${formato[t.type](valores[t.key])};`)
        .join('\n')
    }).join('\n\n')

    return [
      '// Tema generado con el playground de @esolutions/x-components.',
      '// Pegar en el app.scss del consumidor DESPUES de:',
      "//   @import '@esolutions/x-components/index';",
      '',
      ':root {',
      cuerpo,
      '}',
    ].join('\n')
  }

  watch(valores, aplicar, { deep: true, immediate: true })

  return { valores, TOKENS, reset, scss, modificados }
}
