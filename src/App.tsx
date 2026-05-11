import { useState } from "react"
import { NavBar, type Page } from "./components/NavBar"
import { Toast } from "./components/Toast"
import { CompleteModal } from "./components/CompleteModal"
import { useMissions } from "./hooks/useMissions"
import { useToast } from "./hooks/useToast"
import { LoginPage } from "./pages/LoginPage"
import { HomePage } from "./pages/HomePage"
import { MissionsPage } from "./pages/MissionsPage"
import { CreatePage } from "./pages/CreatePage"
import { ProfilePage } from "./pages/ProfilePage"
import { LeaderboardPage } from "./pages/LeaderboardPage"
import { AdminPage } from "./pages/AdminPage"
import type { CreateMissionForm } from "./types"
import { ChatPage } from "./pages/ChatPage"
import { AdsPage } from "./pages/AdsPage"

const POINTS_MAP: Record<string, number> = {
  handla: 50, transport: 100, utbildning: 80,
  sällskap: 40, djurpassning: 60, annat: 50,
}

interface CurrentUser {
  name: string
  role: string
  totalPoints: number
  completedMissions: number
  currentLevel: string
}

function getLevel(missions: number): string {
  if (missions >= 100) return "legend"
  if (missions >= 50)  return "stjärna"
  if (missions >= 30)  return "diamant"
  if (missions >= 15)  return "guld"
  if (missions >= 10)  return "silver"
  if (missions >= 5)   return "brons"
  return "ny"
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [page, setPage] = useState<Page>("hem")
  const [userId, setUserId] = useState<number>(0)
  const [user, setUser] = useState<CurrentUser>({
    name: "", role: "", totalPoints: 0,
    completedMissions: 0, currentLevel: "ny",
  })
  const [completeModal, setCompleteModal] = useState<{ id: number; title: string } | null>(null)

  const { missions, takenIds, takeMission, createMission, completeMission, loading } = useMissions()
  const { message, visible, showToast } = useToast()

  const handleLogin = (name: string, role: string, id: number) => {
    setUserId(id)
    setUser(prev => ({ ...prev, name, role }))
    showToast(`Välkommen, ${name}! 👋`)
    setLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setLoggedIn(false)
    setUserId(0)
    setUser({ name: "", role: "", totalPoints: 0, completedMissions: 0, currentLevel: "ny" })
    setPage("hem")
  }

  const handleTake = async (id: number) => {
    try {
      const mission = missions.find(m => m.id === id)
      if (!mission) return
      await takeMission(id)
      setUser(prev => {
        const newMissions = prev.completedMissions + 1
        const newPoints = prev.totalPoints + (POINTS_MAP[mission.category] ?? 50)
        return { ...prev, completedMissions: newMissions, totalPoints: newPoints, currentLevel: getLevel(newMissions) }
      })
      showToast(`Uppdrag taget! +${mission.points} poäng väntar 🎉`)
    } catch {
      showToast("Något gick fel – försök igen")
    }
  }

  const handleCreate = async (form: CreateMissionForm) => {
    try {
      await createMission(form)
      showToast("Uppdrag publicerat! Matchar hjälpare...")
      setPage("uppdrag")
    } catch {
      showToast("Kunde inte skapa uppdrag")
    }
  }

  const handleComplete = (id: number) => {
    const mission = missions.find(m => m.id === id)
    if (!mission) return
    setCompleteModal({ id, title: mission.title })
  }

  const handleConfirmComplete = async (rating: number, comment: string) => {
    if (!completeModal) return
    try {
      await completeMission(completeModal.id, rating, comment)
      showToast(`Uppdrag slutfört! Betyg ${rating}/5 skickat 🎉`)
      setCompleteModal(null)
    } catch {
      showToast("Kunde inte slutföra uppdraget")
    }
  }

  if (!loggedIn) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toast message={message} visible={visible} />
      </>
    )
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <NavBar current={page} onChange={setPage} role={user.role} />

      {user.role === "admin" && (
        <div style={{
          background: "#FAEEDA", border: "1px solid #EF9F27",
          borderRadius: 10, padding: "8px 14px", marginBottom: "1rem",
          display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13,
        }}>
          <span>👑 Du är inloggad som <strong>Admin</strong> – {user.name}</span>
          <button onClick={handleLogout} style={{ fontFamily: "inherit", fontSize: 12, padding: "4px 12px", borderRadius: 20, border: "1px solid #EF9F27", background: "transparent", color: "#412402", cursor: "pointer" }}>
            Logga ut
          </button>
        </div>
      )}

      {user.role === "user" && (
        <div style={{
          background: "#E1F5EE", border: "1px solid #9FE1CB",
          borderRadius: 10, padding: "8px 14px", marginBottom: "1rem",
          display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13,
        }}>
          <span>👋 Välkommen, <strong>{user.name}</strong></span>
          <button onClick={handleLogout} style={{ fontFamily: "inherit", fontSize: 12, padding: "4px 12px", borderRadius: 20, border: "1px solid #9FE1CB", background: "transparent", color: "#085041", cursor: "pointer" }}>
            Logga ut
          </button>
        </div>
      )}

      {page === "hem" && (
        <HomePage
          missions={missions} takenIds={takenIds}
          onTake={handleTake} onComplete={handleComplete}
          currentUserId={userId} totalPoints={user.totalPoints}
          completedMissions={user.completedMissions}
          currentLevel={user.currentLevel} loading={loading}
        />
      )}
      {page === "uppdrag" && (
        <MissionsPage
          missions={missions} takenIds={takenIds}
          onTake={handleTake} onComplete={handleComplete}
          currentUserId={userId}
        />
      )}
      {page === "skapa"    && <CreatePage onCreate={handleCreate} />}
      {page === "profil"   && <ProfilePage name={user.name} totalPoints={user.totalPoints} completedMissions={user.completedMissions} currentLevel={user.currentLevel} />}
      {page === "topp"     && <LeaderboardPage />}
      {page === "admin"    && user.role === "admin" && <AdminPage />}
      {page === "chatt"    && <ChatPage currentUserId={userId} currentUserName={user.name} />}
      {page === "annonser" && <AdsPage />}

      {completeModal && (
        <CompleteModal
          missionTitle={completeModal.title}
          onConfirm={handleConfirmComplete}
          onCancel={() => setCompleteModal(null)}
        />
      )}

      <Toast message={message} visible={visible} />
    </div>
  )
}

export default App