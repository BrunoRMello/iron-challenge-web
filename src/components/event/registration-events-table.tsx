"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useGenerateEntry } from "@/http/event/use-generate-entry"
import {
  useGetRegistrationEvents,
  type RegistrationEventItem,
} from "@/http/event/use-get-registration-event"

function formatDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

function getCompetitorLabel(item: RegistrationEventItem) {
  if (item.competitorName?.trim()) return item.competitorName
  if (item.userId?.name?.trim()) return item.userId.name
  return `Usuário ${item.userId?._id?.slice?.(0, 6) ?? "—"}`
}

export function RegistrationListTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams<{ registrationId: string }>() 

  const categoryId = searchParams.get("categoryId") ?? ""
  const eventId = params.registrationId ?? ""

  const { mutateAsync: generateEntry, isPending } = useGenerateEntry()

  const { data, isLoading, error, refetch, isFetching } =
    useGetRegistrationEvents(
      { categoryId: categoryId || undefined },
      { enabled: Boolean(categoryId) }
    )
  console.log("🚀 ~ RegistrationListTable ~ data:", data)

  const handleGenerateEntries = async () => {
    if (!eventId || !categoryId) return

    await generateEntry({
      eventId,
      categoryId,
    })
  }

  const columns = React.useMemo<ColumnDef<RegistrationEventItem>[]>(
    () => [
      {
        id: "competitor",
        header: "Inscrito",
        cell: ({ row }) => {
          const item = row.original
          return (
            <div className="space-y-0.5">
              <div className="font-medium">{getCompetitorLabel(item)}</div>
              <div className="text-xs text-muted-foreground">
                ID: {item.userId?._id ?? "-"}
              </div>
            </div>
          )
        },
      },
      {
        id: "category",
        header: "Categoria",
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <div className="font-medium">{row.original.category.name}</div>
            <div className="text-xs text-muted-foreground">
              Peso req.: {row.original.category.weightRequirement}kg
            </div>
          </div>
        ),
      },
      {
        accessorKey: "competitorWeight",
        header: "Peso (kg)",
        cell: ({ row }) => (
          <div className="whitespace-nowrap">{row.original.competitorWeight}</div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Inscrito em",
        cell: ({ row }) => (
          <div className="whitespace-nowrap text-muted-foreground">
            {formatDate(row.original.createdAt)}
          </div>
        ),
      },
    ],
    [router]
  )

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const isStartedEvent = data ? data[0]?.category.started : false

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Lista de inscritos</h2>
          <p className="text-sm text-muted-foreground">
            {!categoryId
              ? "Selecione uma categoria."
              : isLoading
                ? "Carregando..."
                : `${data?.length ?? 0} inscrito(s) encontrado(s)`}
          </p>
        </div>

        <div className="w-auto flex gap-4">
          {isStartedEvent ? (
            <Button
              variant="outline"
              onClick={() => router.push(`/my-events/${eventId}/${categoryId}`)}
            >
              Ordem dos competidores
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleGenerateEntries}
              disabled={isPending || isStartedEvent || data && data.length <= 0 }
            >
              {isPending ? "Iniciando evento..." : "Iniciar evento"}
            </Button>
          )}
        </div>
      </div>

      {error ? (
        <div className="rounded-md border p-4">
          <p className="text-sm font-medium">Não foi possível carregar.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>

          <div className="mt-3">
            <Button onClick={() => refetch()} disabled={isFetching}>
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {!categoryId ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24">
                    Informe uma categoria na URL (categoryId).
                  </TableCell>
                </TableRow>
              ) : isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24">
                    Carregando inscritos...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-muted-foreground"
                  >
                    Nenhum inscrito encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount() || 1}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  )
}
