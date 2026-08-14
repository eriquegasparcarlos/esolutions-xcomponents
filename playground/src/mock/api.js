// ==========================================================================
// Mock del contrato backend (el que implementa Laravel en los consumidores)
//
// POR QUE UN MOCK Y NO UN JSON NI UNA API REAL
// --------------------------------------------
// - JSON estatico: pintaria la tabla pero MUERTA — no ejerce paginacion,
//   filtrado ni orden, que es justo lo que hay que ver funcionando.
// - API real: exigiria Laravel corriendo + auth + datos, y el playground
//   dejaria de ser standalone y reproducible.
//
// Este mock calcula paginacion/filtro/orden en JS, asi que los componentes se
// comportan igual que contra el backend. Ademas deja provocar estados que con
// un backend real cuestan: error 500, tabla vacia, respuesta lenta, 10k filas.
//
// COMO SE INYECTA (la inyeccion ya existia en el paquete, no hubo que forzarla)
// ---------------------------------------------------------------------------
//   app.config.globalProperties.$api = createMockApi()   // lo usan 8 componentes
//   useXcTable(resource, onLoaded, createMockApi())      // lo recibe por parametro
//
// CONTRATO (leido del codigo de XTableServer, no inventado)
// --------------------------------------------------------
//   GET  {resource}/init-data-table -> response.data = {
//          pageTitle, tableTitle, tableSubtitle, tableBadge, tableName,
//          pagination: { perPage, sortBy, descending, pageSizes },
//          columns: [{ name, label, align, visible, sortable, locked, width }],
//          visibleColumns: [name], exportColumns: [], filters: []
//        }
//   POST {resource}/records -> response.data = {
//          data: [ {...row, actions: []} ],
//          meta: { total, per_page, sort_by, descending, unfiltered_total }
//        }
//   OJO: el request va en camelCase (rowsPerPage/sortBy) pero meta responde
//   en snake_case (per_page/sort_by). Asi es en produccion.
// ==========================================================================

import { COLUMNS, ROW_ACTIONS, makeRows } from './data.js'

/** Escenarios que el panel del playground puede forzar. */
export const scenario = {
  state: 'ok', // ok | empty | error | slow | huge
  set (s) { this.state = s },
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Aplica busqueda, filtros, orden y paginacion — lo que haria el backend. */
function query (rows, { search, filters, sortBy, descending, page, rowsPerPage }) {
  let out = rows

  if (search) {
    const q = String(search).toLowerCase()
    out = out.filter((r) => Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q)))
  }

  // OJO: XTableServer manda `filters` como ARRAY de definiciones
  // ([{ name, value, ... }]), no como objeto campo->valor. XcTable en cambio
  // manda un objeto. Se normalizan los dos.
  const pares = Array.isArray(filters)
    ? filters.map((f) => [f.name, f.value])
    : Object.entries(filters || {})

  for (const [field, value] of pares) {
    if (value === null || value === undefined || value === '' || value === 'all') continue
    out = out.filter((r) => String(r[field]) === String(value))
  }

  const total = out.length

  if (sortBy) {
    out = [...out].sort((a, b) => {
      const va = a[sortBy], vb = b[sortBy]
      const cmp = typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va ?? '').localeCompare(String(vb ?? ''), 'es', { numeric: true })
      return descending ? -cmp : cmp
    })
  }

  const per = rowsPerPage || total || 1
  const from = (Math.max(page || 1, 1) - 1) * per
  return { rows: out.slice(from, from + per), total }
}

export function createMockApi () {
  let big = null

  async function gate () {
    await sleep(scenario.state === 'slow' ? 2500 : 180) // latencia para ver loaders
    if (scenario.state === 'error') {
      const err = new Error('Mock: fallo del servidor (500)')
      err.response = { status: 500, data: { message: 'Error interno del servidor (simulado)' } }
      throw err
    }
  }

  const base = makeRows(120)
  function rowsFor () {
    if (scenario.state === 'empty') return []
    if (scenario.state === 'huge') {
      if (!big) big = makeRows(10000)
      return big
    }
    return base
  }

  return {
    async get (url) {
      await gate()
      if (url.endsWith('/init-data-table')) {
        return {
          data: {
            pageTitle: 'Playground',
            tableTitle: 'Comprobantes',
            tableSubtitle: 'Datos simulados — paginacion, filtros y orden reales',
            tableBadge: null,
            tableName: 'playground_demo',
            pagination: { perPage: 10, sortBy: 'fecha', descending: true, pageSizes: [5, 10, 20, 50] },
            columns: COLUMNS,
            visibleColumns: COLUMNS.filter((c) => c.visible !== false).map((c) => c.name),
            exportColumns: [],
            // OJO (parte del contrato): XTableServer pasa filter.options a un
            // XSelect SIN option-value/option-label, asi que se aplican los
            // defaults 'id'/'name'. Si el backend manda {label, value} el
            // filtro se ve con las opciones EN BLANCO y sin error en consola.
            filters: [
              {
                name: 'estado',
                label: 'Estado',
                type: 'select',
                includeAllOption: true,
                filterLocal: true,
                options: [
                  { id: 'Aceptado', name: 'Aceptado' },
                  { id: 'Pendiente', name: 'Pendiente' },
                  { id: 'Rechazado', name: 'Rechazado' },
                ],
              },
            ],
          },
        }
      }
      return { data: { data: [] } }
    },

    async post (url, body = {}) {
      await gate()

      if (url.endsWith('/records')) {
        const all = rowsFor()
        const { rows, total } = query(all, {
          search: body.search,
          filters: body.filters,
          sortBy: body.sortBy,
          descending: body.descending,
          page: body.page,
          rowsPerPage: body.rowsPerPage,
        })
        return {
          data: {
            data: rows.map((r) => ({ ...r, actions: ROW_ACTIONS })),
            meta: {
              total,
              per_page: body.rowsPerPage ?? 10,
              sort_by: body.sortBy ?? 'fecha',
              descending: body.descending ?? true,
              unfiltered_total: all.length,
            },
          },
        }
      }

      if (url.endsWith('/export')) return { data: { url: '#', message: 'Exportacion simulada' } }
      if (url.endsWith('/update-visible-columns')) return { data: true }
      return { data: { data: null } }
    },
  }
}
