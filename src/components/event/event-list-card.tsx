"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/hooks/use-user"
import { useDeleteEvent } from "@/http/event/delete-event"
import { Calendar, Play, Trash2, Trophy } from "lucide-react"
import { useState } from "react"
import { EventRegistrationModal } from "./create-registration"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from 'next/link'

export interface EventCategory {
  categoryId: string
  name: string
  weightRequirement: number
  started: boolean
}

export interface Event {
  _id: string
  name: string
  description: string
  owner: string
  startDate: string
  finishDate: string
  eventDate?: string
  categories: EventCategory[]
}

interface EventListCardProps {
  events: Event[]
}

export function EventListCard({ events }: EventListCardProps) {
  const [selectedEventRegistration, setSelectedEventRegistration] = useState<Event | null>(null)
  const [selectedEventResults, setSelectedEventResults] = useState<Event | null>(null)
  const { mutate: deleteEvent, isPending } = useDeleteEvent()
  const { user } = useUser()

  function handleDelete(eventId: string) {
    deleteEvent({ eventId })
  }

  return (
    <>
      {events.map((event) => {
        const now = new Date()
        const finishDate = new Date(event.finishDate)
        const eventDate = event.eventDate ? new Date(event.eventDate) : null
        
        const isRegistrationOpen = now <= finishDate

        // Check if it's currently event day (using date only comparison)
        const isEventDay = eventDate 
          ? now.toDateString() === eventDate.toDateString()
          : false
        
        // Waiting event: Registration closed but before event day
        const isWaitingEvent = !isRegistrationOpen && eventDate && now < eventDate && !isEventDay

        return (
          <Card
            key={event._id}
            className="flex h-full flex-col justify-between"
          >
            <CardHeader className="space-y-2 relative">
              <CardTitle className="line-clamp-2 text-base font-semibold">
                {event.name}
              </CardTitle>

              {user?.uid === event.owner && (
                <Button
                  variant="ghost"
                  className="gap-2 w-min absolute -top-4 right-1"
                  onClick={() => handleDelete(event._id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Inscrições: {new Date(event.startDate).toLocaleDateString()} –{' '}
                    {new Date(event.finishDate).toLocaleDateString()}
                  </span>
                </div>
                {event.eventDate && (
                  <div className="flex items-center gap-2 font-medium text-primary">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Data do Evento: {new Date(event.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {event.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {event.categories.map((category, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                  >
                    <Trophy className="h-3 w-3" />
                    {category.name} - Máx: {category.weightRequirement}Kg
                  </Badge>
                ))}
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              {isRegistrationOpen ? (
                <Button
                  className="w-full text-secondary-foreground"
                  onClick={() => setSelectedEventRegistration(event)}
                >
                  Inscrever-se
                </Button>
              ) : isEventDay ? (
                <Button
                  className="w-full text-secondary-foreground bg-primary hover:bg-primary/90"
                  onClick={() => setSelectedEventResults(event)}
                >
                  Acompanhar Resultados
                </Button>
              ) : isWaitingEvent ? (
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  Aguardando evento
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant="secondary"
                  disabled
                >
                  Prazo expirado
                </Button>
              )}

              {selectedEventRegistration && (
                <EventRegistrationModal
                  open={!!selectedEventRegistration}
                  onOpenChange={(open) => !open && setSelectedEventRegistration(null)}
                  eventId={selectedEventRegistration._id}
                  categories={selectedEventRegistration.categories}
                />
              )}
            </CardFooter>
          </Card>
        )
      })}

      <Dialog open={!!selectedEventResults} onOpenChange={(open) => !open && setSelectedEventResults(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedEventResults?.name}</DialogTitle>
            <DialogDescription>
              Selecione uma categoria para acompanhar os resultados em tempo real.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 py-4">
            {selectedEventResults?.categories.map((category) => (
              <div key={category.categoryId} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground">Máx: {category.weightRequirement}Kg</span>
                </div>
                
                {category.started ? (
                  <Button asChild size="sm" className="gap-2">
                    <Link href={`/live/${selectedEventResults?._id}/${category.categoryId}`}>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Live
                    </Link>
                  </Button>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded">
                    Aguardando início
                  </span>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
