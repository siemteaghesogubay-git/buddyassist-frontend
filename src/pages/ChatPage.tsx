import { useState, useEffect, useRef } from "react"
import { api } from "../api/client"
import { useChat } from "../hooks/useChat"

interface User {
  id: number
  name: string
  city: string
  role: string
}

interface Props {
  currentUserId: number
  currentUserName: string
}

export function ChatPage({ currentUserId, currentUserName }: Props) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<any[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, connected, joinConversation, sendMessage, setMessages } = useChat(currentUserId, currentUserName)

  // Hämta alla användare
  useEffect(() => {
    api.getUsers().then(data => {
      setUsers((data ?? []).filter((u: User) => u.id !== currentUserId))
    })
  }, [currentUserId])

  // Ladda chatthistorik när man väljer en användare
  useEffect(() => {
    if (!selectedUser) return
    setMessages([])
    setHistory([])

    joinConversation(String(selectedUser.id))

    fetch(`https://localhost:7150/api/chat/${selectedUser.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(r => r.json())
      .then(data => setHistory(data ?? []))
      .catch(() => {})
  }, [selectedUser])

  // Scrolla ned automatiskt
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, history])

  const handleSend = async () => {
    if (!input.trim() || !selectedUser) return
    await sendMessage(String(selectedUser.id), input.trim())

    // Spara i databasen
    await fetch("https://localhost:7150/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ receiverId: selectedUser.id, message: input.trim() }),
    })

    setInput("")
  }

  const allMessages = [
    ...history.map((m: any) => ({
      senderId: String(m.senderId),
      senderName: m.senderId === currentUserId ? currentUserName : selectedUser?.name ?? "",
      message: m.message,
      timestamp: m.sentAt,
    })),
    ...messages,
  ]

  return (
    <div style={{ display: "flex", gap: 12, height: "70vh" }}>

      {/* Användarlista */}
      <div style={{
        width: 200, flexShrink: 0,
        border: "1px solid #e0e0dc", borderRadius: 12,
        overflow: "hidden",
      }}>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 13, fontWeight: 700,
          padding: "12px 14px",
          borderBottom: "1px solid #e0e0dc",
          color: "#085041",
        }}>
          Konversationer
        </div>
        {users.map(u => (
          <div
            key={u.id}
            onClick={() => setSelectedUser(u)}
            style={{
              padding: "10px 14px",
              cursor: "pointer",
              background: selectedUser?.id === u.id ? "#E1F5EE" : "#fff",
              borderBottom: "1px solid #f1f0ec",
              display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "#1D9E75",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 600, color: "#fff", flexShrink: 0,
            }}>
              {u.name.split(" ").map(n => n[0]).join("").toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>{u.name}</div>
              <div style={{ fontSize: 11, color: "#888" }}>{u.city}</div>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <p style={{ fontSize: 12, color: "#aaa", padding: "1rem", textAlign: "center" }}>
            Inga användare
          </p>
        )}
      </div>

      {/* Chattfönster */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        border: "1px solid #e0e0dc", borderRadius: 12, overflow: "hidden",
      }}>
        {selectedUser ? (
          <>
            {/* Header */}
            <div style={{
              padding: "12px 16px",
              borderBottom: "1px solid #e0e0dc",
              display: "flex", alignItems: "center", gap: 10,
              background: "#fff",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "#1D9E75",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 600, color: "#fff",
              }}>
                {selectedUser.name.split(" ").map(n => n[0]).join("").toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedUser.name}</div>
                <div style={{ fontSize: 11, color: connected ? "#1D9E75" : "#aaa" }}>
                  {connected ? "● Online" : "○ Ansluter..."}
                </div>
              </div>
            </div>

            {/* Meddelanden */}
            <div style={{
              flex: 1, overflowY: "auto",
              padding: 16,
              display: "flex", flexDirection: "column", gap: 8,
              background: "#f9f9f7",
            }}>
              {allMessages.length === 0 && (
                <p style={{ textAlign: "center", color: "#aaa", fontSize: 13, marginTop: "2rem" }}>
                  Starta konversationen! 👋
                </p>
              )}
              {allMessages.map((msg, i) => {
                const isMe = msg.senderId === String(currentUserId)
                return (
                  <div key={i} style={{
                    display: "flex",
                    justifyContent: isMe ? "flex-end" : "flex-start",
                  }}>
                    <div style={{
                      maxWidth: "70%",
                      padding: "8px 12px",
                      borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                      background: isMe ? "#1D9E75" : "#fff",
                      color: isMe ? "#fff" : "#1a1a1a",
                      fontSize: 13,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    }}>
                      <p style={{ margin: 0 }}>{msg.message}</p>
                      <p style={{
                        margin: "4px 0 0", fontSize: 10,
                        color: isMe ? "rgba(255,255,255,0.7)" : "#aaa",
                        textAlign: "right",
                      }}>
                        {new Date(msg.timestamp).toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: "12px 16px",
              borderTop: "1px solid #e0e0dc",
              display: "flex", gap: 10,
              background: "#fff",
            }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Skriv ett meddelande..."
                style={{
                  flex: 1, padding: "10px 14px",
                  borderRadius: 24, border: "1px solid #e0e0dc",
                  fontFamily: "inherit", fontSize: 14,
                  outline: "none", background: "#f9f9f7",
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  border: "none", background: input.trim() ? "#1D9E75" : "#ccc",
                  color: "#fff", cursor: input.trim() ? "pointer" : "default",
                  fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ➤
              </button>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 12, color: "#aaa",
          }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <p style={{ fontSize: 14 }}>Välj en person att chatta med</p>
          </div>
        )}
      </div>
    </div>
  )
}