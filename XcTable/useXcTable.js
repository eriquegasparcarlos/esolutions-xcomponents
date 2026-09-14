import { ref, reactive } from 'vue'


/**
 * Fuente de datos compartida del compound XTable (patrón headless).
 * Encapsula el mismo contrato del XTableServer: GET {resource}/init-data-table
 * (config: columnas + filtros + paginación) y POST {resource}/records (datos + meta).
 * Los bloques (XTableGrid, XTableFilters, XTableToolbar) consumen este estado por
 * provide/inject y lo posicionan libremente dentro del ReportView.
 *
 * @param {string} resource   ej. 'app-api/reports/kardex'
 * @param {(data:object)=>void} onLoaded  callback con la respuesta completa (data+meta)
 */
export function useXcTable (resource, onLoaded, http) {
  const loading = ref(false)
  const error = ref(null)
  const initialized = ref(false)

  const config = reactive({ tableName: '', pageTitle: '', tableTitle: '', tableSubtitle: '', noDataLabel: 'Sin datos' })
  const columns = ref([])          // mapeadas para q-table
  const columnOptions = ref([])    // crudas (value/label/exportable/onlyExport/locked) — para menú columnas y export
  const visibleColumns = ref([])   // nombres visibles
  const savedExportColumns = ref([]) // selección de export persistida por el backend
  // Formatos que ofrece el backend en el diálogo de exportar. Con uno solo el
  // selector no se dibuja, que es como se comportan las tablas de siempre.
  const exportFormats = ref(['xlsx'])
  const exporting = ref(false)     // loading del modal/botón de export
  const headerButtons = ref([])    // botones del header definidos por el backend (icon-only o icon+label)
  const filters = ref([])          // config de filtros (cada uno con su .value)
  const rows = ref([])
  const meta = ref(null)

  // Handler de acción de headerButton, inyectado por el provider (XcTable emite 'action').
  let actionCb = null
  function setActionHandler (fn) { actionCb = fn }

  // Igual que el anterior, pero para el archivo exportado en un formato que no
  // se descarga (p. ej. un PDF que la pagina quiere abrir en su visor).
  // Devuelve false si nadie escucha, para poder caer a la descarga.
  let exportFileCb = null
  function setExportFileHandler (fn) { exportFileCb = fn }
  function performExportFile (payload) {
    if (typeof exportFileCb !== 'function') return false
    exportFileCb(payload)
    return true
  }
  function performHeaderAction (button) {
    if (typeof actionCb === 'function') {
      actionCb({ action: button.action, url: button.url, button })
    }
  }

  const pagination = reactive({
    page: 1, rowsPerPage: 10, sortBy: null, descending: false,
    rowsNumber: 0, pageSizes: [10, 20, 50],
  })

  async function init () {
    loading.value = true
    error.value = null
    try {
      const { data } = await http.get(`${resource}/init-data-table`)
      config.tableName = data.tableName
      config.pageTitle = data.pageTitle
      config.tableTitle = data.tableTitle || ''
      config.tableSubtitle = data.tableSubtitle || ''
      if (data.noDataLabel) config.noDataLabel = data.noDataLabel
      exportFormats.value = Array.isArray(data.exportFormats) && data.exportFormats.length
        ? data.exportFormats
        : ['xlsx']

      pagination.rowsPerPage = data.pagination?.perPage ?? 10
      pagination.descending = !!data.pagination?.descending
      pagination.sortBy = data.pagination?.sortBy ?? null
      pagination.pageSizes = data.pagination?.pageSizes ?? [10, 20, 50]

      const visible = Array.isArray(data.visibleColumns) ? data.visibleColumns : []
      visibleColumns.value = visible
      savedExportColumns.value = Array.isArray(data.exportColumns) ? data.exportColumns : []
      columns.value = (data.columns || []).map((c) => ({
        name: c.name,
        label: c.label,
        field: c.name,
        align: c.align || 'left',
        sortable: !!c.sortable,
        locked: c.locked === true,
        format: (v) => (v == null ? '' : v),
      }))
      // Crudas para el menú de columnas y el diálogo de exportación (mismo shape que XTableServer).
      columnOptions.value = (data.columns || []).map((c) => ({
        value: c.name,
        label: c.label,
        locked: c.locked === true,
        exportable: c.exportable !== false,
        onlyExport: c.only_export === true,
      }))

      headerButtons.value = Array.isArray(data.headerButtons) ? data.headerButtons : []

      // Filtros: cada uno arrastra su valor actual (default). Mismo shape que envía records.
      filters.value = (data.filters || []).map((f) => ({
        ...f,
        type: f.type || 'select',
        value: f.value ?? f.default ?? (f.includeAllOption ? 'all' : null),
      }))

      // Los filtros que dependen de otro nacen vacios y deshabilitados: sus
      // opciones se piden cuando el padre tiene valor.
      for (const f of filters.value) {
        if (f.dependsOn) await loadDependentOptions(f)
      }

      initialized.value = true
      await fetch()
    } catch (err) {
      error.value = err?.message || 'Error al inicializar la tabla'
    } finally {
      loading.value = false
    }
  }

  async function fetch () {
    loading.value = true
    error.value = null
    try {
      const { data } = await http.post(`${resource}/records`, {
        tableName: config.tableName,
        page: pagination.page,
        rowsPerPage: pagination.rowsPerPage,
        sortBy: pagination.sortBy,
        descending: pagination.descending,
        filters: filters.value,
      })
      rows.value = data.data || []
      meta.value = data.meta || null
      pagination.rowsNumber = data.meta?.total ?? rows.value.length
      if (typeof onLoaded === 'function') onLoaded(data)
    } catch (err) {
      error.value = err?.message || 'Error al cargar los datos'
    } finally {
      loading.value = false
    }
  }

  // Cambia el valor de un filtro (por nombre) y re-consulta desde la página 1.
  function setFilter (name, value) {
    const f = filters.value.find((x) => x.name === name)
    if (!f) return
    f.value = value
    pagination.page = 1
    fetch()
  }

  function setPagination ({ page, rowsPerPage, sortBy, descending }) {
    if (page != null) pagination.page = page
    if (rowsPerPage != null) pagination.rowsPerPage = rowsPerPage
    if (sortBy !== undefined) pagination.sortBy = sortBy
    if (descending != null) pagination.descending = descending
    fetch()
  }

  function clearFilters () {
    filters.value.forEach((f) => { f.value = f.default ?? (f.includeAllOption ? 'all' : null) })
    pagination.page = 1
    fetch()
  }

  /**
   * Pide el archivo al backend y devuelve el binario sin tocarlo.
   *
   * Existe aparte de `exportData` porque no todo formato se descarga: el PDF se
   * abre en el visor, y descargarlo obligaria al usuario a salir de la pantalla
   * para ver lo que acaba de pedir.
   *
   * @param {string[]|null} exportColumns  selección del diálogo, en orden
   * @param {string} format                'xlsx' | 'pdf' | lo que declare el backend
   * @returns {Promise<{ok: boolean, blob: Blob|null, filename: string}>}
   */
  async function exportBlob (exportColumns = null, format = 'xlsx') {
    exporting.value = true
    try {
      const cols = (exportColumns && exportColumns.length) ? exportColumns : visibleColumns.value
      const res = await http.post(`${resource}/export`, {
        filters: filters.value,
        exportColumns: cols,
        visibleColumns: visibleColumns.value,
        sortBy: pagination.sortBy,
        descending: pagination.descending,
        format,
      }, { responseType: 'blob' })

      let filename = `${config.tableName || 'export'}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      const disposition = res.headers['content-disposition']
      if (disposition && disposition.includes('filename=')) {
        filename = disposition.split('filename=')[1].split(';')[0].replace(/['"]/g, '').trim()
      }

      return { ok: true, blob: new Blob([res.data]), filename }
    } catch (err) {
      error.value = err?.message || 'Error al exportar'
      return { ok: false, blob: null, filename: '' }
    } finally {
      exporting.value = false
    }
  }

  // Exporta y descarga. `exportColumns` = selección del diálogo (en orden); si viene
  // vacío, el backend usa las visibles. Mismo payload/flujo que el XTableServer.
  async function exportData (exportColumns = null, format = 'xlsx') {
    const { ok, blob, filename } = await exportBlob(exportColumns, format)
    if (!ok) return false

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.setAttribute('download', filename)
    a.click()
    URL.revokeObjectURL(url)

    return true
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Filtros que piden datos al servidor
  //
  // Dos casos distintos que el backend ya sabia describir y aqui no se leian:
  //
  //   searchUrl  el filtro es un buscador: no trae opciones, las va pidiendo
  //              segun lo que se escribe. Un catalogo de miles de productos no
  //              cabe en un desplegable, asi que sin esto el filtro salia vacio.
  //   dependsOn  las opciones del filtro dependen del valor de otro (los
  //              usuarios de un establecimiento, por ejemplo). Hasta que el
  //              padre no tiene valor, el hijo va deshabilitado.
  // ───────────────────────────────────────────────────────────────────────────

  /** Evita que la cascada dispare una consulta por cada hijo que se recarga. */
  let cascadaEnCurso = false

  function findFilter (name) {
    return filters.value.find((f) => f.name === name)
  }

  function getDependents (parentName) {
    return filters.value.filter((f) => f.dependsOn === parentName)
  }

  /**
   * Lee la lista de opciones de una respuesta de filtro.
   *
   * Los endpoints de reportes responden `{data: [...]}` y algunos
   * `{options: [...]}`; se aceptan ambos, y tambien un array pelado.
   */
  function leerOpciones (cuerpo) {
    if (Array.isArray(cuerpo)) return cuerpo
    if (Array.isArray(cuerpo?.data)) return cuerpo.data
    if (Array.isArray(cuerpo?.options)) return cuerpo.options

    return []
  }

  /**
   * Recarga las opciones de un filtro hijo segun el valor de su padre.
   * No consulta los registros: de eso se encarga quien la llama.
   */
  async function loadDependentOptions (child) {
    if (!child?.dependsOn || !child?.remote?.url) return

    const parent = findFilter(child.dependsOn)
    const parentValue = parent?.value
    const sinPadre = !parentValue || parentValue === 'all'

    child.disabled = child.disableWhenParentEmpty !== false && sinPadre

    if (child.disabled) {
      child.options = []
      if (child.resetOnParentChange !== false) child.value = 'all'
      return
    }

    // El backend marca con '$parent' donde va el valor del padre.
    const params = { ...(child.remote.params || {}) }
    Object.keys(params).forEach((k) => {
      if (params[k] === '$parent') params[k] = parentValue
    })

    child.loading = true

    try {
      const method = (child.remote.method || 'get').toLowerCase()
      const res = method === 'get'
        ? await http.get(child.remote.url, { params })
        : await http[method](child.remote.url, params)

      child.options = leerOpciones(res.data)
      if (child.resetOnParentChange !== false) child.value = 'all'
    } catch {
      child.options = []
    } finally {
      child.loading = false
    }
  }

  /**
   * Busca opciones de un filtro con `searchUrl` segun lo tecleado.
   * Devuelve la lista, para que el control la meta dentro de su `update()`.
   *
   * @param {object} filter
   * @param {string} texto
   * @returns {Promise<Array>}
   */
  async function searchFilterOptions (filter, texto) {
    if (!filter?.searchUrl) return []

    filter.loading = true

    try {
      const { data } = await http.get(filter.searchUrl, {
        params: { search: texto, input: texto },
      })

      return leerOpciones(data)
    } catch {
      return []
    } finally {
      filter.loading = false
    }
  }

  /**
   * Cambio de un filtro: si tiene hijos, se recargan y se consulta UNA vez al
   * final; si no, consulta directa.
   */
  async function onFilterChange (filter) {
    if (cascadaEnCurso) return

    const hijos = getDependents(filter.name)

    if (hijos.length === 0) {
      pagination.page = 1
      await fetch()
      return
    }

    cascadaEnCurso = true

    try {
      for (const hijo of hijos) {
        await loadDependentOptions(hijo)
      }
    } finally {
      cascadaEnCurso = false
    }

    pagination.page = 1
    await fetch()
  }

  return {
    onFilterChange, searchFilterOptions, loadDependentOptions,
    loading, error, initialized, exporting, config, columns, columnOptions,
    visibleColumns, savedExportColumns, exportFormats, headerButtons, filters, rows, meta, pagination,
    init, fetch, setFilter, setPagination, clearFilters, exportData, exportBlob,
    setActionHandler, performHeaderAction, setExportFileHandler, performExportFile,
  }
}
