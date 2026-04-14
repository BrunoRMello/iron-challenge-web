'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { io } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import useEmblaCarousel from 'embla-carousel-react'
import { Header } from '@/components/header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatNamePart } from '@/utils/formatting/format-name-part'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useGetChampionshipResult,
  type ChampionshipResultItem,
} from '@/http/event/get-championship-result'

export default function LiveResultsPage() {
  const params = useParams<{ eventId: string; categoryId: string }>()
  const eventId = params?.eventId
  const categoryId = params?.categoryId
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useGetChampionshipResult(
    { eventId, categoryId },
    { enabled: Boolean(eventId && categoryId) }
  )

  const [highlightScore, setHighlightScore] = useState<{
    name: string
    avatar: string | null
    repetition: number
    position: number
  } | null>(null)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!eventId || !categoryId) return

    // Obtém a base URL do socket removendo a parte do caminho ou usando a origin
    const apiUrl = process.env.NEXT_PUBLIC_API || ''
    const socketUrl = new URL(apiUrl).origin

    const socket = io(socketUrl, {
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      console.log('🔗 Conectado ao Websocket para acompanhamento live.')
    })

    socket.on('ranking:update', (updatedRanking: any) => {
      if (
        updatedRanking?.eventId === eventId &&
        updatedRanking?.categoryId === categoryId
      ) {
        // Compare new and old
        const previousData = queryClient.getQueryData<any>(['championship-result', eventId, categoryId])
        
        if (previousData?.results && updatedRanking.results) {
          const oldScores = new Map(previousData.results.map((r: any) => [r.userId, r.repetition ?? -1]))
          
          let scoredUser = null
          
          for (const newScore of updatedRanking.results) {
            const oldRep = oldScores.get(newScore.userId) ?? -1
            if ((newScore.repetition || 0) > oldRep && oldRep !== -1) {
              scoredUser = newScore
              break // assume one score at a time for the highlight
            } else if (oldRep === -1 && (newScore.repetition || 0) > 0) {
               // first time score
               scoredUser = newScore
               break
            }
          }
          
          if (scoredUser) {
            setHighlightScore({
              name: scoredUser.name,
              avatar: scoredUser.avatar || null,
              repetition: scoredUser.repetition,
              position: scoredUser.position
            })
            
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => setHighlightScore(null), 5000)
          }
        }

        // Atualiza o React Query localmente de forma otimista
        queryClient.setQueryData(
          ['championship-result', eventId, categoryId],
          updatedRanking
        )
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [eventId, categoryId, queryClient])

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  useEffect(() => {
    if (!emblaApi) return
    const intervalId = setInterval(() => {
      emblaApi.scrollNext()
    }, 3000)
    return () => clearInterval(intervalId)
  }, [emblaApi])

  const results = useMemo(() => {
    if (!data?.results) return []
    return [...data.results].sort((a, b) => a.position - b.position)
  }, [data])

  const isFinalResult = useMemo(() => {
    return results.length > 0 && results.every(r => r.position !== null && r.position > 0)
  }, [results])

  return (
    <div className="flex size-full min-h-screen flex-col items-center bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
      <Header />

      {/* Score Overlay (TV Style) */}
      {highlightScore && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none animate-in zoom-in-75 fade-in duration-500">
          <div className="relative overflow-hidden flex flex-col items-center gap-6 rounded-3xl bg-zinc-900/95 backdrop-blur-md shadow-[0_0_50px_rgba(34,197,94,0.3)] p-10 border border-zinc-700 dark:bg-zinc-900/95 min-w-[400px]">
            {/* Background glowing effect */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
            
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm uppercase tracking-[0.3em] text-primary font-bold animate-pulse">
                {highlightScore.position === 1 ? 'Novo Recorde' : 'Pontuou!'}
              </span>
              
              <Avatar className="h-32 w-32 border-4 border-primary shadow-2xl shadow-primary/20">
                 <AvatarImage src={highlightScore.avatar || ''} className="object-cover" />
                 <AvatarFallback className="text-4xl bg-zinc-800 text-white font-bold">{formatNamePart(highlightScore.name, 'initials')}</AvatarFallback>
              </Avatar>
              
              <span className="text-3xl font-bold text-white leading-tight mt-2">{highlightScore.name}</span>
            </div>
            
            <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent my-2" />
            
            <div className="flex flex-col items-center justify-center">
              <span className="text-7xl font-black text-white leading-none tracking-tighter drop-shadow-xl">
                {highlightScore.repetition}
              </span>
              <span className="text-lg font-semibold text-zinc-400 uppercase tracking-[0.2em] mt-1 text-center">
                Repetições
              </span>
            </div>
          </div>
        </div>
      )}

      <main className="flex w-full max-w-5xl flex-col gap-6 p-4 pt-8">
        <div className="flex flex-col gap-2 relative">
          <h1 className="text-3xl font-bold tracking-tight">
            {isFinalResult ? 'Classificação Final' : 'Resultados (Ao Vivo)'}
          </h1>
          <p className="text-muted-foreground">
            {isFinalResult 
              ? 'Confira o pódio e o desempenho de todos os competidores desta categoria.'
              : 'Acompanhe a tabela de classificação em tempo real desta categoria.'
            }
          </p>
          {!isFinalResult && (
            <div className="absolute top-1 right-2 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-xs font-semibold uppercase text-green-500">Live</span>
            </div>
          )}
        </div>

        {error ? (
          <div className="rounded-md border p-6 bg-red-50/50">
            <p className="text-sm font-medium text-red-600">Erro ao carregar ranking.</p>
            <p className="mt-1 text-sm text-red-500">{error.message}</p>
          </div>
        ) : isLoading ? (
          <div className="rounded-md border p-8 text-center text-sm text-muted-foreground animate-pulse">
            Carregando resultados iniciais...
          </div>
        ) : results.length > 0 ? (
          <div className="rounded-md border bg-card shadow-sm max-h-[60vh] overflow-y-auto dark:bg-zinc-900/50">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card shadow-sm dark:bg-zinc-900">
                <TableRow>
                  <TableHead className="w-[80px] text-center font-bold">POS</TableHead>
                  <TableHead>Competidor</TableHead>
                  <TableHead className="w-[120px] text-right">Repetições</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((r, index) => {
                  const isTop3 = index < 3
                  return (
                    <TableRow
                      key={r.userId}
                      className={`
                        transition-colors duration-500
                        ${index === 0 ? 'bg-yellow-500/10 dark:bg-yellow-500/20 hover:bg-yellow-500/20' : ''}
                        ${index === 1 ? 'bg-zinc-300/10 dark:bg-zinc-300/20 hover:bg-zinc-300/20' : ''}
                        ${index === 2 ? 'bg-amber-700/10 dark:bg-amber-700/20 hover:bg-amber-700/20' : ''}
                      `}
                    >
                      <TableCell className="font-bold text-center">
                        <span className={`
                          flex items-center justify-center w-8 h-8 rounded-full mx-auto
                          ${index === 0 ? 'bg-yellow-500 text-yellow-950 text-lg' : ''}
                          ${index === 1 ? 'bg-zinc-300 text-zinc-900' : ''}
                          ${index === 2 ? 'bg-amber-600 text-amber-950' : ''}
                        `}>
                          {r.position}º
                        </span>
                      </TableCell>
                      <TableCell className={`
                        ${isTop3 ? 'font-semibold text-lg' : 'font-medium'}
                      `}>
                        {r.name}
                        {r.attended === false && (
                          <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                            Faltou
                          </span>
                        )}
                      </TableCell>
                      <TableCell className={`
                        text-right 
                        ${isTop3 ? 'font-bold text-xl' : 'font-semibold'}
                      `}>
                        {r.repetition ?? 0}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-md border p-8 text-center text-muted-foreground">
            Ainda não há resultados computados para esta categoria.
          </div>
        )}

        {/* Sponsor Banner Carousel */}
        {data?.sponsors && data.sponsors.length > 0 && (
          <div className="mt-8 mb-4 w-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[1px] flex-1 bg-border"></div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Patrocinadores
              </h3>
              <div className="h-[1px] flex-1 bg-border"></div>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex touch-pan-y">
                {data.sponsors.map((sponsorUrl, index) => (
                  <div
                    key={index}
                    className="relative ml-4 min-w-[200px] sm:min-w-[250px] md:min-w-[300px] h-[100px] sm:h-[120px] flex-[0_0_auto] rounded-lg border bg-white dark:bg-white overflow-hidden shadow-sm flex items-center justify-center p-2"
                  >
                    <img
                      src={sponsorUrl}
                      alt={`Sponsor ${index + 1}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
