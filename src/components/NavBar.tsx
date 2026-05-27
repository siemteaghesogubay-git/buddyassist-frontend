import { Avatar } from "./Avatar"

export type Page = "hem" | "uppdrag" | "skapa" | "chatt" | "annonser" | "topp" | "profil" | "admin"

const NAV_ITEMS: { id: Page; label: string; icon: string; adminOnly?: boolean }[] = [
  { id: "hem",      label: "Hem",           icon: "🏠" },
  { id: "uppdrag",  label: "Uppdrag",       icon: "📋" },
  { id: "skapa",    label: "Skapa uppdrag", icon: "➕" },
  { id: "chatt",    label: "Chatt",         icon: "💬" },
  { id: "annonser", label: "Annonser",      icon: "📢" },
  { id: "topp",     label: "Topp",          icon: "🏆" },
  { id: "profil",   label: "Profil",        icon: "👤" },
  { id: "admin",    label: "Admin",         icon: "⚙️", adminOnly: true },
]

interface Props {
  current: Page
  onChange: (page: Page) => void
  role: string
  userName: string
  unreadChats?: number
  profileImage?: string | null
}

export function NavBar({ current, onChange, role, userName, unreadChats = 0, profileImage }: Props) {
  const visible = NAV_ITEMS.filter(i => !i.adminOnly || role === "admin")

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="desktop-nav"
        style={{
          width: 220, flexShrink: 0,
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column",
          height: "100vh", position: "sticky", top: 0,
        }}
      >
        {/* Logo */}
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #4F6EF7, #8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>🤝</div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700 }}>
              Buddy<span style={{ color: "var(--accent-blue)" }}>Assist</span>
            </span>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {visible.map(({ id, label, icon }) => {
            const active = current === id
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 10,
                  border: "none", cursor: "pointer",
                  background: active ? "rgba(79,110,247,0.15)" : "transparent",
                  color: active ? "var(--accent-blue)" : "var(--text-secondary)",
                  fontFamily: "inherit", fontSize: 14, fontWeight: active ? 600 : 400,
                  transition: "all 0.15s", textAlign: "left", width: "100%",
                  borderLeft: active ? "3px solid var(--accent-blue)" : "3px solid transparent",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-hover)" }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}
              >
                <span style={{ fontSize: 16 }}>{icon}</span>
                {label}
                {id === "chatt" && unreadChats > 0 && (
                  <span style={{
                    marginLeft: "auto", background: "var(--accent-blue)",
                    color: "#fff", fontSize: 11, fontWeight: 600,
                    padding: "2px 7px", borderRadius: 20,
                    minWidth: 20, textAlign: "center",
                  }}>
                    {unreadChats}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User section med profilbild */}
        <div style={{
          padding: "16px 14px", borderTop: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: 10,
          cursor: "pointer",
        }}
          onClick={() => onChange("profil")}
        >
          <Avatar
            name={userName}
            imageBase64={profileImage}
            size={36}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 600,
              color: "var(--text-primary)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {userName}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
              {role === "admin" ? "👑 Admin" : "Hjälpare"}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="mobile-nav"
        style={{
          display: "none",
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border)",
          padding: "8px 0", zIndex: 100,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {visible.slice(0, 5).map(({ id, icon }) => (
            <button
              key={id}
              onClick={() => onChange(id)}
              style={{
                background: "none", border: "none",
                cursor: "pointer", padding: "6px 12px",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 2, position: "relative",
                color: current === id ? "var(--accent-blue)" : "var(--text-secondary)",
              }}
            >
              {/* Visa profilbild i mobil nav för profil-knappen */}
              {id === "profil" && profileImage ? (
                <Avatar name={userName} imageBase64={profileImage} size={24} />
              ) : (
                <span style={{ fontSize: 20 }}>{icon}</span>
              )}
              {id === "chatt" && unreadChats > 0 && (
                <span style={{
                  position: "absolute", top: 2, right: 8,
                  background: "var(--accent-blue)",
                  width: 16, height: 16, borderRadius: "50%",
                  fontSize: 10, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {unreadChats}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav  { display: block !important; }
        }
      `}</style>
    </>
  )
}