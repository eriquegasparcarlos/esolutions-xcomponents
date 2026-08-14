<script setup>
import Seccion from '../components/Seccion.vue'
import { ref } from 'vue'
import XInputOtp from '@x/XInputOtp/XInputOtp.vue'

const base = ref('')
const err = ref('123')
const dis = ref('4567')
const porPreset = ref({})

// Presets del componente. Se combinan: un tamanio + un estilo.
const TAMANIOS = ['x-input-otp-sm', '(base)', 'x-input-otp-lg']
const ESTILOS = [
  { clase: 'x-input-otp-underline', desc: 'solo linea inferior' },
  { clase: 'x-input-otp-soft', desc: 'relleno, sin borde' },
  { clase: 'x-input-otp-pill', desc: 'circular' },
  { clase: 'x-input-otp-mono', desc: 'monoespaciado' },
]
const val = (k) => porPreset.value[k] ?? ''
const set = (k, v) => { porPreset.value = { ...porPreset.value, [k]: v } }
</script>

<template>
  <Seccion titulo="Codigo OTP · tamaños" nota=".x-input-otp-sm · base · .x-input-otp-lg"
           :cubre="['XInputOtp']">
    <div style="display:flex; flex-direction:column; gap:18px">
      <div v-for="t in TAMANIOS" :key="t">
        <div style="font-size:11px; color:#64748b; margin-bottom:6px">
          <code>{{ t }}</code>
        </div>
        <XInputOtp :model-value="val(t)" @update:model-value="v => set(t, v)"
                   :length="6" :class="t === '(base)' ? '' : t" />
      </div>
    </div>
  </Seccion>

  <Seccion titulo="Codigo OTP · estilos" nota="presets combinables con los de tamaño"
           :cubre="['XInputOtp']">
    <div style="display:flex; flex-direction:column; gap:18px">
      <div v-for="e in ESTILOS" :key="e.clase">
        <div style="font-size:11px; color:#64748b; margin-bottom:6px">
          <code>.{{ e.clase }}</code> — {{ e.desc }}
        </div>
        <XInputOtp :model-value="val(e.clase)" @update:model-value="v => set(e.clase, v)"
                   :length="6" :class="e.clase" />
      </div>
      <div>
        <div style="font-size:11px; color:#64748b; margin-bottom:6px">
          <code>.x-input-otp-lg .x-input-otp-soft .x-input-otp-mono</code> — combinados
        </div>
        <XInputOtp :model-value="val('combo')" @update:model-value="v => set('combo', v)"
                   :length="6" class="x-input-otp-lg x-input-otp-soft x-input-otp-mono" />
      </div>
    </div>
  </Seccion>

  <Seccion titulo="Codigo OTP · estados" nota="error · disabled · longitudes"
           :cubre="['XInputOtp']">
    <div style="display:flex; flex-direction:column; gap:18px">
      <div>
        <div style="font-size:11px; color:#64748b; margin-bottom:6px"><code>error</code></div>
        <XInputOtp v-model="err" :length="6" error />
      </div>
      <div>
        <div style="font-size:11px; color:#64748b; margin-bottom:6px"><code>disabled</code></div>
        <XInputOtp v-model="dis" :length="6" disabled />
      </div>
      <div>
        <div style="font-size:11px; color:#64748b; margin-bottom:6px"><code>length=4</code></div>
        <XInputOtp v-model="base" :length="4" />
      </div>
    </div>
  </Seccion>
</template>
