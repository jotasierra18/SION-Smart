import re

with open('app/actions/data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace createUser function
old_createUser = """export async function createUser(data: {
  name: string
  email: string
  password: string
  role: string
  identificacion?: string
  certificacion?: string
  horasExperiencia?: number
  vigenciaMedica?: Date
}) {
  await getUserId()
  const result = await auth.api.signUpEmail({
    body: {
      name: data.name,
      email: data.email,
      password: data.password,
    },
  })
  if (result?.user?.id) {
    await db
      .update(user)
      .set({
        role: data.role,
        identificacion: data.identificacion,
        certificacion: data.certificacion,
        horasExperiencia: data.horasExperiencia !== undefined ? String(data.horasExperiencia) : undefined,
        vigenciaMedica: data.vigenciaMedica,
        updatedAt: new Date(),
      })
      .where(eq(user.id, result.user.id))
  }
  revalidatePath('/admin/usuarios')
  return result
}"""

new_createUser = """export async function createUser(data: {
  name: string
  email: string
  password: string
  role: string
  identificacion?: string
  certificacion?: string
  horasExperiencia?: number
  vigenciaMedica?: Date
}) {
  await getUserId()
  const supabase = await getSupabaseServerClient()
  
  // Create user in Supabase Auth
  const { data: authData, error } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      name: data.name,
      role: data.role,
    },
  })
  
  if (error) {
    throw new Error(error.message)
  }
  
  if (authData.user?.id) {
    await db
      .update(user)
      .set({
        role: data.role,
        identificacion: data.identificacion,
        certificacion: data.certificacion,
        horasExperiencia: data.horasExperiencia !== undefined ? String(data.horasExperiencia) : undefined,
        vigenciaMedica: data.vigenciaMedica,
        updatedAt: new Date(),
      })
      .where(eq(user.id, authData.user.id))
  }
  
  revalidatePath('/admin/usuarios')
  return { user: authData.user }
}"""

if old_createUser in content:
    content = content.replace(old_createUser, new_createUser)
    print('Replaced createUser')
else:
    print('createUser pattern not found')

with open('app/actions/data.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
