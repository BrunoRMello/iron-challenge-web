import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/helpers/api'
import { AuthErrorCustom } from '@/lib/auth/auth-error-custom'
import { EventCategory, EventData } from '@/types/event'

export type CreateEventRequest = {
  name: string
  description: string
  startDate: string
  finishDate: string
  eventDate: string
  categories: Omit<EventCategory, 'categoryId'>[]
  sponsors?: string[]
}

export const createEvent = async (
  data: CreateEventRequest,
): Promise<EventData> => {
  try {
    const response = await api.post('/event', data)

    return response.data
  } catch (err: any) {
    console.error('🚀 ~ createEvent ~ err:', err)

    if (err instanceof AuthErrorCustom) {
      throw err
    }

    const errorMessage = err.response?.data?.message 
      || err.response?.data?.error 
      || 'Erro ao criar o evento.'

    throw new AuthErrorCustom(
      'event/create-error',
      errorMessage,
    )
  }
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
