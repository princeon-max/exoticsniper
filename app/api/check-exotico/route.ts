import { proxySniperPost } from '@/lib/upstream'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const ign = typeof body?.ign === 'string' ? body.ign.slice(0, 40) : null
  const ownerUuid = typeof body?.ownerUuid === 'string' ? body.ownerUuid.slice(0, 40) : null
  const targets = Array.isArray(body?.targets)
    ? body.targets.filter((t: unknown) => typeof t === 'string').slice(0, 4)
    : []
  if (!ign && !ownerUuid) {
    return Response.json({ status: 'api_off', detail: 'No player IGN/UUID is available for this record.' })
  }
  return proxySniperPost('/api/check-exotico', { ign, ownerUuid, targets })
}
