import { reactive, computed, watch } from 'vue'
import catalogo from '../catalog.generated.json'

// ==========================================================================
// Motor del generador de temas — DOS NIVELES
//
//   1. GLOBAL  -> tokens en :root (--x-brand, --x-radius...). Cambian todos
//                 los componentes que derivan de ellos.
//   2. POR COMPONENTE -> las ~127 variables --x-* de cada componente, y las de
//                 cada VARIANTE (.x-toggle-sm, .x-badge-pill...). Permiten
//                 ajustar uno sin tocar el resto.
//
// Todo se aplica en RUNTIME (sin compilar Sass) porque los componentes leen
// variables CSS. El SCSS exportado respeta el selector de cada nivel.
//
// El catalogo se genera solo: `pnpm catalog` (scripts/build-catalog.mjs).
// ==========================================================================

/** Nivel 1: tokens raiz, con su default del paquete. */
export const TOKENS = [
  { key: '--x-brand', label: 'Color de marca', control: 'color', def: '#1976d2', group: 'Marca' },

  { key: '--x-radius', label: 'Radio base', control: 'px', def: 4, min: 0, max: 24, group: 'Forma', hint: 'input, select, boton, card' },
  { key: '--x-radius-md', label: 'Radio medio', control: 'px', def: 8, min: 0, max: 32, group: 'Forma', hint: 'dialogos' },
  { key: '--x-radius-lg', label: 'Radio grande', control: 'px', def: 12, min: 0, max: 40, group: 'Forma', hint: 'menus' },

  { key: '--x-surface', label: 'Superficie', control: 'color', def: '#ffffff', group: 'Roles' },
  { key: '--x-surface-hover', label: 'Superficie hover', control: 'color', def: '#f2f4f7', group: 'Roles' },
  { key: '--x-border', label: 'Borde', control: 'color', def: '#e4e7ec', group: 'Roles' },
  { key: '--x-text', label: 'Texto fuerte', control: 'color', def: '#1d2939', group: 'Roles' },
  { key: '--x-text-body', label: 'Texto cuerpo', control: 'color', def: '#344054', group: 'Roles' },
  { key: '--x-text-muted', label: 'Texto atenuado', control: 'color', def: '#667085', group: 'Roles' },

  { key: '--x-success', label: 'Exito', control: 'color', def: '#21ba45', group: 'Semanticos' },
  { key: '--x-danger', label: 'Peligro', control: 'color', def: '#c10015', group: 'Semanticos' },
  { key: '--x-warning', label: 'Advertencia', control: 'color', def: '#f2c037', group: 'Semanticos' },
  { key: '--x-info', label: 'Info', control: 'color', def: '#31ccec', group: 'Semanticos' },

  { key: '--x-duration', label: 'Duracion', control: 'ms', def: 300, min: 0, max: 800, group: 'Movimiento' },
]

export const CATALOGO = catalogo
export const COMPONENTES = Object.keys(catalogo).sort()

const fmt = {
  color: (v) => v,
  'color-rgba': (v) => v,
  px: (v) => `${v}px`,
  ms: (v) => `${v / 1000}s`,
  number: (v) => String(v),
  texto: (v) => v,
}
const formatear = (control, v) => (fmt[control] || fmt.texto)(v)

/** Las variables editables de un selector (base o variante). */
export function varsDe (comp, selector) {
  const c = CATALOGO[comp]
  if (!c) return []
  return Object.entries(c.vars)
    .filter(([, meta]) => meta.control !== 'derivado')
    .map(([key, meta]) => ({
      key,
      selector,
      label: key.replace(/^--x-/, '').replace(/-/g, ' '),
      ...meta,
      min: meta.control === 'px' ? 0 : undefined,
      max: meta.control === 'px' ? Math.max(64, meta.def * 3) : undefined,
    }))
}

export function useTheme () {
  // Nivel 1
  const global = reactive(Object.fromEntries(TOKENS.map((t) => [t.key, t.def])))
  // Nivel 2: { '.x-dialog': { '--x-dialog-header-padding': 24 }, ... }
  const porSelector = reactive({})

  function setVar (selector, key, valor) {
    ;(porSelector[selector] ||= {})[key] = valor
  }
  function getVar (selector, key, def) {
    return porSelector[selector]?.[key] ?? def
  }

  /** Hoja <style> propia: los overrides por selector no caben en :root. */
  function hoja () {
    let el = document.getElementById('__x-theme')
    if (!el) {
      el = document.createElement('style')
      el.id = '__x-theme'
      document.head.appendChild(el)
    }
    return el
  }

  function aplicar () {
    // Nivel 1 -> :root inline
    const root = document.documentElement
    for (const t of TOKENS) {
      const v = global[t.key]
      if (v === t.def) root.style.removeProperty(t.key)
      else root.style.setProperty(t.key, formatear(t.control, v))
    }
    // Nivel 2 -> reglas por selector
    hoja().textContent = bloquesCss()
  }

  /** Solo lo que difiere del default: el tema es un diff, no un volcado. */
  const difsGlobales = computed(() => TOKENS.filter((t) => global[t.key] !== t.def))

  const difsPorSelector = computed(() => {
    const out = {}
    for (const [sel, vars] of Object.entries(porSelector)) {
      const comp = Object.keys(CATALOGO).find(
        (c) => CATALOGO[c].selector === sel || CATALOGO[c].variantes.includes(sel),
      )
      const meta = comp ? CATALOGO[comp].vars : {}
      const cambiadas = Object.entries(vars).filter(([k, v]) => {
        const d = meta[k]
        return d ? v !== d.def : true
      })
      if (cambiadas.length) out[sel] = cambiadas
    }
    return out
  })

  const totalCambios = computed(
    () => difsGlobales.value.length +
      Object.values(difsPorSelector.value).reduce((a, v) => a + v.length, 0),
  )

  function bloquesCss () {
    const partes = []
    for (const [sel, cambiadas] of Object.entries(difsPorSelector.value)) {
      const comp = Object.keys(CATALOGO).find(
        (c) => CATALOGO[c].selector === sel || CATALOGO[c].variantes.includes(sel),
      )
      const meta = comp ? CATALOGO[comp].vars : {}
      const decls = cambiadas
        .map(([k, v]) => `  ${k}: ${formatear(meta[k]?.control || 'texto', v)};`)
        .join('\n')
      partes.push(`${sel} {\n${decls}\n}`)
    }
    return partes.join('\n\n')
  }

  function scss () {
    const g = difsGlobales.value
    const porSel = difsPorSelector.value
    if (!g.length && !Object.keys(porSel).length) {
      return '// Sin cambios respecto del tema por defecto.\n' +
             '// Move algun control del panel y el SCSS aparece aca.'
    }

    const partes = [
      '// Tema generado con el playground de @esolutions/x-components.',
      '// Pegar en el app.scss del consumidor DESPUES de:',
      "//   @import '@esolutions/x-components/index';",
      '',
    ]

    if (g.length) {
      const grupos = [...new Set(g.map((t) => t.group))]
      const cuerpo = grupos.map((gr) => {
        const items = g.filter((t) => t.group === gr)
        const w = Math.max(...items.map((t) => t.key.length))
        return `  // ${gr}\n` + items
          .map((t) => `  ${t.key.padEnd(w)}: ${formatear(t.control, global[t.key])};`).join('\n')
      }).join('\n\n')
      partes.push('// Tokens globales: afectan a todos los componentes que derivan de ellos.')
      partes.push(':root {', cuerpo, '}')
    }

    const css = bloquesCss()
    if (css) {
      if (g.length) partes.push('')
      partes.push('// Ajustes por componente / variante.')
      partes.push(css)
    }

    return partes.join('\n')
  }

  function reset () {
    for (const t of TOKENS) global[t.key] = t.def
    for (const k of Object.keys(porSelector)) delete porSelector[k]
  }

  watch([global, porSelector], aplicar, { deep: true, immediate: true })

  return { global, porSelector, setVar, getVar, TOKENS, reset, scss, totalCambios, difsGlobales, difsPorSelector }
}
