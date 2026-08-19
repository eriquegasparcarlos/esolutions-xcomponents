/**
 * Alias: nombre del dibujo -> rol.
 *
 * La API publica del paquete son los ROLES (`delete`, `save`, `close`): dicen
 * la intencion, no el dibujo. Asi, el dia que el icono de borrar deje de ser
 * un tacho, se cambia una linea de paths.js y cambian los 25 componentes y
 * todos los proyectos consumidores.
 *
 * Este mapa existe para que los nombres viejos —los de FontAwesome, que estan
 * escritos en el codigo de los proyectos y guardados en base de datos— sigan
 * resolviendo. `resolveIcon()` primero le quita el prefijo de familia FA
 * (`fal `, `fa-light `, ...) y despues busca aca, de modo que `fal fa-trash-can`
 * y `trash-can` llegan los dos a `delete`.
 */
export const aliases = {
  // acciones
  'plus': 'add',
  'minus': 'decrease',
  'pencil': 'edit',
  'pen': 'edit',
  'trash': 'delete',
  'trash-can': 'delete',
  'floppy-disk': 'save',
  'eye': 'view',
  'eye-slash': 'hide',
  'rotate-right': 'refresh',
  'arrows-rotate': 'refresh',
  'paper-plane': 'send',
  'paperclip': 'attach',
  'magnifying-glass': 'search',

  // navegacion / UI
  'xmark': 'close',
  'chevron-down': 'expand',
  'chevron-left': 'prev',
  'chevron-right': 'next',
  'arrow-right': 'forward',
  'ellipsis-vertical': 'menu',
  'grip-dots-vertical': 'drag',
  'grip-vertical': 'drag',
  'gear': 'settings',
  'arrow-right-from-bracket': 'logout',

  // estados / feedback
  'check': 'success',
  'triangle-exclamation': 'warning',
  'circle-info': 'info',
  'circle-question': 'help',
  'circle-exclamation': 'danger',
  'ban': 'blocked',
  'inbox': 'empty',
  'lightbulb': 'tip',
  'bell': 'notification',

  // seguridad (los manda esolutions/datatable)
  'shield-check': 'activate',
  'shield-xmark': 'deactivate',

  // tablas / datos
  'columns-3': 'columns',
  'grid-2': 'grid',
  'filter-slash': 'filter-clear',
  'arrow-up': 'sort-asc',
  'arrow-down': 'sort-desc',
  'chart-line': 'chart',

  // formularios / contenido
  'eye-dropper': 'color-picker',
  'circle-check': 'radio-on',
  'circle': 'radio-off'
}
