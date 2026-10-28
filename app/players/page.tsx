import type { Metadata } from 'next'
import { PlayerLookup } from '@/components/player-lookup'

export const metadata: Metadata = {
  title: 'Players',
  description: 'Look up any Hypixel SkyBlock player across the sniper and Exotico exotic armour databases.',
}

export default function PlayersPage() {
  return <PlayerLookup />
}
