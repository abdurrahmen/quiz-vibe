import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import TournamentBoard from './TournamentBoard'

export default async function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [{ data: tournament }, { data: players }, { data: matches }] = await Promise.all([
    supabase.from('tournaments').select('*').eq('id', id).single(),
    supabase.from('tournament_players').select('*').eq('tournament_id', id).order('created_at'),
    supabase.from('tournament_matches').select('*').eq('tournament_id', id).order('round').order('match_number'),
  ])

  if (!tournament) notFound()

  return (
    <TournamentBoard
      tournament={tournament}
      initialPlayers={players ?? []}
      initialMatches={matches ?? []}
    />
  )
}
