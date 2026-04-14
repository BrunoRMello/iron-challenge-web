import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/helpers/api'
import { AuthErrorCustom } from '@/lib/auth/auth-error-custom'
import { UserData } from '@/types/user'

export type UpdateUserRequest = Partial<Omit<UserData, '_id' | 'createdAt' | 'updatedAt' | '__v' | 'token'>>

export const updateUser = async (data: UpdateUserRequest): Promise<UserData> => {
  try {
    const response = await api.put('/user', data);

    return response.data;
  } catch (err: any) {
    console.error('🚀 ~ updateUser ~ err:', err);

    if (err instanceof AuthErrorCustom) {
      throw err;
    }

    throw new AuthErrorCustom('update/error', 'Erro ao atualizar os dados do perfil.');
  }
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}