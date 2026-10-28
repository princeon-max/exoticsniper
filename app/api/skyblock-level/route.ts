import { getSkyblockLevels } from '@/lib/skycrypt'

export const maxDuration = 60

export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get('ids') ?? '').split(',').filter(Boolean)
  if (ids.length === 0 || ids.length > 48) {
    return Response.json({ ok: false, error: 'Pass 1-48 comma-separated UUIDs in ?ids=' }, { status: 400 })
  }
  return Response.json({ ok: true, ...(await getSkyblockLevels(ids)) })
}
