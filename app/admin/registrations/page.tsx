// app/admin/registrations/page.tsx
import { getWorkshopsWithRegistrationCount } from "@/app/admin/actions/registrations"
import { DataTable } from "./datatable"
import { columns } from "./columns"

export default async function RegistrationsPage() {
  const workshops = await getWorkshopsWithRegistrationCount()

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Workshop Registrations</h1>
        <p className="text-muted-foreground">
          View all workshops and their registration counts
        </p>
      </div>
      <DataTable columns={columns} data={workshops} />
    </div>
  )
}