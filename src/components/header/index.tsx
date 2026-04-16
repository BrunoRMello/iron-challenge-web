'use client'

import { CalendarCheck, CalendarClock, CalendarCog, ChevronDown, LogOut, Menu, Trophy, X } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/logo'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

import { CreateEventModal } from '../event/create-event-modal'
import { deleteCookie } from 'cookies-next/client'
import { useRouter } from 'next/navigation'
import { auth } from '@/firebase/client'
import { useUser } from '@/hooks/use-user'
import { formatNamePart } from '@/utils/formatting/format-name-part'
import { useGetUser } from '@/http/user/get-user'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function Header() {
  const { push } = useRouter()
  const { user } = useUser()
  const { data: userData, isLoading } = useGetUser()

  const userName = formatNamePart(user?.displayName, "first");
  const userEmail = user?.email ?? null;
  const userNameInitials = formatNamePart(user?.displayName, "initials");
  const userPhotoURL = userData?.avatar || user?.photoURL || '';

  const [menuOpen, setMenuOpen] = useState(false)

  const queryClient = useQueryClient()

  async function signOut() {
    queryClient.clear()
    await auth.signOut()
    deleteCookie('token')
    deleteCookie('uid')
    push('/auth/sign-in')
  }

  return (
    <header className="w-full bg-card shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-3 gap-3">
        <Logo />

        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className="hidden flex-1 items-center justify-between gap-3 md:flex">
          <ul className="flex gap-1">
            <li>
              <Link href="/">
                <Button className="flex size-auto items-center gap-2 rounded-lg" variant="ghost">
                  <CalendarClock />
                  Eventos
                </Button>
              </Link>
            </li>

            <li>
              <Button asChild className="flex size-auto items-center gap-2 rounded-lg" variant="ghost">
                <Link href="/my-results">
                  <Trophy />
                  Meus resultados
                </Link>
              </Button>
            </li>

            <li>
              <Button asChild className="flex size-auto items-center gap-2 rounded-lg" variant="ghost">
                <Link href="/registrations">
                  <CalendarCheck />
                  Minhas inscrições
                </Link>
              </Button>
            </li>
          </ul>

          {userData?.role === 'admin' && (
            <ul className="flex gap-1">
              <li>
                <Button asChild className="flex size-auto items-center gap-2 rounded-lg" variant="ghost">
                  <Link href="/my-events">
                    <CalendarCog />
                    Meus eventos
                  </Link>
                </Button>
              </li>

              <li>
                <CreateEventModal />
              </li>
            </ul>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/profile" className="flex items-center gap-3">
            <div className="text-right">
              {userName && <span className="block text-sm">Olá, {userName}!</span>}
              {userEmail && (
                <span className="text-xs text-muted-foreground">
                  {userEmail}
                </span>
              )}
            </div>

            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={userPhotoURL} />
              <AvatarFallback>{userNameInitials}</AvatarFallback>
            </Avatar>
          </Link>

          <Button
            size="icon"
            variant="outline"
            onClick={signOut}
          >
            <LogOut />
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-3 border-t p-4 md:hidden">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <CalendarClock />
              Eventos
            </Button>
          </Link>

          <Button asChild variant="ghost" className="justify-start gap-2">
            <Link href="/registrations" onClick={() => setMenuOpen(false)}>
              <CalendarCheck />
              Minhas inscrições
            </Link>
          </Button>

          <Button asChild variant="ghost" className="justify-start gap-2">
            <Link href="/my-results" onClick={() => setMenuOpen(false)}>
              <Trophy />
              Meus resultados
            </Link>
          </Button>

          {userData?.role === 'admin' && <CreateEventModal />}

          <Link
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className="mt-2 flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
          >
            <Avatar className="size-9 rounded-lg">
              <AvatarImage src={userPhotoURL} />
              <AvatarFallback>{userNameInitials}</AvatarFallback>
            </Avatar>

            <div>
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </Link>


          <Button
            variant="outline"
            className="mt-2 gap-2"
            onClick={signOut}
          >
            <LogOut />
            Sair
          </Button>
        </div>
      )}
    </header>
  )
}
