'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function generateQuestions(params: {
  topic: string
  difficulty: string
  questionType: string
  count: number
  additionalInstructions: string
}) {
  if (!process.env.GEMINI_API_KEY) {
    return { error: 'GEMINI_API_KEY is not set in your environment variables. Please add it to .env.local to use the AI Generator.' }
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

  const prompt = `You are an expert quiz creator. Generate ${params.count} questions about "${params.topic}".
Difficulty level: ${params.difficulty}
Question Type: ${params.questionType}
Additional instructions: ${params.additionalInstructions || 'None'}

You MUST return a raw JSON array of objects. Do not wrap in markdown \`\`\`json tags. 
Each object must have exactly these keys and types:
- "question_text" (string)
- "type" (string, strictly "${params.questionType}")
- "difficulty" (string, strictly "${params.difficulty}")
- "options" (array of strings. For MCQ/SCQ must be 4 options. For TF must be exactly ["True", "False"])
- "correct_answers" (array of numbers. Indices into the options array. For MCQ can be multiple. For SCQ/TF must be single)
- "explanation" (string)
- "points" (number: 1 for easy, 2 for medium, 3 for hard)

Return ONLY the JSON array.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Try to parse the JSON. Remove markdown formatting if the model still outputs it
    let cleanedText = text.trim()
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json/, '').replace(/```$/, '').trim()
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```/, '').replace(/```$/, '').trim()
    }

    const jsonResponse = JSON.parse(cleanedText)
    
    if (!Array.isArray(jsonResponse)) {
      throw new Error('AI did not return an array')
    }

    return { data: jsonResponse }
  } catch (error: any) {
    console.error('AI Generation Error:', error)
    return { error: error.message || 'Failed to generate questions or parse AI response.' }
  }
}

export async function createCategoryAction(name: string, icon: string, color: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, icon, color })
    .select()
    .single()
  
  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/')
  return { data }
}
