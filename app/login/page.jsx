"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, User, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { db } from "@/lib/db"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [teamInfo, setTeamInfo] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        const infoData = await db.getTeamInfo()
        setTeamInfo(infoData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Mock authentication - Replace with Supabase auth later
    // supabase.auth.signInWithPassword({ email, password })
    // Simulación de autenticación
    setTimeout(() => {
      if (email === "admin@brasilfc.com" && password === "admin123") {
        localStorage.setItem("isAuthenticated", "true")
        router.push("/admin")
      } else {
        setError("Credenciales no válidas")
        setLoading(false)
      }
    }, 1000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8">
        <Button variant="ghost" className="gap-2 ">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Button>
      </Link>
      <div className="w-full max-w-md rounded-lg border-2 border-gray-200 bg-white p-8 shadow-none">
        <div className="mb-8 text-center">
          {teamInfo?.logoUrl ? (
              <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-2xl">
                <img
                  src={teamInfo.logoUrl}
                  alt={teamInfo.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary text-5xl font-bold text-white">
                {teamInfo?.name?.substring(0, 1).toUpperCase() || 'A'}
              </div>
            )}
          <h1 className="text-2xl font-bold uppercase text-accent">Acceso Admin</h1>
          <p className="text-sm text-gray-500">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold uppercase text-xs text-gray-500">
              Email
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="admin@brasilfc.com"
                className="pl-10 rounded-md border-gray-200 focus:border-primary focus:ring-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-bold uppercase text-xs text-gray-500">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10 rounded-md border-gray-200 focus:border-primary focus:ring-0"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="bg-destructive/10 p-3 text-center text-sm font-bold text-destructive">{error}</div>}

          <Button
            type="submit"
            className="w-full rounded-md bg-accent py-6 font-bold uppercase text-white hover:bg-accent/90"
            disabled={loading}
          >
            {loading ? "Verificando..." : "Ingresar"}
          </Button>
        </form>
        <div className="flex justify-center border-t border-gray-100 p-4">
          <p className="text-xs text-muted-foreground">Credenciales demo: admin@brasilfc.com / admin123</p>
        </div>
      </div>
    </div>
  )
}
