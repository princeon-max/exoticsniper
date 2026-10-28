'use client'

import { Search } from 'lucide-react'
import { normalizeHex, PAGE_SIZES, type SearchDraft } from '@/lib/query'
import type { Filters } from '@/lib/types'
import { cn } from '@/lib/utils'

export function SearchControls({
  idPrefix,
  eyebrow,
  title,
  total,
  draft,
  onDraft,
  onSubmit,
  tolerance,
  onTolerance,
  filters,
  onFilters,
  namePlaceholder,
  hexPlaceholder,
  children,
}: {
  idPrefix: string
  eyebrow: string
  title: string
  total?: number
  draft: SearchDraft
  onDraft: (d: SearchDraft) => void
  onSubmit: () => void
  tolerance: number
  onTolerance: (n: number) => void
  filters: Filters
  onFilters: (f: Filters) => void
  namePlaceholder: string
  hexPlaceholder: string
  children?: React.ReactNode
}) {
  const hex = normalizeHex(draft.hex)
  return (
    <form
      className="panel p-5 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-1 font-mono text-xl font-semibold">{title}</h2>
        </div>
        {typeof total === 'number' && (
          <p role="status" className="chip border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            {total.toLocaleString()} results
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-end">
        <label className="flex min-w-0 flex-[2] flex-col gap-1.5">
          <span className="text-xs font-semibold">Name</span>
          <input
            id={`${idPrefix}-name`}
            className="field"
            placeholder={namePlaceholder}
            value={draft.q}
            onChange={(e) => onDraft({ ...draft, q: e.target.value })}
            autoComplete="off"
          />
        </label>
        <label className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-xs font-semibold">Hex colour</span>
          <span className="relative">
            <span
              aria-hidden
              className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 rounded-full border border-white/20"
              style={{ background: hex ? `#${hex}` : 'linear-gradient(135deg,#7dd3fc,#a78bfa)' }}
            />
            <input
              id={`${idPrefix}-hex`}
              className="field pl-10 font-mono"
              placeholder={hexPlaceholder}
              value={draft.hex}
              maxLength={7}
              onChange={(e) => onDraft({ ...draft, hex: e.target.value })}
              autoComplete="off"
              aria-invalid={draft.hex.trim() !== '' && !hex}
            />
          </span>
        </label>
        <label className="flex flex-col gap-1.5 md:w-28">
          <span className="text-xs font-semibold">Per page</span>
          <select
            className="field"
            value={draft.limit}
            onChange={(e) => onDraft({ ...draft, limit: Number(e.target.value) })}
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-mono text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          <Search className="size-4" aria-hidden />
          Search
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border bg-background/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <strong className="text-sm">Visual colour tolerance (ΔE)</strong>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">CIEDE2000 · 0 = exact · lower = closer</p>
            </div>
            <code className="rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-sm text-primary">ΔE {tolerance}</code>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={tolerance}
            onChange={(e) => onTolerance(Number(e.target.value))}
            aria-label="Visual colour tolerance (ΔE)"
            className="mt-4 w-full accent-primary"
          />
        </div>
        <div className="rounded-xl border bg-background/40 p-4">
          <div className="flex items-center justify-between">
            <strong className="text-sm">Non-exotic hexes</strong>
            <span className="text-[11px] text-muted-foreground">Excluded by default</span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Toggle
              label="Include Fairy hexes"
              description="Animated Fairy colour cycle"
              checked={filters.includeFairy}
              onChange={(v) => onFilters({ ...filters, includeFairy: v })}
            />
            <Toggle
              label="Include Crystal hexes"
              description="Crystal light-level colours"
              checked={filters.includeCrystal}
              onChange={(v) => onFilters({ ...filters, includeCrystal: v })}
            />
          </div>
        </div>
      </div>
      {children}
    </form>
  )
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card/60 px-3 py-2.5 transition hover:border-primary/30">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition peer-focus-visible:ring-2 peer-focus-visible:ring-primary',
          checked ? 'bg-primary' : 'bg-muted',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-4 rounded-full bg-foreground transition-all',
            checked ? 'left-[18px] bg-primary-foreground' : 'left-0.5',
          )}
        />
      </span>
      <span className="min-w-0">
        <strong className="block text-xs">{label}</strong>
        {description && <span className="block text-[11px] text-muted-foreground">{description}</span>}
      </span>
    </label>
  )
}
