import { useState, useEffect } from "react"
import { api } from "../api/client"

interface Ad {
  id: number
  companyName: string
  description: string
  logoUrl: string
  websiteUrl: string
  category: string
  contactEmail: string
  phoneNumber: string
  clicks: number
  pricePerMonth: number
  expiresAt: string
}

const AD_CATEGORIES = [
  "Alla", "Mat & Dagligvaror", "Transport", "Utbildning",
  "Hälsa & Träning", "Hem & Trädgård", "Övrigt"
]

export function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("Alla")

  useEffect(() => {
    api.getAds()
      .then(data => setAds(data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleClick = async (ad: Ad) => {
    await api.clickAd(ad.id)
    if (ad.websiteUrl) window.open(ad.websiteUrl, "_blank")
  }

  const filtered = filter === "Alla"
    ? ads
    : ads.filter(a => a.category === filter)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "#085041", marginBottom: 4 }}>
          📢 Lokala Erbjudanden
        </div>
        <p style={{ fontSize: 13, color: "#888" }}>
          Upptäck lokala företag och tjänster nära dig
        </p>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {AD_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              fontFamily: "inherit", fontSize: 12,
              padding: "5px 12px", borderRadius: 20,
              border: "1px solid",
              borderColor: filter === cat ? "#9FE1CB" : "#e0e0dc",
              background: filter === cat ? "#E1F5EE" : "transparent",
              color: filter === cat ? "#085041" : "#888",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
          Laddar annonser...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📢</div>
          <p style={{ fontSize: 14 }}>Inga annonser just nu.</p>
          <p style={{ fontSize: 12, color: "#bbb" }}>Vill du annonsera? Kontakta oss!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(ad => (
            <div
              key={ad.id}
              style={{
                background: "#fff",
                border: "1px solid #e0e0dc",
                borderRadius: 14,
                overflow: "hidden",
                transition: "box-shadow 0.15s, transform 0.15s",
                cursor: "pointer",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"
                e.currentTarget.style.transform = "translateY(-2px)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "none"
                e.currentTarget.style.transform = "translateY(0)"
              }}
              onClick={() => handleClick(ad)}
            >
              {/* Logo / Banner */}
              <div style={{
                height: 120,
                background: "linear-gradient(135deg, #E1F5EE 0%, #c5ead9 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                {ad.logoUrl ? (
                  <img
                    src={ad.logoUrl}
                    alt={ad.companyName}
                    style={{ maxHeight: 80, maxWidth: "80%", objectFit: "contain" }}
                  />
                ) : (
                  <div style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 28, fontWeight: 700, color: "#1D9E75",
                  }}>
                    {ad.companyName.charAt(0)}
                  </div>
                )}
                <span style={{
                  position: "absolute", top: 10, right: 10,
                  fontSize: 10, fontWeight: 600,
                  padding: "2px 8px", borderRadius: 20,
                  background: "#EF9F27", color: "#fff",
                }}>
                  ANNONS
                </span>
              </div>

              {/* Info */}
              <div style={{ padding: 16 }}>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 15, fontWeight: 700,
                  color: "#085041", marginBottom: 6,
                }}>
                  {ad.companyName}
                </div>
                <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5, marginBottom: 12 }}>
                  {ad.description}
                </p>

                {/* Kategori */}
                <span style={{
                  fontSize: 11, padding: "3px 10px", borderRadius: 20,
                  background: "#E1F5EE", color: "#085041",
                  fontWeight: 500, display: "inline-block", marginBottom: 12,
                }}>
                  {ad.category}
                </span>

                {/* Kontakt */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#888" }}>
                  {ad.phoneNumber && (
                    <span>📞 {ad.phoneNumber}</span>
                  )}
                  {ad.contactEmail && (
                    <span>✉️ {ad.contactEmail}</span>
                  )}
                </div>

                {/* CTA */}
                <button
                  onClick={e => { e.stopPropagation(); handleClick(ad) }}
                  style={{
                    width: "100%", marginTop: 14,
                    fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                    padding: "10px", borderRadius: 10, border: "none",
                    background: "#1D9E75", color: "#fff", cursor: "pointer",
                  }}
                >
                  Besök oss →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Annonsera hos oss */}
      <div style={{
        marginTop: 32, background: "#FAEEDA",
        border: "1px solid #EF9F27", borderRadius: 14,
        padding: 24, textAlign: "center",
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>📢</div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#412402", marginBottom: 6 }}>
          Vill ditt företag synas här?
        </div>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 16, maxWidth: 400, margin: "0 auto 16px" }}>
          Nå tusentals lokala användare som aktivt söker hjälp och tjänster i ditt område.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
          {[
            { icon: "👁️", label: "Synlighet", desc: "Visas för alla användare" },
            { icon: "📊", label: "Statistik", desc: "Följ klick och engagemang" },
            { icon: "🎯", label: "Lokalt", desc: "Nå rätt målgrupp" },
          ].map(({ icon, label, desc }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24 }}>{icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#412402" }}>{label}</div>
              <div style={{ fontSize: 11, color: "#888" }}>{desc}</div>
            </div>
          ))}
        </div>
        
          <a    href="mailto:siemteaghes.98@gmail.com?subject=Annonsera på BuddyAssist"
          style={{
            display: "inline-block",
            fontFamily: "inherit", fontSize: 13, fontWeight: 600,
            padding: "10px 24px", borderRadius: 10,
            background: "#EF9F27", color: "#fff",
            textDecoration: "none",
          }}
        >
          Kontakta oss
        </a>
      </div>
    </div>
  )



}