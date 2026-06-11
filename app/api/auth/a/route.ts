import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  return Response.json({ message: 'Auth endpoint - use /sign-in for authentication' })
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      global: { headers: { cookie: cookieStore.toString() } },
    }
  )

  try {
    const body = await req.json()
    
    if (body.action === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password,
      })
      if (error) throw error
      return Response.json({ success: true, data })
    }
    
    if (body.action === 'signout') {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return Response.json({ success: true })
    }
    
    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
