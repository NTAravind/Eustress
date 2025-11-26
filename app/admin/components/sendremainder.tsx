// app/admin/registrations/[id]/send-reminder-button.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Loader2, CheckCircle2, XCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface SendReminderButtonProps {
  workshopId: string
  registrations: Array<{
    id: string
    User: {
      name: string | null
      email: string
    }
    paid: boolean
    paymentStatus: string | null
  }>
}

export function SendReminderButton({
  workshopId,
  registrations,
}: SendReminderButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sendToAll, setSendToAll] = useState(true)
  const [result, setResult] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  // Filter only paid registrations
  const paidRegistrations = registrations.filter(
    (reg) => reg.paid && reg.paymentStatus === "completed"
  )

  const handleSendReminders = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/send-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workshopId,
          registrationIds: sendToAll ? undefined : selectedIds,
          reminderType: "general",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          type: "success",
          message: data.message,
        })
        // Reset selections after successful send
        setTimeout(() => {
          setSelectedIds([])
          setSendToAll(true)
          setIsOpen(false)
          setResult(null)
        }, 3000)
      } else {
        setResult({
          type: "error",
          message: data.error || "Failed to send reminders",
        })
      }
    } catch (error) {
      setResult({
        type: "error",
        message: "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRegistration = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedIds.length === paidRegistrations.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(paidRegistrations.map((reg) => reg.id))
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!isLoading) {
      setIsOpen(open)
      if (!open) {
        // Reset result when closing
        setResult(null)
      }
    }
  }

  if (paidRegistrations.length === 0) {
    return (
      <Button disabled variant="outline">
        <Mail className="mr-2 h-4 w-4" />
        No Paid Registrations
      </Button>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Send Reminder Emails
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Reminder Emails</DialogTitle>
          <DialogDescription>
            Select which registered users should receive reminder emails for this
            workshop.
          </DialogDescription>
        </DialogHeader>

        {result && (
          <Alert variant={result.type === "error" ? "destructive" : "default"}>
            {result.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {result.type === "success" ? "Success!" : "Error"}
            </AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="send-all"
              checked={sendToAll}
              onCheckedChange={(checked) => {
                setSendToAll(checked as boolean)
                if (checked) {
                  setSelectedIds([])
                }
              }}
              disabled={isLoading}
            />
            <label
              htmlFor="send-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Send to all paid registrations ({paidRegistrations.length} users)
            </label>
          </div>

          {!sendToAll && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Select individual users:
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAll}
                  type="button"
                  disabled={isLoading}
                >
                  {selectedIds.length === paidRegistrations.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>

              <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                {paidRegistrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="flex items-center space-x-3 p-3 hover:bg-muted/50"
                  >
                    <Checkbox
                      id={registration.id}
                      checked={selectedIds.includes(registration.id)}
                      onCheckedChange={() => toggleRegistration(registration.id)}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor={registration.id}
                      className="flex-1 cursor-pointer"
                    >
                      <p className="text-sm font-medium">
                        {registration.User.name || "No name"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {registration.User.email}
                      </p>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendReminders}
            disabled={isLoading || (!sendToAll && selectedIds.length === 0)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send {sendToAll ? "to All" : `to ${selectedIds.length}`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}