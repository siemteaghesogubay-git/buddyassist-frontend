import type { Mission } from "../types"

const CATEGORY_CONFIG = {
  handla:       { icon: "🛒", color: "#22C55E",  label: "Mat & handling" },
  transport:    { icon: "📦", color: "#F59E0B",  label: "Transport" },
  utbildning:   { icon: "📚", color: "#8B5CF6",  label: "Utbildning" },
  sällskap:     { icon: "🤝", color: "#4F6EF7",  label: "Sällskap" },
  djurpassning: { icon: "🐾", color: "#F59E0B",  label: "Djur & husdjur" },
  annat:        { icon: "🔧", color: "#6B7280",  label: "Hemm & fix" },
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const time = d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })
  if (d.toDateString() === today.toDateString()) return `Idag, ${time}`
  if (d.toDateString() === tomorrow.toDateString()) return `Imorgon, ${time}`
  return d.toLocaleDateString("sv-SE", { day: "numeric", month: "short" }) + `, ${time}`
}

interface Props {
  mission: Mission
  taken?: boolean
  onTake?: (id: number) => void
  currentUserId?: number
  onComplete?: (id: number) => void
}

export function MissionCard({ mission, taken, onTake, currentUserId, onComplete }: Props) {
  const cfg = CATEGORY_CONFIG[mission.category] ?? CATEGORY_CONFIG.annat
  const isOwner = currentUserId !== undefined && mission.createdByUserId === currentUserId
  const canComplete = isOwner && mission.status === "taken"
  const isCompleted = mission.status === "completed"

  return (
    <div style={{
      background: "var(--bg-card)",
      border: `1px solid ${isCompleted ? "#22C55E40" : "var(--border)"}`,
      borderRadius: 14, padding: "16px",
      display: "flex", alignItems: "center", gap: 14,
      transition: "border-color 0.15s, background 0.15s",
      cursor: "default",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent-blue)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = isCompleted ? "#22C55E40" : "var(--border)"}
    >
      {/* Category icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${cfg.color}20`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
      }}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            {mission.title}
          </p>
          <span style={{ fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
            {formatDate(mission.scheduledAt)}
          </span>
        </div>

        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {mission.address}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 11, fontWeight: 500,
            padding: "3px 10px", borderRadius: 20,
            background: `${cfg.color}20`, color: cfg.color,
          }}>
            {cfg.label}
          </span>

          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
            📍 {mission.distanceKm} km
          </span>

          <span style={{
            fontSize: 12, fontWeight: 700,
            color: "#F59E0B", display: "flex", alignItems: "center", gap: 4,
          }}>
            ⭐ {mission.points} poäng
          </span>

          {isCompleted && mission.helperRating && (
            <span style={{ fontSize: 11, color: "#22C55E" }}>
              {"★".repeat(mission.helperRating)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {onTake && mission.status === "open" && (
          <button
            onClick={() => onTake(mission.id)}
            disabled={taken}
            style={{
              fontFamily: "inherit", fontSize: 12, fontWeight: 600,
              padding: "8px 16px", borderRadius: 8, border: "none",
              background: taken ? "var(--bg-hover)" : "var(--accent-blue)",
              color: taken ? "var(--text-secondary)" : "#fff",
              cursor: taken ? "default" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {taken ? "✓ Taget" : "Ta uppdrag"}
          </button>
        )}

        {canComplete && onComplete && (
          <button
            onClick={() => onComplete(mission.id)}
            style={{
              fontFamily: "inherit", fontSize: 12, fontWeight: 600,
              padding: "8px 16px", borderRadius: 8, border: "none",
              background: "#22C55E", color: "#fff", cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            ✅ Slutför
          </button>
        )}

        {isCompleted && (
          <span style={{
            fontSize: 11, padding: "4px 10px", borderRadius: 8,
            background: "#22C55E20", color: "#22C55E",
            fontWeight: 500, textAlign: "center",
          }}>
            Slutfört
          </span>
        )}
      </div>
    </div>
  )
}