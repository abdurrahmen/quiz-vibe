'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/utils/supabase/client'
import type { Category } from '@/lib/types'
import StartQuizModal from '@/components/StartQuizModal'
import RequestQuizModal from '@/components/RequestQuizModal'
import { Wrapper3D } from '@/components/ui/3d-wrapper'
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation'
import { AnimatedCounter } from '@/components/AnimatedCounter'
export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState({ questions: 0, categories: 0, attempts: 0 })
  const [showStartModal, setShowStartModal] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function loadData() {
      const [catRes, qRes, attRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('questions').select('id', { count: 'exact', head: true }),
        supabase.from('quiz_attempts').select('id', { count: 'exact', head: true }),
      ])
      if (catRes.data) setCategories(catRes.data)
      setStats({
        questions: qRes.count ?? 0,
        categories: catRes.data?.length ?? 0,
        attempts: attRes.count ?? 0,
      })
    }

    loadData()
  }, [])

  const categoryIcons: Record<string, string> = {
    Science: 'science',
    Mathematics: 'calculate',
    History: 'history_edu',
    Literature: 'menu_book',
    Technology: 'memory',
    'General Knowledge': 'lightbulb',
  }

  const categoryColors: Record<string, string> = {
    Science: 'from-blue-500 to-indigo-600',
    Mathematics: 'from-purple-500 to-indigo-700',
    History: 'from-rose-500 to-pink-700',
    Literature: 'from-violet-500 to-purple-700',
    Technology: 'from-indigo-500 to-blue-700',
    'General Knowledge': 'from-orange-400 to-rose-600',
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-80 border-b border-slate-100/80 shadow-ambient">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-extrabold tracking-tight text-gradient">
            QuizMaster Pro
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-slate-600 hover:text-primary transition-colors font-medium">Features</Link>
            <Link href="#categories" className="text-slate-600 hover:text-primary transition-colors font-medium">Categories</Link>
            <Link href="/leaderboard" className="text-slate-600 hover:text-primary transition-colors font-medium">Leaderboard</Link>
            <Link href="/duel" className="flex items-center gap-1.5 text-slate-600 hover:text-primary transition-colors font-medium">
              <span className="text-yellow-500">⚡</span> Duel
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="hidden md:inline-flex px-4 py-2 text-sm font-semibold text-primary bg-primary-fixed rounded-lg hover:bg-primary/10 transition-colors"
            >
              Admin Login
            </Link>
            <button
              onClick={() => setShowStartModal(true)}
              className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-linear-to-r from-primary to-tertiary shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 transition-all"
            >
              Start Quiz
            </button>
            <button
              onClick={() => setShowRequestModal(true)}
              className="hidden md:inline-flex px-4 py-2 text-sm font-semibold text-tertiary bg-tertiary-fixed rounded-lg hover:bg-tertiary/10 transition-colors items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">request_quote</span>
              Request Quiz
            </button>
            <button
              className="md:hidden p-2 text-slate-600 hover:text-primary"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-3 animate-fade-in">
            <Link href="#features" className="text-slate-700 font-medium py-2" onClick={() => setMenuOpen(false)}>Features</Link>
            <Link href="#categories" className="text-slate-700 font-medium py-2" onClick={() => setMenuOpen(false)}>Categories</Link>
            <Link href="/leaderboard" className="text-slate-700 font-medium py-2" onClick={() => setMenuOpen(false)}>Leaderboard</Link>
            <Link href="#how-it-works" className="text-slate-700 font-medium py-2" onClick={() => setMenuOpen(false)}>How It Works</Link>
            <Link href="/duel" className="text-yellow-600 font-semibold py-2 flex items-center gap-2" onClick={() => setMenuOpen(false)}>⚡ Duel Mode</Link>
            <button onClick={() => { setShowRequestModal(true); setMenuOpen(false) }} className="text-tertiary font-semibold py-2 text-left">Request a Quiz</button>
            <Link href="/admin/login" className="text-primary font-semibold py-2">Admin Login</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <BackgroundGradientAnimation
        gradientBackgroundStart="rgb(77, 65, 223)"
        gradientBackgroundEnd="rgb(41, 73, 225)"
        firstColor="255, 255, 255"
        secondColor="240, 248, 255"
        thirdColor="245, 245, 255"
        fourthColor="220, 230, 255"
        fifthColor="255, 250, 250"
        sixthColor="250, 240, 255"
        seventhColor="245, 250, 255"
        pointerColor="255, 255, 255"
        size="80%"
        interactive={true}
        containerClassName="h-auto w-full relative rounded-b-[3rem] md:rounded-b-[4rem]"
        className="relative z-50 pt-24 pb-28 px-6"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium w-fit">
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              AI-Powered Learning Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Test Your<br />
              <span className="text-yellow-300">Knowledge</span>
            </h1>
            <p className="text-lg text-white/90 max-w-lg leading-relaxed font-medium">
              Challenge yourself with expertly crafted quizzes. Elevate your learning through
              engaging assessments and insightful analytics.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <button
                onClick={() => setShowStartModal(true)}
                className="flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <span className="material-symbols-outlined">rocket_launch</span>
                Start Quiz Now
              </button>
              <Link
                href="/duel"
                className="flex items-center gap-2 bg-yellow-400/90 text-yellow-900 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                ⚡ Challenge a Friend
              </Link>
              <Link
                href="#how-it-works"
                className="flex items-center gap-2 border-2 border-white/60 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 transition-all"
              >
                Learn More
                <span className="material-symbols-outlined">arrow_downward</span>
              </Link>
              <button
                onClick={() => setShowRequestModal(true)}
                className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/25 transition-all"
              >
                <span className="material-symbols-outlined">request_quote</span>
                Request a Quiz
              </button>
            </div>
          </div>

          {/* Hero visual — floating */}
          <div className="relative animate-float">
            <Wrapper3D maxRotation={20} translateZ={60} perspective={false} className="w-full">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-2xl">
                <div className="bg-white rounded-xl p-5 shadow-lg mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-sm">quiz</span>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant font-medium">QUESTION 12 OF 40</p>
                      <div className="w-32 h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-primary rounded-full" style={{ width: '30%' }} />
                      </div>
                    </div>
                    <span className="ml-auto text-sm font-bold text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">timer</span>
                      04:32
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-on-surface mb-3">What does AI stand for in computer science?</p>
                  {['Automated Integration', 'Artificial Intelligence ✓', 'Advanced Informatics', 'Applied Interpolation'].map((opt, i) => (
                    <div
                      key={i}
                      className={`text-xs p-2.5 rounded-lg mb-2 border-2 transition-all ${i === 1
                        ? 'border-primary bg-primary-fixed text-primary font-semibold'
                        : 'border-surface-variant bg-surface text-on-surface-variant'
                        }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Score', value: '85%', icon: 'trending_up' },
                    { label: 'Correct', value: '31', icon: 'check_circle' },
                    { label: 'Time Left', value: '2:15', icon: 'timer' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center border border-white/30">
                      <span className="material-symbols-outlined text-white/80 text-base">{s.icon}</span>
                      <div className="text-white font-bold text-lg">{s.value}</div>
                      <div className="text-white/70 text-xs">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Wrapper3D>
          </div>
        </div>
      </BackgroundGradientAnimation>

      {/* Stats Bar */}
      <section className="bg-primary-fixed border-y border-surface-variant py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { label: 'Total Questions', value: stats.questions > 0 ? stats.questions : 50, suffix: stats.questions > 0 ? '+' : 'K+', icon: 'quiz' },
            { label: 'Categories', value: stats.categories > 0 ? stats.categories : 120, suffix: stats.categories > 0 ? '' : '+', icon: 'category' },
            { label: 'Quizzes Taken', value: stats.attempts > 0 ? stats.attempts : 2, suffix: stats.attempts > 0 ? '+' : 'M+', icon: 'school' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-1">
                <span className="material-symbols-outlined">{s.icon}</span>
              </div>
              <div className="text-4xl font-extrabold text-primary">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-extrabold text-on-surface mb-4">Why Choose QuizMaster Pro</h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto font-medium leading-relaxed">
              Discover the tools you need to assess, learn, and grow effectively.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: 'category',
                title: 'Diverse Topics',
                desc: 'Access hundreds of professionally created quizzes across numerous categories to test your expertise.',
                bg: 'bg-primary-fixed',
                color: 'text-primary',
              },
              {
                icon: 'bolt',
                title: 'Instant Results',
                desc: 'Get immediate feedback with detailed explanations to help you understand mistakes and learn faster.',
                bg: 'bg-tertiary-fixed',
                color: 'text-tertiary',
              },
              {
                icon: 'monitoring',
                title: 'Track Progress',
                desc: 'Visualize your learning journey with comprehensive analytics and personalized improvement recommendations.',
                bg: 'bg-secondary-fixed',
                color: 'text-secondary',
              },
              {
                icon: 'auto_awesome',
                title: 'AI Generation',
                desc: 'Leverage artificial intelligence to generate custom questions on any topic at any difficulty level.',
                bg: 'bg-primary-fixed',
                color: 'text-primary',
              },
              {
                icon: 'tune',
                title: 'Customizable',
                desc: 'Choose your category, difficulty, and question count to create the perfect quiz session for you.',
                bg: 'bg-tertiary-fixed',
                color: 'text-tertiary',
              },
              {
                icon: 'security',
                title: 'Admin Control',
                desc: 'Full administrative dashboard to manage questions, categories, and monitor student performance.',
                bg: 'bg-secondary-fixed',
                color: 'text-secondary',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-7 shadow-ambient hover:shadow-ambient-lg hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4"
              >
                <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center ${f.color}`}>
                  <span className="material-symbols-outlined">{f.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface">{f.title}</h3>
                <p className="text-on-surface-variant leading-relaxed text-[15px]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-24 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-extrabold text-on-surface mb-4">Explore Categories</h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto font-medium leading-relaxed">
              Pick a subject that interests you and start testing your knowledge.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.length > 0 ? categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onClick={() => setShowStartModal(true)}
                className="group relative bg-white rounded-2xl p-6 shadow-ambient hover:shadow-ambient-lg transition-all duration-300 overflow-hidden text-left"
              >
                <div className={`absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-5 transition-opacity ${categoryColors[cat.name] || 'from-primary to-tertiary'}`} />
                <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${categoryColors[cat.name] || 'from-primary to-tertiary'} flex items-center justify-center text-white mb-4 shadow-md`}>
                  <span className="material-symbols-outlined">{categoryIcons[cat.name] || 'category'}</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-1">{cat.name}</h3>
                <p className="text-sm text-on-surface-variant mb-4">{cat.description || 'Explore this category'}</p>
                <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                  <span>Start Quiz</span>
                  <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </motion.button>
            )) : (
              // Skeleton loading
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-ambient animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high mb-4" />
                  <div className="h-5 bg-surface-container-high rounded mb-2 w-2/3" />
                  <div className="h-4 bg-surface-container-high rounded mb-4 w-full" />
                  <div className="h-4 bg-surface-container-high rounded w-1/3" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-extrabold text-on-surface mb-4">How It Works</h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto font-medium leading-relaxed">
              Get started in three simple steps and begin your learning journey.
            </p>
          </motion.div>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-surface-variant -translate-y-1/2 hidden md:block z-0" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {[
                { step: '1', title: 'Enter Username', desc: 'Create your profile quickly and choose your areas of interest.', icon: 'person' },
                { step: '2', title: 'Answer Questions', desc: 'Engage with beautifully designed, interactive questions.', icon: 'quiz' },
                { step: '3', title: 'Get Results', desc: 'Review your performance instantly with detailed analytics.', icon: 'analytics' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  className="flex flex-col items-center text-center gap-4 bg-surface-container-low p-6"
                >
                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary to-tertiary text-white flex items-center justify-center text-xl font-extrabold shadow-primary border-4 border-surface-container-low">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-bold text-on-surface">{s.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed text-[15px]">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => setShowStartModal(true)}
              className="inline-flex items-center gap-2 bg-linear-to-r from-primary to-tertiary text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined">rocket_launch</span>
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="bg-surface-container-highest py-12 px-6"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-extrabold text-gradient">QuizMaster Pro</div>
          <div className="flex gap-8 text-sm text-on-surface-variant font-medium">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/admin/login" className="hover:text-primary transition-colors">Admin</Link>
          </div>
          <p className="text-sm text-on-surface-variant">© 2026 QuizMaster Pro. All rights reserved.</p>
        </div>
      </motion.footer>

      {/* Modals with AnimatePresence */}
      <AnimatePresence>
        {showStartModal && (
          <StartQuizModal
            onClose={() => setShowStartModal(false)}
            categories={categories}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRequestModal && (
          <RequestQuizModal
            onClose={() => setShowRequestModal(false)}
            categories={categories}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
