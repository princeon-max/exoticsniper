import { ItemSearch } from '@/components/item-search'

export default function Page() {
  return (
    <ItemSearch
      endpoint="/api/search"
      idPrefix="items"
      eyebrow="Item search"
      title="Find a specific exotic"
      namePlaceholder="e.g. Old Dragon, Stereo Pants, Lapis"
      resultsTitle="Database items"
      hint="Try an item name, a six-digit hex, or both. Fairy and Crystal colours stay hidden unless you include them."
    />
  )
}
