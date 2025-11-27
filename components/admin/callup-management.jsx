"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import { players, callUp as initialCallUp } from "@/lib/mock-data"

export function CallUpManagement() {
  const [callUp, setCallUp] = useState(initialCallUp)

  const handleStatusChange = (playerId, newStatus) => {
    setCallUp(callUp.map((c) => (c.playerId === playerId ? { ...c, status: newStatus } : c)))
  }

  const getPlayerById = (id) => players.find((p) => p.id === id)

  const convocados = callUp.filter((c) => c.status === "Convocado")
  const lesionados = callUp.filter((c) => c.status === "Lesionado")
  const suspendidos = callUp.filter((c) => c.status === "Suspendido")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Gestión de Convocatoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-primary/5 p-4">
            <div className="text-3xl font-bold text-primary">{convocados.length}</div>
            <div className="text-sm text-muted-foreground">Convocados</div>
          </div>
          <div className="rounded-lg bg-destructive/10 p-4">
            <div className="text-3xl font-bold text-destructive">{lesionados.length}</div>
            <div className="text-sm text-muted-foreground">Lesionados</div>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <div className="text-3xl font-bold">{suspendidos.length}</div>
            <div className="text-sm text-muted-foreground">Suspendidos</div>
          </div>
        </div>

        <div className="space-y-3">
          {callUp.map((item) => {
            const player = getPlayerById(item.playerId)
            if (!player) return null

            return (
              <div key={item.playerId} className="flex items-center justify-between flex-wrap gap-4 rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {player.number}
                  </div>
                  <div>
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-muted-foreground">{player.position}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      item.status === "Convocado"
                        ? "default"
                        : item.status === "Lesionado"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {item.status}
                  </Badge>
                  <Select value={item.status} onValueChange={(value) => handleStatusChange(item.playerId, value)}>
                    <SelectTrigger className="w-34 cursor-pointer hover:shadow-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Convocado">Convocado</SelectItem>
                      <SelectItem value="Lesionado">Lesionado</SelectItem>
                      <SelectItem value="Suspendido">Suspendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
