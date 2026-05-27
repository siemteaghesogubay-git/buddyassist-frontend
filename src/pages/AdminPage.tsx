import { useState, useEffect } from "react"
import { api } from "../api/client"

interface Mission {
  id: number
  title: string
  category: string
  status: string
  points: number
  address: string
  takenByName?: string
  createdByName?: string
}

interface User {
  id: number
  name: string
  city: string
  totalPoints: number
  completedMissions: number
  currentLevel: string
  role: string
  isPaused: boolean
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  open:      { bg: "rgba(34,197,94,0.15)",  color: "#22C55E" },
  taken:     { bg: "rgba(245,158,11,0.15)", color: "#F59E0B" },
  paused:    { bg: "rgba(139,143,168,0.15)",color: "#8B8FA8" },
  completed: { bg: "rgba(79,110,247,0.15)", color: "#4F6EF7" },
}

const CATEGORY_ICONS: Record<string, string> = {
  handla:       "🛒",
  transport:    "📦",
  utbildning:   "📚",
  sällskap:     "🤝",
  djurpassning: "🐾",
  annat:        "🔧",
}

export function AdminPage() {
  const [tab, setTab]         = useState<"missions" | "users" | "ads">("missions")
  const [missions, setMissions] = useState<Mission[]>([])
  const [users, setUsers]     = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<"alla" | "open" | "taken" | "paused">("alla")
  const [editUser, setEditUser] = useState<User | null>(null)

  useEffect(() => { loadData() }, [tab])

  const loadData = async () => {
    setLoading(true)
    try {
      if (tab === "missions") {
        const data = await api.getMissions()
        setMissions(data ?? [])
      } else if (tab === "users") {
        const data = await api.getUsers()
        setUsers(data ?? [])
      }
    } catch {
      console.error("Kunde inte ladda data")
    } finally {
      setLoading(false)
    }
  }

  const handlePauseMission    = async (id: number) => { await api.pauseMission(id);    setMissions(prev => prev.map(m => m.id === id ? { ...m, status: "paused" } : m)) }
  const handleActivateMission = async (id: number) => { await api.activateMission(id); setMissions(prev => prev.map(m => m.id === id ? { ...m, status: "open"   } : m)) }
  const handleDeleteMission   = async (id: number) => {
    if (!confirm("Är du säker på att du vill ta bort uppdraget?")) return
    await api.deleteMission(id)
    setMissions(prev => prev.filter(m => m.id !== id))
  }
  const handleDeleteAllTaken = async () => {
    if (!confirm("Är du säker? Alla avklarade uppdrag tas bort!")) return
    for (const m of missions.filter(m => m.status === "taken")) await api.deleteMission(m.id)
    setMissions(prev => prev.filter(m => m.status !== "taken"))
  }
  const handlePauseUser    = async (id: number) => { await api.pauseUser(id);    setUsers(prev => prev.map(u => u.id === id ? { ...u, isPaused: true  } : u)) }
  const handleActivateUser = async (id: number) => { await api.activateUser(id); setUsers(prev => prev.map(u => u.id === id ? { ...u, isPaused: false } : u)) }
  const handleDeleteUser   = async (id: number) => {
    if (!confirm("Är du säker på att du vill ta bort användaren?")) return
    await api.deleteUser(id)
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  const filteredMissions = filter === "alla" ? missions : missions.filter(m => m.status === filter)
  const takenCount  = missions.filter(m => m.status === "taken").length
  const openCount   = missions.filter(m => m.status === "open").length
  const pausedCount = missions.filter(m => m.status === "paused").length

  return (
    <div>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
        ⚙️ Admin-panel
      </h1>

      {/* Flikar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { id: "missions", label: `Uppdrag (${missions.length})` },
          { id: "users",    label: `Användare (${users.length})`  },
          { id: "ads",      label: "Annonser"                     },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id as any)}
            style={{
              fontFamily: "inherit", fontSize: 13,
              padding: "8px 18px", borderRadius: 10,
              border: "1px solid",
              borderColor: tab === id ? "var(--accent-blue)" : "var(--border)",
              background:  tab === id ? "rgba(79,110,247,0.15)" : "var(--bg-card)",
              color:       tab === id ? "var(--accent-blue)" : "var(--text-secondary)",
              cursor: "pointer", fontWeight: tab === id ? 600 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ADS */}
      {tab === "ads" ? (
        <AdsManager />

      ) : loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          Laddar...
        </div>

      ) : tab === "missions" ? (
        <div>
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Öppna",     value: openCount,   color: "#22C55E" },
              { label: "Avklarade", value: takenCount,  color: "#F59E0B" },
              { label: "Pausade",   value: pausedCount, color: "#8B8FA8" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 12, padding: "14px 16px",
              }}>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { id: "alla",   label: "Alla"      },
              { id: "open",   label: "Öppna"     },
              { id: "taken",  label: "Avklarade" },
              { id: "paused", label: "Pausade"   },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => setFilter(id as any)} style={{
                fontFamily: "inherit", fontSize: 12,
                padding: "5px 12px", borderRadius: 8, border: "1px solid",
                borderColor: filter === id ? "var(--accent-blue)" : "var(--border)",
                background:  filter === id ? "rgba(79,110,247,0.15)" : "var(--bg-card)",
                color:       filter === id ? "var(--accent-blue)" : "var(--text-secondary)",
                cursor: "pointer",
              }}>
                {label}
              </button>
            ))}
            {takenCount > 0 && (
              <button onClick={handleDeleteAllTaken} style={{ ...btnStyle("#EF4444"), marginLeft: "auto" }}>
                🗑 Ta bort avklarade ({takenCount})
              </button>
            )}
          </div>

          {/* Uppdragslista */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredMissions.map(m => {
              const sc = STATUS_COLORS[m.status] ?? STATUS_COLORS.open
              return (
                <div key={m.id} style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 12, padding: "14px 16px",
                  display: "flex", alignItems: "flex-start", gap: 12,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: sc.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, flexShrink: 0,
                  }}>
                    {CATEGORY_ICONS[m.category] ?? "📋"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>{m.title}</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: sc.bg, color: sc.color, fontWeight: 500 }}>
                        {m.status === "open" ? "Öppen" : m.status === "taken" ? "Avklarad" : m.status === "completed" ? "Slutförd" : "Pausad"}
                      </span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                        {m.category}
                      </span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(245,158,11,0.15)", color: "#F59E0B", fontWeight: 600 }}>
                        +{m.points} pts
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text-secondary)", flexWrap: "wrap" }}>
                      {m.createdByName && <span>✏️ Skapad av: <strong style={{ color: "var(--text-primary)" }}>{m.createdByName}</strong></span>}
                      {m.takenByName
                        ? <span>✅ Tagen av: <strong style={{ color: "#22C55E" }}>{m.takenByName}</strong></span>
                        : m.status === "open" && <span>⏳ Ingen har tagit uppdraget än</span>
                      }
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {m.status === "paused"
                      ? <button onClick={() => handleActivateMission(m.id)} style={btnStyle("#22C55E")}>▶ Aktivera</button>
                      : m.status === "open"
                      ? <button onClick={() => handlePauseMission(m.id)}    style={btnStyle("#F59E0B")}>⏸ Pausa</button>
                      : null
                    }
                    <button onClick={() => handleDeleteMission(m.id)} style={btnStyle("#EF4444")}>🗑 Ta bort</button>
                  </div>
                </div>
              )
            })}
            {filteredMissions.length === 0 && (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <p style={{ fontSize: 13 }}>Inga uppdrag i den här kategorin.</p>
              </div>
            )}
          </div>
        </div>

      ) : (
        // USERS
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {users.map(u => (
              <div key={u.id} style={{
                background: u.isPaused ? "rgba(239,68,68,0.05)" : "var(--bg-card)",
                border: `1px solid ${u.isPaused ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
                borderRadius: 12, padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: u.isPaused
                    ? "rgba(139,143,168,0.3)"
                    : u.role === "admin"
                    ? "linear-gradient(135deg, #F59E0B, #EF4444)"
                    : "linear-gradient(135deg, #4F6EF7, #8B5CF6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>
                  {u.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</p>
                    {u.role === "admin" && (
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(245,158,11,0.2)", color: "#F59E0B", fontWeight: 600 }}>
                        👑 Admin
                      </span>
                    )}
                    {u.isPaused && (
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(239,68,68,0.2)", color: "#EF4444", fontWeight: 600 }}>
                        ⏸ Pausad
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                      📍 {u.city}
                    </span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
                      ⭐ {u.totalPoints} pts
                    </span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                      ✅ {u.completedMissions} uppdrag
                    </span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                      {u.currentLevel}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button onClick={() => setEditUser(u)} style={btnStyle("#4F6EF7")}>
                    ✏️ Redigera
                  </button>
                  {u.role !== "admin" && (
                    <>
                      {u.isPaused
                        ? <button onClick={() => handleActivateUser(u.id)} style={btnStyle("#22C55E")}>▶ Aktivera</button>
                        : <button onClick={() => handlePauseUser(u.id)}    style={btnStyle("#F59E0B")}>⏸ Pausa</button>
                      }
                      <button onClick={() => handleDeleteUser(u.id)} style={btnStyle("#EF4444")}>🗑 Ta bort</button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                <p style={{ fontSize: 13 }}>Inga användare än.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={(updated) => {
            setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u))
            setEditUser(null)
          }}
        />
      )}
    </div>
  )
}

// ── EDIT USER MODAL ───────────────────────────────────────────────────────────

function EditUserModal({
  user, onClose, onSave,
}: {
  user: User
  onClose: () => void
  onSave: (updated: Partial<User> & { id: number }) => void
}) {
  const [name,     setName]     = useState(user.name)
  const [city,     setCity]     = useState(user.city)
  const [role,     setRole]     = useState(user.role)
  const [clearImg, setClearImg] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")

  const handleSave = async () => {
    if (!name.trim()) { setError("Namn krävs"); return }
    setLoading(true)
    try {
      await api.editUser(user.id, {
        name: name.trim(),
        city: city.trim(),
        role,
        clearProfileImage: clearImg,
      })
      onSave({ id: user.id, name, city, role })
    } catch (err: any) {
      setError(err.message || "Något gick fel")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: 20,
    }}>
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 16, padding: 24,
        width: "100%", maxWidth: 420,
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700 }}>
            ✏️ Redigera användare
          </h2>
          <button onClick={onClose} style={{
            background: "none", border: "none",
            color: "var(--text-secondary)", cursor: "pointer", fontSize: 20,
          }}>✕</button>
        </div>

        {/* Användarinfo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          background: "var(--bg-secondary)", borderRadius: 10,
          padding: "10px 14px", marginBottom: 20,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "linear-gradient(135deg, #4F6EF7, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "#fff",
          }}>
            {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>ID: {user.id} · {user.city}</div>
          </div>
        </div>

        {/* Formulär */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Namn</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Användarens namn" />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Stad</label>
            <input value={city} onChange={e => setCity(e.target.value)} placeholder="Stad" />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Roll</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="user">Användare</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Ta bort profilbild */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 10, padding: "12px 14px",
          }}>
            <input
              type="checkbox" id="clearImg"
              checked={clearImg}
              onChange={e => setClearImg(e.target.checked)}
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#EF4444" }}
            />
            <label htmlFor="clearImg" style={{ fontSize: 13, cursor: "pointer", color: "#EF4444" }}>
              🗑 Ta bort profilbild
            </label>
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#EF4444",
            }}>
              {error}
            </div>
          )}

          {/* Knappar */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{
              flex: 1, fontFamily: "inherit", fontSize: 13,
              padding: "10px", borderRadius: 10,
              border: "1px solid var(--border)",
              background: "transparent", color: "var(--text-secondary)",
              cursor: "pointer",
            }}>
              Avbryt
            </button>
            <button onClick={handleSave} disabled={loading} style={{
              flex: 1, fontFamily: "inherit", fontSize: 13, fontWeight: 600,
              padding: "10px", borderRadius: 10, border: "none",
              background: loading ? "var(--bg-hover)" : "#4F6EF7",
              color: loading ? "var(--text-secondary)" : "#fff",
              cursor: loading ? "default" : "pointer",
            }}>
              {loading ? "Sparar..." : "Spara ändringar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ADS MANAGER ───────────────────────────────────────────────────────────────

function AdsManager() {
  const [ads, setAds]           = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    companyName: "", description: "", logoUrl: "",
    websiteUrl: "", category: "Mat & Dagligvaror",
    contactEmail: "", phoneNumber: "",
    pricePerMonth: 0, expiresAt: "",
  })

  useEffect(() => {
    setLoading(true)
    api.getAllAds()
      .then(data => setAds(data ?? []))
      .catch(err => console.error("Fel:", err))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    try {
      const formToSend = {
        ...form,
        expiresAt: form.expiresAt
          ? new Date(form.expiresAt).toISOString()
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      }
      const newAd = await api.createAd(formToSend)
      setAds(prev => [newAd, ...prev])
      setShowForm(false)
      setForm({ companyName: "", description: "", logoUrl: "", websiteUrl: "", category: "Mat & Dagligvaror", contactEmail: "", phoneNumber: "", pricePerMonth: 0, expiresAt: "" })
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Ta bort annonsen?")) return
    await api.deleteAd(id)
    setAds(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
          📢 Annonser ({ads.length})
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle(showForm ? "#8B8FA8" : "#F59E0B")}>
          {showForm ? "✕ Stäng" : "+ Ny annons"}
        </button>
      </div>

      {/* Formulär */}
      {showForm && (
        <div style={{
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: 12, padding: 16, marginBottom: 16,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {[
              { label: "Företagsnamn",    key: "companyName",   placeholder: "Ex: ICA Maxi" },
              { label: "Webbsida",        key: "websiteUrl",    placeholder: "https://..." },
              { label: "Logo URL",        key: "logoUrl",       placeholder: "https://logo.png" },
              { label: "Kontakt email",   key: "contactEmail",  placeholder: "info@foretag.se" },
              { label: "Telefon",         key: "phoneNumber",   placeholder: "070-123 45 67" },
              { label: "Pris/månad (kr)", key: "pricePerMonth", placeholder: "999", type: "number" },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4, fontWeight: 500 }}>{label}</label>
                <input
                  type={type ?? "text"}
                  value={(form as any)[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4, fontWeight: 500 }}>Beskrivning</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Beskriv erbjudandet..."
              style={{ height: 60, resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4, fontWeight: 500 }}>Kategori</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {["Mat & Dagligvaror","Transport","Utbildning","Hälsa & Träning","Hem & Trädgård","Övrigt"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: "var(--text-secondary)", display: "block", marginBottom: 4, fontWeight: 500 }}>Går ut</label>
              <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} />
            </div>
          </div>

          <button onClick={handleCreate} style={btnStyle("#F59E0B")}>
            Publicera annons
          </button>
        </div>
      )}

      {/* Annonslista */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>Laddar...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ads.map(ad => (
            <div key={ad.id} style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: "rgba(245,158,11,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
              }}>
                📢
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>{ad.companyName}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(79,110,247,0.15)", color: "#4F6EF7" }}>{ad.category}</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>👁️ {ad.clicks} klick</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>{ad.pricePerMonth} kr/mån</span>
                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 20,
                    background: ad.isActive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    color:      ad.isActive ? "#22C55E" : "#EF4444",
                  }}>
                    {ad.isActive ? "✅ Aktiv" : "⏸ Inaktiv"}
                  </span>
                </div>
              </div>
              <button onClick={() => handleDelete(ad.id)} style={btnStyle("#EF4444")}>🗑 Ta bort</button>
            </div>
          ))}
          {ads.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📢</div>
              <p style={{ fontSize: 13 }}>Inga annonser än.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function btnStyle(bg: string): React.CSSProperties {
  return {
    fontFamily: "inherit", fontSize: 12, fontWeight: 500,
    padding: "6px 12px", borderRadius: 8, border: "none",
    background: bg, color: "#fff", cursor: "pointer",
    whiteSpace: "nowrap",
  }
}