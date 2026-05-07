import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'


function RankBadge({ rank }: { rank: number }) {
  const cls =
    rank === 1 ? 'bg-yellow-400 text-white' :
      rank === 2 ? 'bg-slate-400 text-white' :
        rank === 3 ? 'bg-orange-400 text-white' :
          'bg-surface-container-high text-outline'
  const icon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : String(rank)
  return (
    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${cls}`}>
      {icon}
    </span>
  )
}

function Avatar({ name, color = 'bg-primary/20', text = 'text-primary' }: { name: string; color?: string; text?: string }) {
  return (
    <div className={`w-9 h-9 rounded-full ${color} ${text} flex items-center justify-center font-black text-xs shrink-0`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  )
}

// ── Section header ──────────────────────────────────────────────────────
function SectionHeader({ emoji, title, subtitle, color }: { emoji: string; title: string; subtitle: string; color: string }) {
  return (
    <div className={`flex items-center gap-4 px-6 py-5 border-b border-slate-100 ${color}`}>
      <span className="text-3xl">{emoji}</span>
      <div>
        <h2 className="text-lg font-extrabold text-on-surface">{title}</h2>
        <p className="text-xs text-on-surface-variant font-medium">{subtitle}</p>
      </div>
    </div>
  )
}

// ── Empty state ─────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-12 text-center text-on-surface-variant font-medium text-sm">
      {message}
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────
export default async function LeaderboardPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Solo quiz — top 10 by score then speed
  const { data: soloScores } = await supabase
    .from('quiz_attempts')
    .select('*, category:categories(name)')
    .order('score', { ascending: false })
    .order('time_taken_seconds', { ascending: true })
    .limit(10)

  // 2. Blitz — top duels where mode = 'blitz', ranked by highest score
  const { data: blitzDuels } = await supabase
    .from('duels')
    .select('*')
    .eq('mode', 'blitz')
    .eq('status', 'finished')
    .not('winner_name', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20)

  // Build blitz leaderboard: best score per player
  const blitzMap = new Map<string, { username: string; score: number; wins: number }>()
  blitzDuels?.forEach(d => {
    // Creator
    if (d.creator_score !== null) {
      const prev = blitzMap.get(d.creator_name)
      blitzMap.set(d.creator_name, {
        username: d.creator_name,
        score: Math.max(d.creator_score, prev?.score ?? 0),
        wins: (prev?.wins ?? 0) + (d.winner_name === d.creator_name ? 1 : 0),
      })
    }
    // Opponent
    if (d.opponent_name && d.opponent_score !== null) {
      const prev = blitzMap.get(d.opponent_name)
      blitzMap.set(d.opponent_name, {
        username: d.opponent_name,
        score: Math.max(d.opponent_score, prev?.score ?? 0),
        wins: (prev?.wins ?? 0) + (d.winner_name === d.opponent_name ? 1 : 0),
      })
    }
  })
  const blitzLeaderboard = [...blitzMap.values()]
    .sort((a, b) => b.score - a.score || b.wins - a.wins)
    .slice(0, 10)

  // 3. Category Wars — top duels where mode = 'category_wars'
  const { data: warsDuels } = await supabase
    .from('duels')
    .select('*')
    .eq('mode', 'category_wars')
    .eq('status', 'finished')
    .not('winner_name', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20)

  // Build wars leaderboard: win count + best score per player
  const warsMap = new Map<string, { username: string; wins: number; bestScore: number; totalMs: number }>()
  warsDuels?.forEach(d => {
    const process = (name: string, score: number | null, ms: number | null, won: boolean) => {
      if (!name) return
      const prev = warsMap.get(name)
      warsMap.set(name, {
        username: name,
        wins: (prev?.wins ?? 0) + (won ? 1 : 0),
        bestScore: Math.max(score ?? 0, prev?.bestScore ?? 0),
        totalMs: (prev?.totalMs ?? 0) + (ms ?? 0),
      })
    }
    process(d.creator_name, d.creator_score, d.creator_time_ms, d.winner_name === d.creator_name)
    if (d.opponent_name) process(d.opponent_name, d.opponent_score, d.opponent_time_ms, d.winner_name === d.opponent_name)
  })
  const warsLeaderboard = [...warsMap.values()]
    .sort((a, b) => b.wins - a.wins || b.bestScore - a.bestScore)
    .slice(0, 10)

  // 4. Tournaments — top players by wins across all tournaments
  const { data: tournamentPlayers } = await supabase
    .from('tournament_players')
    .select('*, tournament:tournaments(title, status)')
    .order('wins', { ascending: false })
    .limit(10)

  // Aggregate tournament wins per username
  const tMap = new Map<string, { username: string; wins: number; championships: number }>()
  tournamentPlayers?.forEach(p => {
    const prev = tMap.get(p.username)
    tMap.set(p.username, {
      username: p.username,
      wins: (prev?.wins ?? 0) + p.wins,
      championships: (prev?.championships ?? 0) + (p.status === 'champion' ? 1 : 0),
    })
  })
  const tournamentLeaderboard = [...tMap.values()]
    .sort((a, b) => b.championships - a.championships || b.wins - a.wins)
    .slice(0, 10)

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-ambient flex justify-between items-center px-6 py-4">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-gradient">QuizVibe</Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="font-medium text-slate-600 hover:text-primary transition-colors">Home</Link>
          <Link href="/duel" className="font-medium text-slate-600 hover:text-primary transition-colors">⚡ Duel</Link>
          <Link href="/tournament" className="font-medium text-slate-600 hover:text-primary transition-colors">🏆 Tournaments</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary-fixed text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
            Hall of Fame
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-4">Global Leaderboard</h1>
          <p className="text-lg text-on-surface-variant max-w-xl mx-auto">
            Rankings across all modes — Solo, Blitz, Category Wars, and Tournament.
          </p>
        </div>

        {/* Podium — Top 3 Solo */}
        {soloScores && soloScores.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-14 items-end max-w-2xl mx-auto">
            {/* 2nd */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-600 font-bold text-xl border-4 border-white shadow-lg flex items-center justify-center mb-2 relative">
                {soloScores[1].username.slice(0, 2).toUpperCase()}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-400 text-white text-xs flex items-center justify-center font-bold border-2 border-white">2</div>
              </div>
              <div className="bg-slate-100 rounded-t-xl w-full p-3 text-center h-28 flex flex-col justify-center">
                <p className="font-bold text-sm text-on-surface truncate">{soloScores[1].username}</p>
                <p className="text-xl font-black text-primary">{soloScores[1].score}%</p>
                <p className="text-[10px] text-outline uppercase">{soloScores[1].category?.name || 'Mixed'}</p>
              </div>
            </div>
            {/* 1st */}
            <div className="flex flex-col items-center -mt-4">
              <div className="w-20 h-20 rounded-full bg-yellow-100 text-yellow-700 font-bold text-2xl border-4 border-yellow-400 shadow-xl flex items-center justify-center mb-2 relative">
                {soloScores[0].username.slice(0, 2).toUpperCase()}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-yellow-400 text-white text-base flex items-center justify-center font-bold border-2 border-white animate-bounce">1</div>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-t-xl w-full p-4 text-center h-36 flex flex-col justify-center">
                <p className="font-black text-base text-on-surface truncate">{soloScores[0].username}</p>
                <p className="text-3xl font-black text-primary">{soloScores[0].score}%</p>
                <p className="text-[10px] text-outline uppercase">{soloScores[0].category?.name || 'Mixed'}</p>
              </div>
            </div>
            {/* 3rd */}
            <div className="flex flex-col items-center mt-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 font-bold text-xl border-4 border-white shadow-lg flex items-center justify-center mb-2 relative">
                {soloScores[2].username.slice(0, 2).toUpperCase()}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-orange-400 text-white text-xs flex items-center justify-center font-bold border-2 border-white">3</div>
              </div>
              <div className="bg-orange-50 rounded-t-xl w-full p-3 text-center h-24 flex flex-col justify-center">
                <p className="font-bold text-sm text-on-surface truncate">{soloScores[2].username}</p>
                <p className="text-xl font-black text-primary">{soloScores[2].score}%</p>
                <p className="text-[10px] text-outline uppercase">{soloScores[2].category?.name || 'Mixed'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* ── SOLO QUIZ ──────────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-ambient border border-slate-100 overflow-hidden">
            <SectionHeader emoji="🧠" title="Solo Quiz" subtitle="Top scores across all quiz attempts — ranked by accuracy then speed" color="bg-primary/5" />
            {soloScores && soloScores.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-max">
                  <thead>
                    <tr className="bg-surface-container-low text-outline text-[11px] font-black uppercase tracking-widest border-b border-slate-100">
                      <th className="py-3 px-4 md:px-6">#</th>
                      <th className="py-3 px-4 md:px-6">Player</th>
                      <th className="py-3 px-4 md:px-6">Category</th>
                      <th className="py-3 px-4 md:px-6">Accuracy</th>
                      <th className="py-3 px-4 md:px-6">Time</th>
                      <th className="py-3 px-4 md:px-6 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {soloScores.map((a, i) => (
                      <tr key={a.id} className="hover:bg-primary/5 transition-colors group">
                        <td className="py-4 px-6"><RankBadge rank={i + 1} /></td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar name={a.username} />
                            <span className="font-bold text-on-surface">{a.username}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-outline font-medium">{a.category?.name || 'Mixed'}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${a.score}%` }} />
                            </div>
                            <span className="font-black text-primary text-sm">{a.score}%</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-outline font-medium">{formatTime(a.time_taken_seconds)}</td>
                        <td className="py-4 px-6 text-right text-xs text-outline">{new Date(a.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState message="No quiz attempts yet. Be the first!" />}
          </div>

          {/* ── BLITZ ─────────────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-ambient border border-slate-100 overflow-hidden">
            <SectionHeader emoji="⚡" title="Blitz Round" subtitle="Most correct answers in 60 seconds — fastest fingers first" color="bg-yellow-50" />
            {blitzLeaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low text-outline text-[11px] font-black uppercase tracking-widest border-b border-slate-100">
                      <th className="py-3 px-6">#</th>
                      <th className="py-3 px-6">Player</th>
                      <th className="py-3 px-6">Best Score</th>
                      <th className="py-3 px-6">Duel Wins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {blitzLeaderboard.map((p, i) => (
                      <tr key={p.username} className="hover:bg-yellow-50 transition-colors">
                        <td className="py-4 px-6"><RankBadge rank={i + 1} /></td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar name={p.username} color="bg-yellow-100" text="text-yellow-700" />
                            <span className="font-bold text-on-surface">{p.username}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-2xl font-black text-yellow-600">{p.score}</span>
                          <span className="text-xs text-outline ml-1">correct</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 font-bold text-sm px-2 py-0.5 rounded-full">
                            ⚡ {p.wins}W
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState message="No Blitz duels completed yet. Go to /duel and pick Blitz mode!" />}
          </div>

          {/* ── CATEGORY WARS ─────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-ambient border border-slate-100 overflow-hidden">
            <SectionHeader emoji="🏹" title="Category Wars" subtitle="Win rate on your turf and theirs — the ultimate knowledge battle" color="bg-secondary/5" />
            {warsLeaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low text-outline text-[11px] font-black uppercase tracking-widest border-b border-slate-100">
                      <th className="py-3 px-6">#</th>
                      <th className="py-3 px-6">Player</th>
                      <th className="py-3 px-6">Wins</th>
                      <th className="py-3 px-6">Best Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {warsLeaderboard.map((p, i) => (
                      <tr key={p.username} className="hover:bg-secondary/5 transition-colors">
                        <td className="py-4 px-6"><RankBadge rank={i + 1} /></td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar name={p.username} color="bg-secondary/10" text="text-secondary" />
                            <span className="font-bold text-on-surface">{p.username}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 bg-secondary/10 text-secondary font-bold text-sm px-2 py-0.5 rounded-full">
                            🏹 {p.wins}W
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                              <div className="h-full bg-secondary rounded-full" style={{ width: `${(p.bestScore / 10) * 100}%` }} />
                            </div>
                            <span className="font-black text-secondary text-sm">{p.bestScore}/10</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState message="No Category Wars duels yet. Try the 🏹 Category Wars mode in /duel!" />}
          </div>

          {/* ── TOURNAMENTS ───────────────────────────────── */}
          <div className="bg-white rounded-3xl shadow-ambient border border-slate-100 overflow-hidden">
            <SectionHeader emoji="🏆" title="Tournament Champions" subtitle="Players with the most bracket wins and championship titles" color="bg-amber-50" />
            {tournamentLeaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low text-outline text-[11px] font-black uppercase tracking-widest border-b border-slate-100">
                      <th className="py-3 px-6">#</th>
                      <th className="py-3 px-6">Player</th>
                      <th className="py-3 px-6">Championships</th>
                      <th className="py-3 px-6">Match Wins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {tournamentLeaderboard.map((p, i) => (
                      <tr key={p.username} className="hover:bg-amber-50 transition-colors">
                        <td className="py-4 px-6"><RankBadge rank={i + 1} /></td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar name={p.username} color="bg-yellow-100" text="text-yellow-700" />
                            <span className="font-bold text-on-surface">{p.username}</span>
                            {p.championships > 0 && (
                              <span className="text-[10px] bg-yellow-400 text-yellow-900 font-black px-2 py-0.5 rounded-full">👑 CHAMP</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: p.championships }).map((_, j) => (
                              <span key={j} className="text-lg">🏆</span>
                            ))}
                            {p.championships === 0 && <span className="text-outline text-sm">—</span>}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 font-bold text-sm px-2 py-0.5 rounded-full">
                            🏅 {p.wins}W
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <EmptyState message="No tournaments finished yet. Create one in the Admin Panel!" />}
          </div>
        </div>
      </main>

      <footer className="bg-surface-container-highest py-10 px-6 mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-xl font-extrabold text-gradient mb-2">QuizVibe</div>
          <p className="text-sm text-on-surface-variant">© 2026 QuizVibe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
