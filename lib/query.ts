import type { Filters, PieceSlot } from './types'

export type SearchDraft = { q: string; hex: string; limit: number }

export const PAGE_SIZES = [12, 24, 48] as const

export function normalizeHex(value: string): string | null {
  const clean = value.trim().replace(/^#/, '')
  return /^[0-9a-fA-F]{6}$/.test(clean) ? clean.toUpperCase() : null
}

export function buildQuery(params: {
  page: number
  limit: number
  q?: string
  hex?: string
  tolerance?: number
  filters: Filters
  extra?: Record<string, string>
}) {
  const search = new URLSearchParams()
  search.set('page', String(params.page))
  search.set('limit', String(params.limit))
  if (params.q?.trim()) search.set('q', params.q.trim())
  const hex = params.hex ? normalizeHex(params.hex) : null
  if (hex) search.set('color', hex)
  if (params.tolerance) search.set('tolerance', String(params.tolerance))
  if (params.filters.includeFairy) search.set('includeFairy', '1')
  if (params.filters.includeCrystal) search.set('includeCrystal', '1')
  for (const [key, value] of Object.entries(params.extra ?? {})) search.set(key, value)
  return search.toString()
}

export async function jsonFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const data = await res.json().catch(() => null)
  if (!res.ok || (data && data.ok === false)) {
    throw new Error(data?.error || data?.message || `Request failed (${res.status})`)
  }
  return data as T
}

export function pieceFromName(name: string | null | undefined): PieceSlot | null {
  const n = (name ?? '').toLowerCase()
  if (/(helmet|hat|cap|hood|mask|crown|head)/.test(n)) return 'helmet'
  if (/(chestplate|tunic|shirt|jacket|vest|chest)/.test(n)) return 'chestplate'
  if (/(leggings|pants|trousers|legs)/.test(n)) return 'leggings'
  if (/(boots|shoes|slippers|sandals|feet)/.test(n)) return 'boots'
  return null
}

export function compactUuid(uuid: string | null | undefined) {
  return (uuid ?? '').replace(/-/g, '').toLowerCase()
}
