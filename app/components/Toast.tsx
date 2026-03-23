"use client"

import { useEffect, useState, CSSProperties } from "react"

export interface Toast {
  id: string
  type: "success" | "error" | "info" | "warning"
  message: string
  duration?: number
}

interface ToastContainerProps {
  toasts: Toast[]
  removeToast: (id: string) => void
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div style={s.container}>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onClose: () => void
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const duration = toast.duration || 4000
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.duration, onClose])

  const config = TOAST_CONFIG[toast.type]

  return (
    <div
      style={{
        ...s.toast,
        ...config.style,
        ...(isExiting ? s.toastExit : s.toastEnter),
      }}
    >
      <span style={s.toastIcon}>{config.icon}</span>
      <div style={s.toastContent}>
        <p style={s.toastMessage}>{toast.message}</p>
      </div>
      <button
        onClick={() => {
          setIsExiting(true)
          setTimeout(onClose, 300)
        }}
        style={s.toastClose}
      >
        ✕
      </button>
    </div>
  )
}

const TOAST_CONFIG: Record<
  string,
  {
    icon: string
    style: CSSProperties
  }
> = {
  success: {
    icon: "✓",
    style: {
      background: "rgba(34, 197, 94, 0.15)",
      borderColor: "#22c55e",
    },
  },
  error: {
    icon: "✕",
    style: {
      background: "rgba(239, 68, 68, 0.15)",
      borderColor: "#ef4444",
    },
  },
  info: {
    icon: "ℹ",
    style: {
      background: "rgba(59, 130, 246, 0.15)",
      borderColor: "#3b82f6",
    },
  },
  warning: {
    icon: "!",
    style: {
      background: "rgba(245, 158, 11, 0.15)",
      borderColor: "#f59e0b",
    },
  },
}

const s: Record<string, CSSProperties> = {
  container: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxWidth: "400px",
    pointerEvents: "none",
  },
  toast: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 500,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    pointerEvents: "auto",
  },
  toastEnter: {
    animation: "slideIn 0.3s ease-out",
  },
  toastExit: {
    animation: "slideOut 0.3s ease-out",
  },
  toastIcon: {
    fontSize: "16px",
    minWidth: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  toastContent: {
    flex: 1,
  },
  toastMessage: {
    margin: 0,
    lineHeight: "1.4",
  },
  toastClose: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.6)",
    cursor: "pointer",
    fontSize: "16px",
    padding: "0 4px",
    display: "flex",
    alignItems: "center",
    transition: "color 0.2s",
  },
}

/**
 * Hook to manage toasts
 */
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (
    message: string,
    type: Toast["type"] = "info",
    duration = 4000
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = { id, type, message, duration }
    setToasts((prev) => [...prev, toast])
    return id
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const success = (message: string, duration?: number) =>
    addToast(message, "success", duration)
  const error = (message: string, duration?: number) =>
    addToast(message, "error", duration)
  const info = (message: string, duration?: number) =>
    addToast(message, "info", duration)
  const warning = (message: string, duration?: number) =>
    addToast(message, "warning", duration)

  return { toasts, addToast, removeToast, success, error, info, warning }
}
