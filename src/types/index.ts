export type MissionCategory =
  | "handla"
  | "transport"
  | "utbildning"
  | "sällskap"
  | "djurpassning"
  | "annat"

export type BadgeLevel =
  | "brons"
  | "silver"
  | "guld"
  | "diamant"
  | "stjärna"
  | "legend"

export type MissionStatus = "open" | "taken" | "completed"

export interface Mission {
  id: number
  title: string
  description: string
  category: MissionCategory
  address: string
  scheduledAt: string
  createdAt: string
  completedAt?: string
  status: MissionStatus
  points: number
  distanceKm: number
  createdByUserId: number
  takenByUserId?: number
  helperRating?: number
  helperComment?: string
}

export interface Badge {
  id: string
  level: BadgeLevel
  name: string
  requiredMissions: number
  icon: string
  earnedAt?: string
}

export interface User {
  id: string
  name: string
  initials: string
  city: string
  completedMissions: number
  totalPoints: number
  rating: number
  badges: Badge[]
  currentLevel: BadgeLevel
  hoursHelped: number
}

export interface CreateMissionForm {
  title: string
  description: string
  category: MissionCategory
  address: string
  scheduledAt: string
}

export interface AuthResponse {
  token: string
  name: string
  userId: number
  role: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  city: string
}
