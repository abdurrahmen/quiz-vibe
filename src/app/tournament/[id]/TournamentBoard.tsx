'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Tournament, TournamentPlayer, TournamentMatch } from '@/lib/types'
import BracketView from '@/components/tournament/BracketView'
import { registerForTournament } from '@/app/tournament/actions'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'

interface TournamentBoardProps {
  tournament: Tournament
  initialPlayers: TournamentPlayer[]
  initialMatches: TournamentMatch[]
}

export default function TournamentBoard({ tournament: initialTournament, initialPlayers, initialMatches }: TournamentBoardProps) {
  const [tournament, setTournament] = useState(initialTournament)
  const [players, setPlayers] = useState(initialPlayers)
  const [matches, setMatches] = useState(initialMatches)
  const [username, setUsername] = useState('')
  const [regError, setRegError] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)

  const spotsLeft = tournament.max_players - players.length
  const isRegistrationOpen = tournament.status === 'registration'
  const totalRounds = tournament.max_players === 8 ? 3 : 2

  const currentRound = matches.length > 0
    ? Math.max(...matches.filter(m => m.status !== 'pending').map(m => m.round), 1)
    : 1

  // ── Realtime subscriptions ──────────────────────────────────────
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`tournament:${tournament.id}`)

    channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tournaments', filter: `id=eq.${tournament.id}` }, payload => {
      setTournament(payload.new as Tournament)
    })
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tournament_players', filter: `tournament_id=eq.${tournament.id}` }, payload => {
      setPlayers(prev => [...prev, payload.new as TournamentPlayer])
    })
    channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tournament_players', filter: `tournament_id=eq.${tournament.id}` }, payload => {
      setPlayers(prev => prev.map(p => p.id === payload.new.id ? payload.new as TournamentPlayer : p))
    })
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tournament_matches', filter: `tournament_id=eq.${tournament.id}` }, payload => {
      setMatches(prev => [...prev, payload.new as TournamentMatch])
    })
    channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tournament_matches', filter: `tournament_id=eq.${tournament.id}` }, payload => {
      setMatches(prev => prev.map(m => m.id === payload.new.id ? payload.new as TournamentMatch : m))
    })

    channel.subscribe()
    return () => { channel.unsubscribe(); supabase.removeChannel(channel) }
  }, [tournament.id])

  const handleRegister = async () => {
    if (!username.trim()) { setRegError('Please enter your username.'); return }
    setRegLoading(true); setRegError('')
    const result = await registerForTournament(tournament.id, username)
    setRegLoading(false)
    if (result.error) setRegError(result.error)
    else setRegSuccess(true)
  }

  const statusBadge = {
    registration: { label: 'Registration Open', color: 'bg-green-100 text-green-700' },
    in_progress:  { label: 'In Progress 🔴',   color: 'bg-primary/10 text-primary' },
    finished:     { label: 'Finished 🏆',       color: 'bg-amber-100 text-amber-700' },
  }[tournament.status]

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/tournament" className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors font-medium text-sm">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            All Tournaments
          </Link>
          <span className={`text-xs font-black px-3 py-1 rounded-full ${statusBadge.color}`}>
            {statusBadge.label}
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-linear-to-br from-primary to-tertiary text-white px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">🏆</span>
            <div>
              <h1 className="text-3xl font-extrabold">{tournament.title}</h1>
              {tournament.description && <p className="text-white/80 mt-1">{tournament.description}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
              {tournament.max_players} Players
            </span>
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full capitalize">
              {tournament.mode} Mode
            </span>
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full capitalize">
              {tournament.difficulty} Difficulty
            </span>
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
              {totalRounds === 3 ? 'QF → SF → Final' : 'SF → Final'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Champion Banner */}
        {tournament.status === 'finished' && tournament.winner_name && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-linear-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 text-white text-center shadow-lg"
          >
            <div className="text-5xl mb-2">🏆</div>
            <h2 className="text-2xl font-black">{tournament.winner_name}</h2>
            <p className="text-white/80 text-sm font-medium mt-1">Tournament Champion</p>
          </motion.div>
        )}

        {/* Registration Panel */}
        {isRegistrationOpen && (
          <div className="bg-white rounded-2xl shadow-ambient border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">groups</span>
                Players ({players.length}/{tournament.max_players})
              </h2>
              <span className={`text-sm font-bold ${spotsLeft > 0 ? 'text-green-600' : 'text-error'}`}>
                {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full!'}
              </span>
            </div>

            {/* Player list */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {Array.from({ length: tournament.max_players }).map((_, i) => {
                const p = players[i]
                return (
                  <div
                    key={i}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold text-center ${
                      p ? 'bg-primary/10 text-primary' : 'bg-surface-container-low text-outline border-2 border-dashed border-surface-variant'
                    }`}
                  >
                    {p ? `${p.username}` : `Slot ${i + 1}`}
                  </div>
                )
              })}
            </div>

            {/* Register form */}
            {!regSuccess && spotsLeft > 0 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                  placeholder="Your username..."
                  className="flex-1 bg-surface-container-low border-2 border-transparent focus:border-primary rounded-xl px-4 py-2.5 outline-none font-medium"
                />
                <button
                  onClick={handleRegister}
                  disabled={regLoading}
                  className="bg-primary text-white font-bold px-5 py-2.5 rounded-xl hover:-translate-y-0.5 transition-all shadow-primary disabled:opacity-60"
                >
                  {regLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                  ) : 'Join'}
                </button>
              </div>
            )}
            {regSuccess && (
              <div className="text-center text-green-700 font-bold text-sm flex items-center justify-center gap-2 py-2">
                <span className="material-symbols-outlined">check_circle</span>
                You're registered! Wait for the tournament to start.
              </div>
            )}
            {regError && <p className="text-error text-sm font-medium mt-2">{regError}</p>}
          </div>
        )}

        {/* Bracket */}
        {(tournament.status === 'in_progress' || tournament.status === 'finished') && (
          <div className="bg-white rounded-2xl shadow-ambient border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_tree</span>
                Tournament Bracket
                <span className="ml-auto text-sm font-medium text-outline">
                  Round {currentRound} of {totalRounds}
                </span>
              </h2>
            </div>
            <div className="p-4">
              <BracketView
                matches={matches}
                maxPlayers={tournament.max_players}
              />
            </div>
          </div>
        )}

        {/* Player standings */}
        {players.length > 0 && (
          <div className="bg-white rounded-2xl shadow-ambient border border-slate-100 p-6">
            <h2 className="text-lg font-extrabold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">leaderboard</span>
              Standings
            </h2>
            <div className="space-y-2">
              {[...players]
                .sort((a, b) => {
                  if (a.status === 'champion') return -1
                  if (b.status === 'champion') return 1
                  if (a.status === 'eliminated' && b.status !== 'eliminated') return 1
                  if (b.status === 'eliminated' && a.status !== 'eliminated') return -1
                  return b.wins - a.wins
                })
                .map((p, i) => (
                  <div key={p.id} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${
                    p.status === 'champion' ? 'bg-yellow-50 border border-yellow-200' :
                    p.status === 'eliminated' ? 'opacity-50' : 'bg-surface-container-low'
                  }`}>
                    <span className="w-6 text-center text-sm font-black text-outline">
                      {p.status === 'champion' ? '👑' : `${i + 1}`}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                      {p.username.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-bold text-on-surface flex-1">{p.username}</span>
                    <span className="text-xs font-bold text-outline">{p.wins}W</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      p.status === 'champion' ? 'bg-yellow-400 text-yellow-900' :
                      p.status === 'eliminated' ? 'bg-error-container text-error' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {p.status === 'champion' ? '🏆 Champion' : p.status === 'eliminated' ? 'Eliminated' : 'Active'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
