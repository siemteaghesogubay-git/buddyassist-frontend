import { useState } from "react"
import type { CreateMissionForm, MissionCategory } from "../types"

const CATEGORIES: { id: MissionCategory; label: string; icon: string; points: number }[] = [
  { id: "handla",       label: "Mat & handling", icon: "🛒", points: 50  },
  { id: "transport",    label: "Transport",       icon: "📦", points: 100 },
  { id: "utbildning",   label: "Utbildning",      icon: "📚", points: 80  },
  { id: "sällskap",     label: "Sällskap",        icon: "🤝", points: 40  },
  { id: "djurpassning", label: "Djur & husdjur",  icon: "🐾", points: 60  },
  { id: "annat",        label: "Hemm & fix",      icon: "🔧", points: 50  },
]

interface Props {
  onCreate: (form: CreateMissionForm) => void
}

const EMPTY: CreateMissionForm = {
  title: "", description: "", category: "handla", address: "", scheduledAt: "",
}

export function CreatePage({ onCreate }: Props) {
  const [form, setForm] = useState<CreateMissionForm>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof CreateMissionForm, string>>>({})

  const selectedCat = CATEGORIES.find(c => c.id === form.category)

  const update = (field: keyof CreateMissionForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const e: typeof errors = {}
    if (!form.title.trim())       e.title = "Titel krävs"
    if (!form.description.trim()) e.description = "Beskrivning krävs"
    if (!form.address.trim())     e.address = "Adress krävs"
    if (!form.scheduledAt)        e.scheduledAt = "Tid krävs"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onCreate(form)
    setForm(EMPTY)
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
        Skapa uppdrag
      </h1>

      {/* Poängpreview */}
      <div style={{
        background: "rgba(79,110,247,0.1)", border: "1px solid rgba(79,110,247,0.3)",
        borderRadius: 12, padding: "12px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 18,
      }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 2 }}>Poängförslag</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span>Kategori +{selectedCat?.points ?? 50}p</span>
            <span>Tid +20p</span>
            <span>Avstånd +30p</span>
          </div>
        </div>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 22, fontWeight: 700, color: "#F59E0B",
        }}>
          ⭐ {selectedCat?.points ?? 50}p
        </div>
      </div>

      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 16, padding: 20,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <Field label="Titel" error={errors.title}>
          <input value={form.title} onChange={e => update("title", e.target.value)} placeholder="T.ex. Handla mat åt äldre person" />
        </Field>

        <Field label="Beskrivning" error={errors.description}>
          <textarea
            value={form.description}
            onChange={e => update("description", e.target.value)}
            placeholder="Beskriv vad som behöver göras..."
            style={{ height: 80, resize: "vertical" }}
          />
        </Field>

        <Field label="Kategori">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => update("category", cat.id)}
                style={{
                  fontFamily: "inherit", padding: "10px 6px",
                  borderRadius: 10, border: "1px solid",
                  borderColor: form.category === cat.id ? "var(--accent-blue)" : "var(--border)",
                  background: form.category === cat.id ? "rgba(79,110,247,0.15)" : "var(--bg-secondary)",
                  color: form.category === cat.id ? "var(--accent-blue)" : "var(--text-secondary)",
                  cursor: "pointer", fontSize: 11, fontWeight: 500,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                }}
              >
                <span style={{ fontSize: 18 }}>{cat.icon}</span>
                <span style={{ textAlign: "center", lineHeight: 1.2 }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Adress" error={errors.address}>
          <input value={form.address} onChange={e => update("address", e.target.value)} placeholder="Gatuadress, stad" />
        </Field>

        <Field label="Datum & tid" error={errors.scheduledAt}>
          <input type="datetime-local" value={form.scheduledAt} onChange={e => update("scheduledAt", e.target.value)} />
        </Field>

        <button
          onClick={handleSubmit}
          style={{
            fontFamily: "inherit", fontSize: 14, fontWeight: 600,
            padding: "14px", borderRadius: 12, border: "none",
            background: "var(--accent-blue)", color: "#fff",
            cursor: "pointer", marginTop: 4,
          }}
        >
          Publicera uppdrag 🚀
        </button>
      </div>
    </div>
  )
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 6, fontWeight: 500 }}>
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: 11, color: "#EF4444", marginTop: 4 }}>{error}</p>}
    </div>
  )
}