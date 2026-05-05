import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import type { DashboardStats } from '@/lib/types'

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch stats concurrently
  const [qRes, cRes, aRes, avgRes] = await Promise.all([
    supabase.from('questions').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }),
    supabase.from('quiz_attempts').select('score')
  ])

  const totalQuestions = qRes.count || 0
  const totalCategories = cRes.count || 0
  const totalAttempts = aRes.count || 0
  
  // Calculate average score
  let avgScore = 0
  if (avgRes.data && avgRes.data.length > 0) {
    const sum = avgRes.data.reduce((acc, row) => acc + Number(row.score), 0)
    avgScore = Math.round(sum / avgRes.data.length)
  }

  // Fetch recent attempts for the table
  const { data: recentAttempts } = await supabase
    .from('quiz_attempts')
    .select('*, category:categories(name)')
    .order('created_at', { ascending: false })
    .limit(5)

  // Chart data (simulated for UI)
  const categorySplit = [
    { name: 'Science', percentage: 45, color: 'bg-primary' },
    { name: 'History', percentage: 30, color: 'bg-secondary' },
    { name: 'Math', percentage: 25, color: 'bg-tertiary-container' },
  ]

  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-on-background">Dashboard Overview</h1>
        <p className="text-on-surface-variant mt-1">Welcome back, Admin. Here is what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient hover:shadow-ambient-lg transition-all duration-300 flex flex-col gap-3 group animate-scale-in" style={{ animationDelay: '0ms' }}>
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined filled">quiz</span>
            </div>
            <span className="text-secondary text-sm font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span> +12%
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-on-surface">{totalQuestions.toLocaleString()}</div>
            <div className="text-sm font-semibold text-outline tracking-wide mt-1 uppercase">Total Questions</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient hover:shadow-ambient-lg transition-all duration-300 flex flex-col gap-3 group animate-scale-in" style={{ animationDelay: '50ms' }}>
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 text-tertiary-container flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined filled">category</span>
            </div>
            <span className="text-outline text-sm font-semibold flex items-center gap-1">Stable</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-on-surface">{totalCategories.toLocaleString()}</div>
            <div className="text-sm font-semibold text-outline tracking-wide mt-1 uppercase">Categories</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient hover:shadow-ambient-lg transition-all duration-300 flex flex-col gap-3 group animate-scale-in" style={{ animationDelay: '100ms' }}>
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl bg-secondary-container/10 text-secondary-container flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined filled">groups</span>
            </div>
            <span className="text-secondary text-sm font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span> +8%
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-on-surface">{totalAttempts.toLocaleString()}</div>
            <div className="text-sm font-semibold text-outline tracking-wide mt-1 uppercase">Total Attempts</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient hover:shadow-ambient-lg transition-all duration-300 flex flex-col gap-3 group animate-scale-in" style={{ animationDelay: '150ms' }}>
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined filled">analytics</span>
            </div>
            <span className="text-error text-sm font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">trending_down</span> -2%
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-on-surface">{avgScore}%</div>
            <div className="text-sm font-semibold text-outline tracking-wide mt-1 uppercase">Avg Score</div>
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
        {/* Main Chart Placeholder */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-6 shadow-ambient flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-on-surface">Score Distribution</h3>
            <button className="text-sm font-semibold text-primary flex items-center gap-1 hover:text-primary-container transition-colors">
              This Week <span className="material-symbols-outlined">expand_more</span>
            </button>
          </div>
          <div className="flex-1 bg-surface-container-low rounded-xl flex items-end justify-between p-6 gap-2 relative min-h-[300px]">
            {/* Simulated Bar Chart */}
            <div className="w-full bg-primary-container/20 rounded-t-md h-[20%] hover:bg-primary-container/40 transition-colors cursor-pointer group relative">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">0-20%</div>
            </div>
            <div className="w-full bg-primary-container/40 rounded-t-md h-[35%] hover:bg-primary-container/60 transition-colors cursor-pointer group relative">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">21-40%</div>
            </div>
            <div className="w-full bg-primary-container/60 rounded-t-md h-[50%] hover:bg-primary-container/80 transition-colors cursor-pointer group relative">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">41-60%</div>
            </div>
            <div className="w-full bg-primary rounded-t-md h-[85%] hover:bg-tertiary transition-colors cursor-pointer group relative shadow-md">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">61-80%</div>
            </div>
            <div className="w-full bg-primary-container/80 rounded-t-md h-[60%] hover:bg-primary-container transition-colors cursor-pointer group relative">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">81-100%</div>
            </div>
          </div>
        </div>

        {/* Secondary Chart Placeholder */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-on-surface">Category Split</h3>
            <button className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-6 min-h-[300px]">
            {/* Simulated Donut Chart using Conic Gradient */}
            <div 
              className="w-48 h-48 rounded-full shadow-inner relative flex items-center justify-center transition-transform hover:scale-105 duration-300" 
              style={{ background: 'conic-gradient(#4d41df 0% 45%, #b0284b 45% 75%, #4865fb 75% 100%)' }}
            >
              <div className="w-32 h-32 bg-surface-container-lowest rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-extrabold text-on-surface">{totalCategories}</span>
                <span className="text-xs text-outline font-medium uppercase tracking-wide">Active</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full px-2">
              {categorySplit.map(cat => (
                <div key={cat.name} className="flex items-center justify-between text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${cat.color}`}></div> 
                    {cat.name}
                  </div>
                  <div className="text-on-surface-variant">{cat.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-ambient overflow-hidden animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="p-6 border-b border-surface-variant flex justify-between items-center bg-surface-bright">
          <h3 className="text-xl font-bold text-on-surface">Recent Attempts</h3>
          <button className="text-sm font-semibold text-primary flex items-center gap-1 hover:text-primary-container transition-colors bg-primary-fixed px-4 py-2 rounded-lg">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-variant text-outline text-sm font-semibold">
                <th className="py-4 px-6 font-medium">User</th>
                <th className="py-4 px-6 font-medium">Category</th>
                <th className="py-4 px-6 font-medium">Score</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium">Date</th>
                <th className="py-4 px-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant">
              {recentAttempts && recentAttempts.length > 0 ? (
                recentAttempts.map(attempt => {
                  const passed = attempt.score >= 60
                  const initial = attempt.username.substring(0, 2).toUpperCase()
                  // Generate pseudo-random color based on name length
                  const colorClass = attempt.username.length % 3 === 0 
                    ? 'bg-primary-fixed text-on-primary-fixed' 
                    : attempt.username.length % 3 === 1 
                      ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                      : 'bg-tertiary-fixed text-on-tertiary-fixed'

                  return (
                    <tr key={attempt.id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${colorClass}`}>
                            {initial}
                          </div>
                          <span className="text-on-surface font-medium">{attempt.username}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant">{attempt.category?.name || 'Mixed'}</td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-on-surface">{attempt.score}%</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${passed ? 'bg-green-100 text-green-800' : 'bg-error-container text-on-error-container'}`}>
                          {passed ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-outline text-sm">
                        {new Date(attempt.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <a href={`/quiz/results/${attempt.id}`} className="inline-block text-outline hover:text-primary transition-colors opacity-0 group-hover:opacity-100 p-2">
                          <span className="material-symbols-outlined">visibility</span>
                        </a>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                    No attempts recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
