// app/admin/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CalendarDays, Receipt, TrendingUp, DollarSign, UserCheck } from "lucide-react"
import { PrismaClient } from "@/app/generated/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const prisma = new PrismaClient()

async function getDashboardStats() {
  const [
    totalUsers,
    totalWorkshops,
    totalRegistrations,
    paidRegistrations,
    recentRegistrations,
    upcomingWorkshops,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.workshop.count(),
    prisma.registration.count(),
    prisma.registration.count({
      where: { paid: true, paymentStatus: "completed" },
    }),
    prisma.registration.findMany({
      take: 5,
      orderBy: { registeredAt: "desc" },
      include: {
        User: { select: { name: true, email: true } },
        Workshop: { select: { title: true } },
      },
    }),
    prisma.workshop.findMany({
      where: { date: { gte: new Date() }, isOpen: true },
      take: 5,
      orderBy: { date: "asc" },
      include: {
        _count: { select: { Registration: true } },
      },
    }),
  ])

  const totalRevenue = await prisma.registration.aggregate({
    where: { paid: true, paymentStatus: "completed" },
    _sum: { pricePaid: true },
  })

  return {
    totalUsers,
    totalWorkshops,
    totalRegistrations,
    paidRegistrations,
    totalRevenue: totalRevenue._sum.pricePaid || 0,
    recentRegistrations,
    upcomingWorkshops,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's an overview of your workshop platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered users on platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workshops</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalWorkshops}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available workshops
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All workshop registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Registrations</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.paidRegistrations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalRegistrations > 0
                ? ((stats.paidRegistrations / stats.totalRegistrations) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Payment completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
            <CardDescription>Latest workshop registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentRegistrations.length > 0 ? (
                stats.recentRegistrations.map((registration) => (
                  <div key={registration.id} className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {registration.User.name || registration.User.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {registration.Workshop.title}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(registration.registeredAt)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent registrations
                </p>
              )}
            </div>
            {stats.recentRegistrations.length > 0 && (
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/admin/registrations">View All Registrations</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Workshops</CardTitle>
            <CardDescription>Next scheduled workshops</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.upcomingWorkshops.length > 0 ? (
                stats.upcomingWorkshops.map((workshop) => (
                  <div key={workshop.id} className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {workshop.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {workshop._count.Registration} registrations • {workshop.availableSeats} seats left
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(workshop.date)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming workshops
                </p>
              )}
            </div>
            {stats.upcomingWorkshops.length > 0 && (
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/admin/workshops">View All Workshops</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" asChild className="h-auto py-4 flex flex-col items-center gap-2">
              <Link href="/admin/workshops/create">
                <CalendarDays className="h-5 w-5" />
                <span>Create Workshop</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex flex-col items-center gap-2">
              <Link href="/admin/users">
                <Users className="h-5 w-5" />
                <span>View Users</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex flex-col items-center gap-2">
              <Link href="/admin/registrations">
                <Receipt className="h-5 w-5" />
                <span>View Registrations</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto py-4 flex flex-col items-center gap-2">
              <Link href="/admin/settings">
                <TrendingUp className="h-5 w-5" />
                <span>View Analytics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}