'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useCreateRegistration } from '@/http/event/create-registration'
import { AuthErrorCustom } from '@/lib/auth/auth-error-custom'

const registrationSchema = z.object({
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  competitorWeight: z
    .number({ invalid_type_error: 'Informe um número' })
    .positive('O peso deve ser maior que zero'),
})

type RegistrationFormData = z.infer<typeof registrationSchema>

interface Category {
  categoryId: string
  name: string
  weightRequirement: number
}

interface EventRegistrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  categories: Category[]
}

export function EventRegistrationModal({
  open,
  onOpenChange,
  eventId,
  categories,
}: EventRegistrationModalProps) {
  const { mutateAsync, isPending } = useCreateRegistration()

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      categoryId: '',
      competitorWeight: 0,
    },
  })

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      await mutateAsync({
        eventId,
        categoryId: data.categoryId,
        competitorWeight: data.competitorWeight,
      })

      toast.success('Inscrição realizada com sucesso!')
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('🔥 erro ao criar inscrição:', error)

      if (error instanceof AuthErrorCustom) {
        if (error.status === 409) {
          toast.error('Você já está inscrito nesse evento')
          return
        }

        toast.error(error.message ?? 'Erro ao realizar inscrição')
        return
      }

      toast.error('Erro inesperado. Tente novamente.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Inscrição no evento</DialogTitle>
          <DialogDescription>
            Selecione a categoria e informe seu peso.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Categoria</Label>
            <Select
              onValueChange={(value) => form.setValue('categoryId', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.categoryId} value={category.categoryId}>
                    {category.name} (máx. {category.weightRequirement}kg)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && (
              <p className="text-sm text-red-500">
                {form.formState.errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Peso do competidor (kg)</Label>
            <Input
              type="number"
              step="0.1"
              {...form.register('competitorWeight', {
                valueAsNumber: true,
              })}
            />
            {form.formState.errors.competitorWeight && (
              <p className="text-sm text-red-500">
                {form.formState.errors.competitorWeight.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full text-secondary-foreground"
            >
              Confirmar inscrição
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
