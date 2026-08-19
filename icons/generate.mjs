import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const LUCIDE = process.env.LUCIDE_ICONS || 'F:/laragon/www/pdfme/node_modules/lucide/dist/esm/icons'
const roles = JSON.parse(readFileSync(new URL('./roles.json', import.meta.url), 'utf8'))

const n = v => {
  const f = parseFloat(v)
  return Number.isInteger(f) ? String(f) : String(+f.toFixed(3))
}

// Quasar solo emite <path>, asi que todo shape se convierte a "d".
const toPath = ([tag, a]) => {
  switch (tag) {
    case 'path':
      return a.d
    case 'circle': {
      const [cx, cy, r] = [+a.cx, +a.cy, +a.r]
      return `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0`
    }
    case 'ellipse': {
      const [cx, cy, rx, ry] = [+a.cx, +a.cy, +a.rx, +a.ry]
      return `M${n(cx - rx)} ${n(cy)}a${n(rx)} ${n(ry)} 0 1 0 ${n(2 * rx)} 0a${n(rx)} ${n(ry)} 0 1 0 ${n(-2 * rx)} 0`
    }
    case 'line':
      return `M${n(a.x1)} ${n(a.y1)}L${n(a.x2)} ${n(a.y2)}`
    case 'rect': {
      const [x, y, w, h] = [+a.x, +a.y, +a.width, +a.height]
      const rx = +(a.rx ?? 0), ry = +(a.ry ?? a.rx ?? 0)
      if (!rx && !ry) return `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}Z`
      return `M${n(x + rx)} ${n(y)}h${n(w - 2 * rx)}a${n(rx)} ${n(ry)} 0 0 1 ${n(rx)} ${n(ry)}` +
             `v${n(h - 2 * ry)}a${n(rx)} ${n(ry)} 0 0 1 ${n(-rx)} ${n(ry)}` +
             `h${n(-(w - 2 * rx))}a${n(rx)} ${n(ry)} 0 0 1 ${n(-rx)} ${n(-ry)}` +
             `v${n(-(h - 2 * ry))}a${n(rx)} ${n(ry)} 0 0 1 ${n(rx)} ${n(-ry)}Z`
    }
    case 'polyline':
    case 'polygon': {
      // `points` viene indistintamente como "1,2 3,4" o como "1 2 3 4": lo que
      // vale es la secuencia de numeros, tomados de a pares.
      const nums = a.points.match(/-?\d*\.?\d+/g).map(Number)
      const pairs = []
      for (let i = 0; i < nums.length; i += 2) pairs.push(`${ n(nums[ i ]) } ${ n(nums[ i + 1 ]) }`)
      const d = 'M' + pairs.join('L')
      return tag === 'polygon' ? d + 'Z' : d
    }
    default:
      throw new Error(`shape sin conversion: ${tag}`)
  }
}

const out = {}
const tags = new Set()
for (const [role, icon] of Object.entries(roles)) {
  const mod = await import(pathToFileURL(`${LUCIDE}/${icon}.mjs`).href)
  const shapes = mod.default
  shapes.forEach(([t]) => tags.add(t))
  out[role] = shapes.map(toPath)
}

console.error('shapes encontrados:', [...tags].join(', '))
console.error('roles generados:', Object.keys(out).length)

const header = `/**
 * Paths SVG de los iconos por defecto. GENERADO — no editar a mano.
 *
 * Fuente: Lucide v1.32.0 (licencia ISC, uso comercial libre sin atribucion
 * en el producto). Se eligio Lucide porque su trazo fino es el equivalente
 * visual de \`fa-light\`, que era el 43 de los 50 usos que tenia el paquete.
 *
 * Cada entrada es la lista de paths del icono, en viewBox 24x24. El string
 * que consume QIcon lo arma \`resolveIcon()\` en index.js: guardar aca solo la
 * geometria deja el estilo de trazo en un unico lugar.
 *
 * Regenerar:  node icons/generate.mjs > icons/paths.js
 */
export const paths = {
`

const body = Object.entries(out)
  .map(([ role, list ]) => `  '${ role }': [${ list.map(d => `'${ d }'`).join(', ') }]`)
  .join(',\n')

process.stdout.write(header + body + '\n}\n')
