'use client'

import { useEffect } from 'react'

export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement
    html.classList.remove('light')
    html.classList.add('dark')
    
    return () => {
      html.classList.remove('dark')
      html.classList.add('light')
    }
  }, [])

  return <>{children}</>
}
