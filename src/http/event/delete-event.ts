import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/helpers/api'
import { AuthErrorCustom } from '@/lib/auth/auth-error-custom'

export type DeleteEventRequest = {
  eventId: string
}

export const deleteEvent = async ({
  eventId,
}: DeleteEventRequest): Promise<void> => {
  try {
    await api.delete(`/event/${eventId}`)
  } catch (err: any) {
    if (err instanceof AuthErrorCustom) {
      throw err
    }

    throw new AuthErrorCustom(
      'event/delete-error',
      'Erro ao deletar o evento.',
    )
  }
}

export const useDeleteEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
