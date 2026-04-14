'use client'

import { EventListCard } from '@/components/event/event-list-card'
import { Header } from '@/components/header'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetEvents } from '@/http/event/get-events'

export default function Home() {
  const { data: events, isLoading, error } = useGetEvents()

  return (
    <div className="flex size-full min-h-screen flex-col items-center">
      <Header />

      <main className="flex w-full max-w-7xl flex-col gap-4 p-4">
        <h1 className="text-2xl font-semibold">Eventos:</h1>

        {error && <p className="text-destructive">{error.message}</p>}

        <div
          className="
            grid w-full gap-4
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4 rounded-xl border p-4">
                   <Skeleton className="aspect-video w-full rounded-lg" />
                   <div className="space-y-2">
                     <Skeleton className="h-4 w-3/4" />
                     <Skeleton className="h-4 w-1/2" />
                   </div>
                   <Skeleton className="mt-4 h-9 w-full" />
                </div>
              ))
            : <EventListCard events={events ?? []} />
          }
        </div>
      </main>
    </div>
  )
}
