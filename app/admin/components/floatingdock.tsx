// components/admin/floating-dock.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Home,
  Users,
  CalendarDays,
  Receipt,
  Settings,
  LogOut,
} from "lucide-react"

interface DockItem {
  title: string
  icon: React.ReactNode
  href: string
}

const dockItems: DockItem[] = [
  {
    title: "Dashboard",
    icon: <Home className="h-5 w-5" />,
    href: "/admin",
  },
  {
    title: "Users",
    icon: <Users className="h-5 w-5" />,
    href: "/admin/users",
  },
  {
    title: "Workshops",
    icon: <CalendarDays className="h-5 w-5" />,
    href: "/admin/workshops",
  },
  {
    title: "Registrations",
    icon: <Receipt className="h-5 w-5" />,
    href: "/admin/registrations",
  },
  {
    title: "Settings",
    icon: <Settings className="h-5 w-5" />,
    href: "/admin/settings",
  },
]

export function FloatingDock() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <TooltipProvider>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-background border rounded-full px-3 py-2 shadow-lg">
          {dockItems.map((item, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:bg-muted",
                    isActive(item.href) && "bg-muted"
                  )}
                >
                  <span className={cn(
                    "transition-colors",
                    isActive(item.href) ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {item.icon}
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{item.title}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          <div className="w-px h-8 bg-border mx-1" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  // Add your logout logic here
                  console.log("Logout clicked")
                }}
                className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}