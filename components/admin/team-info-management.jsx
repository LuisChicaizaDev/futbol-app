"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/lib/db"
import { Save, Loader2, Upload } from "lucide-react"
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
  const { toast } = useToast()

  const loadInfo = useCallback(async () => {
    try {
      setLoading(true)
      const data = await db.getTeamInfo()
      setInfo(data)
    } catch (error) {
      console.error(error)
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // In a real app, you would upload to Supabase Storage here
      // For now, we'll create a fake local URL
      const fakeUrl = URL.createObjectURL(file)
      setInfo({ ...info, logoUrl: fakeUrl })
      toast({
        variant: "success",
        title: "Logo cargado",
        description: "La imagen se ha cargado temporalmente (modo demo).",
      })
    }
  }
  const handleRemoveImage = () => {
    if (info.logoUrl && info.logoUrl.startsWith("blob:")) {
      URL.revokeObjectURL(info.logoUrl)
    }
    setInfo({ ...info, logoUrl: "" })
    toast({
      variant: "destructive",
      title: "Logo eliminado",
      description: "Se restauró la imagen por defecto.",
    })
  }


  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
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
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50">
              {info.logoUrl ? (
                <img src={info.logoUrl} alt="Team Logo" className="h-full w-full object-cover" />
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
                className="cursor-pointer rounded-lg bg-secondary px-4 py-2 text-sm font-bold text-primary hover:bg-secondary/90"
              >
                Seleccionar Imagen
              </Label>
              <Input id="logo" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              {info.logoUrl && info.logoUrl && (
                <Button variant="ghost" type="button" size="sm" onClick={handleRemoveImage} className="px-2 text-red-500 border hover:text-red-600 hover:bg-transparent hover:border-red-500 cursor-pointer">
                  Eliminar imagen
                </Button>
              )}
              <p className="text-xs text-gray-500">Recomendado: 500x500px, PNG o JPG</p>
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
