import { ALL_BADGES } from "../Data/mockData"

interface Props {
  name: string
  totalPoints: number
  completedMissions: number
  currentLevel: string
}

export function ProfilePage({ name, totalPoints, completedMissions, currentLevel }: Props) {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase()
  const earnedBadges = ALL_BADGES.filter(b => b.requiredMissions <= completedMissions)
  const earnedIds = new Set(earnedBadges.map(b => b.id))
  const nextBadge = ALL_BADGES.find(b => b.requiredMissions > completedMissions)
  const prevBadge = ALL_BADGES.filter(b => b.requiredMissions <= completedMissions).pop()
  const progress = nextBadge
    ? ((completedMissions - (prevBadge?.requiredMissions ?? 0)) /
       (nextBadge.requiredMissions - (prevBadge?.requiredMissions ?? 0))) * 100
    : 100

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "1.5rem", padding: 18, background: "#f1f0ec", borderRadius: 14 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#1D9E75", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700 }}>{name}</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{currentLevel}</div>
          <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 20, background: "#E1F5EE", color: "#085041", display: "inline-block", marginTop: 6 }}>
            {completedMissions} uppdrag slutförda
          </span>
        </div>
      </div>

      {/* Progress */}
      {nextBadge && (
        <>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
            Framsteg mot {nextBadge.name}badge
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888", marginBottom: 6 }}>
              <span>{prevBadge?.name ?? "Start"} uppnådd</span>
              <span>{completedMissions} / {nextBadge.requiredMissions} uppdrag</span>
            </div>
            <div style={{ height: 8, background: "#f1f0ec", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.round(progress)}%`, background: "#1D9E75", borderRadius: 4, transition: "width 0.4s" }} />
            </div>
          </div>
        </>
      )}

      {/* Badges */}
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
        Dina badges
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: "1.5rem" }}>
        {ALL_BADGES.map(badge => {
          const earned = earnedIds.has(badge.id)
          return (
            <div key={badge.id} style={{ background: earned ? "#E1F5EE" : "#f1f0ec", border: earned ? "1px solid #9FE1CB" : "1px solid transparent", borderRadius: 12, padding: 14, textAlign: "center", opacity: earned ? 1 : 0.5 }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{badge.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: earned ? "#085041" : "#1a1a1a" }}>{badge.name}</div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{badge.requiredMissions} uppdrag</div>
            </div>
          )
        })}
      </div>

      {/* Impact */}
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
        Impact
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
        {[
          { label: "Totala poäng",     value: totalPoints,        sub: "poäng" },
          { label: "Uppdrag klara",    value: completedMissions,  sub: "st" },
          { label: "Nuvarande nivå",   value: currentLevel,       sub: "" },
          { label: "Nästa badge",      value: nextBadge?.name ?? "Max nivå!", sub: "" },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{ background: "#f1f0ec", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
            <div style={{ fontSize: 12, color: "#1D9E75", marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}