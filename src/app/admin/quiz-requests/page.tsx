import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import QuizRequestsClient from './QuizRequestsClient'

export default async function AdminQuizRequests() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: requests } = await supabase
    .from('quiz_requests')
    .select('*, category:categories(name, icon, color)')
    .order('created_at', { ascending: false })

  const allRequests = requests || []

  const stats = {
    total: allRequests.length,
    pending: allRequests.filter(r => r.status === 'pending').length,
    approved: allRequests.filter(r => r.status === 'approved').length,
    rejected: allRequests.filter(r => r.status === 'rejected').length,
  }

  return <QuizRequestsClient initialRequests={allRequests} stats={stats} />
}
