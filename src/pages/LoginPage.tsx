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
      minHeight: "100vh", background: "#f5f3ee",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px", fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ textAlign: "center", marginBottom: 32, maxWidth: 480 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ fontSize: 36 }}>🤝</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, color: "#085041" }}>
            Buddy<span style={{ color: "#1D9E75" }}>Assist</span>
          </div>
        </div>
        <p style={{ fontSize: 16, color: "#4a6741", fontWeight: 500, marginBottom: 4 }}>
          Lokal hjälp & belöningssystem
        </p>
        <p style={{ fontSize: 14, color: "#888", lineHeight: 1.6 }}>
          BuddyAssist gör det enkelt att be om hjälp, hjälpa andra och bli belönad.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, maxWidth: 560, width: "100%", marginBottom: 32 }}>
        {[
          { icon: "👥", title: "Lokal hjälp",   desc: "Be om eller erbjud hjälp" },
          { icon: "⭐", title: "Tjäna poäng",   desc: "Hjälp andra och samla poäng" },
          { icon: "🎁", title: "Få belöningar", desc: "Använd dina poäng" },
          { icon: "📍", title: "Gemenskap",     desc: "Tillsammans skapar vi trygghet" },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ background: "#fff", borderRadius: 12, padding: "12px 10px", textAlign: "center", border: "1px solid #e8e6e0" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#085041", marginBottom: 2 }}>{title}</div>
            <div style={{ fontSize: 10, color: "#888", lineHeight: 1.4 }}>{desc}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 400, border: "1px solid #e8e6e0", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", background: "#f5f3ee", borderRadius: 10, padding: 4, marginBottom: 20 }}>
          {["Logga in", "Registrera"].map((label, i) => (
            <button key={label} onClick={() => setIsRegister(i === 1)} style={{
              flex: 1, fontFamily: "inherit", fontSize: 14, fontWeight: 500,
              padding: "8px", borderRadius: 8, border: "none",
              background: isRegister === (i === 1) ? "#fff" : "transparent",
              color: isRegister === (i === 1) ? "#085041" : "#888",
              cursor: "pointer",
              boxShadow: isRegister === (i === 1) ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isRegister && (
            <>
              <Field label="Namn"><input value={name} onChange={e => setName(e.target.value)} placeholder="Ditt namn" style={inputStyle} /></Field>
              <Field label="Stad"><input value={city} onChange={e => setCity(e.target.value)} placeholder="Din stad" style={inputStyle} /></Field>
            </>
          )}
          <Field label="E-post"><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="din@email.com" style={inputStyle} /></Field>
          <Field label="Lösenord"><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} /></Field>

          {error && (
            <div style={{ fontSize: 12, color: "#A32D2D", background: "#FEE", padding: "8px 12px", borderRadius: 8, border: "1px solid #FFCCCC" }}>
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} style={{
            fontFamily: "inherit", fontSize: 14, fontWeight: 600,
            padding: "12px", borderRadius: 10, border: "none",
            background: loading ? "#9FE1CB" : "#1D9E75",
            color: "#fff", cursor: loading ? "default" : "pointer", marginTop: 4,
          }}>
            {loading ? "Laddar..." : isRegister ? "Skapa konto" : "Logga in"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 24 }}>
        {[{ icon: "🥉", label: "Brons", req: "5 uppdrag" }, { icon: "🥈", label: "Silver", req: "10 uppdrag" }, { icon: "🥇", label: "Guld", req: "15 uppdrag" }, { icon: "💎", label: "Diamant", req: "30 uppdrag" }].map(({ icon, label, req }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>{icon}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#085041" }}>{label}</div>
            <div style={{ fontSize: 9, color: "#aaa" }}>{req}</div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 24, fontSize: 13, color: "#888", fontStyle: "italic" }}>
        🤝 Små insatser. <span style={{ color: "#EF9F27", fontWeight: 600 }}>Stor skillnad.</span>
      </p>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1px solid #e0e0dc", fontFamily: "inherit",
  fontSize: 14, outline: "none", background: "#fafaf8", color: "#1a1a1a",
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, color: "#555", marginBottom: 5, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  )
}