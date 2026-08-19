import { reactive } from 'vue'
import { paths } from './paths.js'
import { aliases } from './aliases.js'

/**
 * Resolucion de iconos del paquete.
 *
 * Los componentes no nombran un icono concreto: piden un ROL (`ic('delete')`)
 * y este modulo decide con que se dibuja. Por defecto se dibuja con los paths
 * SVG de paths.js, que viajan dentro del paquete: nadie necesita FontAwesome
 * Pro, ni token, ni webfonts, ni red.
 *
 * Un proyecto que si tiene FontAwesome Pro lo recupera con una linea:
 *
 *   import { setXIcons } from '@esolutions/x-components/icons'
 *   setXIcons({ delete: 'fal fa-trash-can', save: 'fal fa-floppy-disk' })
 *
 * El override gana sobre el default y se pasa tal cual a QIcon, asi que sirve
 * para cualquier set: FontAwesome, Material Symbols, mdi, un SVG propio.
 */

// Estilo de trazo de los iconos por defecto. Lucide es stroke-based, y
// `.q-icon` trae `fill: currentColor`, que sin esto los pintaria como manchas.
const STROKE = 'fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round'
const VIEW_BOX = '0 0 24 24'

// Rol que se dibuja cuando el nombre pedido no existe. Pasa cuando el icono lo
// elige el backend (XDialogAction, los botones del datatable): un nombre nuevo
// alla no debe romper una pantalla aca.
const FALLBACK = 'help'

// Prefijos de otros icon sets. Si el consumidor pide uno de estos, el nombre
// se deja pasar sin tocar: es Quasar el que sabe dibujarlo, no nosotros.
const FOREIGN_RE = /^(img:|svguse:|ion-|mdi-|bt-|eva-|las |la[srlbdk]? |bi-|sym_[ors]_|[orsm]_)/

// Un path SVG ya resuelto (mismo criterio que usa QIcon para detectarlos).
const SVG_PATH_RE = /^[Mm]\s?[-+]?\.?\d/

// Prefijo de familia de FontAwesome, en las dos sintaxis que conviven en los
// proyectos: la larga (`fa-light fa-trash`) y la corta (`fal fa-trash`).
const FA_RE = /^(fa-(classic|sharp|solid|regular|light|brands|duotone|thin)|[lf]a[srlbdk]?)\s+fa-/

const overrides = reactive({})
const cache = new Map()

/** Arma el string que QIcon entiende: 'd1@@style&&d2@@style|viewBox'. */
function compose (role) {
  const def = paths[ role ]
  if (def === void 0) return ''
  return def.map(d => `${ d }@@${ STROKE }`).join('&&') + '|' + VIEW_BOX
}

/** 'fal fa-trash-can' -> 'trash-can'. Deja intacto lo que no sea FontAwesome. */
function stripFa (name) {
  return FA_RE.test(name) === true
    ? name.replace(FA_RE, '')
    : name
}

/**
 * Devuelve el icono para `name`, que puede ser un rol (`delete`), el nombre
 * del dibujo (`trash-can`) o un nombre de FontAwesome (`fal fa-trash-can`).
 */
export function resolveIcon (name) {
  if (typeof name !== 'string' || name.length === 0) return ''

  // Ya es un path, o es de otro set: no hay nada que resolver.
  if (SVG_PATH_RE.test(name) === true || FOREIGN_RE.test(name) === true) return name

  const bare = stripFa(name)
  const role = paths[ bare ] !== void 0
    ? bare
    : aliases[ bare ]

  if (role === void 0) {
    // Un nombre de FontAwesome que no esta en el mapa no se puede dejar pasar:
    // el consumidor ya no tiene la fuente cargada y no se dibujaria nada. Un
    // nombre pelado desconocido viene del backend y como ligadura de Material
    // Icons se veria como texto crudo. Los dos van al fallback.
    if (name !== bare || bare.includes(' ') === false) return resolveIcon(FALLBACK)
    // Queda el caso de una clase de un set que el proyecto cargo por su
    // cuenta: eso se deja pasar tal cual.
    return name
  }

  const custom = overrides[ role ]
  if (custom !== void 0) return custom

  let out = cache.get(role)
  if (out === void 0) {
    out = compose(role)
    cache.set(role, out)
  }
  return out
}

/** Alias corto: es lo que se usa dentro de los componentes. */
export const ic = resolveIcon

/**
 * Reemplaza los iconos de los roles que se le pasen. Se llama una vez, en un
 * boot file, antes de montar la app.
 */
export function setXIcons (map) {
  Object.assign(overrides, map)
}

/** Deja los roles indicados en su default (sin argumentos, limpia todos). */
export function resetXIcons (roles) {
  const target = roles === void 0 ? Object.keys(overrides) : roles
  target.forEach(role => { delete overrides[ role ] })
}

/** Los roles disponibles, util para el playground y para tests. */
export function xIconRoles () {
  return Object.keys(paths)
}

export { paths, aliases }
