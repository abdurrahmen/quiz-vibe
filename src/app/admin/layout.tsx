'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { logout } from './login/actions'
import { createClient } from '@/utils/supabase/client'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    async function fetchPendingCount() {
      try {
        const supabase = createClient()
        const { count } = await supabase
          .from('quiz_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
        setPendingCount(count || 0)
      } catch {
        // Table might not exist yet
      }
    }
    fetchPendingCount()
  }, [pathname])

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const navLinks = [
    { href: '/admin/dashboard', icon: 'grid_view', label: 'Dashboard' },
    { href: '/admin/questions', icon: 'quiz', label: 'Questions' },
    { href: '/admin/categories', icon: 'category', label: 'Categories' },
    { href: '/admin/quiz-requests', icon: 'request_quote', label: 'Quiz Requests', badge: pendingCount },
    { href: '/admin/tournaments', icon: 'emoji_events', label: 'Tournaments' },
  ]

  return (
    <div className="bg-[#F8F9FD] text-on-background min-h-screen flex font-sans">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SideNavBar - Light Premium Theme */}
      <aside className={`bg-white w-72 h-screen fixed left-0 top-0 border-r border-slate-200 shadow-ambient flex flex-col p-6 z-50 transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <Link href="/admin/dashboard" className="text-xl font-black text-primary tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined filled text-primary">school</span>
            QuizVibe
          </Link>
          <button className="md:hidden text-slate-400 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Enhanced User Profile Section */}
        <div className="flex items-center gap-4 mb-8 p-3.5 bg-linear-to-br from-white to-slate-50 rounded-2xl border border-slate-100 shadow-sm group cursor-pointer hover:border-primary/20 transition-all">
          <div className="w-11 h-11 rounded-xl bg-linear-to-tr from-primary to-tertiary text-white flex items-center justify-center font-black text-sm shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-black text-[15px] text-on-surface truncate tracking-tight">Admin User</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <div className="text-primary text-[10px] font-black uppercase tracking-widest opacity-80">Premium Access</div>
            </div>
          </div>
        </div>

        <Link 
          href="/admin/ai-generator"
          className="bg-linear-to-r from-primary to-tertiary text-white rounded-xl shadow-primary px-4 py-3.5 mb-8 w-full flex items-center justify-center gap-2 hover:shadow-primary-lg hover:-translate-y-0.5 transition-all font-bold text-sm"
        >
          <span className="material-symbols-outlined filled">auto_awesome</span>
          AI Question Builder
        </Link>

        <div className="text-[10px] font-black text-outline uppercase tracking-widest mb-4 px-4">Menu</div>
        <nav className="flex-1 flex flex-col gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link 
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-bold text-sm ${
                  isActive 
                    ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' 
                    : 'text-slate-500 hover:text-primary hover:bg-slate-50'
                }`}
              >
                <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>{link.icon}</span>
                {link.label}
                {(link as any).badge > 0 && (
                  <span className="ml-auto bg-error text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {(link as any).badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-6 flex flex-col gap-2">
          <a href="/" className="text-slate-500 hover:text-primary hover:bg-slate-50 rounded-xl flex items-center gap-3 px-4 py-3 transition-all font-bold text-sm">
            <span className="material-symbols-outlined">public</span>
            Main Site
          </a>
          <form action={logout}>
            <button type="submit" className="w-full text-slate-500 hover:text-error hover:bg-error-container/10 rounded-xl flex items-center gap-3 px-4 py-3 transition-all font-bold text-sm">
              <span className="material-symbols-outlined">logout</span>
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen max-w-full">
        {/* TopAppBar */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 shadow-sm flex justify-between items-center px-4 md:px-8 py-4 h-[72px]">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-600 p-2 -ml-2" onClick={() => setMobileMenuOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="hidden md:flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full border border-surface-dim focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <span className="material-symbols-outlined text-outline text-sm">search</span>
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none focus:ring-0 outline-none text-sm w-48 lg:w-64"
              />
            </div>
          </div>
          
          {/* Action buttons removed as requested */}

        </header>

        {children}
      </div>
    </div>
  )
}
