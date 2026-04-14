"use client"

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
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import {
  type ChampionshipOrderListItem
} from "@/http/event/get-championship-order-list"
import {
  usePathChampionshipScore,
  type ChampionshipScoreBody,
} from "@/http/event/path-championship-score"
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
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
