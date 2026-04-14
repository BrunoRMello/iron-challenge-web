'use client'

import { Header } from '@/components/header'
import { ResultListCard } from '@/components/results/result-list-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetMyResults } from '@/http/championship/get-my-results'
import { Trophy } from 'lucide-react'

export default function MyResults() {
  const { data: results, isLoading, error } = useGetMyResults()

  return (
    <div className="flex size-full min-h-screen flex-col items-center">
      <Header />

      <main className="flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Meus Resultados</h1>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive text-sm">
            {error.message}
          </div>
        )}

        <div
          className="
            grid w-full gap-6
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4 rounded-xl border p-4">
                   <Skeleton className="h-6 w-3/4" />
                   <Skeleton className="h-4 w-1/2" />
                   <Skeleton className="h-12 w-full rounded-lg" />
                   <div className="grid grid-cols-2 gap-2 mt-2">
                     <Skeleton className="h-14 w-full rounded-md" />
                     <Skeleton className="h-14 w-full rounded-md" />
                   </div>
                </div>
              ))
            : <ResultListCard results={results ?? []} />
          }
        </div>
      </main>
    </div>
  )
}
