import { z } from 'zod'

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'O email é obrigatório.')
    .email('O formato do email é inválido.'),
})