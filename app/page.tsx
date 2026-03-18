import { AppClient } from '@/components/app-client'
import { getAppData } from '@/lib/server/app-state'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default async function Home() {
  const initialData = await getAppData()

  return <AppClient initialData={initialData} />
}
