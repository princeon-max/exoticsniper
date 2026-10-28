import 'server-only'
import { compactUuid } from './query'
import type { ArmorItem, PlayerLookupResult, SourceStatus } from './types'

const SNIPER_BASE = (process.env.SNIPER_API_URL || 'https://sniper-pearl-beta.vercel.app').replace(/\/$/, '')
const EXOTICO_ITEMS_URL = process.env.EXOTICO_API_URL || 'https://exotico.flori.tv/api/exotic-items'

const FORWARDED_PARAMS = ['page', 'limit', 'q', 'color', 'tolerance', 'includeFairy', 'includeCrystal', 'exactGroup']

export async function proxySniper(path: string, incoming: URLSearchParams) {
  const params = new URLSearchParams()
  for (const key of FORWARDED_PARAMS) {
    const value = incoming.get(key)
    if (value !== null && value.length <= 120) params.set(key, value)
  }
  const limit = Number(params.get('limit') ?? 24)
  if (!Number.isFinite(limit) || limit < 1 || limit > 48) params.set('limit', '24')

  try {
    const res = await fetch(`${SNIPER_BASE}${path}?${params}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(30_000),
    })
    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ ok: false, error: 'The sniper database did not respond.' }, { status: 502 })
  }
}

export async function proxySniperPost(path: string, body: unknown) {
  try {
    const res = await fetch(`${SNIPER_BASE}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    })
    return Response.json(await res.json(), { status: res.status })
  } catch {
    return Response.json({ status: 'api_off', detail: 'Could not reach Exotico.' }, { status: 502 })
  }
}

type SniperPlayer = { ok: boolean; uuid?: string; name?: string; items?: ArmorItem[]; error?: string }

async function fetchSniperPlayer(q: string): Promise<SniperPlayer> {
  const res = await fetch(`${SNIPER_BASE}/api/player-lookup?q=${encodeURIComponent(q)}`, {
    next: { revalidate: 120 },
    signal: AbortSignal.timeout(60_000),
  })
  const data = (await res.json().catch(() => null)) as SniperPlayer | null
  if (!data) throw new Error(`Sniper responded with ${res.status}`)
  return data
}

type ExoticoRaw = {
  exoticItemsCombined?: Array<Record<string, unknown>>
  profiles?: Array<{ skyblockLevel?: number }>
  cachedAt?: string
  uuid?: string
  name?: string
  playerName?: string
}

async function fetchExotico(playername: string, key: string): Promise<ExoticoRaw | null> {
  const url = `${EXOTICO_ITEMS_URL}?playername=${encodeURIComponent(playername)}&limit=500`
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${key}`, 'x-api-key': key, accept: 'application/json' },
    next: { revalidate: 120 },
    signal: AbortSignal.timeout(30_000),
  })
  if (res.status === 404) return null
  if (res.status === 401 || res.status === 403) {
    throw new Error('Exotico rejected the API key. Enable server key access on exotico.flori.tv.')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.message || body?.error || `Exotico responded with ${res.status}`)
  }
  return res.json()
}

const str = (v: unknown) => (typeof v === 'string' && v.length > 0 ? v : null)

function normalizeExoticoItem(raw: Record<string, unknown>, index: number, ownerUuid: string | null): ArmorItem {
  const color = str(raw.color)
  const reforge = str(raw.reforgeName) ?? (typeof raw.reforge === 'string' ? raw.reforge : null)
  return {
    id: (raw.id as string) ?? `exotico-${index}`,
    uuid: str(raw.uuid) ?? str(raw.itemUuid) ?? str(raw.id) ?? `exotico-${index}`,
    name: str(raw.name) ?? 'Unknown',
    color: color ? `#${color.replace(/^#/, '').toUpperCase()}` : null,
    rarity: str(raw.rarity)?.toUpperCase() ?? null,
    reforge,
    ownerUuid,
    ownerUsername: null,
    ownerAvatarUrl: ownerUuid ? `https://crafatar.com/avatars/${ownerUuid}?size=20&overlay` : null,
    ownerMcuuidUrl: ownerUuid ? `https://mcuuid.net/?q=${ownerUuid}` : null,
    ownerSkyCryptUrl: ownerUuid ? `https://sky.shiiyu.moe/stats/${ownerUuid}` : null,
    hexType: str(raw.hexType),
    isExotic: true,
    deltaE: null,
    source: 'exotico',
    profile: str(raw.profileName) ?? str(raw.profile),
    colorName: str(raw.colorName),
    variant: str(raw.variant),
  }
}

export async function lookupPlayer(q: string): Promise<PlayerLookupResult> {
  const key = process.env.EXOTICO_API_KEY
  const sniperP = fetchSniperPlayer(q)
  const exoticoP = key ? fetchExotico(q, key) : Promise.resolve(undefined)
  const [sniperR, exoticoR] = await Promise.allSettled([sniperP, exoticoP])

  let sniper: SourceStatus
  let sniperItems: ArmorItem[] = []
  let uuid: string | null = null
  let name: string | null = null

  if (sniperR.status === 'fulfilled' && sniperR.value.ok) {
    sniperItems = (sniperR.value.items ?? []).map((item) => ({ ...item, source: 'sniper' as const }))
    uuid = sniperR.value.uuid ?? null
    name = sniperR.value.name ?? null
    sniper = { status: 'ok', count: sniperItems.length }
  } else if (sniperR.status === 'fulfilled') {
    sniper = { status: 'not_found', count: 0, message: sniperR.value.error }
  } else {
    sniper = { status: 'error', count: 0, message: 'The sniper database did not respond.' }
  }

  let exoticoRaw: ExoticoRaw | null | undefined
  let exotico: SourceStatus
  if (!key) {
    exotico = { status: 'not_configured', count: 0, message: 'Set EXOTICO_API_KEY to merge Exotico data.' }
  } else if (exoticoR.status === 'fulfilled') {
    exoticoRaw = exoticoR.value
    // Exotico expects an IGN; retry with the resolved name when the user searched by UUID.
    if (!exoticoRaw && name && name.toLowerCase() !== q.toLowerCase()) {
      exoticoRaw = await fetchExotico(name, key).catch(() => null)
    }
    exotico = exoticoRaw ? { status: 'ok', count: 0 } : { status: 'not_found', count: 0 }
  } else {
    exotico = { status: 'error', count: 0, message: (exoticoR.reason as Error)?.message }
  }

  if (exoticoRaw) {
    uuid ??= compactUuid(exoticoRaw.uuid) || null
    name ??= exoticoRaw.name ?? exoticoRaw.playerName ?? null
  }

  const merged = new Map<string, ArmorItem>()
  for (const item of sniperItems) merged.set(compactUuid(item.uuid), item)

  const exoticoItems = (exoticoRaw?.exoticItemsCombined ?? []).map((raw, i) => normalizeExoticoItem(raw, i, uuid))
  exotico.count = exoticoItems.length
  for (const item of exoticoItems) {
    const k = compactUuid(item.uuid)
    const existing = merged.get(k)
    if (existing) {
      merged.set(k, {
        ...existing,
        source: 'both',
        profile: existing.profile ?? item.profile,
        colorName: existing.colorName ?? item.colorName,
        variant: existing.variant ?? item.variant,
        reforge: existing.reforge ?? item.reforge,
      })
    } else {
      merged.set(k, item)
    }
  }

  const items = [...merged.values()].sort((a, b) => a.name.localeCompare(b.name))
  const ok = sniper.status === 'ok' || exotico.status === 'ok'
  const levels = exoticoRaw?.profiles?.map((p) => p.skyblockLevel ?? 0) ?? []

  return {
    ok,
    error: ok ? undefined : sniper.message || exotico.message || 'Player not found.',
    uuid,
    name,
    items,
    sources: { sniper, exotico },
    exotico: exoticoRaw
      ? { highestLevel: levels.length ? Math.max(...levels) : null, cachedAt: exoticoRaw.cachedAt ?? null }
      : undefined,
  }
}
