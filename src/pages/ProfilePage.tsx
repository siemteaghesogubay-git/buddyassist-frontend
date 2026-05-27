import { useState, useRef } from "react"
import { ALL_BADGES } from "../Data/mockData"
import { Avatar } from "../components/Avatar"
import { api } from "../api/client"

interface Props {
  name: string
  totalPoints: number
  completedMissions: number
  currentLevel: string
  onLogout: () => void
  profileImage?: string | null
  onImageUpdate?: (base64: string) => void
}

export function ProfilePage({
  name, totalPoints, completedMissions, currentLevel,
  onLogout, profileImage, onImageUpdate
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [localImage, setLocalImage] = useState<string | null>(profileImage ?? null)
  const [toast, setToast] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const earnedBadges = ALL_BADGES.filter(b => b.requiredMissions <= completedMissions)
  const nextBadge = ALL_BADGES.find(b => b.requiredMissions > completedMissions)
  const prevBadge = earnedBadges[earnedBadges.length - 1]
  const progress = nextBadge
    ? ((completedMissions - (prevBadge?.requiredMissions ?? 0)) /
       (nextBadge.requiredMissions - (prevBadge?.requiredMissions ?? 0))) * 100
    : 100

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setToast("Bilden är för stor! Max 2MB.")
      setTimeout(() => setToast(""), 3000)
      return
    }

    if (!file.type.startsWith("image/")) {
      setToast("Välj en bildfil (jpg, png, etc)")
      setTimeout(() => setToast(""), 3000)
      return
    }

    setUploading(true)

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string

      try {
        await api.updateProfileImage(base64)
        setLocalImage(base64)
        onImageUpdate?.(base64)
        setToast("Profilbild uppdaterad! ✅")
        setTimeout(() => setToast(""), 3000)
      } catch {
        setToast("Kunde inte ladda upp bilden")
        setTimeout(() => setToast(""), 3000)
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "12px 20px",
          fontSize: 13, color: "var(--text-primary)",
          zIndex: 200, boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 }}>
          Profil
        </h1>
        <button onClick={onLogout} style={{
          fontFamily: "inherit", fontSize: 13, padding: "8px 16px",
          borderRadius: 8, border: "1px solid var(--border)",
          background: "transparent", color: "var(--text-secondary)",
          cursor: "pointer",
        }}>
          Logga ut
        </button>
      </div>

      {/* Profile card */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 16, padding: 24, marginBottom: 20,
        display: "flex", alignItems: "center", gap: 20,
      }}>
        {/* Avatar med upload-knapp */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Avatar name={name} imageBase64={localImage} size={80} />

          {/* Upload overlay */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              position: "absolute", bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: "50%",
              background: "var(--accent-blue)", border: "2px solid var(--bg-card)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: uploading ? "default" : "pointer",
              fontSize: 14,
            }}
          >
            {uploading ? "⏳" : "📷"}
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 20, fontWeight: 700, marginBottom: 4,
          }}>
            {name}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{
              fontSize: 12, padding: "3px 10px", borderRadius: 20,
              background: "#22C55E20", color: "#22C55E", fontWeight: 500,
            }}>
              ✓ Verifierad hjälpare
            </span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Nivå: <strong style={{ color: "var(--text-primary)" }}>{currentLevel}</strong>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            Klicka på 📷 för att byta profilbild
          </div>
        </div>
      </div>

      {/* XP Progress */}
      {nextBadge && (
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 16, padding: 20, marginBottom: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
            <span style={{ color: "var(--text-secondary)" }}>
              {currentLevel} → {nextBadge.name}
            </span>
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {completedMissions} / {nextBadge.requiredMissions} uppdrag
            </span>
          </div>
          <div style={{ height: 8, background: "var(--bg-secondary)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${Math.min(Math.round(progress), 100)}%`,
              background: "linear-gradient(90deg, #4F6EF7, #8B5CF6)",
              borderRadius: 4, transition: "width 0.6s",
            }} />
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Poäng",   value: totalPoints,        icon: "⭐" },
          { label: "Uppdrag", value: completedMissions,  icon: "✅" },
          { label: "Betyg",   value: "4.9",              icon: "★"  },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 14, padding: 18, textAlign: "center",
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700 }}>
              {value}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 16, padding: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700 }}>
            Mina badges
          </h3>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            {earnedBadges.length} / {ALL_BADGES.length} upplåsta
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {ALL_BADGES.map(badge => {
            const earned = badge.requiredMissions <= completedMissions
            return (
              <div key={badge.id} style={{
                textAlign: "center", padding: "16px 8px",
                borderRadius: 12,
                background: earned ? "rgba(79,110,247,0.1)" : "var(--bg-secondary)",
                border: `1px solid ${earned ? "rgba(79,110,247,0.3)" : "var(--border)"}`,
                opacity: earned ? 1 : 0.4,
                transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 30, marginBottom: 6 }}>{badge.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: earned ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {badge.name}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                  {badge.requiredMissions} uppdrag
                </div>
                {earned && (
                  <div style={{ fontSize: 10, color: "#22C55E", marginTop: 4, fontWeight: 500 }}>
                    ✓ Upplåst
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
