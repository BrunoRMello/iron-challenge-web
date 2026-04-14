import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { api } from '@/helpers/api'
import { AuthErrorCustom } from '@/lib/auth/auth-error-custom'

export interface EventCategory {
  categoryId: string
  name: string
  weightRequirement: number
  started: boolean
}

export interface Event {
  _id: string
  name: string
  owner: string
  description: string
  startDate: string
  finishDate: string
  eventDate?: string
  categories: EventCategory[]
  organizer: string
  createdAt: string
  updatedAt: string
}

export const getEvents = async (): Promise<Event[]> => {
  try {
    const response = await api.get('/event/active')

    return response.data
  } catch (err: any) {
    console.error('🚀 ~ err:', err)

    if (err instanceof AuthErrorCustom) {
      throw err
    }

    throw new AuthErrorCustom(
      'unknown/error',
      'Erro desconhecido ao buscar eventos.'
    )
  }
}

export const useGetEvents = (
  options?: Partial<UseQueryOptions<Event[], AuthErrorCustom>>
) => {
  return useQuery<Event[], AuthErrorCustom>({
    queryKey: ['events'],
    queryFn: getEvents,
    staleTime: 1000, // 10 minutos
    retry: false,
    ...options,
  })
}
