import { createSupabaseBrowserClient } from "./supabase/client"

let browserClient = null

const getSupabaseClient = () => {
  if (!browserClient) {
    browserClient = createSupabaseBrowserClient()
  }
  return browserClient
}

const mapTeamInfo = (row) => ({
  id: row?.id,
  name: row?.name ?? "",
  logoUrl: row?.logo_url ?? "",
  founded: row?.founded ?? "",
  stadium: row?.stadium ?? "",
  city: row?.city ?? "",
  description: row?.description ?? "",
  president: row?.president ?? "",
  coach: row?.coach ?? "",
})

const mapMatch = (match) => ({
  id: match.id,
  date: match.date,
  time: match.time ? match.time.toString().slice(0, 5) : "",
  opponent: match.opponent,
  location: match.location,
  competition: match.competition,
  goalsFor: match.goals_for,
  goalsAgainst: match.goals_against,
  result: match.result,
  played: match.played,
})

const mapPlayerWithStats = (player) => {
  const stats = Array.isArray(player.player_stats) ? player.player_stats[0] : player.player_stats
  return {
    id: player.id,
    number: player.number,
    name: player.name,
    position: player.position,
    age: player.age,
    gamesPlayed: stats?.games_played ?? 0,
    goals: stats?.goals ?? 0,
    assists: stats?.assists ?? 0,
    yellowCards: stats?.yellow_cards ?? 0,
    redCards: stats?.red_cards ?? 0,
  }
}

// Funcion de almacenamiento para la gestión de logotipo
const uploadLogo = async (file) => {
  const supabase = getSupabaseClient()
  
  // Valida tipo archivo
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen')
  }
  
  // Valida tamañno archivo (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('La imagen no puede superar los 5MB')
  }
  
  // Genera un nombre unico
  const fileExt = file.name.split('.').pop()
  const fileName = `logo_${Date.now()}.${fileExt}`
  const filePath = `logos/${fileName}`
  
  // Subir archivo a Supabase Storage
  const { data, error } = await supabase.storage
    .from('team-assets') // create this bucket in Supabase
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) {
    console.error('Error uploading logo:', error)
    throw new Error('Error al subir la imagen')
  }
  
  // Obtener URL pública public URL
  const { data: urlData } = supabase.storage
    .from('team-assets')
    .getPublicUrl(filePath)
  
  return {
    url: urlData.publicUrl,
    path: filePath
  }
}

const deleteLogo = async (logoPath) => {
  if (!logoPath || !logoPath.includes('/logos/')) return
  
  const supabase = getSupabaseClient()
  const fileName = logoPath.split('/logos/')[1]
  
  if (fileName) {
    const { error } = await supabase.storage
      .from('team-assets')
      .remove([`logos/${fileName}`])
    
    if (error) {
      console.error('Error deleting logo:', error)
    }
  }
}

export const db = {
  getPlayers: async () => {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase
      .from("players")
      .select(
        `
        id,
        number,
        name,
        position,
        age,
        player_stats (
          games_played,
          goals,
          assists,
          yellow_cards,
          red_cards
        )
      `,
      )
      .order("number", { ascending: true })

    if (error) {
      console.error("Error fetching players", error)
      throw error
    }

    return (data ?? []).map(mapPlayerWithStats)
  },

  getMatches: async () => {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase.from("matches").select("*").order("date", { ascending: false })

    if (error) {
      console.error("Error fetching matches", error)
      throw error
    }

    return (data ?? []).map(mapMatch)
  },

  getLastMatches: async (limit = 8) => {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("played", true)
      .order("date", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching last matches", error)
      throw error
    }

    return (data ?? []).map(mapMatch)
  },

  getNextMatch: async () => {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("played", false)
      .order("date", { ascending: true })
      .order("time", { ascending: true })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("Error fetching next match", error)
      throw error
    }

    return data ? mapMatch(data) : null
  },

  getTeamStats: async () => {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase
      .from("matches")
      .select("result, goals_for, goals_against")
      .eq("played", true)

    if (error) {
      console.error("Error fetching team stats", error)
      throw error
    }

    const matches = data ?? []
    const wins = matches.filter((m) => m.result === "Victoria").length
    const draws = matches.filter((m) => m.result === "Empate").length
    const losses = matches.filter((m) => m.result === "Derrota").length
    const goalsFor = matches.reduce((acc, match) => acc + (match.goals_for ?? 0), 0)
    const goalsAgainst = matches.reduce((acc, match) => acc + (match.goals_against ?? 0), 0)
    const totalGames = matches.length

    return {
      totalGames,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      winPercentage: totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0,
    }
  },

  getCallUp: async () => {
    const supabase = await getSupabaseClient()

    const { data: nextMatch, error: nextMatchError } = await supabase
      .from("matches")
      .select("id")
      .eq("played", false)
      .order("date", { ascending: true })
      .order("time", { ascending: true })
      .limit(1)
      .maybeSingle()

    if (nextMatchError) {
      console.error("Error fetching next match for call-up", nextMatchError)
      throw nextMatchError
    }

    if (!nextMatch) {
      return []
    }

    const { data, error } = await supabase
      .from("callups")
      .select(
        `
        status,
        player:players (
          id,
          number,
          name,
          position,
          player_stats (
            games_played,
            goals,
            assists,
            yellow_cards,
            red_cards
          )
        )
      `,
      )
      .eq("match_id", nextMatch.id)
      .order("player->number", { ascending: true })

    if (error) {
      console.error("Error fetching call-ups", error)
      throw error
    }

    return (data ?? []).map((entry) => ({
      ...mapPlayerWithStats(entry.player),
      status: entry.status,
    }))
  },

  getTeamInfo: async () => {
    const supabase = await getSupabaseClient()
    const { data, error } = await supabase
      .from("team_info")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("Error fetching team info", error)
      throw error
    }

    return mapTeamInfo(data)
  },

  updateTeamInfo: async (newInfo) => {
    const supabase = await getSupabaseClient()
    const payload = {
      name: newInfo.name,
      founded: newInfo.founded,
      stadium: newInfo.stadium,
      city: newInfo.city,
      description: newInfo.description,
      president: newInfo.president,
      coach: newInfo.coach,
      logo_url: newInfo.logoUrl ?? null,
    }

    let targetId = newInfo.id
    if (!targetId) {
      const { data: currentInfo } = await supabase.from("team_info").select("id").limit(1).maybeSingle()
      targetId = currentInfo?.id
    }

    const { data, error } = await supabase
      .from("team_info")
      .update(payload)
      .eq("id", targetId)
      .select("*")
      .single()

    if (error) {
      console.error("Error updating team info", error)
      throw error
    }

    return mapTeamInfo(data)
  },
}

export { uploadLogo, deleteLogo }