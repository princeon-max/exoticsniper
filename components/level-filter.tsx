'use client'

import { EMPTY_LEVEL_FILTER, isLevelFilterActive, type LevelFilter } from '@/lib/skyblock-level'
import { Toggle } from './search-controls'

export function LevelFilterPanel({
  value,
  onChange,
  hiddenCount,
}: {
  value: LevelFilter
  onChange: (f: LevelFilter) => void
  hiddenCount: number
}) {
  const active = isLevelFilterActive(value)
  return (
    <div className="mt-3 rounded-xl border bg-background/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <strong className="text-sm">SkyBlock level filter</strong>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            Owner levels from SkyCrypt / Elite · applies to the results on this page
          </p>
        </div>
        {active && (
          <span className="flex items-center gap-2">
            <code className="rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs text-primary">
              {hiddenCount} hidden
            </code>
            <button
              type="button"
              onClick={() => onChange(EMPTY_LEVEL_FILTER)}
              className="rounded-lg border px-2.5 py-1 font-mono text-xs transition hover:border-primary/40"
            >
              Clear
            </button>
          </span>
        )}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold">Min level</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            className="field font-mono"
            placeholder="0"
            value={value.min}
            onChange={(e) => onChange({ ...value, min: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold">Max level</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            className="field font-mono"
            placeholder="No limit"
            value={value.max}
            onChange={(e) => onChange({ ...value, max: e.target.value })}
          />
        </label>
        <div className="flex items-end">
          <div className="w-full">
            <Toggle
              label="Include unknown"
              description="Level not found"
              checked={value.includeUnknown}
              onChange={(v) => onChange({ ...value, includeUnknown: v })}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
