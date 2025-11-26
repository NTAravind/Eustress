// app/admin/registrations/[id]/page.tsx (UPDATED)
import { notFound } from "next/navigation"
import { getWorkshopRegistrations } from "@/app/admin/actions/registrations"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DataTable } from "./datatable"
import { columns } from "./column"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Users, DollarSign } from "lucide-react"
import { SendReminderButton } from "../../components/sendremainder"
export default async function WorkshopRegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let data

  try {
    data = await getWorkshopRegistrations(id)
  } catch (error) {
    notFound()
  }

  const { workshop, registrations } = data

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const totalRevenue = registrations.reduce((sum, reg) => sum + (reg.pricePaid || 0), 0)
  const paidRegistrations = registrations.filter(reg => reg.paid && reg.paymentStatus === "completed").length

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/admin/registrations">
          <Button variant="ghost" className="mb-4">
            ← Back to Workshops
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{workshop.title}</h1>
            <p className="text-muted-foreground">
              View all registrations for this workshop
            </p>
          </div>
        </div>
      </div>

      {/* Workshop Info Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Registrations
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Paid Registrations
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidRegistrations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Seats
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workshop.availableSeats} / {workshop.totalSeats}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workshop Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Workshop Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Date & Time</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(workshop.date)} at {workshop.time}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Location</p>
              <p className="text-sm text-muted-foreground">{workshop.location}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Send Reminder Button */}
      <div className="mb-6 flex justify-end">
        <SendReminderButton 
          workshopId={workshop.id} 
          registrations={registrations} 
        />
      </div>

      {/* Registrations Table */}
      <DataTable columns={columns} data={registrations} />
    </div>
  )
}