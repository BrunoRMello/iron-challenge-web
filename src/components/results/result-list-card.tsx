import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Calendar, Medal, ChevronRight } from "lucide-react"
import { UserResult } from "@/http/championship/get-my-results"
import { Button } from "../ui/button"
import Link from 'next/link'

interface ResultListCardProps {
  results: UserResult[]
}

export function ResultListCard({ results }: ResultListCardProps) {
  if (results.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center p-8 text-muted-foreground border-2 border-dashed rounded-xl">
        <Trophy className="h-12 w-12 mb-2 opacity-20" />
        <p>Nenhum resultado finalizado encontrado.</p>
      </div>
    )
  }

  return (
    <>
      {results.map((result) => (
        <Card key={result._id} className="overflow-hidden border-2 transition-all hover:border-primary/50 relative">
          {/* Position Badge */}
          <div className="absolute top-2 right-2 z-10">
            <Badge 
              variant={result.position <= 3 ? "default" : "secondary"} 
              className={`text-lg font-bold px-3 py-1 gap-1 ${
                result.position === 1 ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 
                result.position === 2 ? 'bg-slate-300 hover:bg-slate-400 text-black' : 
                result.position === 3 ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''
              }`}
            >
              <Medal className="h-4 w-4" />
              {result.position}º
            </Badge>
          </div>

          <CardHeader className="pb-2">
            <CardTitle className="text-lg line-clamp-1 pr-12">{result.eventName}</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Calendar className="h-3 w-3" />
              {new Date(result.eventDate).toLocaleDateString()}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
              <Trophy className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{result.categoryName}</span>
                <span className="text-[10px] text-muted-foreground uppercase">Categoria</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col p-2 border rounded-md bg-card/50">
                <span className="text-xs text-muted-foreground">Repetições</span>
                <span className="text-lg font-bold text-primary">{result.repetition}</span>
              </div>
              <div className="flex flex-col p-2 border rounded-md bg-card/50 text-right">
                <span className="text-xs text-muted-foreground text-right">Peso Máx.</span>
                <span className="text-lg font-bold text-muted-foreground">{result.weightRequirement}kg</span>
              </div>
            </div>
          </CardContent>

          <div className="px-6 pb-6 pt-0">
            <Button asChild variant="outline" size="sm" className="w-full gap-2 group">
              <Link href={`/live/${result.eventId}/${result.categoryId}`}>
                Ver Ranking Completo
                <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </Card>
      ))}
    </>
  )
}
