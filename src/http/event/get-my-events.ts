import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { api } from '@/helpers/api'
import { AuthErrorCustom } from '@/lib/auth/auth-error-custom'

type ISODateString = `${number}-${number}-${number}T${string}Z`

export interface EventCategory {
  categoryId: string
  name: string
  weightRequirement: number
}

export interface Event {
  _id: string
  name: string
  description: string
  startDate: ISODateString
  finishDate: ISODateString
  eventDate: ISODateString
  categories: EventCategory[]
  organizer: string
  createdAt: ISODateString
  updatedAt: ISODateString
  __v: number
}

export type GetMyEventsResponse = Event[]

export const getMyEvents = async (): Promise<GetMyEventsResponse> => {
  try {
    const response = await api.get('/event/my')
    return response.data
  } catch (err: unknown) {
    console.error('🚀 ~ getMyEvents error:', err)

    if (err instanceof AuthErrorCustom) {
      throw err
    }

    throw new AuthErrorCustom(
      'unknown/error',
      'Erro desconhecido ao buscar seus eventos.'
    )
  }
}

export const useGetMyEvents = (
  options?: Partial<UseQueryOptions<GetMyEventsResponse, AuthErrorCustom>>
) => {
  return useQuery<GetMyEventsResponse, AuthErrorCustom>({
    queryKey: ['my-events'],
    queryFn: getMyEvents,
    ...options,
  })
}
