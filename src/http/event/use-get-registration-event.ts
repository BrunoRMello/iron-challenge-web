import { api } from "@/helpers/api"
import { AuthErrorCustom } from "@/lib/auth/auth-error-custom"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

type ISODateString = `${number}-${number}-${number}T${string}Z`

export interface RegistrationUserRef {
  _id: string
  name?: string
}

export interface RegistrationEventRef {
  _id: string
  name: string
  startDate: ISODateString
  finishDate: ISODateString
}

export interface RegistrationCategoryRef {
  _id: string
  started: boolean
  name: string
  weightRequirement: number
}

export interface RegistrationEventItem {
  _id: string
  userId: RegistrationUserRef
  competitorName?: string
  competitorWeight: number
  createdAt: ISODateString
  updatedAt: ISODateString
  event: RegistrationEventRef
  category: RegistrationCategoryRef
}

export type GetRegistrationEventsResponse = RegistrationEventItem[]

export type GetRegistrationEventsRequest = {
  categoryId?: string
}

export const getRegistrationEvents = async (
  params?: GetRegistrationEventsRequest
): Promise<GetRegistrationEventsResponse> => {
  try {
    const response = await api.get("/registration/events", { params })
    return response.data
  } catch (err: unknown) {
    console.error("🚀 ~ getRegistrationEvents error:", err)

    if (err instanceof AuthErrorCustom) throw err

    throw new AuthErrorCustom(
      "unknown/error",
      "Erro desconhecido ao buscar a lista de inscritos."
    )
  }
}

export const useGetRegistrationEvents = (
  params?: GetRegistrationEventsRequest,
  options?: Partial<UseQueryOptions<GetRegistrationEventsResponse, AuthErrorCustom>>
) => {
  return useQuery<GetRegistrationEventsResponse, AuthErrorCustom>({
    queryKey: ["registration-events", params?.categoryId ?? null],
    queryFn: () => getRegistrationEvents(params),
    enabled: Boolean(params?.categoryId),
    staleTime: 1000 * 60 * 10,
    retry: false,
    ...options,
  })
}
