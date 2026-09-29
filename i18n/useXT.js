import { getCurrentInstance } from 'vue'

/**
 * Traducción con respaldo, para los componentes que no pueden dar por hecho que la app
 * cargó los mensajes del paquete (`xComponentsMessages`).
 *
 * Varias apps consumidoras tienen su PROPIA copia de las claves y no importan las del
 * paquete: con `$t` a secas, una clave nueva se pintaría cruda en pantalla ("components.
 * callout.note"). Acá se usa la traducción si la app la tiene y, si no, el texto de
 * respaldo en español — que es el idioma por defecto del paquete.
 *
 * Tampoco revienta si la app no instaló vue-i18n.
 *
 *   const xt = useXT()
 *   xt('components.callout.note', 'Nota')
 */
export function useXT () {
  const proxy = getCurrentInstance()?.proxy

  return (key, fallback) => {
    try {
      if (proxy?.$te?.(key)) return proxy.$t(key)
    } catch {
      // Sin vue-i18n o con una configuración que no expone $te: vale el respaldo.
    }

    return fallback
  }
}

export default useXT
