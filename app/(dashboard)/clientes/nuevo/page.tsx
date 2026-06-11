import { ClientForm } from '@/components/client-form'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function NewClientPage() {
  const session = await getSession()
  const isAdmin = (session?.user as { role?: string })?.role === 'admin'
  
  if (!isAdmin) {
    redirect('/clientes')
  }

  return <ClientForm />
}
