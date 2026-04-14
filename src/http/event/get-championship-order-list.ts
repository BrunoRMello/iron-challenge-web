import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { api } from "@/helpers/api";
import { AuthErrorCustom } from "@/lib/auth/auth-error-custom";

export type OrderListParams = {
  eventId: string;
  categoryId: string;
};

export type OrderListUser = {
  _id: string;
  name: string;
};

export type ChampionshipOrderListItem = {
  _id: string;
  userId: OrderListUser;
  eventId: string;
  categoryId: string;
  entryOrder: number;
  attended: boolean | null;
  repetition: number | null;
  position: number | null;
  v: number;
  createdAt: string;
  updatedAt: string;
};

export const getChampionshipOrderList = async (
  params: OrderListParams,
): Promise<ChampionshipOrderListItem[]> => {
  try {
    const { eventId, categoryId } = params;

    const response = await api.get("/championship/orderList", {
      params: { eventId, categoryId },
    });

    return response.data;
  } catch (err: any) {
    console.error("🚀 ~ getChampionshipOrderList ~ err:", err);

    if (err instanceof AuthErrorCustom) {
      throw err;
    }

    throw new AuthErrorCustom(
      "unknown/error",
      "Erro desconhecido ao buscar a lista de ordem dos competidores.",
    );
  }
};

export const useGetChampionshipOrderList = (
  params: OrderListParams,
  options?: Partial<
    UseQueryOptions<ChampionshipOrderListItem[], AuthErrorCustom>
  >,
) => {
  return useQuery<ChampionshipOrderListItem[], AuthErrorCustom>({
    queryKey: ["championshipOrderList", params.eventId, params.categoryId],
    queryFn: () => getChampionshipOrderList(params),
    staleTime: 1000 * 60 * 10, // 10 minutos
    retry: false,
    ...options,
  });
};
