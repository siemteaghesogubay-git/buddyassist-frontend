import { useState } from "react"
import type { Mission } from "../types"
import { MissionCard } from "../components/MissionCard"

const FILTERS: { id: string; label: string }[] = [
  { id: "alla",         label: "Alla" },
  { id: "handla",       label: "Handla" },
  { id: "transport",    label: "Transport" },
  { id: "utbildning",   label: "Utbildning" },
  { id: "sällskap",     label: "Sällskap" },
  { id: "djurpassning", label: "Djurpassning" },
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

  const filtered = filter === "alla"
    ? missions
    : missions.filter(m => m.category === filter)

  return (
    <div>
      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 15, fontWeight: 700, marginBottom: 12,
      }}>
        Alla uppdrag
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            style={{
              fontFamily: "inherit", fontSize: 12,
              padding: "5px 12px", borderRadius: 20,
              border: "1px solid",
              borderColor: filter === id ? "#9FE1CB" : "#e0e0dc",
              background: filter === id ? "#E1F5EE" : "transparent",
              color: filter === id ? "#085041" : "#888",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
        {filtered.length} uppdrag hittades
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(m => (
          <MissionCard
            key={m.id}
            mission={m}
            taken={takenIds.has(m.id)}
            onTake={onTake}
            currentUserId={currentUserId}
            onComplete={onComplete}
          />
        ))}
        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#aaa", padding: "2rem 0" }}>
            Inga uppdrag i den här kategorin just nu.
          </p>
        )}
      </div>
    </div>
  )
}