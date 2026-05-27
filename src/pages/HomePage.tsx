import type { Mission } from "../types"
import { MissionCard } from "../components/MissionCard"
import { useLocation } from "../hooks/useLocation"

interface Props {
  missions: Mission[]
  takenIds: Set<number>
  onTake: (id: number) => void
  onComplete?: (id: number) => void
  currentUserId?: number
  totalPoints: number
  completedMissions: number
  currentLevel: string
  userName: string
  loading: boolean
}

export function HomePage({
  missions, takenIds, onTake, onComplete, currentUserId,
  totalPoints, completedMissions, currentLevel, userName, loading
}: Props) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "God morgon" : hour < 18 ? "Hej" : "God kväll"
  const { location, loading: locLoading } = useLocation()

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "clamp(20px, 5vw, 28px)",
          fontWeight: 700, marginBottom: 4,
        }}>
          {greeting}, {userName.split(" ")[0]}! 👋
        </h1>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
            Tillsammans gör vi skillnad i vårt område.
          </p>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "6px 12px", fontSize: 12,
            color: "var(--text-secondary)",
          }}>
            📍 {locLoading ? "Hämtar..." : location?.city ?? "Okänd plats"}
          </div>
        </div>
      </div>

      {/* Stats – 2x2 på mobil, 4x1 på desktop */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12, marginBottom: 24,
      }}>
        <style>{`
          @media (min-width: 640px) {
            .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
          }
        `}</style>
        {[
          { icon: "⭐", label: "Poäng",          value: totalPoints.toLocaleString(), sub: "totalt",    color: "#F59E0B" },
          { icon: "✅", label: "Uppdrag gjorda", value: completedMissions,             sub: "klara",     color: "#22C55E" },
          { icon: "🏆", label: "Nivå",           value: currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1), sub: "nuvarande", color: "#8B5CF6" },
          { icon: "★",  label: "Snittbetyg",     value: "4.9",                         sub: "av 5.0",    color: "#F59E0B" },
        ].map(({ icon, label, value, sub, color }) => (
          <div key={label} style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 14, padding: "16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${color}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>
                {icon}
              </div>
              <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{label}</span>
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 2 }}>
              {value}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Uppdrag */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700 }}>
            Uppdrag nära dig
          </h2>
          <button style={{ background: "none", border: "none", color: "var(--accent-blue)", fontSize: 12, cursor: "pointer" }}>
            Visa alla →
          </button>
        </div>

        {loading ? (
          <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem", fontSize: 13 }}>
            Hämtar uppdrag...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {missions.filter(m => m.status === "open").slice(0, 4).map(m => (
              <MissionCard
                key={m.id} mission={m}
                taken={takenIds.has(m.id)}
                onTake={onTake} onComplete={onComplete}
                currentUserId={currentUserId}
              />
            ))}
            {missions.filter(m => m.status === "open").length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                <p style={{ fontSize: 13 }}>Inga uppdrag just nu!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Karta – döljs på mobil */}
      <style>{`
        @media (max-width: 640px) { .map-section { display: none !important; } }
      `}</style>
      <div className="map-section" style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 14, overflow: "hidden", position: "relative",
      }}>
        {location ? (
          <>
            <iframe
              title="Karta"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.02},${location.lat - 0.015},${location.lng + 0.02},${location.lat + 0.015}&layer=mapnik&marker=${location.lat},${location.lng}`}
              style={{ width: "100%", height: 300, border: "none" }}
            />
            <div style={{
              position: "absolute", bottom: 10, right: 10,
              background: "rgba(15,17,23,0.85)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "5px 10px",
              fontSize: 11, color: "var(--text-primary)",
            }}>
              📍 {location.city}
            </div>
          </>
        ) : (
          <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
            🗺️ Tillåt platsåtkomst för att se kartan
          </div>
        )}
      </div>
    </div>
  )
}