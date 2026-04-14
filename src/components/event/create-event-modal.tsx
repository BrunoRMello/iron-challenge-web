'use client'

import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CalendarPlus2, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { useCreateEvent } from '@/http/event/post-event'
import { storage } from '@/firebase/client'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const eventSchema = z
  .object({
    name: z.string().min(1, 'O nome é obrigatório'),
    description: z.string().min(1, 'A descrição é obrigatória'),
    startDate: z.string().min(1, 'A data inicial é obrigatória'),
    finishDate: z.string().min(1, 'A data final é obrigatória'),
    eventDate: z.string().min(1, 'A data do evento é obrigatória'),
    categories: z
      .array(
        z.object({
          name: z.string().min(1, 'O nome é obrigatório'),
          weightRequirement: z
            .number({ invalid_type_error: 'Deve ser um número' })
            .nonnegative('Não pode ser negativo'),
        }),
      )
      .min(1, 'Adicione pelo menos uma categoria'),
  })
  .refine(
    (data) => new Date(data.startDate) < new Date(data.finishDate),
    {
      message: 'A data final deve ser maior que a data inicial',
      path: ['finishDate'],
    },
  )

type EventFormData = z.infer<typeof eventSchema>

export function CreateEventModal() {
  const [open, setOpen] = useState(false)
  const [sponsorFiles, setSponsorFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const { mutateAsync: createEvent, isPending } = useCreateEvent()

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      finishDate: '',
      eventDate: '',
      categories: [{ name: '', weightRequirement: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'categories',
  })

  const onSubmit = async (data: EventFormData) => {
    const payload = {
      name: data.name,
      description: data.description,
      startDate: new Date(data.startDate).toISOString(),
      finishDate: new Date(data.finishDate).toISOString(),
      eventDate: new Date(data.eventDate).toISOString(),
      categories: data.categories.map((category) => ({
        name: category.name,
        weightRequirement: category.weightRequirement,
      })),
      sponsors: [] as string[],
    }

    try {
      if (sponsorFiles.length > 0) {
        setIsUploading(true)
        const uploadPromises = sponsorFiles.map(async (file) => {
          const fileRef = ref(storage, `sponsors/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`)
          await uploadBytes(fileRef, file)
          return getDownloadURL(fileRef)
        })
        payload.sponsors = await Promise.all(uploadPromises)
      }

      await createEvent(payload)
      form.reset()
      setSponsorFiles([])
      setOpen(false)
    } catch (err) {
      console.error('❌ Erro ao criar evento:', err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) {
          form.reset({
            name: '',
            description: '',
            startDate: '',
            finishDate: '',
            eventDate: '',
            categories: [{ name: '', weightRequirement: 0 }],
          })
          setSponsorFiles([])
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="flex size-auto items-center gap-2 rounded-lg" variant="ghost">
          <CalendarPlus2 />
          Criar Evento
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[500px]"
        onInteractOutside={(e: any) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Cadastrar novo evento:</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para cadastrar um novo evento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do evento</Label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...form.register('description')} />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sponsors">Patrocinadores (Imagens)</Label>
            <Input 
              id="sponsors" 
              type="file" 
              multiple 
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) {
                  setSponsorFiles(Array.from(e.target.files))
                }
              }} 
            />
            {sponsorFiles.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {sponsorFiles.length} arquivo(s) selecionado(s).
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="eventDate">Data do Evento</Label>
            <Input id="eventDate" type="datetime-local" {...form.register('eventDate')} />
            {form.formState.errors.eventDate && (
              <p className="text-sm text-red-500">
                {form.formState.errors.eventDate.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Início das inscrições</Label>
              <Input id="startDate" type="datetime-local" {...form.register('startDate')} />
              {form.formState.errors.startDate && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.startDate.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="finishDate">Término das inscrições</Label>
              <Input id="finishDate" type="datetime-local" {...form.register('finishDate')} />
              {form.formState.errors.finishDate && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.finishDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Categorias</Label>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-end gap-2 border-b pb-2 last:border-0"
              >
                <div className="flex-1 grid gap-1">
                  <Input
                    placeholder="Nome da categoria"
                    {...form.register(`categories.${index}.name`)}
                  />
                  {form.formState.errors.categories?.[index]?.name && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.categories[index]?.name?.message}
                    </p>
                  )}
                </div>

                <div className="w-32 grid gap-1">
                  <Input
                    type="number"
                    placeholder="Peso"
                    {...form.register(`categories.${index}.weightRequirement`, {
                      valueAsNumber: true,
                    })}
                  />
                  {form.formState.errors.categories?.[index]?.weightRequirement && (
                    <p className="text-sm text-red-500">
                      {
                        form.formState.errors.categories[index]?.weightRequirement
                          ?.message
                      }
                    </p>
                  )}
                </div>

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash className="size-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="secondary"
              onClick={() => append({ name: '', weightRequirement: 0 })}
            >
              + Adicionar categoria
            </Button>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending || isUploading} className="text-white">
              {isUploading ? 'Enviando imagens...' : isPending ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
