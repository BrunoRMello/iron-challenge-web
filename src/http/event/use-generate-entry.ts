import { api } from '@/helpers/api'
import { AuthErrorCustom } from '@/lib/auth/auth-error-custom'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export type GenerateEntryRequest = {
  eventId: string
  categoryId: string
}

export const generateEntry = async (
  params: GenerateEntryRequest,
): Promise<unknown> => {
  try {
    const response = await api.post(
      '/championship/generateEntry',
      null, 
      { params },
    )

    return response.data
  } catch (err: any) {
    console.error('🚀 ~ generateEntry ~ err:', err)

    if (err instanceof AuthErrorCustom) throw err

    throw new AuthErrorCustom(
      'championship/generate-entry-error',
      'Erro ao gerar as entradas do campeonato.',
    )
  }
}

export const useGenerateEntry = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: generateEntry,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['registration-events', variables.categoryId],
      })

      queryClient.invalidateQueries({ queryKey: ['championshipEntries'] })
    },
  })
}
