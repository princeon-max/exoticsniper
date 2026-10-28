import { lookupPlayer } from '@/lib/upstream'

export const maxDuration = 90

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? ''
  if (!/^[A-Za-z0-9_-]{1,36}$/.test(q)) {
    return Response.json({ ok: false, error: 'Enter a valid username or UUID.' }, { status: 400 })
  }
  const result = await lookupPlayer(q)
  return Response.json(result, { status: result.ok ? 200 : 404 })
}
