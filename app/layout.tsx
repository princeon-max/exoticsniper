import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SiteHeader } from '@/components/site-header'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: { default: "Princeon's Exotics", template: "%s — Princeon's Exotics" },
  description:
    'Hypixel SkyBlock exotic armour database. Search by name and hex with CIEDE2000 colour matching, find full sets, and look up players across the sniper and Exotico databases.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0f1a20',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh antialiased">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
          <SiteHeader />
          <main className="mt-8">{children}</main>
          <footer className="mt-16 border-t pt-6 text-xs text-muted-foreground">
            Item data from the sniper database, with player collections merged in from{' '}
            <a href="https://exotico.flori.tv" className="text-primary hover:underline" target="_blank" rel="noreferrer">
              Exotico
            </a>
            . Not affiliated with Hypixel.
          </footer>
        </div>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
