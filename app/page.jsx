"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Trophy, Volleyball, Goal, Clock4 } from "lucide-react"
import { db } from "@/lib/db"

export default function PublicDashboard() {
  const [nextMatch, setNextMatch] = useState(null)
  const [stats, setStats] = useState(null)
  const [teamInfo, setTeamInfo] = useState(null)
  const [callUp, setCallUp] = useState([])
  const [lastMatches, setLastMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [matchData, statsData, infoData, callUpData, lastMatchesData] = await Promise.all([
          db.getNextMatch(),
          db.getTeamStats(),
          db.getTeamInfo(),
          db.getCallUp(),
          db.getLastMatches(8),
        ])
        setNextMatch(matchData)
        setStats(statsData)
        setTeamInfo(infoData)
        setCallUp(callUpData)
        setLastMatches(lastMatchesData)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
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
                <div className="mx-auto h-16 w-16 overflow-hidden items-center justify-center rounded-2xl">
                  <img
                    src={teamInfo.logoUrl}
                    alt={teamInfo.name}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : (
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-4xl font-bold text-white">
                  {teamInfo?.name.substring(0, 1).toUpperCase()}
                </div>
              )}
              
            <div>
              <h1 className="font-heading text-xl uppercase leading-none text-primary">
                {teamInfo?.name || "Futbol App"}
              </h1>
            </div>
          </div>
          <Link href="/login">
            <Button className="flat-button bg-primary text-white hover:bg-primary/90">Admin</Button>
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

                <div className="relative z-10 mb-6 flex items-center gap-2 rounded-full bg-black/20 px-4 py-1.5 text-sm font-bold backdrop-blur-sm">
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
                    <div className="mb-2 font-heading text-3xl font-bold text-secondary md:text-5xl">{teamInfo.name}</div>
                    <div className="text-sm font-bold uppercase tracking-widest opacity-80">Local</div>
                  </div>
                  <div className="font-heading text-4xl font-bold text-white/40 md:text-6xl">VS</div>
                  <div className="flex-1">
                    <div className="mb-2 font-heading text-3xl font-bold md:text-5xl">{nextMatch.opponent}</div>
                    <div className="text-sm font-bold uppercase tracking-widest opacity-80">Visitante</div>
                  </div>
                </div>

                <div className="mt-12 w-full flex items-center justify-center md:justify-between flex-wrap gap-2 border-t px-6 py-4 text-md font-semibold backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="h-5 w-5 text-secondary" />
                    {nextMatch.location === "Local" ? teamInfo?.stadium : "Cancha Visitante"}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Clock4 className="h-5 w-5 text-secondary"/>
                    {nextMatch.time} hrs.
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center bg-white p-8">
                <h3 className="mb-6 font-heading text-xl uppercase text-primary">Detalles del Partido</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-center md:justify-between flex-wrap gap-2 rounded-lg bg-gray-50 p-3">
                    <span className="font-bold text-gray-500">Competición:</span>
                    <span className="font-bold text-foreground">Liga Barrial la México</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-between flex-wrap gap-2 rounded-lg bg-gray-50 p-3">
                    <span className="font-bold text-gray-500">Hora:</span>
                    <span className="font-bold text-foreground">{nextMatch.time}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-between flex-wrap gap-2 rounded-lg bg-gray-50 p-3">
                    <span className="font-bold text-gray-500">Clima:</span>
                    <span className="font-bold text-foreground">Soleado 24°C</span>
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
              <p className="text-xl font-bold text-gray-400">No hay partidos programados</p>
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

            <div className="bg-white p-4 rounded-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative overflow-hidden rounded-xl border-l-4 border-b-4 border-primary p-6">
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

                <div className="relative overflow-hidden rounded-xl border-l-4 border-b-4 border-secondary p-6">
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

                <div className="relative overflow-hidden rounded-xl border-l-4 border-b-4 border-accent p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold uppercase text-gray-400">% Victorias</span>
                    <Goal className="h-5 w-5 text-accent" />
                  </div>
                  <div className="font-heading text-4xl text-foreground">{stats?.winPercentage || 0}%</div>
                  <div className="mt-2 text-xs font-bold text-accent">RENDIMIENTO GLOBAL</div>
                </div>
              </div>
            </div>
          </section>

          {/* Resultados Partidos */}
          <section className="my-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-8 w-1.5 rounded-full bg-accent"></div>
              <h2 className="font-heading text-2xl uppercase text-primary md:text-3xl">Últimos Resultados</h2>
            </div>
            <p className="text-gray-600 my-4 text-md ml-4">Últimos 8 partidos</p>

            <div className="grid md:grid-cols-2 gap-4">
              {lastMatches.map((match) => {
                const homeScore =
                  typeof match.goalsFor === "number" ? match.goalsFor : "-"
                const rivalScore =
                  typeof match.goalsAgainst === "number" ? match.goalsAgainst : "-"

                return (
                  <div key={match.id} className="flat-card flex flex-col justify-between gap-4 hover:border-accent/30">
                    <div className="flex items-center justify-between text-xs font-bold uppercase text-gray-400">
                      <span>{new Date(match.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>

                      <span
                        className={`rounded px-2 py-0.5 ${
                          match.result === "Victoria"
                            ? "bg-green-100 text-green-700"
                            : match.result === "Empate"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {match.result}
                      </span>
                    </div>

                    {/* Tarjetas resultados partidos */}
                    <div className="grid grid-cols-3 items-center justify-between">
                      <div className="flex flex-col items-center gap-1 text-center">
                        <span className="font-heading text-lg font-bold text-primary">{teamInfo.name}</span>
                        <span className="text-2xl font-bold">{homeScore}</span>
                      </div>

                      <span className="text-accent font-bold text-center">vs</span>

                      <div className="flex flex-col items-center gap-1 text-center">
                        <span className="font-heading text-lg font-bold text-gray-500">
                          {/* {match.opponent.substring(0, 3).toUpperCase()} */}
                          {match.opponent}
                        </span>
                        <span className="text-2xl font-bold">{rivalScore}</span>
                      </div>
                    </div>
                    <div className="text-center text-xs font-bold text-gray-400 uppercase">{match.location}</div>
                  </div>
                )
              })}
              {lastMatches.length === 0 && (
                <div className="col-span-full rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400">
                  No hay partidos jugados registrados.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Team Info y Convocatoria*/}
        <div className="grid gap-8 lg:grid-cols-3 my-12">
          {/* Team Info */}
          <div className="lg:col-span-1">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-8 w-1.5 rounded-full bg-secondary"></div>
              <h2 className="font-heading text-2xl uppercase text-primary">El Club</h2>
            </div>
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
                    {teamInfo?.name.substring(0, 1).toUpperCase()}
                  </div>
                )}
                <h3 className="font-heading text-xl uppercase text-primary">{teamInfo?.name}</h3>
                <p className="text-sm font-bold text-gray-400">Fundado en {teamInfo?.founded}</p>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-gray-600">{teamInfo?.description}</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                  <span className="font-bold text-gray-500">Presidente</span>
                  <span className="font-bold text-foreground">{teamInfo?.president}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                  <span className="font-bold text-gray-500">DT</span>
                  <span className="font-bold text-foreground">{teamInfo?.coach}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-gray-50 p-3">
                  <span className="font-bold text-gray-500">Sede</span>
                  <span className="font-bold text-foreground">{teamInfo?.city}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Convocatoria */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-8 w-1.5 rounded-full bg-primary"></div>
              <h2 className="font-heading text-2xl uppercase text-primary">Convocatoria Oficial</h2>
            </div>

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
            {callUp.filter((p) => p.status === "Convocado").length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-400">
                Aún no se ha anunciado la convocatoria.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-50 bg-primary py-8 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4 font-heading text-2xl uppercase tracking-widest text-secondary">{teamInfo.name}</div>
          <p className="text-sm">© 2025 Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
