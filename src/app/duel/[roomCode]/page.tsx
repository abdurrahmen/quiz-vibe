import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import DuelClient from './DuelClient'

export default async function DuelRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomCode: string }>
  searchParams: Promise<{ role?: string; username?: string }>
}) {
  const { roomCode } = await params
  const { role, username } = await searchParams

  if (!role || !username || (role !== 'creator' && role !== 'opponent')) {
    redirect(`/duel?error=invalid_access`)
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch the duel
  const { data: duel, error } = await supabase
    .from('duels')
    .select('*')
    .eq('room_code', roomCode.toUpperCase())
    .single()

  if (error || !duel) notFound()

  // Fetch categories (needed for Category Wars setup)
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, icon, color, question_count:questions(count)')
    .order('name')

  // Fetch the actual question objects (in the order stored)
  let orderedQuestions: object[] = []
  if (duel.question_ids && duel.question_ids.length > 0) {
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .in('id', duel.question_ids)

    orderedQuestions = duel.question_ids
      .map((id: string) => questions?.find((q) => q.id === id))
      .filter(Boolean)
  }

  return (
    <DuelClient
      duel={duel}
      questions={orderedQuestions as Parameters<typeof DuelClient>[0]['questions']}
      categories={(categories || []).map(c => ({
        ...c,
        description: null,
        created_at: '',
        question_count: Array.isArray(c.question_count) ? (c.question_count[0] as { count: number })?.count ?? 0 : 0,
      }))}
      myRole={role as 'creator' | 'opponent'}
      myUsername={decodeURIComponent(username)}
    />
  )
}
