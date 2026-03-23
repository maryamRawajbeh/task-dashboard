"use client"

import { CSSProperties } from "react"

interface NotificationBellProps {
  unreadCount: number
  onClick: () => void
}

export function NotificationBell({
  unreadCount,
  onClick,
}: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      style={s.button}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "rgba(255,255,255,0.1)"
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "rgba(255,255,255,0.05)"
      }}
      title="Notifications"
    >
      <span style={s.icon}>🔔</span>
      {unreadCount > 0 && (
        <span style={s.badge}>{unreadCount > 99 ? "99+" : unreadCount}</span>
      )}
    </button>
  )
}

const s: Record<string, CSSProperties> = {
  button: {
    position: "relative",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "background 0.2s",
  },
  icon: {
    display: "inline-flex",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    background: "#ef4444",
    color: "#fff",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: 600,
    border: "2px solid #0a0a0f",
  },
}
