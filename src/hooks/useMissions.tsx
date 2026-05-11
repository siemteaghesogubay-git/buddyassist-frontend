import { useState, useEffect, useCallback } from "react"
import type { Mission } from "../types"
import { api } from "../api/client"

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [takenIds, setTakenIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true)
        const data = await api.getMissions()
        setMissions(data ?? [])
      } catch {
        setError("Kunde inte hämta uppdrag")
      } finally {
        setLoading(false)
      }
    }
    fetchMissions()
  }, [])

  const takeMission = useCallback(async (id: number) => {
    try {
      await api.takeMission(id)
      setTakenIds(prev => new Set([...prev, id]))
      setMissions(prev =>
        prev.map(m => m.id === id ? { ...m, status: "taken" as const } : m)
      )
    } catch (err: any) {
      throw new Error(err.message)
    }
  }, [])

  const createMission = useCallback(async (form: {
    title: string
    description: string
    category: string
    address: string
    scheduledAt: string
  }): Promise<Mission> => {
    const newMission = await api.createMission(form)
    setMissions(prev => [newMission, ...prev])
    return newMission
  }, [])

  const completeMission = useCallback(async (id: number, rating: number, comment: string) => {
    await api.completeMission(id, rating, comment)
    setMissions(prev =>
      prev.map(m => m.id === id ? { ...m, status: "completed" as const, helperRating: rating, helperComment: comment } : m)
    )
  }, [])

  const filterByCategory = useCallback(
    (category: string) =>
      category === "alla"
        ? missions
        : missions.filter(m => m.category === category),
    [missions]
  )

  return {
    missions,
    takenIds,
    takeMission,
    createMission,
    completeMission,
    filterByCategory,
    loading,
    error,
  }
}
