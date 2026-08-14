<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useTheme, TOKENS } from './composables/useTheme.js'
import { scenario } from './mock/api.js'
import GalleryForms from './sections/GalleryForms.vue'
import GalleryFeedback from './sections/GalleryFeedback.vue'
import GalleryData from './sections/GalleryData.vue'

const $q = useQuasar()
const { valores, reset, scss, modificados } = useTheme()

const grupos = computed(() => [...new Set(TOKENS.map((t) => t.group))])
const porGrupo = (g) => TOKENS.filter((t) => t.group === g)

const verScss = ref(false)
const escenarios = ['ok', 'empty', 'error', 'slow', 'huge']
const escenarioActivo = ref('ok')
function setEscenario (s) {
  escenarioActivo.value = s
  scenario.set(s)
  recargaTabla.value++
}
const recargaTabla = ref(0)

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

      <div v-for="g in grupos" :key="g" class="pg-group">
        <label>{{ g }}</label>
        <div v-for="t in porGrupo(g)" :key="t.key" class="pg-row" :title="t.hint || t.key">
          <span>{{ t.label }}</span>
          <template v-if="t.type === 'color'">
            <input type="color" v-model="valores[t.key]" />
          </template>
          <template v-else>
            <input type="range" :min="t.min" :max="t.max" v-model.number="valores[t.key]" />
            <output>{{ valores[t.key] }}{{ t.type === 'ms' ? 'ms' : 'px' }}</output>
          </template>
        </div>
      </div>

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
        <label>Tema ({{ modificados().length }} tokens cambiados)</label>
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
        Todo lo de abajo reacciona a los tokens del panel, en runtime y sin recompilar.
        Los componentes con backend usan un mock que implementa el contrato real.
      </p>

      <section v-if="verScss" class="pg-section">
        <h3>SCSS generado <code>para el app.scss del consumidor</code></h3>
        <pre class="pg-output">{{ scss() }}</pre>
      </section>

      <GalleryForms />
      <GalleryFeedback />
      <GalleryData :key="recargaTabla" />
    </main>
  </div>
</template>
