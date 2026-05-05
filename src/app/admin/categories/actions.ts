'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createCategory(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const icon = formData.get('icon') as string || 'category'
  const color = formData.get('color') as string || '#4d41df'

  if (!name) {
    return { error: 'Category name is required' }
  }

  const { error } = await supabase.from('categories').insert({
    name,
    description,
    icon,
    color
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/') // Revalidate public home page too
  return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const icon = formData.get('icon') as string
  const color = formData.get('color') as string

  if (!name) {
    return { error: 'Category name is required' }
  }

  const { error } = await supabase
    .from('categories')
    .update({ name, description, icon, color })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/')
  return { success: true }
}

export async function deleteCategory(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/')
  return { success: true }
}
