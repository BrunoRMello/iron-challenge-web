"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { Play, ArrowUpDown, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { useGetMyEvents, type Event } from "@/http/event/get-my-events"

function formatDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

export function MyEventsTable() {
  const router = useRouter()
  const { data, isLoading, error, refetch, isFetching } = useGetMyEvents()

  const columns = React.useMemo<ColumnDef<Event>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4 h-8 data-[state=open]:bg-accent"
            >
              Evento
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.original.name}</div>
        ),
      },
      {
        accessorKey: "description",
        header: "Descrição",
        cell: ({ row }) => (
          <div className="max-w-[300px] truncate text-muted-foreground" title={row.original.description}>
            {row.original.description || "-"}
          </div>
        ),
      },
      {
        accessorKey: "eventDate",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4 h-8"
            >
              Data do Evento
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="whitespace-nowrap font-medium text-primary">
            {formatDate(row.original.eventDate)}
          </div>
        ),
      },
      {
        accessorKey: "startDate",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4 h-8"
            >
              Início Inscrições
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="whitespace-nowrap">
            {formatDate(row.original.startDate)}
          </div>
        ),
      },
      {
        accessorKey: "finishDate",
        header: "Fim Inscrições",
        cell: ({ row }) => (
          <div className="whitespace-nowrap">
            {formatDate(row.original.finishDate)}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4 h-8"
            >
              Criado em
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => (
          <div className="whitespace-nowrap text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Categorias",
        cell: ({ row }) => {
          const event = row.original
          
          return (
            <div className="flex flex-col gap-1">
              {row.original.categories?.map((item) => (
                 <Button
                  key={item.categoryId}
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/my-events/${event._id}?categoryId=${item.categoryId}`)}
                  className="w-auto h-7 justify-start px-2 text-xs"
                >
                  <Play className="mr-2 h-3 w-3 fill-primary text-primary" /> {item.name}
                </Button>
              ))}
            </div>
          )
        },
      },
    ],
    [router]
  )

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-sm font-medium text-destructive">Não foi possível carregar os eventos.</p>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()} 
          className="mt-4"
          disabled={isFetching}
        >
          {isFetching ? "Tentando..." : "Tentar novamente"}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium tracking-tight">Gerenciar Eventos</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-8 gap-2"
        >
          <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Atualizando..." : "Sincronizar"}
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data ?? []} 
        isLoading={isLoading}
        placeholder="Filtrar eventos por nome ou descrição..."
      />
    </div>
  )
}
