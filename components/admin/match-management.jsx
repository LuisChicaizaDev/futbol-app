"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { matches as initialMatches } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function MatchManagement() {
  const [matches, setMatches] = useState(initialMatches)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    opponent: "",
    location: "Local",
    goalsFor: "",
    goalsAgainst: "",
    result: "Victoria",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const matchData = {
      ...formData,
      time: formData.time || null,
      goalsFor: formData.goalsFor ? Number.parseInt(formData.goalsFor) : null,
      goalsAgainst: formData.goalsAgainst ? Number.parseInt(formData.goalsAgainst) : null,
      played: formData.goalsFor !== "" && formData.goalsAgainst !== "",
    }

    if (editingId) {
      setMatches(matches.map((m) => (m.id === editingId ? { ...m, ...matchData } : m)))
      setEditingId(null)
      toast({
        variant: "success",
        title: "Partido actualizado",
        description: "La información del partido ha sido actualizada correctamente.",
      })
    } else {
      const newMatch = {
        id: Math.max(...matches.map((m) => m.id)) + 1,
        ...matchData,
      }
      setMatches([...matches, newMatch])
      toast({
        variant: "success",
        title: "Partido agregado",
        description: "El nuevo partido ha sido registrado exitosamente.",
      })
    }
    setFormData({
      date: "",
      time: "",
      opponent: "",
      location: "Local",
      goalsFor: "",
      goalsAgainst: "",
      result: "Victoria",
    })
    setIsAdding(false)
  }

  const handleEdit = (match) => {
    setFormData({
      date: match.date,
      time: match.time || "",
      opponent: match.opponent,
      location: match.location,
      goalsFor: match.goalsFor?.toString() || "",
      goalsAgainst: match.goalsAgainst?.toString() || "",
      result: match.result || "Victoria",
    })
    setEditingId(match.id)
    setIsAdding(true)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      date: "",
      time: "",
      opponent: "",
      location: "Local",
      goalsFor: "",
      goalsAgainst: "",
      result: "Victoria",
    })
  }

  const handleDelete = (id) => {
    setMatches(matches.filter((m) => m.id !== id))
    toast({
      variant: "destructive",
      title: "Partido eliminado",
      description: "El partido ha sido eliminado correctamente.",
    })
  }

  const sortedMatches = [...matches].sort((a, b) => {
    if (!a.played && b.played) return -1
    if (a.played && !b.played) return 1
    return new Date(b.date) - new Date(a.date)
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gestión de Partidos</CardTitle>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Partido
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-lg border bg-muted/50 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opponent">Rival</Label>
                <Input
                  id="opponent"
                  value={formData.opponent}
                  onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                  required
                />
              </div>
              <div></div>
              <div className="space-y-2">
                <Label htmlFor="location">Localía</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Local">Local</SelectItem>
                    <SelectItem value="Visitante">Visitante</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="result">Resultado</Label>
                <Select value={formData.result} onValueChange={(value) => setFormData({ ...formData, result: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Victoria">Victoria</SelectItem>
                    <SelectItem value="Empate">Empate</SelectItem>
                    <SelectItem value="Derrota">Derrota</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goalsFor">Goles a Favor</Label>
                <Input
                  id="goalsFor"
                  type="number"
                  value={formData.goalsFor}
                  onChange={(e) => setFormData({ ...formData, goalsFor: e.target.value })}
                  placeholder="Dejar vacío si no se jugó"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goalsAgainst">Goles en Contra</Label>
                <Input
                  id="goalsAgainst"
                  type="number"
                  value={formData.goalsAgainst}
                  onChange={(e) => setFormData({ ...formData, goalsAgainst: e.target.value })}
                  placeholder="Dejar vacío si no se jugó"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">{editingId ? "Actualizar" : "Agregar"}</Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Rival</TableHead>
                <TableHead>Localía</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Marcador</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMatches.map((match) => (
                <TableRow key={match.id} className={!match.played ? "bg-primary/5" : ""}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {new Date(match.date).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {!match.played && <span className="text-xs text-primary font-bold">Próximo</span>}
                    </div>
                  </TableCell>
                  <TableCell>{match.time ? match.time : "-"}</TableCell>
                  <TableCell className="font-medium">{match.opponent}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{match.location}</Badge>
                  </TableCell>
                  <TableCell>
                    {match.result && (
                      <Badge
                        variant={
                          match.result === "Victoria"
                            ? "default"
                            : match.result === "Empate"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {match.result}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{match.played ? `${match.goalsFor} - ${match.goalsAgainst}` : "-"}</TableCell>
                  <TableCell>
                    <Badge variant={match.played ? "default" : "outline"}>
                      {match.played ? "Jugado" : "Pendiente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(match)}>
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente el partido contra{" "}
                              {match.opponent}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(match.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
