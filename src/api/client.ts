const BASE_URL = "https://localhost:7150/api"

function getToken(): string | null {
  return localStorage.getItem("token")
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken()

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(error)
  }

  const text = await res.text()
  if (!text) return undefined as unknown as T
  return JSON.parse(text) as T
}

export const api = {
  // ── AUTH ──────────────────────────────────────
  login: (email: string, password: string) =>
    request<{ token: string; name: string; userId: number; role: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, city: string) =>
    request<{ token: string; name: string; userId: number; role: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, city }),
    }),

  // ── MISSIONS ──────────────────────────────────
  getMissions: () => request<any[]>("/missions"),

  createMission: (mission: any) =>
    request<any>("/missions", {
      method: "POST",
      body: JSON.stringify(mission),
    }),

  takeMission: (id: number) =>
    request<any>(`/missions/${id}/take`, { method: "POST" }),

  completeMission: (id: number, rating: number, comment: string) =>
    request<any>(`/missions/${id}/complete`, {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
    }),

  pauseMission: (id: number) =>
    request<any>(`/missions/${id}/pause`, { method: "PUT" }),

  activateMission: (id: number) =>
    request<any>(`/missions/${id}/activate`, { method: "PUT" }),

  deleteMission: (id: number) =>
    request<any>(`/missions/${id}`, { method: "DELETE" }),

  // ── USERS ─────────────────────────────────────
  getUsers: () => request<any[]>("/users"),

  pauseUser: (id: number) =>
    request<any>(`/users/${id}/pause`, { method: "PUT" }),

  activateUser: (id: number) =>
    request<any>(`/users/${id}/activate`, { method: "PUT" }),

  deleteUser: (id: number) =>
    request<any>(`/users/${id}`, { method: "DELETE" }),

  updateProfileImage: (imageBase64: string) =>
    request<{ profileImage: string }>("/users/profile-image", {
      method: "PUT",
      body: JSON.stringify({ imageBase64 }),
    }),

  getProfileImage: (id: number) =>
    request<{ profileImage: string }>(`/users/${id}/profile-image`),

  // ── ADS ───────────────────────────────────────
  getAds: () => request<any[]>("/ads"),

  getAllAds: () => request<any[]>("/ads/all"),

  createAd: (ad: any) =>
    request<any>("/ads", {
      method: "POST",
      body: JSON.stringify(ad),
    }),

  deleteAd: (id: number) =>
    request<any>(`/ads/${id}`, { method: "DELETE" }),

  clickAd: (id: number) =>
    request<any>(`/ads/${id}/click`, { method: "POST" }),



  editUser: (id: number, data: { name?: string; city?: string; role?: string; clearProfileImage?: boolean }) =>
  request<any>(`/users/${id}/edit`, {
    method: "PUT",
    body: JSON.stringify({
      name: data.name,
      city: data.city,
      role: data.role,
      clearProfileImage: data.clearProfileImage ?? false,
    }),
  }),
}