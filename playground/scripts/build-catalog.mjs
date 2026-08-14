// ==========================================================================
// Genera src/catalog.generated.json leyendo los .scss/.vue del paquete.
//
// El catalogo NO se escribe a mano: si se agrega un componente o una variable
// --x-*, basta con volver a correr `pnpm catalog` y el panel la ofrece sola.
//
//   node scripts/build-catalog.mjs
// ==========================================================================
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const OUT = fileURLToPath(new URL('../src/catalog.generated.json', import.meta.url))

const SKIP = new Set(['playground', 'node_modules', '.git', 'themes', 'i18n', '.claude'])

// --------------------------------------------------------------------------
// Mapa de variables Sass ($x-badge-padding -> '4px 8px').
// Sin esto, el 58% de las variables quedaban como texto plano: en los .scss
// casi todas se declaran como interpolacion `#{$x-...}`, no con el literal.
// --------------------------------------------------------------------------
const SASS = {}
for (const f of ['_variables.scss', '_defaults.scss']) {
  const p = path.join(ROOT, f)
  if (!fs.existsSync(p)) continue
  for (const m of fs.readFileSync(p, 'utf8').matchAll(/^\$([a-z0-9-]+)\s*:\s*([^;]+?)(?:\s*!default)?;/gm)) {
    SASS[m[1]] = m[2].trim()
  }
}

/** Resuelve `#{$var}` y `$var` contra el mapa, siguiendo alias encadenados. */
function resolver (valor, saltos = 0) {
  if (saltos > 6) return valor
  const solo = valor.trim().match(/^#\{\$([a-z0-9-]+)\}$/) || valor.trim().match(/^\$([a-z0-9-]+)$/)
  if (solo && SASS[solo[1]] !== undefined) return resolver(SASS[solo[1]], saltos + 1)
  // Interpolaciones dentro de un valor compuesto (p.ej. "#{$a} #{$b}")
  const expandido = valor.replace(/#\{\$([a-z0-9-]+)\}/g, (m, n) => (SASS[n] !== undefined ? SASS[n] : m))
  return expandido !== valor ? resolver(expandido, saltos + 1) : valor
}

/** Infiere el tipo de control a partir del valor por defecto. */
function inferir (valorCrudo) {
  // var(--x-token, fallback) -> deriva de un token global; se edita en Global
  if (/^var\(/.test(valorCrudo.trim())) return { control: 'derivado', def: valorCrudo.trim() }

  const v = resolver(valorCrudo).trim()
  if (/^#[0-9a-f]{3,8}$/i.test(v)) return { control: 'color', def: v }
  if (/^rgba?\(/i.test(v)) return { control: 'color-rgba', def: v }
  if (/^-?\d+(\.\d+)?px$/.test(v)) return { control: 'px', def: parseFloat(v) }
  if (/^-?\d+(\.\d+)?s$/.test(v)) return { control: 'ms', def: parseFloat(v) * 1000 }
  if (/^-?\d+(\.\d+)?$/.test(v)) return { control: 'number', def: parseFloat(v) }
  return { control: 'texto', def: v }
}

const componentes = {}

for (const dir of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!dir.isDirectory() || SKIP.has(dir.name) || dir.name.startsWith('.')) continue

  const archivos = fs.readdirSync(path.join(ROOT, dir.name)).filter((f) => /\.(scss|vue)$/.test(f))
  const vars = {}
  const variantes = new Set()
  const conteoPorSelector = {} // cuantas variables declara cada selector

  for (const f of archivos) {
    const txt = fs.readFileSync(path.join(ROOT, dir.name, f), 'utf8')

    // Bloques de nivel raiz `.x-algo { ... }`, con las llaves BALANCEADAS.
    // Un regex tipo `\{([^}]*)\}` no sirve: para en la primera llave interna,
    // asi que un bloque con reglas anidadas (.x-toggle { .q-toggle { … } })
    // quedaba truncado y aparentaba declarar menos variables que sus propias
    // variantes planas (.x-toggle-sm).
    for (const inicio of [...txt.matchAll(/^\.(x-[a-z0-9-]+)\s*\{/gm)]) {
      const selector = '.' + inicio[1]
      let i = inicio.index + inicio[0].length
      let nivel = 1
      const desde = i
      while (i < txt.length && nivel > 0) {
        if (txt[i] === '{') nivel++
        else if (txt[i] === '}') nivel--
        i++
      }
      const cuerpo = txt.slice(desde, i - 1)

      // Solo las declaraciones del PRIMER nivel del bloque: las anidadas
      // pertenecen a otro selector.
      const primerNivel = cuerpo.replace(/\{[^{}]*\}/g, '')
      const declaradas = [...primerNivel.matchAll(/(--x-[a-z0-9-]+)\s*:\s*([^;]+);/g)]
      if (!declaradas.length) continue

      variantes.add(selector)
      conteoPorSelector[selector] = (conteoPorSelector[selector] || 0) + declaradas.length

      for (const [, nombre, valor] of declaradas) {
        if (!vars[nombre]) vars[nombre] = inferir(valor)
      }
    }

    // Declaraciones dentro de media queries u otros contextos: solo para no
    // perder la variable del catalogo.
    for (const m of txt.matchAll(/^\s{2,}(--x-[a-z0-9-]+)\s*:\s*([^;]+);/gm)) {
      if (!vars[m[1]]) vars[m[1]] = inferir(m[2])
    }
  }

  if (!Object.keys(vars).length) continue

  // El selector base es DONDE SE DECLARAN las variables, es decir el que mas
  // declara — no la clase mas corta.
  //
  // La heuristica anterior ("la mas corta") fallaba en XInputOtp: elegia
  // `.x-input-otp` (el input hijo) cuando las variables viven en
  // `.x-input-otp-container`, asi que el generador escribia en el selector
  // equivocado y los cambios no se veian.
  const base = Object.entries(conteoPorSelector).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    '.' + dir.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

  componentes[dir.name] = {
    selector: base,
    variantes: [...variantes].filter((v) => v !== base).sort(),
    vars,
  }
}

const totalVars = Object.values(componentes).reduce((a, c) => a + Object.keys(c.vars).length, 0)
const editables = Object.values(componentes)
  .reduce((a, c) => a + Object.values(c.vars).filter((v) => v.control !== 'derivado').length, 0)

fs.writeFileSync(OUT, JSON.stringify(componentes, null, 2) + '\n')

console.log(`catalogo -> ${path.relative(process.cwd(), OUT)}`)
console.log(`  componentes: ${Object.keys(componentes).length}`)
console.log(`  variables:   ${totalVars} (${editables} editables, ${totalVars - editables} derivadas de tokens)`)
console.log(`  variantes:   ${Object.values(componentes).reduce((a, c) => a + c.variantes.length, 0)}`)
