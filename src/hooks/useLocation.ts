import { useState, useEffect } from "react"

export interface UserLocation {
  lat: number
  lng: number
  city?: string
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation stöds inte av din webbläsare")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords

        // Reverse geocoding för att få stadsnamn
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await res.json()
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.suburb ||
            "Din position"

          setLocation({ lat: latitude, lng: longitude, city })
        } catch {
          setLocation({ lat: latitude, lng: longitude, city: "Din position" })
        }

        setLoading(false)
      },
      (err) => {
        setError("Kunde inte hämta position: " + err.message)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  return { location, loading, error }
}