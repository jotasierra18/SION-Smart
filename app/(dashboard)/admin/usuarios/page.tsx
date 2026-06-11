import { getUsers } from '@/app/actions/data'
import { UsersTable } from './users-table'

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Usuarios</h1>
        <p className="text-muted-foreground">
          Gestiona los usuarios y sus roles en el sistema
        </p>
      </div>

      <UsersTable users={users} />
    </div>
  )
}
