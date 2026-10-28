'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { buildQuery, jsonFetcher, normalizeHex, type SearchDraft } from '@/lib/query'
import type { ArmorSet, Filters, Paged } from '@/lib/types'
import { Notice, Pagination, ResultsSection } from './results'
import { SearchControls, Toggle } from './search-controls'
import { SetCard } from './set-card'

export function SetsSearch() {
  const [draft, setDraft] = useState<SearchDraft>({ q: '', hex: '', limit: 24 })
  const [query, setQuery] = useState(draft)
  const [tolerance, setTolerance] = useState(0)
  const [exactGroup, setExactGroup] = useState(false)
  const [filters, setFilters] = useState<Filters>({ includeFairy: false, includeCrystal: false })
  const [page, setPage] = useState(1)

  const ready = query.q.trim() && normalizeHex(query.hex)
  const url = ready
    ? `/api/sets?${buildQuery({
        page,
        limit: query.limit,
        q: query.q,
        hex: query.hex,
        tolerance,
        filters,
        extra: exactGroup ? { exactGroup: '1' } : undefined,
      })}`
    : null
  const { data, error, isLoading } = useSWR<Paged<ArmorSet>>(url, jsonFetcher, { keepPreviousData: true })

  return (
    <>
      <SearchControls
        idPrefix="sets"
        eyebrow="Set search"
        title="Find complete sets"
        total={ready ? data?.total : undefined}
        draft={draft}
        onDraft={setDraft}
        onSubmit={() => {
          setQuery(draft)
          setPage(1)
        }}
        tolerance={tolerance}
        onTolerance={(t) => {
          setTolerance(t)
          setPage(1)
        }}
        filters={filters}
        onFilters={(f) => {
          setFilters(f)
          setPage(1)
        }}
        namePlaceholder="Set name (e.g. Wise Dragon, Farm Suit)"
        hexPlaceholder="Exact hex (e.g. 191919)"
      >
        <div className="mt-3 max-w-sm">
          <Toggle
            label="Exact group hexes only"
            description="Every piece must share the exact hex"
            checked={exactGroup}
            onChange={(v) => {
              setExactGroup(v)
              setPage(1)
            }}
          />
        </div>
      </SearchControls>

      {!ready ? (
        <Notice title="Enter a set name and an exact hex.">
          Dragon sets return Chestplate + Leggings + Boots. Others (e.g. Farm Suit) return all four pieces owned by the
          same player.
        </Notice>
      ) : (
        <ResultsSection title="Matching sets">
          {error ? (
            <Notice tone="error" title="Could not load sets.">
              {error.message}
            </Notice>
          ) : isLoading && !data ? (
            <Notice tone="loading" title="Searching sets…" />
          ) : data && data.items.length === 0 ? (
            <Notice title="No complete sets found.">Try raising the ΔE tolerance.</Notice>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                {data?.items.map((set, i) => (
                  <SetCard key={`${set.ownerUuid}-${set.setLabel}-${i}`} set={set} />
                ))}
              </div>
              {data && <Pagination page={page} totalPages={data.totalPages} onPage={setPage} />}
            </>
          )}
        </ResultsSection>
      )}
    </>
  )
}
