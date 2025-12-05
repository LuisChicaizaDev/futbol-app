"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Loader2, AlertCircle, CalendarIcon, ListChecks, Shirt, Trophy } from "lucide-react"
import { db } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"

export function CallUpManagement() {
  const [callUp, setCallUp] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [nextMatch, setNextMatch] = useState(null)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load proximo partido
      const match = await db.getNextMatch()
      setNextMatch(match)
      
      if (match) {
        // Cargar convocatorias para el próximo partido
        const callups = await db.getCallUp()
        
        // Carga todos los jugadores
        const allPlayers = await db.getPlayers()
        setPlayers(allPlayers)
        
        // Verificar si hay nuevos jugadores que no están en las convocatorias
        const existingPlayerIds = callups.map(c => c.id) // Corregido: era c.player.id
        const newPlayers = allPlayers.filter(player => !existingPlayerIds.includes(player.id))
        
        if (newPlayers.length > 0) {
          // Agregar los nuevos jugadores automáticamente con status "Convocado"
          const newPlayerIds = newPlayers.map(p => p.id)
          await db.createInitialCallUps(match.id, newPlayerIds)
          
          // Recargar convocatorias para incluir los nuevos
          const updatedCallups = await db.getCallUp()
          setCallUp(updatedCallups.map(c => ({
            playerId: c.id,
            status: c.status
          })))
          
          
          toast({
            variant: "success",
            title: "Nuevos jugadores agregados",
            description: `${newPlayers.length} jugador(es) nuevo(s) han sido añadidos a la convocatoria.`,
          })
          
        } else {
          // Si no existen convocatorias, cree las iniciales
          if (callups.length === 0 && allPlayers.length > 0) {
            await initializeCallUps(match.id, allPlayers)
          } else {
            // Usar convocatorias existentes
            setCallUp(callups.map(c => ({
              playerId: c.id,
              status: c.status
            })))
          }
        }
      } else {
        setPlayers([])
        setCallUp([])
      }
      
    } catch (error) {
      console.error("Error loading callup data:", error)
      setError("No pudimos cargar la información de convocatorias. Verifica tu conexión e intenta nuevamente.")
      toast({
        variant: "destructive",
        title: "Error al cargar",
        description: "No pudimos obtener la información de convocatorias. Intenta nuevamente.",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const initializeCallUps = async (matchId, allPlayers) => {
    try {
      // Crear convocatorias para los primeros 18 jugadores de forma predeterminada
      const initialPlayerIds = allPlayers.slice(0, 18).map(p => p.id)
      await db.createInitialCallUps(matchId, initialPlayerIds)
      
      // Recargar datos
      const callups = await db.getCallUp()
      setCallUp(callups.map(c => ({
        playerId: c.id,
        status: c.status
      })))
      
    } catch (error) {
      console.error("Error initializing callups:", error)
    }
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleStatusChange = async (playerId, newStatus) => {
    if (!nextMatch) return
    
    try {
      setSaving(true)
      await db.updateCallUpStatus(playerId, nextMatch.id, newStatus)
      
      setCallUp(callUp.map((c) => 
        c.playerId === playerId ? { ...c, status: newStatus } : c
      ))
      
      toast({
        variant: "success",
        title: "Estado actualizado",
        description: "El estado de convocatoria ha sido actualizado correctamente.",
      })
      
    } catch (error) {
      console.error("Error updating callup status:", error)
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: "No pudimos actualizar el estado. Inténtalo de nuevo.",
      })
    } finally {
      setSaving(false)
    }
  }

  const getPlayerById = (id) => players.find((p) => p.id === id)

  const convocados = callUp.filter((c) => c.status === "Convocado")
  const lesionados = callUp.filter((c) => c.status === "Lesionado")
  const suspendidos = callUp.filter((c) => c.status === "Suspendido")
  
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
            <Button onClick={loadData} variant="outline">
              Intentar nuevamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!nextMatch) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" />
            Gestión de Convocatoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay próximo partido</h3>
            <p className="text-muted-foreground">
              Agrega un partido futuro para poder gestionar las convocatorias.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          Gestión de Convocatoria
        </CardTitle>
        {/**Convocatoria proximo partido */}
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">
            Convocatoria vs <span className="font-semibold text-gray-700">{nextMatch.opponent}</span>
          </p>
          <div className="h-4 w-px bg-gray-400"></div>
          <p className="text-sm text-accent font-medium">
            {new Date(nextMatch.date).toLocaleDateString("es-ES", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric"
            })}
          </p>
        </div>
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

        {callUp.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay convocatorias</h3>
            <p className="text-muted-foreground mb-4">
              No se han creado convocatorias para este partido aún.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {callUp
              .sort((a, b) => {
                // Obtener los objetos de jugador completos
                const playerA = getPlayerById(a.playerId)
                const playerB = getPlayerById(b.playerId)

                if (!playerA || !playerB) return 0

                // Orden personalizado por posición: Portero -> Defensa -> Mediocampista -> Delantero
                const positionOrder = {
                  'Portero': 1,
                  'Defensa': 2,
                  'Mediocampista': 3,
                  'Delantero': 4
                };

                const orderA = positionOrder[playerA.position] || 5;
                const orderB = positionOrder[playerB.position] || 5;

                // Si tienen la misma posición, ordenar por número de camiseta
                if (orderA === orderB) {
                  return playerA.number - playerB.number;
                }

                return orderA - orderB;
              })
              .map((item) => {
              const player = getPlayerById(item.playerId)
              if (!player) return null

              // Colores por posición
              const positionColors = {
                'Portero': 'bg-red-50 border-red-200 text-red-700',
                'Defensa': 'bg-green-50 border-green-200 text-green-700',
                'Mediocampista': 'bg-yellow-50 border-yellow-200 text-yellow-700',
                'Delantero': 'bg-blue-50 border-blue-200 text-blue-700',
                'default': 'bg-gray-50 border-gray-200 text-gray-700'
              };

              const positionColor = positionColors[player.position] || positionColors.default;

              return (
                <div key={item.playerId} className="flex items-center justify-between flex-wrap gap-4 rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    {/* Número del jugador con icono de camiseta */}
                    <div className="relative">
                      <div className="relative flex h-12 w-12 items-center justify-center">
                        {/* Icono de camiseta como fondo */}
                        <Shirt className="absolute h-11 w-11 text-primary/30 stroke-1" />
                        {/* Número sobre la camiseta */}
                        <div className="relative z-10 text-md font-bold text-primary">
                          {player.number}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="font-medium capitalize">{player.name}</div>
                      <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border capitalize ${positionColor}`}>
                        {player.position}
                      </div>
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
                    <Select 
                      value={item.status} 
                      onValueChange={(value) => handleStatusChange(item.playerId, value)}
                      disabled={saving}
                    >
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
        )}
      </CardContent>
    </Card>
  )
}
