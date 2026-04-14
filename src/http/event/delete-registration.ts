import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/helpers/api'
import { AuthErrorCustom } from '@/lib/auth/auth-error-custom'

export type DeleteRegistrationRequest = {
  registrationId: string
}

export const deleteRegistration = async ({
  registrationId,
}: DeleteRegistrationRequest): Promise<void> => {
  try {
    await api.delete(`/registration/${registrationId}`)
  } catch (err: any) {
    if (err instanceof AuthErrorCustom) {
      throw err
    }

    throw new AuthErrorCustom(
      'registration/delete-error',
      'Erro ao deletar a inscrição.',
    )
  }
}

export const useDeleteRegistration = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteRegistration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
    },
  })
}
