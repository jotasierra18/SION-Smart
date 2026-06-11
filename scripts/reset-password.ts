import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { account } from '@/lib/db/schema'

async function resetPassword() {
  try {
    // Crear el account con la nueva contraseña
    const result = await auth.api.changePassword({
      body: {
        currentPassword: '', // Better Auth puede permitir password reset sin la actual en algunos casos
        newPassword: 'admin12345',
        revokeOtherSessions: true,
      },
      // Usar el usuario específico
      headers: new Headers({
        'X-User-ID': 'wGZOPe3wdYsWdNjQGrwdb0gjdjqFLmJY',
      }),
    })
    console.log('Password updated:', result)
  } catch (error) {
    console.error('Error:', error)
  }
}

resetPassword()
