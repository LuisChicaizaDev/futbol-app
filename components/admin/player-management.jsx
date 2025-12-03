"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Loader2, Users, Minus, Save, X, TrendingUp } from "lucide-react"
import { db } from "@/lib/db" // Obtenemos los datos del backend con Supabase
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

export function PlayerManagement() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const { toast } = useToast()
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    position: "Delantero",
    age: "",
  })
  const [editingStats, setEditingStats] = useState(null)
  const [tempStats, setTempStats] = useState({})

  const loadPlayers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null) // Limpiar error anterior
      const data = await db.getPlayers()
      setPlayers(data)
    } catch (error) {
      console.error(error)
      setError("No pudimos cargar la lista de jugadores. Verifica tu conexión e intenta nuevamente.")
      toast({
        variant: "destructive",
        title: "Error al cargar",
        description: "No pudimos obtener la lista de jugadores. Intenta nuevamente.",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadPlayers()
  }, [loadPlayers])


  const handleSubmit = async (e) => {
    e.preventDefault()

    const numberExists = players.some(p => 
      p.number === Number.parseInt(formData.number) && p.id !== editingId
    )
    
    if (numberExists) {
      toast({
        variant: "destructive",
        title: "Número duplicado",
        description: "Ya existe un jugador con este número. Por favor elige un número diferente.",
      })
      return
    }
    
    try {
      setSaving(true)
      
      if (editingId) {
        const updatedPlayer = await db.updatePlayer(editingId, {
          number: Number.parseInt(formData.number),
          name: formData.name,
          position: formData.position,
          age: Number.parseInt(formData.age),
        })
        
        setPlayers(players.map(p => p.id === editingId ? updatedPlayer : p))
        
        toast({
          variant: "success",
          title: "Jugador actualizado",
          description: "Los datos del jugador han sido actualizados.",
        })
      } else {
        const newPlayer = await db.createPlayer({
          number: Number.parseInt(formData.number),
          name: formData.name,
          position: formData.position,
          age: Number.parseInt(formData.age),
        })
        
        setPlayers([...players, newPlayer])
        
        toast({
          variant: "success",
          title: "Jugador agregado",
          description: "El nuevo jugador ha sido añadido a la plantilla.",
        })
      }
      
      setFormData({ name: "", number: "", position: "Delantero", age: "" })
      setIsAdding(false)
      setEditingId(null)
      
    } catch (error) {
      console.error(error)

      // Show specific error message or fallback to generic
      const errorMessage = error.message || "No pudimos guardar los datos del jugador. Inténtalo de nuevo."

      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: errorMessage,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (player) => {
    setFormData({
      name: player.name,
      number: player.number.toString(),
      position: player.position,
      age: player.age.toString(),
    })
    setEditingId(player.id)
    setIsAdding(true)
  }

  const handleDelete = async (id) => {
    try {
      setSaving(true)
      await db.deletePlayer(id)
      setPlayers(players.filter(p => p.id !== id))
      
      toast({
        variant: "destructive",
        title: "Jugador eliminado",
        description: "El jugador ha sido eliminado de la plantilla.",
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "No pudimos eliminar al jugador. Inténtalo de nuevo.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({ name: "", number: "", position: "Delantero", age: "" })
  }

  const startEditingStats = (player) => {
    setEditingStats(player.id)
    setTempStats({
      gamesPlayed: player.gamesPlayed || 0,
      goals: player.goals || 0,
      assists: player.assists || 0,
      yellowCards: player.yellowCards || 0,
      redCards: player.redCards || 0,
    })
  }

  const updateStat = (field, increment) => {
    setTempStats(prev => ({
      ...prev,
      [field]: Math.max(0, prev[field] + increment)
    }))
  }

  const saveStats = async () => {
    try {
      setSaving(true)
      await db.updatePlayerStats(editingStats, tempStats)
      
      // Actualizar estado local
      setPlayers(players.map(p => 
        p.id === editingStats ? { ...p, ...tempStats } : p
      ))
      
      setEditingStats(null)
      toast({
        variant: "success",
        title: "Estadísticas actualizadas",
        description: "Los datos del jugador han sido guardados.",
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar las estadísticas.",
      })
    } finally {
      setSaving(false)
    }
  }

  const cancelEditing = () => {
    setEditingStats(null)
    setTempStats({})
  }

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
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-destructive mb-2">Error al cargar datos</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadPlayers} variant="outline">
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
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestión de Jugadores
            </CardTitle>
            <p className="text-sm text-muted-foreground my-2">
              Total jugadores en la plantilla: <strong className="capitalize">{players.length}</strong>
            </p>
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 my-2">
              <p className="text-sm text-blue-800">
                <strong>💡 Recordatorio:</strong> Si agregas nuevos jugadores y tienes partidos ya programados, ve a <strong>"Convocatoria"</strong> para actualizar la convocatoria.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {error && (
              <Button onClick={loadPlayers} variant="outline" size="sm">
                Reintentar
              </Button>
            )}
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Jugador
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
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  type="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  required
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Posición</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Portero">Portero</SelectItem>
                    <SelectItem value="Defensa">Defensa</SelectItem>
                    <SelectItem value="Mediocampista">Mediocampista</SelectItem>
                    <SelectItem value="Delantero">Delantero</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Edad</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
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

        {/* Tabla para mostrar los jugadores */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Posición</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>PJ</TableHead>
                <TableHead>Goles</TableHead>
                <TableHead>Asist.</TableHead>
                <TableHead>Tarjetas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="h-8 w-8" />
                    <p>No hay jugadores registrados aún</p>
                    <p className="text-sm">Comienza agregando el primer jugador a la plantilla</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-bold">{player.number}</TableCell>
                  <TableCell className="font-medium capitalize">{player.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{player.position}</Badge>
                  </TableCell>
                  <TableCell>{player.age}</TableCell>
                  <TableCell>
                    {editingStats === player.id ? (
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 w-6 p-0" 
                          onClick={() => updateStat('gamesPlayed', -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-bold">{tempStats.gamesPlayed}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 w-6 p-0" 
                          onClick={() => updateStat('gamesPlayed', 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      player.gamesPlayed
                    )}
                  </TableCell>
                  <TableCell>
                    {editingStats === player.id ? (
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 w-6 p-0" 
                          onClick={() => updateStat('goals', -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-bold text-green-600">{tempStats.goals}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 w-6 p-0" 
                          onClick={() => updateStat('goals', 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-green-600 font-bold">{player.goals}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingStats === player.id ? (
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 w-6 p-0" 
                          onClick={() => updateStat('assists', -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-bold text-blue-600">{tempStats.assists}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 w-6 p-0" 
                          onClick={() => updateStat('assists', 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-blue-600 font-bold">{player.assists}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingStats === player.id ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-yellow-600">A:</span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 w-6 p-0" 
                            onClick={() => updateStat('yellowCards', -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center font-bold text-yellow-600">{tempStats.yellowCards}</span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 w-6 p-0" 
                            onClick={() => updateStat('yellowCards', 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-red-600">R:</span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 w-6 p-0" 
                            onClick={() => updateStat('redCards', -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center font-bold text-red-600">{tempStats.redCards}</span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 w-6 p-0" 
                            onClick={() => updateStat('redCards', 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm">
                        <span className="text-yellow-600">{player.yellowCards}A</span>
                        <span className="mx-1">/</span>
                        <span className="text-red-600">{player.redCards}R</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {editingStats === player.id ? (
                        <>
                          <Button title="Guardar" size="sm" onClick={saveStats} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          </Button>
                          <Button title="Cerrar" size="sm" variant="outline" onClick={cancelEditing} disabled={saving}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button title="Editar Jugador" size="sm" variant="ghost" onClick={() => handleEdit(player)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button title="Editar Estadísticas" size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10" 
                            onClick={() => startEditingStats(player)}
                          >
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                title="Eliminar Jugador"
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
                                <AlertDialogTitle>¿Eliminar jugador?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará a <strong className="capitalize">{player.name}</strong> de la plantilla permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(player.id)}
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
                        </>
                      )}
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
