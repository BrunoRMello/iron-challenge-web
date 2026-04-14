import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { api } from '@/helpers/api'
import { AuthErrorCustom } from '@/lib/auth/auth-error-custom'

export interface UserResult {
  _id: string
  position: number
  repetition: number
  eventId: string
  categoryId: string
  eventName: string
  eventDate: string
  categoryName: string
  weightRequirement: number
}

export const getMyResults = async (): Promise<UserResult[]> => {
  try {
    const response = await api.get('/championship/myResults')
    return response.data
  } catch (err: any) {
    throw new AuthErrorCustom(
      'championship/results-error',
      'Erro ao carregar histórico de resultados.'
    )
  }
}

export const useGetMyResults = (
  options?: Partial<UseQueryOptions<UserResult[], AuthErrorCustom>>
) => {
  return useQuery<UserResult[], AuthErrorCustom>({
    queryKey: ['my-results'],
    queryFn: getMyResults,
    ...options,
  })
}
