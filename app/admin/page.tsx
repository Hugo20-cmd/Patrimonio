import { getAdminStats } from '@/app/actions/admin'
import { redirect } from 'next/navigation'
import AdminClient from './admin-client'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const data = await getAdminStats()

  if (data.error || !data.success) {
    redirect('/dashboard')
  }

  return <AdminClient 
    stats={data.stats} 
    latestUsers={data.latestUsers} 
    feedbacks={data.feedbacks} 
  />
}

// Trigger HMR
