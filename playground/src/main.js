import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import { createI18n } from 'vue-i18n'
import { Quasar, Notify, Dialog, Loading } from 'quasar'
import quasarLangEs from 'quasar/lang/es'
import { setFormDefaults } from '@esolutions/js-utils'

import 'quasar/src/css/index.sass'
import '@quasar/extras/material-icons/material-icons.css'
// FontAwesome PRO: no es opcional para ver la libreria como es. 24 de los 29
// iconos que los componentes traen hardcodeados son `fa-light`, que solo existe
// en el plan Pro (XDialog cerrar, XSelect +, XFile, XTracking...).
//
// Se usa la copia VENDORIZADA del repo, no el paquete npm: asi ni el playground
// ni ningun consumidor necesitan el token en su ~/.npmrc, y deja de importar que
// la suscripcion venza en 2027. Valido porque este repo es privado — ver
// vendor/fontawesome-pro/README.md.
import '@x/vendor/fontawesome-pro/css/all.min.css'
import '@x/index.scss' // <- CSS de los componentes + el :root de tokens
import './css/app.scss'

import { messages } from '@x/i18n/index.js'
import { createMockApi } from './mock/api.js'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())

// XReportView usa useRouter(): sin una instancia de router montada, revienta.
// (El paquete no lo declaraba como peer dependency; se agrego como opcional.)
app.use(createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/:resto(.*)*', component: { render: () => null } }],
}))
app.use(createI18n({ legacy: false, locale: 'es', fallbackLocale: 'es', messages }))
app.use(Quasar, {
  plugins: { Notify, Dialog, Loading },
  lang: quasarLangEs, // sin esto, la paginacion de las tablas sale en ingles
  config: { notify: { position: 'top-right' } },
})

// 8 componentes del paquete leen la global $api del consumidor. El mock cumple
// el mismo contrato que Laravel, asi que se comportan igual que en produccion.
app.config.globalProperties.$api = createMockApi()

setFormDefaults({ dense: true, outlined: true })

app.mount('#app')
