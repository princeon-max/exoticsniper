import type { Metadata } from 'next'
import { FavouritesList } from '@/components/favourites-list'

export const metadata: Metadata = {
  title: 'Favourites',
  description: 'Your saved exotic pieces and complete sets.',
}

export default function FavouritesPage() {
  return <FavouritesList />
}
