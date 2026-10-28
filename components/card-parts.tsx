'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'
import type { ItemSource } from '@/lib/types'
import { cn } from '@/lib/utils'

export function HexSwatch({ color }: { color: string | null }) {
  return (
    <span className="flex items-center gap-2 font-mono text-sm">
      <span
        aria-hidden
        className="size-3.5 rounded-full border border-white/25"
        style={{ background: color ?? 'transparent' }}
      />
      {color ?? '—'}
    </span>
  )
}

export function HexTypeChip({ hexType, isExotic }: { hexType: string | null; isExotic: boolean }) {
  if (hexType) {
    return <span className="chip border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300">{hexType} hex</span>
  }
  return isExotic ? <span className="chip border-primary/30 bg-primary/10 text-primary">Exotic hex</span> : null
}

const SOURCE_STYLES: Record<ItemSource, { label: string; className: string }> = {
  sniper: { label: 'Sniper', className: 'border-primary/30 bg-primary/10 text-primary' },
  exotico: { label: 'Exotico', className: 'border-exotico/30 bg-exotico/10 text-exotico' },
  both: { label: 'Both DBs', className: 'border-success/30 bg-success/10 text-success' },
}

export function SourceChip({ source }: { source?: ItemSource }) {
  if (!source) return null
  const s = SOURCE_STYLES[source]
  return <span className={cn('chip', s.className)}>{s.label}</span>
}

export function FavouriteButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? `Remove ${label} from favourites` : `Add ${label} to favourites`}
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full border transition',
        active ? 'border-exotico/40 bg-exotico/15 text-exotico' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Star className={cn('size-4', active && 'fill-current')} aria-hidden />
    </button>
  )
}

export function OwnerRow({
  avatar,
  uuid,
  username,
  skyCrypt,
  mcuuid,
  level,
  showLevel = false,
}: {
  avatar: string | null
  uuid: string | null
  username: string | null
  skyCrypt: string | null
  mcuuid: string | null
  /** number = known, null = not found, undefined = still loading */
  level?: number | null
  showLevel?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-t pt-2.5">
      <span className="flex min-w-0 items-center gap-2 font-mono text-[11px] text-muted-foreground">
        {avatar && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="" width={18} height={18} className="size-[18px] rounded" loading="lazy" />
        )}
        <span className="truncate">{username ?? (uuid ? `${uuid.slice(0, 8)}…` : 'Unknown owner')}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2.5 font-mono text-[11px]">
        {showLevel && <LevelBadge level={level} href={skyCrypt} />}
        {!showLevel && skyCrypt && (
          <a href={skyCrypt} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            SkyCrypt
          </a>
        )}
        {mcuuid && (
          <a href={mcuuid} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            UUID
          </a>
        )}
      </span>
    </div>
  )
}

/** Owner's SkyBlock level; links to their SkyCrypt page for the full profile. */
function LevelBadge({ level, href }: { level?: number | null; href: string | null }) {
  const known = typeof level === 'number'
  const label = known ? `SkyBlock Lv ${level}` : level === null ? 'SkyBlock Lv ?' : 'SkyBlock Lv …'
  const className = cn(
    'chip shrink-0 font-semibold',
    known ? 'border-success/30 bg-success/10 text-success' : 'bg-background/60 text-muted-foreground',
    href && 'transition hover:border-primary/40',
  )
  const title = known
    ? 'SkyBlock level (SkyCrypt / Elite) · open SkyCrypt'
    : level === null
      ? 'Level not found · open SkyCrypt'
      : 'Looking up SkyBlock level…'
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={className} title={title}>
      {label}
    </a>
  ) : (
    <span className={className} title={title}>
      {label}
    </span>
  )
}

const STATUS_TONE: Record<string, string> = {
  found: 'text-success',
  ok: 'text-success',
  owned: 'text-success',
  missing: 'text-destructive',
  not_found: 'text-destructive',
  api_off: 'text-muted-foreground',
}

export function CheckButton({
  ownerUsername,
  ownerUuid,
  targets,
}: {
  ownerUsername: string | null
  ownerUuid: string | null
  targets: string[]
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | string>('idle')
  const [detail, setDetail] = useState('')

  async function check() {
    if (!ownerUsername && !ownerUuid) {
      setStatus('api_off')
      setDetail('No player IGN/UUID is available for this record.')
      return
    }
    setStatus('loading')
    setDetail('')
    try {
      const res = await fetch('/api/check-exotico', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ign: ownerUsername, ownerUuid, targets }),
      })
      const data = await res.json()
      setStatus(data?.status || 'api_off')
      setDetail(data?.detail || '')
    } catch {
      setStatus('api_off')
      setDetail('Could not reach Exotico.')
    }
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <button
        type="button"
        onClick={check}
        disabled={status === 'loading'}
        className="shrink-0 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-primary transition hover:bg-primary/20 disabled:opacity-60"
      >
        {status === 'loading' ? 'Checking…' : 'Check me'}
      </button>
      {status !== 'idle' && status !== 'loading' && (
        <span aria-live="polite" className={cn('truncate text-[11px]', STATUS_TONE[status] ?? 'text-muted-foreground')}>
          {detail || status.replace('_', ' ')}
        </span>
      )}
    </div>
  )
}
