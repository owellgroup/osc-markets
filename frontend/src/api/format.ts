export function money(value: number | null | undefined, currency = 'NAD'): string {
  if (value === null || value === undefined) return '-'
  const symbol = currency === 'NAD' || !currency ? 'N$' : currency === 'ZAR' ? 'R' : currency
  return `${symbol} ${value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function dateTime(iso?: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function dateOnly(iso?: string | null): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
