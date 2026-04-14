'use client'

import { MyEventsTable } from '@/components/event/my-events-table'
import { Header } from '@/components/header'

export default function MyEvents() {
  return (
    <div className="flex size-full min-h-screen flex-col items-center">
      <Header />

      <main className="flex w-full max-w-7xl flex-col gap-4 p-4">
        <h1 className="text-2xl font-semibold">Meu eventos:</h1>

        <div
          className="w-full h-auto    "
        >
          <MyEventsTable />
        </div>
      </main>
    </div>
  )
}
