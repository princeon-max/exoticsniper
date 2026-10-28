import { proxySniper } from '@/lib/upstream'

export async function GET(req: Request) {
  return proxySniper('/api/search', new URL(req.url).searchParams)
}
