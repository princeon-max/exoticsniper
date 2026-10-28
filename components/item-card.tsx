'use client'

import { Shield } from 'lucide-react'
import { useFavourites } from '@/lib/favourites'
import { pieceFromName } from '@/lib/query'
import type { ArmorItem } from '@/lib/types'
import { ArmorSprite } from './armor-sprite'
import { CheckButton, FavouriteButton, HexSwatch, HexTypeChip, OwnerRow, SourceChip } from './card-parts'

export function ItemCard({
  item,
  showSource = false,
  level,
  showLevel = false,
}: {
  item: ArmorItem
  showSource?: boolean
  level?: number | null
  showLevel?: boolean
}) {
  const { hasItem, toggleItem } = useFavourites()
  const piece = pieceFromName(item.name)

  return (
    <article className="flex overflow-hidden rounded-2xl border bg-card/70 transition hover:border-primary/30">
      <div className="flex w-24 shrink-0 items-center justify-center bg-background/50 sm:w-28">
        {piece ? (
          <ArmorSprite piece={piece} color={item.color} label={item.name} />
        ) : (
          <Shield className="size-10" style={{ color: item.color ?? undefined }} aria-hidden />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5">
              {item.rarity && <span className="chip bg-background/60 text-foreground">{item.rarity}</span>}
              <HexTypeChip hexType={item.hexType} isExotic={item.isExotic} />
              {showSource && <SourceChip source={item.source} />}
            </div>
            <h3 className="mt-1.5 truncate font-mono text-base font-semibold">{item.name}</h3>
          </div>
          <FavouriteButton active={hasItem(item.uuid)} onClick={() => toggleItem(item)} label={item.name} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <HexSwatch color={item.color} />
          <span className="flex gap-1.5">
            {typeof item.deltaE === 'number' && (
              <span className="chip border-primary/20 text-primary">ΔE {item.deltaE.toFixed(2)}</span>
            )}
            {item.reforge && <span className="chip bg-background/60">{item.reforge}</span>}
          </span>
        </div>
        {(item.profile || item.colorName) && (
          <p className="truncate text-[11px] text-muted-foreground">
            {[item.colorName, item.profile && `Profile: ${item.profile}`].filter(Boolean).join(' · ')}
          </p>
        )}
        <OwnerRow
          avatar={item.ownerAvatarUrl}
          uuid={item.ownerUuid}
          username={item.ownerUsername}
          skyCrypt={item.ownerSkyCryptUrl}
          mcuuid={item.ownerMcuuidUrl}
          level={level}
          showLevel={showLevel}
        />
        <CheckButton ownerUsername={item.ownerUsername} ownerUuid={item.ownerUuid} targets={[item.uuid]} />
      </div>
    </article>
  )
}
