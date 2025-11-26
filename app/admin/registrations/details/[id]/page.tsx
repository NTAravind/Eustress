// app/admin/registrations/details/[id]/page.tsx
import { notFound } from "next/navigation"
import { getRegistrationById} from "@/app/admin/actions/registrations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Mail, MapPin, Phone, User, CreditCard, Receipt } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function RegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let registration

  try {
    registration = await getRegistrationById(id)
  } catch (error) {
    notFound()
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href={`/admin/registrations/${registration.workshopId}`}>
          <Button variant="ghost" className="mb-4">
            ← Back to Workshop Registrations
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Registration Details</h1>
        <p className="text-muted-foreground">
          View and manage registration information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
            <CardDescription>Details about the registered user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">
                  {registration.User.name || "N/A"}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {registration.User.email}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone Number</p>
                <p className="text-sm text-muted-foreground">
                  {registration.User.phoneno || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workshop Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Workshop Information
            </CardTitle>
            <CardDescription>Details about the workshop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Title</p>
              <p className="text-sm text-muted-foreground">
                {registration.Workshop.title}
              </p>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(registration.Workshop.date)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {registration.Workshop.time}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {registration.Workshop.location}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Registration Information
            </CardTitle>
            <CardDescription>Booking details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Registration ID</p>
              <p className="text-sm text-muted-foreground font-mono">
                {registration.id}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium">Registered At</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(registration.registeredAt)}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium">Number of Seats</p>
              <p className="text-sm text-muted-foreground">
                {registration.seats} seat(s)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
            <CardDescription>Payment status and details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Payment Status</p>
              <div className="mt-1">
                <Badge
                  variant={
                    registration.paid && registration.paymentStatus === "completed"
                      ? "default"
                      : registration.paymentStatus === "pending"
                      ? "secondary"
                      : registration.paymentStatus === "failed"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {registration.paid && registration.paymentStatus === "completed"
                    ? "Paid"
                    : registration.paymentStatus === "pending"
                    ? "Pending"
                    : registration.paymentStatus === "failed"
                    ? "Failed"
                    : "Unpaid"}
                </Badge>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium">Amount Paid</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(registration.pricePaid)}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium">Payment Method</p>
              <p className="text-sm text-muted-foreground capitalize">
                {registration.paymentMethod || "N/A"}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium">Payment ID</p>
              <p className="text-sm text-muted-foreground font-mono">
                {registration.paymentId || "N/A"}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium">Razorpay Order ID</p>
              <p className="text-sm text-muted-foreground font-mono">
                {registration.razorpayOrderId || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}