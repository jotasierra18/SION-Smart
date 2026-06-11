import sys

with open('app/actions/data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the header section
old_header = "'use server'\n\nimport { auth } from '@/lib/auth'\nimport { db } from '@/lib/db'\nimport { clients, serviceRequests, drones, serviceTypes, user } from '@/lib/db/schema'\nimport { and, desc, eq, sql, count } from 'drizzle-orm'\nimport { headers } from 'next/headers'\nimport { revalidatePath } from 'next/cache'\n\nasync function getUserId() {\n  const session = await auth.api.getSession({ headers: await headers() })\n  if (!session?.user) throw new Error('No autorizado')\n  return session.user.id\n}\n\nasync function getUserWithRole() {\n  const session = await auth.api.getSession({ headers: await headers() })\n  if (!session?.user) throw new Error('No autorizado')\n  return { id: session.user.id, role: (session.user as { role?: string }).role || 'operator' }\n}\n\nasync function requireAdmin() {\n  const { role } = await getUserWithRole()\n  if (role !== 'admin') throw new Error('Solo administradores pueden realizar esta accion')\n}\n\nexport async function getSession() {\n  const session = await auth.api.getSession({ headers: await headers() })\n  return session\n}"

new_header = "'use server'\n\nimport { db } from '@/lib/db'\nimport { clients, serviceRequests, drones, serviceTypes, user } from '@/lib/db/schema'\nimport { and, desc, eq, sql, count } from 'drizzle-orm'\nimport { revalidatePath } from 'next/cache'\nimport { createClient } from '@supabase/supabase-js'\nimport { cookies } from 'next/headers'\n\nasync function getSupabaseServerClient() {\n  const cookieStore = await cookies()\n  return createClient(\n    process.env.NEXT_PUBLIC_SUPABASE_URL!,\n    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,\n    {\n      auth: { persistSession: false },\n      global: { headers: { cookie: cookieStore.toString() } },\n    }\n  )\n}\n\nasync function getUserId() {\n  const supabase = await getSupabaseServerClient()\n  const { data: { user } } = await supabase.auth.getUser()\n  if (!user) throw new Error('No autorizado')\n  return user.id\n}\n\nasync function getUserWithRole() {\n  const supabase = await getSupabaseServerClient()\n  const { data: { user } } = await supabase.auth.getUser()\n  if (!user) throw new Error('No autorizado')\n  return { id: user.id, role: (user.user_metadata?.role as string) || 'operator' }\n}\n\nasync function requireAdmin() {\n  const { role } = await getUserWithRole()\n  if (role !== 'admin') throw new Error('Solo administradores pueden realizar esta accion')\n}\n\nexport async function getSession() {\n  const supabase = await getSupabaseServerClient()\n  const { data: { session } } = await supabase.auth.getSession()\n  return session\n}"

if old_header in content:
    content = content.replace(old_header, new_header)
    print('Replaced auth header')
else:
    print('Header pattern not found')
    if 'auth.api.getSession' in content:
        print('Found auth.api.getSession in content')

with open('app/actions/data.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done')
