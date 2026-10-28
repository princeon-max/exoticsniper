export type Filters = { includeFairy: boolean; includeCrystal: boolean }

export type ItemSource = 'sniper' | 'exotico' | 'both'

export type ArmorItem = {
  id?: number | string
  uuid: string
  name: string
  color: string | null
  rarity: string | null
  reforge?: string | null
  ownerUuid: string | null
  ownerUsername: string | null
  ownerAvatarUrl: string | null
  ownerMcuuidUrl: string | null
  ownerSkyCryptUrl: string | null
  hexType: string | null
  isExotic: boolean
  deltaE: number | null
  source?: ItemSource
  profile?: string | null
  colorName?: string | null
  variant?: string | null
}

export type Paged<T> = {
  ok: boolean
  page: number
  limit: number
  total: number
  totalPages: number
  items: T[]
  error?: string
}

export type PieceSlot = 'helmet' | 'chestplate' | 'leggings' | 'boots'

export type SetPiece = { uuid: string; name: string; color: string | null; hexType: string | null }

export type ArmorSet = {
  setLabel: string
  color: string | null
  rarity: string | null
  ownerUuid: string | null
  ownerUsername: string | null
  ownerAvatarUrl: string | null
  ownerMcuuidUrl: string | null
  ownerSkyCryptUrl: string | null
  isExact: boolean
  avgDist: number | null
  pieces: Record<PieceSlot, SetPiece | null>
}

export type SourceStatus = {
  status: 'ok' | 'error' | 'not_configured' | 'not_found'
  count: number
  message?: string
}

export type PlayerLookupResult = {
  ok: boolean
  error?: string
  uuid: string | null
  name: string | null
  items: ArmorItem[]
  sources: { sniper: SourceStatus; exotico: SourceStatus }
  exotico?: { highestLevel: number | null; cachedAt: string | null }
}
