// app/admin/registrations/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export type WorkshopRow = {
  id: string
  title: string
  date: Date
  location: string
  price: number
  totalSeats: number
  availableSeats: number
  isOpen: boolean
  _count: {
    Registration: number
  }
}

export const columns: ColumnDef<WorkshopRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Workshop Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <Link
          href={`/admin/registrations/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.title}
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
          {date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
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
    accessorKey: "_count.Registration",
    header: () => <div className="text-center">Registrations</div>,
    cell: ({ row }) => {
      const count = row.original._count.Registration
      return (
        <div className="text-center">
          <Badge variant="secondary" className="font-semibold">
            {count}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "availableSeats",
    header: () => <div className="text-center">Available Seats</div>,
    cell: ({ row }) => {
      const available = row.getValue("availableSeats") as number
      const total = row.original.totalSeats
      return (
        <div className="text-center">
          <span className="font-medium">{available}</span>
          <span className="text-muted-foreground"> / {total}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const amount = row.getValue("price") as number
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
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
]