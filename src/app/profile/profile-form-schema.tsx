import { z } from 'zod'

export const profileUserSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),

  cpf: z
    .string()
    .min(1, 'O CPF é obrigatório.')
    .min(11, 'O CPF deve ter no mínimo 11 caracteres.'),

  birthDate: z
    .string()
    .min(1, 'A data de nascimento é obrigatória.'),

  role: z.enum(['admin', 'user'], {
    errorMap: () => ({ message: 'O cargo é obrigatório.' }),
  }),

  sex: z.enum(['M', 'F'], {
    errorMap: () => ({ message: 'O sexo é obrigatório.' }),
  }),

  phone: z
    .string()
    .min(10, 'O telefone é obrigatório.'),

  email: z
    .string()
    .min(1, 'O email é obrigatório.')
    .email('O formato do email é inválido.'),

  address: z.object({
    street: z.string().min(1, 'A rua é obrigatória.'),
    number: z.coerce.number().min(1, 'O número é obrigatório.'),
    neighborhood: z.string().min(1, 'O bairro é obrigatório.'),
    complement: z.string().optional(),
    city: z.string().min(1, 'A cidade é obrigatória.'),
    uf: z.string().min(2, 'O UF é obrigatório.').max(2),
    zipCode: z.string().min(8, 'O CEP é obrigatório.'),
  }),
  avatar: z.string().optional(),
})
