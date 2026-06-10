'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthUser {
  id: string
  email: string
  app_metadata: Record<string, unknown>
  user_metadata: Record<string, unknown>
}

interface AuthContextType {
  user: AuthUser | null
  accessToken: string | null
  loading: boolean
  signOut: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  loading: true,
  signOut: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.exp && Date.now() >= payload.exp * 1000) return null
    return {
      id: payload.sub,
      email: payload.email,
      app_metadata: payload.app_metadata || {},
      user_metadata: payload.user_metadata || {},
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('sb-access-token')
    if (token) {
      const decoded = decodeJwtPayload(token)
      if (decoded) {
        setUser(decoded)
        setAccessToken(token)
      } else {
        localStorage.removeItem('sb-access-token')
        localStorage.removeItem('sb-refresh-token')
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (loading) return
    const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up'
    if (!user && !isAuthPage) {
      router.replace('/sign-in')
    }
    if (user && isAuthPage) {
      router.replace('/')
    }
  }, [user, loading, pathname, router])

  const signOut = () => {
    localStorage.removeItem('sb-access-token')
    localStorage.removeItem('sb-refresh-token')
    setUser(null)
    setAccessToken(null)
    router.replace('/sign-in')
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
