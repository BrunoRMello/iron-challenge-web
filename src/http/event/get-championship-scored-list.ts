import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { api } from "@/helpers/api";
import { AuthErrorCustom } from "@/lib/auth/auth-error-custom";
import { ChampionshipOrderListItem } from "./get-championship-order-list";

export type ScoredListParams = {
  eventId: string;
  categoryId: string;
};

export const getChampionshipScoredList = async (
  params: ScoredListParams,
): Promise<ChampionshipOrderListItem[]> => {
  try {
    const { eventId, categoryId } = params;

    const response = await api.get("/championship/scoredList", {
      params: { eventId, categoryId },
    });

    return response.data;
  } catch (err: any) {
    console.error("🚀 ~ getChampionshipScoredList ~ err:", err);

    if (err instanceof AuthErrorCustom) {
      throw err;
    }

    throw new AuthErrorCustom(
      "unknown/error",
      "Erro desconhecido ao buscar a lista de notas lançadas.",
    );
  }
};

export const useGetChampionshipScoredList = (
  params: ScoredListParams,
  options?: Partial<
    UseQueryOptions<ChampionshipOrderListItem[], AuthErrorCustom>
  >,
) => {
  return useQuery<ChampionshipOrderListItem[], AuthErrorCustom>({
    queryKey: ["championshipScoredList", params.eventId, params.categoryId],
    queryFn: () => getChampionshipScoredList(params),
    staleTime: 0, 
    retry: false,
    ...options,
  });
};
