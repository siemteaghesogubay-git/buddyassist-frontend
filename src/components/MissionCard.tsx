import React from "react"
import type { Mission } from "../types"

const CATEGORY_CONFIG = {
  handla:       { icon: "🛒", bg: "#E1F5EE", color: "#085041", label: "Handla" },
  transport:    { icon: "🧳", bg: "#FAECE7", color: "#712B13", label: "Transport" },
  utbildning:   { icon: "📚", bg: "#FAEEDA", color: "#412402", label: "Utbildning" },
  sällskap:     { icon: "🚶", bg: "#E1F5EE", color: "#085041", label: "Sällskap" },
  djurpassning: { icon: "🐶", bg: "#E1F5EE", color: "#085041", label: "Djurpassning" },
  annat:        { icon: "🔧", bg: "#FAECE7", color: "#712B13", label: "Annat" },
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const time = d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })
  if (d.toDateString() === today.toDateString()) return `Idag ${time}`
  if (d.toDateString() === tomorrow.toDateString()) return `Imorgon ${time}`
  return d.toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" }) + ` ${time}`
}

interface Props {
  mission: Mission
  taken?: boolean
  onTake?: (id: number) => void
  currentUserId?: number
  onComplete?: (id: number) => void
}

export function MissionCard({ mission, taken, onTake, currentUserId, onComplete }: Props) {
  const cfg = CATEGORY_CONFIG[mission.category]
  const isOwner = currentUserId !== undefined && mission.createdByUserId === currentUserId
  const canComplete = isOwner && mission.status === "taken"
  const isCompleted = mission.status === "completed"

  return (
    <div style={{
      background: isCompleted ? "#f9fff9" : "#fff",
      border: `1px solid ${isCompleted ? "#9FE1CB" : "#e0e0dc"}`,
      borderRadius: 12,
      padding: "14px 16px",
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: cfg.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, flexShrink: 0,
      }}>
        {cfg.icon}
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{mission.title}</p>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>{mission.description}</p>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <Tag bg={cfg.bg} color={cfg.color}>{cfg.label}</Tag>
          <Tag>{mission.distanceKm} km</Tag>
          <Tag>{formatDate(mission.scheduledAt)}</Tag>

          <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#1D9E75" }}>
            +{mission.points} pts
          </span>

          {onTake && mission.status === "open" && (
            <button
              onClick={() => onTake(mission.id)}
              disabled={taken}
              style={{
                fontFamily: "inherit", fontSize: 12, fontWeight: 500,
                padding: "6px 14px", borderRadius: 20, border: "none",
                background: taken ? "#9FE1CB" : "#1D9E75",
                color: "#fff", cursor: taken ? "default" : "pointer",
              }}
            >
              {taken ? "✓ Taget" : "Ta uppdrag"}
            </button>
          )}

          {canComplete && onComplete && (
            <button
              onClick={() => onComplete(mission.id)}
              style={{
                fontFamily: "inherit", fontSize: 12, fontWeight: 500,
                padding: "6px 14px", borderRadius: 20, border: "none",
                background: "#085041", color: "#fff", cursor: "pointer",
              }}
            >
              ✅ Slutför
            </button>
          )}

          {isCompleted && (
            <span style={{
              fontSize: 11, padding: "3px 9px", borderRadius: 20,
              background: "#E1F5EE", color: "#085041", fontWeight: 500,
            }}>
              ✅ Slutfört{mission.helperRating ? ` · ${"⭐".repeat(mission.helperRating)}` : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function Tag({ children, bg = "#f1f0ec", color = "#888" }: {
  children: React.ReactNode
  bg?: string
  color?: string
}) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 500,
      padding: "3px 9px", borderRadius: 20,
      background: bg, color: color,
    }}>
      {children}
    </span>
  )
}
