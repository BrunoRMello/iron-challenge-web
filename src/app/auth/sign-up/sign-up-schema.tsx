import { z } from "zod"

export const signUpSchema = z
  .object({
    displayName: z.string().min(1, "O nome é obrigatório."),
    email: z
      .string()
      .min(1, 'O email é obrigatório.')
      .email('O formato do email é inválido.'),
    password: z
      .string()
      .min(1, 'A senha é obrigatória.')
      .min(8, 'A senha deve ter pelo menos 8 caracteres.')
      .regex(/[A-Za-z]/, 'A senha deve conter pelo menos uma letra.')
      .regex(/[0-9]/, 'A senha deve conter pelo menos um número.')
      .regex(
        /[^A-Za-z0-9]/,
        'A senha deve conter pelo menos um caractere especial.',
      ),
    confirmPassword: z.string().min(1, 'A confirmação de senha é obrigatória.'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        message: 'As senhas não correspondem.',
        path: ['confirmpPassword'],
        code: 'custom',
      })
    }
  })