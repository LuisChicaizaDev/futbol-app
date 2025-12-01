"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react"
//import { db } from "@/lib/db" // Obtenemos los datos del backend con Supabase
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
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [teamInfo, setTeamInfo] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    opponent: "",
    location: "Local",
    competition: "",
    goalsFor: "",
    goalsAgainst: "",
    result: "Victoria",
  })

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await db.getMatches()
      setMatches(data)
    } catch (error) {
      console.error(error)
      setError("No pudimos cargar la lista de partidos. Verifica tu conexión e intenta nuevamente.")
      toast({
        variant: "destructive",
        title: "Error al cargar",
        description: "No pudimos obtener la lista de partidos. Intenta nuevamente.",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadMatches()
  }, [loadMatches])

  const loadTeamInfo = useCallback(async () => {
    try {
      const info = await db.getTeamInfo()
      setTeamInfo(info)
      // Actualizar el formData con el stadium como competition por defecto
      setFormData(prev => ({
        ...prev,
        competition: info.stadium || ""
      }))
    } catch (error) {
      console.error("Error loading team info:", error)
    }
  }, [])

  useEffect(() => {
    loadTeamInfo()
  }, [loadTeamInfo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      
      const matchData = {
        date: formData.date,
        time: formData.time || null,
        opponent: formData.opponent,
        location: formData.location,
        competition: formData.competition || null,
        goalsFor: formData.goalsFor ? Number.parseInt(formData.goalsFor) : null,
        goalsAgainst: formData.goalsAgainst ? Number.parseInt(formData.goalsAgainst) : null,
        result: formData.result,
        played: formData.goalsFor !== "" && formData.goalsAgainst !== "",
      }

      if (editingId) {
        const updatedMatch = await db.updateMatch(editingId, matchData)
        setMatches(matches.map(m => m.id === editingId ? updatedMatch : m))
        
        toast({
          variant: "success",
          title: "Partido actualizado",
          description: "La información del partido ha sido actualizada correctamente.",
        })
      } else {
        const newMatch = await db.createMatch(matchData)
        setMatches([newMatch, ...matches]) // Add to beginning since sorted by date desc
        
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
        competition: teamInfo?.stadium || "",
        goalsFor: "",
        goalsAgainst: "",
        result: "Victoria",
      })
      setIsAdding(false)
      setEditingId(null)
      
    } catch (error) {
      console.error(error)
      const errorMessage = error.message || "No pudimos guardar los datos del partido. Inténtalo de nuevo."
      
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: errorMessage,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (match) => {
    setFormData({
      date: match.date,
      time: match.time || "",
      opponent: match.opponent,
      location: match.location,
      competition: match.competition || "",
      goalsFor: match.goalsFor?.toString() || "",
      goalsAgainst: match.goalsAgainst?.toString() || "",
      result: match.result || "Victoria",
    })
    setEditingId(match.id)
    setIsAdding(true)
  }

  const handleDelete = async (id) => {
    try {
      setSaving(true)
      await db.deleteMatch(id)
      setMatches(matches.filter(m => m.id !== id))
      
      toast({
        variant: "destructive",
        title: "Partido eliminado",
        description: "El partido ha sido eliminado correctamente.",
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "No pudimos eliminar el partido. Inténtalo de nuevo.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({
      date: "",
      time: "",
      opponent: "",
      location: "Local",
      competition: teamInfo?.stadium || "",
      goalsFor: "",
      goalsAgainst: "",
      result: "Victoria",
    })
  }

  const sortedMatches = [...matches].sort((a, b) => {
    if (!a.played && b.played) return -1
    if (a.played && !b.played) return 1
    return new Date(b.date) - new Date(a.date)
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center p-8">
          <div className="flex flex-col items-center justify-center gap-2 bg-white">
            <p className="text-accent">Cargando...</p>
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <div className="text-destructive mb-4">
              <AlertCircle className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-destructive mb-2">Error al cargar datos</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadMatches} variant="outline">
              Intentar nuevamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gestión de Partidos</CardTitle>
          <div className="flex gap-2">
            {error && (
              <Button onClick={loadMatches} variant="outline" size="sm">
                Reintentar
              </Button>
            )}
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} size="sm" disabled={saving}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Partido
              </Button>
            )}
          </div>
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
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opponent">Rival</Label>
                <Input
                  id="opponent"
                  value={formData.opponent}
                  onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                  required
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="competition">Competición</Label>
                <Input
                  id="competition"
                  value={formData.competition}
                  onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                  placeholder="Ej: Liga, Copa, Amistoso"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localía</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                  disabled={saving}
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
                <Select 
                  value={formData.result} 
                  onValueChange={(value) => setFormData({ ...formData, result: value })}
                  disabled={saving}
                >
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
                  disabled={saving}
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
                  disabled={saving}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingId ? "Actualizando..." : "Agregando..."}
                  </>
                ) : (
                  editingId ? "Actualizar" : "Agregar"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
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
                <TableHead>Competición</TableHead>
                <TableHead>Localía</TableHead>
                <TableHead>Resultado</TableHead>
                <TableHead>Marcador</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Plus className="h-8 w-8" />
                      <p>No hay partidos registrados aún</p>
                      <p className="text-sm">Comienza agregando el primer partido al calendario</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedMatches.map((match) => (
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
                    <TableCell className="font-medium capitalize">{match.opponent}</TableCell>
                    <TableCell>
                      {match.competition ? (
                        <Badge variant="outline">{match.competition}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
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
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(match)} disabled={saving}>
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={saving}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar partido?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará el partido contra <strong>{match.opponent}</strong> permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(match.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={saving}
                              >
                                {saving ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Eliminando...
                                  </>
                                ) : (
                                  "Eliminar"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
