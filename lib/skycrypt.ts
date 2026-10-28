import 'server-only'
import { compactUuid } from './query'

/**
 * SkyBlock level lookups.
 *
 * Default source is the Elite API (api.elitebot.dev), which is public and needs no key. It reports
 * the player's selected profile. When SKYCRYPT_API_KEY is set, SkyCrypt is tried first (highest
 * level across profiles) and Elite fills in players SkyCrypt doesn't have cached.
 *
 * SKYCRYPT_API_URL  – endpoint template, `{player}` is replaced with the player's UUID.
 * SKYCRYPT_API_KEY  – sent as `x-api-key`. Required by api.shiiyu.moe.
 */
const SKYCRYPT_URL = process.env.SKYCRYPT_API_URL || 'https://api.shiiyu.moe/api/stats/{player}'
const SKYCRYPT_KEY = process.env.SKYCRYPT_API_KEY
const ELITE_URL = 'https://api.elitebot.dev/profile/{player}/selected'

const HIT_TTL = 6 * 60 * 60_000 // levels barely move; cache for 6h
const MISS_TTL = 5 * 60_000 // retry failures soon (SkyCrypt policy: cache responses at least 5 min)
const CONCURRENCY = 4
const TIME_BUDGET = 18_000 // return what we have before the function times out; the client polls for the rest

type CacheEntry = { level: number | null; expires: number }
const g = globalThis as unknown as {
  __sbLevelCache?: Map<string, CacheEntry>
  __sbSkyCryptDisabled?: boolean
  __sbEliteBlockedUntil?: number
}
const cache = (g.__sbLevelCache ??= new Map<string, CacheEntry>())

export type LevelsResult = { levels: Record<string, number | null>; pending?: boolean }

function toLevel(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (value && typeof value === 'object') {
    const v = value as Record<string, unknown>
    if (typeof v.level === 'number') return v.level
    // SkyBlock XP: 100 XP per level
    if (typeof v.xp === 'number') return Math.floor(v.xp / 100)
  }
  return null
}

/** Walk a SkyCrypt response and return the highest SkyBlock level across all profiles. */
function findLevel(node: unknown, depth = 0): number | null {
  if (!node || typeof node !== 'object' || depth > 8) return null
  let best: number | null = null
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    let found: number | null = null
    if (/^(skyblock_?level|sb_?level)$/i.test(key)) found = toLevel(value)
    if (found === null && value && typeof value === 'object') found = findLevel(value, depth + 1)
    if (found !== null && (best === null || found > best)) best = found
  }
  return best
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function fetchSkyCrypt(uuid: string): Promise<number | null> {
  if (!SKYCRYPT_KEY || g.__sbSkyCryptDisabled) return null
  try {
    const res = await fetch(SKYCRYPT_URL.replace('{player}', encodeURIComponent(uuid)), {
      headers: { accept: 'application/json', 'x-api-key': SKYCRYPT_KEY },
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    })
    if (res.status === 401 || res.status === 403) {
      // Bad key: stop asking SkyCrypt on this instance and rely on Elite.
      g.__sbSkyCryptDisabled = true
      console.warn('SkyCrypt rejected SKYCRYPT_API_KEY; falling back to the Elite API for SkyBlock levels.')
      return null
    }
    if (!res.ok) return null
    const level = findLevel(await res.json())
    return level === null ? null : Math.floor(level)
  } catch {
    return null
  }
}

async function fetchElite(uuid: string, deadline: number): Promise<number | null | undefined> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const wait = (g.__sbEliteBlockedUntil ?? 0) - Date.now()
    if (wait > 0) {
      if (Date.now() + wait > deadline) return undefined
      await sleep(wait)
    }
    try {
      const res = await fetch(ELITE_URL.replace('{player}', encodeURIComponent(uuid)), {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
        cache: 'no-store',
      })
      if (res.status === 429) {
        const reset = Number(res.headers.get('x-ratelimit-reset')) * 1000
        g.__sbEliteBlockedUntil = Number.isFinite(reset) && reset > Date.now() ? reset + 250 : Date.now() + 5_000
        continue
      }
      if (!res.ok) return null
      const data = (await res.json()) as { skyblockXp?: unknown }
      return typeof data.skyblockXp === 'number' ? Math.floor(data.skyblockXp / 100) : null
    } catch {
      return null
    }
  }
  return undefined
}

/** number = level, null = not found, undefined = ran out of time (try again later). */
async function fetchLevel(uuid: string, deadline: number): Promise<number | null | undefined> {
  const fromSkyCrypt = await fetchSkyCrypt(uuid)
  if (fromSkyCrypt !== null) return fromSkyCrypt
  return fetchElite(uuid, deadline)
}

export async function getSkyblockLevels(rawIds: string[]): Promise<LevelsResult> {
  const ids = [...new Set(rawIds.map(compactUuid).filter((id) => /^[0-9a-f]{32}$/.test(id)))].slice(0, 48)
  const out: Record<string, number | null> = {}
  const now = Date.now()
  const deadline = now + TIME_BUDGET
  const todo: string[] = []

  for (const id of ids) {
    const hit = cache.get(id)
    if (hit && hit.expires > now) out[id] = hit.level
    else todo.push(id)
  }

  let next = 0
  let pending = false
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, todo.length) }, async () => {
      while (next < todo.length) {
        if (Date.now() > deadline) {
          pending = true
          return
        }
        const id = todo[next++]
        const level = await fetchLevel(id, deadline)
        if (level === undefined) {
          pending = true
          continue
        }
        cache.set(id, { level, expires: Date.now() + (level === null ? MISS_TTL : HIT_TTL) })
        out[id] = level
      }
    }),
  )
  return pending ? { levels: out, pending } : { levels: out }
}
