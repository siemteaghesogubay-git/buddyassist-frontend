interface Props {
  name: string
  imageBase64?: string | null
  size?: number
  onClick?: () => void
}

export function Avatar({ name, imageBase64, size = 40, onClick }: Props) {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: "50%",
        overflow: "hidden", flexShrink: 0,
        cursor: onClick ? "pointer" : "default",
        border: "2px solid var(--border)",
        position: "relative",
      }}
    >
      {imageBase64 ? (
        <img
          src={imageBase64}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div style={{
          width: "100%", height: "100%",
          background: "linear-gradient(135deg, #4F6EF7, #8B5CF6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: size * 0.35, fontWeight: 700, color: "#fff",
        }}>
          {initials}
        </div>
      )}
    </div>
  )
}
