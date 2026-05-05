'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { logout } from './login/actions'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const navLinks = [
    { href: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { href: '/admin/questions', icon: 'quiz', label: 'Questions' },
    { href: '/admin/categories', icon: 'category', label: 'Categories' },
    { href: '/admin/ai-generator', icon: 'auto_awesome', label: 'AI Generator' },
  ]

  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SideNavBar */}
      <aside className={`bg-slate-950 text-white w-72 h-screen fixed left-0 top-0 border-r border-slate-800 shadow-2xl flex flex-col p-6 z-50 transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/dashboard" className="text-xl font-bold text-white tracking-tight">QuizMaster Pro</Link>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full border-2 border-primary-container bg-slate-800 overflow-hidden">
            <span className="material-symbols-outlined text-3xl m-1.5 text-slate-400">person</span>
          </div>
          <div>
            <div className="font-semibold text-sm">QuizMaster Admin</div>
            <div className="text-slate-400 text-xs">Premium Tier</div>
          </div>
        </div>

        <Link 
          href="/admin/ai-generator"
          className="bg-gradient-to-r from-primary to-tertiary text-white rounded-xl shadow-lg px-4 py-3 mb-6 w-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity font-semibold text-sm"
        >
          <span className="material-symbols-outlined filled">add</span>
          Create New Content
        </Link>

        <nav className="flex-1 flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link 
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out font-medium text-sm ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg translate-x-1' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 hover:translate-x-1'
                }`}
              >
                <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`}>{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-slate-800 pt-4 flex flex-col gap-2">
          <a href="/" className="text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl flex items-center gap-3 px-4 py-3 transition-all font-medium text-sm">
            <span className="material-symbols-outlined">public</span>
            View Main Site
          </a>
          <form action={logout}>
            <button type="submit" className="w-full text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl flex items-center gap-3 px-4 py-3 transition-all font-medium text-sm">
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
          
          <div className="flex items-center gap-2 md:gap-4">
            <button className="text-slate-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="text-slate-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}
