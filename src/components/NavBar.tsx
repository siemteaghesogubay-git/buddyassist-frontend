export type Page = "hem" | "uppdrag" | "skapa" | "profil" | "topp" | "admin" | "chatt" | "annonser"

const NAV_ITEMS: { id: Page; label: string; adminOnly?: boolean }[] = [
  { id: "hem",      label: "Hem" },
  { id: "uppdrag",  label: "Uppdrag" },
  { id: "skapa",    label: "Skapa" },
  { id: "chatt",    label: "💬 Chatt" },
  { id: "annonser", label: "📢 Annonser" },
  { id: "profil",   label: "Profil" },
  { id: "topp",     label: "Topp" },
  { id: "admin",    label: "⚙️ Admin", adminOnly: true },
]

interface Props {
  current: Page
  onChange: (page: Page) => void
  role: string
}

export function NavBar({ current, onChange, role }: Props) {
  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || role === "admin")

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: "1.25rem",
      borderBottom: "1px solid #e0e0dc",
      marginBottom: "1.25rem",
    }}>
      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 20, fontWeight: 700, color: "#085041",
      }}>
        Buddy<span style={{ color: "#1D9E75" }}>Assist</span>
      </div>

      <nav style={{ display: "flex", gap: 4 }}>
        {visibleItems.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              fontFamily: "inherit",
              fontSize: 13,
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: current === id ? "#1D9E75" : "#e0e0dc",
              background: current === id ? "#1D9E75" : "transparent",
              color: current === id ? "#fff" : "#666",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
