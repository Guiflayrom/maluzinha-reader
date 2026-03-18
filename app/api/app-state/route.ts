import { getAppData } from '@/lib/server/app-state'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const data = await getAppData()

  return Response.json(data, {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
