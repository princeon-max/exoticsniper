'use client'

import useSWR from 'swr'
import { compactUuid, jsonFetcher } from './query'

export type LevelFilter = { min: string; max: string; includeUnknown: boolean }

export const EMPTY_LEVEL_FILTER: LevelFilter = { min: '', max: '', includeUnknown: false }

export const isLevelFilterActive = (f: LevelFilter) => f.min.trim() !== '' || f.max.trim() !== ''

/**
 * Fetch SkyBlock levels for a set of owner UUIDs. `levels` is undefined while loading.
 * `pending` means some owners are still being looked up; the hook polls until they're all in.
 */
export function useSkyblockLevels(uuids: Array<string | null>) {
  const ids = [...new Set(uuids.filter((u): u is string => !!u).map(compactUuid))].sort()
  const { data, isLoading } = useSWR<{ ok: boolean; levels: Record<string, number | null>; pending?: boolean }>(
    ids.length ? `/api/skyblock-level?ids=${ids.join(',')}` : null,
    jsonFetcher,
    { keepPreviousData: true, revalidateOnFocus: false, refreshInterval: (latest) => (latest?.pending ? 1500 : 0) },
  )
  return { levels: data?.levels, pending: !!data?.pending, isLoading }
}

export function levelFor(levels: Record<string, number | null> | undefined, uuid: string | null) {
  if (!levels || !uuid) return undefined
  const v = levels[compactUuid(uuid)]
  return v === undefined ? undefined : v
}

/** true = keep. Unknown (null/undefined) levels only pass when includeUnknown is on. */
export function passesLevelFilter(level: number | null | undefined, f: LevelFilter) {
  if (!isLevelFilterActive(f)) return true
  if (typeof level !== 'number') return f.includeUnknown
  const min = f.min.trim() === '' ? -Infinity : Number(f.min)
  const max = f.max.trim() === '' ? Infinity : Number(f.max)
  return level >= min && level <= max
}
