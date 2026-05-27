import { useState, useEffect } from "react"
import { api } from "../api/client"

interface LeaderboardUser {
  id: number
  name: string
  city: string
  totalPoints: number
  completedMissions: number
  currentLevel: string
  isPaused: boolean
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase()
}

const AVATAR_COLORS = ["#4F6EF7","#8B5CF6","#F59E0B","#22C55E","#EF4444","#06B6D4"]

function getBadge(missions: number): string {
  if (missions >= 100) return "🏆"
  if (missions >= 50)  return "⭐"
  if (missions >= 30)  return "💎"
  if (missions >= 15)  return "🥇"
  if (missions >= 10)  return "🥈"
  if (missions >= 5)   return "🥉"
  return ""
}

export function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getUsers()
      .then(data => setUsers((data ?? []).filter((u: LeaderboardUser) => !u.isPaused)))
      .finally(() => setLoading(false))
  }, [])

  const top3 = users.slice(0, 3)

  return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 28 }}>
        🏆 Topp hjälpare
      </h1>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>Laddar...</div>
      ) : (
        <>
          {/* Podium */}
          {top3.length === 3 && (
            <div style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 16, padding: "24px 20px", marginBottom: 20,
              display: "flex", justifyContent: "center", alignItems: "flex-end",
              gap: 16,
            }}>
              {[top3[1], top3[0], top3[2]].map((user, pos) => {
                const heights = [100, 130, 85]
                const medals = ["🥈", "🥇", "🥉"]
                const rank = [2, 1, 3]
                return (
                  <div key={user.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div style={{ fontSize: 20 }}>{medals[pos]}</div>
                    <div style={{
                      width: 52, height: 52, borderRadius: "50%",
                      background: `linear-gradient(135deg, ${AVATAR_COLORS[rank[pos] % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(rank[pos] + 2) % AVATAR_COLORS.length]})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 700, color: "#fff",
                      border: pos === 1 ? "3px solid #F59E0B" : "none",
                      boxShadow: pos === 1 ? "0 0 20px rgba(245,158,11,0.4)" : "none",
                    }}>
                      {getInitials(user.name)}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name.split(" ")[0]}</div>
                    <div style={{ fontSize: 12, color: "#F59E0B", fontWeight: 600 }}>
                      ⭐ {user.totalPoints}
                    </div>
                    <div style={{
                      width: 72, height: heights[pos],
                      background: pos === 1 ? "rgba(245,158,11,0.15)" : "var(--bg-secondary)",
                      border: `1px solid ${pos === 1 ? "rgba(245,158,11,0.3)" : "var(--border)"}`,
                      borderRadius: "8px 8px 0 0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 20, fontWeight: 700,
                      color: pos === 1 ? "#F59E0B" : "var(--text-secondary)",
                    }}>
                      {rank[pos]}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Full list */}
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 16, overflow: "hidden",
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: "40px 1fr auto auto",
              padding: "12px 20px", borderBottom: "1px solid var(--border)",
              fontSize: 12, color: "var(--text-muted)", fontWeight: 500,
            }}>
              <span>#</span>
              <span>Hjälpare</span>
              <span style={{ textAlign: "right", marginRight: 40 }}>Uppdrag</span>
              <span style={{ textAlign: "right" }}>Poäng</span>
            </div>

            {users.map((user, i) => (
              <div key={user.id} style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr auto auto",
                padding: "14px 20px",
                borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center",
                transition: "background 0.1s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 14, fontWeight: 700,
                  color: i === 0 ? "#F59E0B" : i === 1 ? "#9CA3AF" : i === 2 ? "#F59E0B" : "var(--text-muted)",
                }}>
                  {i + 1}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${AVATAR_COLORS[i % AVATAR_COLORS.length]}, ${AVATAR_COLORS[(i + 2) % AVATAR_COLORS.length]})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: "#fff",
                  }}>
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{user.city}</div>
                  </div>
                </div>

                <span style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "right", marginRight: 40 }}>
                  {user.completedMissions}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>
                    ⭐ {user.totalPoints}
                  </span>
                  <span style={{ fontSize: 16 }}>{getBadge(user.completedMissions)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}