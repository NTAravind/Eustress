// app/admin/users/page.tsx
import { getUsers } from "../actions/users"
import { columns } from "../components/users/column"
import { DataTable } from "../components/users/datatable"

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage all users and their workshop registrations
        </p>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  )
}