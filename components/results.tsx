import { AlertTriangle, Loader2, Search } from 'lucide-react'

export function ResultsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby="results-title" className="mt-8">
      <p className="eyebrow">Results</p>
      <h2 id="results-title" className="mt-1 font-mono text-xl font-semibold">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function Notice({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'error' | 'loading'
  title: string
  children?: React.ReactNode
}) {
  const Icon = tone === 'error' ? AlertTriangle : tone === 'loading' ? Loader2 : Search
  return (
    <div className="panel mt-4 flex items-start gap-3 p-4" role={tone === 'error' ? 'alert' : undefined}>
      <span
        className={
          tone === 'error'
            ? 'flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive'
            : 'flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'
        }
      >
        <Icon className={tone === 'loading' ? 'size-4 animate-spin' : 'size-4'} aria-hidden />
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {children && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{children}</p>}
      </div>
    </div>
  )
}

export function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-4 font-mono text-sm">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="rounded-full border px-4 py-2 transition hover:border-primary/40 disabled:opacity-40"
      >
        ← Previous
      </button>
      <span className="text-muted-foreground">
        Page <strong className="text-foreground">{page}</strong> of{' '}
        <strong className="text-foreground">{totalPages.toLocaleString()}</strong>
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="rounded-full border px-4 py-2 transition hover:border-primary/40 disabled:opacity-40"
      >
        Next →
      </button>
    </nav>
  )
}
