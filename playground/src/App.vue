<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useTheme, TOKENS } from './composables/useTheme.js'
import { scenario } from './mock/api.js'
import PanelComponente from './components/PanelComponente.vue'
import GalleryForms from './sections/GalleryForms.vue'
import GalleryFeedback from './sections/GalleryFeedback.vue'
import GalleryOverlays from './sections/GalleryOverlays.vue'
import GalleryMisc from './sections/GalleryMisc.vue'
import GalleryData from './sections/GalleryData.vue'

const $q = useQuasar()
const { global, setVar, getVar, reset, scss, totalCambios } = useTheme()

const nivel = ref('global') // global | componente
const grupos = computed(() => [...new Set(TOKENS.map((t) => t.group))])
const porGrupo = (g) => TOKENS.filter((t) => t.group === g)

const verScss = ref(false)
const escenarios = ['ok', 'empty', 'error', 'slow', 'huge']
const escenarioActivo = ref('ok')
const recargaTabla = ref(0)
function setEscenario (s) {
  escenarioActivo.value = s
  scenario.set(s)
  recargaTabla.value++
}

const dark = ref(false)
function toggleDark () {
  dark.value = !dark.value
  $q.dark.set(dark.value)
}

async function copiar () {
  try {
    await navigator.clipboard.writeText(scss())
    $q.notify({ message: 'SCSS copiado', color: 'positive', icon: 'check' })
  } catch {
    $q.notify({ message: 'No se pudo copiar', color: 'negative' })
  }
}
</script>

<template>
  <div class="pg-shell">
    <!-- ============ Panel de control ============ -->
    <aside class="pg-panel">
      <h1>x-components</h1>
      <div class="pg-sub">Galeria + generador de temas</div>

      <div class="pg-tabs">
        <button class="pg-tab" :class="{ on: nivel === 'global' }" @click="nivel = 'global'">Global</button>
        <button class="pg-tab" :class="{ on: nivel === 'componente' }" @click="nivel = 'componente'">Por componente</button>
      </div>

      <!-- Nivel 1: tokens raiz -->
      <template v-if="nivel === 'global'">
        <div v-for="g in grupos" :key="g" class="pg-group">
          <label>{{ g }}</label>
          <div v-for="t in porGrupo(g)" :key="t.key" class="pg-row" :title="t.hint || t.key">
            <span>{{ t.label }}</span>
            <input v-if="t.control === 'color'" type="color" v-model="global[t.key]" />
            <template v-else>
              <input type="range" :min="t.min" :max="t.max" v-model.number="global[t.key]" />
              <output>{{ global[t.key] }}{{ t.control === 'ms' ? 'ms' : 'px' }}</output>
            </template>
          </div>
        </div>
      </template>

      <!-- Nivel 2: por componente y variante -->
      <PanelComponente v-else :get-var="getVar" :set-var="setVar" />

      <div class="pg-group">
        <label>Escenario del backend simulado</label>
        <div class="pg-chips">
          <button v-for="s in escenarios" :key="s" class="pg-chip"
                  :class="{ on: escenarioActivo === s }" @click="setEscenario(s)">{{ s }}</button>
        </div>
      </div>

      <div class="pg-group">
        <label>Vista</label>
        <button class="pg-btn" @click="toggleDark">{{ dark ? 'Modo claro' : 'Modo oscuro' }}</button>
      </div>

      <div class="pg-group">
        <label>Tema ({{ totalCambios }} cambios)</label>
        <button class="pg-btn primary" style="margin-bottom:6px" @click="verScss = !verScss">
          {{ verScss ? 'Ocultar SCSS' : 'Generar SCSS' }}
        </button>
        <button class="pg-btn" style="margin-bottom:6px" @click="copiar">Copiar al portapapeles</button>
        <button class="pg-btn" @click="reset">Restaurar defaults</button>
      </div>
    </aside>

    <!-- ============ Galeria ============ -->
    <main class="pg-main">
      <h2>Galeria de componentes</h2>
      <p class="lead">
        Todo reacciona a los controles del panel, en runtime y sin recompilar.
        <strong>Global</strong> cambia los tokens que comparten todos;
        <strong>Por componente</strong> ajusta uno solo, variante por variante.
      </p>

      <section v-if="verScss" class="pg-section">
        <h3>SCSS generado <code>para el app.scss del consumidor</code></h3>
        <pre class="pg-output">{{ scss() }}</pre>
      </section>

      <GalleryForms />
      <GalleryFeedback />
      <GalleryOverlays />
      <GalleryMisc />
      <GalleryData :key="recargaTabla" />
    </main>
  </div>
</template>
