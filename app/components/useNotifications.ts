"use client"

import { useEffect, useRef, useState } from "react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useNotifications() {
  const [isOpen, setIsOpen] = useState(false)

  const { data, mutate } = useSWR(
    "/api/notifications?count=true",
    fetcher,
    {
      refreshInterval: 30000,      
      revalidateOnFocus: false,    
      dedupingInterval: 10000,     
    }
  )

  const unreadCount = data?.count || 0

  async function refreshUnreadCount() {
    await mutate()
  }

  return {
    isOpen,
    setIsOpen,
    unreadCount,
    setUnreadCount: () => {},
    refreshUnreadCount,
  }
}