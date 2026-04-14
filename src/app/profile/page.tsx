'use client'

import { Header } from '@/components/header'
import { Separator } from '@/components/ui/separator'
import { ProfileForm } from './profile-form'

export default function Profile() {
  return (
    <div className="flex size-full min-h-screen flex-col items-center">
      <Header />

      <main className="flex w-full max-w-7xl flex-col gap-3 p-3">
        <div className="flex h-auto w-full flex-col gap-3 ">
          <h1 className="text-2xl font-semibold">Perfil:</h1>
          <Separator className="h-px w-full" orientation="horizontal" />

          <div className="grid w-full grid-cols-1 gap-4 ">
            <ProfileForm />
          </div>
        </div>
      </main>
    </div>
  )
}
