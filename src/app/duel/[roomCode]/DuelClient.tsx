'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Duel, Question, DuelProgress } from '@/lib/types'
import { submitDuelResult } from '../actions'
import DuelLobby from '@/components/duel/DuelLobby'
import DuelCountdown from '@/components/duel/DuelCountdown'
import DuelBattle from '@/components/duel/DuelBattle'
import DuelResults from '@/components/duel/DuelResults'

type GameState = 'lobby' | 'countdown' | 'playing' | 'waiting_for_opponent' | 'results'

interface DuelClientProps {
  duel: Duel
  questions: Question[]
  myRole: 'creator' | 'opponent'
  myUsername: string
}

export default function DuelClient({ duel, questions, myRole, myUsername }: DuelClientProps) {
  const [gameState, setGameState] = useState<GameState>(
    // If opponent already joined (e.g. page refresh), skip lobby
    duel.status === 'playing' && duel.opponent_name ? 'countdown' : 'lobby'
  )
  const [opponentJoined, setOpponentJoined] = useState(
    !!(duel.opponent_name && duel.status === 'playing')
  )
  const [myProgress, setMyProgress] = useState<DuelProgress>({ answered: 0, correct: 0 })
  const [opponentProgress, setOpponentProgress] = useState<DuelProgress>({ answered: 0, correct: 0 })
  const [myScore, setMyScore] = useState(0)
  const [myTimeMs, setMyTimeMs] = useState(0)
  const [opponentFinalScore, setOpponentFinalScore] = useState<number | null>(null)
  const [opponentFinalTimeMs, setOpponentFinalTimeMs] = useState<number | null>(null)
  const [liveDuel, setLiveDuel] = useState<Duel>(duel)
  const startTimeRef = useRef<number | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const supabase = createClient()

  const opponentName = myRole === 'creator'
    ? (liveDuel.opponent_name ?? 'Opponent')
    : liveDuel.creator_name

  // ─── Realtime Setup ───────────────────────────────────────────────
  useEffect(() => {
    const channelName = `duel:${duel.room_code}`
    const channel = supabase.channel(channelName, {
      config: { presence: { key: myUsername } },
    })
    channelRef.current = channel

    // ── Presence: detect when opponent joins ──
    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      if (key !== myUsername) {
        // Opponent joined!
        setOpponentJoined(true)
        if (gameState === 'lobby') {
          setTimeout(() => setGameState('countdown'), 800) // small delay for "Joined!" banner
        }
      }
    })

    channel.on('presence', { event: 'leave' }, ({ key }) => {
      // Could handle disconnection here
    })

    // ── Broadcast: receive opponent's answer events ──
    channel.on('broadcast', { event: 'answered' }, ({ payload }) => {
      const { correct } = payload as { q_index: number; correct: boolean }
      setOpponentProgress(prev => ({
        answered: prev.answered + 1,
        correct: prev.correct + (correct ? 1 : 0),
      }))
    })

    // ── Broadcast: opponent finished ──
    channel.on('broadcast', { event: 'finished' }, ({ payload }) => {
      const { score, time_ms } = payload as { score: number; time_ms: number }
      setOpponentFinalScore(score)
      setOpponentFinalTimeMs(time_ms)
      setGameState(prev =>
        prev === 'waiting_for_opponent' ? 'results' : prev
      )
    })

    // ── DB Changes: watch for duel status update (results) ──
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'duels', filter: `id=eq.${duel.id}` },
      (payload) => {
        const updated = payload.new as Duel
        setLiveDuel(updated)
        if (updated.status === 'finished') {
          // Set opponent scores from DB for reliability
          if (myRole === 'creator') {
            setOpponentFinalScore(updated.opponent_score)
            setOpponentFinalTimeMs(updated.opponent_time_ms)
          } else {
            setOpponentFinalScore(updated.creator_score)
            setOpponentFinalTimeMs(updated.creator_time_ms)
          }
          setGameState('results')
        }
        if (updated.status === 'playing' && updated.opponent_name) {
          setOpponentJoined(true)
          setGameState(prev => prev === 'lobby' ? 'countdown' : prev)
        }
      }
    )

    // Subscribe and announce presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          username: myUsername,
          role: myRole,
          online_at: new Date().toISOString(),
        })
      }
    })

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duel.id, duel.room_code, myUsername, myRole])

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleCountdownComplete = useCallback(() => {
    startTimeRef.current = Date.now()
    setGameState('playing')
  }, [])

  const handleAnswer = useCallback((questionIndex: number, _selectedOption: number, isCorrect: boolean) => {
    // Update my own progress
    setMyProgress(prev => ({
      answered: prev.answered + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
    }))
    if (isCorrect) setMyScore(prev => prev + 1)

    // Broadcast to opponent
    channelRef.current?.send({
      type: 'broadcast',
      event: 'answered',
      payload: { q_index: questionIndex, correct: isCorrect },
    })
  }, [])

  const handleFinished = useCallback(async () => {
    const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0
    setMyTimeMs(elapsed)

    // Transition state
    setGameState('waiting_for_opponent')

    // Broadcast to opponent
    channelRef.current?.send({
      type: 'broadcast',
      event: 'finished',
      payload: { score: myScore, time_ms: elapsed },
    })

    // Persist to DB
    await submitDuelResult(duel.id, myRole, myScore, elapsed)

    // If opponent already finished (we received their broadcast), go to results
    setOpponentFinalScore(prev => {
      if (prev !== null) setGameState('results')
      return prev
    })
  }, [duel.id, myRole, myScore])

  // ─── Render State Machine ──────────────────────────────────────────
  if (gameState === 'lobby') {
    return (
      <DuelLobby
        duel={liveDuel}
        myRole={myRole}
        myUsername={myUsername}
        opponentJoined={opponentJoined}
      />
    )
  }

  if (gameState === 'countdown') {
    return <DuelCountdown onComplete={handleCountdownComplete} />
  }

  if (gameState === 'playing') {
    return (
      <DuelBattle
        questions={questions}
        myUsername={myUsername}
        opponentName={opponentName}
        myProgress={myProgress}
        opponentProgress={opponentProgress}
        onAnswer={handleAnswer}
        onFinished={handleFinished}
      />
    )
  }

  if (gameState === 'waiting_for_opponent' || gameState === 'results') {
    return (
      <DuelResults
        duel={liveDuel}
        myRole={myRole}
        myUsername={myUsername}
        myScore={myScore}
        myTimeMs={myTimeMs}
        opponentScore={opponentFinalScore}
        opponentTimeMs={opponentFinalTimeMs}
        waitingForOpponent={gameState === 'waiting_for_opponent'}
      />
    )
  }

  return null
}
