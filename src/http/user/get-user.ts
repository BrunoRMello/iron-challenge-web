import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { AuthErrorCustom } from '@/lib/auth/auth-error-custom'
import { api } from '@/helpers/api'

import { UserData } from '@/types/user';

export const getUser = async (): Promise<UserData> => {
  try {
    const response = await api.get('/user');
  
    return response.data;
  } catch (err: any) {
    console.error('🚀 ~ err:', err);

    if (err instanceof AuthErrorCustom) {
      throw err;
    }

    throw new AuthErrorCustom('unknown/error', 'Erro desconhecido ao buscar usuário.');
  }
}

export const useGetUser = (options?: Partial<UseQueryOptions<UserData, AuthErrorCustom>>) => {
  return useQuery<UserData, AuthErrorCustom>({
    queryKey: ['user', 'me'],
    queryFn: getUser,
    staleTime: 1000, 
    retry: false, 
    ...options, 
  })
}