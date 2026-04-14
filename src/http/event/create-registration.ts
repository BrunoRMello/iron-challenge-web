'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

import { api } from '@/helpers/api'
import { AuthErrorCustom } from '@/lib/auth/auth-error-custom'

export interface CreateRegistrationPayload {
  eventId: string
  categoryId: string
  competitorWeight: number
}

export const createRegistration = async (
  payload: CreateRegistrationPayload
): Promise<void> => {
  try {
    await api.post('/registration', payload)
  } catch (err: any) {
    console.error('🚀 ~ err:', err)

    if (err instanceof AuthErrorCustom) {
      throw err
    }

    if (err instanceof AxiosError && err.response) {
      throw new AuthErrorCustom(
        `registration/${err.response.status}`,
        err.response.data?.message ?? 'Erro ao realizar inscrição no evento.',
        err.response.status
      )
    }

    throw new AuthErrorCustom(
      'unknown/error',
      'Erro ao realizar inscrição no evento.'
    )
  }
}

export const useCreateRegistration = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRegistration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
    },
  })
}
