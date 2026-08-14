// Datos simulados. Deterministas a proposito (sin Math.random): el playground
// debe verse igual en cada recarga para que comparar temas sea fiable.

export const COLUMNS = [
  { name: 'serie', label: 'Serie', align: 'left', sortable: true, visible: true, locked: true, width: 110 },
  { name: 'cliente', label: 'Cliente', align: 'left', sortable: true, visible: true },
  { name: 'documento', label: 'Documento', align: 'left', sortable: false, visible: true },
  { name: 'fecha', label: 'Fecha', align: 'left', sortable: true, visible: true },
  { name: 'estado', label: 'Estado', align: 'center', sortable: true, visible: true },
  { name: 'total', label: 'Total', align: 'right', sortable: true, visible: true },
]

export const ROW_ACTIONS = [
  { name: 'ver', label: 'Ver detalle', icon: 'fa-light fa-eye' },
  { name: 'descargar', label: 'Descargar XML', icon: 'fa-light fa-file-code' },
]

const NOMBRES = [
  'Comercial Andina SAC', 'Textiles del Sur EIRL', 'Distribuidora Lima SA',
  'Servicios Pacifico SRL', 'Importaciones Mora SAC', 'Agroindustrias Norte SA',
  'Constructora Vega EIRL', 'Farmacia Bienestar SAC', 'Transportes Chavez SRL',
  'Editorial Horizonte SA',
]
const ESTADOS = ['Aceptado', 'Aceptado', 'Aceptado', 'Pendiente', 'Rechazado']

const pad = (n, w = 8) => String(n).padStart(w, '0')

export function makeRows (n) {
  const rows = []
  for (let i = 1; i <= n; i++) {
    // Multiplicadores coprimos con el modulo, si no las fechas se repiten en
    // ciclos cortos y todas las filas visibles salen con el mismo dia/mes.
    const dia = ((i * 11) % 28) + 1
    const mes = ((i * 5) % 12) + 1
    rows.push({
      id: i,
      serie: (i % 3 === 0 ? 'F001-' : 'B001-') + pad(i, 6),
      cliente: NOMBRES[i % NOMBRES.length],
      documento: (i % 3 === 0 ? '20' : '') + pad(100000000 + i * 37, i % 3 === 0 ? 9 : 8),
      fecha: `2026-${pad(mes, 2)}-${pad(dia, 2)}`,
      estado: ESTADOS[i % ESTADOS.length],
      total: Math.round((50 + (i * 137) % 4500) * 100) / 100,
    })
  }
  return rows
}
