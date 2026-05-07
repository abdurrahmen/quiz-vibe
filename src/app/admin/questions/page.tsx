import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import QuestionsClient from './QuestionsClient'

export default async function AdminQuestions() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch questions and categories
  const { data: questions } = await supabase
    .from('questions')
    .select('*, category:categories(name)')
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <main className="flex-1 p-6 md:p-8 flex flex-col gap-8">
      <QuestionsClient initialQuestions={questions || []} categories={(categories as any) || []} />
    </main>
  )
}
