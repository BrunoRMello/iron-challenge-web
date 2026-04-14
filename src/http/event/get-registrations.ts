import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { api } from '@/helpers/api'
import { AuthErrorCustom } from '@/lib/auth/auth-error-custom'

export interface RegistrationEvent {
  _id: string
  name: string
  startDate: string
  finishDate: string
}

export interface RegistrationCategory {
  _id: string
  name: string
  weightRequirement: number
}

export interface Registration {
  _id: string
  userId: string
  competitorWeight: number
  createdAt: string
  updatedAt: string
  event: RegistrationEvent
  category: RegistrationCategory
}

export const getRegistrations = async (): Promise<Registration[]> => {
  try {
    const response = await api.get('/registration/me')

    return response.data
  } catch (err: any) {
    console.error('🚀 ~ err:', err)

    if (err instanceof AuthErrorCustom) {
      throw err
    }

    throw new AuthErrorCustom(
      'unknown/error',
      'Erro desconhecido ao buscar as inscrições do usuário.'
    )
  }
}

export const useGetRegistrations = (
  options?: Partial<UseQueryOptions<Registration[], AuthErrorCustom>>
) => {
  return useQuery<Registration[], AuthErrorCustom>({
    queryKey: ['registrations'],
    queryFn: getRegistrations,
    ...options,
  })
}
