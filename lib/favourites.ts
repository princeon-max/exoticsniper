'use client'

import { useCallback, useSyncExternalStore } from 'react'
import type { ArmorItem, ArmorSet } from './types'

type Store = { items: ArmorItem[]; sets: ArmorSet[] }

const KEY = 'exotics-favourites-v1'
const EMPTY: Store = { items: [], sets: [] }
const listeners = new Set<() => void>()
let cache: Store | null = null

function read(): Store {
  if (cache) return cache
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    cache = parsed && Array.isArray(parsed.items) ? parsed : EMPTY
  } catch {
    cache = EMPTY
  }
  return cache!
}

function write(next: Store) {
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {}
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null
      listener()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export const setKey = (s: ArmorSet) => `${s.ownerUuid}:${s.setLabel}:${s.color}`

export function useFavourites() {
  const store = useSyncExternalStore(subscribe, read, () => EMPTY)

  const hasItem = useCallback((uuid: string) => store.items.some((i) => i.uuid === uuid), [store])
  const toggleItem = useCallback((item: ArmorItem) => {
    const s = read()
    write({
      ...s,
      items: s.items.some((i) => i.uuid === item.uuid) ? s.items.filter((i) => i.uuid !== item.uuid) : [item, ...s.items],
    })
  }, [])
  const hasSet = useCallback((set: ArmorSet) => store.sets.some((s) => setKey(s) === setKey(set)), [store])
  const toggleSet = useCallback((set: ArmorSet) => {
    const s = read()
    const k = setKey(set)
    write({
      ...s,
      sets: s.sets.some((x) => setKey(x) === k) ? s.sets.filter((x) => setKey(x) !== k) : [set, ...s.sets],
    })
  }, [])

  return { ...store, hasItem, toggleItem, hasSet, toggleSet }
}
