'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Trash2, Trophy, Weight } from 'lucide-react'
import { useState } from 'react'
import { useDeleteRegistration } from '@/http/event/delete-registration'

export interface RegistrationEvent {
  _id: string
  name: string
  startDate: string
  finishDate: string
  eventDate?: string
}

export interface RegistrationCategory {
  _id: string
  name: string
  weightRequirement: number
}

export interface Registration {
  _id: string
  competitorWeight: number
  createdAt: string
  updatedAt: string
  event: RegistrationEvent
  category: RegistrationCategory
}

interface RegistrationListCardProps {
  registrations: Registration[]
}

export function RegistrationListCard({
  registrations,
}: RegistrationListCardProps) {
  const { mutate: deleteRegistration, isPending } = useDeleteRegistration()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleDelete(registrationId: string) {
    setDeletingId(registrationId)

    deleteRegistration(
      { registrationId },
      {
        onSettled: () => setDeletingId(null),
      }
    )
  }

  return (
    <>
      {registrations.map((registration) => (
        <Card
          key={registration._id}
          className="flex h-full flex-col justify-between"
        >
          <CardHeader className="space-y-2 relative">
            <CardTitle className="line-clamp-2 text-base font-semibold">
              {registration.event?.name ?? 'Evento Excluído'}
            </CardTitle>

            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Inscrições: {registration.event?.startDate ? new Date(registration.event.startDate).toLocaleDateString() : 'N/A'} –{' '}
                  {registration.event?.finishDate ? new Date(registration.event.finishDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              {registration.event?.eventDate && (
                <div className="flex items-center gap-2 font-medium text-primary">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Data do Evento: {new Date(registration.event.eventDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="flex items-center gap-1 text-xs"
              >
                <Trophy className="h-3 w-3" />
                {registration.category?.name ?? 'Categoria Excluída'}
              </Badge>

              <Badge
                variant="outline"
                className="flex items-center gap-1 text-xs"
              >
                <Weight className="h-3 w-3" />
                {registration.competitorWeight} Kg
              </Badge>
            </div>

            {(registration.category?.weightRequirement ?? 0) > 0 && (
              <p className="text-xs text-muted-foreground">
                Peso máximo da categoria:{' '}
                <strong>{registration.category.weightRequirement} Kg</strong>
              </p>
            )}
          </CardContent>

          <CardFooter className="pt-0">
            <Button
              variant="destructive"
              className="w-full"
              disabled={isPending && deletingId === registration._id}
              onClick={() => handleDelete(registration._id)}
            >
              {isPending && deletingId === registration._id
                ? 'Cancelando...'
                : 'Cancelar inscrição'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </>
  )
}
