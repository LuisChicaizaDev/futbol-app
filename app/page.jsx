"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, MapPin, Trophy, Goal, TrendingUp, Clock4, User, AlertCircle } from "lucide-react"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"

export default function PublicDashboard() {
  const [nextMatch, setNextMatch] = useState(null)
  const [stats, setStats] = useState(null)
  const [teamInfo, setTeamInfo] = useState(null)
  const [callUp, setCallUp] = useState([])
  const [lastMatches, setLastMatches] = useState([])
  const [topScorers, setTopScorers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null) // Limpiar error anterior
      const [matchData, statsData, infoData, callUpData, lastMatchesData, playersData] = await Promise.all([
        db.getNextMatch(),
        db.getTeamStats(),
        db.getTeamInfo(),
        db.getCallUp(),
        db.getLastMatches(10),
        db.getPlayers(),
      ])

      setNextMatch(matchData)
      setStats(statsData)
      setTeamInfo(infoData)
      setLastMatches(lastMatchesData)
      const sortedScorers = [...playersData].sort((a, b) => (b.goals || 0) - (a.goals || 0))
      setTopScorers(sortedScorers.slice(0, 6))
      setCallUp(callUpData)

    } catch (error) {
      console.error("Error loading data:", error)
      setError("No se pudieron cargar los datos del equipo. Verifica tu conexión a internet e intenta nuevamente.")
    } finally {
      setLoading(false)
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-white">
        <div className="max-w-lg rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <div className="text-destructive mb-4">
            <AlertCircle className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-destructive mb-2">Error al cargar datos</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadData} variant="outline">
            Intentar nuevamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {teamInfo?.logoUrl ? (
                <div className="mx-auto h-16 w-16 overflow-hidden items-center justify-center rounded-md">
                  <img
                    src={teamInfo.logoUrl}
                    alt={teamInfo.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white">
                  {teamInfo?.name.substring(0, 1).toUpperCase() || 'F'}
                </div>
              )}
              
            <div>
              <h1 className="font-heading text-xl uppercase leading-none text-primary">
                {teamInfo?.name || "Futbol App"}
              </h1>
            </div>
          </div>
          <Link href="/login">
            <button className="flex items-center gap-1 p-2 rounded-md bg-primary text-white hover:bg-primary/90 uppercase font-semibold text-sm">
              <User className="size-5" /> Admin
            </button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto space-y-12 px-4 py-12">
        {/* Hero Section: Next Match */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <div className="h-8 w-1.5 rounded-full bg-secondary"></div>
            <h2 className="font-heading text-2xl uppercase text-primary md:text-3xl">Próximo Encuentro</h2>
          </div>

          {nextMatch ? (
            <div className="overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-sm transition-all hover:shadow-md lg:grid lg:grid-cols-3">
              <div className="relative flex flex-col items-center justify-center bg-linear-to-br from-accent to-accent/90  p-8 text-white lg:col-span-2 lg:p-12">
                {/* Background Pattern */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                    backgroundSize: "24px 24px",
                  }}
                ></div>

                <div className="relative z-10 mb-7 flex items-center gap-2 uppercase rounded-full bg-secondary/90 px-4 py-1.5 text-sm text-accent font-bold">
                  <Calendar className="h-4 w-4" />
                  {new Date(nextMatch.date).toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>

                <div className="relative z-10 flex w-full flex-col items-center justify-between gap-8 text-center md:flex-row">
                  <div className="flex-1">
                    <div className="mb-2 font-heading text-3xl font-bold text-secondary md:text-5xl capitalize">{teamInfo.name}</div>
                    <div className="text-sm font-bold uppercase tracking-widest opacity-80">Local</div>
                  </div>
                  <div className="font-heading text-4xl font-bold text-white/40 md:text-6xl">VS</div>
                  <div className="flex-1">
                    <div className="mb-2 font-heading text-3xl font-bold md:text-5xl capitalize">{nextMatch.opponent}</div>
                    <div className="text-sm font-bold uppercase tracking-widest opacity-80">Visitante</div>
                  </div>
                </div>

                <div className="mt-12 w-full flex items-center justify-center md:justify-between flex-wrap gap-2 border-t px-6 pt-4 text-md font-semibold backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="h-5 w-5 text-secondary" />
                    {nextMatch.location === "Local" ? teamInfo?.stadium : "Cancha Visitante"}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Clock4 className="h-5 w-5 text-secondary"/>
                    {nextMatch.time} h
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center bg-white p-8">
                <h3 className="mb-6 font-heading text-xl uppercase text-primary border-b-2 border-b-primary pb-4">Detalles del Partido</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-center md:justify-between flex-wrap gap-2 rounded-lg bg-gray-50 p-3">
                    <span className="font-bold text-gray-500">Competición:</span>
                    <span className="font-bold text-foreground">Liga Barrial la México</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-between flex-wrap gap-2 rounded-lg bg-gray-50 p-3">
                    <span className="font-bold text-gray-500">Hora:</span>
                    <span className="font-bold text-foreground">{nextMatch.time} h</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-between flex-wrap gap-2 rounded-lg bg-gray-50 p-3">
                    <span className="font-bold text-gray-500">Concentración:</span>
                    <span className="font-bold text-foreground">30 min antes</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
              <p className="text-xl font-bold text-gray-400">No hay partidos programados.</p>
            </div>
          )}
        </section>

        {/* Stats */}
        <div className="grid lg:grid-cols-[auto_1fr] gap-8">
          {/* Estadisticas Partidos */}
          <section className="my-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-8 w-1.5 rounded-full bg-secondary"></div>
              <h2 className="font-heading text-2xl uppercase text-primary md:text-3xl">Estadísticas</h2>
            </div>

            <p className="text-gray-600 my-4 text-md ml-4">Estadísticas generales del equipo</p>

            {stats ? (
              <div className="grid md:grid-cols-1 gap-5">
                {/*Partidos*/}
                <div className="flat-card relative overflow-hidden rounded-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-md font-bold uppercase text-gray-800">Partidos</span>
                    <Trophy className="size-6 text-primary" />
                  </div>

                  <div className="text-center p-3 rounded-lg bg-gray-50/80 border border-gray-100 mb-3">
                    <div className="font-heading text-4xl text-foreground mb-1">{stats?.totalGames || 0}</div>
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                      En Total
                    </div>
                  </div>
                  <div className="space-y-3">
                    {/* Victorias */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-green-600">Victorias</span>
                      <div className="relative w-16 h-2 bg-green-200 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-green-600 rounded-full transition-all duration-500"
                          style={{ width: `${stats?.totalGames ? ((stats.wins || 0) / stats.totalGames) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-green-600 min-w-[2ch]">{stats?.wins || 0}</span>
                    </div>

                    {/* Empates */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-yellow-600">Empates</span>
                      <div className="relative w-16 h-2 bg-yellow-200 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-yellow-600 rounded-full transition-all duration-500"
                          style={{ width: `${stats?.totalGames ? ((stats.draws || 0) / stats.totalGames) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-yellow-600 min-w-[2ch]">{stats?.draws || 0}</span>
                    </div>
                  
                    {/* Derrotas */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-red-600">Derrotas</span>
                      <div className="relative w-16 h-2 bg-red-200 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-red-500 rounded-full transition-all duration-500"
                          style={{ width: `${stats?.totalGames ? ((stats.losses || 0) / stats.totalGames) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-red-600 min-w-[2ch]">{stats?.losses || 0}</span>
                    </div>
                  </div>
                </div>

                {/*Goles*/}
                <div className="flat-card relative overflow-hidden rounded-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-md font-bold uppercase text-gray-800">Goles</span>
                    <Goal className="size-6 text-gray-400"/>
                  </div>

                  {/* Sección principal*/}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Goles a Favor */}
                    <div className="text-center p-3 rounded-lg bg-green-50/80 border border-green-100">
                      <div className="font-heading text-3xl font-bold text-green-600 mb-1">
                        {stats?.goalsFor || 0}
                      </div>
                      <div className="text-xs font-bold text-green-600 uppercase tracking-wide">
                        A Favor
                      </div>
                    </div>

                    {/* Goles en Contra */}
                    <div className="text-center p-3 rounded-lg bg-red-50/80 border border-red-100">
                      <div className="font-heading text-3xl font-bold text-red-600 mb-1">
                        {stats?.goalsAgainst || 0}
                      </div>
                      <div className="text-xs font-bold text-red-600 uppercase tracking-wide">
                        En Contra
                      </div>
                    </div>
                  </div>

                  {/* Diferencia destacada */}
                  <div className="text-center pt-3 border-dashed border-t-2">
                    <div className="flex justify-between">
                      <div className="text-sm font-bold text-accent mb-1">Diferencia Goles</div>
                      <div className={`text-md font-bold ${stats && stats.goalsFor - stats.goalsAgainst > 0 ? 'text-green-600' : stats && stats.goalsFor - stats.goalsAgainst < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {stats && stats.goalsFor - stats.goalsAgainst > 0 ? "+" : ""}
                        {stats ? stats.goalsFor - stats.goalsAgainst : 0}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-center">
                      {stats && stats.goalsFor - stats.goalsAgainst > 0 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-green-800 border border-green-700">
                          <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                          Balance Positivo
                        </span>
                      ) : stats && stats.goalsFor - stats.goalsAgainst < 0 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-red-800 border border-red-700">
                          <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                          Balance Negativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-gray-800 border border-gray-700">
                          <span className="w-2 h-2 bg-gray-600 rounded-full mr-2"></span>
                          Balance Equilibrado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/*Rendimiento*/}
                <div className="flat-card relative overflow-hidden rounded-xl">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-md font-bold uppercase text-gray-800">Rendimiento General</span>
                    <TrendingUp className="size-6 text-accent" />
                  </div>

                  <div className="text-center mb-6">
                    <div className="font-heading text-4xl font-bold text-foreground mb-2">
                      {stats?.winPercentage || 0}%
                    </div>
                    <div className="text-sm font-bold text-accent uppercase tracking-wide">
                      Porcentaje de Victorias
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      De <strong>{stats?.totalGames || 0}</strong> partidos jugados
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Puntos Totales */}
                    <div className="flex flex-col justify-center items-center p-4 rounded-lg bg-accent/10 border border-accent/20">
                      <p className="text-xs font-bold text-accent uppercase">Puntos</p>
                      <div className="text-2xl font-bold text-accent">
                        {((stats?.wins || 0) * 3) + (stats?.draws || 0)}
                      </div>
                      <div className="text-xs text-accent">
                        Max. posible: {(stats?.totalGames || 0) * 3}
                      </div>
                    </div>

                    {/* Clasificación */}
                    <div className="flex flex-col justify-center items-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-xs font-bold text-primary uppercase">
                        Rendimiento
                      </p>
                      <div className="text-lg font-bold text-primary">
                        {stats?.winPercentage >= 80 ? '⭐⭐⭐' :
                         stats?.winPercentage >= 60 ? '⭐⭐' :
                         stats?.winPercentage >= 40 ? '⭐' : '📈'}
                      </div>
                      <div className="text-xs text-primary uppercase">
                        {stats?.winPercentage >= 80 ? 'Excelente' :
                         stats?.winPercentage >= 60 ? 'Muy Bueno' :
                         stats?.winPercentage >= 40 ? 'Regular' : 'En Progreso'}
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso final */}
                  <div className="mt-6 pt-4 border-dashed border-t-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-gray-600">Progreso de Temporada</span>
                      <span className="text-sm font-bold text-accent">{stats?.winPercentage || 0}%</span>
                    </div>
                    <div className="relative h-3 bg-accent/20 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-accent rounded-full transition-all duration-700"
                        style={{ width: `${stats?.winPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
                <p className="text-md font-semibold text-gray-400">Aún no hay estadísticas del equipo disponible.</p>
              </div>
            )}
          </section>

          {/* Resultados Partidos */}
          <section className="my-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-8 w-1.5 rounded-full bg-accent"></div>
              <h2 className="font-heading text-2xl uppercase text-primary md:text-3xl">Últimos Resultados</h2>
            </div>
            <p className="text-gray-600 my-4 text-md ml-4">Últimos <strong>{lastMatches.length}</strong> partidos jugados</p>

            <div className="grid md:grid-cols-2 gap-6">
              {lastMatches.map((match) => {
                const homeScore =
                  typeof match.goalsFor === "number" ? match.goalsFor : "-"
                const rivalScore =
                  typeof match.goalsAgainst === "number" ? match.goalsAgainst : "-"

                return (
                  <div 
                    key={match.id} 
                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 
                    hover:shadow-lg hover:border-accent/30"
                  >
                    {/* Header con fecha y resultado */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="size-4" />
                          <span className="font-medium">
                            {new Date(match.date).toLocaleDateString("es-ES", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Badge de resultado */}
                      <div className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-semibold border ${
                        match.result === "Victoria"
                          ? "bg-green-50 text-green-700 border-green-300"
                          : match.result === "Empate"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-300"
                            : "bg-red-50 text-red-700 border-red-300"
                      }`}>
                        {match.result}
                      </div>
                    </div>

                    {/* Marcador principal */}
                    <div className="flex items-center justify-between mb-4">
                      {/* Equipo local */}
                      <div className="flex-1 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-sm font-bold text-primary uppercase tracking-wide">
                            {teamInfo.name}
                          </span>
                        </div>
                        <div className="text-4xl font-bold text-primary">{homeScore}</div>
                      </div>

                      {/* VS */}
                      <div className="flex flex-col items-center mx-4">
                        <div className="text-accent font-bold text-lg mb-1">VS</div>
                        <div className="w-8 h-px bg-accent"></div>
                      </div>

                      {/* Equipo visitante */}
                      <div className="flex-1 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                            {match.opponent}
                          </span>
                        </div>
                        <div className="text-4xl font-bold text-gray-600">{rivalScore}</div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          <span className="capitalize font-medium">{match.location}</span>
                        </div>
                        {match.competition && (
                          <div className="flex items-center gap-1">
                            <Trophy className="size-3" />
                            <span className="font-medium">{match.competition}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Efecto hover sutil */}
                    <div className="absolute inset-0 bg-linear-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  </div>
                )
              })}
              {lastMatches.length === 0 && (
                <div className="col-span-full rounded-2xl border-2 border-dashed border-gray-200 bg-white p-16 text-center text-gray-500">
                  <div className="mb-4">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-400 mb-2">Sin partidos registrados</h3>
                  <p className="text-sm text-gray-500">Los resultados aparecerán aquí una vez que se jueguen partidos.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Goleadores */}
        <section className="mb-30">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-8 w-1.5 rounded-full bg-secondary"></div>
            <h2 className="font-heading text-2xl uppercase text-primary md:text-3xl">Goleadores</h2>
          </div>
          <p className="text-gray-600 my-4 text-md ml-4">Máximos anotadores de la temporada</p>

          {topScorers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {topScorers.map((player, index) => (
                <div key={player.id} className="flat-card relative overflow-hidden border-primary/20">
                  <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-accent">
                    {index + 1} º
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
                        {player.number}
                      </div>
                      <div>
                        <div className="font-heading text-lg uppercase text-foreground">{player.name}</div>
                        <div className="text-xs font-bold uppercase text-gray-400">{player.position}</div>
                      </div>
                    </div>
                    <div className="flex items-end justify-between border-t border-dashed border-gray-200 pt-4">
                      <div>
                        <div className="text-xs font-bold uppercase text-gray-400">Goles</div>
                        <div className="font-heading text-4xl text-accent">{player.goals ?? 0}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold uppercase text-gray-400">Asistencias</div>
                        <div className="font-heading text-2xl text-foreground">{player.assists ?? 0}</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                      {/* <span>Partidos: {player.gamesPlayed ?? 0}</span> */}
                      <span>Tarjetas: {player.yellowCards ?? 0}A / {player.redCards ?? 0}R</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
              <p className="text-md font-semibold text-gray-400">No hay registros de goleadores disponibles.</p>
            </div>
          )}
        </section>

        {/* Team Info y Convocatoria*/}
        <div className="grid gap-8 lg:grid-cols-3 my-12">
          {/* Team Info */}
          <div className="lg:col-span-1">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-8 w-1.5 rounded-full bg-secondary"></div>
              <h2 className="font-heading text-2xl uppercase text-primary">El Club</h2>
            </div>

            <p className="text-gray-600 my-4 text-md ml-4">Información general del equipo</p>

            {teamInfo ? (
              <div className="flat-card bg-white">
                <div className="mb-6 text-center">
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
                      {teamInfo?.name.substring(0, 1).toUpperCase() || 'F'}
                    </div>
                  )}
                  <h3 className="font-heading text-xl uppercase text-primary">{teamInfo?.name}</h3>
                  <p className="text-sm font-bold text-gray-400">Fundado en {teamInfo?.founded}</p>
                </div>
                <p className="mb-6 text-sm leading-relaxed text-gray-600">{teamInfo?.description}</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                    <span className="font-bold text-gray-500">Presidente</span>
                    <span className="font-bold text-foreground capitalize">{teamInfo?.president}</span>
                  </div>
                  <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                    <span className="font-bold text-gray-500">DT</span>
                    <span className="font-bold text-foreground capitalize">{teamInfo?.coach}</span>
                  </div>
                  <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                    <span className="font-bold text-gray-500">Sede</span>
                    <span className="font-bold text-foreground capitalize">{teamInfo?.city}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
                <p className="text-md font-semibold text-gray-400">Aún no hay informarción del equipo disponible.</p>
              </div>
            )}
          </div>

          {/* Convocatoria */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-8 w-1.5 rounded-full bg-primary"></div>
              <h2 className="font-heading text-2xl uppercase text-primary">Convocatoria Oficial</h2>
            </div>
            {nextMatch && (
              <p className="text-gray-600 my-4 text-md ml-4">
                Total <strong>{callUp.filter((p) => p.status === "Convocado").length} convocados</strong> para jugar contra <strong className="capitalize">{nextMatch.opponent}</strong>  - &nbsp;
                <strong className="uppercase text-xs text-accent"> 
                  {new Date(nextMatch.date).toLocaleDateString("es-ES", {
                    weekday: "long", day: "numeric", month: "short", year: "numeric"
                  })}
                </strong>
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {callUp
                .filter((p) => p.status === "Convocado")
                .map((player) => (
                  <div
                    key={player.id}
                    className="flat-card flex items-center gap-4 p-4 hover:border-primary hover:shadow-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-xl font-bold text-primary">
                      {player.number}
                    </div>
                    <div>
                      <div className="font-heading text-lg uppercase text-foreground">{player.name}</div>
                      <div className="text-xs font-bold uppercase text-primary">{player.position}</div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Resumen de lesionados y suspendidos */}
            {nextMatch && callUp.filter((p) => p.status === "Convocado").length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-destructive"></div>
                  <span className="font-medium text-destructive">
                    Jugadores Lesionados: <strong>{callUp.filter((p) => p.status === "Lesionado").length}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground"></div>
                  <span className="font-medium text-muted-foreground">
                    Jugadores Suspendidos: <strong>{callUp.filter((p) => p.status === "Suspendido").length}</strong>
                  </span>
                </div>
              </div>
            )}

            {callUp.filter((p) => p.status === "Convocado").length === 0 && (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
                <p className="text-md font-semibold text-gray-400">Aún no se ha anunciado la convocatoria.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-50 bg-accent py-6 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 font-heading text-2xl uppercase tracking-widest text-secondary">{teamInfo.name}</div>
          <p className="text-sm">© 2025 Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
