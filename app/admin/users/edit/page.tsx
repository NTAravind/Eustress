// app/admin/users/[id]/page.tsx
import { notFound } from "next/navigation"
import { getUserById } from "../../actions/users"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Mail, Phone, User, Receipt, MapPin, CreditCard } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function UserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  let user

  try {
    user = await getUserById(params.id)
  } catch (error) {
    notFound()
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/admin/users">
          <Button variant="ghost" className="mb-4">
            ← Back to Users
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
        <p className="text-muted-foreground">
          View user information and workshop registrations
        </p>
      </div>

      <div className="grid gap-6">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
            <CardDescription>Personal details and account information</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">
                    {user.name || "N/A"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone Number</p>
                  <p className="text-sm text-muted-foreground">
                    {user.phoneno || "N/A"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Joined Date</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workshop Registrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Workshop Registrations
              </div>
              <Badge variant="secondary">
                {user.Registration.length} Total
              </Badge>
            </CardTitle>
            <CardDescription>
              All workshops this user has registered for
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.Registration.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No workshop registrations yet
              </div>
            ) : (
              <div className="space-y-4">
                {user.Registration.map((registration) => (
                  <Card key={registration.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">
                              {registration.Workshop.title}
                            </h3>
                            <Link
                              href={`/admin/registrations/${registration.id}`}
                              className="text-xs text-muted-foreground hover:underline"
                            >
                              Registration ID: {registration.id}
                            </Link>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Workshop Date</p>
                              <p className="text-muted-foreground">
                                {formatDate(registration.Workshop.date)} at {registration.Workshop.time}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Location</p>
                              <p className="text-muted-foreground">
                                {registration.Workshop.location}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Registered On</p>
                              <p className="text-muted-foreground">
                                {formatDate(registration.registeredAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Payment Status</p>
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
                          </div>

                          <div className="text-sm">
                            <p className="font-medium">Amount</p>
                            <p className="text-lg font-semibold">
                              {registration.pricePaid
                                ? formatCurrency(registration.pricePaid)
                                : formatCurrency(registration.Workshop.price)}
                            </p>
                          </div>

                          <div className="text-sm">
                            <p className="font-medium">Seats</p>
                            <p className="text-muted-foreground">
                              {registration.seats} seat(s)
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/registrations/${registration.id}`}>
                            View Registration Details
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/workshops/edit/${registration.workshopId}`}>
                            Edit Workshop
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}