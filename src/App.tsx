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
import { ChatPage } from "./pages/ChatPage"
import { AdsPage } from "./pages/AdsPage"
import { api } from "./api/client"
import type { CreateMissionForm } from "./types"

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
  userId: number
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
  const [loggedIn, setLoggedIn]         = useState(false)
  const [page, setPage]                 = useState<Page>("hem")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [user, setUser] = useState<CurrentUser>({
    name: "", role: "", totalPoints: 0,
    completedMissions: 0, currentLevel: "ny", userId: 0,
  })
  const [completeModal, setCompleteModal] = useState<{ id: number; title: string } | null>(null)

  const { missions, takenIds, takeMission, createMission, completeMission, loading } = useMissions()
  const { message, visible, showToast } = useToast()

  const handleLogin = async (name: string, role: string, id: number) => {
    setUser(prev => ({ ...prev, name, role, userId: id }))
    setLoggedIn(true)
    showToast(`Välkommen, ${name}! 👋`)

    // Ladda profilbild från backend direkt vid inloggning
    try {
      const res = await api.getProfileImage(id)
      if (res?.profileImage) {
        setProfileImage(res.profileImage)
      } else {
        setProfileImage(null)
      }
    } catch {
      setProfileImage(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setLoggedIn(false)
    setProfileImage(null)
    setUser({
      name: "", role: "", totalPoints: 0,
      completedMissions: 0, currentLevel: "ny", userId: 0,
    })
    setPage("hem")
  }

  const handleTake = async (id: number) => {
    try {
      const mission = missions.find(m => m.id === id)
      if (!mission) return
      await takeMission(id)
      setUser(prev => {
        const newMissions = prev.completedMissions + 1
        const newPoints   = prev.totalPoints + (POINTS_MAP[mission.category] ?? 50)
        return {
          ...prev,
          completedMissions: newMissions,
          totalPoints: newPoints,
          currentLevel: getLevel(newMissions),
        }
      })
      showToast(`Uppdrag taget! +${mission.points} poäng 🎉`)
    } catch {
      showToast("Något gick fel")
    }
  }

  const handleCreate = async (form: CreateMissionForm) => {
    try {
      await createMission(form)
      showToast("Uppdrag publicerat! 🚀")
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
      showToast(`Slutfört! Betyg ${rating}/5 🎉`)
      setCompleteModal(null)
    } catch {
      showToast("Kunde inte slutföra")
    }
  }

  const handleImageUpdate = (base64: string) => {
    setProfileImage(base64)
  }

  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <NavBar
        current={page}
        onChange={setPage}
        role={user.role}
        userName={user.name}
        profileImage={profileImage}
      />

      <main style={{
        flex: 1, padding: "28px 32px",
        overflowY: "auto", maxWidth: "100%",
        paddingBottom: 80,
      }}>
        {page === "hem" && (
          <HomePage
            missions={missions} takenIds={takenIds}
            onTake={handleTake} onComplete={handleComplete}
            currentUserId={user.userId}
            userName={user.name}
            totalPoints={user.totalPoints}
            completedMissions={user.completedMissions}
            currentLevel={user.currentLevel}
            loading={loading}
          />
        )}
        {page === "uppdrag" && (
          <MissionsPage
            missions={missions} takenIds={takenIds}
            onTake={handleTake} onComplete={handleComplete}
            currentUserId={user.userId}
          />
        )}
        {page === "skapa"    && <CreatePage onCreate={handleCreate} />}
        {page === "chatt"    && <ChatPage currentUserId={user.userId} currentUserName={user.name} />}
        {page === "annonser" && <AdsPage />}
        {page === "topp"     && <LeaderboardPage />}
        {page === "profil"   && (
          <ProfilePage
            name={user.name}
            totalPoints={user.totalPoints}
            completedMissions={user.completedMissions}
            currentLevel={user.currentLevel}
            onLogout={handleLogout}
            profileImage={profileImage}
            onImageUpdate={handleImageUpdate}
          />
        )}
        {page === "admin" && user.role === "admin" && <AdminPage />}
      </main>

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