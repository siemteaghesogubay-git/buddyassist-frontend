interface Props {
  message: string
  visible: boolean
}

export function Toast({ message, visible }: Props) {
  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      left: "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : 60}px)`,
      background: "#04342C",
      color: "#9FE1CB",
      padding: "10px 20px",
      borderRadius: 24,
      fontSize: 13,
      fontWeight: 500,
      opacity: visible ? 1 : 0,
      transition: "all 0.3s",
      pointerEvents: "none",
      whiteSpace: "nowrap",
    }}>
      {message}
    </div>
  )
}