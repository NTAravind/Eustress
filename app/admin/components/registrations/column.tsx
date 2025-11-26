// app/admin/registrations/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
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

export type RegistrationRow = {
  id: string
  userId: string
  workshopId: string
  registeredAt: Date
  paid: boolean
  paymentId: string | null
  razorpayOrderId: string | null
  pricePaid: number | null
  paymentMethod: string | null
  paymentStatus: string | null
  seats: number
  User: {
    id: string
    email: string
    name: string | null
    phoneno: string | null
  }
  Workshop: {
    id: string
    title: string
    date: Date
    location: string
    price: number
  }
}

export const columns: ColumnDef<RegistrationRow>[] = [
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
    accessorKey: "User.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const name = row.original.User.name || "N/A"
      return (
        <Link
          href={`/admin/registrations/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {name}
        </Link>
      )
    },
  },
  {
    accessorKey: "User.email",
    header: "Email",
    cell: ({ row }) => {
      return (
        <div className="lowercase">{row.original.User.email}</div>
      )
    },
  },
  {
    accessorKey: "Workshop.title",
    header: "Workshop",
    cell: ({ row }) => {
      return (
        <div className="max-w-[200px] truncate font-medium">
          {row.original.Workshop.title}
        </div>
      )
    },
  },
  {
    accessorKey: "registeredAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Registered At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("registeredAt"))
      return (
        <div>
          {date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </div>
      )
    },
  },
  {
    accessorKey: "seats",
    header: () => <div className="text-center">Seats</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center font-medium">{row.getValue("seats")}</div>
      )
    },
  },
  {
    accessorKey: "paid",
    header: "Payment Status",
    cell: ({ row }) => {
      const paid = row.getValue("paid") as boolean
      const paymentStatus = row.original.paymentStatus
      
      return (
        <Badge
          variant={
            paid && paymentStatus === "completed"
              ? "default"
              : paymentStatus === "pending"
              ? "secondary"
              : paymentStatus === "failed"
              ? "destructive"
              : "outline"
          }
        >
          {paid && paymentStatus === "completed"
            ? "Paid"
            : paymentStatus === "pending"
            ? "Pending"
            : paymentStatus === "failed"
            ? "Failed"
            : "Unpaid"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "pricePaid",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = row.getValue("pricePaid") as number | null
      const formatted = amount
        ? new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(amount)
        : "N/A"

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Method",
    cell: ({ row }) => {
      const method = row.getValue("paymentMethod") as string | null
      return (
        <div className="capitalize">{method || "N/A"}</div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const registration = row.original

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
              onClick={() => navigator.clipboard.writeText(registration.id)}
            >
              Copy registration ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/registrations/${registration.id}`}>
                View details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(registration.User.email)
              }
            >
              Copy email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]