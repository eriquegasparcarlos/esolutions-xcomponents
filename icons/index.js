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

// Familia con la que se intenta dibujar un nombre pelado que no tiene rol. Los
// proyectos cargan FontAwesome Pro self-hosted para sus iconos de dominio, y el
// backend manda esos nombres sin prefijo (`user-hoodie`, `money-bill`) desde que
// esolutions/datatable v2.2.0 dejo de prefijar. Devolverlos como clase FA hace
// que el proyecto los dibuje, igual que antes de que existiera este modulo.
const UNKNOWN_FAMILY = 'fa-light fa-'

// Se dibuja solo si ni siquiera eso aplica. Ver `unknownAs` en configureXIcons.
const FALLBACK = 'help'

// Que hacer con un nombre pelado sin rol: 'fontawesome' (default) lo entrega
// como clase FA; 'fallback' dibuja el icono generico.
let unknownAs = 'fontawesome'

// Que hacer con una clase de FontAwesome explicita (`fa-light fa-trash`):
// 'passthrough' (default) la respeta; 'resolve' la traduce al rol equivalente
// cuando existe. Ver configureXIcons.
let faClasses = 'passthrough'

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

  // Una clase de FontAwesome escrita con su familia (`fa-light fa-trash`) es una
  // instruccion explicita: se respeta. Traducirla al rol equivalente mezclaba
  // dos estilos en la misma pantalla —los 44 nombres que el paquete conoce se
  // dibujaban con Lucide y el resto con FontAwesome—, y obligaba a mirar la
  // tabla de alias para saber cual de los dos ibas a ver.
  if (faClasses === 'passthrough' && FA_RE.test(name) === true) return name

  const bare = stripFa(name)
  const role = paths[ bare ] !== void 0
    ? bare
    : aliases[ bare ]

  if (role === void 0) {
    // Los roles cubren el vocabulario de UI del paquete; los proyectos tienen
    // ademas sus iconos de dominio (`user-hoodie`, `money-bill`) y los dibujan
    // con su propio FontAwesome self-hosted. `unknownAs` decide si se confia en
    // eso o si el proyecto no tiene FontAwesome y conviene el icono generico.

    // Traia la familia escrita (solo se llega aca en modo 'resolve').
    if (name !== bare) {
      return unknownAs === 'fontawesome' ? name : resolveIcon(FALLBACK)
    }

    // Una clase de otro set que el proyecto cargo por su cuenta.
    if (name.includes(' ') === true) return name

    // Nombre pelado, el que manda el backend desde esolutions/datatable v2.2.0.
    // Tal cual no puede volver: Quasar lo tomaria como ligadura de Material
    // Icons y dibujaria el texto crudo.
    return unknownAs === 'fontawesome'
      ? UNKNOWN_FAMILY + bare
      : resolveIcon(FALLBACK)
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

/**
 * Opciones del resolvedor.
 *
 * `faClasses`: que hacer con una clase de FontAwesome explicita
 * (`fa-light fa-trash`). `'passthrough'` (default) la respeta tal cual.
 * `'resolve'` la traduce al rol equivalente cuando existe: para proyectos que NO
 * cargan FontAwesome y todavia tienen nombres viejos escritos en el codigo o
 * guardados en base.
 *
 * `unknownAs`: que hacer con un nombre pelado que no tiene rol —el caso de los
 * iconos de dominio que manda el backend—. `'fontawesome'` (default) lo entrega
 * como `fa-light fa-<nombre>`, para que lo dibuje el FontAwesome del proyecto.
 * `'fallback'` dibuja el icono generico: usarlo solo en proyectos que NO cargan
 * FontAwesome, donde la clase quedaria invisible.
 *
 * Un proyecto sin FontAwesome quiere las dos juntas:
 *
 *   configureXIcons({ faClasses: 'resolve', unknownAs: 'fallback' })
 */
export function configureXIcons (opts) {
  if (opts.unknownAs !== void 0) unknownAs = opts.unknownAs
  if (opts.faClasses !== void 0) faClasses = opts.faClasses
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
