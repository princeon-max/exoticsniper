import type { Metadata } from 'next'
import { ItemSearch } from '@/components/item-search'

export const metadata: Metadata = {
  title: 'Old Dragon',
  description: 'Browse Old Dragon pieces by item name and perceptual CIEDE2000 (ΔE) colour distance.',
}

export default function OldPage() {
  return (
    <ItemSearch
      endpoint="/api/old"
      idPrefix="old"
      eyebrow="Old Dragon"
      title="Browse Old Dragon pieces"
      namePlaceholder="Item name (e.g. Old Dragon Boots)"
      resultsTitle="Old Dragon pieces"
      hint="Enter an item name or a hex to filter."
    />
  )
}
