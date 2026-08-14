import { defineStore } from 'pinia'

// Stub del store que XTableServer importa como 'stores/data.js'.
//
// Es un acoplamiento del paquete al consumidor: XTableServer asume que el
// proyecto define ese alias y expone un store con (al menos) `appName`.
// Hoy solo usa esa propiedad — candidato claro a convertirse en prop con
// default, y asi eliminar la dependencia.
export const useDataStore = defineStore('data', {
  state: () => ({
    appName: 'x-components playground',
  }),
})
