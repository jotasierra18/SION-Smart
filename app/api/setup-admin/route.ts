import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Create a Supabase client with anon key for signup
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Sign up user using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'jotasierra18@gmail.com',
      password: 'admin12345',
      options: {
        data: {
          name: 'Jota Sierra Admin',
          role: 'admin',
        },
      },
    })

    if (authError) {
      // If user already exists, return appropriate message
      if (authError.message.includes('already')) {
        return Response.json({
          success: false,
          message: 'El usuario ya existe',
        }, { status: 400 })
      }
      throw new Error(authError.message)
    }

    if (!authData.user?.id) {
      throw new Error('No se pudo crear el usuario')
    }

    return Response.json({
      success: true,
      message: 'Usuario admin creado exitosamente',
      email: 'jotasierra18@gmail.com',
      password: 'admin12345',
      userId: authData.user.id,
    })
  } catch (error) {
    console.error('[Setup Admin] Error:', error)
    return Response.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
