import { useState } from "react"
import type { CreateMissionForm, MissionCategory } from "../types"

const CATEGORIES: { id: MissionCategory; label: string }[] = [
  { id: "handla",       label: "Handla" },
  { id: "transport",    label: "Transport" },
  { id: "utbildning",   label: "Utbildning" },
  { id: "sällskap",     label: "Sällskap" },
  { id: "djurpassning", label: "Djurpassning" },
  { id: "annat",        label: "Annat" },
]

const POINTS_MAP: Record<MissionCategory, number> = {
  handla: 50, transport: 100, utbildning: 80,
  sällskap: 40, djurpassning: 60, annat: 50,
}

interface Props {
  onCreate: (form: CreateMissionForm) => void
}

const EMPTY: CreateMissionForm = {
  title: "", description: "", category: "handla", address: "", scheduledAt: "",
}

export function CreatePage({ onCreate }: Props) {
  const [form, setForm] = useState<CreateMissionForm>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof CreateMissionForm, string>>>({})

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
    <div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
        Skapa nytt uppdrag
      </div>

      {/* Poängpreview */}
      <div style={{ background: "#E1F5EE", border: "1px solid #9FE1CB", borderRadius: 10, padding: "10px 14px", marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#085041" }}>Hjälparen får</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#1D9E75" }}>{POINTS_MAP[form.category]} poäng</span>
      </div>

      <div style={{ background: "#f9f9f7", borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>

        <Field label="Titel" error={errors.title}>
          <input value={form.title} onChange={e => update("title", e.target.value)} placeholder="Vad behöver du hjälp med?" />
        </Field>

        <Field label="Beskrivning" error={errors.description}>
          <textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Mer detaljer..." style={{ height: 80, resize: "vertical", width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e0e0dc", fontFamily: "inherit", fontSize: 14 }} />
        </Field>

        <Field label="Kategori">
          <select value={form.category} onChange={e => update("category", e.target.value as MissionCategory)} style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e0e0dc", fontFamily: "inherit", fontSize: 14 }}>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>

        <Field label="Adress" error={errors.address}>
          <input value={form.address} onChange={e => update("address", e.target.value)} placeholder="Din adress" />
        </Field>

        <Field label="Datum & tid" error={errors.scheduledAt}>
          <input type="datetime-local" value={form.scheduledAt} onChange={e => update("scheduledAt", e.target.value)} />
        </Field>

        <button
          onClick={handleSubmit}
          style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 500, padding: 10, borderRadius: 10, border: "none", background: "#1D9E75", color: "#fff", cursor: "pointer" }}
        >
          Publicera uppdrag
        </button>

      </div>
    </div>
  )
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, color: "#888", marginBottom: 5 }}>{label}</label>
      {children}
      {error && <p style={{ fontSize: 11, color: "#A32D2D", marginTop: 4 }}>{error}</p>}
    </div>
  )
}