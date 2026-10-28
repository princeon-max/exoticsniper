import type { Metadata } from 'next'
import { SetsSearch } from '@/components/sets-search'

export const metadata: Metadata = {
  title: 'Sets',
  description: 'Find complete armour sets owned by the same player, ranked by CIEDE2000 (ΔE) colour distance.',
}

export default function SetsPage() {
  return <SetsSearch />
}
