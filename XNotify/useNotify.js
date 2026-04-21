import { useQuasar } from 'quasar'

/**
 * Composable para notificaciones con diseño x-toast (estilo Flowbite).
 *
 * Reemplaza el uso directo de $q.notify con métodos tipados que encapsulan
 * las clases CSS, iconos FA Pro y tiempos de cierre correctos.
 *
 * Uso:
 *   const notify = useNotify()
 *   notify.success('Guardado correctamente.')
 *   notify.error('Error al procesar.')
 *   notify.warning('Verifica los datos.')
 *   notify.info('Ten en cuenta que...')
 *
 * Opciones extra opcionales (segundo argumento):
 *   notify.success('Listo.', { timeout: 6000, caption: 'Detalle adicional' })
 */
export function useNotify() {
  const $q = useQuasar()

  const base = (classes, icon, timeout = 3000) => (message, opts = {}) => {
    $q.notify({
      message,
      icon,
      classes,
      position: 'top-right',
      timeout,
      ...opts,
    })
  }

  return {
    success: base('x-toast x-toast--success', 'fa-light fa-check',                3000),
    error:   base('x-toast x-toast--error',   'fa-light fa-xmark',                5000),
    warning: base('x-toast x-toast--warning', 'fa-light fa-triangle-exclamation', 4000),
    info:    base('x-toast x-toast--info',    'fa-light fa-circle-info',          3000),
  }
}
