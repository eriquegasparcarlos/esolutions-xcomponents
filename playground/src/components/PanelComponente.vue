<script setup>
// Nivel 2 del generador: edita las variables de UN componente y de cada una de
// sus variantes por separado. El catalogo se genera solo (pnpm catalog), asi
// que un componente o variable nueva aparece aca sin tocar este archivo.
import { ref, computed, onMounted } from 'vue'
import { CATALOGO, COMPONENTES, varsDe } from '../composables/useTheme.js'
import { useFoco } from '../composables/useFoco.js'

const props = defineProps({ getVar: Function, setVar: Function })
const { enfocar } = useFoco()

const comp = ref(COMPONENTES[0])
const selector = ref(CATALOGO[COMPONENTES[0]].selector)

// Al entrar a esta pestaña la galeria se reduce al componente elegido.
onMounted(() => enfocar(comp.value))

const selectores = computed(() => {
  const c = CATALOGO[comp.value]
  return [c.selector, ...c.variantes]
})

function cambiarComp (n) {
  comp.value = n
  selector.value = CATALOGO[n].selector
  enfocar(n) // la galeria muestra solo este componente
}

const vars = computed(() => varsDe(comp.value, selector.value))
const derivadas = computed(() =>
  Object.entries(CATALOGO[comp.value].vars).filter(([, m]) => m.control === 'derivado'),
)
</script>

<template>
  <div class="pg-group">
    <label>Componente</label>
    <select class="pg-select" :value="comp" @change="cambiarComp($event.target.value)">
      <option v-for="c in COMPONENTES" :key="c" :value="c">
        {{ c }} ({{ Object.keys(CATALOGO[c].vars).length }})
      </option>
    </select>
  </div>

  <div v-if="selectores.length > 1" class="pg-group">
    <label>Variante</label>
    <div class="pg-chips">
      <button v-for="s in selectores" :key="s" class="pg-chip"
              :class="{ on: selector === s }" @click="selector = s">
        {{ s === CATALOGO[comp].selector ? 'base' : s.replace(CATALOGO[comp].selector + '-', '') }}
      </button>
    </div>
  </div>

  <div class="pg-group">
    <label>{{ selector }} · {{ vars.length }} variables</label>

    <div v-for="v in vars" :key="v.key" class="pg-row" :title="v.key">
      <span>{{ v.label }}</span>

      <input v-if="v.control === 'color'" type="color"
             :value="getVar(selector, v.key, v.def)"
             @input="setVar(selector, v.key, $event.target.value)" />

      <template v-else-if="v.control === 'px' || v.control === 'ms' || v.control === 'number'">
        <input type="range" :min="v.min ?? 0" :max="v.max ?? 100"
               :value="getVar(selector, v.key, v.def)"
               @input="setVar(selector, v.key, Number($event.target.value))" />
        <output>{{ getVar(selector, v.key, v.def) }}{{ v.control === 'px' ? 'px' : v.control === 'ms' ? 'ms' : '' }}</output>
      </template>

      <input v-else class="pg-text" type="text"
             :value="getVar(selector, v.key, v.def)"
             @change="setVar(selector, v.key, $event.target.value)" />
    </div>

    <p v-if="!vars.length" class="pg-nota">
      Este componente no expone variables <code>--x-*</code> propias: su aspecto
      sale de los <strong>tokens globales</strong> y de los componentes que usa
      por dentro. Ajustalo desde la pestaña <strong>Global</strong>.
    </p>
  </div>

  <div v-if="derivadas.length" class="pg-group">
    <label>Derivadas de tokens ({{ derivadas.length }})</label>
    <p class="pg-nota">
      Estas siguen al nivel global — cambialas desde la pestaña <strong>Global</strong>:
      <code v-for="[k] in derivadas" :key="k">{{ k.replace('--x-', '') }}</code>
    </p>
  </div>
</template>
