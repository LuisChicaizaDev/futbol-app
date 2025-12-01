"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/lib/db" // Obtenemos los datos del backend con Supabase
import { uploadLogo, deleteLogo } from "@/lib/db"
import { Save, Loader2, Upload, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function TeamInfoManagement() {
  const [info, setInfo] = useState({
    id: "",
    name: "",
    founded: "",
    stadium: "",
    city: "",
    description: "",
    president: "",
    coach: "",
    logoUrl: "", // Added logoUrl field
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const { toast } = useToast()

  const loadInfo = useCallback(async () => {
    try {
      setLoading(true)
      setError(null) // Limpiar error anterior
      const data = await db.getTeamInfo()
      setInfo(data)
    } catch (error) {
      console.error(error)
      setError("No pudimos obtener la información del equipo. Verifica tu conexión e intenta nuevamente.")
      toast({
        variant: "destructive",
        title: "Error al cargar",
        description: "No pudimos obtener la información del equipo. Intenta nuevamente.",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadInfo()
  }, [loadInfo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
    setSaving(true)
      const updatedInfo = await db.updateTeamInfo(info)
      setInfo(updatedInfo)
    toast({
      variant: "success",
      title: "Información actualizada",
        description: "Los datos del equipo se guardaron correctamente.",
    })
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "No pudimos actualizar la información. Revisa los datos e intenta de nuevo.",
      })
    } finally {
      setSaving(false)
    }
  }


  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
  
    try {
      setSaving(true) 
      
      toast({
        title: "Subiendo imagen...",
        description: "Por favor espera mientras se procesa la imagen.",
      })
  
      // Subir al almacenamiento de Supabase
      const uploadResult = await uploadLogo(file)
      
      // Actualizar el estado con la nueva URL del logotipo
      setInfo({ ...info, logoUrl: uploadResult.url })
      
      toast({
        variant: "success",
        title: "Logo actualizado",
        description: "La imagen se ha subido correctamente.",
      })
      
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        variant: "destructive",
        title: "Error al subir imagen",
        description: error.message || "No se pudo subir la imagen. Inténtalo de nuevo.",
      })
    } finally {
      setSaving(false)
      // Borrar el input
      e.target.value = ''
    }
  }
    
  const handleRemoveImage = async () => {
    if (!info.logoUrl) return
    
    try {
      setSaving(true)
      
      // Eliminar del almacenamiento de Supabase si es una URL de Supabase
      if (info.logoUrl.includes('supabase')) {
        await deleteLogo(info.logoUrl)
      } else if (info.logoUrl.startsWith("blob:")) {
        // Limpiar URL de blobs
        URL.revokeObjectURL(info.logoUrl)
      }
      
      setInfo({ ...info, logoUrl: "" })
      
      toast({
        variant: "destructive",
        title: "Logo eliminado",
        description: "La imagen ha sido eliminada.",
      })
      
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "No se pudo eliminar la imagen. Inténtalo de nuevo.",
      })
    } finally {
      setSaving(false)
    }
  }
    


  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-white">
        <p className="text-accent">Cargando...</p>
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
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
            <Button onClick={loadInfo} variant="outline">
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
        <CardTitle>Información del Equipo</CardTitle>
        <CardDescription>Gestiona los datos públicos que se muestran en la página principal</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50">
              {saving && info.logoUrl ? (
                  <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : null}
                
                {info.logoUrl ? (
                  <img 
                    src={info.logoUrl} 
                    alt="Team Logo" 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <Upload className="mx-auto h-8 w-8 mb-2" />
                    <span className="text-xs">Subir Logo</span>
                  </div>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="logo"
                className="cursor-pointer rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-primary hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Subiendo imagen..." : "Seleccionar Imagen"}
              </Label>
              <Input 
                id="logo" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
                disabled={saving}
              />
              
              {info.logoUrl && (
                <Button 
                  variant="ghost" 
                  type="button" 
                  size="sm" 
                  onClick={handleRemoveImage} 
                  disabled={saving}
                  className="px-2 text-red-500 border hover:text-red-600 hover:bg-transparent hover:border-red-500 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar imagen"
                  )}
                </Button>
              )}
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>Recomendado: 600x600px, PNG</p>
                <p>Máximo: 5MB</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Equipo</Label>
              <Input id="name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="founded">Año de Fundación</Label>
              <Input
                id="founded"
                type="number"
                value={info.founded}
                onChange={(e) => setInfo({ ...info, founded: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stadium">Estadio / Cancha</Label>
              <Input
                id="stadium"
                value={info.stadium}
                onChange={(e) => setInfo({ ...info, stadium: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad / Barrio</Label>
              <Input id="city" value={info.city} onChange={(e) => setInfo({ ...info, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="president">Presidente</Label>
              <Input
                id="president"
                value={info.president}
                onChange={(e) => setInfo({ ...info, president: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coach">Entrenador</Label>
              <Input id="coach" value={info.coach} onChange={(e) => setInfo({ ...info, coach: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción / Historia</Label>
            <Textarea
              id="description"
              className="min-h-[100px]"
              value={info.description}
              onChange={(e) => setInfo({ ...info, description: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full md:w-auto cursor-pointer">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
