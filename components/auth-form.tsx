'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export function AuthForm({ mode }: { mode: 'sign-in' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setLoading(false)
        setError('Credenciales incorrectas. Verifica tu correo y contrasena.')
        return
      }

      window.location.href = '/'
    } catch {
      setLoading(false)
      setError('Error de conexion. Intenta de nuevo.')
    }
  }

  return (
    <main className="min-h-svh bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-sm p-8">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <Image
              src="/images/logo.png"
              alt="SION S-MART"
              width={160}
              height={60}
              className="h-16 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-center">
            Bienvenido
          </h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Inicia sesion con tu cuenta para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Correo electronico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="tu@email.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contrasena</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="current-password"
              placeholder="Minimo 8 caracteres"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? 'Iniciando sesion...' : 'Iniciar sesion'}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Acceso restringido. Contacta al administrador para obtener credenciales.
        </p>
      </Card>
    </main>
  )
}
