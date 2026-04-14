'use client'

import { ChampionshipOrderListTable } from '@/components/event/championship-order-list'
import { Header } from '@/components/header'

export default function CagetoryId() {
  return (
    <div className="flex size-full min-h-screen flex-col items-center">
      <Header />

      <main className="flex w-full max-w-7xl flex-col gap-4 p-4">
        <h1 className="text-2xl font-semibold">Competidores:</h1>
        <ChampionshipOrderListTable />
      </main>
    </div>
  )
}
