'use client'

import { Database, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import useSWR from 'swr'
import type { ItemSource, PlayerLookupResult, SourceStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ItemCard } from './item-card'
import { Notice, ResultsSection } from './results'

async function fetchPlayer(url: string): Promise<PlayerLookupResult> {
  const res = await fetch(url)
  const data = await res.json().catch(() => null)
  if (!data?.ok) throw new Error(data?.error || 'Player not found.')
  return data
}

type Tab = 'all' | ItemSource

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'both', label: 'In both' },
  { id: 'sniper', label: 'Sniper only' },
  { id: 'exotico', label: 'Exotico only' },
]

export function PlayerLookup() {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [filter, setFilter] = useState('')

  const { data, error, isLoading } = useSWR(
    query ? `/api/player-lookup?q=${encodeURIComponent(query)}` : null,
    fetchPlayer,
    { revalidateOnFocus: false },
  )

  const counts = useMemo(() => {
    const c = { all: 0, both: 0, sniper: 0, exotico: 0 }
    for (const i of data?.items ?? []) {
      c.all++
      c[i.source ?? 'sniper']++
    }
    return c
  }, [data])

  const visible = useMemo(() => {
    const f = filter.trim().toLowerCase()
    return (data?.items ?? []).filter(
      (i) =>
        (tab === 'all' || i.source === tab) &&
        (!f || i.name.toLowerCase().includes(f) || (i.color ?? '').toLowerCase().includes(f)),
    )
  }, [data, tab, filter])

  return (
    <>
      <form
        className="panel p-5 sm:p-6"
        onSubmit={(e) => {
          e.preventDefault()
          setQuery(input.trim())
          setTab('all')
          setFilter('')
        }}
      >
        <p className="eyebrow">Player lookup</p>
        <h2 className="mt-1 font-mono text-xl font-semibold">See a player&apos;s exotics</h2>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Searches the sniper database and Exotico at the same time, then merges both collections and removes
          duplicates.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-semibold">Username or UUID</span>
            <input
              className="field font-mono"
              placeholder="e.g. Technoblade"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              maxLength={36}
            />
          </label>
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-mono text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
          >
            <Search className="size-4" aria-hidden />
            Look up
          </button>
        </div>
      </form>

      {!query ? (
        <Notice title="Two databases, one search.">
          The first sniper lookup can take up to a minute while the database is indexed; after that, lookups are
          instant.
        </Notice>
      ) : isLoading ? (
        <Notice tone="loading" title={`Looking up ${query}…`}>
          Querying the sniper database and Exotico.
        </Notice>
      ) : error ? (
        <Notice tone="error" title="Player not found.">
          {error.message}
        </Notice>
      ) : data ? (
        <>
          <PlayerHeader data={data} />
          <ResultsSection title={`${data.name ?? query}'s exotics`}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div role="tablist" aria-label="Filter by source" className="flex flex-wrap gap-2">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 font-mono text-xs transition',
                      tab === t.id
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {t.label} <span className="opacity-70">{counts[t.id]}</span>
                  </button>
                ))}
              </div>
              <input
                className="field h-9 sm:w-64"
                placeholder="Filter by name or hex"
                aria-label="Filter pieces by name or hex"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            {visible.length === 0 ? (
              <Notice title="No pieces in this view." />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {visible.map((item) => (
                  <ItemCard key={`${item.source}-${item.uuid}`} item={{ ...item, ownerUsername: data.name }} showSource />
                ))}
              </div>
            )}
          </ResultsSection>
        </>
      ) : null}
    </>
  )
}

function PlayerHeader({ data }: { data: PlayerLookupResult }) {
  return (
    <div className="panel mt-4 flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        {data.uuid && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://crafatar.com/avatars/${data.uuid}?size=64&overlay`}
            alt={`${data.name ?? 'Player'} avatar`}
            width={56}
            height={56}
            className="size-14 rounded-lg"
          />
        )}
        <div className="min-w-0">
          <p className="font-mono text-xl font-semibold">{data.name ?? 'Unknown player'}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{data.uuid}</p>
          {data.uuid && (
            <div className="mt-1.5 flex flex-wrap gap-3 font-mono text-xs">
              <a className="text-primary hover:underline" href={`https://sky.shiiyu.moe/stats/${data.uuid}`} target="_blank" rel="noreferrer">
                SkyCrypt
              </a>
              <a className="text-primary hover:underline" href={`https://plancke.io/hypixel/player/stats/${data.uuid}`} target="_blank" rel="noreferrer">
                Plancke
              </a>
              <a className="text-primary hover:underline" href={`https://namemc.com/profile/${data.uuid}`} target="_blank" rel="noreferrer">
                NameMC
              </a>
              <a className="text-exotico hover:underline" href="https://exotico.flori.tv" target="_blank" rel="noreferrer">
                Exotico
              </a>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:min-w-80">
        <SourceStat label="Sniper DB" tone="text-primary" status={data.sources.sniper} />
        <SourceStat
          label="Exotico"
          tone="text-exotico"
          status={data.sources.exotico}
          extra={data.exotico?.highestLevel ? `SB level ${data.exotico.highestLevel}` : undefined}
        />
      </div>
    </div>
  )
}

const STATUS_LABEL: Record<SourceStatus['status'], string> = {
  ok: 'Connected',
  not_found: 'No record',
  error: 'Unavailable',
  not_configured: 'Not configured',
}

function SourceStat({
  label,
  tone,
  status,
  extra,
}: {
  label: string
  tone: string
  status: SourceStatus
  extra?: string
}) {
  return (
    <div className="rounded-xl border bg-background/50 p-3" title={status.message}>
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Database className={cn('size-3', tone)} aria-hidden />
        {label}
      </p>
      <p className={cn('mt-1 font-mono text-2xl font-semibold', tone)}>{status.count}</p>
      <p className="text-[11px] text-muted-foreground">
        {STATUS_LABEL[status.status]}
        {extra ? ` · ${extra}` : ''}
      </p>
    </div>
  )
}
