'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function deleteQuestion(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/questions')
  return { success: true }
}

export async function updateQuestion(id: string, data: any) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from('questions')
    .update(data)
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/questions')
  return { success: true }
}

export async function bulkDeleteQuestions(ids: string[]) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from('questions')
    .delete()
    .in('id', ids)

  if (error) return { error: error.message }
  revalidatePath('/admin/questions')
  return { success: true }
}

export async function createQuestion(data: any) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from('questions')
    .insert([data])

  if (error) return { error: error.message }
  revalidatePath('/admin/questions')
  return { success: true }
}
