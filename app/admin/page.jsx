"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  CalendarIcon,
  LogOut,
  Info,
  Menu,
  PlusCircle,
  UserPlus,
  ListChecks,
  Trophy, 
  Volleyball, 
  TrendingUp,
  CircleX
} from "lucide-react"
import { db } from "@/lib/db" // Obtenemos los datos del backend con Supabase
import { PlayerManagement } from "@/components/admin/player-management"
import { MatchManagement } from "@/components/admin/match-management"
import { CallUpManagement } from "@/components/admin/callup-management"
import { TeamInfoManagement } from "@/components/admin/team-info-management"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"  // import Supabase Auth

export default function AdminDashboard() {

  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState(null)
  const [playerCount, setPlayerCount] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()  // Agregar cliente

  const loadStats = async () => {
    try {
      const teamStats = await db.getTeamStats()
      const players = await db.getPlayers()
      setStats(teamStats)
      setPlayerCount(players.length)
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login") // Si se intenta accede a /admin sin logarse, redirige a /login
      } else {
        setIsAuthenticated(true)
        await loadStats()
        setLoading(false)
      }
    }
    checkAuth()
  }, [router, supabase])

  // Recargar estadísticas cada vez que se vuelve a la pestaña "Resumen"
  useEffect(() => {
    if (activeTab === "overview" && isAuthenticated) {
      loadStats()
    }
  }, [activeTab, isAuthenticated])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login") // Cerrar sesión envia al login
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-white">
        <p className="text-accent">Autenticando usuario...</p>
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!isAuthenticated || loading) return null

  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => {
        setActiveTab(id)
        setSidebarOpen(false)
      }}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold uppercase transition-all cursor-pointer ${
        activeTab === id
          ? "bg-primary text-white"
          : "text-gray-500 hover:bg-gray-100 hover:text-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-gray-200 bg-white p-4 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button className="w-full flex justify-end md:hidden" onClick={() => setSidebarOpen(false)}>
          <CircleX className="h-6 w-6" />
        </button>
        <div className="mb-8 flex h-20 items-center justify-center border-b border-primary text-primary">
          <div className="font-heading text-xl uppercase tracking-wider">Admin Panel</div>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem id="overview" icon={LayoutDashboard} label="Resumen" />
          <NavItem id="players" icon={Users} label="Jugadores" />
          <NavItem id="matches" icon={CalendarIcon} label="Partidos" />
          <NavItem id="callups" icon={ListChecks} label="Convocatoria" />
          <NavItem id="info" icon={Info} label="Info Equipo" />
        </nav>

        <Link href="/" target="_blank">
          <Button className="flat-button bg-secondary text-primary hover:bg-secondary/90 w-full my-10 cursor-pointer py-3">Ver Sitio Público</Button>
        </Link>

        <div className="absolute bottom-18 left-4 right-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive font-bold uppercase"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Salir
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-25 items-center justify-between border-b border-gray-200 bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <div className="font-heading text-xl uppercase text-foreground">
              {activeTab === "overview" && "Vista General"}
              {activeTab === "players" && "Gestión de Plantilla"}
              {activeTab === "matches" && "Calendario y Resultados"}
              {activeTab === "callups" && "Gestión de Convocatoria"}
              {activeTab === "info" && "Configuración del Equipo"}
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === "overview" && (
            <div className="space-y-8">
              <h2 className="text-xl">Área de Administración</h2>
              <p>
                Controla toda la información del equipo: gestiona jugadores, organiza partidos, actualiza los datos del club y define las convocatorias.
              </p>
              {/* Stats Cards */}
              <section className="my-6">
                <h2 className="mb-4 font-heading text-lg uppercase text-gray-500">Estadísticas</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flat-card group relative overflow-hidden border-l-4 border-l-primary p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-bold uppercase text-gray-400">Partidos</span>
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div className="font-heading text-4xl text-foreground">{stats?.totalGames || 0}</div>
                    <div className="mt-2 flex gap-2 text-xs font-bold">
                      <span className="text-green-600">{stats?.wins || 0} G</span>
                      <span className="text-yellow-600">{stats?.draws || 0} E</span>
                      <span className="text-red-600">{stats?.losses || 0} P</span>
                    </div>
                  </div>

                  <div className="flat-card group relative overflow-hidden border-l-4 border-l-secondary p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-bold uppercase text-gray-400">Goles</span>
                      <Volleyball className="h-5 w-5 text-gray-500"/>
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="font-heading text-4xl text-foreground">{stats?.goalsFor || 0}</div>
                      <div className="mb-1 text-sm font-bold text-green-600">A Favor</div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs font-bold text-gray-400">
                      <span className="text-red-600">{stats?.goalsAgainst || 0} En Contra</span>
                      <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                      <span className="text-accent">
                        {stats && stats.goalsFor - stats.goalsAgainst > 0 ? "+" : ""}
                        {stats ? stats.goalsFor - stats.goalsAgainst : 0} Dif
                      </span>
                    </div>
                  </div>

                  <div className="flat-card group relative overflow-hidden border-l-4 border-l-destructive p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-bold uppercase text-gray-400">Porcentaje Victorias</span>
                      <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                    <div className="font-heading text-4xl text-foreground">{stats?.winPercentage || 0}%</div>
                    <div className="mt-2 text-xs font-bold text-accent">RENDIMIENTO GLOBAL</div>
                  </div>

                  <div className="flat-card group relative overflow-hidden border-l-4 border-l-info p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-bold uppercase text-gray-400">Total Jugadores</span>
                      <Users className="h-5 w-5 text-info" />
                    </div>
                    <div className="font-heading text-4xl text-foreground">{playerCount || 0}</div>
                    <div className="mt-2 text-xs font-bold text-gray-600">EN LA PLANTILLA</div>
                  </div>
                </div>
              </section>

              {/*Acessos rápidos */}
              <div>
                <h2 className="mb-4 font-heading text-lg uppercase text-gray-500">Accesos Rápidos</h2>
                <div className="grid gap-4 lg:grid-cols-3">
                  <button
                    onClick={() => setActiveTab("players")}
                    className="flex items-center gap-4 rounded-xl border-2 border-gray-100 bg-white p-6 transition-all hover:border-primary hover:shadow-md text-left group cursor-pointer"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <UserPlus className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold uppercase text-foreground">Gestionar Jugadores</div>
                      <div className="text-xs text-gray-400 font-medium">Añadir o editar plantilla</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("matches")}
                    className="flex items-center gap-4 rounded-xl border-2 border-gray-100 bg-white p-6 transition-all hover:border-secondary hover:shadow-md text-left group cursor-pointer"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary-foreground group-hover:bg-secondary group-hover:text-primary transition-colors">
                      <PlusCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold uppercase text-foreground">Nuevo Partido</div>
                      <div className="text-xs text-gray-400 font-medium">Programar encuentro</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("callups")}
                    className="flex items-center gap-4 rounded-xl border-2 border-gray-100 bg-white p-6 transition-all hover:border-accent hover:shadow-md text-left group cursor-pointer"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                      <ListChecks className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold uppercase text-foreground">Convocatoria</div>
                      <div className="text-xs text-gray-400 font-medium">Definir citados</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "players" && <PlayerManagement />}
          {activeTab === "matches" && <MatchManagement />}
          {activeTab === "callups" && <CallUpManagement />}
          {activeTab === "info" && <TeamInfoManagement />}
        </div>

         {/* Footer */}
        <footer className="mt-50 bg-accent py-6 text-white">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">© 2025 Todos los derechos reservados.</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
