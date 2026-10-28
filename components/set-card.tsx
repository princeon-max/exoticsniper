'use client'

import { useFavourites } from '@/lib/favourites'
import type { ArmorSet, PieceSlot } from '@/lib/types'
import { ArmorSprite } from './armor-sprite'
import { CheckButton, FavouriteButton, HexSwatch, OwnerRow } from './card-parts'

const SLOTS: PieceSlot[] = ['helmet', 'chestplate', 'leggings', 'boots']

export function SetCard({ set }: { set: ArmorSet }) {
  const { hasSet, toggleSet } = useFavourites()
  const slots = SLOTS.filter((s) => set.pieces[s])

  return (
    <article className="flex flex-col gap-3 rounded-2xl border bg-card/70 p-4 transition hover:border-primary/30">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            {set.rarity && <span className="chip bg-background/60">{set.rarity}</span>}
            <span
              className={
                set.isExact ? 'chip border-success/30 bg-success/10 text-success' : 'chip border-primary/30 text-primary'
              }
            >
              {set.isExact ? 'Exact match' : `Avg ΔE ${(set.avgDist ?? 0).toFixed(2)}`}
            </span>
          </div>
          <h3 className="mt-1.5 truncate font-mono text-base font-semibold">{set.setLabel}</h3>
        </div>
        <FavouriteButton active={hasSet(set)} onClick={() => toggleSet(set)} label={set.setLabel} />
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {slots.map((slot) => {
          const p = set.pieces[slot]!
          return (
            <li key={slot} className="flex flex-col items-center gap-1 rounded-xl bg-background/50 p-2">
              <ArmorSprite piece={slot} color={p.color} size={48} label={p.name} />
              <span className="font-mono text-[10px] capitalize text-muted-foreground">{slot}</span>
              <span className="font-mono text-[11px]">{p.color ?? '—'}</span>
            </li>
          )
        })}
      </ul>
      <HexSwatch color={set.color} />
      <OwnerRow
        avatar={set.ownerAvatarUrl}
        uuid={set.ownerUuid}
        username={set.ownerUsername}
        skyCrypt={set.ownerSkyCryptUrl}
        mcuuid={set.ownerMcuuidUrl}
      />
      <CheckButton
        ownerUsername={set.ownerUsername}
        ownerUuid={set.ownerUuid}
        targets={slots.map((s) => set.pieces[s]!.uuid)}
      />
    </article>
  )
}
