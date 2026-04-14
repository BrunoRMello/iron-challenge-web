import { useQuery } from '@tanstack/react-query'

import { api } from '@/helpers/api'

export interface ChampionshipResultItem {
  userId: string
  name: string
  avatar?: string | null
  repetition: number | null
  attended: boolean | null
  position: number
}

interface GetChampionshipResultRequest {
  eventId: string
  categoryId: string
}

interface GetChampionshipResultResponse {
  eventId: string
  categoryId: string
  results: ChampionshipResultItem[]
  sponsors: string[]
}

export async function getChampionshipResult({
  eventId,
  categoryId,
}: GetChampionshipResultRequest): Promise<GetChampionshipResultResponse> {
  const result = await api.get<GetChampionshipResultResponse>('championship/result', {
    params: { eventId, categoryId },
  })

  return result.data
}

export function useGetChampionshipResult(
  { eventId, categoryId }: GetChampionshipResultRequest,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['championship-result', eventId, categoryId],
    queryFn: () => getChampionshipResult({ eventId, categoryId }),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}
