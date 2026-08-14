import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import { fileURLToPath, URL } from 'node:url'

const r = (p) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({
      // Mismo mecanismo que en un proyecto Quasar CLI: este archivo se inyecta
      // como prefijo de cada .scss (incluidos los de los componentes), que es
      // lo que hace existir $primary y compania.
      sassVariables: r('./src/css/quasar.variables.scss'),
    }),
  ],
  resolve: {
    alias: {
      // Los componentes viven en el repo padre. El alias evita ../../ por todos lados.
      '@x': r('..'),
      // XTableServer importa 'stores/data.js' asumiendo el alias del CONSUMIDOR.
      // Es un acoplamiento del paquete: aca lo satisfacemos con un stub.
      stores: r('./src/stores'),
      src: r('./src'),

      // Los .vue del paquete viven en el repo padre, que NO tiene node_modules:
      // sus imports (incluido el 'quasar/src/components/...' que genera el
      // auto-import de Quasar) tienen que resolver contra los del playground.
      quasar: r('./node_modules/quasar'),
      vue: r('./node_modules/vue'),
      pinia: r('./node_modules/pinia'),
      'vue-i18n': r('./node_modules/vue-i18n'),
      'vue-router': r('./node_modules/vue-router'),
      'vue-draggable-plus': r('./node_modules/vue-draggable-plus'),
      '@esolutions/js-utils': r('./node_modules/@esolutions/js-utils'),
      // Peers OPCIONALES: sin alias, pnpm las resuelve desde el paquete padre
      // como un stub vacio ("__vite-optional-peer-dep") y el build falla con
      // "X is not exported by ...".
      '@embedpdf/vue-pdf-viewer': r('./node_modules/@embedpdf/vue-pdf-viewer'),
      'pdfjs-dist': r('./node_modules/pdfjs-dist'),
    },
  },
  optimizeDeps: {
    // En DEV, Vite pre-resuelve el import del paquete padre y le gana al alias,
    // devolviendo el stub de peer opcional de pnpm ("does not provide an export
    // named PDFViewer"). Excluirlas fuerza a que pasen por resolve.alias.
    exclude: ['@embedpdf/vue-pdf-viewer', 'pdfjs-dist'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Los .scss del paquete viven en el repo PADRE, que no tiene
        // node_modules. Sin esto, el prefijo que inyecta Quasar
        // (@import 'quasar/src/css/variables.sass') no resuelve al compilarlos.
        loadPaths: [r('./node_modules')],
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
      },
    },
  },
  server: { fs: { allow: [r('..')] } }, // permitir servir archivos del repo padre
})
