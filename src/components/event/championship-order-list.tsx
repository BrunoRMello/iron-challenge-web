// src/components/event/championship-order-list.tsx
"use client"

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import Link from "next/link"

import {
  useGetChampionshipOrderList,
  type ChampionshipOrderListItem,
} from "@/http/event/get-championship-order-list"
import { useGetChampionshipScoredList } from "@/http/event/get-championship-scored-list"
import {
  usePathChampionshipScore,
  type ChampionshipScoreBody,
} from "@/http/event/path-championship-score"
import {
  usePathChampionshipWinners,
  type ChampionshipWinnersResult,
} from "@/http/event/path-championship-winners"
import { AuthErrorCustom } from "@/lib/auth/auth-error-custom"

function formatAttended(value: boolean | null) {
  if (value === null) return "-"
  return value ? "Sim" : "Não"
}

const scoreSchema = z.object({
  attended: z.enum(["true", "false"], { required_error: "Selecione a presença" }),
  repetition: z
    .number({ invalid_type_error: "Informe um número" })
    .int("Deve ser um número inteiro")
    .min(0, "Não pode ser negativo"),
})

type ScoreFormData = z.infer<typeof scoreSchema>

function ScoreModal({
  open,
  onOpenChange,
  item,
  eventId,
  categoryId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ChampionshipOrderListItem | null
  eventId: string
  categoryId: string
}) {
  const { mutateAsync, isPending } = usePathChampionshipScore()

  const form = useForm<ScoreFormData>({
    resolver: zodResolver(scoreSchema),
    defaultValues: {
      attended: "true",
      repetition: 0,
    },
  })

  React.useEffect(() => {
    if (!open || !item) return
    form.reset({
      attended: item.attended === null ? "true" : item.attended ? "true" : "false",
      repetition: item.repetition ?? 0,
    })
  }, [open, item, form])

  const onSubmit = async (data: ScoreFormData) => {
    if (!item) return

    try {
      const payload: ChampionshipScoreBody = {
        _id: item._id,
        eventId,
        categoryId,
        repetition: data.repetition,
        attended: data.attended === "true",
      }

      await mutateAsync(payload)

      toast.success("Pontuação salva com sucesso!")
      onOpenChange(false)
    } catch (error) {
      console.error("🔥 erro ao lançar pontuação:", error)

      if (error instanceof AuthErrorCustom) {
        toast.error(error.message ?? "Erro ao lançar pontuação")
        return
      }

      toast.error("Erro inesperado. Tente novamente.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Lançar pontuação</DialogTitle>
          <DialogDescription>
            {item ? (
              <>
                Competidor:{" "}
                <span className="font-medium">{item.userId?.name ?? "-"}</span>
              </>
            ) : (
              "Selecione um competidor."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Presença</Label>
            <Select
              value={form.watch("attended")}
              onValueChange={(value) =>
                form.setValue("attended", value as "true" | "false", {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>

            {form.formState.errors.attended && (
              <p className="text-sm text-red-500">
                {form.formState.errors.attended.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Repetições</Label>
            <Input
              type="number"
              step="1"
              min={0}
              {...form.register("repetition", { valueAsNumber: true })}
            />
            {form.formState.errors.repetition && (
              <p className="text-sm text-red-500">
                {form.formState.errors.repetition.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full text-secondary-foreground"
            >
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function WinnersModal({
  open,
  onOpenChange,
  eventId,
  categoryId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  categoryId: string
}) {
  const enabled = Boolean(open && eventId && categoryId)

  const { data, isLoading, isFetching, error, refetch } = usePathChampionshipWinners(
    { eventId, categoryId },
    { enabled }
  )

  const winners = React.useMemo<ChampionshipWinnersResult[]>(() => {
    const list = data?.results ?? []
    return [...list].sort((a, b) => a.position - b.position)
  }, [data])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Campeões</DialogTitle>
          <DialogDescription>
            Resultado do evento/categoria selecionados.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="rounded-md border p-4">
            <p className="text-sm font-medium">Não foi possível carregar.</p>
            <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>

            <div className="mt-3 flex gap-2">
              <Button
                onClick={() => refetch()}
                disabled={isFetching}
                variant="outline"
              >
                {isFetching ? "Atualizando..." : "Tentar novamente"}
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            Carregando campeões...
          </div>
        ) : winners.length ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[90px]">Posição</TableHead>
                  <TableHead>Competidor</TableHead>
                  <TableHead className="w-[120px]">Repetições</TableHead>
                  <TableHead className="w-[120px]">Presença</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {winners.map((w) => (
                  <TableRow key={w.userId}>
                    <TableCell className="font-medium">{w.position}</TableCell>
                    <TableCell>{w.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {w.repetition}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {w.attended ? "Sim" : "Não"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            Nenhum campeão encontrado para essa categoria.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ScoredListModal({
  open,
  onOpenChange,
  eventId,
  categoryId,
  onEditScore,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  categoryId: string
  onEditScore: (item: ChampionshipOrderListItem) => void
}) {
  const enabled = Boolean(open && eventId && categoryId)

  const { data, isLoading, isFetching, error, refetch } = useGetChampionshipScoredList(
    { eventId, categoryId },
    { enabled }
  )

  const list = React.useMemo(() => data ?? [], [data])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] max-w-full overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Lançamentos Concluídos</DialogTitle>
          <DialogDescription>
            Lista de competidores que já tiveram a nota lançada ou a presença marcada.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="rounded-md border p-4">
            <p className="text-sm font-medium">Não foi possível carregar.</p>
            <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>

            <div className="mt-3 flex gap-2">
              <Button
                onClick={() => refetch()}
                disabled={isFetching}
                variant="outline"
              >
                {isFetching ? "Atualizando..." : "Tentar novamente"}
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            Carregando lista...
          </div>
        ) : list.length ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Ordem</TableHead>
                  <TableHead>Competidor</TableHead>
                  <TableHead>Presença</TableHead>
                  <TableHead className="w-[100px]">Repet.</TableHead>
                  <TableHead className="w-[100px]">Ação</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {list.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.entryOrder}</TableCell>
                    <TableCell>{item.userId?.name ?? "-"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatAttended(item.attended)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.repetition ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          onEditScore(item)
                          onOpenChange(false)
                        }}
                      >
                        Corrigir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-md border p-4 text-sm text-muted-foreground">
            Nenhum competidor foi avaliado ainda.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ChampionshipOrderListTable() {
  const params = useParams<{ registrationId: string; categoryId: string }>()

  const registrationId = params?.registrationId
  const categoryId = params?.categoryId

  const enabled = Boolean(registrationId && categoryId)

  const [scoreOpen, setScoreOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] =
    React.useState<ChampionshipOrderListItem | null>(null)

  const [winnersOpen, setWinnersOpen] = React.useState(false)
  const [scoredListOpen, setScoredListOpen] = React.useState(false)

  const { data, isLoading, error, refetch, isFetching } =
    useGetChampionshipOrderList({ eventId: registrationId, categoryId }, { enabled })

  const columns = React.useMemo<ColumnDef<ChampionshipOrderListItem>[]>(
    () => [
      {
        accessorKey: "entryOrder",
        header: "Ordem",
        cell: ({ row }) => (
          <div className="whitespace-nowrap font-medium">
            {row.original.entryOrder}
          </div>
        ),
      },
      {
        id: "competitor",
        header: "Competidor",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.userId?.name ?? "-"}</div>
        ),
      },
      {
        accessorKey: "attended",
        header: "Presença",
        cell: ({ row }) => (
          <div className="whitespace-nowrap text-muted-foreground">
            {formatAttended(row.original.attended)}
          </div>
        ),
      },
      {
        accessorKey: "repetition",
        header: "Repetição",
        cell: ({ row }) => (
          <div className="whitespace-nowrap text-muted-foreground">
            {row.original.repetition ?? "-"}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => {
          const item = row.original

          return (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedItem(item)
                  setScoreOpen(true)
                }}
              >
                Lançar
              </Button>
            </div>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  })

  return (
    <>
      <ScoreModal
        open={scoreOpen}
        onOpenChange={(open) => {
          setScoreOpen(open)
          if (!open) setSelectedItem(null)
        }}
        item={selectedItem}
        eventId={registrationId}
        categoryId={categoryId}
      />

      <WinnersModal
        open={winnersOpen}
        onOpenChange={setWinnersOpen}
        eventId={registrationId}
        categoryId={categoryId}
      />

      <ScoredListModal
        open={scoredListOpen}
        onOpenChange={setScoredListOpen}
        eventId={registrationId}
        categoryId={categoryId}
        onEditScore={(item) => {
          setSelectedItem(item)
          setScoreOpen(true)
        }}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Carregando..."
                : `${data?.length ?? 0} competidor(es) encontrado(s)`}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setScoredListOpen(true)}>
              Corrigir Lançamento
            </Button>
            <Button variant="default" asChild>
              <Link href={`/live/${registrationId}/${categoryId}`} target="_blank">
                Resultados Live
              </Link>
            </Button>

            {/* Mantive sua regra; se quiser exibir sempre, remova a condição */}
            {data && data.length <= 0 && (
              <Button variant="outline" onClick={() => setWinnersOpen(true)}>
                Visualizar campeões
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
                {!enabled ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24">
                      Parâmetros inválidos na URL.
                    </TableCell>
                  </TableRow>
                ) : isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24">
                      Carregando lista de ordem...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
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
                      Nenhum competidor encontrado.
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
            {table.getPageCount()}
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
    </>
  )
}
