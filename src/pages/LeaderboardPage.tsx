import { useState, useEffect } from "react"
import { api } from "../api/client"

interface LeaderboardUser {
  id: number
  name: string
  city: string
  totalPoints: number
  completedMissions: number
  currentLevel: string
  role: string
  isPaused: boolean
}

const RANK_COLORS = ["#EF9F27", "#B4B2A9", "#D85A30"]
const MEDALS = ["🥈", "🥇", "🥉"]
const PODIUM_HEIGHTS = [100, 130, 85]
const PODIUM_ORDER = [1, 0, 2]

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase()
}

function getBadge(missions: number): string {
  if (missions >= 100) return "🏆"
  if (missions >= 50)  return "⭐"
  if (missions >= 30)  return "💎"
  if (missions >= 15)  return "🥇"
  if (missions >= 10)  return "🥈"
  if (missions >= 5)   return "🥉"
  return ""
}

const AVATAR_COLORS = ["#1D9E75","#D85A30","#EF9F27","#178BDD","#D4537E","#639922","#7F77DD"]

export function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.getUsers()
        // Filtrera bort pausade användare
        setUsers(data.filter((u: LeaderboardUser) => !u.isPaused))
      } catch {
        console.error("Kunde inte hämta leaderboard")
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
        Laddar leaderboard...
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#aaa" }}>
        Inga användare än.
      </div>
    )
  }

  const top3 = users.slice(0, 3)
  

  return (
    <div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
        Topp hjälpare – Stockholm
      </div>

      {/* Podium – visa bara om 3+ användare */}
      {top3.length === 3 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 12, marginBottom: "1.5rem", padding: "1rem 0" }}>
          {PODIUM_ORDER.map((i, pos) => {
            const user = top3[i]
            if (!user) return null
            return (
              <div key={user.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 20 }}>{MEDALS[pos]}</div>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 600, color: "#fff",
                  border: pos === 1 ? "2px solid #EF9F27" : "none",
                }}>
                  {getInitials(user.name)}
                </div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>
                  {user.name.split(" ")[0]}
                </div>
                <div style={{
                  width: 64, height: PODIUM_HEIGHTS[pos],
                  background: pos === 1 ? "#E1F5EE" : "#f1f0ec",
                  border: pos === 1 ? "1px solid #9FE1CB" : "1px solid #e0e0dc",
                  borderRadius: "6px 6px 0 0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700,
                  color: pos === 1 ? "#1D9E75" : "#888",
                }}>
                  {i + 1}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full lista */}
      <div style={{ border: "1px solid #e0e0dc", borderRadius: 12, overflow: "hidden" }}>
        {users.map((user, i) => (
          <div key={user.id} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 16px",
            borderBottom: i < users.length - 1 ? "1px solid #e0e0dc" : "none",
            background: "#fff",
            transition: "background 0.1s",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f9f9f7")}
            onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
          >
            {/* Rank */}
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14, fontWeight: 700, width: 24,
              color: i < 3 ? RANK_COLORS[i] : "#aaa",
            }}>
              {i + 1}
            </div>

            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: AVATAR_COLORS[i % AVATAR_COLORS.length],
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 600, color: "#fff", flexShrink: 0,
            }}>
              {getInitials(user.name)}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: "#aaa" }}>
                {user.completedMissions} uppdrag · {user.city}
              </div>
            </div>

            <div style={{ fontSize: 16 }}>{getBadge(user.completedMissions)}</div>

            <div style={{ fontSize: 13, fontWeight: 600, color: "#1D9E75" }}>
              {user.totalPoints} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
