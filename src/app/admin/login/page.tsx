'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { login } from './actions'

export default function AdminLogin() {
  const [state, formAction, isPending] = useActionState(login, null)
  
  return (
    <div className="bg-gradient-to-br from-primary-container to-tertiary-container min-h-screen flex items-center justify-center p-6">
      <main className="w-full max-w-md">
        <div className="bg-surface-container-lowest rounded-2xl p-8 md:p-12 shadow-ambient-lg w-full relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-fixed/30 rounded-full blur-2xl pointer-events-none" />
          
          {/* Header */}
          <div className="text-center mb-10 relative z-10">
            <Link href="/" className="inline-flex justify-center items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-[36px] text-primary filled">school</span>
              <h1 className="text-3xl font-extrabold text-on-surface text-gradient">QuizMaster Pro</h1>
            </Link>
            <p className="text-base text-on-surface-variant font-medium">Admin Login Portal</p>
          </div>
          
          {/* Form */}
          <form action={formAction} className="space-y-6 relative z-10">
            {state?.error && (
              <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm font-medium">
                {state.error}
              </div>
            )}
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-on-surface tracking-wide">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">person</span>
                <input 
                  id="email" 
                  name="email"
                  type="email" 
                  defaultValue="admin@quizmaster.com"
                  placeholder="admin@quizmaster.com" 
                  className="w-full bg-[#F1F3FF] border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl pl-11 pr-4 py-3 text-base text-on-surface placeholder:text-outline-variant transition-all outline-none"
                  required
                />
              </div>
            </div>
            
            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-semibold text-on-surface tracking-wide">Password</label>
                <a href="#" className="text-xs font-semibold text-primary hover:text-tertiary transition-colors">Forgot?</a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">lock</span>
                <input 
                  id="password" 
                  name="password"
                  type="password" 
                  defaultValue="password123"
                  placeholder="••••••••" 
                  className="w-full bg-[#F1F3FF] border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl pl-11 pr-11 py-3 text-base text-on-surface placeholder:text-outline-variant transition-all outline-none"
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined">visibility</span>
                </button>
              </div>
            </div>
            
            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <input 
                id="remember" 
                type="checkbox" 
                className="w-5 h-5 text-primary bg-surface-container border-outline rounded focus:ring-primary focus:ring-offset-surface-container-lowest" 
              />
              <label htmlFor="remember" className="text-sm text-on-surface-variant font-medium cursor-pointer">
                Remember me on this device
              </label>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-3 mt-2">
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-gradient-to-r from-primary to-tertiary text-white font-bold py-3.5 px-6 rounded-2xl shadow-primary hover:shadow-primary-lg transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{isPending ? 'Authenticating...' : 'Secure Login'}</span>
                {!isPending && <span className="material-symbols-outlined">arrow_forward</span>}
              </button>

              <button 
                type="button" 
                disabled={isPending}
                onClick={(e) => {
                  const form = e.currentTarget.closest('form');
                  if (form) {
                    const emailInput = form.querySelector('#email') as HTMLInputElement;
                    const pwdInput = form.querySelector('#password') as HTMLInputElement;
                    if (emailInput) emailInput.value = 'admin@quizmaster.com';
                    if (pwdInput) pwdInput.value = 'password123';
                    form.requestSubmit();
                  }
                }}
                className="w-full bg-[#F1F3FF] hover:bg-[#E5E8FB] text-primary font-bold py-3.5 px-6 rounded-2xl transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed border border-transparent hover:border-primary/20"
              >
                <span className="material-symbols-outlined">play_circle</span>
                <span>Demo Login</span>
              </button>
            </div>
          </form>
          
          {/* Footer */}
          <div className="mt-8 text-center relative z-10 border-t border-surface-variant pt-6">
            <p className="text-xs text-outline font-medium">
              Protected by reCAPTCHA and subject to the QuizMaster Pro <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
