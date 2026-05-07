'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Generate a short, readable room code like "QM-4X9B"
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'QM-'
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function createDuel(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const creatorName = formData.get('creator_name') as string
  const categoryId = formData.get('category_id') as string || null
  const difficulty = formData.get('difficulty') as string || 'mixed'
  const mode = (formData.get('mode') as string) || 'standard'

  if (!creatorName?.trim()) {
    return { error: 'Please enter your username.' }
  }

  let selectedIds: string[] = []

  // Blitz uses a dynamic infinite stream — no pre-selected questions needed
  if (mode !== 'blitz') {
    let query = supabase.from('questions').select('id')
    if (categoryId) query = query.eq('category_id', categoryId)
    if (difficulty !== 'mixed') query = query.eq('difficulty', difficulty)

    const { data: allQuestions, error: qErr } = await query
    if (qErr || !allQuestions || allQuestions.length < 5) {
      return { error: 'Not enough questions found for these filters. Try "Mixed" difficulty or a different category.' }
    }

    const shuffled = allQuestions.sort(() => Math.random() - 0.5)
    selectedIds = shuffled.slice(0, Math.min(10, shuffled.length)).map(q => q.id)
  }

  // Generate unique room code
  let roomCode = generateRoomCode()
  let attempts = 0
  while (attempts < 10) {
    const { data: existing } = await supabase
      .from('duels').select('id').eq('room_code', roomCode).single()
    if (!existing) break
    roomCode = generateRoomCode()
    attempts++
  }

  const { data: duel, error } = await supabase
    .from('duels')
    .insert([{
      room_code: roomCode,
      creator_name: creatorName.trim(),
      category_id: categoryId,
      difficulty,
      mode,
      question_ids: selectedIds,
      status: 'waiting',
    }])
    .select()
    .single()

  if (error) return { error: error.message }

  redirect(`/duel/${roomCode}?role=creator&username=${encodeURIComponent(creatorName.trim())}`)
}

export async function joinDuel(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const opponentName = formData.get('opponent_name') as string
  const roomCode = (formData.get('room_code') as string)?.toUpperCase().trim()

  if (!opponentName?.trim()) return { error: 'Please enter your username.' }
  if (!roomCode) return { error: 'Please enter a room code.' }

  // Find the duel
  const { data: duel, error: findErr } = await supabase
    .from('duels')
    .select('*')
    .eq('room_code', roomCode)
    .single()

  if (findErr || !duel) return { error: `Room "${roomCode}" not found. Double-check the code.` }
  if (duel.status !== 'waiting') return { error: 'This duel has already started or finished.' }
  if (duel.creator_name === opponentName.trim()) return { error: 'You cannot join your own duel. Use a different username.' }

  // Update the duel to add the opponent
  const { error: updateErr } = await supabase
    .from('duels')
    .update({ opponent_name: opponentName.trim(), status: 'playing', started_at: new Date().toISOString() })
    .eq('id', duel.id)

  if (updateErr) return { error: updateErr.message }

  redirect(`/duel/${roomCode}?role=opponent&username=${encodeURIComponent(opponentName.trim())}`)
}

export async function fetchBlitzQuestions(
  categoryId: string | null,
  difficulty: string,
  excludeIds: string[]
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let query = supabase.from('questions').select('id, question_text, type, options, correct_answers, explanation, points, difficulty')

  if (categoryId) query = query.eq('category_id', categoryId)
  if (difficulty !== 'mixed') query = query.eq('difficulty', difficulty)
  if (excludeIds.length > 0) query = query.not('id', 'in', `(${excludeIds.join(',')})`)

  const { data, error } = await query.limit(200)
  if (error || !data) return { error: error?.message || 'Failed to load questions', questions: [] }

  const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 30)
  return { questions: shuffled }
}

/**
 * Category Wars: record a player's category pick.
 * When both players have picked, interleave questions and mark the duel ready.
 */
export async function setCategoryWarsPick(
  duelId: string,
  role: 'creator' | 'opponent',
  categoryId: string
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const readyField = role === 'creator' ? 'creator_wars_ready' : 'opponent_wars_ready'
  const categoryField = role === 'creator' ? 'creator_category_id' : 'opponent_category_id'

  // Save the pick
  const { error: updateErr } = await supabase
    .from('duels')
    .update({ [categoryField]: categoryId, [readyField]: true })
    .eq('id', duelId)

  if (updateErr) return { error: updateErr.message }

  // Fetch the latest duel to check if both are ready
  const { data: duel, error: fetchErr } = await supabase
    .from('duels').select('*').eq('id', duelId).single()
  if (fetchErr || !duel) return { error: 'Duel not found.' }

  const bothReady = duel.creator_wars_ready && duel.opponent_wars_ready

  if (bothReady) {
    // Interleave questions: 5 from creator's category + 5 from opponent's
    const [creatorQs, opponentQs] = await Promise.all([
      supabase.from('questions').select('id').eq('category_id', duel.creator_category_id).limit(100),
      supabase.from('questions').select('id').eq('category_id', duel.opponent_category_id).limit(100),
    ])

    const shuffle = (arr: { id: string }[]) => arr.sort(() => Math.random() - 0.5).slice(0, 5).map(q => q.id)
    const creatorIds = shuffle(creatorQs.data || [])
    const opponentIds = shuffle(opponentQs.data || [])

    // Interleave: [c0, o0, c1, o1, c2, o2, c3, o3, c4, o4]
    const interleaved: string[] = []
    for (let i = 0; i < Math.max(creatorIds.length, opponentIds.length); i++) {
      if (creatorIds[i]) interleaved.push(creatorIds[i])
      if (opponentIds[i]) interleaved.push(opponentIds[i])
    }

    const { error: qUpdateErr } = await supabase
      .from('duels')
      .update({ question_ids: interleaved, status: 'playing', started_at: new Date().toISOString() })
      .eq('id', duelId)

    if (qUpdateErr) return { error: qUpdateErr.message }
    return { success: true, bothReady: true }
  }

  return { success: true, bothReady: false }
}

export async function submitDuelResult(
  duelId: string,
  role: 'creator' | 'opponent',
  score: number,
  timeMs: number,
  opponentScore?: number | null
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const updatePayload: Record<string, unknown> = role === 'creator'
    ? { creator_score: score, creator_time_ms: timeMs }
    : { opponent_score: score, opponent_time_ms: timeMs }

  const { data: duel, error: fetchErr } = await supabase
    .from('duels')
    .select('*')
    .eq('id', duelId)
    .single()

  if (fetchErr || !duel) return { error: 'Duel not found.' }

  // If both have finished, determine winner
  const bothFinished =
    (role === 'creator' && duel.opponent_score !== null) ||
    (role === 'opponent' && duel.creator_score !== null)

  if (bothFinished) {
    const creatorScore = role === 'creator' ? score : duel.creator_score!
    const opponentScoreFinal = role === 'opponent' ? score : duel.opponent_score!
    const creatorTime = role === 'creator' ? timeMs : duel.creator_time_ms!
    const opponentTime = role === 'opponent' ? timeMs : duel.opponent_time_ms!

    let winnerName: string | null = null
    if (creatorScore > opponentScoreFinal) winnerName = duel.creator_name
    else if (opponentScoreFinal > creatorScore) winnerName = duel.opponent_name
    else winnerName = creatorTime <= opponentTime ? duel.creator_name : duel.opponent_name // tiebreaker: faster wins

    updatePayload.status = 'finished'
    updatePayload.winner_name = winnerName
    updatePayload.finished_at = new Date().toISOString()
  }

  const { error } = await supabase.from('duels').update(updatePayload).eq('id', duelId)
  if (error) return { error: error.message }

  return { success: true }
}
