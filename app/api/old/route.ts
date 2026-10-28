import { proxySniper } from '@/lib/upstream'

export async function GET(req: Request) {
  return proxySniper('/api/old', new URL(req.url).searchParams)
}
