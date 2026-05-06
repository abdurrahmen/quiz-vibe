import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function LeaderboardPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch top 10 overall scores
  const { data: topScores } = await supabase
    .from('quiz_attempts')
    .select('*, category:categories(name)')
    .order('score', { ascending: false })
    .order('time_taken_seconds', { ascending: true })
    .limit(10)

  // Fetch top scores per category (simulated for UI grouping, usually you'd query each or use a complex query)
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, color, icon')
    .limit(4)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-ambient flex justify-between items-center px-6 py-4 w-full">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-gradient">
          QuizMaster Pro
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="font-medium text-slate-600 hover:text-primary transition-colors">Home</Link>
          <Link href="/admin/dashboard" className="font-medium text-slate-600 hover:text-primary transition-colors">Admin</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary-fixed text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
            Hall of Fame
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface mb-4">Global Leaderboard</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            The best of the best. See how you stack up against the top learners in our community.
          </p>
        </div>

        {/* Podium Section */}
        {topScores && topScores.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-end max-w-4xl mx-auto">
            {/* 2nd Place */}
            <div className="order-2 md:order-1 flex flex-col items-center animate-slide-in-bottom" style={{ animationDelay: '100ms' }}>
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-2xl border-4 border-white shadow-lg mb-4 relative">
                {topScores[1].username.substring(0, 2).toUpperCase()}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-400 text-white flex items-center justify-center text-sm font-bold border-2 border-white">2</div>
              </div>
              <div className="bg-surface-container-low rounded-t-2xl w-full p-6 text-center shadow-ambient h-40 flex flex-col justify-center">
                <div className="font-bold text-lg text-on-surface truncate w-full px-2">{topScores[1].username}</div>
                <div className="text-2xl font-black text-primary mt-1">{topScores[1].score}%</div>
                <div className="text-xs text-outline font-semibold uppercase mt-2">{topScores[1].category?.name || 'Mixed'}</div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="order-1 md:order-2 flex flex-col items-center animate-slide-in-bottom">
              <div className="w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold text-3xl border-4 border-yellow-400 shadow-xl mb-4 relative">
                {topScores[0].username.substring(0, 2).toUpperCase()}
                <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-yellow-400 text-white flex items-center justify-center text-lg font-bold border-2 border-white animate-bounce">1</div>
              </div>
              <div className="bg-surface-container-lowest rounded-t-2xl w-full p-8 text-center shadow-ambient-lg h-56 flex flex-col justify-center border-x-4 border-t-4 border-yellow-100">
                <div className="font-black text-xl text-on-surface truncate w-full px-2">{topScores[0].username}</div>
                <div className="text-4xl font-black text-primary mt-2">{topScores[0].score}%</div>
                <div className="text-sm text-outline font-bold uppercase mt-2">{topScores[0].category?.name || 'Mixed'}</div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="order-3 flex flex-col items-center animate-slide-in-bottom" style={{ animationDelay: '200ms' }}>
              <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-2xl border-4 border-white shadow-lg mb-4 relative">
                {topScores[2].username.substring(0, 2).toUpperCase()}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-orange-300 text-white flex items-center justify-center text-sm font-bold border-2 border-white">3</div>
              </div>
              <div className="bg-surface-container-low rounded-t-2xl w-full p-6 text-center shadow-ambient h-32 flex flex-col justify-center">
                <div className="font-bold text-lg text-on-surface truncate w-full px-2">{topScores[2].username}</div>
                <div className="text-2xl font-black text-primary mt-1">{topScores[2].score}%</div>
                <div className="text-xs text-outline font-semibold uppercase mt-2">{topScores[2].category?.name || 'Mixed'}</div>
              </div>
            </div>
          </div>
        )}

        {/* List Table */}
        <div className="bg-surface-container-lowest rounded-3xl shadow-ambient-lg overflow-hidden animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="px-8 py-6 border-b border-surface-variant bg-surface-bright flex justify-between items-center">
            <h3 className="text-xl font-bold text-on-surface">Top Rankings</h3>
            <div className="flex gap-2">
              <span className="bg-primary-fixed text-primary px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">Overall</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-surface-variant text-outline text-xs font-bold uppercase tracking-widest">
                  <th className="py-5 px-8">Rank</th>
                  <th className="py-5 px-8">Learner</th>
                  <th className="py-5 px-8">Category</th>
                  <th className="py-5 px-8">Accuracy</th>
                  <th className="py-5 px-8">Time</th>
                  <th className="py-5 px-8 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {topScores && topScores.length > 0 ? (
                  topScores.map((attempt, i) => (
                    <tr key={attempt.id} className="hover:bg-primary-fixed/20 transition-colors group">
                      <td className="py-5 px-8">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          i === 0 ? 'bg-yellow-400 text-white' : 
                          i === 1 ? 'bg-slate-400 text-white' : 
                          i === 2 ? 'bg-orange-400 text-white' : 
                          'bg-surface-container-highest text-on-surface-variant'
                        }`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-bold text-primary group-hover:scale-110 transition-transform">
                            {attempt.username.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-on-surface">{attempt.username}</span>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <span className="text-sm font-medium text-on-surface-variant">{attempt.category?.name || 'Mixed'}</span>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-surface-container-high rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${attempt.score}%` }} />
                          </div>
                          <span className="font-bold text-primary">{attempt.score}%</span>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <span className="text-sm text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">timer</span>
                          {Math.floor(attempt.time_taken_seconds / 60)}:{(attempt.time_taken_seconds % 60).toString().padStart(2, '0')}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-right text-outline text-xs font-medium">
                        {new Date(attempt.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-on-surface-variant font-medium">
                      No attempts recorded yet. Be the first to join the leaderboard!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Specific Highlights */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-on-surface mb-8">Top by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories?.map((cat) => (
              <div key={cat.id} className="bg-surface-container-low rounded-2xl p-6 shadow-ambient hover:shadow-ambient-lg transition-all group cursor-pointer">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform" style={{ backgroundColor: cat.color || '#4d41df' }}>
                    <span className="material-symbols-outlined">{cat.icon || 'category'}</span>
                  </div>
                  <h3 className="font-bold text-on-surface">{cat.name}</h3>
                </div>
                <div className="text-xs text-outline font-semibold uppercase mb-3">Top Learner</div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-on-surface-variant">@Trainee_01</span>
                  <span className="bg-primary-fixed text-primary px-2 py-0.5 rounded text-xs font-bold">98%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-highest py-12 px-6 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-xl font-extrabold text-gradient mb-4">QuizMaster Pro</div>
          <p className="text-sm text-on-surface-variant">© 2026 QuizMaster Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
