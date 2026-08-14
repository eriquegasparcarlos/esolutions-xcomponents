import { ref, computed } from 'vue'

// ==========================================================================
// Foco de la galeria.
//
// Al elegir un componente en el panel "Por componente", la galeria muestra
// SOLO las secciones que lo contienen: se trabaja sobre lo que se esta
// editando, sin scrollear entre 15 secciones.
//
// Cada seccion declara que componentes cubre (prop `cubre`) y se oculta sola
// cuando hay un foco activo que no la incluye.
//
// Estado a nivel de modulo (no dentro de useFoco): el panel y las secciones
// son ramas distintas del arbol y tienen que compartir el mismo foco.
// ==========================================================================

const foco = ref(null) // null = mostrar todo

export function useFoco () {
  const activo = computed(() => foco.value)

  function enfocar (comp) { foco.value = comp }
  function limpiar () { foco.value = null }

  /** Decide si una seccion que cubre estos componentes debe verse. */
  function visible (cubre) {
    if (!foco.value) return true
    return (cubre || []).includes(foco.value)
  }

  return { foco, activo, enfocar, limpiar, visible }
}
