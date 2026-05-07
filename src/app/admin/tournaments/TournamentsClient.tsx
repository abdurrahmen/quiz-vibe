'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { Tournament, TournamentPlayer, TournamentMatch, Category } from '@/lib/types'
import { createTournament, startTournament, reportMatchResult } from '@/app/tournament/actions'
import BracketView from '@/components/tournament/BracketView'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'

export default function AdminTournamentsClient() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)
  const [players, setPlayers] = useState<TournamentPlayer[]>([])
  const [matches, setMatches] = useState<TournamentMatch[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('tournaments').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]).then(([{ data: t }, { data: c }]) => {
      if (t) setTournaments(t)
      if (c) setCategories(c)
    })
  }, [])

  const loadTournamentDetails = async (t: Tournament) => {
    setSelectedTournament(t)
    const supabase = createClient()
    const [{ data: p }, { data: m }] = await Promise.all([
      supabase.from('tournament_players').select('*').eq('tournament_id', t.id).order('created_at'),
      supabase.from('tournament_matches').select('*').eq('tournament_id', t.id).order('round').order('match_number'),
    ])
    setPlayers(p ?? [])
    setMatches(m ?? [])
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true); setCreateError('')
    const result = await createTournament(new FormData(e.currentTarget))
    setCreating(false)
    if (result.error) { setCreateError(result.error); return }
    if (result.tournament) {
      setTournaments(prev => [result.tournament!, ...prev])
      setShowCreate(false)
      loadTournamentDetails(result.tournament!)
    }
  }

  const handleStart = async () => {
    if (!selectedTournament) return
    setStarting(true)
    await startTournament(selectedTournament.id)
    setStarting(false)
    loadTournamentDetails(selectedTournament)
    const supabase = createClient()
    const { data } = await supabase.from('tournaments').select('*').eq('id', selectedTournament.id).single()
    if (data) {
      setSelectedTournament(data)
      setTournaments(prev => prev.map(t => t.id === data.id ? data : t))
    }
  }

  const handleReportWinner = async (matchId: string, winnerName: string) => {
    await reportMatchResult(matchId, winnerName)
    if (selectedTournament) loadTournamentDetails(selectedTournament)
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar — tournament list */}
      <div className="w-full md:w-72 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-extrabold text-on-surface">Tournaments</h2>
          <button
            onClick={() => setShowCreate(v => !v)}
            className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 min-h-[44px] rounded-lg hover:-translate-y-0.5 transition-all shadow-primary"
          >
            <span className="material-symbols-outlined text-sm">{showCreate ? 'close' : 'add'}</span>
            {showCreate ? 'Cancel' : 'Create'}
          </button>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showCreate && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreate}
              className="bg-white rounded-2xl border border-slate-100 shadow-ambient p-4 mb-4 space-y-3 overflow-hidden"
            >
              <input name="title" required placeholder="Tournament title" className="w-full bg-surface-container-low rounded-xl px-3 py-2 text-sm font-medium outline-none" />
              <textarea name="description" placeholder="Description (optional)" rows={2} className="w-full bg-surface-container-low rounded-xl px-3 py-2 text-sm font-medium outline-none resize-none" />
              <select name="category_id" className="w-full bg-surface-container-low rounded-xl px-3 py-2 text-sm font-medium outline-none">
                <option value="">Any Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <select name="difficulty" className="bg-surface-container-low rounded-xl px-3 py-2 text-sm font-medium outline-none">
                  {['mixed', 'easy', 'medium', 'hard'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select name="mode" className="bg-surface-container-low rounded-xl px-3 py-2 text-sm font-medium outline-none">
                  <option value="standard">Standard</option>
                  <option value="blitz">Blitz</option>
                </select>
              </div>
              <div className="flex gap-2">
                <label className="cursor-pointer flex-1">
                  <input type="radio" name="max_players" value="4" className="sr-only peer" />
                  <div className="text-center text-xs font-bold py-2 rounded-xl border-2 border-surface-variant peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary text-slate-500 transition-all">4 Players</div>
                </label>
                <label className="cursor-pointer flex-1">
                  <input type="radio" name="max_players" value="8" defaultChecked className="sr-only peer" />
                  <div className="text-center text-xs font-bold py-2 rounded-xl border-2 border-surface-variant peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-primary text-slate-500 transition-all">8 Players</div>
                </label>
              </div>
              {createError && <p className="text-error text-xs font-medium">{createError}</p>}
              <button type="submit" disabled={creating} className="w-full bg-primary text-white text-sm font-bold py-2.5 rounded-xl transition-all disabled:opacity-60">
                {creating ? 'Creating...' : 'Create Tournament'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* List */}
        <div className="space-y-2">
          {tournaments.map(t => (
            <button
              key={t.id}
              onClick={() => loadTournamentDetails(t)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${selectedTournament?.id === t.id ? 'border-primary bg-primary/5' : 'border-transparent bg-white hover:border-primary/30'}`}
            >
              <p className="font-bold text-sm text-on-surface truncate">{t.title}</p>
              <p className="text-[10px] text-outline capitalize mt-0.5">{t.status.replace('_', ' ')} · {t.max_players}P · {t.mode}</p>
            </button>
          ))}
          {tournaments.length === 0 && <p className="text-sm text-outline text-center py-8">No tournaments yet. Create one!</p>}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 w-full min-w-0">
        {selectedTournament ? (
          <div className="space-y-6">
            {/* Tournament header */}
            <div className="bg-white rounded-2xl shadow-ambient border border-slate-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-on-surface">{selectedTournament.title}</h2>
                  <p className="text-sm text-outline mt-1">{selectedTournament.max_players}P · {selectedTournament.mode} · {selectedTournament.difficulty}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/tournament/${selectedTournament.id}`}
                    target="_blank"
                    className="flex items-center gap-1 bg-surface-container text-on-surface text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-surface-container-high transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    Public View
                  </Link>
                  {selectedTournament.status === 'registration' && players.length >= 2 && (
                    <button
                      onClick={handleStart}
                      disabled={starting}
                      className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1.5 min-h-[44px] rounded-lg hover:-translate-y-0.5 transition-all shadow-primary disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                      {starting ? 'Starting...' : `Start (${players.length}/${selectedTournament.max_players}p)`}
                    </button>
                  )}
                </div>
              </div>

              {/* Registered players */}
              <div>
                <p className="text-xs font-bold text-outline uppercase tracking-wide mb-2">
                  Registered Players ({players.length}/{selectedTournament.max_players})
                </p>
                <div className="flex flex-wrap gap-2">
                  {players.map(p => (
                    <span key={p.id} className={`text-xs font-bold px-3 py-1 rounded-full ${
                      p.status === 'champion' ? 'bg-yellow-400 text-yellow-900' :
                      p.status === 'eliminated' ? 'bg-error-container text-error line-through' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {p.seed ? `#${p.seed} ` : ''}{p.username} ({p.wins}W)
                    </span>
                  ))}
                  {players.length === 0 && <span className="text-sm text-outline">No players yet</span>}
                </div>
              </div>
            </div>

            {/* Bracket */}
            {(selectedTournament.status === 'in_progress' || selectedTournament.status === 'finished') && (
              <div className="bg-white rounded-2xl shadow-ambient border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-extrabold text-on-surface">Live Bracket</h3>
                </div>
                <div className="p-4">
                  <BracketView matches={matches} maxPlayers={selectedTournament.max_players} />
                </div>
              </div>
            )}

            {/* Admin: manually report match winners */}
            {selectedTournament.status === 'in_progress' && (
              <div className="bg-white rounded-2xl shadow-ambient border border-slate-100 p-6">
                <h3 className="font-extrabold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary align-middle mr-1">gavel</span>
                  Report Match Results
                </h3>
                <div className="space-y-3">
                  {matches.filter(m => m.status === 'in_progress').map(m => (
                    <div key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-surface-container-low p-3 rounded-xl">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-xs font-bold text-outline">R{m.round}M{m.match_number}</span>
                        <span className="text-sm font-bold text-on-surface flex-1">
                          {m.player1_name} <span className="text-outline font-normal">vs</span> {m.player2_name}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[m.player1_name, m.player2_name].filter(Boolean).map(name => (
                          <button
                            key={name}
                            onClick={() => handleReportWinner(m.id, name!)}
                            className="bg-primary/10 text-primary text-xs font-bold px-4 py-2 min-h-[44px] rounded-lg hover:bg-primary hover:text-white transition-all flex-1 sm:flex-none"
                          >
                            {name} Wins
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {matches.filter(m => m.status === 'in_progress').length === 0 && (
                    <p className="text-sm text-outline">No active matches right now.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-outline">
            <div className="text-center">
              <div className="text-4xl mb-3">🏆</div>
              <p className="font-medium">Select a tournament to manage</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
