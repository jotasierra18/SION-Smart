import { cookies } from 'next/headers'

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = Buffer.from(parts[1], 'base64url').toString('utf-8')
    return JSON.parse(payload)
  } catch {
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value

  if (!accessToken) return null

  const payload = decodeJwtPayload(accessToken)
  if (!payload) return null

  const exp = payload.exp
  if (exp && Date.now() >= exp * 1000) return null

  const user = {
    id: payload.sub,
    email: payload.email,
    app_metadata: payload.app_metadata || {},
    user_metadata: payload.user_metadata || {},
  }

  return { user }
}

export async function getUser() {
  const result = await getSession()
  return result?.user ?? null
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) throw new Error('No autorizado')
  return user
}

export async function requireAdmin() {
  const user = await getUser()
  if (!user) throw new Error('No autorizado')
  const role = user.app_metadata?.role as string | undefined
  if (role !== 'admin') throw new Error('Solo administradores pueden realizar esta accion')
  return user
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value

  const { createClient } = await import('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      global: {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      },
    }
  )
}
