import { z } from 'zod'
import { applyMutation } from '@/lib/server/app-state'
import type { AppMutation } from '@/lib/types'

const mutationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('save-book'),
    book: z.any(),
  }),
  z.object({
    type: z.literal('delete-book'),
    bookId: z.string().min(1),
  }),
  z.object({
    type: z.literal('toggle-book-progress'),
    bookId: z.string().min(1),
    bubbleIndex: z.number().int().min(0),
  }),
  z.object({
    type: z.literal('save-note'),
    bookId: z.string().min(1),
    note: z.any(),
  }),
  z.object({
    type: z.literal('delete-note'),
    bookId: z.string().min(1),
    noteId: z.string().min(1),
  }),
  z.object({
    type: z.literal('save-question'),
    bookId: z.string().min(1),
    question: z.any(),
  }),
  z.object({
    type: z.literal('delete-question'),
    bookId: z.string().min(1),
    questionId: z.string().min(1),
  }),
  z.object({
    type: z.literal('toggle-question-resolved'),
    bookId: z.string().min(1),
    questionId: z.string().min(1),
  }),
  z.object({
    type: z.literal('save-link'),
    bookId: z.string().min(1),
    link: z.any(),
  }),
  z.object({
    type: z.literal('delete-link'),
    bookId: z.string().min(1),
    linkId: z.string().min(1),
  }),
  z.object({
    type: z.literal('save-schedule-entry'),
    entry: z.any(),
  }),
  z.object({
    type: z.literal('delete-schedule-entry'),
    entryId: z.string().min(1),
  }),
  z.object({
    type: z.literal('save-discipline'),
    discipline: z.any(),
  }),
  z.object({
    type: z.literal('delete-discipline'),
    disciplineId: z.string().min(1),
  }),
  z.object({
    type: z.literal('update-weekly-goal'),
    weeklyGoal: z.number().int().min(1),
  }),
  z.object({
    type: z.literal('update-reading-preferences'),
    weeklyGoal: z.number().int().min(1),
    readingMinutesPerPage: z.number().min(0.1),
  }),
  z.object({
    type: z.literal('set-energy'),
    energy: z.enum(['low', 'medium', 'high', 'peak']),
  }),
  z.object({
    type: z.literal('register-greeting-click'),
  }),
])

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const mutation = mutationSchema.parse(body) as AppMutation
    const data = await applyMutation(mutation)

    return Response.json(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message ?? 'Payload invalido' : 'Erro interno'

    return Response.json(
      { error: message },
      {
        status: error instanceof z.ZodError ? 400 : 500,
      }
    )
  }
}
