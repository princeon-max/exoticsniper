'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useFavourites } from '@/lib/favourites'
import type { Filters } from '@/lib/types'
import { ItemCard } from './item-card'
import { Notice, ResultsSection } from './results'
import { Toggle } from './search-controls'
import { SetCard } from './set-card'

const isHidden = (hexType: string | null | undefined, f: Filters) => {
  const t = (hexType ?? '').toLowerCase()
  return (t.includes('fairy') && !f.includeFairy) || (t.includes('crystal') && !f.includeCrystal)
}

export function FavouritesList() {
  const { items, sets } = useFavourites()
  const [filters, setFilters] = useState<Filters>({ includeFairy: false, includeCrystal: false })
  const visibleItems = items.filter((i) => !isHidden(i.hexType, filters))
  const visibleSets = sets.filter((s) => !Object.values(s.pieces).some((p) => p && isHidden(p.hexType, filters)))

  return (
    <>
      <div className="panel p-5 sm:p-6">
        <p className="eyebrow">Saved</p>
        <h2 className="mt-1 font-mono text-xl font-semibold">Your favourites</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Saved pieces and complete sets, with live verification. Stored in this browser.
        </p>
        <div className="mt-4 grid max-w-lg gap-2 sm:grid-cols-2">
          <Toggle label="Fairy" checked={filters.includeFairy} onChange={(v) => setFilters({ ...filters, includeFairy: v })} />
          <Toggle
            label="Crystal"
            checked={filters.includeCrystal}
            onChange={(v) => setFilters({ ...filters, includeCrystal: v })}
          />
        </div>
      </div>

      {items.length === 0 && sets.length === 0 ? (
        <Notice title="No favourites yet.">
          Save individual pieces from{' '}
          <Link href="/" className="text-primary hover:underline">
            All Items
          </Link>{' '}
          or complete sets from{' '}
          <Link href="/sets" className="text-primary hover:underline">
            Sets
          </Link>
          .
        </Notice>
      ) : (
        <>
          {visibleSets.length > 0 && (
            <ResultsSection title={`Sets (${visibleSets.length})`}>
              <div className="grid gap-3 md:grid-cols-2">
                {visibleSets.map((s, i) => (
                  <SetCard key={`${s.ownerUuid}-${s.setLabel}-${i}`} set={s} />
                ))}
              </div>
            </ResultsSection>
          )}
          {visibleItems.length > 0 && (
            <ResultsSection title={`Pieces (${visibleItems.length})`}>
              <div className="grid gap-3 md:grid-cols-2">
                {visibleItems.map((item) => (
                  <ItemCard key={item.uuid} item={item} showSource />
                ))}
              </div>
            </ResultsSection>
          )}
        </>
      )}
    </>
  )
}
