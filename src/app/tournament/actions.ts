'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// ── Helpers ─────────────────────────────────────────────────────────

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'QM-'
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length))
  return code
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getUniqueRoomCode(supabase: any): Promise<string> {
  let roomCode = generateRoomCode()
  for (let i = 0; i < 10; i++) {
    const { data } = await supabase.from('duels').select('id').eq('room_code', roomCode).single()
    if (!data) break
    roomCode = generateRoomCode()
  }
  return roomCode
}

// ── Public Actions ──────────────────────────────────────────────────

export async function createTournament(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const categoryId = (formData.get('category_id') as string) || null
  const difficulty = (formData.get('difficulty') as string) || 'mixed'
  const mode = (formData.get('mode') as string) || 'standard'
  const maxPlayers = parseInt(formData.get('max_players') as string) || 8

  if (!title) return { error: 'Tournament title is required.' }

  const { data, error } = await supabase
    .from('tournaments')
    .insert([{ title, description, category_id: categoryId, difficulty, mode, max_players: maxPlayers }])
    .select()
    .single()

  if (error) return { error: error.message }
  return { tournament: data }
}

export async function registerForTournament(tournamentId: string, username: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  if (!username?.trim()) return { error: 'Please enter your username.' }

  // Check tournament exists and is still open
  const { data: tournament, error: tErr } = await supabase
    .from('tournaments').select('*').eq('id', tournamentId).single()
  if (tErr || !tournament) return { error: 'Tournament not found.' }
  if (tournament.status !== 'registration') return { error: 'Registration is closed for this tournament.' }

  // Check capacity
  const { count } = await supabase
    .from('tournament_players')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', tournamentId)
  if ((count ?? 0) >= tournament.max_players) return { error: 'This tournament is full.' }

  // Register
  const { error } = await supabase
    .from('tournament_players')
    .insert([{ tournament_id: tournamentId, username: username.trim() }])
  if (error) {
    if (error.code === '23505') return { error: 'This username is already registered.' }
    return { error: error.message }
  }

  return { success: true }
}

export async function startTournament(tournamentId: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch tournament + players
  const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single()
  if (!tournament) return { error: 'Tournament not found.' }

  const { data: players } = await supabase
    .from('tournament_players').select('*').eq('tournament_id', tournamentId).order('created_at')
  if (!players || players.length < 2) return { error: 'Need at least 2 players to start.' }

  // Shuffle and assign seeds
  const shuffled = [...players].sort(() => Math.random() - 0.5)
  await Promise.all(shuffled.map((p, i) =>
    supabase.from('tournament_players').update({ seed: i + 1 }).eq('id', p.id)
  ))

  // Generate Round 1 matchups
  // 4-player: (1v4), (2v3) → 2 matches
  // 8-player: (1v8), (2v7), (3v6), (4v5) → 4 matches
  const n = shuffled.length
  const half = Math.floor(n / 2)
  const matchInserts = []

  for (let i = 0; i < half; i++) {
    const p1 = shuffled[i]
    const p2 = shuffled[n - 1 - i]

    // Create a duel room for each match
    const roomCode = await getUniqueRoomCode(supabase)

    const { data: duel } = await supabase.from('duels').insert([{
      room_code: roomCode,
      creator_name: p1.username,
      opponent_name: p2.username,
      mode: tournament.mode,
      category_id: tournament.category_id,
      difficulty: tournament.difficulty,
      question_ids: [],
      status: 'waiting',
    }]).select().single()

    matchInserts.push({
      tournament_id: tournamentId,
      round: 1,
      match_number: i + 1,
      player1_name: p1.username,
      player2_name: p2.username,
      duel_id: duel?.id ?? null,
      room_code: roomCode,
      status: 'in_progress',
    })
  }

  await supabase.from('tournament_matches').insert(matchInserts)
  await supabase.from('tournaments').update({
    status: 'in_progress',
    started_at: new Date().toISOString(),
  }).eq('id', tournamentId)

  return { success: true }
}

export async function reportMatchResult(matchId: string, winnerName: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Mark match finished
  const { data: match, error: matchErr } = await supabase
    .from('tournament_matches')
    .update({ winner_name: winnerName, status: 'finished', finished_at: new Date().toISOString() })
    .eq('id', matchId)
    .select()
    .single()

  if (matchErr || !match) return { error: 'Match not found.' }

  // Fetch the parent tournament (needed for mode/difficulty when creating next-round duels)
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', match.tournament_id)
    .single()

  // Increment winner's win count (read current wins, then write +1)
  const { data: winnerPlayer } = await supabase
    .from('tournament_players')
    .select('wins')
    .eq('tournament_id', match.tournament_id)
    .eq('username', winnerName)
    .single()
  await supabase.from('tournament_players')
    .update({ wins: (winnerPlayer?.wins ?? 0) + 1 })
    .eq('tournament_id', match.tournament_id)
    .eq('username', winnerName)

  // Mark loser as eliminated
  const loserName = match.player1_name === winnerName ? match.player2_name : match.player1_name
  if (loserName) {
    await supabase.from('tournament_players')
      .update({ status: 'eliminated' })
      .eq('tournament_id', match.tournament_id)
      .eq('username', loserName)
  }

  // Check if all matches in this round are done
  const { data: allRoundMatches } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', match.tournament_id)
    .eq('round', match.round)

  const allDone = allRoundMatches?.every(m => m.status === 'finished' || m.status === 'bye')

  if (allDone) {
    const winners = allRoundMatches!
      .filter(m => m.status === 'finished')
      .map(m => m.winner_name!)

    if (winners.length === 1) {
      // Tournament over!
      await supabase.from('tournaments')
        .update({ status: 'finished', winner_name: winners[0], finished_at: new Date().toISOString() })
        .eq('id', match.tournament_id)
      await supabase.from('tournament_players')
        .update({ status: 'champion' })
        .eq('tournament_id', match.tournament_id)
        .eq('username', winners[0])
    } else {
      // Generate next round
      const nextRound = match.round + 1
      const nextMatchInserts = []

      for (let i = 0; i < winners.length; i += 2) {
        const p1 = winners[i]
        const p2 = winners[i + 1] ?? null

        const roomCode = p2 ? await getUniqueRoomCode(supabase) : null
        let duelId = null

        if (p2 && roomCode) {
          const { data: duel } = await supabase.from('duels').insert([{
            room_code: roomCode,
            creator_name: p1,
            opponent_name: p2,
            mode: tournament?.mode ?? 'standard',
            question_ids: [],
            status: 'waiting',
          }]).select().single()
          duelId = duel?.id ?? null
        }

        nextMatchInserts.push({
          tournament_id: match.tournament_id,
          round: nextRound,
          match_number: Math.floor(i / 2) + 1,
          player1_name: p1,
          player2_name: p2,
          duel_id: duelId,
          room_code: roomCode,
          status: p2 ? 'in_progress' : 'bye',
          ...(p2 ? {} : { winner_name: p1, finished_at: new Date().toISOString() }),
        })
      }

      await supabase.from('tournament_matches').insert(nextMatchInserts)
    }
  }

  return { success: true }
}
