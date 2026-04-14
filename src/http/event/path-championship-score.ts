"use client"

import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query"

import { api } from "@/helpers/api"
import { AuthErrorCustom } from "@/lib/auth/auth-error-custom"

export type ChampionshipScoreBody = {
  _id: string
  eventId: string
  categoryId: string
  repetition: number
  attended: boolean
}

export type ChampionshipScoreResponse = unknown

export const pathChampionshipScore = async (
  body: ChampionshipScoreBody
): Promise<ChampionshipScoreResponse> => {
  try {
    const response = await api.patch("/championship/score", body)
    return response.data
  } catch (err: any) {
    console.error("🚀 ~ postChampionshipScore ~ err:", err)

    if (err instanceof AuthErrorCustom) {
      throw err
    }

    throw new AuthErrorCustom(
      "unknown/error",
      "Erro desconhecido ao lançar a pontuação do competidor."
    )
  }
}

export const usePathChampionshipScore = (
  options?: Partial<
    UseMutationOptions<
      ChampionshipScoreResponse,
      AuthErrorCustom,
      ChampionshipScoreBody
    >
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<
    ChampionshipScoreResponse,
    AuthErrorCustom,
    ChampionshipScoreBody
  >({
    mutationFn: pathChampionshipScore,
    retry: false,

    onSuccess: () => {
      queryClient.invalidateQueries({
        // @ts-ignore
        queryKey: ["championshipOrderList"],
      })
    },

    ...options,
  })
}