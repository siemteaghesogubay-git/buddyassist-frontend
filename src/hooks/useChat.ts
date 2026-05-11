import { useState, useEffect, useRef, useCallback } from "react"
import * as signalR from "@microsoft/signalr"

export interface ChatMessage {
  senderId: string
  senderName: string
  message: string
  timestamp: string
}

export function useChat(userId: number, userName: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connected, setConnected] = useState(false)
  const connectionRef = useRef<signalR.HubConnection | null>(null)

  useEffect(() => {
    if (!userId) return

    const token = localStorage.getItem("token")

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7150/hubs/chat", {
        accessTokenFactory: () => token ?? "",
      })
      .withAutomaticReconnect()
      .build()

    connection.on("ReceiveMessage", (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg])
    })

    connection.start()
      .then(() => {
        setConnected(true)
        connectionRef.current = connection
      })
      .catch(err => console.error("SignalR fel:", err))

    return () => {
      connection.stop()
    }
  }, [userId])

  const joinConversation = useCallback(async (otherUserId: string) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke("JoinConversation", otherUserId)
    }
  }, [])

  const sendMessage = useCallback(async (otherUserId: string, message: string) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke("SendGroupMessage", otherUserId, userName, message)
    }
  }, [userName])

  return { messages, connected, joinConversation, sendMessage, setMessages }
}