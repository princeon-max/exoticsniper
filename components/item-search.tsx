'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { buildQuery, jsonFetcher, type SearchDraft } from '@/lib/query'
import { EMPTY_LEVEL_FILTER, isLevelFilterActive, levelFor, passesLevelFilter, useSkyblockLevels, type LevelFilter } from '@/lib/skyblock-level'
import type { ArmorItem, Filters, Paged } from '@/lib/types'
import { ItemCard } from './item-card'
import { LevelFilterPanel } from './level-filter'
import { Notice, Pagination, ResultsSection } from './results'
import { SearchControls } from './search-controls'

export function ItemSearch({
  endpoint,
  idPrefix,
  eyebrow,
  title,
  namePlaceholder,
  resultsTitle,
  hint,
}: {
  endpoint: '/api/search' | '/api/old'
  idPrefix: string
  eyebrow: string
  title: string
  namePlaceholder: string
  resultsTitle: string
  hint: string
}) {
  const [draft, setDraft] = useState<SearchDraft>({ q: '', hex: '', limit: 24 })
  const [query, setQuery] = useState(draft)
  const [tolerance, setTolerance] = useState(0)
  const [filters, setFilters] = useState<Filters>({ includeFairy: false, includeCrystal: false })
  const [page, setPage] = useState(1)
  const [levelFilter, setLevelFilter] = useState<LevelFilter>(EMPTY_LEVEL_FILTER)

  const url = `${endpoint}?${buildQuery({ page, limit: query.limit, q: query.q, hex: query.hex, tolerance, filters })}`
  const { data, error, isLoading } = useSWR<Paged<ArmorItem>>(url, jsonFetcher, { keepPreviousData: true })

  const { levels, pending } = useSkyblockLevels(data?.items.map((i) => i.ownerUuid) ?? [])
  const levelActive = isLevelFilterActive(levelFilter)
  const allItems = data?.items ?? []
  const visibleItems = allItems.filter((i) => passesLevelFilter(levelFor(levels, i.ownerUuid), levelFilter))
  const levelsPending = levelActive && (!levels || pending) && allItems.length > 0

  return (
    <>
      <SearchControls
        idPrefix={idPrefix}
        eyebrow={eyebrow}
        title={title}
        total={data?.total}
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
        namePlaceholder={namePlaceholder}
        hexPlaceholder="191919"
      >
        <LevelFilterPanel
          value={levelFilter}
          onChange={setLevelFilter}
          hiddenCount={levelsPending ? 0 : allItems.length - visibleItems.length}
        />
      </SearchControls>

      {!query.q && !query.hex && <Notice title="Browse the database or narrow it down.">{hint}</Notice>}

      <ResultsSection title={resultsTitle}>
        {error ? (
          <Notice tone="error" title="Could not load results.">
            {error.message}
          </Notice>
        ) : isLoading && !data ? (
          <Notice tone="loading" title="Loading items…" />
        ) : data && data.items.length === 0 ? (
          <Notice title="No items matched.">Try a wider ΔE tolerance or a different name.</Notice>
        ) : levelsPending ? (
          <Notice tone="loading" title="Checking SkyBlock levels…" />
        ) : levelActive && visibleItems.length === 0 ? (
          <Notice title="No players on this page match that level range.">
            Widen the range, turn on “Include unknown”, or try the next page. The level filter only applies to the
            results on the current page, so a higher “Per page” value covers more players.
          </Notice>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2" aria-busy={isLoading}>
              {visibleItems.map((item) => (
                <ItemCard key={item.uuid} item={item} showLevel level={levelFor(levels, item.ownerUuid)} />
              ))}
            </div>
            {data && (
              <Pagination
                page={page}
                totalPages={data.totalPages}
                onPage={(p) => {
                  setPage(p)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            )}
          </>
        )}
      </ResultsSection>
    </>
  )
}
