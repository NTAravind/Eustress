// app/admin/workshops/page.tsx
import { getWorkshops } from "../actions/workshop"
import { columns } from "../components/workshops/column"
import { DataTable } from "../components/workshops/datatable"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function WorkshopsPage() {
  const workshops = await getWorkshops()

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workshops</h1>
          <p className="text-muted-foreground">
            Manage all workshops, seats, and registrations
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/workshops/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Workshop
          </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={workshops} />
    </div>
  )
}