import { z } from 'zod'

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'O email é obrigatório.')
    .email('O formato do email é inválido.'),
  password: z.string().min(1, 'A senha é obrigatória.'),
})