import { useState } from "react"

interface Props {
  missionTitle: string
  onConfirm: (rating: number, comment: string) => void
  onCancel: () => void
}

export function CompleteModal({ missionTitle, onConfirm, onCancel }: Props) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 24,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16,
        padding: 28, width: "100%", maxWidth: 420,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}>
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 18, fontWeight: 700,
          color: "#085041", marginBottom: 8,
        }}>
          Slutför uppdrag ✅
        </h2>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
          {missionTitle}
        </p>

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#555", marginBottom: 8 }}>
            Betygsätt hjälparen
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                style={{
                  fontSize: 32, background: "none",
                  border: "none", cursor: "pointer",
                  opacity: star <= (hoveredRating || rating) ? 1 : 0.3,
                  transition: "opacity 0.1s",
                }}
              >
                ⭐
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p style={{ fontSize: 12, color: "#1D9E75", marginTop: 4 }}>
              {["", "Dåligt", "Okej", "Bra", "Mycket bra", "Utmärkt!"][rating]}
            </p>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#555", marginBottom: 8 }}>
            Kommentar (valfritt)
          </p>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Berätta om upplevelsen..."
            style={{
              width: "100%", height: 80,
              padding: "8px 12px", borderRadius: 8,
              border: "1px solid #e0e0dc",
              fontFamily: "inherit", fontSize: 14,
              resize: "vertical", outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, fontFamily: "inherit", fontSize: 14,
              padding: "10px", borderRadius: 10,
              border: "1px solid #e0e0dc",
              background: "transparent", color: "#666",
              cursor: "pointer",
            }}
          >
            Avbryt
          </button>
          <button
            onClick={() => rating > 0 && onConfirm(rating, comment)}
            disabled={rating === 0}
            style={{
              flex: 1, fontFamily: "inherit",
              fontSize: 14, fontWeight: 600,
              padding: "10px", borderRadius: 10,
              border: "none",
              background: rating > 0 ? "#1D9E75" : "#ccc",
              color: "#fff",
              cursor: rating > 0 ? "pointer" : "default",
            }}
          >
            Slutför uppdrag
          </button>
        </div>
      </div>
    </div>
  )
}