import { createSupabaseBrowserClient } from "./supabase/client"

/**
 * IMPORTANTE: Configurar políticas RLS en Supabase
 * 
 * Para que la página pública funcione correctamente, necesitas ejecutar estas políticas SQL
 * en tu dashboard de Supabase -> SQL Editor:
 * 
 * -- Habilitar acceso público de lectura para la página pública
 * ALTER TABLE team_info ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE players ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
 * 
 * -- Políticas de lectura pública
 * CREATE POLICY "Public can read team_info" ON team_info FOR SELECT USING (true);
 * CREATE POLICY "Public can read matches" ON matches FOR SELECT USING (true);
 * CREATE POLICY "Public can read players" ON players FOR SELECT USING (true);
 * CREATE POLICY "Public can read player_stats" ON player_stats FOR SELECT USING (true);
 * 
 * -- Políticas de escritura (solo autenticadas)
 * CREATE POLICY "Users can manage team_info" ON team_info FOR ALL USING (auth.role() = 'authenticated');
 * CREATE POLICY "Users can manage matches" ON matches FOR ALL USING (auth.role() = 'authenticated');
 * CREATE POLICY "Users can manage players" ON players FOR ALL USING (auth.role() = 'authenticated');
 * CREATE POLICY "Users can manage player_stats" ON player_stats FOR ALL USING (auth.role() = 'authenticated');
 * CREATE POLICY "Users can manage callups" ON callups FOR ALL USING (auth.role() = 'authenticated');
 */

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

// Se mapea a los jugadores que tienen estadisticas
const mapPlayerWithStats = (player) => {
  // Filtrar estadísticas de la temporada actual
  const currentSeasonStats = Array.isArray(player.player_stats)
    ? player.player_stats.find(stat => stat.season === CURRENT_SEASON)
    : (player.player_stats?.season === CURRENT_SEASON ? player.player_stats : null)

  return {
    id: player.id,
    number: player.number,
    name: player.name,
    position: player.position,
    age: player.age,
    gamesPlayed: currentSeasonStats?.games_played ?? 0,
    goals: currentSeasonStats?.goals ?? 0,
    assists: currentSeasonStats?.assists ?? 0,
    yellowCards: currentSeasonStats?.yellow_cards ?? 0,
    redCards: currentSeasonStats?.red_cards ?? 0,
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

// ⚽ CONFIGURACIÓN DE TEMPORADA
// Cambia este valor cuando inicie una nueva temporada
const CURRENT_SEASON = '2025'

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
          id,
          season,
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

  // CRUD matches
  createMatch: async (matchData) => {
    const supabase = await getSupabaseClient()
    
    const { data, error } = await supabase
      .from("matches")
      .insert([{
        date: matchData.date,
        time: matchData.time,
        opponent: matchData.opponent,
        location: matchData.location,
        competition: matchData.competition || null,
        goals_for: matchData.goalsFor,
        goals_against: matchData.goalsAgainst,
        result: matchData.result,
        played: matchData.played,
      }])
      .select()
      .single()

    if (error) {
      console.error("Error creating match", error)
      throw new Error(error.message || 'Error al crear el partido')
    }

    return mapMatch(data)
  },

  updateMatch: async (id, matchData) => {
    const supabase = await getSupabaseClient()
    
    const { data, error } = await supabase
      .from("matches")
      .update({
        date: matchData.date,
        time: matchData.time,
        opponent: matchData.opponent,
        location: matchData.location,
        competition: matchData.competition || null,
        goals_for: matchData.goalsFor,
        goals_against: matchData.goalsAgainst,
        result: matchData.result,
        played: matchData.played,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating match", error)
      throw new Error(error.message || 'Error al actualizar el partido')
    }

    return mapMatch(data)
  },

  deleteMatch: async (id) => {
    const supabase = await getSupabaseClient()
    
    const { error } = await supabase
      .from("matches")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting match", error)
      throw new Error(error.message || 'Error al eliminar el partido')
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
      console.error("Error fetching next match for call-up:", nextMatchError)
      throw new Error(`Error al obtener el próximo partido: ${nextMatchError.message}`)
    }

    if (!nextMatch) {
      return []
    }

    const { data, error } = await supabase
      .from("callups")
      .select(`
        status,
        player_id,
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
      `)
      .eq("match_id", nextMatch.id)
      .order("player_id", { ascending: true }) // Ordenar por player_id en lugar de player->number

    if (error) {
      console.error("Error fetching call-ups:", error)
      throw new Error(`Error al obtener convocatorias: ${error.message}`)
    }

    return (data ?? []).map((entry) => ({
      ...mapPlayerWithStats(entry.player),
      status: entry.status,
    }))
  },

  // CRUD convocatoria
  updateCallUpStatus: async (playerId, matchId, status) => {
    const supabase = await getSupabaseClient()
    
    const { data, error } = await supabase
      .from("callups")
      .upsert({
        player_id: playerId,
        match_id: matchId,
        status: status,
      }, {
        onConflict: 'player_id,match_id'
      })
      .select()
      .single()

    if (error) {
      console.error("Error updating callup status:", error)
      throw new Error(`Error al actualizar estado de convocatoria: ${error.message}`)
    }

    return data
  },

  createInitialCallUps: async (matchId, playerIds) => {
    const supabase = await getSupabaseClient()
    
    const callups = playerIds.map(playerId => ({
      player_id: playerId,
      match_id: matchId,
      status: 'Convocado'
    }))

    const { data, error } = await supabase
      .from("callups")
      .upsert(callups, {
        onConflict: 'player_id,match_id'
      })
      .select()

    if (error) {
      console.error("Error creating initial callups:", error)
      throw new Error(`Error al crear convocatorias iniciales: ${error.message}`)
    }

    return data
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

  // CRUD players
  createPlayer: async (playerData) => {
    const supabase = await getSupabaseClient()
    
    const { data, error } = await supabase
      .from("players")
      .insert([{
        number: playerData.number,
        name: playerData.name,
        position: playerData.position,
        age: playerData.age,
      }])
      .select(`
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
      `)
      .single()

      if (error) {
        console.error("Error creating player:", error)
        
        // Handle specific Supabase errors
        if (error.code === '23505') { // Unique violation
          if (error.message.includes('number')) {
            throw new Error('Ya existe un jugador con este número. Por favor elige un número diferente.')
          }
        }
        
        // Generic error message
        throw new Error(error.message || 'Error al crear el jugador')
      }

    return mapPlayerWithStats(data)
  },

  updatePlayer: async (id, playerData) => {
    const supabase = await getSupabaseClient()
    
    const { data, error } = await supabase
      .from("players")
      .update({
        number: playerData.number,
        name: playerData.name,
        position: playerData.position,
        age: playerData.age,
      })
      .eq("id", id)
      .select(`
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
      `)
      .single()

      if (error) {
        console.error("Error updating player:", error)
        
        // Handle specific Supabase errors
        if (error.code === '23505') { // Unique violation
          if (error.message.includes('number')) {
            throw new Error('Ya existe un jugador con este número. Por favor elige un número diferente.')
          }
        }
        
        throw new Error(error.message || 'Error al actualizar el jugador')
      }

    return mapPlayerWithStats(data)
  },

  deletePlayer: async (id) => {
    const supabase = await getSupabaseClient()
    
    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting player:", error)
      throw new Error(error.message || 'Error al eliminar el jugador')
    }
  },

  // Actualiza/Inserta las estadisticas de los jugadores
  updatePlayerStats: async (playerId, statsData) => {
    const supabase = await getSupabaseClient()
    
    const { data, error } = await supabase
      .from("player_stats")
      // Insertar o actualizar estadísticas del jugador
      .upsert({
        player_id: playerId,
        season: CURRENT_SEASON, // Asegúrate de incluir la temporada, cambiar a la temporada actual
        games_played: statsData.gamesPlayed,
        goals: statsData.goals,
        assists: statsData.assists,
        yellow_cards: statsData.yellowCards,
        red_cards: statsData.redCards,
      }, {
        onConflict: 'player_id,season' // Si ya existe un registro con ese player_id y season, lo actualiza
      })
      .select()
      .single()

    if (error) {
      console.error("Error updating player stats:", error)
      throw new Error(error.message || 'Error al actualizar estadísticas del jugador')
    }

    return data
  },

}

export { uploadLogo, deleteLogo }