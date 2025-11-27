import { players, matches, standings, nextMatch, callUp, teamInfo } from "./mock-data"

// This layer mimics Supabase's async behavior
// When you connect Supabase, you will replace these functions with actual DB queries

export const db = {
  getPlayers: async () => {
    // Supabase: const { data } = await supabase.from('players').select('*')
    return new Promise((resolve) => setTimeout(() => resolve(players), 100))
  },

  getMatches: async () => {
    // Supabase: const { data } = await supabase.from('matches').select('*')
    return new Promise((resolve) => setTimeout(() => resolve(matches), 100))
  },

  getLastMatches: async (limit = 8) => {
    // Supabase: const { data } = await supabase.from('matches').select('*').eq('played', true).order('date', { ascending: false }).limit(limit)
    const playedMatches = matches
      .filter((m) => m.played)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit)
    return new Promise((resolve) => setTimeout(() => resolve(playedMatches), 100))
  },

  getNextMatch: async () => {
    return new Promise((resolve) => setTimeout(() => resolve(nextMatch), 100))
  },

  getTeamStats: async () => {
    const playedMatches = matches.filter((m) => m.played)
    const wins = playedMatches.filter((m) => m.result === "Victoria").length
    const draws = playedMatches.filter((m) => m.result === "Empate").length
    const losses = playedMatches.filter((m) => m.result === "Derrota").length
    const goalsFor = playedMatches.reduce(
      (acc, m) => acc + (m.location === "Local" ? m.goalsFor : m.goalsAgainst),
      0,
    )
    const goalsAgainst = playedMatches.reduce(
      (acc, m) => acc + (m.location === "Local" ? m.goalsAgainst : m.goalsFor),
      0,
    )

    const stats = {
      totalGames: playedMatches.length,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      winPercentage: playedMatches.length > 0 ? Math.round((wins / playedMatches.length) * 100) : 0,
    }

    return new Promise((resolve) => setTimeout(() => resolve(stats), 100))
  },

  getStandings: async () => {
    return new Promise((resolve) => setTimeout(() => resolve(standings), 100))
  },

  getCallUp: async () => {
    const enrichedCallUp = callUp.map((c) => {
      const player = players.find((p) => p.id === c.playerId)
      return { ...player, status: c.status }
    })
    return new Promise((resolve) => setTimeout(() => resolve(enrichedCallUp), 100))
  },

  getTeamInfo: async () => {
    return new Promise((resolve) => setTimeout(() => resolve(teamInfo), 100))
  },

  updateTeamInfo: async (newInfo) => {
    // Supabase: const { error } = await supabase.from('team_info').update(newInfo).eq('id', 1)
    Object.assign(teamInfo, newInfo)
    return new Promise((resolve) => setTimeout(() => resolve(teamInfo), 100))
  },
}
