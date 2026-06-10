import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function getSession() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value
  const refreshToken = cookieStore.get('sb-refresh-token')?.value

  if (!accessToken) return null

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser(accessToken)

  if (error || !user) {
    if (refreshToken) {
      const { data: refreshData } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
      if (refreshData.user) {
        return { user: refreshData.user, session: refreshData.session }
      }
    }
    return null
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
