'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Duel, Question, DuelProgress } from '@/lib/types'
import { submitDuelResult } from '../actions'
import DuelLobby from '@/components/duel/DuelLobby'
import DuelCountdown from '@/components/duel/DuelCountdown'
import DuelBattle from '@/components/duel/DuelBattle'
import DuelResults from '@/components/duel/DuelResults'
import BlitzBattle from '@/components/duel/BlitzBattle'
import BlitzResults from '@/components/duel/BlitzResults'

type GameState = 'lobby' | 'countdown' | 'playing' | 'waiting_for_opponent' | 'results'

interface DuelClientProps {
  duel: Duel
  questions: Question[]
  myRole: 'creator' | 'opponent'
  myUsername: string
}

export default function DuelClient({ duel, questions, myRole, myUsername }: DuelClientProps) {
  const isBlitz = duel.mode === 'blitz'

  const [gameState, setGameState] = useState<GameState>(
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

  // ─── Realtime Setup ─────────────────────────────────────────────────
  useEffect(() => {
    const channelName = `duel:${duel.room_code}`
    const channel = supabase.channel(channelName, {
      config: { presence: { key: myUsername } },
    })
    channelRef.current = channel

    // Presence: opponent joins lobby
    channel.on('presence', { event: 'join' }, ({ key }) => {
      if (key !== myUsername) {
        setOpponentJoined(true)
        setTimeout(() => setGameState(s => s === 'lobby' ? 'countdown' : s), 800)
      }
    })

    // Broadcast: opponent answered a question
    channel.on('broadcast', { event: 'answered' }, ({ payload }) => {
      const { correct } = payload as { q_index: number; correct: boolean }
      setOpponentProgress(prev => ({
        answered: prev.answered + 1,
        correct: prev.correct + (correct ? 1 : 0),
      }))
    })

    // Broadcast: opponent finished
    channel.on('broadcast', { event: 'finished' }, ({ payload }) => {
      const { score, time_ms } = payload as { score: number; time_ms: number }
      setOpponentFinalScore(score)
      setOpponentFinalTimeMs(time_ms)
      setGameState(prev => prev === 'waiting_for_opponent' ? 'results' : prev)
    })

    // DB Changes: watch for duel status = finished (fallback for reliability)
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'duels', filter: `id=eq.${duel.id}` },
      (payload) => {
        const updated = payload.new as Duel
        setLiveDuel(updated)
        if (updated.status === 'finished') {
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

  // ─── Handlers ───────────────────────────────────────────────────────
  const handleCountdownComplete = useCallback(() => {
    startTimeRef.current = Date.now()
    setGameState('playing')
  }, [])

  // Standard mode: per-question answer tracking
  const handleAnswer = useCallback((questionIndex: number, _selectedOption: number, isCorrect: boolean) => {
    setMyProgress(prev => ({
      answered: prev.answered + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
    }))
    if (isCorrect) setMyScore(prev => prev + 1)

    channelRef.current?.send({
      type: 'broadcast',
      event: 'answered',
      payload: { q_index: questionIndex, correct: isCorrect },
    })
  }, [])

  // Blitz mode: simplified answer event (score managed in BlitzBattle)
  const handleBlitzAnswer = useCallback((_idx: number, isCorrect: boolean) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'answered',
      payload: { q_index: _idx, correct: isCorrect },
    })
  }, [])

  // Standard finish
  const handleFinished = useCallback(async () => {
    const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0
    setMyTimeMs(elapsed)
    setGameState('waiting_for_opponent')

    channelRef.current?.send({
      type: 'broadcast',
      event: 'finished',
      payload: { score: myScore, time_ms: elapsed },
    })

    await submitDuelResult(duel.id, myRole, myScore, elapsed)

    setOpponentFinalScore(prev => {
      if (prev !== null) setGameState('results')
      return prev
    })
  }, [duel.id, myRole, myScore])

  // Blitz finish — score & time passed directly from BlitzBattle
  const handleBlitzFinished = useCallback(async (score: number, timeMs: number) => {
    setMyScore(score)
    setMyTimeMs(timeMs)
    setGameState('waiting_for_opponent')

    channelRef.current?.send({
      type: 'broadcast',
      event: 'finished',
      payload: { score, time_ms: timeMs },
    })

    await submitDuelResult(duel.id, myRole, score, timeMs)

    setOpponentFinalScore(prev => {
      if (prev !== null) setGameState('results')
      return prev
    })
  }, [duel.id, myRole])

  // ─── Render State Machine ────────────────────────────────────────────
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
    if (isBlitz) {
      return (
        <BlitzBattle
          duel={liveDuel}
          myUsername={myUsername}
          opponentName={opponentName}
          opponentProgress={opponentProgress}
          onAnswer={handleBlitzAnswer}
          onFinished={handleBlitzFinished}
        />
      )
    }

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
    if (isBlitz) {
      return (
        <BlitzResults
          duel={liveDuel}
          myRole={myRole}
          myUsername={myUsername}
          myScore={myScore}
          opponentScore={opponentFinalScore}
          waitingForOpponent={gameState === 'waiting_for_opponent'}
        />
      )
    }

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
