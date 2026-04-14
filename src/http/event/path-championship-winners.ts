"use client"

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

import { api } from "@/helpers/api"
import { AuthErrorCustom } from "@/lib/auth/auth-error-custom"

export type ChampionshipWinnersParams = {
  eventId: string
  categoryId: string
}

export type ChampionshipWinnersResult = {
  userId: string
  name: string
  repetition: number
  attended: boolean
  position: number
}

export type ChampionshipWinnersResponse = {
  eventId: string
  categoryId: string
  results: ChampionshipWinnersResult[]
}

export const pathChampionshipWinners = async (
  params: ChampionshipWinnersParams
): Promise<ChampionshipWinnersResponse> => {
  try {
    const response = await api.patch("/championship/winners", null, {
      params,
    })

    const data = response.data

    const safe: ChampionshipWinnersResponse = {
      eventId: data?.eventId ?? params.eventId,
      categoryId: data?.categoryId ?? params.categoryId,
      results: Array.isArray(data?.results) ? data.results : [],
    }

    return safe
  } catch (err: any) {
    console.error("🚀 ~ pathChampionshipWinners ~ err:", err)

    if (err instanceof AuthErrorCustom) {
      throw err
    }

    throw new AuthErrorCustom(
      "unknown/error",
      "Erro desconhecido ao buscar os vencedores do campeonato."
    )
  }
}

export const usePathChampionshipWinners = (
  params: ChampionshipWinnersParams,
  options?: Partial<
    UseQueryOptions<ChampionshipWinnersResponse, AuthErrorCustom>
  >
) => {
  return useQuery<ChampionshipWinnersResponse, AuthErrorCustom>({
    queryKey: ["championshipWinners", params.eventId, params.categoryId],
    queryFn: () => pathChampionshipWinners(params),
    staleTime: 1000 * 60 * 10,
    retry: false,
    ...options,
  })
}
