// Etiquetas de respaldo de los modos del filtro de período (en español, el idioma por
// defecto del paquete). La app puede traducirlas con `components.periodModes.<modo>`.
export const PERIOD_MODE_LABELS = {
  date: 'Por fecha',
  between_dates: 'Entre fechas',
  month: 'Por mes',
  between_months: 'Entre meses',
  all: 'Todas las fechas',
}

// Los modos que la forma en línea sabe dibujar, en el orden por defecto.
export const DEFAULT_PERIOD_MODES = ['month', 'date', 'between_months', 'between_dates']

// Los cinco campos que lee el backend (esolutions/datatable, FilterTrait::getFilterDate).
export const PERIOD_FIELDS = ['value', 'dateStart', 'dateEnd', 'monthStart', 'monthEnd']
