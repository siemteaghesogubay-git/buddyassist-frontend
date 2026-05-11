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
  open:   { bg: "#E1F5EE", color: "#085041" },
  taken:  { bg: "#FAEEDA", color: "#412402" },
  paused: { bg: "#f1f0ec", color: "#888" },
}

const CATEGORY_ICONS: Record<string, string> = {
  handla:       "🛒",
  transport:    "🧳",
  utbildning:   "📚",
  sällskap:     "🚶",
  djurpassning: "🐶",
  annat:        "🔧",
}

export function AdminPage() {
  const [tab, setTab] = useState<"missions" | "users" | "ads">("missions")
  const [missions, setMissions] = useState<Mission[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"alla" | "open" | "taken" | "paused">("alla")

  useEffect(() => {
    loadData()
  }, [tab])

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
      // "ads" tab handles its own loading inside AdsManager
    } catch {
      console.error("Kunde inte ladda data")
    } finally {
      setLoading(false)
    }
  }

  const handlePauseMission = async (id: number) => {
    await api.pauseMission(id)
    setMissions(prev => prev.map(m => m.id === id ? { ...m, status: "paused" } : m))
  }

  const handleActivateMission = async (id: number) => {
    await api.activateMission(id)
    setMissions(prev => prev.map(m => m.id === id ? { ...m, status: "open" } : m))
  }

  const handleDeleteMission = async (id: number) => {
    if (!confirm("Är du säker på att du vill ta bort uppdraget?")) return
    await api.deleteMission(id)
    setMissions(prev => prev.filter(m => m.id !== id))
  }

  const handleDeleteAllTaken = async () => {
    if (!confirm("Är du säker? Alla avklarade uppdrag tas bort!")) return
    const takenMissions = missions.filter(m => m.status === "taken")
    for (const m of takenMissions) {
      await api.deleteMission(m.id)
    }
    setMissions(prev => prev.filter(m => m.status !== "taken"))
  }

  const handlePauseUser = async (id: number) => {
    await api.pauseUser(id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isPaused: true } : u))
  }

  const handleActivateUser = async (id: number) => {
    await api.activateUser(id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isPaused: false } : u))
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Är du säker på att du vill ta bort användaren?")) return
    await api.deleteUser(id)
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  const filteredMissions = filter === "alla"
    ? missions
    : missions.filter(m => m.status === filter)

  const takenCount  = missions.filter(m => m.status === "taken").length
  const openCount   = missions.filter(m => m.status === "open").length
  const pausedCount = missions.filter(m => m.status === "paused").length

  return (
    <div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
        ⚙️ Admin-panel
      </div>

      {/* Huvudflikar */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem" }}>
        {[
          { id: "missions", label: `Uppdrag (${missions.length})` },
          { id: "users",    label: `Användare (${users.length})` },
          { id: "ads",      label: "Annonser" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id as any)}
            style={{
              fontFamily: "inherit", fontSize: 13,
              padding: "6px 16px", borderRadius: 20,
              border: "1px solid",
              borderColor: tab === id ? "#1D9E75" : "#e0e0dc",
              background: tab === id ? "#1D9E75" : "transparent",
              color: tab === id ? "#fff" : "#666",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "ads" ? (
        <AdsManager />
      ) : loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
          Laddar...
        </div>
      ) : tab === "missions" ? (
        <div>
          {/* Statistik */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: "1.25rem" }}>
            {[
              { label: "Öppna",     value: openCount,   bg: "#E1F5EE", color: "#085041" },
              { label: "Avklarade", value: takenCount,  bg: "#FAEEDA", color: "#412402" },
              { label: "Pausade",   value: pausedCount, bg: "#f1f0ec", color: "#888" },
            ].map(({ label, value, bg, color }) => (
              <div key={label} style={{ background: bg, borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, color, marginBottom: 4, fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Filter + Ta bort alla avklarade */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
            {[
              { id: "alla",   label: "Alla" },
              { id: "open",   label: "Öppna" },
              { id: "taken",  label: "Avklarade" },
              { id: "paused", label: "Pausade" },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id as any)}
                style={{
                  fontFamily: "inherit", fontSize: 12,
                  padding: "5px 12px", borderRadius: 20,
                  border: "1px solid",
                  borderColor: filter === id ? "#1D9E75" : "#e0e0dc",
                  background: filter === id ? "#E1F5EE" : "transparent",
                  color: filter === id ? "#085041" : "#888",
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}

            {takenCount > 0 && (
              <button
                onClick={handleDeleteAllTaken}
                style={{
                  fontFamily: "inherit", fontSize: 12,
                  padding: "5px 14px", borderRadius: 20,
                  border: "none",
                  background: "#A32D2D",
                  color: "#fff",
                  cursor: "pointer",
                  marginLeft: "auto",
                  fontWeight: 500,
                }}
              >
                🗑 Ta bort alla avklarade ({takenCount})
              </button>
            )}
          </div>

          {/* Uppdragslista */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredMissions.map(m => {
              const sc = STATUS_COLORS[m.status] ?? STATUS_COLORS.open
              return (
                <div key={m.id} style={{
                  background: "#fff",
                  border: "1px solid #e0e0dc",
                  borderRadius: 12,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
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
                    <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{m.title}</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: sc.bg, color: sc.color, fontWeight: 500 }}>
                        {m.status === "open" ? "Öppen" : m.status === "taken" ? "Avklarad" : "Pausad"}
                      </span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#f1f0ec", color: "#888" }}>
                        {m.category}
                      </span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#f1f0ec", color: "#1D9E75", fontWeight: 600 }}>
                        +{m.points} pts
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#888", flexWrap: "wrap" }}>
                      {m.createdByName && (
                        <span>✏️ Skapad av: <strong>{m.createdByName}</strong></span>
                      )}
                      {m.takenByName ? (
                        <span>✅ Tagen av: <strong style={{ color: "#1D9E75" }}>{m.takenByName}</strong></span>
                      ) : m.status === "open" ? (
                        <span>⏳ Ingen har tagit uppdraget än</span>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {m.status === "paused" ? (
                      <button onClick={() => handleActivateMission(m.id)} style={btnStyle("#1D9E75")}>
                        ▶ Aktivera
                      </button>
                    ) : m.status === "open" ? (
                      <button onClick={() => handlePauseMission(m.id)} style={btnStyle("#EF9F27")}>
                        ⏸ Pausa
                      </button>
                    ) : null}
                    <button onClick={() => handleDeleteMission(m.id)} style={btnStyle("#A32D2D")}>
                      🗑 Ta bort
                    </button>
                  </div>
                </div>
              )
            })}

            {filteredMissions.length === 0 && (
              <p style={{ textAlign: "center", color: "#aaa", padding: "2rem" }}>
                Inga uppdrag i den här kategorin.
              </p>
            )}
          </div>
        </div>

      ) : (
        // Users tab
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {users.map(u => (
            <div key={u.id} style={{
              background: u.isPaused ? "#FFF5F5" : "#fff",
              border: `1px solid ${u.isPaused ? "#FFCCCC" : "#e0e0dc"}`,
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: u.isPaused ? "#ccc" : u.role === "admin" ? "#EF9F27" : "#1D9E75",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 600, color: "#fff", flexShrink: 0,
              }}>
                {u.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                  {u.name}
                  {u.role === "admin" && (
                    <span style={{ fontSize: 11, marginLeft: 6, padding: "2px 8px", borderRadius: 20, background: "#FAEEDA", color: "#412402", fontWeight: 500 }}>
                      admin
                    </span>
                  )}
                  {u.isPaused && (
                    <span style={{ fontSize: 11, marginLeft: 6, padding: "2px 8px", borderRadius: 20, background: "#FFCCCC", color: "#A32D2D", fontWeight: 500 }}>
                      pausad
                    </span>
                  )}
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#f1f0ec", color: "#888" }}>
                    📍 {u.city}
                  </span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#E1F5EE", color: "#085041" }}>
                    {u.totalPoints} pts
                  </span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#f1f0ec", color: "#888" }}>
                    {u.completedMissions} uppdrag
                  </span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#f1f0ec", color: "#888" }}>
                    {u.currentLevel}
                  </span>
                </div>
              </div>

              {u.role !== "admin" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {u.isPaused ? (
                    <button onClick={() => handleActivateUser(u.id)} style={btnStyle("#1D9E75")}>
                      ▶ Aktivera
                    </button>
                  ) : (
                    <button onClick={() => handlePauseUser(u.id)} style={btnStyle("#EF9F27")}>
                      ⏸ Pausa
                    </button>
                  )}
                  <button onClick={() => handleDeleteUser(u.id)} style={btnStyle("#A32D2D")}>
                    🗑 Ta bort
                  </button>
                </div>
              )}
            </div>
          ))}
          {users.length === 0 && (
            <p style={{ textAlign: "center", color: "#aaa", padding: "2rem" }}>
              Inga användare än.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function AdsManager() {
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    companyName: "", description: "", logoUrl: "",
    websiteUrl: "", category: "Mat & Dagligvaror",
    contactEmail: "", phoneNumber: "",
    pricePerMonth: 0, expiresAt: "",
  })

  useEffect(() => {
  setLoading(true)
  api.getAds()
    .then(data => {
      console.log("Annonser:", data)
      setAds(data ?? [])
    })
    .catch(err => console.error("Fel:", err))
    .finally(() => setLoading(false))
}, [])

  const handleCreate = async () => {
    try {
      const newAd = await api.createAd(form)
      setAds(prev => [newAd, ...prev])
      setShowForm(false)
      setForm({
        companyName: "", description: "", logoUrl: "",
        websiteUrl: "", category: "Mat & Dagligvaror",
        contactEmail: "", phoneNumber: "",
        pricePerMonth: 0, expiresAt: "",
      })
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
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700 }}>
          📢 Annonser ({ads.length})
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            fontFamily: "inherit", fontSize: 12, fontWeight: 500,
            padding: "6px 14px", borderRadius: 20, border: "none",
            background: "#EF9F27", color: "#fff", cursor: "pointer",
          }}
        >
          {showForm ? "✕ Stäng" : "+ Ny annons"}
        </button>
      </div>

      {/* Formulär */}
      {showForm && (
        <div style={{ background: "#FAEEDA", border: "1px solid #EF9F27", borderRadius: 12, padding: 16, marginBottom: 16 }}>
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
                <label style={{ fontSize: 11, color: "#412402", display: "block", marginBottom: 3, fontWeight: 500 }}>{label}</label>
                <input
                  type={type ?? "text"}
                  value={(form as any)[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                  placeholder={placeholder}
                  style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid #e0c080", fontFamily: "inherit", fontSize: 13, boxSizing: "border-box" }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "#412402", display: "block", marginBottom: 3, fontWeight: 500 }}>Beskrivning</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Beskriv erbjudandet..."
              style={{ width: "100%", height: 60, padding: "7px 10px", borderRadius: 8, border: "1px solid #e0c080", fontFamily: "inherit", fontSize: 13, resize: "vertical", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: "#412402", display: "block", marginBottom: 3, fontWeight: 500 }}>Kategori</label>
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid #e0c080", fontFamily: "inherit", fontSize: 13 }}
              >
                {["Mat & Dagligvaror", "Transport", "Utbildning", "Hälsa & Träning", "Hem & Trädgård", "Övrigt"].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: "#412402", display: "block", marginBottom: 3, fontWeight: 500 }}>Går ut</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid #e0c080", fontFamily: "inherit", fontSize: 13 }}
              />
            </div>
          </div>

          <button
            onClick={handleCreate}
            style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 20px", borderRadius: 10, border: "none", background: "#EF9F27", color: "#fff", cursor: "pointer" }}
          >
            Publicera annons
          </button>
        </div>
      )}

      {/* Annonslista */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#888" }}>Laddar...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ads.map(ad => (
            <div key={ad.id} style={{
              background: "#fff", border: "1px solid #e0e0dc", borderRadius: 12,
              padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: "#FAEEDA", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 20, flexShrink: 0,
              }}>
                📢
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{ad.companyName}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#E1F5EE", color: "#085041" }}>{ad.category}</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#f1f0ec", color: "#888" }}>👁️ {ad.clicks} klick</span>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#f1f0ec", color: "#888" }}>{ad.pricePerMonth} kr/mån</span>
                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 20,
                    background: ad.isActive ? "#E1F5EE" : "#FFF5F5",
                    color: ad.isActive ? "#085041" : "#A32D2D",
                  }}>
                    {ad.isActive ? "✅ Aktiv" : "⏸ Inaktiv"}
                  </span>
                </div>
              </div>
              <button onClick={() => handleDelete(ad.id)} style={btnStyle("#A32D2D")}>🗑 Ta bort</button>
            </div>
          ))}
          {ads.length === 0 && (
            <p style={{ textAlign: "center", color: "#aaa", padding: "2rem" }}>Inga annonser än.</p>
          )}
        </div>
      )}
    </div>
  )
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 500,
    padding: "6px 12px",
    borderRadius: 20,
    border: "none",
    background: bg,
    color: "#fff",
    cursor: "pointer",
    whiteSpace: "nowrap",
  }
}