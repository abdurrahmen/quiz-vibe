import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import CategoriesClient from './CategoriesClient'

export default async function AdminCategories() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch categories with question counts (using a view or count query)
  const { data: categories } = await supabase
    .from('categories')
    .select('*, questions!left(id)')

  // Calculate some stats for the UI
  const enrichedCategories = categories?.map(cat => {
    const qCount = Array.isArray(cat.questions) ? cat.questions.length : 0
    // Generate a pseudo-random target for the progress bar
    const target = qCount > 0 ? Math.ceil((qCount + 10) / 10) * 10 : 50
    return {
      ...cat,
      question_count: qCount,
      target
    }
  }).sort((a, b) => b.question_count - a.question_count) || []

  const totalCategories = enrichedCategories.length
  const totalQuestions = enrichedCategories.reduce((sum, cat) => sum + cat.question_count, 0)
  const avgPerCategory = totalCategories > 0 ? Math.round(totalQuestions / totalCategories) : 0

  return <CategoriesClient initialCategories={enrichedCategories} stats={{ totalCategories, totalQuestions, avgPerCategory }} />
}
