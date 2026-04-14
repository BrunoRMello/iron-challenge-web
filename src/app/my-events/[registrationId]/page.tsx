'use client'

import { RegistrationListTable } from '@/components/event/registration-events-table'
import { Header } from '@/components/header'

export default function RegistrationId() {
  return (
    <div className="flex size-full min-h-screen flex-col items-center">
      <Header />

      <main className="flex w-full max-w-7xl flex-col gap-4 p-4">
        <h1 className="text-2xl font-semibold">Evento:</h1>
        <RegistrationListTable />
      </main>
    </div>
  )
}
