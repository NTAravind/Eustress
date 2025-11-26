// app/admin/workshops/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Edit, Bell, XCircle as XCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export type WorkshopRow = {
  id: string
  title: string
  description: string
  date: Date
  time: string
  location: string
  totalSeats: number
  availableSeats: number
  price: number
  discount: number
  thumbnail: string
  isOpen: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    Registration: number
  }
}

function NotifyUsersMenuItem({ workshop }: { workshop: WorkshopRow }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isNotifying, setIsNotifying] = useState(false)
  const [result, setResult] = useState<{
    type: "success" | "error" | "info"
    message: string
    details?: string
  } | null>(null)

  const handleConfirmNotify = async () => {
    setIsNotifying(true)
    setResult(null)
    
    try {
      const response = await fetch("/api/admin/notify-new-workshop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workshopId: workshop.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          type: "success",
          message: data.message || "Notifications sent successfully!",
          details: `Successfully notified ${data.successful} out of ${data.total} users about "${data.workshopTitle}".`
        })
      } else {
        setResult({
          type: "error",
          message: data.error || "Failed to send notifications",
          details: "Please check the console for more details."
        })
      }
    } catch (error) {
      setResult({
        type: "error",
        message: "An unexpected error occurred",
        details: "Unable to connect to the server. Please try again."
      })
      console.error("Error notifying users:", error)
    } finally {
      setIsNotifying(false)
    }
  }

  const handleClose = () => {
    if (!isNotifying && !result) {
      setIsOpen(false)
      setResult(null)
    }
  }

  const handleFinalClose = () => {
    setIsOpen(false)
    setTimeout(() => setResult(null), 300)
  }

  return (
    <>
      <DropdownMenuItem 
        onClick={() => setIsOpen(true)}
        onSelect={(e) => e.preventDefault()}
      >
        <Bell className="mr-2 h-4 w-4" />
        Notify Users
      </DropdownMenuItem>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Notify All Users</DialogTitle>
            <DialogDescription>
              Send an email announcement to all registered users about this workshop.
            </DialogDescription>
          </DialogHeader>

          {!result && !isNotifying && (
            <div className="space-y-4 py-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Confirmation Required</AlertTitle>
                <AlertDescription>
                  This will send an email to <strong>all users</strong> in your database announcing the workshop:
                  <div className="mt-2 p-2 bg-muted rounded-md">
                    <strong>{workshop.title}</strong>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="text-sm text-muted-foreground">
                <p>The email will include:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Workshop details and description</li>
                  <li>Date, time, and location</li>
                  <li>Pricing information</li>
                  <li>Direct registration link</li>
                </ul>
              </div>
            </div>
          )}

          {isNotifying && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                Sending notifications to all users...
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This may take a moment
              </p>
            </div>
          )}

          {result && (
            <Alert variant={result.type === "error" ? "destructive" : "default"} className="my-4">
              {result.type === "success" && <CheckCircle2 className="h-4 w-4" />}
              {result.type === "error" && <XCircle className="h-4 w-4" />}
              <AlertTitle>
                {result.type === "success" ? "Success!" : "Error"}
              </AlertTitle>
              <AlertDescription>
                <div>{result.message}</div>
                {result.details && (
                  <div className="mt-2 text-sm">{result.details}</div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            {!result && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={isNotifying}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmNotify}
                  disabled={isNotifying}
                >
                  {isNotifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Bell className="mr-2 h-4 w-4" />
                      Send Notifications
                    </>
                  )}
                </Button>
              </>
            )}
            {result && (
              <Button onClick={handleFinalClose}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function CancelWorkshopMenuItem({ workshop }: { workshop: WorkshopRow }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [result, setResult] = useState<{
    type: "success" | "error" | "info"
    message: string
    details?: string
  } | null>(null)

  const handleConfirmCancel = async () => {
    setIsCanceling(true)
    setResult(null)
    
    try {
      const response = await fetch("/api/admin/cancel-workshop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workshopId: workshop.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          type: "success",
          message: data.message || "Workshop canceled successfully!",
          details: `Notified ${data.successful} out of ${data.total} registered users about the cancellation.`
        })
        
        // Refresh the page after a delay to show updated status
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setResult({
          type: "error",
          message: data.error || "Failed to cancel workshop",
          details: "Please check the console for more details."
        })
      }
    } catch (error) {
      setResult({
        type: "error",
        message: "An unexpected error occurred",
        details: "Unable to connect to the server. Please try again."
      })
      console.error("Error canceling workshop:", error)
    } finally {
      setIsCanceling(false)
    }
  }

  const handleClose = () => {
    if (!isCanceling && !result) {
      setIsOpen(false)
      setResult(null)
    }
  }

  const handleFinalClose = () => {
    setIsOpen(false)
    setTimeout(() => setResult(null), 300)
  }

  const registrationCount = workshop._count.Registration

  return (
    <>
      <DropdownMenuItem 
        onClick={() => setIsOpen(true)}
        onSelect={(e) => e.preventDefault()}
        className="text-destructive focus:text-destructive"
      >
        <XCircleIcon className="mr-2 h-4 w-4" />
        Cancel Workshop
      </DropdownMenuItem>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Cancel Workshop</DialogTitle>
            <DialogDescription>
              This will cancel the workshop and notify all registered users.
            </DialogDescription>
          </DialogHeader>

          {!result && !isCanceling && (
            <div className="space-y-4 py-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning: This action cannot be undone</AlertTitle>
                <AlertDescription>
                  Canceling this workshop will:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Close the workshop for new registrations</li>
                    <li>Send cancellation emails to all {registrationCount} registered user{registrationCount !== 1 ? 's' : ''}</li>
                    <li>Mark the workshop as canceled in the system</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="p-3 bg-muted rounded-md">
                <p className="font-semibold text-sm">Workshop to cancel:</p>
                <p className="text-sm mt-1"><strong>{workshop.title}</strong></p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(workshop.date).toLocaleDateString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })} at {workshop.time}
                </p>
              </div>

              {registrationCount > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Email Notification</AlertTitle>
                  <AlertDescription>
                    All registered users will receive an email informing them about the cancellation with details about refunds and next steps.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {isCanceling && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-destructive mb-4" />
              <p className="text-sm text-muted-foreground">
                Canceling workshop and notifying users...
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                This may take a moment
              </p>
            </div>
          )}

          {result && (
            <Alert variant={result.type === "error" ? "destructive" : "default"} className="my-4">
              {result.type === "success" && <CheckCircle2 className="h-4 w-4" />}
              {result.type === "error" && <XCircle className="h-4 w-4" />}
              <AlertTitle>
                {result.type === "success" ? "Workshop Canceled" : "Error"}
              </AlertTitle>
              <AlertDescription>
                <div>{result.message}</div>
                {result.details && (
                  <div className="mt-2 text-sm">{result.details}</div>
                )}
                {result.type === "success" && (
                  <div className="mt-2 text-sm">Page will refresh shortly...</div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            {!result && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={isCanceling}
                >
                  Go Back
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmCancel}
                  disabled={isCanceling}
                >
                  {isCanceling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Canceling...
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="mr-2 h-4 w-4" />
                      Yes, Cancel Workshop
                    </>
                  )}
                </Button>
              </>
            )}
            {result && (
              <Button onClick={handleFinalClose}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const columns: ColumnDef<WorkshopRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <Link
          href={`/admin/workshops/edit/${row.original.id}`}
          className="font-medium hover:underline max-w-[300px] block truncate"
        >
          {row.getValue("title")}
        </Link>
      )
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"))
      return (
        <div>
          <div className="font-medium">
            {date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </div>
          <div className="text-xs text-muted-foreground">{row.original.time}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px] truncate">
          {row.getValue("location")}
        </div>
      )
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const price = row.getValue("price") as number
      const discount = row.original.discount
      const finalPrice = price - (price * discount) / 100
      
      return (
        <div className="text-right">
          {discount > 0 ? (
            <div>
              <div className="font-medium">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(finalPrice)}
              </div>
              <div className="text-xs text-muted-foreground line-through">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                }).format(price)}
              </div>
            </div>
          ) : (
            <div className="font-medium">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(price)}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "availableSeats",
    header: () => <div className="text-center">Seats</div>,
    cell: ({ row }) => {
      const available = row.getValue("availableSeats") as number
      const total = row.original.totalSeats
      const percentage = (available / total) * 100
      
      return (
        <div className="text-center">
          <div className="font-medium">{available}/{total}</div>
          <Badge
            variant={
              percentage > 50
                ? "default"
                : percentage > 20
                ? "secondary"
                : "destructive"
            }
            className="text-xs"
          >
            {percentage.toFixed(0)}% left
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "_count.Registration",
    header: () => <div className="text-center">Registrations</div>,
    cell: ({ row }) => {
      const count = row.original._count.Registration
      return (
        <div className="text-center">
          <Badge variant="outline">{count}</Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "isOpen",
    header: "Status",
    cell: ({ row }) => {
      const isOpen = row.getValue("isOpen") as boolean
      return (
        <Badge variant={isOpen ? "default" : "secondary"}>
          {isOpen ? "Open" : "Closed"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const workshop = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(workshop.id)}
            >
              Copy workshop ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/workshops/edit/${workshop.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit workshop
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open(`/workshops/${workshop.id}`, "_blank")}
            >
              View public page
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <NotifyUsersMenuItem workshop={workshop} />
            <CancelWorkshopMenuItem workshop={workshop} />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]