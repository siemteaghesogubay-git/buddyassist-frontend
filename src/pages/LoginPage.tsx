import { useState } from "react"
import { api } from "../api/client"

interface Props {
  onLogin: (name: string, role: string, id: number) => void
}

export function LoginPage({ onLogin }: Props) {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [city, setCity] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError("")
    setLoading(true)
    try {
      const res = isRegister
        ? await api.register(name, email, password, city)
        : await api.login(email, password)
      localStorage.setItem("token", res.token)
      onLogin(res.name, res.role, res.userId)
    } catch (err: any) {
      setError(err.message || "Något gick fel")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: "linear-gradient(135deg, #4F6EF7, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, margin: "0 auto 16px",
          }}>🤝</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700 }}>
            Buddy<span style={{ color: "var(--accent-blue)" }}>Assist</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 6 }}>
            Lokal hjälp & belöningssystem
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 20, padding: 28,
        }}>
          {/* Toggle */}
          <div style={{
            display: "flex", background: "var(--bg-secondary)",
            borderRadius: 12, padding: 4, marginBottom: 24,
          }}>
            {["Logga in", "Registrera"].map((label, i) => (
              <button key={label} onClick={() => setIsRegister(i === 1)} style={{
                flex: 1, fontFamily: "inherit", fontSize: 14, fontWeight: 500,
                padding: "10px", borderRadius: 10, border: "none",
                background: isRegister === (i === 1) ? "var(--accent-blue)" : "transparent",
                color: isRegister === (i === 1) ? "#fff" : "var(--text-secondary)",
                cursor: "pointer", transition: "all 0.15s",
              }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {isRegister && (
              <>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Namn</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Ditt namn" />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Stad</label>
                  <input value={city} onChange={e => setCity(e.target.value)} placeholder="Din stad" />
                </div>
              </>
            )}

            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>E-post</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="din@email.com" />
            </div>

            <div>
              <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Lösenord</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            {error && (
              <div style={{
                background: "#EF444420", border: "1px solid #EF444440",
                borderRadius: 10, padding: "10px 14px",
                fontSize: 13, color: "#EF4444",
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                padding: "13px", borderRadius: 12, border: "none",
                background: loading ? "var(--bg-hover)" : "var(--accent-blue)",
                color: loading ? "var(--text-secondary)" : "#fff",
                cursor: loading ? "default" : "pointer",
                marginTop: 4, transition: "background 0.15s",
              }}
            >
              {loading ? "Laddar..." : isRegister ? "Skapa konto" : "Logga in"}
            </button>
          </div>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 28 }}>
          {[
            { icon: "🥉", label: "Brons" },
            { icon: "🥈", label: "Silver" },
            { icon: "🥇", label: "Guld" },
            { icon: "💎", label: "Diamant" },
            { icon: "⭐", label: "Stjärna" },
          ].map(({ icon, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22 }}>{icon}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 20 }}>
          Små insatser. <span style={{ color: "var(--accent-blue)" }}>Stor skillnad.</span>
        </p>
      </div>
    </div>
  )
}