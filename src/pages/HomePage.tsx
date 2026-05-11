import type { Mission } from "../types"
import { MissionCard } from "../components/MissionCard"

interface Props {
  missions: Mission[]
  takenIds: Set<number>
  onTake: (id: number) => void
  onComplete?: (id: number) => void
  currentUserId?: number
  totalPoints: number
  completedMissions: number
  currentLevel: string
  loading: boolean
}

export function HomePage({ missions, takenIds, onTake, onComplete, currentUserId, totalPoints, completedMissions, currentLevel, loading }: Props) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: "1.25rem" }}>
        {[
          { label: "Dina poäng",    value: totalPoints,       sub: "pts" },
          { label: "Uppdrag klara", value: completedMissions, sub: "st" },
          { label: "Din nivå",      value: currentLevel,      sub: "" },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{ background: "#f1f0ec", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>
              {value}
              {sub && <span style={{ fontSize: 13, fontWeight: 400, color: "#1D9E75", marginLeft: 4 }}>{sub}</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
        Senaste uppdrag nära dig
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>Hämtar uppdrag...</div>
      ) : missions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#aaa" }}>Inga uppdrag än – skapa det första! 🎉</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {missions.slice(0, 3).map(m => (
            <MissionCard key={m.id} mission={m} taken={takenIds.has(m.id)} onTake={onTake} onComplete={onComplete} currentUserId={currentUserId} />
          ))}
        </div>
      )}
    </div>
  )
}
