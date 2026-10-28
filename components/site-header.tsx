'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/', label: 'All Items' },
  { href: '/sets', label: 'Sets' },
  { href: '/favourites', label: 'Favourites' },
  { href: '/old', label: 'Old Dragon' },
  { href: '/players', label: 'Players' },
]

export function SiteHeader() {
  const pathname = usePathname()
  return (
    <header>
      <div className="flex items-start gap-4">
        <div
          aria-hidden
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary font-mono text-lg font-bold text-primary-foreground shadow-[0_0_30px_-6px] shadow-primary/60"
        >
          P
        </div>
        <div className="min-w-0">
          <p className="eyebrow">Hypixel SkyBlock exotics database</p>
          <h1 className="mt-1 font-mono text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Princeon&apos;s Exotics
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">
            Search armour by name and colour, rank nearby hexes by CIEDE2000 (ΔE), and look up any player across
            both the sniper and Exotico databases.
          </p>
        </div>
      </div>
      <nav aria-label="Main navigation" className="mt-6 flex flex-wrap gap-2">
        {NAV.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-full border px-4 py-2 font-mono text-sm transition',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
