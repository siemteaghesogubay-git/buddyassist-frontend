import { useState } from "react"
import type { Mission } from "../types"
import { MissionCard } from "../components/MissionCard"

const FILTERS = [
  { id: "alla",         label: "Alla",           icon: "📋" },
  { id: "handla",       label: "Mat & handling",  icon: "🛒" },
  { id: "transport",    label: "Transport",        icon: "📦" },
  { id: "utbildning",   label: "Utbildning",       icon: "📚" },
  { id: "sällskap",     label: "Sällskap",         icon: "🤝" },
  { id: "djurpassning", label: "Djur & husdjur",   icon: "🐾" },
]

interface Props {
  missions: Mission[]
  takenIds: Set<number>
  onTake: (id: number) => void
  currentUserId?: number
  onComplete?: (id: number) => void
}

export function MissionsPage({ missions, takenIds, onTake, currentUserId, onComplete }: Props) {
  const [filter, setFilter] = useState("alla")
  const [search, setSearch] = useState("")

  const filtered = missions
    .filter(m => filter === "alla" || m.category === filter)
    .filter(m => !search || m.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700 }}>
          Uppdrag
        </h1>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          {filtered.length} hittades
        </span>
      </div>

      {/* Sök */}
      <div style={{ position: "relative", marginBottom: 14 }}>
        <span style={{
          position: "absolute", left: 12, top: "50%",
          transform: "translateY(-50%)", fontSize: 15, pointerEvents: "none",
        }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Sök uppdrag..."
          style={{ paddingLeft: 38, fontSize: 14 }}
        />
      </div>

      {/* Filter – horisontell scroll på mobil */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 18,
        overflowX: "auto", paddingBottom: 4,
        scrollbarWidth: "none",
      }}>
        <style>{`.filters::-webkit-scrollbar { display: none; }`}</style>
        {FILTERS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            style={{
              fontFamily: "inherit", fontSize: 12,
              padding: "7px 12px", borderRadius: 10,
              border: "1px solid",
              borderColor: filter === id ? "var(--accent-blue)" : "var(--border)",
              background: filter === id ? "rgba(79,110,247,0.15)" : "var(--bg-card)",
              color: filter === id ? "var(--accent-blue)" : "var(--text-secondary)",
              cursor: "pointer", whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 5,
              flexShrink: 0,
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(m => (
          <MissionCard
            key={m.id} mission={m}
            taken={takenIds.has(m.id)}
            onTake={onTake}
            currentUserId={currentUserId}
            onComplete={onComplete}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 13 }}>Inga uppdrag hittades.</p>
          </div>
        )}
      </div>
    </div>
  )
}