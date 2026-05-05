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
