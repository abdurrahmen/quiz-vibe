import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import type { Tournament } from '@/lib/types'

export default async function TournamentsListPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)

  const active = (tournaments ?? []).filter(t => t.status !== 'finished')
  const finished = (tournaments ?? []).filter(t => t.status === 'finished')

  const StatusBadge = ({ status }: { status: Tournament['status'] }) => ({
    registration: <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700">Registration Open</span>,
    in_progress:  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary">🔴 Live</span>,
    finished:     <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Finished</span>,
  }[status])

  const TournamentCard = ({ t }: { t: Tournament }) => (
    <Link
      href={`/tournament/${t.id}`}
      className="bg-white rounded-2xl shadow-ambient border border-slate-100 p-5 hover:border-primary hover:shadow-primary/10 hover:-translate-y-0.5 transition-all group block"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <h3 className="font-extrabold text-on-surface group-hover:text-primary transition-colors">{t.title}</h3>
        </div>
        <StatusBadge status={t.status} />
      </div>
      {t.description && <p className="text-sm text-on-surface-variant mb-3 line-clamp-2">{t.description}</p>}
      <div className="flex flex-wrap gap-2">
        <span className="text-[11px] bg-surface-container-low text-outline font-bold px-2 py-0.5 rounded-full">{t.max_players}P</span>
        <span className="text-[11px] bg-surface-container-low text-outline font-bold px-2 py-0.5 rounded-full capitalize">{t.mode}</span>
        <span className="text-[11px] bg-surface-container-low text-outline font-bold px-2 py-0.5 rounded-full capitalize">{t.difficulty}</span>
        {t.winner_name && (
          <span className="text-[11px] bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">🏆 {t.winner_name}</span>
        )}
      </div>
    </Link>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-gradient">QuizMaster Pro</Link>
          <Link href="/" className="text-slate-600 hover:text-primary transition-colors font-medium text-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-base">home</span> Home
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative overflow-hidden bg-linear-to-br from-primary to-tertiary text-white px-6 py-16 text-center">
        {/* Floating Decorative Icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[0]" aria-hidden="true">
          {[
            { id: 1, icon: 'emoji_events', top: 12, left: 8, size: 44, rot: -15, dur: 4.5, delay: 0 },
            { id: 2, icon: 'psychology', top: 55, left: 12, size: 38, rot: 25, dur: 5.2, delay: 0.5 },
            { id: 3, icon: 'star', top: 30, left: 22, size: 28, rot: 30, dur: 4.0, delay: 2.1 },
            { id: 4, icon: 'bolt', top: 70, left: 6, size: 36, rot: -5, dur: 5.5, delay: 1.5 },
            { id: 5, icon: 'lightbulb', top: 80, left: 25, size: 42, rot: 10, dur: 6.0, delay: 0.8 },
            { id: 6, icon: 'help', top: 18, left: 85, size: 40, rot: 15, dur: 5.8, delay: 0.2 },
            { id: 7, icon: 'school', top: 45, left: 90, size: 34, rot: -20, dur: 3.9, delay: 2.2 },
            { id: 8, icon: 'emoji_events', top: 68, left: 82, size: 46, rot: -25, dur: 6.2, delay: 0.9 },
            { id: 9, icon: 'star', top: 25, left: 75, size: 26, rot: -10, dur: 5.0, delay: 1.7 },
            { id: 10, icon: 'bolt', top: 50, left: 78, size: 32, rot: 30, dur: 4.3, delay: 0.4 },
            { id: 11, icon: 'psychology', top: 8, left: 50, size: 30, rot: 10, dur: 4.1, delay: 2.0 },
            { id: 12, icon: 'lightbulb', top: 88, left: 55, size: 24, rot: 45, dur: 3.2, delay: 1.8 },
          ].map((icon) => (
            <div
              key={icon.id}
              className="absolute hidden md:block"
              style={{
                top: `${icon.top}%`,
                left: `${icon.left}%`,
                animation: `float-pulse-icon ${icon.dur}s ease-in-out infinite`,
                animationDelay: `${icon.delay}s`,
              }}
            >
              <span
                className="material-symbols-outlined text-white"
                style={{
                  fontSize: `${icon.size}px`,
                  transform: `rotate(${icon.rot}deg)`,
                  display: 'block',
                }}
              >
                {icon.icon}
              </span>
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-extrabold mb-3">Tournaments</h1>
          <p className="text-white/80 max-w-md mx-auto">
            Compete in structured brackets with 4 or 8 players. Climb from Quarter-Finals to Champion!
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* Active tournaments */}
        {active.length > 0 && (
          <section>
            <h2 className="text-xl font-extrabold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">play_circle</span>
              Active Tournaments
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {active.map(t => <TournamentCard key={t.id} t={t} />)}
            </div>
          </section>
        )}

        {/* Empty state */}
        {active.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏟️</div>
            <h2 className="text-xl font-bold text-on-surface mb-2">No tournaments yet</h2>
            <p className="text-on-surface-variant mb-6">Admins can create tournaments from the Admin Panel.</p>
            <Link href="/admin/tournaments" className="bg-primary text-white font-bold px-6 py-3 rounded-xl shadow-primary hover:-translate-y-0.5 transition-all inline-flex items-center gap-2">
              <span className="material-symbols-outlined">admin_panel_settings</span>
              Go to Admin Panel
            </Link>
          </div>
        )}

        {/* Finished tournaments */}
        {finished.length > 0 && (
          <section>
            <h2 className="text-xl font-extrabold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-outline">history</span>
              Past Tournaments
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {finished.map(t => <TournamentCard key={t.id} t={t} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
